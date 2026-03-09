/**
 * File Menu Component
 * Handles save/load functionality for .netblock and .netdeck files
 */

import { useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Save, FolderOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileMenuProps {
  documentTitle: string;
  content: string;
  onLoad: (content: string) => void;
  fileExtension?: string;
}

export function FileMenu({ documentTitle, content, onLoad, fileExtension = '.netblock' }: FileMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const displayTitle = documentTitle || 'Untitled';
  const acceptTypes = fileExtension === '.netdeck' ? '.netdeck,.txt' : '.netblock,.txt';
  
  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${displayTitle.replace(/[^a-z0-9]/gi, '_')}${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'File saved',
      description: `${displayTitle}${fileExtension} has been downloaded.`,
    });
  };
  
  const handleLoad = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onLoad(content);
      toast({
        title: 'File loaded',
        description: `${file.name} has been loaded.`,
      });
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };
  
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
            <span className="font-medium truncate max-w-[150px]">{displayTitle}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save as {fileExtension}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLoad}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Open file...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default FileMenu;
