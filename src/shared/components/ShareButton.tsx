/**
 * Share Button Component
 * Compresses content into a shareable URL
 */

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { compressToEncodedURIComponent } from 'lz-string';

const BASE_URL = 'https://netral-apps-betasigma.netlify.app';

interface ShareButtonProps {
  content: string;
  mode: 'block' | 'deck' | 'doc';
}

export function ShareButton({ content, mode }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    const compressed = compressToEncodedURIComponent(content);
    return `${BASE_URL}/?mode=${mode}&c=${compressed}`;
  };

  const handleCopy = () => {
    const link = generateLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast({ title: 'Link copied!', description: 'The share link has been copied to your clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({ title: 'Error', description: 'Could not copy the link.', variant: 'destructive' });
    });
  };

  const link = open ? generateLink() : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share by link</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            This link contains all the content. Anyone who opens it can view and edit a copy.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-md font-mono truncate"
            />
            <Button size="sm" onClick={handleCopy} className="gap-2 shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          {link.length > 8000 && (
            <p className="text-xs text-destructive">
              ⚠ The link is very long ({Math.round(link.length / 1000)}k chars). Some browsers may truncate it.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
