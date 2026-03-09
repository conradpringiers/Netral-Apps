/**
 * Netral Deck Parser
 * Parses presentation syntax into structured slide data
 */

import { ThemeName } from '../themes/themes';

export interface SlideContent {
  type: 'text' | 'markdown' | 'column' | 'feature' | 'image' | 'warn' | 'def' | 'quote' | 'stats' | 'bigtitle' | 'timeline' | 'list' | 'video' | 'code' | 'badge' | 'gallery' | 'progress' | 'graph' | 'comparison' | 'agenda' | 'background' | 'speaker';
  content: string;
  props?: Record<string, any>;
}

export interface Slide {
  title: string;
  content: SlideContent[];
  background?: string;
  notes?: string;
}

export interface DeckDocument {
  title: string;
  theme: ThemeName;
  /** Optional logo shown on all slides */
  logo?: string;
  slides: Slide[];
}

/**
 * Parse a Netral Deck document
 */
export function parseDeckDocument(input: string): DeckDocument {
  const lines = input.split('\n');

  let title = 'Présentation';
  let theme: ThemeName = 'Modern';
  let logo: string | undefined;
  const slides: Slide[] = [];

  let currentSlide: Slide | null = null;
  let contentBuffer: string[] = [];

  const flushContent = () => {
    if (currentSlide && contentBuffer.length > 0) {
      const rawContent = contentBuffer.join('\n').trim();
      if (rawContent) {
        const parsedContent = parseSlideContent(rawContent);
        currentSlide.content.push(...parsedContent);
      }
      contentBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Document title: --- Title
    if (trimmedLine.startsWith('---')) {
      title = trimmedLine.replace(/^---\s*/, '').trim() || 'Présentation';
      continue;
    }

    // Logo: Logo[Text or URL]
    const logoMatch = trimmedLine.match(/^Logo\[([\s\S]+)\]$/);
    if (logoMatch && !currentSlide) {
      logo = logoMatch[1].trim();
      continue;
    }

    // Theme: Theme[Name]
    const themeMatch = trimmedLine.match(/^Theme\[([^\]]+)\]$/);
    if (themeMatch) {
      theme = themeMatch[1] as ThemeName;
      continue;
    }

    // Slide title: -- Slide Title
    if (trimmedLine.startsWith('--') && !trimmedLine.startsWith('---')) {
      flushContent();
      if (currentSlide) {
        slides.push(currentSlide);
      }
      currentSlide = {
        title: trimmedLine.replace(/^--\s*/, '').trim(),
        content: [],
        background: undefined,
      };
      continue;
    }

    // Background for current slide: Background[URL]
    const bgMatch = trimmedLine.match(/^Background\[([^\]]+)\]$/i);
    if (bgMatch && currentSlide) {
      currentSlide.background = bgMatch[1].trim();
      continue;
    }

    // Notes for current slide: Notes[...]
    const notesMatch = trimmedLine.match(/^Notes\[([^\]]*)\]$/i);
    if (notesMatch && currentSlide) {
      currentSlide.notes = (currentSlide.notes ? currentSlide.notes + '\n' : '') + notesMatch[1].trim();
      continue;
    }

    // Add line to content buffer if we're in a slide
    if (currentSlide) {
      contentBuffer.push(line);
    }
  }

  // Flush remaining content
  flushContent();
  if (currentSlide) {
    slides.push(currentSlide);
  }

  return { title, theme, logo, slides };
}

/**
 * Parse slide content into structured elements
 */
