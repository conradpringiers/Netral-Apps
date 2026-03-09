/**
 * Presentation Mode
 * Fullscreen presentation with keyboard navigation and smooth transitions
 * Uses ScaledSlide for fixed 1920x1080 rendering
 */

import { useEffect, useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDeckDocument } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { SlideBlockRenderer, computeContentScale } from './components/SlideBlockRenderer';
import { ScaledSlide } from './components/ScaledSlide';

interface PresentationModeProps {
  content: string;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
  onClose: () => void;
}

export function PresentationMode({
  content,
  currentSlide,
  totalSlides,
  onSlideChange,
  onClose,
}: PresentationModeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setSlideDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        onSlideChange(currentSlide - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, onSlideChange, isTransitioning]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides && !isTransitioning) {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        onSlideChange(currentSlide + 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, totalSlides, onSlideChange, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault(); goToPrevSlide(); break;
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault(); goToNextSlide(); break;
        case 'Escape':
          e.preventDefault(); onClose(); break;
        case 'Home':
          e.preventDefault(); onSlideChange(0); break;
        case 'End':
          e.preventDefault(); onSlideChange(totalSlides); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSlide, goToNextSlide, onClose, onSlideChange, totalSlides]);

  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <SlideBackground content={content} currentSlide={currentSlide} />
      {/* Navigation pill */}
      <div
        className="absolute bottom-6 left-6 z-50 flex items-center bg-white/10 backdrop-blur-sm rounded-full transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className={`p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ${
            isHovered ? 'opacity-100 w-8' : 'opacity-0 w-0 overflow-hidden'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="px-3 py-2 text-white/80 text-sm font-medium min-w-[3rem] text-center">
          {currentSlide === 0 ? 'Intro' : `${currentSlide}/${totalSlides}`}
        </span>
        <button
          onClick={goToNextSlide}
          disabled={currentSlide === totalSlides}
          className={`p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ${
            isHovered ? 'opacity-100 w-8' : 'opacity-0 w-0 overflow-hidden'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide content with transition — centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-full h-full transition-all duration-300 ease-out ${
            isTransitioning
              ? slideDirection === 'right'
                ? 'opacity-80 translate-x-3'
                : 'opacity-80 -translate-x-3'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <FullscreenSlide content={content} currentSlide={currentSlide} />
        </div>
      </div>
    </div>
  );
}

function FullscreenSlide({ content, currentSlide }: { content: string; currentSlide: number }) {
  const doc = useMemo(() => {
    try { return parseDeckDocument(content); } catch { return null; }
  }, [content]);

  if (!doc || doc.slides.length === 0) return null;

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  const isIntroSlide = currentSlide === 0;
  const slide = isIntroSlide ? null : doc.slides[currentSlide - 1];

  const themeVars = {
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
  } as React.CSSProperties;

  return (
    <div className="h-full w-full" style={themeVars}>
      <style>{`.fullscreen-slide { ${themeCSS} }`}</style>
      <ScaledSlide>
        {isIntroSlide ? (
          <div className="fullscreen-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
            <DeckLogo logo={doc.logo} />
            <h1
              className="font-bold text-center text-[hsl(var(--primary))] px-16"
              style={{ fontFamily: theme.headingFontFamily, fontSize: '5rem' }}
            >
              {doc.title}
            </h1>
            <p style={{ fontSize: '2rem', marginTop: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
              {doc.slides.length} slides
            </p>
          </div>
        ) : slide ? (
          <div className="fullscreen-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center">
            {slide.background && (
              <>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.background})` }} />
                <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background) / 0.80)' }} />
              </>
            )}
            <DeckLogo logo={doc.logo} />
            <div className="relative w-full px-20 pt-16 pb-8">
              <h1
                className="font-bold text-[hsl(var(--foreground))]"
                style={{ fontFamily: theme.headingFontFamily, fontSize: '3.5rem' }}
              >
                {slide.title}
              </h1>
              <hr className="mt-6 border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex-1 w-full px-20 pb-16 overflow-hidden">
              {(() => {
                const scale = computeContentScale(slide.content);
                return (
                  <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: `${1.5 * scale}rem` }}>
                    {slide.content.map((block, index) => (
                      <SlideBlockRenderer key={index} block={block} contentScale={scale} />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}
      </ScaledSlide>
    </div>
  );
}

/** Background layer that fills the entire screen with the slide's bg color/image */
function SlideBackground({ content, currentSlide }: { content: string; currentSlide: number }) {
  const doc = useMemo(() => {
    try { return parseDeckDocument(content); } catch { return null; }
  }, [content]);

  if (!doc) return <div className="absolute inset-0 bg-black" />;

  const theme = getTheme(doc.theme);
  const isIntro = currentSlide === 0;
  const slide = isIntro ? null : doc.slides[currentSlide - 1];
  const bgColor = `hsl(${theme.colors.background})`;

  return (
    <>
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      {slide?.background && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.background})` }} />
          <div className="absolute inset-0" style={{ backgroundColor: `hsl(${theme.colors.background} / 0.80)` }} />
        </>
      )}
    </>
  );
}

function isProbablyUrl(value: string) {
  return /^(https?:\/\/|data:image\/)/i.test(value.trim());
}

function DeckLogo({ logo }: { logo?: string }) {
  if (!logo) return null;
  return (
    <div className="absolute z-10" style={{ top: '2rem', right: '2.5rem' }}>
      {isProbablyUrl(logo) ? (
        <img src={logo} alt="Logo" style={{ height: '3rem' }} className="w-auto object-contain" loading="lazy" />
      ) : (
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{logo}</div>
      )}
    </div>
  );
}

export default PresentationMode;
