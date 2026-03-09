/**
 * Preview Component
 * Renders Markdown content with Netral extensions as HTML
 */

import { useMemo } from 'react';
import { renderMarkdown } from '@/core/renderer/markdownRenderer';

interface PreviewProps {
  content: string;
  className?: string;
}

export function Preview({ content, className = '' }: PreviewProps) {
  // Memoize the rendered HTML to avoid unnecessary re-renders
  const renderedHtml = useMemo(() => {
    return renderMarkdown(content);
  }, [content]);

  return (
    <div className={`h-full w-full overflow-auto bg-background p-6 scrollbar-thin ${className}`}>
      {content.trim() === '' ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Aperçu en direct</p>
            <p className="mt-1 text-sm">Commencez à écrire pour voir le résultat ici</p>
          </div>
        </div>
      ) : (
        <article
          className="netral-preview animate-fade-in"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
    </div>
  );
}

export default Preview;
