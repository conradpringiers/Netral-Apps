/**
 * Document Parser
 * Parses Netral Doc syntax into structured document objects
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

export interface DocSection {
  title: string;
  level: 1 | 2; // 1 for ---, 2 for --
  content: string;
  callouts: DocCallout[];
}

export interface DocCallout {
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

export interface DocDocument {
  title: string;
  theme: string;
  sections: DocSection[];
}

/**
 * Parse a document from Netral Doc syntax
 */
export function parseDocDocument(input: string): DocDocument {
  const lines = input.split('\n');
  
  let title = 'Untitled Document';
  let theme = 'Modern';
  const sections: DocSection[] = [];
  
  let currentSection: DocSection | null = null;
  let contentBuffer: string[] = [];
  
  const flushSection = () => {
    if (currentSection) {
      const { processedContent, callouts } = processCallouts(contentBuffer.join('\n').trim());
      currentSection.content = processedContent;
      currentSection.callouts = callouts;
      sections.push(currentSection);
      contentBuffer = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Document title (--- Title)
    const docTitleMatch = line.match(/^---\s+(.+)$/);
    if (docTitleMatch && sections.length === 0 && !currentSection) {
      title = docTitleMatch[1].trim();
      continue;
    }
    
    // Theme declaration
    const themeMatch = line.match(/^Theme\[(.+)\]$/i);
    if (themeMatch) {
      theme = themeMatch[1].trim();
      continue;
    }
    
    // Main section (--- Section Title)
    const mainSectionMatch = line.match(/^---\s+(.+)$/);
    if (mainSectionMatch) {
      flushSection();
      currentSection = {
        title: mainSectionMatch[1].trim(),
        level: 1,
        content: '',
        callouts: [],
      };
      continue;
    }
    
    // Sub-section (-- Sub Section Title)
    const subSectionMatch = line.match(/^--\s+(.+)$/);
    if (subSectionMatch) {
      flushSection();
      currentSection = {
        title: subSectionMatch[1].trim(),
        level: 2,
        content: '',
        callouts: [],
      };
      continue;
    }
    
    // Regular content
    contentBuffer.push(line);
  }
  
  // Flush last section
  flushSection();
  
  // If no sections but content exists, create a default section
  if (sections.length === 0 && contentBuffer.length > 0) {
    const { processedContent, callouts } = processCallouts(contentBuffer.join('\n').trim());
    sections.push({
      title: '',
      level: 1,
      content: processedContent,
      callouts,
    });
  }
  
  return { title, theme, sections };
}

/**
 * Render markdown content to HTML
 */
export function renderDocContent(markdown: string): string {
  if (!markdown) return '';
  
  const rawHtml = marked.parse(markdown) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'rel', 'loading', 'class'],
  });
}

/**
 * Process callouts from content and return remaining content + callouts
 */
function processCallouts(content: string): { processedContent: string; callouts: DocCallout[] } {
  const callouts: DocCallout[] = [];
  
  // Match Callout[type;message] pattern
  const calloutRegex = /Callout\[(info|warning|success|error);([^\]]+)\]/gi;
  let processedContent = content;
  let match;
  
  while ((match = calloutRegex.exec(content)) !== null) {
    callouts.push({
      type: match[1].toLowerCase() as DocCallout['type'],
      message: match[2].trim(),
    });
  }
  
  // Remove callout blocks from content
  processedContent = processedContent.replace(calloutRegex, '').trim();
  
  return { processedContent, callouts };
}

/**
 * Get default document content
 */
export function getDefaultDocContent(): string {
  return `--- Mon Document
Theme[Modern]

--- Introduction

Bienvenue dans **Netral Doc**, l'outil de création de documents simples et élégants.

Tapez le nom d'un élément et appuyez sur Tab pour l'insérer automatiquement.

--- Fonctionnalités

-- Formatage de texte

Netral Doc supporte le formatage Markdown standard :

- **Gras** avec \`**texte**\`
- *Italique* avec \`*texte*\`
- \`Code inline\` avec des backticks
- [Liens](https://example.com) avec \`[texte](url)\`

-- Listes

Créez facilement des listes à puces :

- Premier élément
- Deuxième élément
- Troisième élément

Ou des listes numérotées :

1. Première étape
2. Deuxième étape
3. Troisième étape

-- Citations

> "La simplicité est la sophistication ultime."
> — Leonardo da Vinci

-- Code

Insérez des blocs de code avec coloration syntaxique :

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

--- Tableaux

| Fonctionnalité | Description |
|----------------|-------------|
| Sections | Organisez votre contenu |
| Thèmes | Personnalisez l'apparence |
| Export PDF | Partagez vos documents |

--- Conclusion

Netral Doc vous permet de créer des documents professionnels en quelques minutes.

> **Note:** Exportez votre document en PDF en cliquant sur le bouton Export.
`;
}
