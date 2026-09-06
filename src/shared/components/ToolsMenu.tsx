/**
 * Tools Menu Component
 * Dropdown (styled like ThemeSelector) with helper tools: stock images and
 * a lorem ipsum generator. Used in Block and Deck.
 */

import { useState } from 'react';
import { Wrench, Image as ImageIcon, Type } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StockImageModal } from './StockImageModal';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function generateLorem(paragraphs = 2): string {
  const paras: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 6 + Math.floor(Math.random() * 8);
      const words: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      let sentence = words.join(' ');
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
      sentences.push(sentence);
    }
    paras.push(sentences.join(' '));
  }
  return paras.join('\n\n');
}

interface ToolsMenuProps {
  onInsert: (text: string) => void;
}

export function ToolsMenu({ onInsert }: ToolsMenuProps) {
  const [stockOpen, setStockOpen] = useState(false);

  const handleLorem = () => {
    onInsert(generateLorem());
  };

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Tools</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Insert images or placeholder text</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setStockOpen(true)} className="gap-2 cursor-pointer">
            <ImageIcon className="h-4 w-4" />
            Stock images
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLorem} className="gap-2 cursor-pointer">
            <Type className="h-4 w-4" />
            Lorem ipsum
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StockImageModal
        open={stockOpen}
        onOpenChange={setStockOpen}
        onInsert={onInsert}
      />
    </>
  );
}

export default ToolsMenu;
