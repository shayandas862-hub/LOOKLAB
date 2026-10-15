# Gap fill: named companies and products the earlier notes could not reach (as of 2026-10-15)

Scope: only the gaps listed in `big_players_us_platforms.md`, `big_players_model_labs_china.md` and the other notes in this folder. Facts already there (Higgsfield's funding and revenue, the Meta–Midjourney deal of Aug 2025, Netflix *El Eternauta*, Getty v Stability UK judgment, HunyuanVideo licence, Wan 3.0, OmniHuman 2.0 BytePlus prices) are referenced, not repeated.

Conventions:
- **Every link below was read (or attempted) on 2026-10-15.** Dates inside a claim are publication or event dates.
- Origin labels: **[shipped]**, **[research preview]**, **[beta]**, **[announced]**, **[roadmap]**, **[weights/paper]**, **[legal filing]**, **[report]**.
- Source labels: (primary) = the company's or court's own page; (secondary) = news or third-party page I read; (search summary) = only a search engine's summary of the page, not opened; (unverified) = single weak source or conflict.
- The "four promises": P1 one prompt in, no node graph or timeline; P2 understands intent, audience, brand and format, asks only when needed; P3 does everything (script to delivery, versions); P4 the person likes it (self-judges, fixes, learns taste).
- Blocked in this session: canva.com (Cloudflare challenge, HTTP 403 on pricing, newsroom, AI video and AI terms pages); autodesk.com product and pricing pages (403); docs.midjourney.com (403, so Midjourney plans and terms were not read at source); Higgsfield pricing (renders client-side, no numbers in HTML); BytePlus video terms (JavaScript-only body); web.archive.org (connection reset). Netflix's partner help page still did not render.

## Canva: AI video, Canva AI 2.0, Affinity, acquisitions, price

### Takeaway
Canva ships short AI clips (Google Veo 3 "Create a Video Clip"; its own image-to-video model in Canva AI 2.0) inside its editor, and Canva AI 2.0 is a conversational, agentic **research preview** for designs. No source shows Canva making a whole finished video from one prompt. It slowed its AI rollout in mid-2026 because serving cost was too high. Pricing and current AI terms could not be read at source.

### Cited Findings
- **Canva AI 2.0 [research preview]**: from 16 Apr 2026, first one million users via the homepage, wider rollout "in the coming weeks". Conversational design from text or voice, "agentic orchestration" across tools (e.g. campaign plans), object-level editing, memory of preferences with automatic brand styling, connectors (Slack, Gmail, Drive, Notion, Zoom, Calendar), web research — [FoneArena, 17 Apr 2026](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html) (secondary).
- **Own models [research preview]**: Canva's CORE AI lab models include Canva Proteus (style transfer), Canva Lucid Origin (images) and **Canva I2V (image-to-video)**, which Canva claims is "7x faster and 17x cheaper" than alternatives. The article names no other video feature — [FoneArena](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html) (secondary; vendor claim, no independent test).
- **Partner video model [shipped]**: "Create a Video Clip" in Canva AI runs on Google Veo 3: about 8-s clips with synced audio that open in Canva's video editor; **5 generations per month at launch**; covered by Canva Shield moderation — [FoneArena](https://www.fonearena.com/blog/456646/canva-create-a-video-clip-google-veo-3.html), [Tom's Guide](https://www.tomsguide.com/ai/googles-veo-3-video-model-is-now-live-in-canva-heres-how-to-try-it) (search summary; launch date and current limits not confirmed — the Tom's Guide body did not load).
- **Cost retreat [report]**: Canva cut expected revenue growth by a third, to 20%, after AI serving costs ran higher than planned and it slowed the rollout; Melanie Perkins said cost per AI task fell nearly 90% since the April launch — [Fortune, 12 Aug 2026](https://www.fortune.com/2026/08/12/canva-startup-growth-ai-costs-revenue-forecast-by-third/) (search summary); [Forbes Australia](https://www.forbes.com.au/news/innovation/canva-founder-says-ai-costs-down-90-per-cent/) (search summary). Perkins reportedly told shareholders Canva had been "relying too heavily on frontier models" (search summary, same sources).
- **Acquisitions**: Cavalry (UK, 2D motion animation, to extend Affinity) and MangoAI (reinforcement learning for video-ad performance; founders ex-Netflix) announced 23 Feb 2026, terms undisclosed. COO Cliff Obrecht: Canva will "soon be launching a lot more things around video creation" for Canva Grow — [TechCrunch, 23 Feb 2026](https://www.techcrunch.com/2026/02/23/canva-acquires-startups-working-on-animation-and-marketing/) (secondary). Earlier: Serif/Affinity (Mar 2024, about $380M), Leonardo.ai (2024), MagicBrief (Wikipedia says Jun 2025; TechCrunch says Jan 2025 — conflict) — [Wikipedia: Canva](https://en.wikipedia.org/wiki/Canva) (secondary). Simtheory and Ortto (Apr 2026) appear on Wikipedia without a source (unverified).
- **Affinity [shipped]**: relaunched Oct 2025 as one app (vector, pixel, layout), base app free; "downloaded more than 5 million times" since — [TechCrunch, 23 Feb 2026](https://www.techcrunch.com/2026/02/23/canva-acquires-startups-working-on-animation-and-marketing/) (secondary). No video generation in Affinity was found; Cavalry adds motion.
- **Scale**: Canva closed 2025 at $4B annualised revenue, 265M+ users, 31M paid — [TechCrunch](https://www.techcrunch.com/2026/02/23/canva-acquires-startups-working-on-animation-and-marketing/) (secondary).
- **Price — needs checking**: Canva Pro $18/month or $144/year (a June 2026 third-party guide); one India page shows Business at ₹6,800/year per person — [Piktochart](https://piktochart.com/blog/canva-pricing-2026-costs-raised/), [canva.com/pa_in/pricing](https://www.canva.com/pa_in/pricing/) (both search summary; canva.com blocked). AI credit allowances conflict between guides.
- **Commercial terms (unclear at source)**: the AI Product Terms snippet says you own your Output except Output that "modifies or incorporates Licensed Content", and outputs "may not be unique"; Canva help says AI works may be used commercially if you follow the terms — [Canva AI Product Terms](https://www.canva.com/policies/ai-product-terms) (search summary; page blocked). Whether Veo-generated clips carry extra Google terms was not found.
- **India/UK**: an India pricing page exists in Canva's own domain (search summary above). UK availability not confirmed this session.

### Inferences
- Canva is a strong **finishing and versioning surface** (brand kit, resize, editor), not an autonomous film-maker. Its 2026 cost retreat suggests a mass-market tool will ration video generation (5 Veo clips/month at launch).
- Four promises: P1 partial (conversational, preview only, designs not films); P2 partial (brand memory); P3 partial (clips plus editor, no end-to-end pipeline shown); P4 weak (preference memory, no self-judging). **About 1 of 4, all partial.**

### Gaps
- Canva's pricing, AI credits, AI Product Terms and newsroom were blocked (Cloudflare 403). Current Veo/I2V limits per plan, launch date of "Create a Video Clip", and whether Canva AI 2.0 can assemble a multi-shot video are unknown.

## Autodesk Flow Studio (ex-Wonder Studio)

### Takeaway
Flow Studio is a browser VFX/CG tool (markerless mocap, CG character insertion, camera track, clean plate, export to Maya/Blender/Unreal). In 2026 it added generative 3D (Wonder 3D), AI rigging, a "Neural Layer" renderer and, on 4 Aug 2026, a **3D Editor + node-based Canvas** that calls third-party video models (Veo 3.1, Seedance 2.0, Kling). "Agent-driven directing" is only a **potential** roadmap item.

### Cited Findings
- **Repricing [shipped]**, SIGGRAPH 12 Aug 2025: first Free tier; Lite cut from $20 to $10; new Standard tier; Free includes AI Mocap and Live Action; Pro included in the Media & Entertainment Collection; exports clean plates, 3D scenes, alpha masks, camera tracks to Maya, Blender, Unreal — [Autodesk News](https://adsknews.autodesk.com/en/?p=53687) (primary).
- **Current tiers (needs checking at source)**: Free $0, 300 credits, watermark, 720p; Lite $10/mo ($80/yr), 2,100 credits, 1080p; Standard $45/mo ($360/yr), 6,000 credits, 4K; Pro $95/mo ($765/yr), 12,000 credits, 4K; Enterprise custom, 48,000 credits. Credit costs: AI mocap 10/s; Live Action 20/s; Neural Layer 15/s; camera track or clean plate 7/s; Wonder 3D 20/generation; Character LoRA training 100/run. Page says facts checked 5 Oct 2026 — [usagepricing.com](https://www.usagepricing.com/blueprint/wonder-dynamics) (secondary; autodesk.com pricing 403).
- **Wonder 3D [shipped]**, introduced 4 Mar 2026: text-to-3D, image-to-3D, text-to-image; USD/STL/OBJ export; all tiers. No training-data or commercial-safety claim — [Autodesk News, 2 Apr 2026](https://adsknews.autodesk.com/en/news/autodesk-flow-studio-launches-wonder-3d-gen-ai-model-to-help-creators-make-3d-characters-and-objects-faster-and-easier/) (primary).
- **AI Rigging and Neural Layer [announced; tier and status not stated]**, 28 Apr 2026: "AI Rigging automatically prepares characters for animation"; "Neural Layer delivers cinematic-quality rendering without traditional pipelines" — [Autodesk News](https://adsknews.autodesk.com/en/news/autodesk-flow-studio-expands-character-creation-with-ai-rigging-and-neural-layer/) (primary).
- **3D Editor + Canvas [launched; GA/beta not stated]**, 4 Aug 2026: block scenes and direct cameras/performances in 3D, then a node-based Canvas generates the final look with "Veo, Seedance, Kling, Gemini, Omni, Nano Banana" and World Labs Marble; included "across all tiers, from Free through Enterprise". Roadmap: "potential future capabilities, including … AI-assisted scene construction, and agent-driven directing workflows" — [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/) (primary).
- **Video Node models [shipped, help docs]**: Kling V3 Pro, Kling O3 Pro Video, Kling O3 Pro Reference, Seedance 2.0, Seedance 2.0 Reference, Gemini Omni, Veo 3.1, Veo 3.1 Lite, Veo 3.1 Fast; settings for aspect ratio, duration, shot type — [Flow Studio help](https://help.wonderdynamics.com/create-new-project/canvas/video-node-and-supported-models/) (primary).
- **Commercial terms: unclear.** The Flow Studio FAQ page is a placeholder redirecting to Autodesk's FAQ, which was not reached — [help.wonderdynamics.com/faq](https://help.wonderdynamics.com/faq/) (primary). Pass-through terms for Veo/Seedance/Kling inside Canvas were not found.

### Inferences
- Flow Studio is the closest big-vendor product to a **3D-controlled ("blocking first, generate last")** pipeline, which suits a production company that wants exact camera and performance control. It is a node canvas and editor, so it breaks P1 by design.
- Four promises: **0 of 4 today**; strong P3 component for CG/VFX passes; agent directing is a "potential" roadmap line only.

### Gaps
- autodesk.com product, pricing and terms pages returned 403. India and UK store availability and INR/GBP prices not read. Release status (beta or GA) of 3D Editor + Canvas not stated by Autodesk.

## Midjourney: video model, price, terms, Disney/Universal suit, Meta

### Takeaway
Midjourney's only video model is still **V1 (18 Jun 2025)**: image-to-video, 5-s clips extendable four times by about 4 s (about 21 s in total, my arithmetic), in standard definition or a 720p HD mode. Its 2026 work has been images (V8.x, an edit model, "Thinking Mode"). The studio suit is in discovery with no merits ruling; Midjourney's motion for partial judgment on the pleadings is set for hearing on 23 Nov 2026.

### Cited Findings
- **V1 Video [shipped]**, 18 Jun 2025: "Image-to-Video" via an "Animate" button (automatic or manual motion prompt; high/low motion); extend "roughly 4 seconds at a time - four times total"; uploaded images can be a start frame; web-only at launch; a video job costs "about 8x" an image job and makes four 5-s videos — [Midjourney update](https://updates.midjourney.com/introducing-our-v1-video-model/) (primary).
- 25 Jul 2025: looping, start-and-end frame, video in the Discord bot — [Midjourney](https://updates.midjourney.com/looping-and-end-frame-for-video-video-in-the-discord-bot/) (primary). 7 Aug 2025: HD mode, "native 720p", about 3.2x the cost, Pro and Mega only — [Midjourney](https://updates.midjourney.com/hd-mode-for-video/) (primary). 13 Aug 2025: HD extended to Standard; batch sizes of 1 or 2 — [Midjourney](https://updates.midjourney.com/new-video-options-and-a-home-for-moodboards/) (primary).
- **No later video model**: Midjourney's update sitemap lists no video model after V1; 2026 posts are V8 alpha (17 Mar), V8.1 default (11 Jun), V8.2 (24 Jul), Edit model for V8 (27 Aug) — [sitemap](https://updates.midjourney.com/sitemap-posts.xml) (primary). Changelog 7 Oct 2026: "Thinking Mode" reruns a V8.2 job, "finds where it missed your prompt (wrong objects, layout, anatomy, text) and generates again" (images only); "Extend and Loop on video inform you the length cap" — [Alpha Changelog 10/7/26](https://updates.midjourney.com/alpha-changelog-10-7-26/) (primary).
- **Price — needs checking at source**: Basic $10, Standard $30, Pro $60, Mega $120 per month; 20% off annually; extra fast time $4/hour — [eesel](https://eesel.ai/blog/midjourney-pricing), [aiproductivity.ai](https://aiproductivity.ai/pricing/midjourney/) (search summary; docs.midjourney.com 403).
- **Terms — unclear (not read at source)**: guides say companies with over $1M gross revenue must use Pro or Mega for commercial use; stealth mode only on Pro/Mega — [terms.law guide](https://terms.law/2026/01/15/midjourney-commercial-use-rights-complete-2026-guide/) (search summary). Treat as not allowed until read.
- **Disney Enterprises v. Midjourney, 2:25-cv-05275 (C.D. Cal.) [legal filing]**, from the docket (primary mirror, last filing 13 Oct 2026) — [CourtListener](https://www.courtlistener.com/docket/70513159/disney-enterprises-inc-v-midjourney-inc/):
  - Filed 11 Jun 2025; Midjourney answered with a jury demand 6 Aug 2025. Warner Bros., DC Comics, Cartoon Network, Hanna-Barbera and Turner appear as consolidated plaintiffs.
  - Order 14 Nov 2025: expert discovery cut-off 21 Sep 2026; last day for motions 23 Nov 2026. Modified 15 Jul 2026, status conference 7 Dec 2026.
  - Midjourney moved for partial judgment on the pleadings (Rule 12(c)) on 21 Jul 2026; studios opposed 11 Aug; hearing moved to **23 Nov 2026**.
  - Discovery orders: production of public subscriber prompts and outputs (12 Aug 2026); training-data production stipulation approved (29 Sep 2026); next informal discovery conference 19 Oct 2026 "with the goal of beginning depositions" (order of 13 Oct 2026).
  - No merits ruling, no settlement, no trial date.
- **Meta**: no 2026 update found. Sep 2025 Vibes: "we've partnered with Midjourney and Black Forest Labs while we continue developing our own models" (Alexandr Wang) — [Tom's Guide](https://www.tomsguide.com/uk/ai/metas-vibes-is-its-latest-attempt-to-compete-with-tiktok-but-this-app-only-features-videos-made-with-ai) (search summary).

### Inferences
- Midjourney is a **look-development and image source**, not a video engine; its video is short image animation, and none of the four video posts read mentions audio.
- "Thinking Mode" is a real, shipped self-check-and-regenerate loop for images — an example of P4 mechanics, not of video.
- Legal risk is open into 2027; client work that depends on Midjourney output carries unresolved training-data exposure.
- Four promises: **0 of 4** for video.

### Gaps
- Plans, video minutes per plan, and Terms of Service not read at source (403). Country availability (India, UK) not confirmed. No record of whether video V2 is in development.

## Higgsfield: Supercomputer agent, Ads Studio, presets, price, terms, controversies

### Takeaway
Higgsfield is a multi-model aggregator (Seedance 2.5, Wan 3.0, Kling, Veo, Sora per its own page) with an agent, **Supercomputer**, that claims to plan, pick models and render from one chat, plus an ad tool that builds a brand kit from a website. Its terms allow commercial use but **train on your inputs and outputs**. Pricing could not be read; secondary figures conflict. It had a consumer-practices and marketing-content scandal in early 2026.

### Cited Findings
- **Product surface [shipped]**, site navigation: Image, Video, Audio, MCP, API, Genjutsu, Katana, AI Influencer, ChatGPT Plugin, Ads Studio, Effects, Cinema Studio, Marketing Studio, Supercomputer, 3D Jutsu, Edit, Canvas, Originals, Enterprise — [higgsfield.ai/pricing HTML](https://higgsfield.ai/pricing) (primary).
- **Homepage claims [shipped, marketing]**: "Wan 3.0 Unlimited: Up to 30-second videos … No limits"; Seedance 2.5 "The most advanced video model"; metadata "30+ models including Sora 2, Kling 3.0, Veo 3.1"; Cinema Studio 4.0; Katana "Turn your clips into cool edits with one command"; Supercomputer "One superagent for your entire creative stack", "Agent powered by GPT-6 Astra"; Higgsfield MCP for Claude; "Higgsfield Dots for ChatGPT (MCP)"; visual-effects presets (e.g. "High flip", "Wild ride"); "4.5M video generations per day" — [higgsfield.ai](https://higgsfield.ai/) (primary). "Unlimited" is not defined. Camera presets as such were not shown on the pages read.
- **Supercomputer [shipped; launch date and beta status not stated]**: describe what you want and it "plans it, picks the models, and renders it"; skills include Ad Multiplier, Editorial Motion Graphics, Faceless Video, UGC, Brandkit, Shorts Maker, Website Building; connectors, MCP, Projects, an **"Ask before generating"** setting; no models named — [higgsfield.ai/supercomputer](https://higgsfield.ai/supercomputer) (primary). Secondary reports add 40+ tools, routing to Claude Opus 4.7, GPT-5.5 Pro and Gemini 3.1 Pro, three memory layers, Telegram access, included in paid plans from $15/month — [Postium](https://postium.ru/higgsfield-predstavila-supercomputer/), [BitsMinds](https://www.bitsminds.com/news/higgsfield-supercomputer-cloud-native-ai-agent-2026) (search summary; conflicts with "GPT-6 Astra" on the homepage).
- **Ads Studio [shipped]**: enter a website and "Your logo, colors, brand voice, and selling points load automatically"; imports products with names, images, prices; outputs variations in 1:1, 4:5 and 9:16 with headlines and CTAs; page does not say whether outputs are video or static — [higgsfield.ai/ads-studio](https://higgsfield.ai/ads-studio) (primary).
- **Price — needs checking**: the pricing page loads plans in the browser only. Third-party figures conflict: Ultimate $49 ($39 annual) 1,200 credits and Creator $249 ($199) 6,000 credits (affiliate blog); Plus $59 ($47) 1,200 credits (a competitor's blog); entry from $15/month (Postium). Top-up credits reportedly expire after 90 days — [Inside Verdict](https://insideverdict.bearblog.dev/higgsfield-ai-pricing-how-much-does-it-cost-20-off-discount/), [Creatify](https://creatify.ai/blog/higgsfield-pricing-(2026)-plans-and-what-you-ll-actually-pay) (search summary).
- **Terms of Use [primary]**, "Last updated: July 26, 2026" (effective 27 Aug 2026 for existing users) — [higgsfield.ai/terms-of-use-agreement](https://higgsfield.ai/terms-of-use-agreement):
  - "Company does not claim ownership of any of your Inputs or Outputs … nor does it restrict your commercial use of Outputs" (no free/paid distinction stated).
  - Content, inputs and outputs "may be used by Company to train, develop, enhance, evolve, and improve its (and its affiliates') AI models"; stop only by deleting content or account.
  - Refund within 7 days of initial purchase; otherwise non-refundable. California law; San Francisco courts.
  - You may not use outputs to train competing models, nor "represent that any Output is human-generated"; disclose AI generation where law requires. You indemnify Higgsfield for your use of outputs.
  - UK appears only in a consumer withdrawal clause; India is not mentioned.
- **Funding/revenue**: see `market_money.md` ($400M Series B at $5.4B, Aug 2026; $700M run-rate claim).
- **Controversies [report]**: The Times of Central Asia (Feb 2026) reported cancellation "dark patterns", generation slowing after a Black Friday "unlimited" promotion (up to 65% off, $25/month), marketing videos with racist and sexually explicit lines in cartoon voices, alleged unauthorised celebrity deepfakes, and account suspensions. Higgsfield blamed bot attacks, said about $1.35M was refunded, and co-founder Alexander Mashrabov wrote: "Our internal processes and external communications did not always keep pace with our values, and we made mistakes." — [Times of Central Asia](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/) (secondary; allegations attributed to unnamed media and social posts); relayed by [Grit Daily, 12 Oct 2026](https://gritdaily.com/kazakh-startup-higgsfield-criticism/) (secondary).

### Inferences
- Supercomputer is the nearest shipped product in this file to "one prompt in, video out", but only for **short-form marketing formats** (UGC, faceless, shorts, ads). No evidence of self-judging, and no independent test.
- Training on client inputs and outputs conflicts with Netflix-style production rules (below) and with most brand NDAs; treat as unsuitable for confidential client material without an enterprise contract that switches this off.
- Four promises (vendor claims only): P1 partial, P2 partial ("Ask before generating", Brandkit), P3 partial (short formats), P4 not shown. **About 2 of 4, partial, unverified.**

### Gaps
- Plan prices, credit costs, currency and India pricing; Enterprise terms (whether training can be disabled); any independent test of Supercomputer output quality.

## Netflix, Getty Images, Shutterstock: generative video use and licensing

### Takeaway
Netflix uses gen-AI widely in post-production (about 300 titles in 2026, including India's *Glory*) and bought an AI post-production company, but its partner rules say generated material is temporary and not in final deliverables without approval. Getty and Shutterstock sell licensed training data and Getty sells an image (not video) generator; their merger collapsed in July 2026. No licensed Getty/Shutterstock video model was found to be on sale.

### Cited Findings
- **Netflix partner guidance [published 2025]**: five principles — outputs must not "replicate or substantially recreate identifiable characteristics of unowned or copyrighted material"; tools must not "store, reuse or train on production data inputs or outputs"; enterprise-secured tools "where possible"; "Generated material is temporary and not part of the final deliverables"; no replacing or generating talent performances or union-covered work without consent. Written approval needed for key story elements (main characters, visuals, settings), public-figure or deceased likenesses, significant performance alterations, and use of proprietary or third-party material; "no" or "unsure" means escalate — [TheWrap, 22 Aug 2025](https://www.thewrap.com/netflix-generative-ai-use-content-production-guidelines/) (secondary; the Netflix page itself did not render, see `big_players_us_platforms.md`). No 2026 revision found.
- **Netflix Q2 2026 letter (16 Jul 2026)**: "In 2026, GenAI workflows have been used in roughly 300 of our titles", "with the largest concentration of work in post-production"; *Glory* (India), *Brasil 70*, *The American Experiment* used it "to create highly complex sequences" — [Engadget](https://engadget.com/2217157/netflix-says-it-s-already-used-ai-in-roughly-300-titles-this-year) (secondary).
- **InterPositive acquisition [announced Mar 2026]**: Ben Affleck's 16-person AI post-production start-up (continuity fixes, visual enhancement, editing); Affleck becomes senior adviser; for Netflix's creative partners, not for sale; price undisclosed, reported "up to $600M" — [Variety AU](https://au.variety.com/2026/biz/global/netflix-acquires-ben-affleck-ai-filmmaking-startup-interpositive-33884) (search summary); a $587M cash figure "from a filing" is reported only by [SentiSense](https://app.sentisense.ai/stories/netflix-acquires-ben-afflecks-ai-startup-for-587-million-07192026) (unverified).
- **Getty generative products [shipped, image only]**: "Generative AI by Getty Images and Generative AI by iStock" are "text to image and image to image tools", trained on Getty creative content, standard royalty-free licence, "designed to be a commercially-safe and responsible solution"; Getty also licenses data for model training and compensates contributors; "Other" revenue (incl. data licensing) fell to 3.0% of revenue in H1 2026 from 5.4%; no video generation product is mentioned — [Getty 10-Q, Q2 2026](https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm) (primary).
- **Getty–Shutterstock merger [terminated]**: CMA final report 15 May 2026 allowed it only with divestment of Shutterstock's whole editorial business; Getty's board declined on 30 Jun 2026 and served termination on **7 Jul 2026** — [Getty 10-Q](https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm) (primary).
- **Getty v Stability**: UK Court of Appeal hearing on secondary infringement "expected to be held in November 2026"; US case (N.D. Cal., filed 14 Aug 2025) in fact discovery — [Getty 10-Q](https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm) (primary).
- **Runway–Getty "RGM" [announced 4 Dec 2023]**: enterprise video model on Getty's licensed library, fine-tunable on customer data, "available … in the coming months" — [Runway news](https://runwayml.com/news/runway-partners-with-getty-images) (search summary). Current status not found.
- **Shutterstock data deals**: research licence to Lightricks for LTXV on HD/4K footage (Dec 2024); Synthesia licensed the library for EXPRESS-2 (2025); OpenAI six-year deal (2023) — [CO/AI](https://getcoai.com/news/shutterstock-lightricks-partnership-offers-example-of-how-to-ethically-source-training-data-for-ai-video) (search summary). Q1 2026 Data, Distribution & Services revenue $21.0M, down 47% — [Shutterstock Q1 2026 release](https://investor.shutterstock.com/node/14656) (search summary of primary). A $163.4M goodwill impairment after the merger ended and withdrawn guidance are reported only by an aggregator (unverified).

### Inferences
- For Das: if a buyer is Netflix (or follows its rules), an agent must log every model, avoid tools that train on inputs/outputs (Higgsfield, Decart terms below), keep gen-AI out of final frames unless approved, and never synthesise performances without consent. These rules are a ready-made checklist for P2/P4 compliance.
- "Licensed-data" video is still mostly announced or data-only; there is no Getty/Shutterstock video generator to plug in today.
- Four promises: not applicable (buyers and data suppliers, not tools).

### Gaps
- Netflix's current partner-help text (did not render); InterPositive's price at source; RGM availability; Shutterstock's Q2 2026 10-Q not read.

## Apple WWDC 2026 and AWS re:Invent 2025

### Takeaway
Neither event announced a video generation model or a video agent. Apple upgraded still-image generation (with Google-built models); AWS launched Nova 2 models that read video but output text and images.

### Cited Findings
- **Apple, WWDC 8 Jun 2026 [announced; shipped Sep 2026]**: "an all-new Image Playground that creates photorealistic imagery", usable for Lock Screen wallpapers and Contact Posters; generated on Private Cloud Compute with a hidden SynthID watermark; foundation models "custom-built in collaboration with Google and its Gemini models"; image generation has daily usage limits — [Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-intelligence-brings-powerful-ai-capabilities-into-everyday-experiences/), [Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-unveils-next-generation-of-apple-intelligence-siri-ai-and-more/) (search summary of primary); release "available today" — [Apple Newsroom IE, Sep 2026](https://www.apple.com/ie/newsroom/2026/09/next-generation-of-apple-intelligence-available-today/) (search summary).
- Video-related WWDC items were analysis or editing only: Home app "AI Video Descriptions", Photos AI reframing, a Photos slideshow maker; no generative video, no Final Cut news at WWDC — [MacRumors recap, 8 Jun 2026](https://www.macrumors.com/2026/06/08/wwdc-2026-recap/) (secondary, headlines only). Final Cut Pro 12.3 items are in `big_players_us_platforms.md`.
- **AWS re:Invent 2025 [announced]** (roundup 30 Nov 2025, updated 5 Dec 2025): "Amazon Nova 2 Omni in Preview … all-in-one model for multimodal reasoning and image generation" with text, image, video and speech inputs; Nova Act GA for browser UI automation; Bedrock added models from Google, Kimi, MiniMax, Mistral, NVIDIA, OpenAI and Qwen. No video generation model in the visible text — [AWS News Blog](https://aws.amazon.com/blogs/aws/top-announcements-of-aws-reinvent-2025/) (primary; page truncated).

### Inferences
- Four promises: **0 of 4** for both. Apple matters as a finishing and device surface; AWS as hosting (Nova 2 Omni could be a video-understanding judge input, not a generator).

### Gaps
- Full AWS roundup text (truncated) and AWS What's New for any Nova Reel update; Apple's Image Playground API terms.

## Smaller labs: Genmo, Decart, Baidu, Zhipu, StepFun, ByteDance OmniHuman, Alibaba Qwen agents, Tencent Hunyuan Foley/Avatar

### Takeaway
None of these ships a whole-video agent. Useful parts: Mochi 1 (Apache-2.0), Step-Video (MIT), Decart's cheap real-time restyling (but terms forbid giving outputs to third parties without consent), Zhipu's CogVideoX-3 API ($0.20/video, terms unread). Hunyuan Foley and Avatar exclude the UK.

### Cited Findings
- **Genmo [weights]**: homepage now pitches "Open world models … video world models"; Mochi 1 is still the flagship open text-to-video model with a playground — [genmo.ai](https://www.genmo.ai/) (primary). Hugging Face `genmo/mochi-1-preview` licence tag Apache-2.0, last modified 6 Oct 2026 — [HF API](https://huggingface.co/api/models/genmo/mochi-1-preview) (primary). No newer model found. Commercial use: allowed per licence tag (card text not re-read).
- **Decart [shipped, API]**: Lucy 2.5 real-time $0.02/s (fast $0.04/s) at 720p; video Lucy 2.5 $0.04 per generated second; Lucy Restyle 2 $0.01/s; Lucy VTON 3.6; Oasis 3 Preview $0.02/s; Lucy Image 2 $0.01–0.02 — [Decart pricing](https://docs.platform.decart.ai/getting-started/pricing) (primary). **API Terms (26 Jul 2026)**: "Developer retains ownership of Input and Output", but §3.6(c) bars providing Output to third parties without Decart's prior written consent, and Decart takes a perpetual licence and "may use Inputs and Outputs to train"; New York law — [Decart API terms](https://docs.platform.decart.ai/resources/api-terms) (primary). **Client deliverables: not allowed without written consent.** Funding in `market_money.md`.
- **Baidu MuseSteamer [shipped, business-only, Jul 2025]**: image-to-video up to 10 s, Turbo/Pro/Lite — [AOL/Reuters](https://www.aol.com/news/baidu-launches-ai-video-generator-084131165.html) (search summary). No 2026 update found; terms not read.
- **Zhipu (Z.ai) [shipped, API]**: price list shows **CogVideoX-3 $0.20 per video** and a "Popular Special Effects Video Templates" agent at $0.20 per video — [Z.ai pricing](https://docs.z.ai/guides/overview/pricing) (primary). API terms not read (unclear = not allowed). Open CogVideoX1.5-5B carries licence "other" (registration needed; see `open_source_research.md`) — [HF API](https://huggingface.co/api/models/zai-org/CogVideoX1.5-5B) (primary).
- **StepFun [weights]**: Step-Video-T2V (Feb 2025), MIT tag, last modified 19 Feb 2025; no 2026 successor found — [HF API](https://huggingface.co/api/models/stepfun-ai/stepvideo-t2v) (primary); [search results](https://osai-index.eu/model/step-video) (search summary).
- **ByteDance OmniHuman [shipped, API]**: OmniHuman 1.5 on fal at $0.16/s vs $0.14/s for v1 — [fal](https://fal.ai/learn/biz/omnihuman-15-vs-omnihuman-comparison) (search summary, reseller). BytePlus "Specific Terms for the BytePlus Video Generation Model Services" updated 8 Sep 2026, body not rendered — [BytePlus](https://docs.byteplus.com/en/docs/ModelArk/Specific_Terms_for_the_BytePlus_Video_Generation_Model_Services) (primary, unread). ModelArk Playground terms reportedly limit use to "private and non-commercial" — [BytePlus Playground ToS](https://docs.byteplus.com/en/docs/legal/tos_modelark_playground) (search summary). API commercial terms: unclear = not allowed. (OmniHuman 2.0 prices: see `pieces_planning_audio_edit.md`.)
- **Alibaba Qwen-based video agents**: no official Qwen video agent found. Resellers list Wan 2.6 (1080p/24 fps, multi-shot, up to 15 s; dated 28 Mar 2026) and Wan 2.7 — [OpenRouter](https://openrouter.ai/alibaba/wan-2.6-20260327), [Atlas Cloud](https://www.atlascloud.ai/collections/qwen-wan) (search summary). Wan 3.0 and the open VideoClaw agent (Qwen + Wan) are in the earlier notes.
- **Tencent Hunyuan [weights]**: HunyuanVideo-Foley (release 28 Aug 2025) and HunyuanVideo-Avatar (release 28 May 2025) both use the Tencent Hunyuan Community Licence: "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA" — [Foley LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-Foley/main/LICENSE), [Avatar LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-Avatar/main/LICENSE) (primary). India: within territory under its terms; UK: not licensed.

### Inferences
- Licence-clean, self-hostable for India **and** UK: Mochi 1 (Apache-2.0), Step-Video (MIT). Not for UK: Hunyuan family. Not for client delivery without a contract: Decart. Unknown: Zhipu API, BytePlus API, Baidu.
- Four promises: **0 of 4** each; all are components (P3 parts).

### Gaps
- Baidu, StepFun and Zhipu 2026 roadmaps (Chinese-language sources not searched); OmniHuman API terms; Decart enterprise licence terms; GitHub org listings (session could not query org APIs).

## How far each covers the four promises (summary)

### Takeaway
Only Higgsfield's Supercomputer claims an end-to-end, one-chat agent, and only for short marketing formats, with no independent test. Canva is preview-stage and design-first; Autodesk lists agent directing as "potential". Everyone else here is a component, a buyer with rules, or a data supplier.

### Cited Findings
| Company | P1 | P2 | P3 | P4 | Status of agent claim | Source |
|---|---|---|---|---|---|---|
| Canva | partial | partial | partial | weak | research preview (16 Apr 2026) | [FoneArena](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html) |
| Autodesk Flow Studio | no (node canvas) | no | partial (CG/VFX) | no | roadmap "potential" | [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/) |
| Midjourney | no | no | no (5–21 s I2V) | images only (Thinking Mode) | none | [Midjourney](https://updates.midjourney.com/alpha-changelog-10-7-26/) |
| Higgsfield | partial | partial | partial (short formats) | not shown | shipped, vendor claims | [Supercomputer](https://higgsfield.ai/supercomputer) |
| Netflix / Getty / Shutterstock | n/a | n/a | n/a | n/a | not tools | see section above |
| Apple, AWS | no | no | no | no | none | see section above |
| Smaller labs | no | no | component | no | none | see section above |

### Inferences
- The gap the client wants to fill (whole film, taste, self-correction) is still open among these players; Higgsfield is the closest commercial rival in short-form ads, and its training-on-outputs terms are a differentiator Das can exploit with clients who care about confidentiality.

### Gaps
- No independent quality test was found for any agent named here.
