/**
 * Platform helpers — bridge browser and Tauri (native) behaviors.
 *
 * The web build (Cloudflare Pages) is unaffected: Tauri APIs are only loaded
 * dynamically when running inside Tauri. Everything falls back to the browser
 * implementation otherwise.
 */

export const isTauri: boolean =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/** Enter fullscreen — uses the native window in Tauri, Fullscreen API on web. */
export async function enterFullscreen(): Promise<void> {
  if (isTauri) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setFullscreen(true);
    return;
  }
  const el = document.documentElement;
  if (el.requestFullscreen) await el.requestFullscreen();
}

/** Exit fullscreen. */
export async function exitFullscreen(): Promise<void> {
  if (isTauri) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setFullscreen(false);
    return;
  }
  if (document.fullscreenElement) await document.exitFullscreen();
}

/**
 * Collect the app's CSS into a single inline `<style>` block so the printed
 * document is self-contained. Reads the loaded stylesheets directly (no fetch),
 * which works identically in the browser and in Tauri's custom protocol.
 */
export function collectStyles(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets || [])) {
    try {
      const rules = Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n');
      if (rules) parts.push(rules);
    } catch {
      // Ignore cross-origin stylesheets (e.g. Google Fonts)
    }
  }
  return `<style>${parts.join('\n')}</style>`;
}

/**
 * Print an HTML document. In Tauri, `window.print()` is unreliable (and can
 * crash the WebView), so the document is written to a temp file and opened in
 * the system default browser. On web, it opens a print window as before.
 */
export async function printHtml(html: string, title: string): Promise<void> {
  if (isTauri) {
    const { tempDir, join } = await import('@tauri-apps/api/path');
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    const { openPath } = await import('@tauri-apps/plugin-opener');

    // Write to the OS temp dir (always exists) and open it in the system
    // browser. `join` handles the path separator.
    const dir = await tempDir();
    const safeName = (title || 'netral').replace(/[^\w-]+/g, '-').slice(0, 40) || 'netral';
    const filePath = await join(dir, `${safeName}-${Date.now()}.html`);

    await writeTextFile(filePath, html);
    await openPath(filePath);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Could not open the print window.');
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}
