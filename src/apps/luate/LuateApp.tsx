/**
 * Netral Luate Application
 * Exam/quiz creation tool with print modes and interrogation system
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, EditorMethods } from '@/components/Editor';
import { LuateRenderer } from '@/core/renderer/LuateRenderer';
import { useAutosave } from '@/shared/components/AutosaveProvider';
import { HelpModal } from '@/shared/components/HelpModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { InterrogateModal } from './InterrogateModal';
import { GeneratorModal } from './GeneratorModal';
import { ThemeSelector } from '@/shared/components/ThemeSelector';
import { parseLuateDocument, getDefaultLuateContent } from '@/core/parser/luateParser';
import { ThemeName } from '@/core/themes/themes';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  GraduationCap,
  Eye,
  Code2,
  PanelLeft,
  ArrowLeft,
  Printer,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LuateAppProps {
  initialContent?: string;
  documentId?: string;
  onBack: () => void;
}

export function LuateApp({ initialContent, documentId, onBack }: LuateAppProps) {
  const [content, setContent] = useState(initialContent || getDefaultLuateContent());
  useAutosave('luate', content, documentId);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [showAnswers, setShowAnswers] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorMethods>(null);
  const isMobile = useIsMobile();

  /** Insert generated questions at the editor cursor (or append if editor not focused) */
  const handleGeneratorInsert = useCallback((text: string) => {
    if (editorRef.current) {
      editorRef.current.insertAtCursor(text);
    } else {
      setContent(prev => prev + text);
    }
    toast({ title: 'Questions inserted', description: 'Generated exercises added to your exam.' });
  }, []);

  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('preview');
  }, [isMobile, viewMode]);

  const doc = useMemo(() => {
    try { return parseLuateDocument(content); } catch { return null; }
  }, [content]);

  const documentTitle = doc?.title || 'Exam';

  const currentTheme: ThemeName = (() => {
    const m = content.match(/^Theme\[([^\]]+)\]/m);
    return (m ? m[1] : 'Modern') as ThemeName;
  })();

  const handleThemeChange = useCallback((newTheme: ThemeName) => {
    setContent(prev => {
      const regex = /^Theme\[([^\]]+)\]/m;
      if (regex.test(prev)) return prev.replace(regex, `Theme[${newTheme}]`);
      return `Theme[${newTheme}]\n${prev}`;
    });
  }, []);

  const handlePrint = (withAnswers: boolean) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Error', description: 'Could not open print window.', variant: 'destructive' });
      return;
    }
    const previewElement = previewRef.current;
    if (!previewElement) return;

    // Temporarily set answer mode, render, then print
    const prevShowAnswers = showAnswers;
    setShowAnswers(withAnswers);
    
    setTimeout(() => {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML).join('\n');

      printWindow.document.write(`<!DOCTYPE html><html><head><title>${documentTitle}${withAnswers ? ' — Answer Key' : ''}</title><meta charset="utf-8">${styles}<style>@page{margin:1.5cm;size:A4}body{font-family:'Inter',system-ui,sans-serif;background:white}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>${previewRef.current?.innerHTML || ''}</body></html>`);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
      setShowAnswers(prevShowAnswers);
    }, 100);
  };

  const handleLoadFile = (newContent: string) => setContent(newContent);

  const sectionCount = doc?.sections.length || 0;
  const totalPts = doc?.totalPoints || 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-2 sm:px-4 gap-1">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <GraduationCap className="h-5 w-5 text-amber-500 shrink-0 hidden sm:block" />
          <span className="font-semibold text-foreground hidden sm:inline">Netral Luate</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded hidden md:inline">
            {sectionCount} sections · {totalPts} pts
          </span>
          <FileMenu documentTitle={documentTitle} content={content} onLoad={handleLoadFile} fileExtension=".netluate" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          <HelpModal mode="luate" />

          {/* View mode toggle */}
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'editor' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('editor')}>
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editor only</TooltipContent>
            </Tooltip>
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'split' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('split')}>
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Split view</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'preview' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('preview')}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview only</TooltipContent>
            </Tooltip>
          </div>

          {/* Show/hide answers toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showAnswers ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                <FileCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showAnswers ? 'Hide answers' : 'Show answers'}</TooltipContent>
          </Tooltip>

          <GeneratorModal onInsert={handleGeneratorInsert} />

          <InterrogateModal content={content} />

          {/* Print dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrint(false)}>
                <Printer className="h-4 w-4 mr-2" />
                Print Questionnaire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint(true)}>
                <FileCheck className="h-4 w-4 mr-2" />
                Print Answer Key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border">
                <Editor ref={editorRef} value={content} onChange={setContent} mode="luate" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div ref={previewRef} className="h-full overflow-auto bg-white">
                <LuateRenderer content={content} showAnswers={showAnswers} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full">
            <Editor ref={editorRef} value={content} onChange={setContent} mode="luate" />
          </div>
        ) : (
          <div ref={previewRef} className="h-full overflow-auto bg-white">
            <LuateRenderer content={content} showAnswers={showAnswers} />
          </div>
        )}
      </div>
    </div>
  );
}

export default LuateApp;
