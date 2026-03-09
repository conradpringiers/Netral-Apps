/**
 * Netral Theme System
 * Defines all available themes for Netral Apps
 */

export type ThemeName = 
  | 'Modern'
  | 'Natural'
  | 'Latte'
  | 'Dark Mode'
  | 'Terminal'
  | 'Ocean'
  | 'Solarized'
  | 'Midnight'
  | 'Minimal'
  | 'Sunset'
  | 'Neon';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  warning: string;
  info: string;
  success: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  fontFamily: string;
  headingFontFamily: string;
  borderRadius: string;
  style?: 'light' | 'dark';
}

export const themes: Record<ThemeName, Theme> = {
  'Modern': {
    name: 'Modern',
    colors: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '210 40% 96%',
      secondaryForeground: '222 47% 11%',
      muted: '210 40% 96%',
      mutedForeground: '215 16% 47%',
      accent: '210 40% 96%',
      accentForeground: '222 47% 11%',
      border: '214 32% 91%',
      card: '0 0% 100%',
      cardForeground: '222 47% 11%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      success: '142 71% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.5rem',
    style: 'light',
  },
  'Natural': {
    name: 'Natural',
    colors: {
      background: '45 30% 96%',
      foreground: '30 25% 18%',
      primary: '152 55% 38%',
      primaryForeground: '0 0% 100%',
      secondary: '45 25% 90%',
      secondaryForeground: '30 25% 18%',
      muted: '45 20% 92%',
      mutedForeground: '30 15% 45%',
      accent: '35 70% 55%',
      accentForeground: '0 0% 100%',
      border: '45 20% 82%',
      card: '45 30% 98%',
      cardForeground: '30 25% 18%',
      warning: '38 92% 50%',
      info: '152 55% 38%',
      success: '152 60% 42%',
    },
    fontFamily: "'Lora', Georgia, serif",
    headingFontFamily: "'Playfair Display', Georgia, serif",
    borderRadius: '0.75rem',
    style: 'light',
  },
  'Latte': {
    name: 'Latte',
    colors: {
      background: '30 35% 95%',
      foreground: '25 30% 18%',
      primary: '25 65% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '35 30% 88%',
      secondaryForeground: '25 30% 18%',
      muted: '30 25% 90%',
      mutedForeground: '25 15% 48%',
      accent: '15 75% 52%',
      accentForeground: '0 0% 100%',
      border: '30 20% 82%',
      card: '30 35% 98%',
      cardForeground: '25 30% 18%',
      warning: '38 92% 50%',
      info: '25 65% 48%',
      success: '142 50% 45%',
    },
    fontFamily: "'EB Garamond', Georgia, serif",
    headingFontFamily: "'Cinzel', 'Times New Roman', serif",
    borderRadius: '0.25rem',
    style: 'light',
  },
  'Dark Mode': {
    name: 'Dark Mode',
    colors: {
      background: '224 20% 8%',
      foreground: '210 40% 96%',
      primary: '217 91% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '224 20% 14%',
      secondaryForeground: '210 40% 96%',
      muted: '224 20% 16%',
      mutedForeground: '215 20% 60%',
      accent: '224 20% 20%',
      accentForeground: '210 40% 96%',
      border: '224 20% 18%',
      card: '224 20% 10%',
      cardForeground: '210 40% 96%',
      warning: '45 93% 55%',
      info: '199 89% 55%',
      success: '142 71% 50%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFontFamily: "'Space Grotesk', system-ui, sans-serif",
    borderRadius: '0.5rem',
    style: 'dark',
  },
  'Terminal': {
    name: 'Terminal',
    colors: {
      background: '0 0% 4%',
      foreground: '120 100% 60%',
      primary: '120 100% 45%',
      primaryForeground: '0 0% 0%',
      secondary: '0 0% 10%',
      secondaryForeground: '120 100% 60%',
      muted: '0 0% 12%',
      mutedForeground: '120 50% 45%',
      accent: '120 100% 35%',
      accentForeground: '0 0% 0%',
      border: '120 50% 18%',
      card: '0 0% 6%',
      cardForeground: '120 100% 60%',
      warning: '60 100% 50%',
      info: '180 100% 50%',
      success: '120 100% 50%',
    },
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    headingFontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    borderRadius: '0',
    style: 'dark',
  },
  'Ocean': {
    name: 'Ocean',
    colors: {
      background: '200 45% 96%',
      foreground: '205 55% 15%',
      primary: '200 85% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '200 35% 90%',
      secondaryForeground: '205 55% 15%',
      muted: '200 30% 92%',
      mutedForeground: '205 25% 45%',
      accent: '175 70% 42%',
      accentForeground: '0 0% 100%',
      border: '200 25% 82%',
      card: '200 45% 98%',
      cardForeground: '205 55% 15%',
      warning: '38 92% 50%',
      info: '200 85% 48%',
      success: '160 65% 42%',
    },
    fontFamily: "'Crimson Text', Georgia, serif",
    headingFontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.75rem',
    style: 'light',
  },
  'Solarized': {
    name: 'Solarized',
    colors: {
      background: '44 87% 94%',
      foreground: '192 81% 14%',
      primary: '18 89% 55%',
      primaryForeground: '44 87% 94%',
      secondary: '44 50% 88%',
      secondaryForeground: '192 81% 14%',
      muted: '44 40% 90%',
      mutedForeground: '194 14% 40%',
      accent: '175 59% 40%',
      accentForeground: '44 87% 94%',
      border: '44 30% 80%',
      card: '44 87% 96%',
      cardForeground: '192 81% 14%',
      warning: '45 100% 35%',
      info: '175 59% 40%',
      success: '68 100% 30%',
    },
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    headingFontFamily: "'IBM Plex Serif', Georgia, serif",
    borderRadius: '0.375rem',
    style: 'light',
  },
  'Midnight': {
    name: 'Midnight',
    colors: {
      background: '240 25% 6%',
      foreground: '240 15% 92%',
      primary: '265 85% 58%',
      primaryForeground: '0 0% 100%',
      secondary: '240 20% 12%',
      secondaryForeground: '240 15% 92%',
      muted: '240 18% 15%',
      mutedForeground: '240 12% 58%',
      accent: '290 75% 52%',
      accentForeground: '0 0% 100%',
      border: '240 18% 18%',
      card: '240 25% 8%',
      cardForeground: '240 15% 92%',
      warning: '40 95% 55%',
      info: '265 85% 58%',
      success: '145 72% 48%',
    },
    fontFamily: "'DM Sans', system-ui, sans-serif",
    headingFontFamily: "'Outfit', system-ui, sans-serif",
    borderRadius: '0.75rem',
    style: 'dark',
  },
  'Minimal': {
    name: 'Minimal',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 8%',
      primary: '0 0% 8%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 8%',
      muted: '0 0% 95%',
      mutedForeground: '0 0% 42%',
      accent: '0 0% 88%',
      accentForeground: '0 0% 8%',
      border: '0 0% 88%',
      card: '0 0% 100%',
      cardForeground: '0 0% 8%',
      warning: '38 92% 50%',
      info: '0 0% 42%',
      success: '0 0% 28%',
    },
    fontFamily: "'Crimson Text', Georgia, serif",
    headingFontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0',
    style: 'light',
  },
  'Sunset': {
    name: 'Sunset',
    colors: {
      background: '25 40% 96%',
      foreground: '15 30% 15%',
      primary: '20 90% 52%',
      primaryForeground: '0 0% 100%',
      secondary: '35 45% 90%',
      secondaryForeground: '15 30% 15%',
      muted: '30 30% 92%',
      mutedForeground: '15 18% 42%',
      accent: '345 80% 55%',
      accentForeground: '0 0% 100%',
      border: '30 25% 82%',
      card: '25 40% 98%',
      cardForeground: '15 30% 15%',
      warning: '45 100% 52%',
      info: '20 90% 52%',
      success: '142 65% 42%',
    },
    fontFamily: "'Lora', Georgia, serif",
    headingFontFamily: "'Playfair Display', Georgia, serif",
    borderRadius: '0.75rem',
    style: 'light',
  },
  'Neon': {
    name: 'Neon',
    colors: {
      background: '275 20% 6%',
      foreground: '285 100% 92%',
      primary: '315 100% 58%',
      primaryForeground: '275 20% 6%',
      secondary: '275 25% 12%',
      secondaryForeground: '285 100% 92%',
      muted: '275 20% 15%',
      mutedForeground: '285 60% 68%',
      accent: '175 100% 48%',
      accentForeground: '275 20% 6%',
      border: '275 35% 22%',
      card: '275 20% 8%',
      cardForeground: '285 100% 92%',
      warning: '55 100% 50%',
      info: '175 100% 48%',
      success: '125 100% 50%',
    },
    fontFamily: "'Orbitron', system-ui, sans-serif",
    headingFontFamily: "'Audiowide', Impact, sans-serif",
    borderRadius: '0.5rem',
    style: 'dark',
  },
};

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes['Modern'];
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSS(theme: Theme): string {
  return `
    --background: ${theme.colors.background};
    --foreground: ${theme.colors.foreground};
    --primary: ${theme.colors.primary};
    --primary-foreground: ${theme.colors.primaryForeground};
    --secondary: ${theme.colors.secondary};
    --secondary-foreground: ${theme.colors.secondaryForeground};
    --muted: ${theme.colors.muted};
    --muted-foreground: ${theme.colors.mutedForeground};
    --accent: ${theme.colors.accent};
    --accent-foreground: ${theme.colors.accentForeground};
    --border: ${theme.colors.border};
    --card: ${theme.colors.card};
    --card-foreground: ${theme.colors.cardForeground};
    --warning: ${theme.colors.warning};
    --info: ${theme.colors.info};
    --success: ${theme.colors.success};
    --radius: ${theme.borderRadius};
    --font-family: ${theme.fontFamily};
    --heading-font-family: ${theme.headingFontFamily};
  `;
}

/**
 * Get Google Fonts import URL for all themes
 */
export function getGoogleFontsUrl(): string {
  return 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Audiowide&family=Bebas+Neue&family=Cinzel:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap';
}
