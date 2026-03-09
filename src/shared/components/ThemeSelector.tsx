/**
 * Theme Selector Component
 * Dropdown to select themes for Netral apps
 */

import { getThemeNames, ThemeName, getTheme } from '@/core/themes/themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themeNames = getThemeNames();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{currentTheme}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        {themeNames.map((themeName) => {
          const theme = getTheme(themeName);
          const isActive = themeName === currentTheme;
          
          return (
            <DropdownMenuItem
              key={themeName}
              onClick={() => onThemeChange(themeName)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex gap-0.5">
                <div
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: `hsl(${theme.colors.background})` }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: `hsl(${theme.colors.foreground})` }}
                />
              </div>
              <span className="flex-1">{themeName}</span>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSelector;
