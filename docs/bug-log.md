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

_None._

## Closed

### B-LL-001 · The engine would not start under plain Node although every test passed
- **Phase:** P1, 2026-09-30, first launch of the engine for the browser preview.
- **Found by:** a live run: `node --experimental-strip-types src/engine/main.ts` exited with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
- **Cause:** `RateLimiter` and `FileStore` used TypeScript constructor parameter properties (`constructor(private root: string)`). Node's type stripping only erases types; it cannot run syntax that generates code. Vitest compiles TypeScript itself, so all 75 tests were green while the real entry point could not load.
- **Fix:** plain fields assigned in the constructor. `tsconfig.json` sets `erasableSyntaxOnly`, so `npm run typecheck` now rejects that syntax anywhere.
- **Guard:** `tests/engine/boot.test.ts` starts the engine exactly as `npm start` does (plain Node, type stripping, no bundler) and calls the API. `npm run typecheck` with `erasableSyntaxOnly` is the second guard.
- **Could it return?** LOW, as long as the boot test stays in the suite. It would come back in any new engine file using enums, namespaces or parameter properties if someone skipped both the boot test and the type check.
