# Look Lab — Bug Log

Every bug this project hits, what caused it, how it was fixed, and **whether it can
come back in the next build, and where**.

| Log | Answers |
|---|---|
| `docs/decision-log.md` | why a choice was made |
| `docs/progress-log.md` | what shipped, when, with measured numbers |
| **`docs/bug-log.md`** | **what broke, why, and whether it will break again** |

A bug goes here whether it reached a user or died in a test, whether a person, a
test, a review or a live run found it.

**Rules for this file**
- **One entry per bug, numbered `B-LL-NNN`,** allocated on first sight from
  `docs/id-registry.json` (bump `allocated.bug`), never renumbered or recycled. Cite
  the id from the test that closes it, so the guard and the record point at each other.
- **Every entry states whether it can return.** "Fixed" is not the end of the story.
- **Guards are named, not implied.** If the only guard is a sentence in a doc, say so.
- **Written the moment the bug is found,** not batched to the end of a phase.
- **No secrets, tokens, client names or personal data.**

**Entry shape** — the labels are fixed so they can be checked mechanically
(`tests/records/bug-log.test.ts`):

```
### B-LL-NNN · one line: what broke
- **Phase:** where in the build it happened, and the date
- **Found by:** what caught it — a test, a live run, a review, a person
- **Cause:** the mechanism, not the symptom
- **Fix:** what changed
- **Guard:** what now makes this fail loudly (name the test, or admit there isn't one)
- **Could it return?** LOW | MEDIUM | HIGH — and where it would show up next
```

---

## Open

### B-LL-004 · After a 60 s import the engine idles over its 150 MB memory budget in most runs
- **Phase:** P3, 2026-10-01, measuring the light fit's memory on the M1 (`scripts/measure-fit.ts`, `scripts/measure-import.ts`).
- **Found by:** measurement. Engine RSS idle after importing the same 60 s 1080p clip, five runs this session: 147, 172, 185, 176 and 159 MB (budget ≤ 150 MB, standing rule 5); macOS footprint (private memory including compressed pages) 155 and 156 MB in the two runs that read it. P2 measured 146–147 MB three times (PR-LL-002), the low end of this spread. Idle before any import: 136–138 MB RSS, 96 MB footprint.
- **Cause:** not yet known. The light fit is not it: ten fits add 0–2 MB at their peak and nothing that stays. Most likely the import's 121 frame decodes and their signatures leave the engine's heap larger than it needs and Node does not hand the memory back; RSS on macOS also moves with memory compression, so one reading proves little either way. Unproven until a heap snapshot is taken after an import.
- **Fix:** none yet. Proposed: take a heap snapshot after a 60 s import to see what is held; if it is the decode's garbage, run the cut detection and measurement of a reference in a worker thread that exits when done, so its memory goes back to the system.
- **Guard:** none. `scripts/measure-fit.ts` and `scripts/measure-import.ts` measure it by hand; no test checks the budget.
- **Could it return?** HIGH: it is open now, and every import of a long clip shows it.

## Closed

### B-LL-003 · The Blender head's eyebrows were rendered 27 cm off the face
- **Phase:** P3, 2026-10-01, the first trial render of the Blender ground-truth set (`scripts/blender/render_set.py`), before any render was kept.
- **Found by:** looking at the trial render: no brows on the face, and a thin dark streak floating in the background at head height.
- **Cause:** each brow was built with its vertices at their final place and the object at the world origin, then given an 8° slant through `rotation_euler`. An object rotates about its own origin, so the brows swung round the world origin, 1.6 m below them, and landed about 0.27 m to the side.
- **Fix:** the slant is applied to the brow's own vertices about the brow's centre (`ellipsoid(..., roll=...)`); nothing in the head is rotated as an object any more. Both sets were rendered after the fix.
- **Guard:** `check_parts()` in `scripts/blender/render_set.py` runs before any render and stops the script if any part of the head lies more than 0.13 m from the head's centre (neck and torso 0.45 m). Checked against the original code: it refuses with "brow-1 is 0.271 m from the head centre". Its first version missed this, because `matrix_world` is stale until the scene updates; it now updates first.
- **Could it return?** LOW for the head, while the guard runs. Any new part placed through an object transform instead of its vertices would repeat it, and the guard only catches parts that land far from the head.

### B-LL-002 · The recorded test clip reported a cut half a second in that was not there
- **Phase:** P2, 2026-09-30, the first run of the Chrome video test (`tests/ui/breakdown.e2e.test.ts`).
- **Found by:** the test: shots started at 0, 0.5, 2.5 and 8.5 s where the clip had cuts only at 2 and 8 s.
- **Cause:** in the test's clip, not in the import. Chrome's canvas recorder (`captureStream` + `MediaRecorder`, VP8, VP9 and H.264 alike, headless Chrome on the M1) writes a file's first frame with a different colour conversion from every frame after it: the source colour (176, 80, 42) decodes as (175, 80, 43) in frame 0 and (183, 76, 35) from frame 1 on, and an off-white clips to 255. Decoding was checked and is consistent: each timestamp gives the same pixels whatever order it is sought in, and in playback. Frame 0 against frame 1 was a histogram distance of 0.34, which the detector correctly called a cut. The two real cuts landed one sampled frame late for a second reason: the script's clock started before the recorder did.
- **Fix:** the test clip opens on one second of black (black decodes as black under either conversion, and black to picture is a real cut the test now expects), and the clip's timeline starts at the recorder's `start` event. Separately, the default measured frame became the key frame of the longest shot rather than the first, so a black leader is never what a breakdown measures (D-LL-026).
- **Guard:** the comment above the video test in `tests/ui/breakdown.e2e.test.ts` names this bug; `tests/actions/breakdown.test.ts` ("a short black leader is never the default frame") guards the default frame.
- **Could it return?** MEDIUM: any new test that records a clip in Chrome and expects its first frame to match the rest will see it again. Real footage is not affected as far as measured: the decode path is consistent.

### B-LL-001 · The engine would not start under plain Node although every test passed
- **Phase:** P1, 2026-09-30, first launch of the engine for the browser preview.
- **Found by:** a live run: `node --experimental-strip-types src/engine/main.ts` exited with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
- **Cause:** `RateLimiter` and `FileStore` used TypeScript constructor parameter properties (`constructor(private root: string)`). Node's type stripping only erases types; it cannot run syntax that generates code. Vitest compiles TypeScript itself, so all 75 tests were green while the real entry point could not load.
- **Fix:** plain fields assigned in the constructor. `tsconfig.json` sets `erasableSyntaxOnly`, so `npm run typecheck` now rejects that syntax anywhere.
- **Guard:** `tests/engine/boot.test.ts` starts the engine exactly as `npm start` does (plain Node, type stripping, no bundler) and calls the API. `npm run typecheck` with `erasableSyntaxOnly` is the second guard.
- **Could it return?** LOW, as long as the boot test stays in the suite. It would come back in any new engine file using enums, namespaces or parameter properties if someone skipped both the boot test and the type check.
