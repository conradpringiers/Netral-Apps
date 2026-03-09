/**
 * Presenter Mode
 * Split view with current slide, next slide preview, speaker notes, and timer
 * Uses ScaledSlide for consistent 1920x1080 rendering
 */

import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, X, Play, Pause, RotateCcw } from 'lucide-react';
import { parseDeckDocument } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { SlideBlockRenderer, computeContentScale } from './components/SlideBlockRenderer';
import { ScaledSlide } from './components/ScaledSlide';

interface PresenterModeProps {
  content: string;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
  onClose: () => void;
}

function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggle = () => setRunning(r => !r);
  const reset = () => { setElapsed(0); setRunning(true); };
  const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return { formatted, running, toggle, reset };
}

export function PresenterMode({
  content,
  currentSlide,
  totalSlides,
  onSlideChange,
  onClose,
}: PresenterModeProps) {
  const timer = useTimer();

  const doc = useMemo(() => {
    try { return parseDeckDocument(content); } catch { return null; }
  }, [content]);

  const goToPrev = useCallback(() => {
    if (currentSlide > 0) onSlideChange(currentSlide - 1);
  }, [currentSlide, onSlideChange]);

  const goToNext = useCallback(() => {
    if (currentSlide < totalSlides) onSlideChange(currentSlide + 1);
  }, [currentSlide, totalSlides, onSlideChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault(); goToPrev(); break;
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault(); goToNext(); break;
        case 'Escape':
          e.preventDefault(); onClose(); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, onClose]);

  if (!doc) return null;

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  const isIntro = currentSlide === 0;
  const currentSlideData = isIntro ? null : doc.slides[currentSlide - 1];
  const notes = currentSlideData?.notes || '';

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
    <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col">
      <style>{`.presenter-slide { ${themeCSS} }`}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 bg-zinc-800 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm font-medium">
            {isIntro ? 'Intro' : `Slide ${currentSlide} / ${totalSlides}`}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} disabled={currentSlide === 0} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={goToNext} disabled={currentSlide === totalSlides} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-700 rounded-md px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-white/60" />
            <span className="text-white font-mono text-sm">{timer.formatted}</span>
            <button onClick={timer.toggle} className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white">
              {timer.running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button onClick={timer.reset} className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0 p-4 gap-4">
        {/* Current slide - large */}
        <div className="flex-[3] flex flex-col min-w-0">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">Slide actuelle</div>
          <div className="flex-1 relative rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0" style={themeVars}>
              <MiniSlide doc={doc} slideIndex={currentSlide} theme={theme} />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-[1.5] flex flex-col gap-4 min-w-0">
          {/* Next slide preview */}
          <div className="flex flex-col">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">Slide suivante</div>
            <div className="relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700" style={{ aspectRatio: '16/9' }}>
              {currentSlide < totalSlides ? (
                <div className="absolute inset-0" style={themeVars}>
                  <MiniSlide doc={doc} slideIndex={currentSlide + 1} theme={theme} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                  Fin de la présentation
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">Notes</div>
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-4 overflow-auto">
              {notes ? (
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="text-white/30 text-sm italic">
                  Pas de notes pour cette slide. Ajoutez Notes[...] dans votre slide.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSlide({ doc, slideIndex, theme }: { doc: any; slideIndex: number; theme: any }) {
  const isIntro = slideIndex === 0;
  const slide = isIntro ? null : doc.slides[slideIndex - 1];

  return (
    <ScaledSlide>
      {isIntro ? (
        <div className="presenter-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
          <h1 className="font-bold text-center text-[hsl(var(--primary))] px-16" style={{ fontFamily: theme.headingFontFamily, fontSize: '5rem' }}>
            {doc.title}
          </h1>
          <p style={{ fontSize: '2rem', marginTop: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>{doc.slides.length} slides</p>
        </div>
      ) : slide ? (
        <div className="presenter-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
          {slide.background && (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.background})` }} />
              <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background) / 0.85)' }} />
            </>
          )}
          <div className="relative px-20 pt-16 pb-4">
            <h1 className="font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: theme.headingFontFamily, fontSize: '3.5rem' }}>
              {slide.title}
            </h1>
            <hr className="mt-6 border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex-1 px-20 pb-16 overflow-hidden min-h-0">
            {(() => {
              const cScale = computeContentScale(slide.content);
              return (
                <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: `${1.5 * cScale}rem` }}>
                  {slide.content.map((block: any, idx: number) => (
                    <SlideBlockRenderer key={idx} block={block} contentScale={cScale} />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
    </ScaledSlide>
  );
}

export default PresenterMode;
