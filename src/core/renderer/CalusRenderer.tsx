/**
 * Netral Calus Renderer
 * Cartesian plane with 1:1 aspect ratio, function plots, and implicit curve rendering (marching squares)
 * Performance: viewport state in refs, RAF-based drawing, no React re-renders during pan/zoom
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { CalusResult } from '@/core/parser/calusParser';

interface CalusRendererProps {
  results: CalusResult[];
}

function getCSSColor(varName: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : '#888';
}

export function CalusRenderer({ results }: CalusRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport state in refs to avoid React re-renders during pan/zoom
  const viewRef = useRef({ cx: 0, cy: 0, upp: 0.02 });
  const panRef = useRef({ active: false, mx: 0, my: 0, cx: 0, cy: 0 });
  const rafRef = useRef<number>(0);

  const plots = useMemo(() => results.filter(r => r.type === 'plot' && r.plotFn), [results]);
  const implicits = useMemo(() => results.filter(r => r.type === 'implicit' && r.implicitFn), [results]);

  // ─── Drawing ──────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const { cx, cy, upp } = viewRef.current;

    const xMin = cx - (cw / 2) * upp;
    const xMax = cx + (cw / 2) * upp;
    const yMin = cy - (ch / 2) * upp;
    const yMax = cy + (ch / 2) * upp;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const toScreenX = (x: number) => ((x - xMin) / xRange) * cw;
    const toScreenY = (y: number) => ((yMax - y) / yRange) * ch;

    const bgColor = getCSSColor('--background');
    const axisColor = getCSSColor('--muted-foreground');
    const gridColor = getCSSColor('--border');

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);

    // ─── Grid ────────────────────────────────────────────────────────
    const gridStep = getGridStep(xRange);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.4;

    const xStart = Math.ceil(xMin / gridStep) * gridStep;
    for (let x = xStart; x <= xMax; x += gridStep) {
      const sx = toScreenX(x);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke();
    }
    const yStart = Math.ceil(yMin / gridStep) * gridStep;
    for (let y = yStart; y <= yMax; y += gridStep) {
      const sy = toScreenY(y);
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(cw, sy); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ─── Axes ────────────────────────────────────────────────────────
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;

    if (yMin <= 0 && yMax >= 0) {
      const sy = toScreenY(0);
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(cw, sy); ctx.stroke();
    }
    if (xMin <= 0 && xMax >= 0) {
      const sx = toScreenX(0);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke();
    }

    // ─── Axis labels ─────────────────────────────────────────────────
    ctx.fillStyle = axisColor;
    ctx.font = '10px system-ui, sans-serif';
    ctx.globalAlpha = 0.7;

    for (let x = xStart; x <= xMax; x += gridStep) {
      if (Math.abs(x) < 0.001) continue;
      const sx = toScreenX(x);
      const sy = toScreenY(0);
      const labelY = (yMin <= 0 && yMax >= 0) ? Math.min(Math.max(sy + 14, 14), ch - 2) : ch - 4;
      ctx.textAlign = 'center';
      ctx.fillText(formatAxis(x), sx, labelY);
    }
    for (let y = yStart; y <= yMax; y += gridStep) {
      if (Math.abs(y) < 0.001) continue;
      const sx = toScreenX(0);
      const sy = toScreenY(y);
      const labelX = (xMin <= 0 && xMax >= 0) ? Math.max(sx + 4, 4) : 4;
      ctx.textAlign = 'left';
      ctx.fillText(formatAxis(y), labelX, sy + 3);
    }
    ctx.globalAlpha = 1;

    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      ctx.textAlign = 'left';
      ctx.fillText('0', toScreenX(0) + 4, toScreenY(0) + 14);
    }

    // ─── Plot functions ──────────────────────────────────────────────
    for (const plot of plots) {
      if (!plot.plotFn) continue;
      ctx.strokeStyle = plot.color || 'hsl(220, 90%, 56%)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let started = false;
      const steps = Math.min(cw * 2, 800);
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * xRange;
        const y = plot.plotFn(x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);

        if (isNaN(y) || !isFinite(y) || sy < -1000 || sy > ch + 1000) {
          started = false;
          continue;
        }
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Label
      if (plot.name) {
        const labelX = xMin + xRange * 0.85;
        const labelY = plot.plotFn(labelX);
        if (isFinite(labelY)) {
          const sx = toScreenX(labelX);
          const sy = toScreenY(labelY);
          ctx.fillStyle = plot.color || 'hsl(220, 90%, 56%)';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${plot.name}(x)`, sx + 5, sy - 8);
        }
      }
    }

    // ─── Implicit curves (marching squares) ──────────────────────────
    for (const imp of implicits) {
      if (!imp.implicitFn) continue;
      ctx.strokeStyle = imp.color || 'hsl(220, 90%, 56%)';
      ctx.lineWidth = 2.5;

      // Adaptive resolution: lower during panning for responsiveness
      const resolution = panRef.current.active ? 60 : 100;
      const dx = xRange / resolution;
      const dy = yRange / resolution;

      // Sample grid — reuse a flat array to minimize allocations
      const size = resolution + 1;
      const grid = new Float64Array(size * size);
      for (let j = 0; j <= resolution; j++) {
        const yv = yMax - j * dy;
        for (let i = 0; i <= resolution; i++) {
          grid[j * size + i] = imp.implicitFn(xMin + i * dx, yv);
        }
      }

      // March through cells
      ctx.beginPath();
      for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution; i++) {
          const v00 = grid[j * size + i];
          const v10 = grid[j * size + i + 1];
          const v01 = grid[(j + 1) * size + i];
          const v11 = grid[(j + 1) * size + i + 1];

          if (v00 !== v00 || v10 !== v10 || v01 !== v01 || v11 !== v11) continue; // NaN check
          if (!isFinite(v00) || !isFinite(v10) || !isFinite(v01) || !isFinite(v11)) continue;

          const code = (v00 > 0 ? 8 : 0) | (v10 > 0 ? 4 : 0) | (v11 > 0 ? 2 : 0) | (v01 > 0 ? 1 : 0);
          if (code === 0 || code === 15) continue;

          const x0 = xMin + i * dx;
          const x1 = x0 + dx;
          const y0 = yMax - j * dy;
          const y1 = y0 - dy;

          const lerp = (a: number, b: number, va: number, vb: number) => a + (b - a) * (-va / (vb - va));

          const tx = toScreenX(lerp(x0, x1, v00, v10));
          const ty = toScreenY(y0);
          const bx = toScreenX(lerp(x0, x1, v01, v11));
          const by = toScreenY(y1);
          const lx = toScreenX(x0);
          const ly = toScreenY(lerp(y0, y1, v00, v01));
          const rx = toScreenX(x1);
          const ry = toScreenY(lerp(y0, y1, v10, v11));

          switch (code) {
            case 1: case 14: ctx.moveTo(lx, ly); ctx.lineTo(bx, by); break;
            case 2: case 13: ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
            case 3: case 12: ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); break;
            case 4: case 11: ctx.moveTo(tx, ty); ctx.lineTo(rx, ry); break;
            case 5: ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
            case 6: case 9: ctx.moveTo(tx, ty); ctx.lineTo(bx, by); break;
            case 7: case 8: ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); break;
            case 10: ctx.moveTo(tx, ty); ctx.lineTo(rx, ry); ctx.moveTo(lx, ly); ctx.lineTo(bx, by); break;
          }
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [plots, implicits]);

  const scheduleDraw = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // ─── Resize ────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      scheduleDraw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, [scheduleDraw]);

  // Redraw when plots/implicits change
  useEffect(() => { scheduleDraw(); }, [scheduleDraw]);

  // ─── Pan ───────────────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    panRef.current = { active: true, mx: e.clientX, my: e.clientY, cx: viewRef.current.cx, cy: viewRef.current.cy };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panRef.current.active) return;
    const upp = viewRef.current.upp;
    viewRef.current.cx = panRef.current.cx - (e.clientX - panRef.current.mx) * upp;
    viewRef.current.cy = panRef.current.cy + (e.clientY - panRef.current.my) * upp;
    scheduleDraw();
  }, [scheduleDraw]);

  const handleMouseUp = useCallback(() => {
    panRef.current.active = false;
    scheduleDraw(); // Redraw at full resolution
  }, [scheduleDraw]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { cx, cy, upp } = viewRef.current;
    const mx = (e.clientX - rect.left - canvas.clientWidth / 2) * upp + cx;
    const my = (canvas.clientHeight / 2 - (e.clientY - rect.top)) * upp + cy;

    const newUpp = upp * factor;
    viewRef.current.cx = mx - (e.clientX - rect.left - canvas.clientWidth / 2) * newUpp;
    viewRef.current.cy = my + (e.clientY - rect.top - canvas.clientHeight / 2) * newUpp;
    viewRef.current.upp = newUpp;
    scheduleDraw();
  }, [scheduleDraw]);

  const hasContent = plots.length > 0 || implicits.length > 0;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: panRef.current.active ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-muted-foreground/40 text-sm text-center">
            <p className="text-lg font-medium mb-1">Cartesian Plane</p>
            <p>Define functions or equations to plot them</p>
            <p className="text-xs mt-1 font-mono">f(x) = x^2</p>
            <p className="text-xs font-mono">x^2 + y^2 = 9</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function getGridStep(range: number): number {
  const raw = range / 10;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}

function formatAxis(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(2)).toString();
}