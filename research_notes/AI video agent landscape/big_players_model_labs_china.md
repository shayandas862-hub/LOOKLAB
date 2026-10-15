# Chinese tech companies and specialist video-model labs: what they have shipped, announced or signalled towards a whole-video agent (as of 2026-10-15)

Conventions used throughout these notes:
- **Date read:** every link below was read on **2026-10-15** (today) unless marked otherwise. "Read" means the page itself was fetched, except where marked **(search summary)**: then only a search engine's summary of that URL was seen, not the page.
- **Source tags:** (primary) = the company's own site, docs, licence, changelog, GitHub/Hugging Face or press release; (secondary) = news or partner site; (search summary) = see above; (unverified) = single non-primary source, not confirmed.
- **Stage labels:** **[GA]** shipped and generally available; **[Beta/limited]** beta, waitlist or one subscriber tier only; **[Announced/demo]** announced or demo only; **[Paper/weights]** research paper or open weights only.
- **The four promises** (client's): P1 one prompt in, no node graph or timeline; P2 understands intent, audience, brand and format, asks only when needed; P3 does everything (script, storyboard, shot list, shots, voice, music, sound, edit, colour, titles, versions, delivery); P4 the person likes it (judges own output, fixes failures, learns taste). Scores: **Yes / Partial / No / Unknown**, based only on what the company states.
- **Research limits:** the session's shared web-search budget ran out part-way through, so some companies (Midjourney, Baidu, Zhipu, StepFun, Kunlun, Genmo, Decart, ByteDance OmniHuman, Alibaba Qwen agents) could not be checked; they are listed as gaps, not guessed. Chinese-language primary pages (Jimeng, Volcano Engine, Kuaishou Chinese IR) were not read. Pages behind logins (Kling API pricing, Hailuo pricing) returned no prices. ltx.io/studio failed to load ("header overflow") twice.

## Cross-company summary: who already offers an agent, multi-shot or storyboard-to-film product, and how close is anyone to the four promises?

### Takeaway
As of 2026-10-15, "describe the finished video in a chat and get it back" agents are shipped by Runway (Runway Agent, GA since 2026-05-13), Luma (Luma Agents, in commercial use by April 2026), Kling (Agent inside Canvas plus MCP/CLI), Higgsfield ("Supercomputer"), Hedra, Krea, Vidu and ByteDance's Pippit, but every one is aimed at marketing assets or sits inside a canvas or timeline. **None states that it judges its own output against the person's taste, fixes failed shots itself and learns that taste over time (P4).** The shared direction is clear, though: model routers that pick an engine per task, third-party models used as interchangeable parts, brand kits, multi-format delivery, and MCP servers so that general LLM agents (ChatGPT/OpenAI "Dots", Claude, Grok Bot, Cursor) become the planner. A small independent product can still win on P2 and P4 and on film-specific craft, but not on raw generation.

### Cited Findings
**Relative quality (independent arena, with audio), read 2026-10-15:** Artificial Analysis "text-to-video with audio" leaderboard top 20: 1 Wan 3.0 (Alibaba, Elo 1174, Aug 2026); 2 Utopai X (Utopai Studios, 1169, Sep 2026); 3 Dreamina Seedance 2.5 (ByteDance Seed, 1160, Jul 2026); 4 MiniMax H3 768p (1159, Jul 2026); 5 MiniMax H3 Max (1155); 6 FLUX 3 (Black Forest Labs, 1147, Jul 2026); 7 Seedance 2.0 (1136, Mar 2026); 8 Gemini Omni Flash 1.1 (Google, 1132); 9 Agnes-Video-2.5 (Sapiens AI, 1069); 10 Grok Imagine Video 1.5 (listed creator "SpaceXAI", 1061, May 2026); 11 HappyHorse-1.1 (Alibaba-ATH, 1055); 12 MAGI-2 Preview (Sand.ai, 1045, Sep 2026); 13 Wan2.7 (Alibaba, 1039, Jun 2026); 14 HappyHorse-1.0 (1036); 15 Kling 3.0 Omni 1080p Pro (1019); 16 Kling 3.0 1080p Pro (1000, the board's fixed reference point); 17 Grok Imagine Video 1.5 Lite (998); 18 PixVerse V6 (988); 19 Veo 3.1 (967); 20 Veo 3.1 Fast (965). Runway, Luma, Moonvalley and Pika models do not appear in the top 20 of this board. Kling 4.0 is not yet on it. — [Artificial Analysis leaderboard (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

**Promise coverage matrix (only what each company states; details and sources in each section below):**

| Company | Whole-video agent product? (stage) | Multi-shot / storyboard | P1 one prompt | P2 asks only when needed | P3 does everything | P4 judges, fixes, learns taste |
|---|---|---|---|---|---|---|
| Runway | Runway Agent [GA 2026-05-13], Agent 2.0, Skills, Workflows, timeline, Brand Kits, Model Router | Agent plans campaigns; no storyboard stated | Yes (one conversation) | Partial (works out positioning; clarifying questions not stated) | Partial (voiceover, edits, resize, localise, timeline, brand kits; music/sound and HDR grading exist as tools) | No (diagnoses user-supplied underperforming ads; no self-QA stated) |
| Luma | Luma Agents [GA, used for Mazda ad by 2026-04-15] | Not stated | Yes (stated as agent) | Unknown | Partial | Unknown |
| Kling (Kuaishou) | Agent in Canvas + Creative Studio Agent tab; MCP and CLI [GA, per Q2 2026 results] | Multi-shot in 3.0 (search summary); storyboards via Canvas Skills | Partial (Canvas = node editing) | Unknown | Partial (script writing, storyboard, generation, post) | Unknown |
| ByteDance | Pippit Video Agent [GA]; Dreamina has no agent stated on its page | Seedance 2.5 30 s + multi-turn extension + timestamp edits | Yes for marketing (link or file to video) | Unknown | Partial (avatars, translation, scheduling) | No (none stated) |
| Alibaba | None found | Wan 3.0 30 s, 20 references, document input | No | No | No | No |
| MiniMax | "Hailuo Agent" in site navigation; Media Agent (renamed Oct 2025, search summary) | Not stated | Partial | Unknown | Partial (own speech and music models) | Unknown |
| Tencent | None found | Not stated | No | No | No | No |
| xAI | None found for video (models reachable via Runway MCP from Grok Bot) | Extend only | No | No | No | No |
| Lightricks | LTX Studio script → scenes → storyboard → shots (secondary; page unreachable) | Yes (storyboard-first) | Partial (script in, but editor-driven) | Unknown | Partial | Unknown |
| Moonvalley | None (model + controls) | No | No | No | No | No |
| Black Forest Labs | None; FLUX 3 Video does multi-scene clips | Multiple scenes/angles in one 20 s clip | No | No | No | No |
| Stability AI | None (no 2026 video model on news page) | No | No | No | No | No |
| Higgsfield | "Supercomputer" superagent; MCP for Claude; ChatGPT Dots roles | Cinema Studio 4.0 | Partial | Unknown | Partial | Unknown |
| Pika | None stated; "New Pika" unified studio 2026-09-17 | Pikaframes (keyframes) | No | No | Partial (own speech, music, SFX) | No |
| Vidu (Shengshu) | Vidu Agent "from a single sentence to a complete work" [GA, undated] | Storyboard feature (user testimonial) | Yes (stated) | Unknown | Unknown | Unknown |
| Hedra | Hedra Agent (multi-step image, video, audio) | Not stated | Partial | Unknown | Partial | Unknown |
| Krea | Krea Agent, Nodes Agent | No | Partial | Unknown | Partial | Unknown |

- LLM platforms are becoming the planner on top of video tools: Runway lists "OpenAI Dots x Runway" (2026-10-01, "for planning and shooting spots"), "Runway MCP for Grok Bot" (2026-09-17), "Runway MCP on Cursor" (2026-09-23) — [Runway changelog (primary)](https://runway.com/changelog); Luma lists "Claude Motion" (2026-10-08: Claude videos can open in Luma, where the Luma agent can refine or reformat them) — [Luma news (primary)](https://lumalabs.ai/news); Higgsfield advertises "Higgsfield MCP for Claude" and "Dots with Higgsfield MCP (ChatGPT)" — [Higgsfield (primary)](https://higgsfield.ai); Kling's MCP and CLI let "AI agents orchestrate Kling AI for batch content creation" — [Kuaishou Q2 2026 results (primary press release)](https://www.webull.com/news/15428603170825216).

### Inferences
- The "picks the right engine per shot" part of P3 is now commodity: Runway's Model Routers (2026-07-21) and the many aggregators (Higgsfield, Pika, Krea, Luma, Dreamina) all expose Seedance, Wan, Kling, MiniMax and Veo side by side. The client should not plan to differentiate on routing alone.
- The gap all of them leave open is P2 (asking only when needed, for a film rather than an ad) and P4 (self-judging plus taste memory). No company's own page claims P4. That is the most defensible space for a small builder, and also the hardest to prove.
- Chinese model makers (ByteDance, Alibaba, Kuaishou, MiniMax) currently lead raw quality on the independent board; Western labs (Runway, Luma) are moving up the stack into agents and workflow and reselling Chinese models inside them. Whether "these companies will build it": Runway, Luma and Kling are already building the marketing version; nobody has shipped the film version with self-QA.

### Gaps
- No independent test of any agent's end-to-end output quality was found; all agent descriptions are the vendors' own.
- LMArena's video leaderboard was not read (search budget exhausted).
- Utopai X (Utopai Studios, #2 on the board) was not researched; who makes it and its terms are unknown.

## ByteDance (Seedance, Dreamina/CapCut, Pippit, Seedream, OmniHuman, BytePlus): what is shipped, at what price and terms, and how far from the four promises?

### Takeaway
ByteDance ships the strongest closed model family after Alibaba on the independent board (Seedance 2.5, 30 s per run, 50 references, timestamp edits) and a marketing video agent (Pippit), but Seedance 2.0 drew cease-and-desist letters from Disney, Netflix and Paramount in Feb 2026, CapCut has been banned in India since 2020, and official API prices could not be read. Pippit covers P1 for ads; nothing covers P4.

### Cited Findings
- **Seedance 2.5 [GA in China; global via partners]:** released 2026-07-31; "a 30-second, high-quality clip in a single run", "multi-turn extension for longer sequences", one input can include up to 30 images, 10 videos and 10 audio clips; rolling out to Jimeng AI and Doubao Pro, API "expected soon" on Volcano Engine Ark (as of the article) — [TechNode, 2026-07-31 (secondary)](https://technode.com/2026/07/31/bytedance-launches-seedance-2-5-video-generation-model/). Wikipedia adds: first shown 2026-06-23 at Volcano Engine FORCE (search summary only), generates audio and video in one pass, can be extended over multiple rounds "into videos lasting several minutes", and users can edit specific timestamps (e.g. a character's appearance) without regenerating the whole video — [Wikipedia: Seedance 2.0 (secondary)](https://en.wikipedia.org/wiki/Seedance_2.0).
- **Seedance 2.5 outside China:** on Runway via MCP from 2026-08-11 ("up to 30-second video with audio"), 1080p across Runway surfaces from 2026-08-15, a 480p "Draft Mode in Agent" from 2026-10-02 — [Runway changelog (primary)](https://runway.com/changelog); on Luma from 2026-08-06 — [Luma news (primary)](https://lumalabs.ai/news); headlined on Dreamina, Pippit, Higgsfield, Pika and Krea — [Dreamina (primary)](https://dreamina.capcut.com), [Pippit (primary)](https://www.pippit.ai), [Higgsfield (primary)](https://higgsfield.ai), [Pika (primary)](https://pika.art), [Krea (primary)](https://www.krea.ai).
- **Seedance 2.0 [GA]:** released 2026-02-12, clips up to 15 s; Seedance 1.5 Pro (Dec 2025) generated audio and video together with lip sync, SFX and music; Seedance 1.0 (Jun 2025) supported multiple shots in one clip — [Wikipedia (secondary)](https://en.wikipedia.org/wiki/Seedance_2.0). Seedance 2.0 4K via Runway MCP (2026-07-22); Seedance 2.0 Mini and Fast tiers (2026-07-21) — [Runway changelog (primary)](https://runway.com/changelog). Seedance 2.0 Mini launched mid-June 2026 at about 50% less than standard 2.0 — [Atlas Cloud (search summary)](https://www.atlascloud.ai/blog/ai-updates/seedance-2.0-mini-overview).
- **Copyright disputes (Seedance 2.0):** MPA denounced it 2026-02-13; Disney cease-and-desist 2026-02-13; Paramount Skydance accused ByteDance of "blatant infringement" ~2026-02-15; SAG-AFTRA condemned it; ByteDance said 2026-02-16 it "respects intellectual property rights" and would strengthen safeguards; Netflix cease-and-desist 2026-02-17 calling it "a high-speed piracy engine"; US Senators Blackburn and Welch asked ByteDance to shut it down 2026-03-16 — [Wikipedia, citing Variety, Axios, CNBC (secondary)](https://en.wikipedia.org/wiki/Seedance_2.0).
- **CapCut / Dreamina rollout:** from 2026-03-26 Seedance 2.0 rolled out outside China through CapCut as "Dreamina Seedance 2.0", first in Brazil, Indonesia, Malaysia, Mexico, the Philippines, Thailand and Vietnam, US excluded; the CapCut version refuses images or videos with real faces, blocks unauthorised IP and adds an invisible watermark — [Wikipedia, citing TechCrunch (secondary)](https://en.wikipedia.org/wiki/Seedance_2.0). Runway offered Seedance 2.0 with "outside-US availability" from 2026-04-07 — [Runway changelog (primary)](https://runway.com/changelog).
- **Dreamina today [GA]:** features Seedance 2.5, 2.0, 2.0 Mini, plus Sora 2 and Veo 3.1; tools "Cinema studio", "Trends studio", "Marketing studio", "Reference to video"; no agent, multi-shot or storyboard mode named; OmniHuman not named; banner "up to 90% off, starting at $1.50/month" (limited time; final price after sign-in) — [Dreamina (primary)](https://dreamina.capcut.com).
- **Pippit (marketing video agent) [GA]:** "Video Agent" ("Anything to Video": "any link, file, or media into videos, with customizable aspect ratios and durations"), Reference Video (reuses a trending video's script, structure and visuals), Video Translation, Image Agent, Digital Avatars (custom "twin" from a photo), "AI Drama" under Story Studio, Schedule Posting, Content Publisher, Data Analytics; models: Seedance 2.5 ("Precise Segment Editing"), Seedream 5.0 Pro, Sora 2, Veo 3.1, Nano Banana Pro; no prices on the page — [Pippit (primary)](https://www.pippit.ai). Pippit is the former CapCut Commerce Pro, rebranded Aug 2025; free tier 150 credits/week with watermark; paid prices conflict across third parties ($20.84–$36.25/month) — [tlinky review (search summary)](https://tlinky.com/pippit-ai-review.md), [xpay (search summary)](https://www.xpay.sh/agent-ready-index/pippit-ai/). A "Short Drama Agent" converting scripts up to 100,000 words into video — [episteme wiki (search summary, unverified)](https://episteme.tllm.fr/wiki/Pippit).
- **Seedream 5.0 (image) and Seed Audio 1.0:** Seedream 5.0 in Runway tool mode with up to 14 references (2026-07-15), Seedream 5.0 Pro Layers (2026-08-19); "Seed Audio 1.0: up to 120 seconds of speech, sound design, and music" (2026-06-29) — [Runway changelog (primary)](https://runway.com/changelog).
- **Prices:** BytePlus ModelArk's official per-second price could not be read; third-party resellers quote Seedance 2.0 ≈ $0.112/s, 2.0 Fast ≈ $0.090/s, 2.0 Mini ≈ $0.056/s (text-to-video), others $0.125–$0.18/s at 720p with video input; one source says BytePlus bills video by tokens, another per second — [Atlas Cloud (search summary)](https://www.atlascloud.ai/blog/guides/seedance-2-cost-per-second), [Picasso IA (search summary)](https://blog.picassoia.com/seedance-api-pricing-key-byteplus-access-and-docs).
- **India and UK:** CapCut was banned in India in May 2020 with TikTok; "Indian users were unable to use and download the application"; the page gives no lifting date — [Wikipedia: CapCut (secondary)](https://en.wikipedia.org/wiki/CapCut). Dreamina's page shows US-region legal links only, no regional list — [Dreamina (primary)](https://dreamina.capcut.com).

### Inferences
- For an India-based team, the practical route to Seedance is a non-ByteDance host (Runway, Luma, Higgsfield, Krea, Pika) rather than CapCut/Dreamina, subject to each host's terms.
- The Feb 2026 studio letters make Seedance a reputational and legal risk for client work involving any recognisable IP or likeness, even though output quality ranks near the top.
- Promise coverage: P1 Yes for marketing (Pippit), P2 Unknown, P3 Partial (no stated edit-to-delivery for films, though avatars, translation and scheduling exist), P4 No.

### Gaps
- OmniHuman (current version, terms) not checked: search budget exhausted.
- BytePlus/Volcano Engine official price pages and Seedance commercial-use terms not read; **treat commercial use as unclear (not allowed) until read.**
- Whether Pippit or Dreamina is available in India or the UK: needs checking.
- No "CapCut agent" separate from Pippit was found.

## Kuaishou (Kling): what is shipped, at what price and terms, and how far from the four promises?

### Takeaway
Kling is the most commercially proven Chinese video business (Kling revenue over RMB 850m in Q2 2026, up more than 200% year on year) and already pairs its models with an agent, storyboards via "Skills" and an MCP/CLI for outside agents. Kling 4.0 (30 s, 4K, stereo, 15 references) reached only Ultra Yearly subscribers on 2026-09-28, with full release "slated for October 2026". API prices sit behind a login.

### Cited Findings
- **Revenue and business:** Q2 2026 Kling AI "generated revenue of over RMB850 million, representing year-over-year growth of more than 200.0%"; Kling 3.0 series offers native 4K ("the industry's first video generation model supporting native 4K output"); Kling 3.0 Turbo released; "Kling MCP and Kling CLI were launched, enabling AI agents to orchestrate Kling AI for batch content creation"; Other services revenue +18.5% to RMB 6.2bn "primarily due to the growth of our Kling AI business"; results released 2026-08-19 — [Kuaishou Q2 2026 results press release (primary, via Webull/PRNewswire)](https://www.webull.com/news/15428603170825216). Group revenue +1.4% to RMB 35.5bn — [Quartr (search summary)](https://quartr.com/events/kuaishou-technology-1024-q2-2026_F9rL5hiu).
- **Kling 4.0 [Beta/limited]:** Kling 4.0 Flash released 2026-09-28 to Ultra Yearly subscribers only; up to 30 s; more than a dozen references (text, image, existing video); up to 10 keyframes; up to 4K with 10-bit HDR; stereo audio; full release planned for October; Kling described as "a newly spun-off unit of Kuaishou", preparing a Hong Kong IPO, valued at about $18B in a July financing round (citing Bloomberg) — [AI Weekly, 2026-09-29 (secondary)](https://aiweekly.co/alerts/kuaishous-kling-ships-kling-40-flash-to-annual-subscribers-30-second-4khdr-ai). Fal's explainer: Kling 4.0 3–30 s (Flash 3–20 s, 720p only); 720p/1080p/4K; two-channel stereo; up to 15 references (up to 10 images, up to 5 videos totalling 30 s, voice references, up to 7 elements); multi-shot not described; fal pricing "will go up ... at launch" — [fal.ai (secondary, partner)](https://fal.ai/learn/tools/what-is-kling-4-0). AI Weekly says 10-bit HDR is available; another summary says HDR is "still on its way" — conflict noted — [search summary](https://mx.linkedin.com/in/diegogarciamotion).
- **Kling 3.0 [GA]:** launched Feb 2026 with Video 3.0, Video 3.0 Omni, Image 3.0, Image 3.0 Omni; 15-second output, multi-shot control, multilingual native audio; multi-character coreference (3+ characters) — [PiAPI (search summary)](https://piapi.ai/en/blogs/kling-3-0-api-vs-kling-2-6-api-2026), [Eagle-Tribune press release (search summary; page returned HTTP 429)](https://www.eagletribune.com/region/kling-ai-launches-3-0-model-ushering-in-an-era-where-everyone-can-be-a/article_45569e75-7d6b-5d33-b1f3-11a782ea3551.html). Kling O3 4K, 3.0 Standard, O3 Standard, 3.0 Motion Control on Runway MCP from 2026-09-18 — [Runway changelog (primary)](https://runway.com/changelog).
- **Kling's own agent and storyboard features [GA]:** homepage lists Kling 4.0 ("Audio-Visual Performance for Realistic Results"), Kling Image 3.0 (native 4K, series images with consistent style); Canvas "includes brainstorming, script writing, and generation with an Agent", "a dedicated Agent tab in Creative Studio", Canvas creates "storyboards, posters, and e-commerce assets using Skills, with parallel generation", "flexible node editing and multiple rounds of post-production", MCP/CLI "for batch generation, multi-version testing, and automated production"; Cannes Lions 2026 awards for films made with Kling — [kling.ai (primary)](https://kling.ai).
- **Independent quality:** Kling 3.0 Omni 1080p Pro Elo 1019, Kling 3.0 1080p Pro 1000 (below Wan 3.0, Seedance 2.5, MiniMax H3, FLUX 3) — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **API pricing:** the Kling developer pricing page returned only a title ("KlingAI Open Platform"), no prices — [Kling API billing (primary, no content)](https://kling.ai/document-api/productBilling/prePaidResourcePackage). **Needs checking.**

### Inferences
- Kling is the Chinese company most clearly building towards the agent: Agent + script writing + storyboards + multi-round post + MCP/CLI, funded by fast-growing revenue and a spin-off/IPO track. But its Canvas is node-based, so it does not meet P1 ("no node graphs").
- Promise coverage: P1 Partial, P2 Unknown, P3 Partial (script, storyboard, shots, native audio, lip sync; editing, titles, delivery formats not stated), P4 Unknown.

### Gaps
- Kling API per-second prices and the subscription plan prices: login-gated, not read. **Needs checking.**
- Kling commercial-use terms and India/UK availability: not read; treat as unclear.
- Whether Kling 4.0's full release has happened by 2026-10-15: not confirmed.
- Kling 3.0 multi-shot specifics (number of shots per generation) only from search summaries.

## Alibaba (Wan, Qwen): what is shipped, at what price and terms, and how far from the four promises?

### Takeaway
Alibaba's closed Wan 3.0 (GA 2026-08-24, 30 s, 1080p, audio, documents as input) is #1 on the independent with-audio board at $0.05–$0.28 per second, while its open line stops at Wan 2.2 (Apache 2.0, 5 s, 480/720p, July 2025). No Alibaba whole-video agent was found.

### Cited Findings
- **Wan 3.0 [GA, closed]:** released broadly 2026-08-24; up to 30 s at up to 1080p from text, images, video and audio in one prompt; up to 10 images, 5 videos and 5 audio clips per prompt; also accepts PDFs, spreadsheets and PowerPoint files; recommends a clip length; extension tool; Alibaba claims consistency of characters, props and layout across 30 s (no benchmark given); prices per output second **Standard $0.05 / $0.10 / $0.20** at 480p/720p/1080p (with a 30% discount currently applied), **Prime $0.068 / $0.14 / $0.28**; a 30 s 1080p clip = $6.00 Standard / $8.40 Prime; via wan.video, Alibaba Cloud Model Studio and Qwen Cloud API; no open weights — [DataNorth, 2026-08-25 (secondary)](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model). Public beta began 2026-08-06; Alibaba's model page reads "Open Source: No" — [search summary of DataNorth/ProPakistani](https://propakistani.pk/2026/08/24/alibaba-launches-wan-3-0-ai-video-model-after-raising-10-billion/).
- **Independent quality:** Wan 3.0 Elo 1174, rank 1; Wan2.7-260612 (Jun 2026) 1039; "HappyHorse-1.0" (Apr 2026) 1036 and "HappyHorse-1.1" (Jun 2026) 1055, both credited to "Alibaba-ATH" — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Wan 3.0 reach outside Alibaba:** on Runway in tool mode and workflows, 480p–1080p with audio (2026-08-24) — [Runway changelog (primary)](https://runway.com/changelog); "Wan 3.0 Unlimited ... up to 30 seconds" on Higgsfield — [Higgsfield (primary)](https://higgsfield.ai); listed on Pika — [Pika (primary)](https://pika.art).
- **Wan 2.2 [Paper/weights, open]:** Apache 2.0; 5-second videos at 480P and 720P; weights and inference code released 2025-07-28; the licensor claims no rights over generated content — [Hugging Face: Wan2.2-T2V-A14B (primary)](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B). Wan 2.5 was API-only with no weights — [search summary](https://aiwiki.ai/wiki/wan_2_5/raw). Wan2.2 Animate was added to Runway on 2026-02-20 — [Runway changelog (primary)](https://runway.com/changelog).
- **Qwen-side agents:** the only Qwen agent item found was SearchQwen (search agents, 2026-08-24; two Apache 2.0, one non-commercial) — not a video agent — [DataNorth (secondary)](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model).

### Inferences
- Wan 3.0 is a strong per-shot engine for a router (top quality at a clear per-second price), and Wan 2.2's Apache 2.0 weights are the cleanest open licence among the big Chinese labs for self-hosting, though 5 s at 720p is far behind current closed models.
- Accepting PDFs and decks as input is a small signal towards "understands the brief" (P2), but no planning or agent layer is stated.
- Promise coverage: P1 No, P2 No (document input only), P3 No (shots with audio only), P4 No.

### Gaps
- Wan 3.0's official Model Studio page and Alibaba Cloud commercial terms were not read directly. **Needs checking.**
- Wan Animate / VACE current versions and licences not checked.
- Any Qwen-based video agent: none found, search budget exhausted before a dedicated search.
- India/UK availability of Model Studio video: needs checking.

## Tencent (HunyuanVideo and successors, Foley, Avatar): what is shipped, licence terms, and how far from the four promises?

### Takeaway
Tencent publishes open-weight video models under a community licence that **excludes the EU, the UK and South Korea** — so a UK-market company cannot rely on it there — and caps use above 100M MAU. No Tencent video agent was found; a fresh GitHub repo ("Prism", joint video-audio at 2K) signals the next model.

### Cited Findings
- **Licence [Paper/weights]:** "TENCENT HUNYUAN COMMUNITY LICENSE AGREEMENT", HunyuanVideo 1.5 release date 2025-11-21; Territory = "the worldwide territory, excluding the territory of the European Union, United Kingdom and South Korea"; above 100 million MAU the licensee must request a licence; Section 5(b) bars using the works or their Outputs "to improve any other AI model (other than Tencent Hunyuan or Model Derivatives thereof)"; Section 6(d) "Tencent claims no rights in Outputs You generate" — [HunyuanVideo-1.5 LICENSE (primary)](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE). The original HunyuanVideo licence (2024-12-03) first excluded only the EU and UK; South Korea was added later — [Hugging Face commit (search summary)](https://huggingface.co/tencent/HunyuanVideo/commit/a4ed25a99d7eb9cf21e12f5fd8052d266f2105fc).
- **Activity signal:** Tencent-Hunyuan GitHub shows HunyuanVideo updated 2026-10-08 and a repo "Prism", "a dynamic sparse attention framework for training joint video-audio generation models at 2K resolution", updated 2026-10-15 — [GitHub Tencent-Hunyuan (primary)](https://github.com/Tencent-Hunyuan).
- **Independent quality:** no Tencent model appears in the top 20 of the with-audio board — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).

### Inferences
- For Das Production: use in India is within the licence territory; use in the UK is outside it, so any UK client deliverable made with Hunyuan weights is not licensed. Treat Hunyuan as India-only at best.
- Prism suggests a joint audio-video Hunyuan model is in development (research/infra stage, not announced as a product).
- Promise coverage: P1–P4 No.

### Gaps
- HunyuanVideo-Foley, HunyuanVideo-Avatar and HunyuanCustom current versions were not shown on the GitHub page fetched (only 10 of 87 repos listed). **Needs checking.**
- Any Tencent agent product (e.g. inside Yuanbao or Tencent Cloud): none found; not searched in depth.

## MiniMax (Hailuo / H3, Speech, Music, agent, lawsuit): what is shipped, at what price and terms, and how far from the four promises?

### Takeaway
MiniMax's H3 (API 2026-07-31, weights 2026-08-03; 15 s, stereo audio, 2K via API) is #4 on the independent board and the first MiniMax video model with open weights, but the open licence reportedly bars local deployment in the US, EU, UK and South Korea. MiniMax owns speech and music models and lists a "Hailuo Agent", and it is defending a live Disney/Universal/WBD copyright suit that survived dismissal in May 2026.

### Cited Findings
- **H3 [GA API; Paper/weights]:** API live 2026-07-31, weights on Hugging Face and ModelScope 2026-08-03; text, image, video and audio inputs; up to 15 s with stereo audio up to 2K; third generation after Hailuo 01 and 02 — [search summary of NYU Shanghai RITS / SCMP](https://rits.shanghai.nyu.edu/ai/minimax-releases-h3-2k-video-with-native-audio-open-weights-promised/). ComfyUI day-0 post (2026-08-03): up to 15 s, audio "generated in the same pass", native stereo, up to 2K, runs on an RTX 3060 with offloading, full precision 123.6 GB reduced to 42.5 GB for the smallest variants; licence not stated — [ComfyUI blog (secondary)](https://blog.comfy.org/minimax-h3-day-0-support-in-comfyui/).
- **H3 licence (secondary, not verified at the model card):** "MiniMax H3 Community License Agreement"; local deployment blocked in the US, EU, UK and South Korea ("applies only to self-hosted/local deployment, not to API access"); open weights top out at 768p, 2K is API-only; companies over $20M/year revenue need written authorisation to deploy locally; products must display "MiniMax H3" in their UI; distillation prohibited — [mer.vin (secondary)](https://mer.vin/news/minimax-h3-open-weight-video-model-blocked-us-eu-uk/). This conflicts in emphasis with ComfyUI's "up to 2K" and its silence on territory.
- **H3 prices (secondary):** $0.13/s at 2K, $0.09/s at 768p (768p in closed beta at launch) — [search summary of RuntimeWire/OpenRouter listings](https://runtimewire.com/article/minimax-h3-open-video-benchmark-lead). Not read at MiniMax.
- **Independent quality:** MiniMax H3 (768p) Elo 1159, rank 4; H3 Max (via Fal) 1155, rank 5 — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Agent:** Hailuo's site lists "Hailuo Agent" in its navigation and "H3 LIVE NOW"; a "Video Agent" template makes text-overlay videos from photos and copy; no length, resolution, price or commercial-use statement on the page — [hailuoai.video (primary)](https://hailuoai.video). The Hailuo Video Agent became "Media Agent" in Oct 2025, offering one-click and step-by-step workflows where the platform selects models and steps — [Scenario/aggregators (search summary, unverified)](https://help.scenario.com/articles/8094765856-minimax-hailuo-video-the-essentials).
- **Speech and music:** minimax.io lists "MiniMax Speech 2.8 NEW" and "MiniMax Music 3.0 NEW" (no dates on the page) — [minimax.io/news (primary)](https://www.minimax.io/news); MiniMax Music 3.0 is offered inside Pika — [Pika (primary)](https://pika.art); MiniMax Hailuo 3.0 on Runway Dev API from 2026-08-05 — [Runway changelog (primary)](https://runway.com/changelog).
- **Lawsuit:** Disney, Universal and Warner Bros. Discovery sued MiniMax in the Central District of California (Sept 2025) alleging Hailuo generates infringing images and videos of their characters; on 2026-05-23 a federal judge refused to dismiss, so direct and secondary infringement claims proceed; MiniMax's Shanghai entity and a Singapore affiliate are named — [Bloomberg Law (search summary)](https://news.bloomberglaw.com/ip-law/disneys-copyright-suit-against-chinese-ai-developer-advances), [Business Standard (search summary)](https://www.business-standard.com/world-news/disney-warner-bros-discovery-sue-china-s-minimax-over-copyright-violation-125091601400_1.html). MiniMax listed in Hong Kong in Jan 2026 (search summary, unverified) — [Wikipedia: MiniMax (search summary)](https://en.wikipedia.org/wiki/MiniMax_(company)).

### Inferences
- MiniMax is the only Chinese lab here that owns video, speech and music models plus an agent surface, which is the raw material for P3. Its stated agent, however, is shallow (templates, model/step selection).
- For a UK-market deliverable, self-hosting H3 is reportedly not licensed; API use may be, subject to the API terms (not read).
- Promise coverage: P1 Partial, P2 Unknown, P3 Partial, P4 Unknown.

### Gaps
- The H3 model card and licence text at huggingface.co/MiniMaxAI/MiniMax-H3 were not read directly. **Needs checking** before any reliance.
- Hailuo subscription prices (the page showed "From .../mo" with no amount) and commercial-use terms: not read; treat as unclear.
- No post-May-2026 development in the studio lawsuit was found.

## xAI (Grok Imagine video): abilities, prices and terms

### Takeaway
xAI sells Grok Imagine video by API at $0.02–$0.08 per second (read from xAI docs today); quality is mid-table (Elo 1061). There is no xAI whole-video agent, though Grok Bot can now drive Runway via MCP.

### Cited Findings
- **API prices [GA]:** grok-imagine-video $0.050/s; grok-imagine-video-1.5-lite $0.020/s; grok-imagine-video-1.5 $0.080/s; no per-resolution split, max duration, resolution or audio stated on the page — [xAI docs: models (primary)](https://docs.x.ai/docs/models).
- **Abilities (secondary):** 1–15 s per generation, longer via Extend; audio (SFX, ambience, dialogue) generated in the same pass; Video 1.5 adds face and voice references and native 1080p — [apiframe guide (search summary)](https://apiframe.ai/guides/grok-video-api-guide), [pasqualepillitteri.it (search summary)](https://pasqualepillitteri.it/en/news/9260/grok-imagine-video-1-5-face-voice-references-1080p). Grok Imagine 1.5 Video on Runway MCP: "text- and image-to-video with audio, up to 1080p" (2026-08-13) — [Runway changelog (primary)](https://runway.com/changelog).
- **Independent quality:** Grok Imagine Video 1.5 (May 2026) Elo 1061 (rank 10), 1.5 Lite (Aug 2026) 998; the leaderboard lists the creator as "SpaceXAI" — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Agent signal:** "Runway MCP for Grok Bot: image and video generation from Grok Bot chats" (2026-09-17) — [Runway changelog (primary)](https://runway.com/changelog).

### Inferences
- xAI is a cheap per-shot engine, not an agent builder for video; its chat assistant uses Runway as the video layer.
- Promise coverage: P1–P4 No for xAI itself.

### Gaps
- xAI's commercial terms for Grok Imagine outputs and India/UK availability: not read; treat as unclear.
- Why the leaderboard credits "SpaceXAI": not researched.

## Runway: what is shipped towards the agent, enterprise, funding, pricing

### Takeaway
Runway is the closest of any company here to the client's idea in product form: Runway Agent (GA 2026-05-13) develops and generates a finished video in one conversation, chooses the model automatically, and since then has gained campaign mode, Skills, multi-step Workflows, a timeline, Brand Kits, PDF briefs, localisation and multi-format output; underneath sit Model Routers, Aleph 2.0 editing, Ruby HDR grading, ProRes export and DaVinci/Adobe plugins. It is pitched at ads and campaigns; self-review and taste learning are not stated.

### Cited Findings
- **Agent timeline [GA] (all from the changelog):** Runway Agent 2026-05-13 ("Creative partner that develops and generates video in one conversation"); Studio 2026-06-18 (trim, stitch, reorder, export); Agent 2.0 2026-06-25 (campaign creation, data analysis, cross-platform scaling); Agent Skills 2026-07-02 (campaigns, commercials, ad localisation); PDF input for Agent 2026-07-06 (up to 10MB); Custom Agent Skills 2026-07-08; Timeline in Agent 2026-07-09; Agent Workflows 2026-07-23 ("Agent builds and runs multi-step Workflows from plain-language requests"); Projects + Brand Kits in Agent 2026-08-11; Agent Brand Kits 2026-09-10; Agent in Asset Comments 2026-09-15 (Enterprise); Seedance 2.5 Draft Mode in Agent 2026-10-02 (fast 480p drafts, then enhancement) — [Runway changelog (primary)](https://runway.com/changelog).
- **What the Agent page claims:** "It chooses the best model for the task automatically"; works out positioning from product and audience; creates commercials, video ads, product videos and image ads; edits on plain-language request (e.g. a different voiceover, a punchier opening); formats creative for different platforms and aspect ratios; localises top-performing ads per market and generates hooks and variations; diagnoses underperforming content you share; storyboard, clarifying questions, music/sound and self-review of its own output are not described; "Agent is available across Runway's plans" — [Runway Agent (primary)](https://runway.com/product/agent).
- **Infrastructure for "right engine per shot" and delivery:** Model Routers (2026-07-21, automatic model selection by cost, latency or quality), Capacity Fallbacks (2026-07-30), Task Cost API (2026-07-30), Routing History (2026-08-03); Aleph 2.0 & Edit Studio (2026-05-21, "edits a video to match an edited frame"); Runway Ruby HDR colour-grading model (2026-08-20); ProRes 4444 / PNG sequence export for Gen-4.5 and Aleph 2 (2026-08-10); HDR10/HLG/HDR ProRes via MCP (2026-08-28); Enhance Frame Rate up to 4K and 5 minutes (2026-09-17); SAM3 segmentation (2026-07-28); Adobe Premiere/After Effects plugins (2026-09-08); DaVinci Resolve plugin (2026-09-23); third-party audio: Seed Audio 1.0 (2026-06-29), Eleven v3 (2026-07-30), ElevenLabs V4 (2026-09-29); third-party video: Kling 3.0/2.6, Sora 2 Pro, WAN2.2 Animate (2026-02-20), Seedance 2.0 (2026-04-07), Gemini Omni Flash (2026-06-30), Wan 3.0 (2026-08-24), Seedance 2.5, Grok Imagine 1.5, Hailuo 3.0, Kling O3 4K — [Runway changelog (primary)](https://runway.com/changelog).
- **Own models:** Gen-4.5 launched 2025-12-11, image-to-video added 2026-01-21; Act-Two 2025-07-17, Game Worlds 2025-08-21, Gen-4 References 2025-04-30; no "Gen-5" on the changelog — [Runway changelog (primary)](https://runway.com/changelog). Runway's site also lists Solaris and "World Simulation (GWM Worlds 2)" without dates — [Runway news (primary)](https://runway.com/news). Gen-4.5 is 720p, 2–10 s, about $0.12/s on OpenRouter — [OpenRouter (search summary)](https://openrouter.ai/runway/gen-4.5-20260729). Runway models do not appear in the Artificial Analysis with-audio top 20 — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Pricing [read 2026-10-15]:** Free $0 (125 one-time credits); Standard $15/mo or $12/mo annual (625 credits/mo); Pro $35 / $28 (2,250 credits; Brand Kit, voice clone, Runway MCP); Max $95 / $76 (9,500 credits; HDR/ProRes/image-sequence output; credits roll over one month); Team plan self-serve up to nine members (2026-09-04, changelog); Agent ("Agentic creative collaborator") included from Standard; Gen-4.5 12 credits/s; Aleph 2.0 28 credits/s; "Enterprises get 2 months of usage free. Sign by 10/31" — [Runway pricing (primary)](https://runway.com/pricing). Commercial-use and ownership terms were not on the pricing page.
- **Funding:** $315M Series E, Feb 2026, $5.3B valuation, led by General Atlantic with Nvidia, Fidelity, AllianceBernstein and Mirae — [Bloomberg Government (search summary)](https://news.bgov.com/private-equity/ai-video-startup-runway-valued-at-5-3-billion-with-new-funding). About $300M annualised revenue by Oct 2025 — [morphed.app (search summary, unverified)](https://morphed.app/stats/runway-statistics).

### Inferences
- Runway already covers P1 (one conversation) and much of P3 (model choice, voiceover, edit, grade, resize, localise, export) for marketing work. What it does not claim: storyboard/shot-list planning for narrative film, asking only when needed (P2), and judging and fixing its own output against a learned taste (P4).
- Runway is turning itself into the video layer for other agents (OpenAI Dots, Grok Bot, Cursor, Claude-adjacent MCP), which means a small builder could also sit on top of Runway's MCP rather than compete with it.
- Promise coverage: P1 Yes, P2 Partial, P3 Partial (closest of all), P4 No.

### Gaps
- Lionsgate and AMC Networks deals: not found in this session (Runway's news page did not mention them; search budget exhausted). **Needs checking at source.**
- Runway Terms of Use (output ownership, commercial use per plan) not read; treat as unclear until read.
- India and UK availability and INR/GBP pricing: not read.

## Luma AI: Ray models, Modify, Agents, funding, studio plans

### Takeaway
Luma has moved from model maker to agent and studio partner: Ray3 (Sep 2025), Ray3.14 (1080p, Jan 2026), Ray3.2 (Jun 2026), Modify Video, Luma Agents (used for Mazda's first AI-produced commercial by April 2026), a $900M Series C, London and Riyadh offices and a production stage in Manhattan Beach. Luma also hosts Seedance 2.5 and MiniMax H3. P4 is not claimed.

### Cited Findings
- **Models [GA]:** Ray3 2025-09-18 ("The world's first reasoning video model and the first to generate high fidelity 16 bit HDR"); Ray3 Modify 2025-12-18 (keyframe and character-reference controls for editing video); Ray3.14 2026-01-26 (native 1080p; "4x faster and 3x cheaper"); Uni-1.1 API 2026-05-05 (image); Ray3.2 model and API 2026-06-09 ("frame-by-frame direction and creative control"); Layers 2026-07-29; Seedance 2.5 and MiniMax H3 available in Luma 2026-08-06 — [Luma news (primary)](https://lumalabs.ai/news). Ray 3.14 clips up to 18 s at 24 fps — [fast.io review (search summary, unverified)](https://fast.io/resources/luma-ai-review-2026/).
- **Modify Video [GA]:** 2025-06-02; Modify with Instructions 2025-08-12 (natural-language edits incl. object removal, swapping, restyling; all subscribers) — [Luma news (primary)](https://lumalabs.ai/news).
- **Luma Agents [GA]:** Mazda's first AI-produced commercial made with Luma Agents (2026-04-15); Dumbstruck partnership pairing Luma Agents with emotion analytics (2026-08-13); Arabic interface for Luma Agents (2026-09-02); "Claude Motion" (2026-10-08) where Claude videos open in Luma and "the Luma agent can refine or reformat them" — [Luma news (primary)](https://lumalabs.ai/news). Launched March 2026, aimed at agencies and marketing teams running multi-asset campaigns — [fast.io (search summary)](https://fast.io/resources/luma-ai-review-2026/). The lumalabs.ai/agents URL returned 404.
- **Funding and studio plans:** Series C 2025-11-19 ("Luma has raised a 900M Series-C and we are partnering with Humain to build a 2GW compute supercluster"); London office 2025-12-02 led by Jason Day (formerly WPP); Riyadh office 2026-02-11 with a Publicis Groupe Middle East partnership; Dream Lab LA 2025-07-10; "Innovative Dreams" with Wonder Project 2026-04-16 ("Dedicated R&D lab and virtual production stage now open at MBS Media Campus in Manhattan Beach"), first project *The Old Stories: Moses* slated for Prime Video — [Luma news (primary)](https://lumalabs.ai/news). Series C valuation $4B — [search summary](https://fast.io/resources/luma-ai-review-2026/).

### Inferences
- The Dumbstruck emotion-analytics tie-up is the nearest thing in this set to a P4 signal (measuring whether viewers like the output), but it is audience testing for ads, not the agent judging its own shots for the prompter.
- The London office makes Luma the lab with the clearest UK commercial presence among those checked.
- Promise coverage: P1 Yes (agent), P2 Unknown, P3 Partial, P4 Unknown (emotion analytics partnership is a partial signal).

### Gaps
- Luma pricing, plan commercial-use terms and India availability: not read. **Needs checking.**
- What Luma Agents automate step by step (script, storyboard, sound, edit): no primary description found (agents page 404).

## Pika: current product and company status

### Takeaway
Pika relaunched on 2026-09-17 as "the New Pika", a one-place studio that mixes its own Pika 2.5, Pikaframes and new speech/music/SFX models with third-party video (Seedance 2.5, MiniMax H3, Wan 3.0, Gemini Omni Flash). Its page does not describe it as a social app, and no agent is stated. Funding reports conflict.

### Cited Findings
- **Product [GA]:** apps Video Studio, Color Grade, Extend Video, Pika Soundtrack, Edit Image, Character Studio, Image Studio, Product Shot, Product Ad, Swap Anything, Motion Transfer, Music Studio, Speech Studio, SFX Studio; video models Seedance 2.5, Pika 2.5, MiniMax H3, Wan 3.0, Gemini Omni 1.1 Flash, Pikaframes; audio models Pika Speech, Pika Music, Pika Soundtrack, Pika SFX, MiniMax Music 3.0, two ElevenLabs models; dated posts: 2026-08-18 research posts introducing Pika Soundtrack, Music, SFX and Speech; 2026-09-17 "Welcome to the New Pika" (video, image and sound in one place); 2026-09-24 Pika API Club member spotlights; no prices on the page; "Made with Pika" community showcase but no social features described — [pika.art (primary)](https://pika.art).
- **Company status (conflicting, secondary):** one tracker reports a $250M Series C in June 2026 at $1.5B ("verification pending"); CB Insights lists an $80M last raise about two years ago and ~$135M total; ~109 employees — [TechStackIPO (search summary)](https://www.techstackipo.com/company/pika-labs), [CB Insights (search summary)](https://www.cbinsights.com/investor/pika-labs), [Crustdata (search summary)](https://profiles.crustdata.com/company/pika-1033835).

### Inferences
- Pika is repositioning as an aggregator studio with its own audio models rather than a frontier video lab; it is not building a whole-video agent on current evidence.
- Promise coverage: P1 No, P2 No, P3 Partial (own sound, music, speech, colour grade), P4 No.

### Gaps
- Pika pricing and commercial terms; whether the earlier social app still exists; funding: unresolved.

## Lightricks (LTX Studio, LTX-2 open weights): what LTX Studio automates and the licence terms

### Takeaway
LTX Studio is the closest existing "script in, film out" flow (script → scenes → storyboard → shots → timeline), but it is editor-driven, not one-prompt. The LTX-2 open weights are free only for entities under **$10M annual revenue**, and clause (s) bars using them in any product that "directly competes with Licensor's commercial products" without a separate licence: an autonomous video agent would plausibly compete with LTX Studio.

### Cited Findings
- **LTX-2 Open Weights License 0.X [Paper/weights]:** licence date 2026-01-05, "applicable to all LTX-2 model versions released since October 23, 2025"; worldwide, royalty-free; "Entities with annual revenues of at least $10,000,000 (the 'Commercial Entities') are required to obtain a paid commercial use license"; thresholds count subsidiaries and affiliates together; breach triggers damages "equal to double the amount that would otherwise have been paid"; prohibited (q) "For commercial use only: To train, improve, or fine-tune any other machine learning model ... or competing model"; prohibited (s) "To use the Model or Derivatives of the Model in any product, service, or application that directly competes with Licensor's commercial products or services, or is designed to replace or substitute Licensor's offerings in the market, without obtaining a separate commercial license"; "Licensor claims no rights in the Output you generate"; export-control and sanctions representations; derivatives must be distributed under this licence — [LTX-2 Open Weights License PDF (primary, text extracted locally)](https://static.lightricks.com/legal/ltx-2-open-weights-license-0.X.pdf). An "LTX 2.5" with a reported $20M threshold — [Picasso IA (search summary, unverified)](https://blog.picassoia.com/ltx-2-5-vs-minimax-h3-best-open-video-model); LTX-2.3 derivatives exist on Hugging Face — [HF xocialize/ltx-2.3-mlx (search summary)](https://huggingface.co/xocialize/ltx-2.3-mlx).
- **LTX Studio flow (secondary; official page failed to load):** "Paste a screenplay or script, and LTX automatically breaks it into scenes, generates storyboard thumbnails, and suggests camera framing"; script-to-video, character consistency across shots, camera controls, timeline editor; commercial use requires the Standard plan ($35/month) or higher — [Dupple review (search summary)](https://dupple.com/reviews/ltx-studio), [Luma's LTX review, a competitor (search summary)](https://lumalabs.ai/news/ltx-studio-review). LTX's own blog: boards can be handed "to Script to Video for finished shots, without losing the look, the cast, or the continuity locked at the storyboard stage" — [ltx.io blog (search summary)](https://ltx.io/blog/how-to-storyboard). A competitor rates LTX's video step as "Partial, video is a separate step" — [Atlabs (search summary, competitor)](https://www.atlabs.ai/blog/5-best-ai-storyboard-tools-for-marketing-agencies-in-2026). No 2026 LTX "agent" was found.

### Inferences
- LTX Studio automates the planning half of P3 (scene breakdown, storyboard, framing, cast continuity) better than the agent products, but the user drives each step, so it fails P1 and does not claim P2 or P4.
- **Licence risk for the client:** Das Production is probably under $10M revenue (assumption, not checked), so LTX-2 weights are free to use for production work; but building and selling an autonomous video agent on LTX-2 could fall under clause (s). Ask Lightricks in writing before building a product on it.
- Promise coverage: P1 Partial, P2 Unknown, P3 Partial, P4 Unknown.

### Gaps
- LTX Studio's current official feature list, plans, models offered and commercial terms: the official page failed to load twice. **Needs checking.**
- LTX-2's current maximum length, resolution and audio: not read this session.

## Moonvalley (Marey): licensed data, controls, pricing

### Takeaway
Moonvalley sells Marey as "fully licensed, commercially safe" with strong director controls (camera from a single image, motion and pose transfer, trajectory), but publishes no price list (contact sales, API waitlist), no audio and no agent.

### Cited Findings
- **Marey [GA since 2025-07-08]:** latest version named "Marey Realism v1.5" (fal.ai and ComfyUI launches); "Trained on licensed data", "FULLY LICENSED, Commercially safe"; controls: camera moves from one image via a 3D scene, motion transfer from a reference video, pose transfer, trajectory drawing; length, resolution and audio not stated; no pricing ("CONTACT SALES", API waitlist); no agent or storyboard tool; launched on fal.ai 2025-08-14 — [moonvalley.com (primary)](https://www.moonvalley.com).
- **Pricing (secondary, conflicting):** custom pricing only — [CostBench (search summary)](https://costbench.com/software/ai-video-generators/moonvalley/); or Starter $29, Pro $75, Business $299/month as of June 2026 — [CompareBestAI (search summary, unverified)](https://comparebestai.com/articles/moonvalley-ai-pricing).

### Inferences
- Marey is the cleanest training-data story for client work where provenance matters (UK brands, broadcasters), and a useful per-shot engine for controlled camera moves, but not an agent maker.
- Promise coverage: P1–P4 No.

### Gaps
- Asteria (Moonvalley's studio) is not mentioned on the homepage; not researched further.
- Indemnity terms behind "commercially safe": not read (linked "Legal, trust & safety" page not fetched).

## Black Forest Labs (FLUX images, FLUX 3 Video): licences

### Takeaway
BFL entered video with FLUX 3 Video (generally available via API by 2026-08-05; up to 20 s, native audio, multiple scenes and camera angles in one clip, lip-synced dialogue in 14+ languages; $0.06–$0.53/s), ranked #6 on the independent board. Its licence is not open; open weights were promised only for a separate "FLUX 3 Dev".

### Cited Findings
- **FLUX 3 Video [GA via API and partners]:** HD and Full HD clips up to 20 s; native audio (dialogue, SFX, ambience); text-to-video, image-to-video, keyframes, continuation; "multiple scenes and camera angles in one clip"; on-screen typography; lip-synced dialogue in 14+ languages; prices per output second incl. audio: Draft (HD) $0.06 T2V/I2V, $0.12 V2V; HD $0.17 / $0.41; Full HD $0.29 / $0.53; BFL's own Elo claims 1,135 T2V and 1,051 I2V (vendor claim) — [The Decoder, 2026-08-05, citing BFL's blog (secondary)](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/).
- **Independent quality:** FLUX 3 Elo 1147, rank 6 (Jul 2026) — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Licence:** FLUX 3 Video listed as "Proprietary" — [LLM Stats (search summary)](https://llm-stats.com/models/flux-3-video); downloadable weights and an open licence promised "later this year" with FLUX 3 Dev — [VentureBeat via search summary](https://www.promptus.ai/blog/flux-3-on-promptus). Early access was gated before GA — [search summary](https://invideo.io/blog/flux-3-ai-video-generator/).

### Inferences
- FLUX 3 Video's multi-scene single clips and typography are directly useful for short ads and titles (P3 "titles"), but BFL shows no agent layer.
- Promise coverage: P1–P4 No (model only).

### Gaps
- BFL's own licence/terms page for FLUX 3 Video and the FLUX image licences (e.g. FLUX.1/FLUX.2 [dev] non-commercial terms) were not read this session. **Needs checking.**

## Stability AI: video and 3D models, deals, licences

### Takeaway
Stability AI has no 2026 video model on its news page; its video work is 2025 research (Stable Virtual Camera, Stable Video 4D 2.0), and its 2026 focus is licensed-data audio (Stable Audio 3.0) and partnerships with EA, UMG and WMG. It is not building a whole-video agent on current evidence.

### Cited Findings
- **Video/3D [Paper/weights or research preview]:** Stable Virtual Camera 2025-03-18 (research preview, 2D images to multi-view video with 3D camera control); Stable Video 4D 2.0 2025-05-20 — [Stability news (primary)](http://stability.ai/news-updates).
- **Audio:** Stable Audio Open Small 2025-05-14 (with Arm); Stable Audio 2.5 2025-09-10 ("first audio model built for enterprise sound production"); Stable Audio 3.0 2026-05-20 (open-weight family "trained on fully licensed data"); DAW plugin 2026-08-18 — [Stability news (primary)](http://stability.ai/news-updates).
- **Deals:** AMD 2025-04-16; NVIDIA 2025-06-12 and 2025-08-12; AWS Bedrock 2025-09-18; Electronic Arts 2025-10-23 (co-develop generative AI tools for game development); Universal Music Group 2025-10-30; Warner Music Group 2025-11-19; Series B 2026-08-25 with EA, Sony Music Group, UMG and WMG among backers, total funding $232M (as stated) — [Stability news (primary)](http://stability.ai/news-updates). No WPP item appears on the page.

### Inferences
- Stability's relevance to the client is licensed-data music and sound (Stable Audio 3.0) as a P3 component, not video.
- Promise coverage: P1–P4 No.

### Gaps
- Stability Community Licence current revenue threshold: not read this session. **Needs checking.**
- WPP relationship: not found on Stability's page; not verified.

## Higgsfield: products, funding, traction, controversies

### Takeaway
Higgsfield is a fast-growing aggregator (30+ models) with its own effect and motion tools and a "Supercomputer" superagent; it reportedly raised $400M at $5.4B in Aug 2026, but had a billing and marketing scandal in early 2026.

### Cited Findings
- **Products [GA unless noted]:** "Supercomputer: a superagent covering the full creative stack, powered by GPT-6 Astra" (as stated on the page); "Dots with Higgsfield MCP (ChatGPT)" with Character Creator, Cinematic Director, Content Lead and Motion Designer roles; "Higgsfield MCP for Claude"; Cinema Studio 4.0; Genjutsu (motion transfer, object swap) and Genjutsu API; Katana (edits clips with one command); Ads Studio "Ad Multiplier"; AI Influencer Studio; 15 VFX presets; models incl. Wan 3.0 Unlimited (up to 30 s), Seedance 2.5, Sora 2, Kling 3.0, Veo 3.1; claims 4.5 million video generations per day; no prices on homepage — [higgsfield.ai (primary)](https://higgsfield.ai).
- **Funding (secondary):** $80M Jan 2026 at $1.3B led by Accel; $400M at $5.4B post-money with Goldman Sachs, Intel and DST Global; ~$700M annualised revenue reported Aug 2026 — [Digital Business KZ, 2026-08-17 (search summary)](https://digitalbusiness.kz/2026-08-17/kazahstanskiy-startap-higgsfield-privlek-400-mln-pri-otsenke-v-5-4-mlrd/), [YourStory (search summary)](https://yourstory.com/ai-story/how-higgsfield-ai-became-a-54-billion-ai-video-startup).
- **Controversy (secondary):** early 2026 complaints that payments processed instantly while cancelling was difficult; accounts reinstated and refunds issued; promotional videos sent to creators allegedly contained racist and sexually explicit language; CEO Alex Mashrabov acknowledged in Feb 2026 that processes "had not always kept pace with core values" — [Times of Central Asia (search summary)](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/), [Digital Business KZ, 2026-02-12 (search summary)](https://digitalbusiness.kz/2026-02-12/skandal-vokrug-higgsfield-ai-v-chem-obvinyayut-kazahstanskiy-startap/).

### Inferences
- Higgsfield shows that an aggregator plus an agent wrapper, sold to creators, can reach large revenue quickly; its agent is LLM-powered (OpenAI) rather than its own.
- Promise coverage: P1 Partial, P2 Unknown, P3 Partial, P4 Unknown.

### Gaps
- Higgsfield pricing, commercial terms and what Supercomputer actually does step by step: not read.

## Other companies: Vidu (Shengshu), Midjourney, Genmo, Decart, Baidu, Meituan, Zhipu, StepFun, Sand AI, Skywork, Kunlun, Hedra, Krea

### Takeaway
Of the smaller players, Vidu (Vidu Agent "from a single sentence to a complete work"), Hedra (Hedra Agent) and Krea (Krea Agent, Nodes Agent) state agent products; Meituan (LongCat-Video, MIT, minutes-long), Sand AI (MAGI-1, Apache 2.0; MAGI-2 Preview on the leaderboard) and Skywork (SkyReels V2/V3, "infinite-length") are the open-weight long-video signals. Midjourney, Genmo, Decart, Baidu, Zhipu, StepFun and Kunlun could not be checked.

### Cited Findings
- **Vidu (Shengshu) [GA, undated]:** flagship "Vidu Q4" ("All-in-one video flagship"), also Q3 and real-time "Vidu S"; Reference to Video from three or more images, "My References" to reuse characters, props and scenes; **"Vidu Agent ... from a single sentence to a complete work"**; outputs up to 1080p; a user testimonial mentions a "Storyboard" feature; plans exist but no prices shown — [vidu.com (primary)](https://www.vidu.com).
- **Meituan LongCat-Video [Paper/weights]:** MIT licence for weights; released 2025-10-25; 13.6B parameters; 720p at 30 fps; "minutes-long videos"; LongCat-Video-Avatar-1.5 (audio-driven humans) 2026-05-21; no agent — [GitHub meituan-longcat/LongCat-Video (primary)](https://github.com/meituan-longcat/LongCat-Video).
- **Sand AI MAGI [Paper/weights]:** MAGI-1 Apache 2.0, released 2025-04-21, autoregressive chunk-by-chunk generation (24-frame chunks) for streaming and long-horizon synthesis; MAGI-1.1 24B weights 2026-06-17 — [GitHub SandAI-org/MAGI-1 (primary)](https://github.com/SandAI-org/MAGI-1); MAGI-2 Preview (Sep 2026) Elo 1045, rank 12 — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- **Skywork SkyReels [Paper/weights]:** SkyReels-V2 2025-04-21, "the world's first infinite-length film generative model" (authors' claim; demos 30 s), 540p/720p; SkyReels-V3 weights and API 2026-01-29; SkyReels-A2 (element assembly) 2025-04-03; no agent on the page; licence file linked but not read — [GitHub SkyworkAI/SkyReels-V2 (primary)](https://github.com/SkyworkAI/SkyReels-V2).
- **Hedra [GA]:** "Hedra Agent: plans and runs multi-step image, video, and audio work with reusable skills, collaborative canvases, and several models"; API v3; MCP server — [hedra.com (primary)](https://www.hedra.com).
- **Krea [GA]:** Krea Agent (also for Slack); Nodes Agent and App Builder on Pro; third-party video models (Veo 3, Sora 2, Kling, Hailuo, Wan, Runway, Luma, Seedance 2.5); video upscaling to 8K, video LoRA fine-tuning; plans Free $0 (100 units/day), Basic $9, Pro $35 ("All video models"), Max $105, Business $200 per month, Enterprise custom, 40% off yearly — [krea.ai (primary)](https://www.krea.ai).
- **Midjourney:** the updates page lists only Sept–Oct 2026 post titles ("Testing Thinking Mode", alpha changelogs, "Edit updates, thumbnail previews") with no video detail visible — [updates.midjourney.com (primary)](https://updates.midjourney.com).
- **New entrants on the board:** Utopai X (Utopai Studios, Elo 1169, Sep 2026), Agnes-Video-2.5 (Sapiens AI, 1069), PixVerse V6 (988) — [Artificial Analysis (primary)](https://artificialanalysis.ai/video/leaderboard/text-to-video).

### Inferences
- Vidu is the only Chinese lab found that states a one-sentence-to-complete-work agent on its homepage; how complete "complete" is cannot be judged from the page.
- The open-weight long-video models (LongCat MIT, MAGI Apache 2.0, Wan 2.2 Apache 2.0) are the licence-clean building blocks for a self-hosted engine in both India and the UK, unlike Hunyuan (UK excluded) and reportedly MiniMax H3 (UK local deployment blocked).
- Promise coverage: Vidu P1 Yes (stated), others Partial or No; none claims P4.

### Gaps
- Midjourney video (current version, length, pricing, the Disney/Universal suit against Midjourney): not checked; search budget exhausted.
- Genmo (Mochi), Decart, Baidu (MuseSteamer), Zhipu (CogVideoX), StepFun (Step-Video), Kunlun: not checked.
- SkyReels licence text, Vidu prices, Hedra and Krea commercial terms: not read; treat as unclear.
- India and UK availability for all of these: not checked.
