# marketing/ — every published post, kept exactly as it went out

The founder's posts (LinkedIn first; the website Journal and PR use the same files) are archived here, one folder per
post, holding **the exact files that were published**: the text, the first comment, the video, the cover and the
comment picture. A SHA-256 hash of each file proves that a copy is the published one, wherever it is found.

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab: `tsconfig.json` includes `src`
and `tests`, `vitest.config.ts` includes `tests/**`, and Vite's root is `src/ui`. Decided in D-LL-057.

## One id per post

`post_id` = `YYYY-MM-DD-slug`: the date it was published (UK date) and a few words from its first line, for example
`2026-10-13-written-not-edited`. It is the same id the LinkedIn engine already uses in Notion (`posts.post_id`), and the
same slug the website Journal post uses. Until a post is published its date may change; once it is published, the id
never changes.

## What each folder holds

```
marketing/posts/<post_id>/
  post.md          the post text exactly as published, hashtags included
  comment.md       the first (pinned) comment, exactly as published; only if there is one
  manifest.json    where it went, when, the hash of every file, where every picture and number came from
  media/
    video.mp4      the exact file that was uploaded (not a re-export)
    thumbnail.png  the video's cover
    comment.png    the picture attached to the first comment
  build/           the script that made the media, so it can be made again
```

Files a post does not have are simply absent. Names are fixed, so every folder reads the same way.

## manifest.json

| Field | What it holds |
|---|---|
| `post_id`, `title`, `channel`, `format`, `pillar` | The post, as the Notion `posts` row names it |
| `status` | `ready` (made, not yet posted) or `published` |
| `published_at`, `post_url` | When and where it went out; required once `published` |
| `notion_post`, `website_post` | The Notion `posts` row and the website Journal post, when they exist |
| `files[]` | `path`, `role`, `bytes`, `sha256` for every file in the folder |
| `not_in_git[]` | Files that matter but are too big for git, with their hash and why |
| `sources[]` | Every film, frame or clip used: repo, branch, commit, path and the time range |
| `numbers[]` | Every number in the text or the pictures, with the document it comes from |
| `rule_exceptions[]` | Where the post breaks a `linkedin_engine` rule, and who decided |
| `missing[]` | What should be here but isn't yet, and who has it |

## Rules

1. **Exact copies only.** `post.md` is what was pasted into LinkedIn; `video.mp4` is the file that was uploaded.
   Never a re-encode, a re-type or a "close enough".
2. **A published folder is frozen.** If the post is edited on LinkedIn, add `post.v2.md` and say when in the manifest;
   never overwrite. `node marketing/verify.mjs --fill` never changes a hash a published manifest already records; it
   only adds hashes for files added later.
3. **Every number has a source.** Each number in the post or its pictures is listed in `numbers[]` with the document
   that measured it (the build log, a test result). No number is typed from memory.
4. **Files stay under 95 MB.** GitHub refuses files over 100 MB. A bigger file (a master) goes in `not_in_git[]` with
   its hash and how to make it again (`build/`).
5. **Only what is public.** Nothing private, no secrets, no client material: this repo is public. Other people's names,
   comments and messages never come here; they go to Notion (`engagement`, `conversations`).
6. **Committed when published.** A folder may be prepared at `ready`, but it reaches GitHub only after the post is live
   and its `post_url` is filled in. Drafts live in Notion (`posts`, status `queued`) and `~/Desktop/linkedin/`.

## Where each copy lives, and how they match

| Place | Holds | Matched by |
|---|---|---|
| This folder (GitHub) | The canonical files and their hashes | `post_id` |
| Notion `linkedin_engine → posts` | The plan, status, reasoning and the numbers after posting (impressions, reactions, comments, DMs) | `post_id`; its `notes` give `marketing/posts/<post_id>/` and the video's SHA-256 |
| LinkedIn | The live post | `post_url`, in the manifest and in Notion |
| Website Journal (`🌐 Website content`) | The long version of the same story | slug = `post_id`; "Also on LinkedIn" = `post_url`; Cover image = `media/thumbnail.png` |
| Notion `linkedin_engine → engagement` | Who commented, replied or DM'd, their company and role, warmth, next action | the post's `post_id` in `notes` (a relation to `posts` is proposed) |
| Notion `GOAL → conversations` | Email threads with employers that a post led to | `company`, and the application it belongs to |
| `~/Desktop/linkedin/` | Scratch while making it | Nothing canonical |

## The workflow, post by post

1. **Make.** The film or picture is made in code (the build script goes in `build/`); every number comes from a
   document in a repo.
2. **Draft.** The Notion `posts` row: Title, `post_id`, format, pillar, reasoning, `media_brief`, status `queued`.
3. **Prepare.** Create `marketing/posts/<post_id>/`, put the final files in, write the manifest, then run
   `node marketing/verify.mjs --fill` to record sizes and hashes.
4. **Publish.** The founder posts by hand (the engine never touches the LinkedIn account) and pins the first comment.
5. **Close.** Fill `published_at` and `post_url`, set `status` to `published`, run `node marketing/verify.mjs`, and
   commit the folder. In Notion: status `published`, `post_url`, `published_at`, and in `notes` the archive path and
   the video's SHA-256.
6. **Cross-post.** Website Journal post with the same slug, the same cover, and "Also on LinkedIn" set.
7. **Measure.** After seven days, copy impressions, reactions, comments and inbound DMs into the Notion row.
8. **Follow up.** Everyone worth answering who commented or messaged gets a row in Notion `engagement` (person,
   company, role, comment or DM, warmth, next action, and the `post_id`). A thread with an employer goes to
   `conversations`.

## Check it

```sh
node marketing/verify.mjs          # every manifest: files present, sizes and hashes match, required fields, sources
node marketing/verify.mjs --fill   # record sizes and hashes (any file while ready; only new files once published)
```

## How other sessions find this

- **Claude Code in this repo:** `CLAUDE.md` points here ("Marketing posts"), so every session reads this file before
  making a post.
- **The LinkedIn engine and Notion skills:** the Notion `wiring` page, which every engine skill reads first, points
  here (proposed; needs the founder's yes).
- **Anywhere else:** start the request with "follow marketing/README.md in LOOKLAB".
