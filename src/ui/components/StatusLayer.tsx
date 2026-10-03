// Always-visible honesty markers (D-LL-015): sample data, preview mode, engine down.
// The sample marker is one short line that sits in the top bar's free space, between the breadcrumb and the search
// box, and covers nothing (B-LL-006): "12 SAMPLE · 3 ESTIMATE · 3 MEASURED". When the window is too narrow for it, it
// moves to the empty part of the left rail, above Settings. Hover shows the full list; a click opens it.
import React from 'react';

/** Screens whose data is real. A screen joins this set in the phase that wires it to real actions. */
export const REAL_SCREENS = new Set<string>(['activity', 'settings']);

// A screen that is partly real (Breakdown since P2) names exactly what is still sample. Its logic sets
// the text from the data it shows; null brings back the whole-screen "SAMPLE DATA" marker.
const partial = new Map<string, string>();
const listeners = new Set<() => void>();

export function setScreenMarker(screen: string, text: string | null): void {
  if ((partial.get(screen) ?? null) === text) return;
  if (text) partial.set(screen, text);
  else partial.delete(screen);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const WHOLE = 'SAMPLE DATA · not measured';

/**
 * "SAMPLE: a, b, c · ESTIMATE: d (why) · colour, tone and aspect measured" → "3 SAMPLE · 1 ESTIMATE · 3 MEASURED".
 * The full text stays on the marker (its tooltip, its accessible name, and the panel a click opens).
 */
export function markerSummary(full: string): string {
  return full.split(' · ').map((part) => {
    const named = /^([A-Z]+): (.*?)(?: \(.*\))?$/.exec(part);
    if (named) return `${named[2].split(', ').length} ${named[1]}`;
    const measured = /^(.*) measured$/.exec(part);
    if (measured) return `${measured[1].split(/, | and /).length} MEASURED`;
    return part;
  }).join(' · ');
}

const base: React.CSSProperties = {
  position: 'fixed',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  border: '1px dotted var(--tx3)',
  background: 'var(--bg1)',
  color: 'var(--tx2)',
  fontFamily: "'Geist Mono', monospace",
  fontSize: 11,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  cursor: 'pointer',
};

type Place = { mode: 'bar'; left: number; top: number; max: number } | { mode: 'rail'; left: number; width: number; bottom: number };

/** Where the marker goes: the top bar's gap if the summary fits there, else the rail's empty strip above Settings. */
function placeFor(width: number): Place | null {
  const root = document.querySelector('[data-screen-label="Look Lab"]');
  const header = root?.querySelector(':scope > header');
  const gap = header?.querySelector(':scope > div');
  const rail = root?.querySelector(':scope > aside');
  if (!header || !gap || !rail) return null;
  const g = gap.getBoundingClientRect(), h = header.getBoundingClientRect();
  if (g.width >= width + 16) return { mode: 'bar', left: g.left + (g.width - width) / 2, top: h.top + (h.height - 26) / 2, max: g.width - 16 };
  const r = rail.getBoundingClientRect();
  const settings = [...rail.querySelectorAll('button')].pop()?.getBoundingClientRect();
  return { mode: 'rail', left: r.left + 4, width: r.width - 8, bottom: window.innerHeight - (settings ? settings.top : r.bottom) + 8 };
}

/** The summary's own width, measured off screen. */
function widthOf(text: string): number {
  const probe = document.createElement('span');
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:11px 'Geist Mono',monospace;padding:0 10px";
  probe.textContent = `${text} ⓘ`;
  document.body.appendChild(probe);
  const w = probe.getBoundingClientRect().width + 8;
  probe.remove();
  return w;
}

function SampleMarker({ full }: { full: string | null }) {
  const short = full ? markerSummary(full) : WHOLE;
  const tip = full
    ? `${full}\n\nSAMPLE values are the design's placeholders, not measurements. ESTIMATE values were fitted to the picture. MEASURED values were computed from the reference's pixels.`
    : "This screen shows the design's sample project. Its numbers were typed by hand, not measured. Screens become real phase by phase (docs/phases.md).";
  const [place, setPlace] = React.useState<Place | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const measure = () => setPlace(placeFor(widthOf(short)));
    measure();
    const ro = new ResizeObserver(measure);
    const header = document.querySelector('[data-screen-label="Look Lab"] > header');
    if (header) ro.observe(header);
    window.addEventListener('resize', measure);
    const t = setInterval(measure, 1000); // the breadcrumb and the AI pill change width as data loads
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearInterval(t);
    };
  }, [short]);

  React.useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  const style: React.CSSProperties = !place
    ? { ...base, left: '50%', transform: 'translateX(-50%)', top: 10, borderRadius: 999, visibility: 'hidden' }
    : place.mode === 'bar'
      ? { ...base, left: place.left, top: place.top, height: 26, maxWidth: place.max, borderRadius: 999, boxSizing: 'border-box' }
      : { ...base, left: place.left, bottom: place.bottom, width: place.width, height: 22, justifyContent: 'center', gap: 3, padding: '0 2px', borderRadius: 11, fontSize: 9, boxSizing: 'border-box' };
  const detail: React.CSSProperties = place?.mode === 'rail'
    ? { left: place.left + place.width + 8, bottom: place.bottom }
    : { left: '50%', transform: 'translateX(-50%)', top: place ? place.top + 32 : 44 };
  const toggle = () => setOpen((o) => !o);

  return (
    <>
      <div
        data-testid="sample-marker" role="button" tabIndex={0} aria-label={full ?? WHOLE} aria-expanded={open} title={tip} style={style}
        onClick={toggle} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
      >
        {place?.mode === 'rail'
          ? (<><span aria-hidden="true">ⓘ</span><span>{full ? 'Sample' : 'Sample data'}</span></>)
          : (<><span>{short}</span><span aria-hidden="true">ⓘ</span></>)}
      </div>
      {open ? (
        <div
          data-testid="sample-marker-detail" role="dialog" onClick={() => setOpen(false)}
          style={{ ...base, ...detail, whiteSpace: 'pre-wrap', maxWidth: 520, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line2)', lineHeight: 1.5, zIndex: 31 }}
        >
          {tip}
        </div>
      ) : null}
    </>
  );
}

const pill: React.CSSProperties = { ...base, left: '50%', transform: 'translateX(-50%)', top: 10, borderRadius: 999, cursor: 'default', padding: '5px 10px' };

export function StatusLayer(props: { sample: boolean; engineUp: boolean; preview: boolean; screen?: string }) {
  const part = React.useSyncExternalStore(subscribe, () => partial.get(props.screen ?? '') ?? null);
  return (
    <>
      {props.sample ? <SampleMarker full={part} /> : null}
      {props.preview ? (
        <div style={{ ...pill, left: 'auto', transform: 'none', right: 16, top: 56, borderStyle: 'dashed', color: 'var(--warn)' }}>
          PREVIEW · states simulated from the URL
        </div>
      ) : null}
      {!props.engineUp ? (
        <div role="alert" style={{ ...pill, top: 44, border: '1px solid var(--err)', color: 'var(--tx)', whiteSpace: 'normal' }}>
          The Look Lab engine is not running. Start it with npm start; nothing is saved until it is back.
        </div>
      ) : null}
    </>
  );
}
