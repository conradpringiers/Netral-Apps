/**
 * Deck Preview - Scrollable view of all slides for editing
 * Uses ScaledSlide for consistent 1920x1080 rendering scaled to preview size
 */

import { useMemo } from 'react';
import { parseDeckDocument } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { SlideBlockRenderer, computeContentScale } from './components/SlideBlockRenderer';
import { ScaledSlide } from './components/ScaledSlide';

interface DeckPreviewProps {
  content: string;
  className?: string;
}

export function DeckPreview({ content, className = '' }: DeckPreviewProps) {
  const doc = useMemo(() => {
    try { return parseDeckDocument(content); } catch { return null; }
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
    <div
      className={`h-full overflow-auto p-4 md:p-6 ${className}`}
      style={{ backgroundColor: '#1e293b' }}
    >
      <style>{`.deck-preview-slide { ${themeCSS} }`}</style>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Intro slide */}
        <div className="relative w-full rounded-lg shadow-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <div className="absolute inset-0" style={themeVars}>
            <ScaledSlide>
              <div className="deck-preview-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
                <DeckLogo logo={doc.logo} />
                <h1 className="font-bold text-center text-[hsl(var(--primary))] px-16" style={{ fontSize: '5rem', fontFamily: theme.headingFontFamily }}>
                  {doc.title}
                </h1>
                <p style={{ fontSize: '2rem', marginTop: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                  {doc.slides.length} slides
                </p>
              </div>
            </ScaledSlide>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
            Intro
          </div>
        </div>

        {/* All slides */}
        {doc.slides.map((slide, index) => (
          <div key={index} className="relative w-full rounded-lg shadow-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0" style={themeVars}>
              <ScaledSlide>
                <div className="deck-preview-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
                  {slide.background && (
                    <>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.background})` }} />
                      <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background) / 0.85)' }} />
                    </>
                  )}
                  <DeckLogo logo={doc.logo} />
                  <div className="relative px-20 pt-16 pb-4">
                    <h1 className="font-bold text-[hsl(var(--foreground))]" style={{ fontSize: '3.5rem', fontFamily: theme.headingFontFamily }}>
                      {slide.title}
                    </h1>
                    <hr className="mt-6 border-t border-[hsl(var(--border))]" />
                  </div>
                  <div className="relative flex-1 px-20 pb-16 overflow-hidden min-h-0">
                    {(() => {
                      const cScale = computeContentScale(slide.content);
                      return (
                        <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: `${1.5 * cScale}rem` }}>
                          {slide.content.map((block, blockIndex) => (
                            <SlideBlockRenderer key={blockIndex} block={block} contentScale={cScale} />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </ScaledSlide>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
              {index + 1} / {doc.slides.length}
            </div>
          </div>
        ))}
      </div>
    </div>
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

export default DeckPreview;
