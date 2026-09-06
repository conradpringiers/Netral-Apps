/**
 * Generator Gallery Modal
 *
 * Three-pane modal:
 *   1. Categories sidebar
 *   2. Generator gallery (filtered by category)
 *   3. Settings panel + live preview when a generator is selected
 *
 * Insert button passes the generated Luate syntax to the parent
 * (LuateApp) which inserts it at the editor cursor.
 */

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, ArrowLeft, RefreshCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ALL_GENERATORS, CATEGORIES, getActiveCategories,
  ExerciseGenerator, GeneratorSettings, Category,
  OutputFormat, Difficulty, Level, LEVELS, FORMAT_LABELS, isMultiItemFormat,
} from './generators';

interface GeneratorModalProps {
  onInsert: (text: string) => void;
}

export function GeneratorModal({ onInsert }: GeneratorModalProps) {
  const [open, setOpen] = useState(false);
  const activeCats = useMemo(getActiveCategories, []);
  const [category, setCategory] = useState<Category>(activeCats[0] || 'math');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [selected, setSelected] = useState<ExerciseGenerator | null>(null);
  const [settings, setSettings] = useState<GeneratorSettings>({
    count: 5, format: '1-line', pointsPerQuestion: 2, difficulty: 'medium',
  });
  const [previewSeed, setPreviewSeed] = useState(Date.now());

  const levelsInCategory = useMemo(
    () => LEVELS.filter(l => ALL_GENERATORS.some(g => g.category === category && g.level === l.id)),
    [category]
  );

  const generators = useMemo(
    () => ALL_GENERATORS.filter(g => g.category === category && (level === 'all' || g.level === level)),
    [category, level]
  );

  // When picking a new generator, reset format if unsupported and load custom defaults
  useEffect(() => {
    if (!selected) return;
    setSettings(prev => ({
      ...prev,
      format: selected.supportedFormats.includes(prev.format)
        ? prev.format : selected.supportedFormats[0],
      custom: { ...selected.defaultCustom },
    }));
    setPreviewSeed(Date.now());
  }, [selected]);

  const previewQuestions = useMemo(() => {
    if (!selected) return [];
    try {
      return selected.generate({ ...settings, seed: previewSeed });
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [selected, settings, previewSeed]);

  const handleInsert = () => {
    if (!selected) return;
    // Generate fresh (no seed) so insertion differs from the preview
    const questions = selected.generate({ ...settings, seed: undefined });
    const text = '\n' + questions.map(q => q.syntax).join('\n') + '\n';
    onInsert(text);
    setOpen(false);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelected(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-amber-500/50 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Generate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {selected ? (
              <>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {selected.name}
              </>
            ) : 'Exercise Generator'}
          </DialogTitle>
        </DialogHeader>

        {!selected ? (
          /* ── Gallery view ── */
          <div className="flex flex-1 overflow-hidden">
            {/* Categories sidebar */}
            <div className="w-48 border-r bg-muted/30 p-2">
              <ScrollArea className="h-full">
                {CATEGORIES.filter(c => activeCats.includes(c.id)).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setLevel('all'); }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors',
                      category === c.id ? 'bg-background shadow-sm font-medium' : 'hover:bg-background/50'
                    )}
                  >
                    <span className={cn('text-base', c.color)}>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
                {CATEGORIES.filter(c => !activeCats.includes(c.id)).length > 0 && (
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground px-3">
                    Coming soon
                    {CATEGORIES.filter(c => !activeCats.includes(c.id)).map(c => (
                      <div key={c.id} className="py-1.5 opacity-50">{c.emoji} {c.label}</div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Generator grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setLevel('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${level === 'all' ? 'bg-amber-600 text-white border-amber-600' : 'bg-background border-border hover:border-amber-500/60'}`}
                >
                  All levels
                </button>
                {levelsInCategory.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${level === l.id ? 'bg-amber-600 text-white border-amber-600' : 'bg-background border-border hover:border-amber-500/60'}`}
                  >
                    {l.shortLabel}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generators.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelected(g)}
                    className="text-left p-4 rounded-lg border hover:border-amber-500/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm group-hover:text-amber-700">{g.name}</h3>
                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{g.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {g.supportedFormats.map(f => (
                        <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {FORMAT_LABELS[f]}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* ── Settings + preview ── */
          <div className="flex flex-1 overflow-hidden">
            {/* Settings */}
            <div className="w-72 border-r p-4 space-y-4 overflow-auto">
              <p className="text-xs text-muted-foreground">{selected.description}</p>

              <div className="space-y-1.5">
                <Label className="text-xs">Number of questions</Label>
                <Input
                  type="number" min={1} max={50}
                  value={settings.count}
                  onChange={e => setSettings(s => ({ ...s, count: Math.max(1, Math.min(50, +e.target.value || 1)) }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Output format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(v) => setSettings(s => ({ ...s, format: v as OutputFormat }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {selected.supportedFormats.map(f => (
                      <SelectItem key={f} value={f}>{FORMAT_LABELS[f]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Points per question</Label>
                <Input
                  type="number" min={0} max={20}
                  value={settings.pointsPerQuestion}
                  onChange={e => setSettings(s => ({ ...s, pointsPerQuestion: Math.max(0, +e.target.value || 0) }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Difficulty</Label>
                <Select
                  value={settings.difficulty}
                  onValueChange={(v) => setSettings(s => ({ ...s, difficulty: v as Difficulty }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom fields */}
              {selected.customFields?.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  {f.type === 'number' && (
                    <Input
                      type="number" min={f.min} max={f.max}
                      value={(settings.custom?.[f.key] as number) ?? (f.default as number)}
                      onChange={e => setSettings(s => ({
                        ...s,
                        custom: { ...s.custom, [f.key]: +e.target.value || 0 },
                      }))}
                    />
                  )}
                  {f.type === 'select' && (
                    <Select
                      value={String(settings.custom?.[f.key] ?? f.default)}
                      onValueChange={(v) => setSettings(s => ({
                        ...s, custom: { ...s.custom, [f.key]: v },
                      }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {f.options?.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {f.type === 'boolean' && (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-xs text-muted-foreground">Enable</span>
                      <Switch
                        checked={!!(settings.custom?.[f.key] ?? f.default)}
                        onCheckedChange={(v) => setSettings(s => ({
                          ...s, custom: { ...s.custom, [f.key]: v },
                        }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <span className="text-xs font-medium">
                  Live preview · {isMultiItemFormat(settings.format)
                    ? `1 exercise (${settings.count} items)`
                    : `${previewQuestions.length} question${previewQuestions.length > 1 ? 's' : ''}`}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewSeed(Date.now())}>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                  Reroll
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-muted/40 p-3 rounded-md">
                  {previewQuestions.map(q => q.syntax).join('\n')}
                </pre>
              </ScrollArea>
              <div className="border-t p-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Back</Button>
                <Button
                  onClick={handleInsert}
                  className="bg-amber-600 hover:bg-amber-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isMultiItemFormat(settings.format)
                    ? `Insert exercise (${settings.count} items)`
                    : `Insert ${settings.count} question${settings.count > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
