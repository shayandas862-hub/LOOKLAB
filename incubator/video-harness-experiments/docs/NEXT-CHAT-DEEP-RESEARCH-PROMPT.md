# Prompt for a new chat: does an autonomous video agent already exist, in pieces?

Written 2026-10-15. **This is the prompt only; the research has not been done.** Paste everything below the line
into a new chat with deep research (or web search) switched on. It is self-contained: the new chat needs nothing
from this repo. When the report comes back, save it as `reports/Autonomous video agent landscape.md` beside the
face-scan report, with its notes in `research_notes/`.

---

## Who I am, and what I want from you

I run a film and video production company (Das Production). I'm building a product. Before I go further I need to
know, honestly, whether it already exists in bits and pieces, and whether the big players are already building it.
**Do the full research now:** search widely, read the primary pages, and write the report described at the end.
Don't ask me questions first; if something is ambiguous, state the assumption you made and carry on.

Don't tell me what I want to hear. If the answer is "this is already done, and better than you can do it", say so
and show the evidence.

## What I'm building, in one sentence

**An autonomous video AI agent: from one prompt it understands everything (asking only if it really needs to),
does everything, and gives back a finished video that the person who prompted it actually likes.**

I've also described it as "Cursor plus OpenClaw for generative video": you give it a goal ("a 30-second launch film
for this product, warm, premium"), it plans the film, picks the right engine for each shot, makes the shots, checks
them, fixes what fails, and hands back a finished cut with sound, in every size. It doesn't just prompt one video
model.

That sentence makes four promises. Research each one separately:

1. **One prompt in.** A single brief is enough; no node graphs, no timeline, no prompt engineering by the user.
2. **It understands.** It works out the intent, the audience, the brand, the format and the missing details, and
   asks a question only when it truly can't decide.
3. **It does everything.** Script, storyboard, shot list, the shots themselves (generated, 3D or stock), voice,
   music, sound, edit, colour, titles, versions (16:9, 9:16, 1:1; long and short cuts), delivery.
4. **The person likes the result.** It judges its own output (quality, taste, on-brief, on-brand), fixes or retries
   what fails, and learns what this person likes.

## How I'm approaching it (so you can compare, not so you can praise it)

My bet: generation alone can't be trusted for anything that must be exact. So the parts that must be exact (the
product, logo, text, colours, framing, timing, camera move) are built in code as a 3D "skeleton", and AI video
models only paint the surface that must look real ("skin on skeleton", using control inputs such as depth, edges,
masks and pose). A checker measures every generated clip against the skeleton with pass marks written before the
clip exists, and the exact parts are put back on top. A person approves a cheap preview before money is spent on
generation. I've built films and a checker this way; the skin-on-skeleton step itself is not yet proven.

Tell me plainly: is this approach already used by others (in products, studios or papers)? Is it a real edge, a
niche, or a dead end that the big models will make pointless?

## The questions

**A. Is the whole thing already built?**
- Who sells or demos an end-to-end "prompt in, finished video out" agent today? For each: what it really does end
  to end, what kind of video (ads, social, explainers, product, music videos, narrative, avatars or talking heads),
  how long and how good the output is, how much the user still does by hand, price, and who it's for.
- Separate clearly: **shipped and generally available**, **beta or waitlist**, **announced or demo only**, and
  **research paper only**. Give the date of each claim.
- Which of them come closest to all four promises above, and where does each fall short?

**B. The big players: what are they building?**
- For each large company in video and AI, what has it shipped, announced or signalled (roadmaps, keynotes,
  acquisitions, hiring, research papers) towards an agent that makes whole videos, not just clips?
