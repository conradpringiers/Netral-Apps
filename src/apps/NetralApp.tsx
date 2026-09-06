/**
 * Netral Main Application
 * Handles mode switching between Block, Deck, Doc and Launcher
 * Also handles shared links (?mode=X&c=compressed) and presenter popup (?view=presenter)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Launcher, NetralMode } from './launcher/Launcher';
import { BlockApp } from './block/BlockApp';
import { DeckApp } from './deck/DeckApp';
import { DocApp } from './doc/DocApp';
import { CalusApp } from './calus/CalusApp';
import { LuateApp } from './luate/LuateApp';
import { PresenterPopup } from '@/core/renderer/PresenterPopup';
import { NetralRenderer } from '@/core/renderer/NetralRenderer';
import { StudentExamView } from './luate/StudentExamView';
import { decompressFromEncodedURIComponent } from 'lz-string';

export function NetralApp() {
  const [examContent, setExamContent] = useState<string | null>(null);
  const [mode, setMode] = useState<NetralMode>(null);
  const [initialContent, setInitialContent] = useState<string | undefined>();
  const [isPresenterPopup, setIsPresenterPopup] = useState(false);
  const [siteContent, setSiteContent] = useState<string | null>(null);

  // Handle URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for presenter popup
    if (params.get('view') === 'presenter') {
      setIsPresenterPopup(true);
      return;
    }

    // Check for direct web page (site rendered without the editor)
    if (params.get('view') === 'site') {
      const siteCompressed = params.get('c');
      if (siteCompressed) {
        const content = decompressFromEncodedURIComponent(siteCompressed);
        if (content) {
          setSiteContent(content);
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
      }
    }

    // Check for exam mode (student link)
    const sharedMode = params.get('mode');
    const compressed = params.get('c');
    if (sharedMode === 'exam' && compressed) {
      const content = decompressFromEncodedURIComponent(compressed);
      if (content) {
        setExamContent(content);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
    }

    // Check for shared link
    if (sharedMode && compressed) {
      const content = decompressFromEncodedURIComponent(compressed);
      if (content) {
        setMode(sharedMode as NetralMode);
        setInitialContent(content);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleSelectMode = useCallback((selectedMode: NetralMode, content?: string) => {
    setMode(selectedMode);
    setInitialContent(content);
  }, []);

  const handleBack = useCallback(() => {
    setMode(null);
    setInitialContent(undefined);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInitialContent(text);
        if (file.name.endsWith('.netdeck')) setMode('deck');
        else if (file.name.endsWith('.netdoc')) setMode('doc');
        else if (file.name.endsWith('.netcalus')) setMode('calus');
        else if (file.name.endsWith('.netluate')) setMode('luate');
        else if (file.name.endsWith('.netblock')) setMode('block');
        else setMode('block');
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  // Student exam mode
  if (examContent) {
    return <StudentExamView content={examContent} />;
  }

  // Presenter popup mode - standalone
  if (isPresenterPopup) {
    return <PresenterPopup />;
  }

  // Direct web page - standalone rendered site
  if (siteContent) {
    return (
      <div className="min-h-screen">
        <NetralRenderer content={siteContent} />
      </div>
    );
  }

  if (mode === 'block') return <BlockApp initialContent={initialContent} onBack={handleBack} />;
  if (mode === 'deck') return <DeckApp initialContent={initialContent} onBack={handleBack} />;
  if (mode === 'doc') return <DocApp initialContent={initialContent} onBack={handleBack} />;
  if (mode === 'calus') return <CalusApp initialContent={initialContent} onBack={handleBack} />;
  if (mode === 'luate') return <LuateApp initialContent={initialContent} onBack={handleBack} />;

  return (
    <div onDrop={handleFileDrop} onDragOver={handleDragOver} className="h-screen">
      <Launcher onSelectMode={handleSelectMode} />
    </div>
  );
}

export default NetralApp;
