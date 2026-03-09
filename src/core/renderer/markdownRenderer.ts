/**
 * Markdown Renderer
 * Handles parsing and rendering of Markdown with Netral extensions
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { preprocessNetralMarkdown } from '../parser/netralExtensions';

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

// Configure DOMPurify to allow our custom classes
const purifyConfig = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['target', 'rel', 'loading', 'class'],
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'strong', 'em', 'del', 's',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'input', // For checkboxes
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title',
    'class', 'id',
    'target', 'rel',
    'loading',
    'type', 'checked', 'disabled',
    'colspan', 'rowspan',
  ],
};

/**
 * Render Markdown to sanitized HTML
 * Processes Netral extensions first, then standard Markdown
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  try {
    // Step 1: Preprocess Netral extensions
    const preprocessed = preprocessNetralMarkdown(markdown);

    // Step 2: Parse with marked
    const rawHtml = marked.parse(preprocessed) as string;

    // Step 3: Sanitize with DOMPurify
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, purifyConfig);

    return sanitizedHtml;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<p class="text-destructive">Error rendering markdown</p>`;
  }
}

/**
 * Render Markdown synchronously (for real-time preview)
 */
export function renderMarkdownSync(markdown: string): string {
  return renderMarkdown(markdown);
}

/**
 * Extract plain text from Markdown (for search/preview)
 */
export function extractText(markdown: string): string {
  const html = renderMarkdown(markdown);
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Get word count from Markdown
 */
export function getWordCount(markdown: string): number {
  const text = extractText(markdown);
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[0] !== '' ? words.length : 0;
}

/**
 * Get character count from Markdown
 */
export function getCharCount(markdown: string): number {
  return markdown.length;
}
