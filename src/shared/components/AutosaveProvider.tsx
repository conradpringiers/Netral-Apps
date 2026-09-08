/**
 * Autosave Provider
 * Stores the 5 most recent documents in the browser (localStorage) and exposes
 * an enable/disable toggle plus a "recent documents" list for the launcher.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

export type DocMode = 'block' | 'deck' | 'doc' | 'calus' | 'luate';

export interface RecentDocument {
  id: string;
  mode: DocMode;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'netral-recent-documents';
const ENABLED_KEY = 'netral-autosave-enabled';
const MAX_DOCS = 5;

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(content: string, mode: DocMode): string {
  const match = content.match(/^---\s*(.+)$/m);
  const title = match ? match[1].trim() : '';
  if (title) return title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const labels: Record<DocMode, string> = {
    block: 'Website',
    deck: 'Presentation',
    doc: 'Document',
    calus: 'Math sheet',
    luate: 'Exam',
  };
  return `Untitled ${labels[mode]}`;
}

function loadRecent(): RecentDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((d) => d && typeof d.id === 'string' && typeof d.content === 'string')
      : [];
  } catch {
    return [];
  }
}

function loadEnabled(): boolean {
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    if (raw === null) return true; // enabled by default
    return raw !== 'false';
  } catch {
    return true;
  }
}

interface AutosaveContextValue {
  enabled: boolean;
  toggle: () => void;
  recent: RecentDocument[];
  save: (doc: { id: string; mode: DocMode; content: string }) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const AutosaveContext = createContext<AutosaveContextValue>({
  enabled: true,
  toggle: () => {},
  recent: [],
  save: () => {},
  remove: () => {},
  clear: () => {},
});

export const useAutosaveContext = () => useContext(AutosaveContext);

export function AutosaveProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(loadEnabled);
  const [recent, setRecent] = useState<RecentDocument[]>(loadRecent);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(ENABLED_KEY, String(next));
      return next;
    });
  }, []);

  const save = useCallback((doc: { id: string; mode: DocMode; content: string }) => {
    setRecent((prev) => {
      const entry: RecentDocument = {
        id: doc.id,
        mode: doc.mode,
        title: deriveTitle(doc.content, doc.mode),
        content: doc.content,
        updatedAt: Date.now(),
      };
      const next = [entry, ...prev.filter((d) => d.id !== doc.id)].slice(0, MAX_DOCS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRecent((prev) => {
      const next = prev.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    localStorage.setItem(STORAGE_KEY, '[]');
  }, []);

  return (
    <AutosaveContext.Provider value={{ enabled, toggle, recent, save, remove, clear }}>
      {children}
    </AutosaveContext.Provider>
  );
}

/**
 * Hook used inside each tool app. Debounce-saves `content` under a stable id,
 * so reopening a recent document and editing it updates the same entry.
 */
export function useAutosave(mode: DocMode, content: string, documentId?: string) {
  const { enabled, save } = useAutosaveContext();
  const [docId] = useState(() => documentId ?? makeId());
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!enabled) return;
    const timer = setTimeout(() => {
      save({ id: docId, mode, content });
    }, 500);
    return () => clearTimeout(timer);
  }, [content, enabled, mode, save, docId]);
}
