// Source badges while a screen still runs on the design's sample data (D-LL-015).
// A screen passes each badge through sampleBadge(); when the screen is wired to real
// values it stops calling it and the true source shows.
export interface Badge {
  label: string;
  border: string;
  bg: string;
  color: string;
}

export const SAMPLE_BADGE: Badge = { label: 'SAMPLE', border: '1px dotted var(--tx3)', bg: 'transparent', color: 'var(--tx3)' };

/** For badge text typed into a design template: everything but MANUAL reads SAMPLE. */
export function sampleBadgeText(label: string): string {
  return label === 'MANUAL' ? label : 'SAMPLE';
}

/** Manual values stay manual (a person really typed them); anything else on sample data reads SAMPLE. */
export function sampleBadge(b: Badge): Badge {
  return b.label === 'MANUAL' ? b : SAMPLE_BADGE;
}
