/**
 * Netral Markdown Extensions
 * Custom syntax extensions for the Netral Markdown format
 */

export interface NetralToken {
  type: string;
  raw: string;
  content?: string;
  props?: Record<string, string>;
}

/**
 * Parse a Netral token from the raw string
 * Supports: {button}, {block}, {gallery}
 */
export function parseNetralToken(raw: string): NetralToken | null {
  // Button syntax: {button label:"Click me" url:"https://..."}
  const buttonMatch = raw.match(/\{button\s+label:"([^"]+)"\s+url:"([^"]+)"\}/);
  if (buttonMatch) {
    return {
      type: 'button',
      raw: buttonMatch[0],
      props: {
        label: buttonMatch[1],
        url: buttonMatch[2],
      },
    };
  }

  // Block start syntax: {block type:"warning"}
  const blockStartMatch = raw.match(/\{block\s+type:"([^"]+)"\}/);
  if (blockStartMatch) {
    return {
      type: 'block-start',
      raw: blockStartMatch[0],
      props: {
        blockType: blockStartMatch[1],
      },
    };
  }

  // Block end syntax: {/block}
  const blockEndMatch = raw.match(/\{\/block\}/);
  if (blockEndMatch) {
    return {
      type: 'block-end',
      raw: blockEndMatch[0],
    };
  }

  // Gallery syntax: {gallery img1,img2,img3}
  const galleryMatch = raw.match(/\{gallery\s+([^}]+)\}/);
  if (galleryMatch) {
    const images = galleryMatch[1].split(',').map((img) => img.trim());
    return {
      type: 'gallery',
      raw: galleryMatch[0],
      props: {
        images: images.join(','),
      },
    };
  }

  return null;
}

/**
 * Pre-process the markdown to handle Netral extensions
 * Converts custom syntax to HTML before marked processes it
 */
export function preprocessNetralMarkdown(markdown: string): string {
  let result = markdown;

  // Process buttons: {button label:"Click me" url:"https://..."}
  result = result.replace(
    /\{button\s+label:"([^"]+)"\s+url:"([^"]+)"\}/g,
    '<a href="$2" class="netral-button" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Process block containers: {block type:"warning"} ... {/block}
  result = result.replace(
    /\{block\s+type:"([^"]+)"\}([\s\S]*?)\{\/block\}/g,
    '<div class="netral-block $1">$2</div>'
  );

  // Process galleries: {gallery img1,img2,img3}
  result = result.replace(/\{gallery\s+([^}]+)\}/g, (match, images) => {
    const imageUrls = images.split(',').map((img: string) => img.trim());
    const imageHtml = imageUrls
      .map((url: string) => `<img src="${url}" alt="Gallery image" loading="lazy" />`)
      .join('\n');
    return `<div class="netral-gallery">${imageHtml}</div>`;
  });

  return result;
}

/**
 * Get all available Netral extensions info
 */
export function getNetralExtensionsInfo() {
  return [
    {
      name: 'Button',
      syntax: '{button label:"Text" url:"https://..."}',
      description: 'Creates a clickable button that links to a URL',
    },
    {
      name: 'Block',
      syntax: '{block type:"warning"} content {/block}',
      description: 'Creates a styled content block. Types: warning, info, success, error',
    },
    {
      name: 'Gallery',
      syntax: '{gallery url1,url2,url3}',
      description: 'Creates an image gallery from comma-separated URLs',
    },
  ];
}
