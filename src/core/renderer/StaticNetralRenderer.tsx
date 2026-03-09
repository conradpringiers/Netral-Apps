/**
 * Static Netral Renderer
 * Same as NetralRenderer but without React hooks (for static HTML export)
 */

import { parseNetralDocument, NetralDocument } from '@/core/parser/netralParser';
import { getTheme, generateThemeCSS } from '@/core/themes/themes';
import { StaticHeaderRenderer } from './components/StaticHeaderRenderer';
import { StaticContentBlockRenderer } from './components/StaticContentBlockRenderer';

interface StaticNetralRendererProps {
  content: string;
  className?: string;
}

export function StaticNetralRenderer({ content, className = '' }: StaticNetralRendererProps) {
  let doc: NetralDocument | null = null;
  
  try {
    doc = parseNetralDocument(content);
  } catch (error) {
    console.error('Parse error:', error);
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Error parsing document</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Start writing...</p>
      </div>
    );
  }

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  return (
    <div
      className={`netral-render min-h-full ${className}`}
      style={{ fontFamily: theme.fontFamily } as React.CSSProperties}
    >
      {/* Custom theme variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        .netral-render {
          ${themeCSS}
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .netral-render * {
          border-color: hsl(var(--border));
        }
        .netral-render .prose-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
        .netral-render .prose-content h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
        .netral-render .prose-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
        .netral-render .prose-content p { margin-bottom: 1rem; color: hsl(var(--foreground)); line-height: 1.7; }
        .netral-render .prose-content a { color: hsl(var(--primary)); text-decoration: underline; transition: opacity 0.2s; }
        .netral-render .prose-content a:hover { opacity: 0.8; }
        .netral-render .prose-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
        .netral-render .prose-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .netral-render .prose-content ul, .netral-render .prose-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .netral-render .prose-content li { margin-bottom: 0.25rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
        .netral-render .prose-content strong { font-weight: 600; }
        .netral-render .prose-content em { font-style: italic; }
        
        /* Card hover effects */
        .netral-render .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .netral-render .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px hsl(var(--primary) / 0.3);
        }
        
        /* Button hover effects */
        .netral-render .btn-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.2s ease;
        }
        .netral-render .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.5);
        }
        
        /* Modern floating navbar - sticky instead of fixed to stay within preview */
        .netral-render .floating-nav {
          position: sticky;
          top: 1rem;
          z-index: 100;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid hsl(var(--border) / 0.5);
          box-shadow: 0 8px 32px -8px hsl(var(--foreground) / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          max-width: fit-content;
          margin: 1rem auto 0;
        }
        
        /* Navbar link effects - animated pill hover */
        .netral-render .nav-link {
          position: relative;
          padding: 0.375rem 0.875rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          transition: color 0.25s ease;
          white-space: nowrap;
          text-decoration: none;
          z-index: 1;
        }
        .netral-render .nav-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: hsl(var(--primary) / 0.08);
          border-radius: 0.5rem;
          transform: scale(0.85);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }
        .netral-render .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 25%;
          width: 50%;
          height: 2.5px;
          background: hsl(var(--primary));
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
        }
        .netral-render .nav-link:hover::before {
          transform: scale(1);
          opacity: 1;
        }
        .netral-render .nav-link:hover::after {
          transform: scaleX(1);
        }
        .netral-render .nav-link:hover {
          color: hsl(var(--primary));
        }
        
        /* Mobile menu */
        .netral-render .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
          background: hsl(var(--background) / 0.98);
          backdrop-filter: blur(16px);
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        body.menu-open .netral-render .mobile-menu { display: flex; }
        .netral-render .mobile-menu a {
          font-size: 1.5rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          text-decoration: none;
          transition: color 0.2s;
        }
        .netral-render .mobile-menu a:hover {
          color: hsl(var(--primary));
        }
        .netral-render .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 9999px;
        }
        .netral-render .mobile-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: hsl(var(--foreground));
          cursor: pointer;
          padding: 0.5rem;
        }
        @media (max-width: 768px) {
          .netral-render .nav-links-desktop { display: none !important; }
          .netral-render .mobile-toggle { display: block; }
        }
        
        /* FAQ accordion styling */
        .netral-render .faq-item summary { list-style: none; }
        .netral-render .faq-item summary::-webkit-details-marker { display: none; }
        .netral-render .faq-item[open] summary { background-color: hsl(var(--secondary)); }
        .netral-render .faq-item[open] .faq-chevron { transform: rotate(180deg); }
      `}} />

      {/* Modern Floating Navbar */}
      {(doc.logo || doc.navbar.length > 0) && (
        <>
          <nav className="floating-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {doc.logo && (
                doc.logo.type === 'url' ? (
                  <img src={doc.logo.value} alt="Logo" style={{ height: '2rem', width: 'auto' }} />
                ) : (
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{doc.logo.value}</span>
                )
              )}
            </div>
            
            {doc.navbar.length > 0 && (
              <>
                <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {doc.navbar.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      className="nav-link"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <button 
                  className="mobile-toggle"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.document.body.classList.toggle('menu-open');
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Overlay */}
          <div className="mobile-menu">
            <button 
              className="mobile-close"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.document.body.classList.remove('menu-open');
                }
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {doc.navbar.map((item, index) => (
              <a
                key={index}
                href={item.url}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.document.body.classList.remove('menu-open');
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </>
      )}

      {/* Header */}
      {doc.header && <StaticHeaderRenderer header={doc.header} />}

      {/* Sections */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
        {doc.sections.map((section, sectionIndex) => (
          <section key={sectionIndex} style={{ marginBottom: '4rem' }}>
            {section.title && (
              <h2 style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
                fontWeight: 700,
                marginBottom: '2rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid hsl(var(--border))',
                textAlign: 'center',
                color: 'hsl(var(--foreground))',
                fontFamily: theme.headingFontFamily,
              }}>
                {section.title}
              </h2>
            )}
            {section.content.map((block, blockIndex) => (
              <StaticContentBlockRenderer key={blockIndex} block={block} />
            ))}
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem 1.5rem',
        borderTop: '1px solid hsl(var(--border))',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'hsl(var(--muted-foreground))'
      }}>
        {doc.title && <p>© {new Date().getFullYear()} {doc.title}</p>}
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.6 }}>Built with Netral</p>
      </footer>
    </div>
  );
}

export default StaticNetralRenderer;
