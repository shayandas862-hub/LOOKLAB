# Decisions — the gen-video agent

Every decision the founder made, with what was chosen, what was rejected and why. Open items at the bottom.
Plain list for now: IDs come when the product has a name and a records code. **Not part of Look Lab.**

## 2026-10-14

| # | Chose | Rejected | Why |
|---|---|---|---|
| 1 | The brand film is made entirely in code (picture and sound) | Real footage; AI-generated clips | Keeps "made entirely in code" true; the next film mixes in generated video |
| 2 | Hard rock with the *shape* of Thunderstruck: one relentless riff, a crowd shout, drums slamming in, a drop, a bigger return | Copying its riff, melody or chant | A close soundalike is a copyright risk, and platforms scan uploads and can mute or block them |
| 3 | Music synthesised in code, with a riff test first | A stock track; a session guitarist from the start | Code owns everything and is itself a post. **Taken as yes when the founder moved on; the riff test hasn't been answered** |
| 4 | Products in the film: a sneaker, a perfume, a jacket on fashion figures | Real brands | The film must read as commercials too; invented products only |
| 5 | Faceless, stylised 3D figures | Realistic people | No real faces, no lookalikes |
| 6 | A brand film: themes, visuals and type, cut to the beat, fit for marketing | A text-heavy explainer | The founder's brief |
| 7 | Push the film's code and finished files to the experiments branch | Splitting the 1080p into parts for the chat | Safe to download, in one place (`deliverables/`) |
| 8 | Document the build as it happens (`BUILD-LOG.md`, this file) | Notes only in chat | Build in public needs a record; the next session can pick up from it |
| 9 | Next: a second 1:30 film with a more enhanced concept, planned and made autonomously | Waiting for the PRD | Momentum; the film is also next week's content |
| 10 | Gen video on top of code video, checked by a verifier, through fal | — | The founder can provide a fal API key. It goes in the environment's secret settings, never the chat |

### Film 05, ONE SENTENCE: taken autonomously (the founder asked for it made without questions; any can be overruled)

| # | Chose | Rejected | Why |
|---|---|---|---|
| 11 | The product's own loop as the story: brief → plan → route → make → check → cut → world | Another "imagine anything" montage | "One step higher": it shows the system being built, which is what the posts are about |
| 12 | One travelling camera with hidden cuts | Beat cuts like ACTION | A visible step up in craft, and the loop reads as one flow |
| 13 | Every number on screen is true: read from the film's clock and camera, or measured from its own pixels | Decorative numbers | Honesty is the brand; the end card says so, so it has to be true |
| 14 | A deliberate off-brand mistake that the checker catches, measured (ΔE00 5.3 fail, 0.1 pass) | A staged "fail" with an invented number | Shows the verifier idea from `NEXT-GEN-VIDEO.md` working, in numbers |
| 15 | Made entirely in code; the AI lane is shown as one of four gates | Generated shots in this film | No fal key in this session; the generated pass is the next experiment |
| 16 | A new track in the same family: A minor, clean intro, solo over the checker, "GO!" | Reusing ACTION's track | A new film needs its own riff |
| 17 | The same faceless hero, now wearing the running shoe | A new character | A recurring character builds the brand |
| 18 | Title ONE SENTENCE; closing line "One sentence in. A world out." | ONE TAKE | Hidden cuts mean it isn't literally one take |

## Open

| Question | Status |
|---|---|
| Is the code-made music good enough? | Riff test, ACTION and ONE SENTENCE sent; waiting for the founder's ears |
| The product's name, for the end cards | PRD question 12 |
| Where finished films live and how they're handed over (the 30 MB chat limit) | Recommended: storage the founder owns plus a private link, with a small preview in chat. Not yet decided; part of PRD question 10; provider and cost need checking |
| The 9:16 versions | Not made for either film: each needs its cameras re-framed per scene, then a full render (68 min for ACTION, 66 min for ONE SENTENCE, in the cloud) |
| Films 01–03's MP4s | Never committed, not in this container. Their code renders them again (several hours in the cloud); say if they're wanted |
| The PRD's 12 questions | Parked mid-session; resume after the films |
