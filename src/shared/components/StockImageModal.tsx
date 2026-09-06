/**
 * Stock Image Modal
 * Search stock photos and insert an Image[...] at the editor cursor.
 * Uses LoremFlickr for keyword search and Picsum for the random gallery
 * (both are free and require no API key).
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PicsumImage {
  id: string;
  author: string;
  download_url: string;
}

interface StockImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (text: string) => void;
}

const PICSUM_LIST = 'https://picsum.photos/v2/list?page=1&limit=30';

export function StockImageModal({ open, onOpenChange, onInsert }: StockImageModalProps) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [random, setRandom] = useState<PicsumImage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(PICSUM_LIST);
      const data = (await res.json()) as PicsumImage[];
      setRandom(data);
    } catch {
      setRandom([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadRandom();
  }, [open, loadRandom]);

  const handleSearch = () => {
    setSearched(query.trim());
  };

  const handleInsert = (url: string) => {
    onInsert(`Image[${url}]`);
    onOpenChange(false);
    setQuery('');
    setSearched('');
  };

  // LoremFlickr returns keyword-matching images without an API key.
  const keywordImages = searched
    ? Array.from(
        { length: 18 },
        (_, i) => `https://loremflickr.com/480/320/${encodeURIComponent(searched)}?lock=${i + 1}`
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Stock images
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search images (e.g. forest, city, food)..."
            className="flex-1"
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        <ScrollArea className="h-[60vh] p-4">
          {searched ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Results for “{searched}” — click an image to insert it.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {keywordImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsert(url)}
                    className="overflow-hidden rounded-lg border border-border hover:border-primary transition-colors group"
                  >
                    <img
                      src={url}
                      alt={searched}
                      loading="lazy"
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  Random photos — click to insert, or search above.
                </p>
                <Button variant="ghost" size="sm" onClick={loadRandom} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Shuffle
                </Button>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {random.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => handleInsert(`https://picsum.photos/id/${img.id}/800/500`)}
                      className="overflow-hidden rounded-lg border border-border hover:border-primary transition-colors group"
                    >
                      <img
                        src={`https://picsum.photos/id/${img.id}/480/320`}
                        alt={img.author}
                        loading="lazy"
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <p className="text-[10px] text-muted-foreground truncate px-2 py-1">{img.author}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default StockImageModal;