function parseSlideContent(content: string): SlideContent[] {
  const elements: SlideContent[] = [];
  let remaining = content;
  
  // Pattern to match block elements - Column needs special handling for nested braces
  const blockPatterns = [
    { type: 'feature', pattern: /Feature\[([\s\S]*?)\]/g },
    { type: 'stats', pattern: /Stats\[([\s\S]*?)\]/g },
    { type: 'image', pattern: /Image\[([^\]]+)\]/g },
    { type: 'warn', pattern: /Warn\[([^\]]+)\]/g },
    { type: 'def', pattern: /Def\[([^\]]+)\]/g },
    { type: 'quote', pattern: /quote\[([^\]]+)\]/g },
    { type: 'bigtitle', pattern: /Bigtitle\[([^\]]+)\]/g },
    { type: 'timeline', pattern: /Timeline\[([\s\S]*?)\]/g },
    { type: 'list', pattern: /List\[([\s\S]*?)\]/g },
    { type: 'video', pattern: /Video\[([^\]]+)\]/g },
    { type: 'code', pattern: /Code\[([^;]+);([\s\S]*?)\]/g, hasLang: true },
    { type: 'badge', pattern: /Badge\[([^\]]+)\]/g },
    { type: 'gallery', pattern: /Gallery\[([\s\S]*?)\]/g },
    { type: 'progress', pattern: /Progress\[([^\]]+)\]/g },
    { type: 'graph', pattern: /Graph\[([\s\S]*?)\]/g },
    { type: 'comparison', pattern: /Comparison\[([\s\S]*?)\]/g },
    { type: 'agenda', pattern: /Agenda\[([\s\S]*?)\]/g },
    { type: 'speaker', pattern: /Speaker\[([^\]]+)\]/g },
  ];
  
  // Handle Column separately with balanced bracket matching
  const columnMatches = findColumnBlocks(content);
  
  // Find all matches and their positions
  interface Match {
    type: string;
    content: string;
    start: number;
    end: number;
    props?: Record<string, any>;
  }
  
  const matches: Match[] = [];
  
  // Add column matches first
  for (const colMatch of columnMatches) {
    matches.push({
      type: 'column',
      content: colMatch.content,
      start: colMatch.start,
      end: colMatch.end,
      // Each column is parsed like normal slide content, so it can include Image[], Warn[], etc.
      props: { columns: parseColumnContent(colMatch.content) },
    });
  }
  
  for (const { type, pattern, hasLang } of blockPatterns as Array<{ type: string; pattern: RegExp; hasLang?: boolean }>) {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Skip if this match overlaps with a column block
      const overlapsColumn = columnMatches.some(
        col => match!.index >= col.start && match!.index < col.end
      );
      if (overlapsColumn) continue;

      const matchData: Match = {
        type,
        content: hasLang ? match[2] : match[1],
        start: match.index,
        end: match.index + match[0].length,
      };

      // Parse specific content types
      if (type === 'feature') {
        matchData.props = { items: parseFeatureItems(match[1]) };
      } else if (type === 'stats') {
        matchData.props = { items: parseStatsItems(match[1]) };
      } else if (type === 'timeline') {
        matchData.props = { items: parseTimelineItems(match[1]) };
      } else if (type === 'list') {
        matchData.props = { items: parseListItems(match[1]) };
      } else if (type === 'code') {
        matchData.props = { lang: match[1].trim() };
      } else if (type === 'gallery') {
        matchData.props = { items: parseGalleryItems(match[1]) };
      } else if (type === 'progress') {
        matchData.props = parseProgressContent(match[1]);
      } else if (type === 'graph') {
        matchData.props = { nodes: parseGraphNodes(match[1]) };
      } else if (type === 'comparison') {
        matchData.props = { items: parseComparisonItems(match[1]) };
      } else if (type === 'agenda') {
        matchData.props = { items: parseAgendaItems(match[1]) };
      } else if (type === 'speaker') {
        const parts = match[1].split(';').map((s: string) => s.trim());
        matchData.props = {
          quote: parts[0] || '',
          name: parts[1] || '',
          role: parts[2] || '',
          photo: parts[3] || '',
        };
      }

      matches.push(matchData);
    }
  }
  
  // Sort by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build elements array with text between blocks
  let lastEnd = 0;
  for (const match of matches) {
    // Add text before this match
    if (match.start > lastEnd) {
      const textContent = content.slice(lastEnd, match.start).trim();
      if (textContent) {
        elements.push({ type: 'markdown', content: textContent });
      }
    }
    
    elements.push({
      type: match.type as SlideContent['type'],
      content: match.content,
      props: match.props,
    });
    
    lastEnd = match.end;
  }
  
  // Add remaining text
  if (lastEnd < content.length) {
    const textContent = content.slice(lastEnd).trim();
    if (textContent) {
      elements.push({ type: 'markdown', content: textContent });
    }
  }
  
  return elements;
}

function parseColumnContent(content: string): SlideContent[][] {
  const columns: SlideContent[][] = [];

  // Extract top-level { ... } blocks (supports nested braces inside)
  let depth = 0;
  let current = '';
  let inColumn = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '{') {
      if (depth === 0) {
        inColumn = true;
        current = '';
      } else {
        current += char;
      }
      depth++;
      continue;
    }

    if (char === '}') {
      depth--;
      if (depth === 0 && inColumn) {
        const raw = current.trim();
        columns.push(raw ? parseSlideContent(raw) : []);
        inColumn = false;
        continue;
      }
      // nested closing brace
      if (inColumn) current += char;
      continue;
    }

    if (inColumn) current += char;
  }

  return columns;
}

