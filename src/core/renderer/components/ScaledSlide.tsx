/**
 * ScaledSlide - Renders children at fixed 1920x1080 resolution
 * then scales down via CSS transform to fit any container.
 */

import { useRef, useState, useEffect, type ReactNode } from 'react';

interface ScaledSlideProps {
  children: ReactNode;
  className?: string;
}

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export function ScaledSlide({ children, className = '' }: ScaledSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setScale(Math.min(width / DESIGN_W, height / DESIGN_H));
      }
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    return () => ro.disconnect();
  }, []);

  const offsetTop = Math.max(0, (containerRef.current?.getBoundingClientRect().height ?? 0) - DESIGN_H * scale) / 2;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div
        style={{
          width: `${DESIGN_W}px`,
          height: `${DESIGN_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: `${offsetTop}px`,
          left: '50%',
          marginLeft: `${-(DESIGN_W * scale) / 2}px`,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ScaledSlide;
