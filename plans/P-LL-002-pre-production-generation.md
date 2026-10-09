# P-LL-002 — Pre-production tab: script to shots to frames to video

**Status:** plan, not yet a decision. Written 2026-10-09 at the founder's request: "document all of the things now… I want these features in Look Lab in a tab called Pre-production." It becomes ADs and Ds (and a phase card) when the founder says yes to §6 and §7.
**Vision:** V-LL-003. **Evidence:** the *Dead Man's Telescope* film project (code DMT, `~/Desktop/My Films/Dead Man's Telescope/`). That project's process log (O-001…O-019 in its `docs/process-log.md`) and decisions (D-DMT-001…D-DMT-023) are the source of every stage below.

---

## 1 · Why

Between 2026-10-08 and 2026-10-09 the founder made the start of an anime short with consumer tools (ChatGPT, Gemini, Nano Banana 2 in Google Flow, Kling). By hand, a repeatable process emerged. Each step was done in a different app, with Claude in a chat holding it together, and every handover lost something:
- prompts were retyped and drifted (a yellow taxi);
- images were saved under the tools' own names in ad-hoc folders;
- the style lived only in text until the founder noticed it was written nowhere;
- a warm room broke the film's central light rule;
- colour was judged by eye until a measurement corrected the eye.

The process works. The tooling around it is the bottleneck.

## 2 · The process, as inferred from the DMT sessions

| # | Stage | What happens | DMT evidence |
|---|---|---|---|
| 0 | Story | A premise, written or generated; the founder steers and rejects drafts bluntly | D-DMT-002, O-008 (DMT) |
| 1 | Script and breakdown | Scenes, characters, locations, props, motifs; a colour note under every scene | D-DMT-019, O-015 |
| 2 | Bible | Locked text blocks (style, per-part light, characters, locations, props), continuity rules, the reason for each motif | D-DMT-005/006/010/011/012, O-016 |
| 3 | Look | A visual master board (one panel per part, each in that part's light); a palette measured from it | D-DMT-022/023, O-014/018/019 |
| 4 | Character | Model sheets on a plain background (turnaround, sizes, head angles, expressions, hands); variants made by editing the master | D-DMT-014/017, O-007/012 |
| 5 | Edit in words | A shot list per scene: id, length (about 3 s), size and angle, start, end, movement, light line, references (at most 3), sound | D-DMT-007/021, O-017 |
| 6 | Frames | The prompt is assembled from the bible; the start frame first; the end frame as an edit of the start; review by eye and in numbers; one-fault fix edits | D-DMT-009, O-003/004/019 |
| 7 | Sequence review | Every pair of a sequence side by side before anything is animated: direction of travel, hand, light | O-006 |
| 8 | Motion | Start frame, end frame and motion prompt sent to a video model; the cheapest model that can do it | D-DMT-008, O-005 |
| 9 | Assembly | Clips in edit order; on-screen text added in the edit, never generated; one grade to tie it together | D-DMT-020, P-DMT-001 |
| ∞ | Records | Every generation, decision and process step logged as it happens, by written triggers | D-DMT-015/016, O-009/011 |

## 3 · Does any tool already do this? (checked 2026-10-09, from public pages, not hands-on)

- **LTX Studio** breaks an uploaded script into scenes and shots automatically, and extracts characters, objects and locations as reusable "Elements" tagged with @. It makes storyboard images with FLUX or Nano Banana, has camera-motion presets, and has a timeline. Its 2026 feature post does not cover start/end frames, colour controls or keyframes. A third-party review says its character consistency "is still improving".
- **Higgsfield** runs Popcorn into Cinema Studio. A rough paragraph is enough (it has no script upload). Popcorn makes up to 8 coherent frames per generation from up to 4 reference images, and Cinema Studio animates them with lens, light and a "color palette" setting. It has no dedicated shot list.
- **Morphic** has a Copilot that turns a script into frames on a canvas, with reference sheets for characters and sets passed into every frame, and renders approved shots as video. **Katalist** imports a script and reuses defined characters. **Google Flow** chains frames to video with Veo and reusable ingredients.

**The gap.** These tools each cover a slice: script to boards, reference consistency, or animation. None of the pages describes these five things:
1. a locked production bible with written continuity rules, checked against every frame;
2. shots designed as a start frame plus an end-frame edit, with movement sized to the clip length;
3. every frame measured against a per-part colour script (Look Lab already has the palette breakdown and the grade check for this);
4. decision, generation and process logging that makes the method auditable and reusable;
5. per-shot routing to the cheapest model that supports start and end frames at the needed length.

That combination is where Look Lab's existing honesty and measurement work becomes a moat. This is a claim from public pages, so test LTX Studio and Morphic hands-on before relying on it.

Sources: [LTX Studio features 2026](https://ltx.io/blog/top-ltx-studio-features) · [Higgsfield script to storyboard](https://higgsfield.ai/blog/script-to-storyboard-ai) · [Morphic: best AI storyboard tools 2026](https://morphic.com/resources/tools/best-ai-storyboard-tools) · [fal: best image-to-video APIs 2026](https://fal.ai/learn/tools/best-image-to-video-apis-2026)

## 4 · The Pre-production tab

The tab is a new screen, built through Claude Design like the others (hard rule 10). Every step is an action in the registry (hard rule 1).

1. **Story.** Upload a script (Fountain, PDF, DOCX, Markdown) or generate one from a premise (T2, "AI · n", R5 review). The script is live: an edit flags shots already generated that it affects (O-013).
2. **Breakdown.** Scenes, characters, locations, props, motifs, runtime estimate, and a colour note per scene from the colour script.
3. **Bible.** Locked blocks, edited only through a decision; continuity rules as checkable rules (direction of travel, which hand, the warm-light rule); the reason each motif exists.
4. **Look.** The master board, plus the palette measured from it with the existing breakdown palette code (T0). The per-part light lines live here.
5. **Characters.** The sheet set per character, wardrobe states, and age or variant sheets derived from the master.
6. **Edit in words.** A shot table per scene:
   - fields: id (never renumbered; inserted shots get a letter), default length 3 s, size and angle, start, end, movement, light line, refs (at most 3), sound or VO, status;
   - automatic checks: movement distance against length (walking is about 1.5 m/s), direction of travel across cuts, every named reference exists (O-018).
7. **Frames.**
   - The prompt is assembled in code from the bible, never retyped. Start frame first, then the end frame as an edit of the start.
   - A review strip shows the whole sequence. Each frame gets a verdict (kept, partial with one fix, or rejected), the reason, and the edit chain (parent → child, one change per edit).
   - Each frame's measured colour (saturation, brightness, warm share, red-minus-blue against the part's palette) is shown beside the verdict.
8. **Motion.**
   - The start frame, end frame and motion prompt go to a video API. A **router** picks the cheapest model that supports start and end frames at the shot's length and resolution.
   - A cost estimate is shown before the run, under the monthly cap (P4's cap), and every try is logged.
9. **Assembly.** Clips in edit order, an export list for DaVinci Resolve, and the on-screen text list for the editor.
10. **Records.** The DMT recording rules built in: generation log, decision log, process log, and a one-line receipt after each record.

## 5 · Model router and cost (fal prices read 2026-10-09; fetched live at run time, never hardcoded)

| Model on fal | Start + end frame | Price | Max length |
|---|---|---|---|
| Kling 2.6 Pro | yes (optional end frame) | $0.07/s audio off | 10 s |
| Kling O3 Pro | yes | $0.112/s audio off | 15 s |
| Seedance 2.0 | yes (optional end frame) | $0.3034/s at 720p | 15 s |
| Seedance 1.0 Pro | yes (optional end frame) | about $0.62 per 5 s at 1080p | 12 s |
| Veo 3.1 / Kling v3 Pro | end frame not stated on the page | $0.20/s; $0.112/s | 8 s; 15 s |

**Not yet verified:**
- each model's minimum billed length (a 3 s shot may be billed as 5 s);
- image-model API prices for keyframes;
- each model's commercial-use terms (hard rule 8: unclear means no).

**Rough budget for DMT** (about 150 shots × 3 s × 3 tries = 1,350 s of video): about **$95** at Kling 2.6 Pro, about **$151** at Kling O3 Pro. Keyframe images are not included.

## 6 · What this collides with in Look Lab (each needs a record and the founder's yes before any build)

1. **VISION §1, "Not a generator of films."** V-LL-003 changes this: Look Lab generates previs and animatic-grade shots for pre-production. It still does not claim that generated frames are measurements.
2. **D-LL-039, never send a frame.** Generation must send images (the start and end frames, the reference sheets). Needs a new AD:
   - generation calls may send the project's own generated images and its reference sheets;
   - client footage and breakdown references still never leave the machine unless cloud is allowed for that project (hard rule 7);
   - every upload is logged.
3. **Keys and tests (AD-LL-003, hard rules 5 and 6).** Image and video API keys live in the Keychain. The suite uses a stub provider, with zero live calls.
4. **Numbers (hard rule 11, D-LL-003).** Models make images; they never supply a measured value. The colour check on a generated frame is T0 and labelled as being about a generated frame.
5. **Memory (hard rule 4).** Generation is remote; the local cost is storing and previewing clips. Measure on the 8 GB M1.
6. **Phase order.** P4.5 (colour grading) is half built. The 2026-10-08 verdict was to pause Look Lab building and let real jobs and the DMT film decide. This plan is that evidence, but it doesn't settle when to build.

## 7 · Recommended order (the founder's call)

1. **Now:** keep making DMT Part One by hand, timing each stage (the process log records it). Those times show which stage costs most and should be automated first.
2. **First build slice** (the smallest one that removes the most pain):
   - the edit-in-words shot table and its checks;
   - prompt assembly from the bible;
   - the frame review strip with verdicts and measured colour;
   - start/end video through one API via the router;
   - automatic logging.
3. **Later:** script upload and breakdown, characters and look boards, assembly export.
4. **Last:** story generation. It's the most commoditised part and has the least moat.

## 8 · Open questions

- Where does this sit relative to P4.5: before it, after it, or as a replacement for its remaining tasks?
- One provider (fal) for every model, or direct APIs where they're cheaper?
- Is the target user the founder's agency only, or the public later? This decides the licence checks and billing.
- Is 3 s the default shot length, generated as 5 s and trimmed, or billed at 3 s where the model allows?
