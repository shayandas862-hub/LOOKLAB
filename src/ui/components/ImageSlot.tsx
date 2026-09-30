// Stands in for the design's <image-slot>: an image when one is set, otherwise a neutral placeholder.
// Real reference frames arrive with phase P2 (breakdown.import_reference).
import React from 'react';

const RADIUS: Record<string, string> = { rect: '0', rounded: '12px', circle: '50%', pill: '999px' };

export function ImageSlot(props: {
  id?: string;
  src?: string;
  shape?: string;
  fit?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const radius = RADIUS[props.shape ?? 'rounded'] ?? '12px';
  const base: React.CSSProperties = { width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', ...props.style };
  if (props.src) {
    return (
      <div data-slot={props.id} style={base}>
        <img src={props.src} alt={props.placeholder ?? ''} style={{ width: '100%', height: '100%', objectFit: props.fit === 'contain' ? 'contain' : 'cover' }} />
      </div>
    );
  }
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
