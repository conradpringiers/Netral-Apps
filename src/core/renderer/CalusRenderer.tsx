/**
 * Netral Calus Renderer
 * Renders a Cartesian coordinate system with plotted functions and circles
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { CalusResult } from "@/core/parser/calusParser";

interface CalusRendererProps {
  results: CalusResult[];
}

function getCSSColor(varName: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value ? `hsl(${value})` : "#888";
}

export function CalusRenderer({ results }: CalusRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -7,
    yMax: 7,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, vp: viewport });

  const plots = results.filter((r) => r.type === "plot" && r.plotFn);
  const circles = results.filter((r) => r.type === "circle" && r.circle);

  // ─── Drawing ──────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const cw = w / dpr;
    const ch = h / dpr;

    const { xMin, xMax, yMin, yMax } = viewport;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const toScreenX = (x: number) => ((x - xMin) / xRange) * cw;
    const toScreenY = (y: number) => ((yMax - y) / yRange) * ch;

    const bgColor = getCSSColor("--background");
    const axisColor = getCSSColor("--muted-foreground");
    const gridColor = getCSSColor("--border");

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
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, ch);
      ctx.stroke();
    }
    const yStart = Math.ceil(yMin / gridStep) * gridStep;
    for (let y = yStart; y <= yMax; y += gridStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(cw, sy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ─── Axes ────────────────────────────────────────────────────────
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;

    if (yMin <= 0 && yMax >= 0) {
      const sy = toScreenY(0);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(cw, sy);
      ctx.stroke();
    }
    if (xMin <= 0 && xMax >= 0) {
      const sx = toScreenX(0);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, ch);
      ctx.stroke();
    }

    // ─── Axis labels ─────────────────────────────────────────────────
    ctx.fillStyle = axisColor;
    ctx.font = "10px system-ui, sans-serif";
    ctx.globalAlpha = 0.7;

    for (let x = xStart; x <= xMax; x += gridStep) {
      if (Math.abs(x) < 0.001) continue;
      const sx = toScreenX(x);
      const sy = toScreenY(0);
      const labelY =
        yMin <= 0 && yMax >= 0
          ? Math.min(Math.max(sy + 14, 14), ch - 2)
          : ch - 4;
      ctx.textAlign = "center";
      ctx.fillText(formatAxis(x), sx, labelY);
    }
    for (let y = yStart; y <= yMax; y += gridStep) {
      if (Math.abs(y) < 0.001) continue;
      const sx = toScreenX(0);
      const sy = toScreenY(y);
      const labelX = xMin <= 0 && xMax >= 0 ? Math.max(sx + 4, 4) : 4;
      ctx.textAlign = "left";
      ctx.fillText(formatAxis(y), labelX, sy + 3);
    }
    ctx.globalAlpha = 1;

    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      ctx.textAlign = "left";
      ctx.fillText("0", toScreenX(0) + 4, toScreenY(0) + 14);
    }

    // ─── Plot functions ──────────────────────────────────────────────
    for (const plot of plots) {
      if (!plot.plotFn) continue;
      ctx.strokeStyle = plot.color || "hsl(220, 90%, 56%)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let started = false;
      const steps = cw * 2;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * xRange;
        const y = plot.plotFn(x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);

        if (isNaN(y) || !isFinite(y) || sy < -1000 || sy > ch + 1000) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(sx, sy);
          started = true;
        } else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Label
      if (plot.name) {
        const labelX = xMin + xRange * 0.85;
        const labelY = plot.plotFn(labelX);
        if (isFinite(labelY)) {
          const sx = toScreenX(labelX);
          const sy = toScreenY(labelY);
          ctx.fillStyle = plot.color || "hsl(220, 90%, 56%)";
          ctx.font = "bold 13px system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`${plot.name}(x)`, sx + 5, sy - 8);
        }
      }
    }

    // ─── Plot circles ────────────────────────────────────────────────
    for (const c of circles) {
      if (!c.circle) continue;
      const { cx: ccx, cy: ccy, r } = c.circle;
      const scx = toScreenX(ccx);
      const scy = toScreenY(ccy);
      // Radius in screen pixels (use x scale)
      const srx = (r / xRange) * cw;
      const sry = (r / yRange) * ch;

      ctx.strokeStyle = c.color || "hsl(220, 90%, 56%)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Draw ellipse to handle non-uniform scaling
      ctx.ellipse(scx, scy, srx, sry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = c.color || "hsl(220, 90%, 56%)";
      ctx.beginPath();
      ctx.arc(scx, scy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        `(${formatAxis(ccx)}, ${formatAxis(ccy)})`,
        scx + 6,
        scy - 6,
      );
    }

    ctx.restore();
  }, [viewport, plots, circles]);

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
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ─── Pan ───────────────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY, vp: { ...viewport } });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const dx =
      ((e.clientX - panStart.x) / cw) * (panStart.vp.xMax - panStart.vp.xMin);
    const dy =
      ((e.clientY - panStart.y) / ch) * (panStart.vp.yMax - panStart.vp.yMin);
    setViewport({
      xMin: panStart.vp.xMin - dx,
      xMax: panStart.vp.xMax - dx,
      yMin: panStart.vp.yMin + dy,
      yMax: panStart.vp.yMax + dy,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / canvas.clientWidth;
    const my = (e.clientY - rect.top) / canvas.clientHeight;
    const { xMin, xMax, yMin, yMax } = viewport;
    const cx = xMin + mx * (xMax - xMin);
    const cy = yMax - my * (yMax - yMin);
    const newXRange = (xMax - xMin) * factor;
    const newYRange = (yMax - yMin) * factor;
    setViewport({
      xMin: cx - mx * newXRange,
      xMax: cx + (1 - mx) * newXRange,
      yMin: cy - (1 - my) * newYRange,
      yMax: cy + my * newYRange,
    });
  };

  const hasContent = plots.length > 0 || circles.length > 0;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
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
            <p>Define functions or circles to plot them</p>
            <p className="text-xs mt-1 font-mono">f(x) = x^2</p>
            <p className="text-xs font-mono">(x-2)²+(y-1)²=9</p>
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
