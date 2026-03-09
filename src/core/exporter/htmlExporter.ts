/**
 * HTML Exporter
 * Exports Netral content to standalone HTML files using ReactDOMServer
 * This ensures PIXEL-PERFECT consistency with the preview
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { StaticNetralRenderer } from '../renderer/StaticNetralRenderer';
import { parseNetralDocument } from '../parser/netralParser';
import { getTheme, generateThemeCSS, getGoogleFontsUrl } from '../themes/themes';

/**
 * Generate comprehensive CSS that matches Tailwind classes used in components
 */
function generateTailwindCSS(): string {
  return `
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* Base */
    html { scroll-behavior: smooth; }
    body { line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; }
    img, video { max-width: 100%; height: auto; display: block; }
    a { text-decoration: none; color: inherit; }
    button { font: inherit; cursor: pointer; }
    
    /* Layout utilities */
    .min-h-full { min-height: 100%; }
    .h-full { height: 100%; }
    .w-full { width: 100%; }
    .h-auto { height: auto; }
    .max-w-xs { max-width: 20rem; }
    .max-w-sm { max-width: 24rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-5xl { max-width: 64rem; }
    .max-w-6xl { max-width: 72rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    
    /* Flexbox */
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .flex-wrap { flex-wrap: wrap; }
    .flex-col { flex-direction: column; }
    .flex-shrink-0 { flex-shrink: 0; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-12 { gap: 3rem; }
    
    /* Grid */
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    
    /* Spacing */
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-5 { padding: 1.25rem; }
    .p-6 { padding: 1.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-12 { margin-top: 3rem; }
    .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
    .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
    .my-12 { margin-top: 3rem; margin-bottom: 3rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    
    /* Typography */
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1.1; }
    .text-6xl { font-size: 3.75rem; line-height: 1; }
    .text-7xl { font-size: 4.5rem; line-height: 1; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }
    .leading-tight { line-height: 1.25; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-white { color: white; }
    
    /* Borders & Radius */
    .border { border-width: 1px; border-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-l-4 { border-left-width: 4px; border-left-style: solid; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
    .overflow-hidden { overflow: hidden; }
    
    /* Shadows */
    .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
    
    /* Sizing */
    .h-3 { height: 0.75rem; }
    .w-3 { width: 0.75rem; }
    .h-4 { height: 1rem; }
    .w-4 { width: 1rem; }
    .h-5 { height: 1.25rem; }
    .w-5 { width: 1.25rem; }
    .h-6 { height: 1.5rem; }
    .w-6 { width: 1.5rem; }
    .h-8 { height: 2rem; }
    .w-8 { width: 2rem; }
    .h-12 { height: 3rem; }
    .w-12 { width: 3rem; }
    .h-24 { height: 6rem; }
    .w-24 { width: 6rem; }
    .h-48 { height: 12rem; }
    .h-96 { height: 24rem; }
    .w-0\\.5 { width: 0.125rem; }
    
    /* Position */
    .relative { position: relative; }
    .absolute { position: absolute; }
    .fixed { position: fixed; }
    .sticky { position: sticky; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .top-0 { top: 0; }
    .bottom-0 { bottom: 0; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }
    .left-4 { left: 1rem; }
    .z-10 { z-index: 10; }
    .z-99 { z-index: 99; }
    .z-100 { z-index: 100; }
    
    /* Transform */
    .transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)); }
    .-translate-x-1\\/2 { transform: translateX(-50%); }
    
    /* Display */
    .hidden { display: none; }
    .block { display: block; }
    .inline-block { display: inline-block; }
    
    /* Transitions */
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    
    /* Opacity */
    .opacity-0 { opacity: 0; }
    .opacity-60 { opacity: 0.6; }
    .opacity-100 { opacity: 1; }
    
    /* Fill */
    .fill-current { fill: currentColor; }
    
    /* Object */
    .object-cover { object-fit: cover; }
    
    /* Cursor */
    .cursor-pointer { cursor: pointer; }
    
    /* Ring */
    .ring-2 { box-shadow: 0 0 0 2px var(--ring-color, hsl(var(--primary) / 0.3)); }
    .ring-4 { box-shadow: 0 0 0 4px var(--ring-color, hsl(var(--primary) / 0.2)); }
    .ring-primary\\/20 { --ring-color: hsl(var(--primary) / 0.2); }
    .ring-primary\\/30 { --ring-color: hsl(var(--primary) / 0.3); }
    .ring-background { --ring-color: hsl(var(--background)); }
    
    /* Background */
    .bg-primary { background-color: hsl(var(--primary)); }
    .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
    .from-black\\/70 { --tw-gradient-from: rgb(0 0 0 / 0.7); --tw-gradient-stops: var(--tw-gradient-from), transparent; }
    .to-transparent { --tw-gradient-to: transparent; }
    
    /* Width calculations */
    .w-\\[calc\\(50\\%-8px\\)\\] { width: calc(50% - 8px); }
    .w-\\[calc\\(50\\%-12px\\)\\] { width: calc(50% - 12px); }
    
    /* Min height */
    .min-h-\\[60vh\\] { min-height: 60vh; }
    .min-h-\\[70vh\\] { min-height: 70vh; }
    
    /* Order */
    .order-first { order: -9999; }
    
    /* Group hover */
    .group { position: relative; }
    .group:hover .group-hover\\:scale-110 { transform: scale(1.1); }
    .group:hover .group-hover\\:opacity-100 { opacity: 1; }

    /* Aspect ratio */
    .aspect-square { aspect-ratio: 1 / 1; }

    /* Grid cols 2 */
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    /* Additional spacing */
    .p-8 { padding: 2rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .my-10 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
    .last\\:mb-0:last-child { margin-bottom: 0; }

    /* Sizing additions */
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
    .h-3 { height: 0.75rem; }
    .w-3 { width: 0.75rem; }

    /* Flex column justify */
    .justify-center { justify-content: center; }

    /* Responsive - sm (640px) */
    @media (min-width: 640px) {
      .sm\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .sm\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .sm\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
      .sm\\:p-6 { padding: 1.5rem; }
      .sm\\:p-8 { padding: 2rem; }
      .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .sm\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
      .sm\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
      .sm\\:gap-6 { gap: 1.5rem; }
      .sm\\:block { display: block; }
      .sm\\:text-right { text-align: right; }
      .sm\\:pl-0 { padding-left: 0; }
      .sm\\:left-1\\/2 { left: 50%; }
      .sm\\:-translate-x-1\\/2 { transform: translateX(-50%); }
      .sm\\:flex-row-reverse { flex-direction: row-reverse; }
      .sm\\:w-\\[calc\\(33\\.333\\%-11px\\)\\] { width: calc(33.333% - 11px); }
      .sm\\:w-\\[calc\\(33\\.333\\%-16px\\)\\] { width: calc(33.333% - 16px); }
      .sm\\:w-\\[calc\\(50\\%-12px\\)\\] { width: calc(50% - 12px); }
    }
    
    /* Responsive - md (768px) */
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:hidden { display: none; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .md\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
      .md\\:text-5xl { font-size: 3rem; line-height: 1.1; }
      .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .md\\:text-7xl { font-size: 4.5rem; line-height: 1; }
      .md\\:p-8 { padding: 2rem; }
      .md\\:p-12 { padding: 3rem; }
      .md\\:order-last { order: 9999; }
      .md\\:aspect-auto { aspect-ratio: auto; }
    }
    
    /* Responsive - lg (1024px) */
    @media (min-width: 1024px) {
      .lg\\:w-\\[calc\\(25\\%-18px\\)\\] { width: calc(25% - 18px); }
      .lg\\:w-\\[calc\\(33\\.333\\%-16px\\)\\] { width: calc(33.333% - 16px); }
    }
  `;
}

