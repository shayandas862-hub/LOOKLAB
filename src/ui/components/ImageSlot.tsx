// Stands in for the design's <image-slot>: an image when one is set, otherwise a neutral placeholder.
// A screen fills a slot through slotProps(id) (P2): the image, a click handler that reports the point in
// image coordinates (0–1, letterboxing of `fit: contain` removed), a thirds grid and a marker drawn on the
// picture itself rather than on the design's fixed-aspect box. Since P3 a drag on the picture reports a box
// (onBox, the face box of D-LL-033) and a click still reports a point; a stored box is drawn on the picture.
import React from 'react';

const RADIUS: Record<string, string> = { rect: '0', rounded: '12px', circle: '50%', pill: '999px' };

type Rect = { left: number; top: number; width: number; height: number };
type Box = { x: number; y: number; w: number; h: number };
/** A press that moves less than this (px) is a click, not a drag. */
const DRAG_PX = 4;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ImageSlot(props: {
  id?: string;
  src?: string;
  shape?: string;
  fit?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  onPoint?: (x: number, y: number) => void;
  marker?: { x: number; y: number } | null;
  onBox?: (box: Box) => void;
  box?: Box | null;
  grid?: boolean;
  title?: string;
}) {
  const radius = RADIUS[props.shape ?? 'rounded'] ?? '12px';
  const base: React.CSSProperties = { width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', position: 'relative', ...props.style };
  const img = React.useRef<HTMLImageElement>(null);
  const [content, setContent] = React.useState<Rect | null>(null);
  const [drag, setDrag] = React.useState<{ x0: number; y0: number; x1: number; y1: number; px0: number; py0: number; moved: boolean } | null>(null);
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

  /** The pointer in picture coordinates (0–1), letterboxing removed. */
  const at = (e: React.PointerEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - r.left - content!.left) / content!.width, y: (e.clientY - r.top - content!.top) / content!.height };
  };
  const down = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!content || (!props.onPoint && !props.onBox) || e.button !== 0) return;
    const p = at(e);
    if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ x0: p.x, y0: p.y, x1: p.x, y1: p.y, px0: e.clientX, py0: e.clientY, moved: false });
  };
  const move = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!drag || !content) return;
    const p = at(e);
    const moved = drag.moved || Math.hypot(e.clientX - drag.px0, e.clientY - drag.py0) > DRAG_PX;
    setDrag({ ...drag, x1: clamp01(p.x), y1: clamp01(p.y), moved: moved && !!props.onBox });
  };
  const up = () => {
    if (!drag) return;
    setDrag(null);
    if (drag.moved && props.onBox) {
      const x = Math.min(drag.x0, drag.x1), y = Math.min(drag.y0, drag.y1);
      props.onBox({ x, y, w: Math.abs(drag.x1 - drag.x0), h: Math.abs(drag.y1 - drag.y0) });
    } else if (props.onPoint) props.onPoint(drag.x0, drag.y0);
  };
  const live = drag && drag.moved ? { x: Math.min(drag.x0, drag.x1), y: Math.min(drag.y0, drag.y1), w: Math.abs(drag.x1 - drag.x0), h: Math.abs(drag.y1 - drag.y0) } : null;
  const shown = live ?? props.box ?? null;

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
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', cursor: props.onPoint || props.onBox ? 'crosshair' : undefined, display: 'block', touchAction: 'none', userSelect: 'none' }}
      />
      {props.grid && content ? (
        <div
          data-testid="thirds"
          style={{ position: 'absolute', pointerEvents: 'none', ...content, backgroundImage: `${thirds('90deg')}, ${thirds('180deg')}` }}
        />
      ) : null}
      {shown && content ? (
        <div
          data-testid="face-box"
          title="Face (marked by hand)"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            left: content.left + shown.x * content.width,
            top: content.top + shown.y * content.height,
            width: shown.w * content.width,
            height: shown.h * content.height,
            border: `2px ${live ? 'dashed' : 'solid'} var(--acc)`,
            boxShadow: '0 0 0 1px rgba(0,0,0,.55)',
            borderRadius: 4,
          }}
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
