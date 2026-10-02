// @ts-nocheck: owned code (D-LL-014) for the Breakdown's AI values, typed as the screen is.
// R5 on the screen (P4 task 4): the mood badge reads "AI · n" from the record, an AI value under 60 reads LOW and is
// listed in the design's review banner, and a click on "Confirm …" is the person's approval (breakdown.review, T3).
import React from 'react';
import { aiLabel, reviewState } from './Breakdown.rows';
import { sampleBadgeText } from '../runtime/badges';

/** The mood section's badge: SAMPLE, MANUAL, or "AI · n" (with LOW or CONFIRMED). */
export function moodBadgeText(b) {
  if (!b || b.mood.source === 'sample') return sampleBadgeText('AI 70%');
  if (b.mood.source === 'manual') return 'MANUAL';
  if (b.mood.source === 'ai') return aiLabel(b.mood.confidence, reviewState(b.mood, 'mood', b.reviewed));
  return b.mood.source.toUpperCase();
}

/** The banner's body: what waits, why it waits, and one button per value to confirm it. */
export function reviewBodyFor(queue, confirm) {
  const names = queue.map((q) => `${q.label.toLowerCase()} (AI · ${q.confidence})`).join(', ');
  return React.createElement(
    'span',
    null,
    `The model rated ${names} under 60 (its own rating, not checked). Confirm, or edit by hand. `,
    ...queue.map((q) =>
      React.createElement('button', {
        key: q.field,
        type: 'button',
        title: 'breakdown.review',
        onClick: () => confirm(q),
        style: { marginLeft: 6, height: 24, padding: '0 10px', borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--warn)', color: 'var(--tx)', cursor: 'pointer' },
      }, `Confirm ${q.label.toLowerCase()}`),
    ),
  );
}