/**
 * Generate a complete HTML document from Netral syntax
 * Uses the EXACT SAME React components as the preview for pixel-perfect consistency
 */
export function exportToHtml(content: string, title: string = 'Netral Document'): string {
  const doc = parseNetralDocument(content);
  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  const tailwindCSS = generateTailwindCSS();

  // Render the React component to static HTML
  const renderedContent = renderToStaticMarkup(
    createElement(StaticNetralRenderer, { content })
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Netral Block">
  <title>${escapeHtml(doc.title || title)}</title>
  <link href="${getGoogleFontsUrl()}" rel="stylesheet">
  <style>
    ${tailwindCSS}
    
    /* Theme variables */
    :root {
      ${themeCSS}
    }
    
    body {
      font-family: ${theme.fontFamily};
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    
    /* Netral render styles */
    .netral-render {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    .netral-render * {
      border-color: hsl(var(--border));
    }
    
    /* Prose content */
    .netral-render .prose-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
    .netral-render .prose-content h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
    .netral-render .prose-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); font-family: var(--heading-font-family); }
    .netral-render .prose-content p { margin-bottom: 1rem; color: hsl(var(--foreground)); line-height: 1.7; }
    .netral-render .prose-content a { color: hsl(var(--primary)); text-decoration: underline; transition: opacity 0.2s; }
    .netral-render .prose-content a:hover { opacity: 0.8; }
    .netral-render .prose-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
    .netral-render .prose-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
    .netral-render .prose-content ul, .netral-render .prose-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .netral-render .prose-content li { margin-bottom: 0.25rem; color: hsl(var(--foreground)); }
    .netral-render .prose-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
    .netral-render .prose-content strong { font-weight: 600; }
    .netral-render .prose-content em { font-style: italic; }
    
    /* Card hover effects */
    .netral-render .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .netral-render .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px -12px hsl(var(--primary) / 0.3);
    }
    
    /* Button hover effects */
    .netral-render .btn-primary {
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      transition: all 0.2s ease;
    }
    .netral-render .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.5);
    }
    
    /* Modern floating navbar */
    .netral-render .floating-nav {
      position: sticky;
      top: 1rem;
      z-index: 100;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      background: hsl(var(--background) / 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid hsl(var(--border) / 0.5);
      box-shadow: 0 8px 32px -8px hsl(var(--foreground) / 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      max-width: fit-content;
      margin: 1rem auto 0;
    }
    
    /* Navbar link effects - animated pill hover */
    .netral-render .nav-link {
      position: relative;
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
      transition: color 0.25s ease;
      white-space: nowrap;
      text-decoration: none;
      z-index: 1;
    }
    .netral-render .nav-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: hsl(var(--primary) / 0.08);
      border-radius: 0.5rem;
      transform: scale(0.85);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: -1;
    }
    .netral-render .nav-link::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 25%;
      width: 50%;
      height: 2.5px;
      background: hsl(var(--primary));
      border-radius: 2px;
      transform: scaleX(0);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
    }
    .netral-render .nav-link:hover::before {
      transform: scale(1);
      opacity: 1;
    }
    .netral-render .nav-link:hover::after {
      transform: scaleX(1);
    }
    .netral-render .nav-link:hover {
      color: hsl(var(--primary));
    }
    
    /* Mobile menu */
    .netral-render .mobile-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
      background: hsl(var(--background) / 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
    }
    body.menu-open .netral-render .mobile-menu { display: flex; }
    .netral-render .mobile-menu a {
      font-size: 1.5rem;
      font-weight: 600;
      color: hsl(var(--foreground));
      text-decoration: none;
      transition: color 0.2s;
    }
    .netral-render .mobile-menu a:hover {
      color: hsl(var(--primary));
    }
    .netral-render .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: hsl(var(--muted-foreground));
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 9999px;
    }
    .netral-render .mobile-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: hsl(var(--foreground));
      cursor: pointer;
      padding: 0.5rem;
    }
    @media (max-width: 768px) {
      .netral-render .nav-links-desktop { display: none !important; }
      .netral-render .mobile-toggle { display: block; }
    }
    
    /* FAQ accordion styling */
    .netral-render .faq-item summary { list-style: none; }
    .netral-render .faq-item summary::-webkit-details-marker { display: none; }
    .netral-render .faq-item[open] summary { background-color: hsl(var(--secondary)); }
    .netral-render .faq-item[open] .faq-chevron { transform: rotate(180deg); }
  </style>
</head>
<body>
${renderedContent}
<script>
// Mobile menu toggle
document.querySelectorAll('.mobile-toggle').forEach(btn => {
  btn.addEventListener('click', () => document.body.classList.toggle('menu-open'));
});
document.querySelectorAll('.mobile-close').forEach(btn => {
  btn.addEventListener('click', () => document.body.classList.remove('menu-open'));
});
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => document.body.classList.remove('menu-open'));
});
</script>
</body>
</html>`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Download a file with the given content
 */
export function downloadHtml(content: string, filename: string): void {
  const html = exportToHtml(content, filename.replace('.html', ''));
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Copy HTML to clipboard
 */
export async function copyHtmlToClipboard(content: string): Promise<boolean> {
  try {
    const html = exportToHtml(content, 'Netral Document');
    await navigator.clipboard.writeText(html);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