- Check at least these, and add any I've missed. **These are names to check, not facts:** my list may be out of
  date or wrong, and their abilities must be read from current sources, not from memory: Google and DeepMind (Veo,
  Flow, YouTube's tools), OpenAI (Sora), Meta (Movie Gen and its ads tools), Adobe (Firefly, Premiere), Apple,
  Amazon, Microsoft, ByteDance (Seedance, CapCut), Kuaishou (Kling), Alibaba (Wan), Tencent (Hunyuan), MiniMax
  (Hailuo), xAI (Grok Imagine), Runway, Luma, Pika, Lightricks (LTX Studio), Moonvalley, Black Forest Labs,
  Stability, NVIDIA (Cosmos), Autodesk (Flow Studio, formerly Wonder Dynamics), Canva, Higgsfield.

**C. The startups and open source assembling the pieces**
- Startups building agentic video pipelines: what they do, funding, traction, customers, pricing. Include the ones
  aimed at ads and e-commerce, social content, avatars and presenters, previs and storyboards, and narrative or
  animated shows.
- Open source and research: multi-agent film-making systems, script-to-video pipelines, workflow tools (for example
  ComfyUI-based pipelines), and evaluation code. Note each one's licence and whether commercial use is allowed.

**D. The pieces, one by one: who is best at each today?**
For each piece, the leading options (commercial and open), how good they are, and their known limits:
1. Brief understanding and planning (script, shot list, storyboard).
2. Shot generation: text-to-video, image-to-video, video-to-video.
3. **Control and consistency:** the same character, product and logo across shots; structure control (depth, pose,
   edges, masks); camera control; keeping text and logos exact. Is anyone solving "exact product in generated
   footage" reliably?
4. 3D and code-driven previs used as the base for generation (game engines, Blender, three.js, Unreal).
5. Voice, music and sound effects, and lip sync.
6. Editing, pacing to music, colour, titles, versions and delivery.
7. **Automatic quality checks and taste:** how systems judge whether a clip is good, on-brief and on-brand
   (benchmarks such as VBench, aesthetic and preference scorers, reward models, vision-language model judges,
   human-in-the-loop review). How well do these agree with real people?
8. Learning a user's or a brand's taste over time.

**E. The gaps**
- What still fails today, with evidence: user complaints (forums, Reddit, reviews, X), agency and studio
  interviews, industry reports. Especially: exactness (products, logos, text), continuity between shots, length,
  control, rights and licences, cost per usable second, and the time humans still spend fixing output.
- Which gaps are the big players likely to close soon on their own, and which are likely to stay open? Say why.

**F. The market**
- Who buys this today (brands, agencies, production companies, creators, e-commerce) and what they pay. Market
  sizes only from named sources with their dates; say if a number is an estimate.
- Funding and deals in this space over the last 18 months.
- What production companies and agencies like mine are actually doing with AI video now.

**G. The verdict for me**
- Is the one-sentence product already done? By whom, and how well?
- Where is there real room left, given what the big players will likely ship? Name specific openings (a type of
  video, a type of customer, a missing piece such as exactness, checking or taste).
- What would make a small company's version defensible, and what would make it pointless?
- Three options for what I should do next, with the trade-off of each, and which you'd pick.

## Rules for the research

- **Prices, speeds and model abilities are never taken from memory.** Read them from the source at the time and
  give the date read. If you can't check one, write "needs checking".
- **Cite every claim** with a link to the page you read and the date. Mark *(search summary)* when the fact came
  from a search engine's summary rather than the page itself, *(secondary)* when the source is a news site, blog,
  reseller or competitor rather than the company itself, and *(unverified)* when you couldn't confirm it.
- **Demos are not products.** Say whether a claim comes from a shipped product, a beta, a demo video, a press
  release or a paper. Cherry-picked demos count as demos.
- **Licences:** for every model, tool or dataset you mention as usable, say whether commercial use is allowed. If
  it's unclear, say unclear, and treat it as not allowed.
- Prefer primary sources: company pages, docs, pricing pages, changelogs, papers, filings. Use news and blogs to
  find things, then confirm them at the source where you can.
- Note anything you couldn't reach (paywalls, logins, regions).

## How to write the report

- **Plain English.** Short sentences, no jargon without a one-line explanation. I'll read it on my phone.
- **Start with the answer:** one paragraph that answers "does it exist, in pieces or whole, and who is building
  it?", then the three most important findings.
- Then these sections, in this order:
  1. **The map:** one table of every player found, with columns: name, type (big player, startup, open source,
     research), what it does, how many of my four promises it covers, stage (shipped, beta, announced, paper),
     price, licence for commercial use, source and date.
  2. **The four promises:** for each, who does it best today and how far it is from "done".
  3. **The big players**, one short section each.
  4. **The pieces** (section D), one table per piece.
  5. **The gaps**, with evidence.
  6. **My approach compared:** who else does code or 3D first then generation, and checks against a plan. Is it
     an edge or not, and why.
  7. **The market and the money.**
  8. **The verdict and three options** (section G).
  9. **What this report couldn't check**, and what would change its conclusions.
  10. **Sources:** every link, with the date read and its marker.
- Keep the whole report readable in about 20 minutes; put the detail in the tables.
