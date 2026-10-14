# Next session: sharpen the PRD for the gen-video agent

**Where to run it.** The best place is a new, empty GitHub repo for this product, with a Claude Code session started
on it (or Claude Chat, if you'd rather brainstorm there). If you run it inside LOOKLAB instead, start on branch
`shayan/kind-hamilton-nvl2fl`. Look Lab's own `CLAUDE.md` is about its colour phase and will load too; the prompt below
says to set it aside.

**How to use it.** Copy everything below the line into the first message. If you have the `brain-dump`, `grill-me`
and `to-prd` skills, the prompt asks for them in that order.

---

## Who I am and what this session is for

I'm the founder of a film and video production agency. I'm building an autonomous AI agent for generative video and
creative work. This session is **for the PRD only: no code, no architecture yet.** Brainstorm with me, grill me
one question at a time, then write the documents listed at the end. If this repo has a `CLAUDE.md` with build tasks
(Look Lab's colour phase), set them aside: this is a different product and nothing in Look Lab changes.

## What I'm building, in one line

**Cursor + OpenClaw for generative video.** You give it a goal ("a 30-second launch film for this product, warm,
premium"). It plans the film and picks the right engine for each shot. It makes the shots, checks them, fixes what
fails, and hands back a finished cut. It doesn't just prompt one video model.

## Why: the bigger goal

I'm building a **simulation company**: interactive simulations of the real world. Autonomous video is the first step.
If the machine can describe a scene as data (world, camera, lights, characters, timing) and render it, the same scene
can later run live and be explored or acted in. So every scene should stay data, not only pixels.

## What's already proved (and what isn't)

Three films were made in one Claude Code session, all by code. Every frame is a function of time; a headless Chrome
renders it frame by frame; ffmpeg makes the MP4; the music is synthesised from the same timeline. The code is in
`incubator/video-harness-experiments/` in the LOOKLAB repo (branch `shayan/kind-hamilton-nvl2fl`).

| Film | What it proved | Render in the cloud (no GPU) |
|---|---|---|
| Look Lab pitch, 15 s | 2D motion graphics, type, UI, data, music in code | about 15 min |
| Brief to film, 15 s | 3D, motion blur, a moving camera, lighting, reflections | about 60 min |
| First Light, 40 s, 13 shots | Characters, a story, blocking, depth of field, shadows, score, foley | about 2 h 15 min |

A small verifier read the camera and character motion of film 3 and caught two real mistakes that I then fixed.

**Look Lab** (my other project) already measures footage: the palette, the light direction, and colour matching against a
reference. It also has Blender ground-truth tests. It could become the "eyes" of this agent.

**Not proved yet:**
- photoreal people
- mixing AI video, filmed footage and code-made shots in one cut
- running on its own (I directed every step)
- speed (no GPU in that cloud)
- cost per film

## Draft architecture, in plain words (challenge it, don't take it as final)

1. **Front door.** I talk to it in its own app, in Claude Code, or through MCP from any agent. Sign-in can use my
   Claude Code subscription (over MCP) or an API key.
2. **Director (the brain).** Claude turns the goal into a plan: a script, a shot list, and a "shot package" for each
   shot. A shot package holds the scene, camera, lights, characters, timing and the look.
3. **Router.** For each shot it picks the cheapest engine that meets the quality bar:
   - **code:** text, UI, data, logos, exact motion
   - **3D or Blender:** camera moves, blocking, products, stylised characters
   - **AI video models:** people, nature, texture, realism
   - **filmed footage:** when we have it
4. **Workers.** The code renderer, Blender run headless on a cloud GPU, video and image model APIs (fal, Runware,
   Runway and others), voice and music, and ffmpeg to cut, composite and grade.
5. **Verifier.** It checks every shot against its plan and sends failures back to the director to retry:
   - motion
   - colour and look match (Look Lab)
   - spelling on screen
   - length and loudness
   - consent for faces
   - brand rules
6. **Memory.** The project's state, saved: the brief, the plan, every take, scores, costs, approvals and brand kits.
   It's stateful, so a run can stop and resume.
7. **Money and safety.** A cost estimate before anything is spent, a monthly cap, keys kept in a vault, and a person's
   approval before anything is published.
8. **Skills and tools.** Each engine or technique is a skill or tool the director can call. The agent is also an MCP
   server, so other agents can drive it.
9. **Publisher.** It drafts posts and cut-downs for LinkedIn, X and Instagram (16:9, 1:1, 9:16). I approve every one.

## The content track (runs alongside the build)

I'll build in public: "built in public, for the public". Every day I post a small proof on LinkedIn, X and Instagram:
- a shot
- a before and after
- a verifier catch
- a cost number
- a short film

Each phase of the build is also next week's content. I share the milestones and a little of the architecture, never
the exact method. I approve every post, and nothing shows a real person's face without their consent.

## Constraints

- **My machine is an 8 GB M1 Mac.** Heavy rendering and 3D run in the cloud, pay per use.
- **Prices, speeds and model abilities aren't to be recalled from memory.** Check them at the time, or mark them "needs checking".
- **Licences:** check commercial use for every model, asset and font. Unclear means no.
- **Faces:** only of people who agreed, and no lookalikes of real people.
- **Keys:** never in chat, files or commits. They go in a vault or the environment's secret settings.
- **Look Lab stays a separate product,** and its main branch is not touched.

## Grill me on these (one at a time, with your recommended answer)

1. Who is v1 for: my agency only, other studios, or solo creators?
2. What's the first job it must do end to end without me? For example, a 15–30 s product film from a one-paragraph brief.
3. How autonomous should it be: do I approve the plan only, every shot, or only the final cut?
4. What does "good enough to ship" mean, and how does the verifier measure it?
5. What's the budget per film and per month? When others use it, who pays for the model calls?
6. Where does it run: a web app, a desktop app, a Claude Code plugin or MCP server, or all of these?
7. Open source, closed, or an open core like OpenClaw?
8. How does it relate to Look Lab: separate, or does Look Lab become its measuring tool?
9. What does "simulation company" mean concretely in 12 months?
10. Whose footage and data is it, where is it stored, and what may be sent to model providers?
11. What is **not** in v1?
12. What's it called?

## What I want at the end of this session

- `docs/VISION.md`: one page. The why, the one-line product, and the path to simulation.
- `docs/PRD.md`: who it's for, the jobs it does, v1 scope, what's out of scope, how we'll know it works, risks, and open
  questions.
- `docs/CONTENT-PLAN.md`: the build-in-public plan. Platforms, cadence, formats per platform, the approval step, and
  the first two weeks of posts.
- `docs/decision-log.md`: every decision I made in this session, with what I chose, what I rejected and why.
- A short list of what the **architecture** session must decide next.

Then stop. Later sessions, in order: architecture → phase cards → a builder `CLAUDE.md` → build phase 1.

## How to work with me

- Ask one question at a time, recommend an answer, and let me say yes or no.
- Use plain language. If I drift into building, bring me back to the PRD.
- Don't make up numbers. Use web search to check prices or abilities, or write "needs checking".
- Don't write code. Don't commit or push without my yes.