function parseFeatureItems(content: string): { icon: string; title: string; description: string }[] {
  const items: { icon: string; title: string; description: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      icon: match[1].trim(),
      title: match[2].trim(),
      description: match[3].trim(),
    });
  }
  return items;
}

function parseStatsItems(content: string): { value: string; label: string }[] {
  const items: { value: string; label: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      value: match[1].trim(),
      label: match[2].trim(),
    });
  }
  return items;
}

// Find Column blocks with balanced bracket matching
function findColumnBlocks(content: string): { content: string; start: number; end: number }[] {
  const results: { content: string; start: number; end: number }[] = [];
  const columnStart = /Column\[/g;
  let match;
  
  while ((match = columnStart.exec(content)) !== null) {
    const startIndex = match.index;
    const contentStart = startIndex + 7; // "Column[".length
    let depth = 1;
    let i = contentStart;
    
    while (i < content.length && depth > 0) {
      if (content[i] === '[') depth++;
      else if (content[i] === ']') depth--;
      i++;
    }
    
    if (depth === 0) {
      results.push({
        content: content.slice(contentStart, i - 1),
        start: startIndex,
        end: i,
      });
    }
  }
  
  return results;
}

function parseTimelineItems(content: string): { year: string; title: string; description: string }[] {
  const items: { year: string; title: string; description: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      year: match[1].trim(),
      title: match[2].trim(),
      description: match[3].trim(),
    });
  }
  return items;
}

function parseListItems(content: string): { icon: string; text: string }[] {
  const items: { icon: string; text: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      icon: match[1].trim(),
      text: match[2].trim(),
    });
  }
  return items;
}

function parseGalleryItems(content: string): { url: string; caption: string }[] {
  const items: { url: string; caption: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      url: match[1].trim(),
      caption: match[2].trim(),
    });
  }
  return items;
}

function parseProgressContent(content: string): { value: number; label?: string } {
  const parts = content.split(';').map(s => s.trim());
  const value = parseInt(parts[0], 10) || 0;
  const label = parts[1] || undefined;
  return { value: Math.min(100, Math.max(0, value)), label };
}

function parseGraphNodes(content: string): { id: string; label: string; connections: string[] }[] {
  const nodes: { id: string; label: string; connections: string[] }[] = [];
  // Format: {id;label;->target1,target2}
  const matches = content.matchAll(/\{([^;]+);([^;]+)(?:;->([^}]*))?\}/g);
  for (const match of matches) {
    nodes.push({
      id: match[1].trim(),
      label: match[2].trim(),
      connections: match[3] ? match[3].split(',').map(s => s.trim()) : [],
    });
  }
  return nodes;
}

function parseComparisonItems(content: string): { title: string; items: string[] }[] {
  const results: { title: string; items: string[] }[] = [];
  // Format: {Title;item1;item2;...}
  const matches = content.matchAll(/\{([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    const title = match[1].trim();
    const items = match[2].split(';').map(s => s.trim());
    results.push({ title, items });
  }
  return results;
}

function parseAgendaItems(content: string): { number: string; title: string; duration: string }[] {
  const items: { number: string; title: string; duration: string }[] = [];
  // Format: {number;title;duration}
  const matches = content.matchAll(/\{([^;]+);([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      number: match[1].trim(),
      title: match[2].trim(),
      duration: match[3].trim(),
    });
  }
  return items;
}

/**
 * Get default Deck content
 */
export function getDefaultDeckContent(): string {
  return `--- My Presentation
Theme[Modern]
-- Introduction
Bigtitle[Welcome to my presentation]

This presentation was created with **Netral Deck**.

-- Features

Feature[
{🚀;Fast;Create slides in minutes}
{🎨;Themes;9 professional themes available}
{📱;Responsive;Adapts to all screens}
]

-- Statistics

Stats[
{100+;Users}
{50K;Presentations}
{99%;Satisfaction}
]

-- Columns

Column[
{
## Left side
Some text with **bold**
- Point 1
- Point 2
}
{
## Right side
Image and complementary content
}
]

-- Timeline

Timeline[
{2020;Launch;Netral Deck was born}
{2022;Growth;Over 10K users}
{2024;Today;Global adoption}
]

-- Checklist

List[
{✅;Easy to use syntax}
{✅;Beautiful themes}
{✅;Export to HTML}
{🔜;More features coming}
]

-- Warning

Warn[Don't forget to save your work!]

Def[Netral Deck uses a simple syntax to create elegant presentations.]

-- Conclusion

quote[Simplicity is the ultimate sophistication. - Leonardo da Vinci]

Thank you for your attention!
`;
}
