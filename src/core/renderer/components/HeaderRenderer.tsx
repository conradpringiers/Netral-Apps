/**
 * Header Renderer Component
 * Renders different header styles: Classic, BigText, SplitImage
 */

import { HeaderConfig } from '@/core/parser/netralParser';

interface HeaderRendererProps {
  header: HeaderConfig;
}

export function HeaderRenderer({ header }: HeaderRendererProps) {
  switch (header.type) {
    case 'BigText':
      return (
        <header className="py-24 px-6 text-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {header.title}
            </h1>
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto mb-8"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {header.description}
            </p>
            {header.link && (
              <a
                href={header.link}
                className="btn-primary inline-flex items-center px-8 py-4 rounded-lg font-medium text-lg"
              >
                Learn More
              </a>
            )}
            {header.imageUrl && (
              <img
                src={header.imageUrl}
                alt={header.title}
                className="w-full max-w-4xl h-auto rounded-xl shadow-2xl mx-auto mt-12"
              />
            )}
          </div>
        </header>
      );

    case 'SplitImage':
      return (
        <header 
          className="min-h-[70vh] grid md:grid-cols-2 gap-12 items-center py-20 px-6 max-w-6xl mx-auto"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <div>
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {header.title}
            </h1>
            <p 
              className="text-lg md:text-xl mb-8"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {header.description}
            </p>
            {header.link && (
              <a
                href={header.link}
                className="btn-primary inline-flex items-center px-8 py-4 rounded-lg font-medium"
              >
                Get Started
              </a>
            )}
          </div>
          {header.imageUrl && (
            <div className="order-first md:order-last">
              <img
                src={header.imageUrl}
                alt={header.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          )}
        </header>
      );

    case 'Classic':
    default:
      return (
        <header 
          className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden"
          style={{
            backgroundImage: header.imageUrl ? `url(${header.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: header.imageUrl 
                ? 'rgba(0, 0, 0, 0.5)' 
                : 'hsl(var(--secondary))'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: header.imageUrl ? '#ffffff' : 'hsl(var(--foreground))' }}
            >
              {header.title}
            </h1>
            <p 
              className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
              style={{ color: header.imageUrl ? 'rgba(255,255,255,0.9)' : 'hsl(var(--muted-foreground))' }}
            >
              {header.description}
            </p>
            {header.link && (
              <a
                href={header.link}
                className="btn-primary inline-flex items-center px-8 py-4 rounded-lg font-medium"
              >
                Discover
              </a>
            )}
          </div>
        </header>
      );
  }
}
