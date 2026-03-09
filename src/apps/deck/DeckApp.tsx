/**
 * Netral Deck Application
 * Presentation editor with slide preview and fullscreen mode
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { DeckPreview } from '@/core/renderer/DeckPreview';
import { PresentationMode } from '@/core/renderer/PresentationMode';
import { HelpModal } from '@/shared/components/HelpModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { TemplatesModal } from '@/shared/components/TemplatesModal';
import { ThemeSelector } from '@/shared/components/ThemeSelector';
import { ShareButton } from '@/shared/components/ShareButton';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { parseDeckDocument, getDefaultDeckContent } from '@/core/parser/deckParser';
import { ThemeName } from '@/core/themes/themes';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Presentation, Play, Eye, Code2, PanelLeft, ArrowLeft, ChevronDown, Monitor, User } from 'lucide-react';
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

interface DeckAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function DeckApp({ initialContent, onBack }: DeckAppProps) {
  const [content, setContent] = useState(initialContent || getDefaultDeckContent());
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [launchMode, setLaunchMode] = useState<'none' | 'present' | 'presenter'>('none');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const popupRef = useRef<Window | null>(null);
  const isMobile = useIsMobile();

  const charCount = getCharCount(content);
  
  const doc = useMemo(() => {
    try { return parseDeckDocument(content); } catch { return null; }
  }, [content]);
  
  const totalSlides = doc?.slides.length || 0;
  const documentTitle = doc?.title || 'Presentation';
  const currentTheme = (doc?.theme || 'Modern') as ThemeName;

  // Force non-split on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('preview');
  }, [isMobile, viewMode]);
  
  const handleThemeChange = useCallback((theme: ThemeName) => {
    if (content.match(/^Theme\[.+\]$/im)) {
      setContent(content.replace(/^Theme\[.+\]$/im, `Theme[${theme}]`));
    } else {
      const lines = content.split('\n');
      const titleIndex = lines.findIndex(line => line.match(/^---\s*.+$/));
      if (titleIndex >= 0) {
        lines.splice(titleIndex + 1, 0, `Theme[${theme}]`);
        setContent(lines.join('\n'));
      } else {
        setContent(`Theme[${theme}]\n${content}`);
      }
    }
  }, [content]);

  const handleInsert = useCallback((text: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) methods.insertAtCursor(text);
  }, []);

  const handleWrap = useCallback((prefix: string, suffix: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) methods.wrapSelection(prefix, suffix);
  }, []);

  // Presenter mode: BroadcastChannel sync
  useEffect(() => {
    if (launchMode !== 'presenter') return;

    const channel = new BroadcastChannel('netral-presenter');
    channelRef.current = channel;

    channel.onmessage = (e) => {
      const { type, ...data } = e.data;
      switch (type) {
        case 'popup-ready':
          // Send init data to popup
          channel.postMessage({ type: 'init', content, currentSlide, totalSlides });
          break;
        case 'slide-change':
          setCurrentSlide(data.currentSlide);
          break;
      }
    };

    return () => {
      channel.postMessage({ type: 'close' });
      channel.close();
      channelRef.current = null;
    };
  }, [launchMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync slide changes to popup
  useEffect(() => {
    if (launchMode === 'presenter' && channelRef.current) {
      channelRef.current.postMessage({ type: 'slide-change', currentSlide });
    }
  }, [currentSlide, launchMode]);

  const handleLaunch = (mode: 'present' | 'presenter') => {
    if (totalSlides === 0) {
      toast({ title: 'No slides', description: 'Add slides with -- Slide Title', variant: 'destructive' });
      return;
    }
    if (mode === 'presenter') {
      // Open popup window for presenter notes
      const popup = window.open(
        window.location.origin + '/?view=presenter',
        'netral-presenter',
        'width=900,height=600,menubar=no,toolbar=no,location=no,status=no'
      );
      popupRef.current = popup;
    }
    setLaunchMode(mode);
  };
  
  const handleLoad = (loadedContent: string) => {
    setContent(loadedContent);
    setCurrentSlide(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (launchMode !== 'none') return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': e.preventDefault(); handleWrap('**', '**'); break;
          case 'i': e.preventDefault(); handleWrap('*', '*'); break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleWrap, launchMode]);

  useEffect(() => {
    if (currentSlide > totalSlides && totalSlides >= 0) {
      setCurrentSlide(totalSlides);
    }
  }, [totalSlides, currentSlide]);

  if (launchMode === 'present' || launchMode === 'presenter') {
    return (
      <PresentationMode
        content={content}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onSlideChange={setCurrentSlide}
        onClose={() => {
          setLaunchMode('none');
          if (popupRef.current) {
            popupRef.current.close();
            popupRef.current = null;
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-2 sm:px-4 gap-1">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Presentation className="h-5 w-5 text-purple-500 shrink-0 hidden sm:block" />
          <span className="font-semibold text-foreground hidden sm:inline">Netral Deck</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded hidden md:inline">
            {charCount} chars
          </span>
          <FileMenu documentTitle={documentTitle} content={content} onLoad={handleLoad} fileExtension=".netdeck" />
          <TemplatesModal mode="deck" onSelect={handleLoad} />
          <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <HelpModal mode="deck" />
          
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

          <ShareButton content={content} mode="deck" />

          {/* Launch dropdown */}
          <div className="flex items-center">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleLaunch('present')} 
              className="gap-2 bg-purple-600 hover:bg-purple-700 rounded-r-none"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Present</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="px-1.5 bg-purple-600 hover:bg-purple-700 rounded-l-none border-l border-purple-500">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLaunch('present')} className="gap-2">
                  <Monitor className="h-4 w-4" />
                  Fullscreen presentation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLaunch('presenter')} className="gap-2">
                  <User className="h-4 w-4" />
                  Presenter mode (popup)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} mode="deck" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <DeckPreview content={content} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="deck" />
          </div>
        ) : (
          <DeckPreview content={content} />
        )}
      </div>
    </div>
  );
}

export default DeckApp;
