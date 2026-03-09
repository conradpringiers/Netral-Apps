/**
 * Netral Block Application
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { NetralRenderer } from '@/core/renderer/NetralRenderer';
import { HelpModal } from '@/shared/components/HelpModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { TemplatesModal } from '@/shared/components/TemplatesModal';
import { ThemeSelector } from '@/shared/components/ThemeSelector';
import { ShareButton } from '@/shared/components/ShareButton';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { downloadHtml } from '@/core/exporter/htmlExporter';
import { ThemeName } from '@/core/themes/themes';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Layers, Download, Eye, Code2, PanelLeft, ArrowLeft } from 'lucide-react';
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

// Default content to showcase the new syntax
const DEFAULT_CONTENT = `--- My Netral Site
Theme[Modern]
Logo[Netral]
Navbar[
{Home;#home}
{Features;#features}
{Pricing;#pricing}
{Contact;#contact}
]
Header[BigText;Create websites with simple syntax;Netral lets you build beautiful web pages using intuitive syntax, no complex code required.;https://picsum.photos/1200/600;#features]

-- Features
Bigtitle[Everything you need]

Feature[
{🚀;Fast;Create pages in minutes with our intuitive syntax}
{🎨;Themes;9 professional themes ready to use}
{📱;Responsive;All pages automatically adapt to mobile}
]

Stats[
{100+;Users}
{50K;Pages Created}
{99%;Satisfaction}
]

Def[Netral uses a Markdown-inspired syntax extended for the modern web.]

-- Rich Content

You can write **bold text**, *italic*, and even create lists:

- First item
- Second item
- Third item

Column[
{The left column can contain explanatory text about your product or service.}
{The right column can present complementary information or important details.}
]

Image[https://picsum.photos/800/400]

-- Testimonials

Testimonial[
{Marie Dupont;CEO at TechCorp;Netral transformed how we create web content;https://i.pravatar.cc/100?img=1}
{John Martin;Designer;An intuitive interface that boosts my productivity;https://i.pravatar.cc/100?img=2}
]

FAQ[
{What is Netral?;Netral is a simple syntax for creating beautiful websites without coding.}
{How do I get started?;Just start typing in the editor - use element names + Tab to insert templates.}
{Can I export my site?;Yes! Click the Export button to download a standalone HTML file.}
]

CTA[Ready to get started?;Join thousands of users creating beautiful websites;Get Started Free;#signup]

Warn[This syntax is still in development. New features coming soon!]

-- Pricing

Pricing[
{Free;$0/mo;Personal use, 1 project, Community support}
{Pro;$19/mo;Commercial use, Unlimited projects, Priority support}
{Enterprise;$99/mo;Multi-users, API access, Dedicated support}
]

quote[Simplicity is the ultimate sophistication. - Leonardo da Vinci]
`;

interface BlockAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function BlockApp({ initialContent, onBack }: BlockAppProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_CONTENT);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const charCount = getCharCount(content);

  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('preview');
  }, [isMobile, viewMode]);
  
  const documentTitle = useMemo(() => {
    const match = content.match(/^---\s*(.+)$/m);
    return match ? match[1].trim() : '';
  }, [content]);
  
  const currentTheme = useMemo(() => {
    const match = content.match(/^Theme\[(.+)\]$/im);
    return (match ? match[1].trim() : 'Modern') as ThemeName;
  }, [content]);
  
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

  const handleWrap = useCallback((prefix: string, suffix: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) methods.wrapSelection(prefix, suffix);
  }, []);

  const handleExport = () => {
    downloadHtml(content, `${documentTitle || 'netral-site'}.html`);
    toast({ title: 'Export successful', description: 'The HTML file has been downloaded.' });
  };
  
  const handleLoadFile = (newContent: string) => setContent(newContent);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': e.preventDefault(); handleWrap('**', '**'); break;
          case 'i': e.preventDefault(); handleWrap('*', '*'); break;
          case 's': e.preventDefault(); handleExport(); break;
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
          <Layers className="h-5 w-5 text-primary shrink-0 hidden sm:block" />
          <span className="font-semibold text-foreground hidden sm:inline">Netral Block</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded hidden md:inline">
            {charCount} chars
          </span>
          <FileMenu documentTitle={documentTitle} content={content} onLoad={handleLoadFile} fileExtension=".netblock" />
          <TemplatesModal mode="block" onSelect={handleLoadFile} />
          <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <HelpModal mode="block" />
          
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

          <ShareButton content={content} mode="block" />

          <Button variant="default" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} mode="block" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto">
                <NetralRenderer content={content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="block" />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <NetralRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockApp;
