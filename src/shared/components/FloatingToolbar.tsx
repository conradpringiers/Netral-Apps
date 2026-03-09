/**
 * Floating Toolbar Component
 * Retractable formatting toolbar at the bottom of the editor
 */

import { useState } from 'react';
import {
  Bold,
  Italic,
  Link,
  Image,
  Columns,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingToolbarProps {
  onInsert: (text: string) => void;
  onWrap: (prefix: string, suffix: string) => void;
  mode?: 'block' | 'deck' | 'doc';
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

export function FloatingToolbar({ onInsert, onWrap, mode = 'block' }: FloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: 'Bold (Ctrl+B)',
      action: () => onWrap('**', '**'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: 'Italic (Ctrl+I)',
      action: () => onWrap('*', '*'),
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: 'Link',
      action: () => onWrap('[', '](https://url)'),
    },
    {
      icon: <Image className="w-4 h-4" />,
      label: 'Image',
      action: () => onInsert('\nImage[https://example.com/image.jpg]\n'),
    },
    {
      icon: <Columns className="w-4 h-4" />,
      label: 'Columns',
      action: () => onInsert('\nColumn[\n{Left content}\n{Right content}\n]\n'),
    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200">
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-1.5 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Hide
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              Format
            </>
          )}
        </button>

        {/* Toolbar content */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 flex items-center gap-1 justify-center">
            {buttons.map((button, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      button.action();
                    }}
                    className="h-8 w-8 hover:bg-accent"
                    type="button"
                  >
                    {button.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{button.label}</TooltipContent>
              </Tooltip>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              Type element name + Tab
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingToolbar;
