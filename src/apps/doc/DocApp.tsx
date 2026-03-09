/**
 * Netral Doc Application
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { DocRenderer } from '@/core/renderer/DocRenderer';
import { HelpModal } from '@/shared/components/HelpModal';
import { TemplatesModal } from '@/shared/components/TemplatesModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { ShareButton } from '@/shared/components/ShareButton';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { parseDocDocument, getDefaultDocContent } from '@/core/parser/docParser';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Code2, PanelLeft, ArrowLeft, Printer, FileCode } from 'lucide-react';
import { ThemeSelector } from '@/shared/components/ThemeSelector';
import { ThemeName } from '@/core/themes/themes';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DocAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function DocApp({ initialContent, onBack }: DocAppProps) {
  const [content, setContent] = useState(initialContent || getDefaultDocContent());
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [exportOpen, setExportOpen] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const charCount = getCharCount(content);

  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('preview');
  }, [isMobile, viewMode]);
  
  const doc = useMemo(() => {
    try { return parseDocDocument(content); } catch { return null; }
  }, [content]);
  
  const documentTitle = doc?.title || 'Document';

  const currentTheme: ThemeName = (() => {
    const themeMatch = content.match(/^Theme\[([^\]]+)\]/m);
    return (themeMatch ? themeMatch[1] : 'Modern') as ThemeName;
  })();

  const handleThemeChange = useCallback((newTheme: ThemeName) => {
    setContent(prev => {
      const themeRegex = /^Theme\[([^\]]+)\]/m;
      if (themeRegex.test(prev)) return prev.replace(themeRegex, `Theme[${newTheme}]`);
      return `Theme[${newTheme}]\n${prev}`;
    });
  }, []);

  const handleWrap = useCallback((prefix: string, suffix: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) methods.wrapSelection(prefix, suffix);
  }, []);

  const handleExportPDF = async () => {
    setExportOpen(false);
    toast({ title: 'Export PDF', description: 'Preparing document...' });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Error', description: 'Could not open the print window.', variant: 'destructive' });
      return;
    }
    
    const previewElement = previewRef.current;
    if (!previewElement) return;
    
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML).join('\n');
    
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${documentTitle}</title><meta charset="utf-8">${styles}<style>@page{margin:2cm;size:A4}body{font-family:'Inter',system-ui,sans-serif;line-height:1.6;color:#1a1a1a;background:white}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>${previewElement.innerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExportMarkdown = () => {
    setExportOpen(false);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.netdoc`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export', description: '.netdoc file downloaded.' });
  };
  
  const handleLoadFile = (newContent: string) => setContent(newContent);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': e.preventDefault(); handleWrap('**', '**'); break;
          case 'i': e.preventDefault(); handleWrap('*', '*'); break;
          case 'p': e.preventDefault(); handleExportPDF(); break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleWrap]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-2 sm:px-4 gap-1">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FileText className="h-5 w-5 text-emerald-500 shrink-0 hidden sm:block" />
          <span className="font-semibold text-foreground hidden sm:inline">Netral Doc</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded hidden md:inline">{charCount} chars</span>
          <FileMenu documentTitle={documentTitle} content={content} onLoad={handleLoadFile} fileExtension=".netdoc" />
          <TemplatesModal mode="doc" onSelect={handleLoadFile} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          <HelpModal mode="doc" />
          
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

          <ShareButton content={content} mode="doc" />

          {/* Export modal */}
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Export document</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleExportPDF} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                  <div className="p-2 rounded-md bg-emerald-500/10"><Printer className="h-5 w-5 text-emerald-500" /></div>
                  <div>
                    <div className="font-medium text-sm">Print / PDF</div>
                    <div className="text-xs text-muted-foreground">Opens the print dialog</div>
                  </div>
                </button>
                <button onClick={handleExportMarkdown} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                  <div className="p-2 rounded-md bg-blue-500/10"><FileCode className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <div className="font-medium text-sm">.netdoc file</div>
                    <div className="text-xs text-muted-foreground">Download the source file</div>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} mode="doc" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div ref={previewRef} className="h-full overflow-auto bg-white">
                <DocRenderer content={content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="doc" />
          </div>
        ) : (
          <div ref={previewRef} className="h-full overflow-auto bg-white">
            <DocRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DocApp;
