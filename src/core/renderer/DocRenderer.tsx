/**
 * Document Renderer
 * Renders parsed documents with theme support
 */

import { useMemo } from 'react';
import { parseDocDocument, renderDocContent, DocCallout } from '@/core/parser/docParser';
import { getTheme, generateThemeCSS, ThemeName } from '@/core/themes/themes';

interface DocRendererProps {
  content: string;
  className?: string;
}

function getCalloutStyles(type: DocCallout['type']) {
  switch (type) {
    case 'info':
      return {
        bg: 'hsl(210 100% 95%)',
        border: 'hsl(210 100% 50%)',
        text: 'hsl(210 100% 30%)',
        icon: 'ℹ️',
      };
    case 'warning':
      return {
        bg: 'hsl(45 100% 94%)',
        border: 'hsl(45 100% 50%)',
        text: 'hsl(45 100% 25%)',
        icon: '⚠️',
      };
    case 'success':
      return {
        bg: 'hsl(142 70% 94%)',
        border: 'hsl(142 70% 45%)',
        text: 'hsl(142 70% 25%)',
        icon: '✅',
      };
    case 'error':
      return {
        bg: 'hsl(0 84% 95%)',
        border: 'hsl(0 84% 50%)',
        text: 'hsl(0 84% 30%)',
        icon: '❌',
      };
    default:
      return {
        bg: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        text: 'hsl(var(--foreground))',
        icon: '📝',
      };
  }
}

export function DocRenderer({ content, className = '' }: DocRendererProps) {
  const doc = useMemo(() => {
    try {
      return parseDocDocument(content);
    } catch (e) {
      return null;
    }
  }, [content]);

  const theme = useMemo(() => {
    const themeName = (doc?.theme || 'Modern') as ThemeName;
    return getTheme(themeName);
  }, [doc?.theme]);

  const themeStyles = useMemo(() => generateThemeCSS(theme), [theme]);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Commencez à écrire...</p>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-full bg-[hsl(var(--background))] ${className}`}
      style={{ 
        // @ts-ignore
        '--background': theme.colors.background,
        '--foreground': theme.colors.foreground,
        '--primary': theme.colors.primary,
        '--primary-foreground': theme.colors.primaryForeground,
        '--secondary': theme.colors.secondary,
        '--muted': theme.colors.muted,
        '--muted-foreground': theme.colors.mutedForeground,
        '--border': theme.colors.border,
        '--card': theme.colors.card,
        '--card-foreground': theme.colors.cardForeground,
        fontFamily: theme.fontFamily,
      } as React.CSSProperties}
    >
      {/* Document container - A4 paper style */}
      <div className="mx-auto max-w-4xl px-8 py-12 md:px-16 md:py-16">
        {/* Document title */}
        {doc.title && (
          <header className="mb-12 border-b-2 border-[hsl(var(--primary))] pb-6">
            <h1 
              className="text-4xl font-bold text-[hsl(var(--foreground))]"
              style={{ fontFamily: theme.headingFontFamily }}
            >
              {doc.title}
            </h1>
          </header>
        )}

        {/* Sections */}
        {doc.sections.map((section, index) => (
          <section key={index} className="mb-10">
            {section.title && (
              section.level === 1 ? (
                <h2 
                  className="mb-4 text-2xl font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2"
                  style={{ fontFamily: theme.headingFontFamily }}
                >
                  {section.title}
                </h2>
              ) : (
                <h3 
                  className="mb-3 text-xl font-semibold text-[hsl(var(--foreground))]"
                  style={{ fontFamily: theme.headingFontFamily }}
                >
                  {section.title}
                </h3>
              )
            )}
            
            {/* Callouts */}
            {section.callouts && section.callouts.length > 0 && (
              <div className="space-y-3 mb-4">
                {section.callouts.map((callout, idx) => {
                  const styles = getCalloutStyles(callout.type);
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-lg border-l-4"
                      style={{
                        backgroundColor: styles.bg,
                        borderLeftColor: styles.border,
                      }}
                    >
                      <span className="text-lg">{styles.icon}</span>
                      <p style={{ color: styles.text, margin: 0 }}>{callout.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
            
            {section.content && (
              <div 
                className="doc-content prose prose-slate max-w-none"
                style={{
                  color: `hsl(${theme.colors.foreground})`,
                }}
                dangerouslySetInnerHTML={{ __html: renderDocContent(section.content) }}
              />
            )}
          </section>
        ))}
      </div>

      {/* Styles for rendered content */}
      <style>{`
        .doc-content h1, .doc-content h2, .doc-content h3, .doc-content h4 {
          color: hsl(${theme.colors.foreground});
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-family: ${theme.headingFontFamily};
        }
        .doc-content h1 { font-size: 2rem; font-weight: 700; }
        .doc-content h2 { font-size: 1.5rem; font-weight: 600; }
        .doc-content h3 { font-size: 1.25rem; font-weight: 600; }
        
        .doc-content p {
          margin-bottom: 1em;
          line-height: 1.7;
          color: hsl(${theme.colors.foreground});
        }
        
        .doc-content ul, .doc-content ol {
          margin-bottom: 1em;
          padding-left: 1.5em;
          color: hsl(${theme.colors.foreground});
        }
        
        .doc-content li {
          margin-bottom: 0.25em;
          line-height: 1.6;
        }
        
        .doc-content blockquote {
          border-left: 4px solid hsl(${theme.colors.primary});
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: italic;
          color: hsl(${theme.colors.mutedForeground});
          background: hsl(${theme.colors.muted});
          padding: 1em 1.5em;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .doc-content code {
          background: hsl(${theme.colors.muted});
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        
        .doc-content pre {
          background: hsl(${theme.colors.secondary});
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        
        .doc-content pre code {
          background: none;
          padding: 0;
        }
        
        .doc-content a {
          color: hsl(${theme.colors.primary});
          text-decoration: underline;
        }
        
        .doc-content a:hover {
          opacity: 0.8;
        }
        
        .doc-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
        }
        
        .doc-content th, .doc-content td {
          border: 1px solid hsl(${theme.colors.border});
          padding: 0.75em 1em;
          text-align: left;
        }
        
        .doc-content th {
          background: hsl(${theme.colors.muted});
          font-weight: 600;
        }
        
        .doc-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
        }
        
        .doc-content hr {
          border: none;
          border-top: 1px solid hsl(${theme.colors.border});
          margin: 2em 0;
        }
        
        .doc-content input[type="checkbox"] {
          margin-right: 0.5em;
        }

        @media print {
          .doc-content {
            font-size: 12pt;
          }
          .doc-content pre {
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  );
}

export default DocRenderer;
