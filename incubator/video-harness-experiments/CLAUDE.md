# video-harness-experiments: standing rules for any Claude session working here

This folder is the founder's gen-video agent experiments. **It is not Look Lab.** The repo root's `CLAUDE.md` is
Look Lab's colour phase (P4.5): its tasks, phases and test rules don't apply to work in this folder. Look Lab's
`main` branch is never touched; work here happens on branch `shayan/kind-hamilton-nvl2fl`. Nothing in this folder is
imported, built, tested or served by Look Lab (D-LL-056).

## The founder's rules (verbatim where quoted)

- "Prices, speeds and model abilities aren't to be recalled from memory. Check them at the time, or mark them
  'needs checking'."
- "Licences: check commercial use for every model, asset and font. Unclear means no."
- "Faces: only of people who agreed, and no lookalikes of real people."
- "Keys: never in chat, files or commits. They go in a vault or the environment's secret settings." A key is read
  from the environment (`FAL_KEY`) and never printed, logged or written down.
- Money is spent only after the founder's yes to a total, and never past the cap they gave.
- Pass marks are written before results and never moved after. A failure is reported as a failure.
- Generated clips from third-party models stay out of git (`out/`, `clips/` are ignored) until their terms are
  checked. The tests are "for test, not commercial".
- Commit by name (never `git add -A`; never `.claude/`); push to `shayan/kind-hamilton-nvl2fl`. No pull request
  unless the founder asks.

## Keeping a session's context small

- Start from the one entry file the task names (for Test 1: `08-skin-test/RUNBOOK.md`); open other files only when
  a step needs them.
- Scripts print a few lines; full output goes to `out/logs/`; read logs with `tail`.
- Don't open frames or videos to look at them unless a step says to; prefer the one contact sheet a step makes.
- State lives in files (logs, JSON reports, `RESULTS.md`), not in the chat, so work survives a summarised or new chat.

## Where things are

`README.md` (index) · `docs/REPO-STATUS.md` (every branch, every folder, status) · `docs/PROPOSED-ARCHITECTURE.md`
(the seven parts) · `docs/MEDIA-PRIMER.md` · `docs/BUILD-LOG.md` · `docs/DECISIONS.md` · `deliverables/` (finished
films) · `07-grok-test/` (the checker) · `08-skin-test/` (Test 1 on fal).
