// Always-visible honesty markers (D-LL-015): sample data, preview mode, engine down.
import React from 'react';

/** Screens whose data is real. A screen joins this set in the phase that wires it to real actions. */
export const REAL_SCREENS = new Set<string>(['activity', 'settings']);

const pill: React.CSSProperties = {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  top: 10,
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px dotted var(--tx3)',
  background: 'var(--bg1)',
  color: 'var(--tx2)',
  fontFamily: "'Geist Mono', monospace",
  fontSize: 11,
  pointerEvents: 'auto',
};

export function StatusLayer(props: { sample: boolean; engineUp: boolean; preview: boolean }) {
  return (
    <>
      {props.sample ? (
        <div
          data-testid="sample-marker"
          style={pill}
          title="This screen shows the design's sample project. Its numbers were typed by hand, not measured. Screens become real phase by phase (docs/phases.md)."
        >
          SAMPLE DATA · not measured
        </div>
      ) : null}
      {props.preview ? (
        <div style={{ ...pill, left: 'auto', transform: 'none', right: 16, top: 56, borderStyle: 'dashed', color: 'var(--warn)' }}>
          PREVIEW · states simulated from the URL
        </div>
      ) : null}
      {!props.engineUp ? (
        <div
          role="alert"
          style={{ ...pill, top: 44, border: '1px solid var(--err)', color: 'var(--tx)' }}
        >
          The Look Lab engine is not running. Start it with npm start; nothing is saved until it is back.
        </div>
      ) : null}
    </>
  );
}
