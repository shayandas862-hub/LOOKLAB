// Stands in for the design's <image-slot>: an image when one is set, otherwise a neutral placeholder.
// A screen fills a slot through slotProps(id) (P2): the image, a click handler that reports the point in
// image coordinates (0–1, letterboxing of `fit: contain` removed), a thirds grid and a marker drawn on the
// picture itself rather than on the design's fixed-aspect box.
import React from 'react';

const RADIUS: Record<string, string> = { rect: '0', rounded: '12px', circle: '50%', pill: '999px' };

type Rect = { left: number; top: number; width: number; height: number };

export function ImageSlot(props: {
  id?: string;
  src?: string;
  shape?: string;
  fit?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  onPoint?: (x: number, y: number) => void;
  marker?: { x: number; y: number } | null;
  grid?: boolean;
  title?: string;
}) {
  const radius = RADIUS[props.shape ?? 'rounded'] ?? '12px';
  const base: React.CSSProperties = { width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', position: 'relative', ...props.style };
  const img = React.useRef<HTMLImageElement>(null);
  const [content, setContent] = React.useState<Rect | null>(null);
  const contain = props.fit === 'contain';

  // Where the picture sits inside the element, in px relative to it.
  const measure = React.useCallback(() => {
    const el = img.current;
    if (!el || !el.naturalWidth) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const s = contain ? Math.min(w / el.naturalWidth, h / el.naturalHeight) : Math.max(w / el.naturalWidth, h / el.naturalHeight);
    const cw = el.naturalWidth * s;
    const ch = el.naturalHeight * s;
    setContent({ left: (w - cw) / 2, top: (h - ch) / 2, width: cw, height: ch });
  }, [contain]);

  React.useEffect(() => {
    const el = img.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, props.src]);

  if (!props.src) {
    return (
      <div
        data-slot={props.id}
        style={{
          ...base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'repeating-linear-gradient(135deg, var(--bg1) 0 12px, var(--bg2) 12px 24px)',
          color: 'var(--tx3)',
          fontSize: 12,
          textAlign: 'center',
          padding: 12,
        }}
      >
        {props.placeholder ?? 'No image'}
      </div>
    );
  }

  const click = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!props.onPoint || !content) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left - content.left) / content.width;
    const y = (e.clientY - r.top - content.top) / content.height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) props.onPoint(x, y);
  };

  const line = 'rgba(255,255,255,.35)';
  const thirds = (dir: string) =>
    `linear-gradient(${dir}, transparent calc(33.333% - .5px), ${line} calc(33.333% - .5px), ${line} calc(33.333% + .5px), transparent calc(33.333% + .5px), ` +
    `transparent calc(66.666% - .5px), ${line} calc(66.666% - .5px), ${line} calc(66.666% + .5px), transparent calc(66.666% + .5px))`;

  return (
    <div data-slot={props.id} style={base}>
      <img
        ref={img}
        src={props.src}
        alt={props.placeholder ?? ''}
        title={props.title}
        onLoad={measure}
        onClick={click}
        style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', cursor: props.onPoint ? 'crosshair' : undefined, display: 'block' }}
      />
      {props.grid && content ? (
        <div
          data-testid="thirds"
          style={{ position: 'absolute', pointerEvents: 'none', ...content, backgroundImage: `${thirds('90deg')}, ${thirds('180deg')}` }}
        />
      ) : null}
      {props.marker && content ? (
        <div
          data-testid="subject-marker"
          title="Subject (set by hand)"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            left: content.left + props.marker.x * content.width - 11,
            top: content.top + props.marker.y * content.height - 11,
            width: 22,
            height: 22,
            borderRadius: 11,
            border: '2px solid var(--acc)',
            boxShadow: '0 0 0 2px rgba(0,0,0,.55)',
          }}
        />
      ) : null}
    </div>
  );
}
