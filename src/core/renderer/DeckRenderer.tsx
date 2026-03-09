/**
 * Netral Deck Renderer
 * Renders slide preview with navigation
 */

import { useMemo } from 'react';
import { parseDeckDocument, SlideContent } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { renderMarkdown } from '../renderer/markdownRenderer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DeckRendererProps {
  content: string;
  currentSlide: number;
  className?: string;
  onSlideChange?: (slide: number) => void;
}

export function DeckRenderer({ content, currentSlide, className = '', onSlideChange }: DeckRendererProps) {
  const doc = useMemo(() => {
    try {
      return parseDeckDocument(content);
    } catch (e) {
      console.error('Error parsing deck:', e);
      return null;
    }
  }, [content]);

  if (!doc || doc.slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Start writing with -- Slide Title</p>
      </div>
    );
  }

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  const slide = doc.slides[Math.min(currentSlide, doc.slides.length - 1)];
  const totalSlides = doc.slides.length;

  const goToPrev = () => {
    if (onSlideChange && currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  };

  const goToNext = () => {
    if (onSlideChange && currentSlide < totalSlides - 1) {
      onSlideChange(currentSlide + 1);
    }
  };

  return (
    <div 
      className={`h-full flex items-center justify-center p-4 md:p-6 ${className}`}
      style={{ 
        backgroundColor: '#1e293b',
      }}
    >
      {/* Slide Card with 16:9 aspect ratio - responsive sizing */}
      <div 
        className="relative w-full max-w-4xl max-h-full"
        style={{ aspectRatio: '16/9' }}
      >
        <div 
          className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden"
          style={{ 
            // @ts-ignore
            '--background': theme.colors.background,
            '--foreground': theme.colors.foreground,
            '--primary': theme.colors.primary,
            '--primary-foreground': theme.colors.primaryForeground,
            '--secondary': theme.colors.secondary,
            '--muted': theme.colors.muted,
            '--muted-foreground': theme.colors.mutedForeground,
            '--card': theme.colors.card,
            '--border': theme.colors.border,
            fontFamily: theme.fontFamily,
          } as React.CSSProperties}
        >
          <style>{`
            .deck-slide { ${themeCSS} }
          `}</style>
          
          <div className="deck-slide h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
            {/* Slide title at top left */}
            <div className="px-6 pt-4 pb-2 border-b border-[hsl(var(--border))]">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                {slide.title}
              </h1>
            </div>
            
            {/* Slide content */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 overflow-auto min-h-0">
              <div className="w-full max-w-3xl space-y-3 md:space-y-4">
                {slide.content.map((block, index) => (
                  <SlideBlock key={index} block={block} />
                ))}
              </div>
            </div>
            
            {/* Navigation pill at bottom right */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[hsl(var(--card))] rounded-full px-2 py-1 shadow-lg border border-[hsl(var(--border))]">
              <button
                onClick={goToPrev}
                disabled={currentSlide === 0}
                className="p-1 rounded-full hover:bg-[hsl(var(--muted))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[hsl(var(--foreground))]" />
              </button>
              <span className="text-xs font-medium text-[hsl(var(--foreground))] min-w-[40px] text-center">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={goToNext}
                disabled={currentSlide >= totalSlides - 1}
                className="p-1 rounded-full hover:bg-[hsl(var(--muted))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[hsl(var(--foreground))]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideBlock({ block }: { block: SlideContent }) {
  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div 
          className="prose prose-sm max-w-none"
          style={{ color: 'hsl(var(--foreground))' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );
    
    case 'bigtitle':
      return (
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-center text-[hsl(var(--primary))]">
          {block.content}
        </h2>
      );
    
    case 'image':
      return (
        <div className="flex justify-center">
          <img 
            src={block.content} 
            alt="Slide image" 
            className="max-h-32 md:max-h-48 rounded-lg shadow-lg object-contain"
          />
        </div>
      );
    
    case 'column':
      const columns = block.props?.columns || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {columns.map((col: string, idx: number) => (
            <div 
              key={idx}
              className="p-2 md:p-4 bg-[hsl(var(--card))] rounded-lg text-xs md:text-sm prose prose-sm max-w-none overflow-hidden"
              style={{ color: 'hsl(var(--foreground))' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(col) }}
            />
          ))}
        </div>
      );
    
    case 'feature':
      const features = block.props?.items || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="text-center p-2 md:p-4 bg-[hsl(var(--card))] rounded-lg">
              <div className="text-lg md:text-2xl mb-1 md:mb-2">{item.icon}</div>
              <h3 className="font-bold text-xs md:text-sm mb-1 text-[hsl(var(--foreground))]">{item.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-[10px] md:text-xs line-clamp-2">{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center p-2 md:p-4">
              <div className="text-xl md:text-3xl font-bold text-[hsl(var(--primary))] mb-1">
                {item.value}
              </div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs md:text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'warn':
      return (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center text-sm">
          <span className="text-amber-500">⚠️ {block.content}</span>
        </div>
      );
    
    case 'def':
      return (
        <div className="p-3 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg text-center text-sm">
          <span className="text-[hsl(var(--primary))]">ℹ️ {block.content}</span>
        </div>
      );
    
    case 'quote':
      return (
        <blockquote className="text-lg italic text-center text-[hsl(var(--muted-foreground))] border-l-4 border-[hsl(var(--primary))] pl-4 py-1">
          "{block.content}"
        </blockquote>
      );
    
    default:
      return null;
  }
}

export default DeckRenderer;
