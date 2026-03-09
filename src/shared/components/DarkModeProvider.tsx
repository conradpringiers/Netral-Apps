/**
 * Dark Mode Provider
 * Handles dark/light mode preference with first-launch prompt
 * Only affects GUI, not rendered content (sites/presentations/documents)
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface DarkModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  showPrompt: boolean;
}

const DarkModeContext = createContext<DarkModeContextType>({
  mode: 'light',
  setMode: () => {},
  showPrompt: false,
});

export const useDarkMode = () => useContext(DarkModeContext);

const STORAGE_KEY = 'netral-theme-mode';

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [showPrompt, setShowPrompt] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setModeState(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      setShowPrompt(true);
    }
    setInitialized(true);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    setShowPrompt(false);
  }, []);

  if (!initialized) return null;

  return (
    <DarkModeContext.Provider value={{ mode, setMode, showPrompt }}>
      {children}
    </DarkModeContext.Provider>
  );
}

/** First-launch dark mode prompt */
export function DarkModePrompt() {
  const { showPrompt, setMode } = useDarkMode();

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-2 text-center">Welcome to Netral</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Choose your preferred appearance</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('light')}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary bg-white text-slate-900 transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-2xl">
              ☀️
            </div>
            <span className="font-semibold text-sm">Light</span>
          </button>
          
          <button
            onClick={() => setMode('dark')}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary bg-slate-900 text-white transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-2xl">
              🌙
            </div>
            <span className="font-semibold text-sm">Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
