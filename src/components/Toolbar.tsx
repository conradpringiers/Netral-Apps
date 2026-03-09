/**
 * Toolbar Component
 * Provides formatting buttons and export functionality
 */

import { Bold, Italic, Link, AlertTriangle, Image, Download, Copy, FileCode, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { downloadHtml, copyHtmlToClipboard } from '@/core/exporter/htmlExporter';
import { toast } from '@/hooks/use-toast';

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onInsertButton: () => void;
  onInsertBlock: (type: string) => void;
  onInsertGallery: () => void;
  content: string;
  wordCount: number;
  charCount: number;
}

export function Toolbar({
  onBold,
  onItalic,
  onInsertButton,
  onInsertBlock,
  onInsertGallery,
  content,
  wordCount,
  charCount,
}: ToolbarProps) {
  const handleExportHtml = () => {
    downloadHtml(content, 'netral-document.html');
    toast({
      title: 'Export successful',
      description: 'The HTML file has been downloaded.',
    });
  };

  const handleCopyHtml = async () => {
    const success = await copyHtmlToClipboard(content);
    if (success) {
      toast({
        title: 'Copied!',
        description: 'HTML has been copied to clipboard.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Could not copy the HTML.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-toolbar-bg px-4">
      {/* Left side - Logo and formatting */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-4 border-r border-border">
          <Layers className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Netral Block</span>
        </div>

        {/* Formatting buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBold}
                className="h-8 w-8"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onItalic}
                className="h-8 w-8"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
          </Tooltip>

          <div className="mx-2 h-4 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onInsertButton}
                className="h-8 w-8"
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert button</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Insert block</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onInsertBlock('warning')}>
                <span className="mr-2 h-2 w-2 rounded-full bg-warning" />
                Bloc Warning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlock('info')}>
                <span className="mr-2 h-2 w-2 rounded-full bg-info" />
                Bloc Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlock('success')}>
                <span className="mr-2 h-2 w-2 rounded-full bg-success" />
                Bloc Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlock('error')}>
                <span className="mr-2 h-2 w-2 rounded-full bg-destructive" />
                Bloc Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onInsertGallery}
                className="h-8 w-8"
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert gallery</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Right side - Stats and export */}
      <div className="flex items-center gap-4">
        {/* Word count */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span className="h-3 w-px bg-border" />
          <span>{charCount} chars</span>
        </div>

        {/* Export button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportHtml}>
              <FileCode className="mr-2 h-4 w-4" />
              Download HTML
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyHtml}>
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Toolbar;
