// @ts-nocheck: behaviour ported from design/MoodBoard.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { MoodBoardView, defaults } from '../views/MoodBoard.view';
import { sampleBadgeText } from '../runtime/badges';

const CL = [
  ['Night interiors', 24, 70, 440, [['#1B2230','#3E4A52','#6E5B4A','#C7803A','#0D0F12'],['#141A22','#2E3A44','#8A6A48','#D9A66B','#0A0C0F'],['#1F2733','#4B5560','#5C4A3C','#B77A3E','#101216'],['#232B36','#394550','#7A6450','#E0B07A','#0E1013']]],
  ['Sodium & teal', 500, 70, 440, [['#0F2A2E','#1E4B52','#C77A2E','#E7A55A','#081416'],['#12303A','#2C5E66','#B86B2A','#F0BE78','#0A1619'],['#0D2226','#23474C','#D08A3C','#EFC48F','#070F10'],['#153038','#326A70','#A85F28','#DDA266','#0B1719']]],
  ['Close-ups', 24, 430, 440, [['#2A1E18','#6E4A36','#C58B62','#E9C9A0','#120C0A'],['#1B2230','#4A3A30','#B07850','#E6C29A','#0D0F12'],['#241C18','#5C4436','#C99A74','#F0D2AC','#100C0A']]],
];
const NOTES = [
  ['“The window light should feel like it belongs to the street, not the flat.”','Director · Mon', '980px', '90px', '2deg'],
  ['Keep the blue in the shadows, never on her face.','Director · Mon', '980px', '250px', '-2deg'],
  ['Close-ups: softer than 12C, same warmth.','DP · Tue', '500px', '470px', '1.5deg'],
];
export class MoodBoard extends DCLogic {
  state = { notes: NOTES };
  renderVals() {
    const run = this.props.run || (() => {});
    return {
      badgeText: sampleBadgeText,
      clusters: CL.map(([title, x, y, w, frames], ci) => ({ title, x: x + 'px', y: y + 'px', w: w + 'px', count: frames.length + ' frames',
        frames: frames.map((pal, i) => ({ pal, slot: `board-${ci}-${i}`, ph: title + ' ' + (i + 1) })) })),
      notes: this.state.notes.map(([text, by, x, y, rot]) => ({ text, by, x, y, rot })),
      palette: [['#1B2230',24],['#3E4A52',16],['#C7803A',13],['#0F2A2E',12],['#6E5B4A',10],['#E9C9A0',9],['#2C5E66',9],['#0D0F12',7]].map(([hex, share]) => ({ hex, share })),
      tags: [['neo-noir','ai'],['sodium','ai'],['warm–cold tension','ai'],['hard key','hand'],['night interior','hand'],['lonely','ai']].map(([label, s]) => ({ label, border: s === 'ai' ? '1px dashed var(--line2)' : '1px solid var(--line2)' })),
      addRef: () => run('board.add_reference', 'Drop frames onto any empty slot'),
      addNote: () => { const t = window.prompt('Note'); if (!t) return; this.setState(s => ({ notes:[...s.notes, [t, 'You · now', '980px', 410 + (s.notes.length - 3) * 150 + 'px', '-1deg']] })); run('board.add_note', 'Note added', { text:t }); },
      extract: () => run('board.extract_palette', 'Palette re-extracted from 11 frames'),
      exportPdf: () => run('board.export_pdf', 'Board exported · Neel_moodboard.pdf'),
    };
  }
}

MoodBoard.view = MoodBoardView;
MoodBoard.defaultProps = defaults;
