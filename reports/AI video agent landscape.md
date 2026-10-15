# Many sell the pieces; nobody sells the whole agent

*Research report for Das Production (Kolkata; India and UK markets). Written 2026-10-15 from twelve research-note files gathered the same day.*

## The answer

**Nobody sells the whole thing. But most of it is already on sale, from funded companies, and two big players are close behind.** "One brief in, a finished short video out, with voice, music, captions and several sizes" ships today. Runway Agent has been generally available since 13 May 2026 ([Runway changelog](https://runway.com/changelog)). invideo Agent Two has been on paid plans since July–August 2026 ([invideo Workflows](https://invideo.io/news/introducing-workflows-invideo-agent-two/)). Krea Agent (beta), Higgsfield's Supercomputer, HeyGen's Video Agent, Atlabs, Medeo and Mootion sell versions of it too. For Amazon ads only, Amazon gives away a Creative Agent that goes from chat to storyboard to finished ad ([ChannelX](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/), secondary). Adobe's Firefly AI Assistant (public beta since 27 April 2026) is the only big-company product that says it asks you questions and learns your preferences ([Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta)). Google has every piece in-house (Flow Agent, Gemini Omni, Veo, Lyria music, Vids, and a self-critiquing research agent called VISTA) but has not joined them into one product ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)). OpenAI has left: the Sora 2 API shut on 24 September 2026 with "no one-to-one replacement" ([OpenAI](https://developers.openai.com/api/docs/models/sora-2)). What nobody ships with evidence is promise 4: an agent that judges its own clips, fixes them and learns one person's taste. On my scale (explained below), no product scores above 2.5 of 4. The best products are invideo Agent Two and Krea Agent (2.5 each; the open-source ViMax also reaches 2.5). Runway Agent, Adobe's assistant and Amazon's Creative Agent are among several at 2. All of them still need a person to pick the good takes.

### The three most important findings

**1. The "assembly" part is already a commodity.** Writing the script, picking an engine per shot, adding voice, music and captions, and resizing are sold for about $15–$150 a month (Runway Standard $15; invideo Max $150) ([Runway pricing](https://runway.com/pricing); [invideo pricing](https://invideo.io/pricing)). Runway's Model Routers pick the engine automatically (21 July 2026) ([Runway changelog](https://runway.com/changelog)). Adobe routes across 30+ models ([Adobe newsroom](https://news.adobe.com/news/2026/04/adobe-new-creative-agent)). Engines also churn: the top eight text-to-video models sit within 42 Elo of each other, which is about a 56% head-to-head preference ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video); my arithmetic). A small company cannot win on "one prompt, many engines" alone.

**2. The real gap is trust: exactness and taste.** No vendor publishes how often a real product, logo or on-screen text survives generation. The one independent product test found had "distorted and illegible" label text ([ProVideo Coalition](https://www.provideocoalition.com/ai-tools-heygen-avatar-iv-gets-real/), secondary, 14 Sep 2025). Coca-Cola's 2025 holiday ad had its logo composited in afterwards ([Know Your Meme](https://knowyourmeme.com/memes/ai-generated-coca-cola-christmas-ad), secondary). Automatic judges are weak. Frontier AI models (GPT-5, Gemini 2.5 Pro, Claude Sonnet 4) match a person's 1–5 score only 26–29% of the time ([VideoScore2 paper](https://arxiv.org/html/2509.22799v1)). The best trained scorers agree with people on about 72–74% of pairwise choices on familiar data, and about 50% on new data ([VideoAlign paper](https://arxiv.org/html/2501.13918v2)). So people still do the picking. invideo's own team used 41 of 164 clips ([invideo FAQ](https://invideo.io/faq/why-does-invideo-agent-one-run-out-of-credits/)). The Kalshi ad kept 15 of 300–400 generations ([CO/AI](https://getcoai.com/news/kalshis-nba-finals-ad-costs-just-2k-using-googles-ai-video-tool/), secondary). McDonald's Netherlands took "ten people, five weeks" for 45 seconds ([NBC News](https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590), secondary).

**3. Your skeleton approach is a known idea done with unusual discipline.** "Render in 3D, then let AI paint the surface" is shipped for robots and cars (NVIDIA Cosmos-Transfer) ([GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5)). It is sold as a creative studio (Intangible) ([intangible.ai](https://www.intangible.ai/)). Havas uses "3D inputs for camera control" with Runway painting textures and lighting ([Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns)). Unilever builds a 3D twin of every pack ([Unilever](https://www.unilever.com/news/news-search/2025/unilever-reinvents-product-shoots-with-ai-for-faster-content-creation/), search summary). Autodesk Flow Studio added a 3D editor that feeds Veo, Seedance and Kling on 4 August 2026 ([Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/)). What I did not find anywhere is the full loop: pass marks written before the clip exists, every clip measured against the 3D plan, and exact parts composited back by default. That is a real but narrow edge. It is strongest sold as proof of exactness and compliance, and weakest sold as "better generation". Note also that in India, Galleri5 (Collective Artists Network) already sells AI "orchestration" to Star Plus and JioHotstar ([MediaNews4U](https://www.medianews4u.com/collective-artists-network-galleri5-launch-indias-first-cinema-native-production-operating-system-at-the-india-ai-impact-summit/), secondary).

### How to read this report

- **Dates.** Every link was read on **2026-10-15** (the research date of the notes) unless another read date is given. A date inside a claim is the date of the claim itself (launch, filing, article).
- **Source markers, kept from the notes.** No marker = the company's, court's, regulator's or paper's own page, read directly. **(secondary)** = news, blog, reseller, aggregator or competitor. **(search summary)** = the fact came from a search engine's summary, not from the page. **(unverified)** = could not be confirmed, or only one weak source. **(press release)** = the company's own words on a newswire.
- **Stage words.** **Shipped** = on sale or generally available. **Beta** = beta, preview, waitlist or test. **Announced/demo** = press release, demo video or "coming soon". **Paper** = research only. Showreels and launch videos count as demos.
- **"Promises covered" score.** The notes used three different scales (0–4 per promise, 0–16 totals with half points, and Yes/Partial/No). I re-judged everything on one scale, from the cited sources. This is my judgement. **✓** = documented for that product. **½** = part of it, or claimed by the vendor without evidence. **✗** = absent or not documented. Score = number of ✓ plus half the number of ½, out of 4. P1 = one prompt in. P2 = understands and asks only when needed. P3 = does everything (script to delivery, including colour, all three sizes and long and short cuts). P4 = the person likes it (judges itself, fixes, learns taste). **No product gets ✓ on P2, P3 or P4**, because none documents asking only when needed, colour grading plus all versions, or a tested self-check. So 2.5 is the highest score anyone reaches.
- **Commercial use.** **Allowed** = the licence or terms read permit it. **Conditional** = allowed with limits (revenue caps, notices). **Unclear = treat as not allowed**, as the founder asked. India and UK territory limits are flagged where found.
- **Prices** are in US dollars as shown on the page on the read date, unless marked. Prices are not converted except where I say so.
- **Research limits.** A shared web-search budget ran out partway through every research track, and many sites blocked access. Section 9 lists what was not reached.

## 1. The map: every player found

One table, in six groups. "Promises" uses the scale explained above (my judgement from the cited sources). "n/a" means the player is a buyer, data supplier or part, not a product to score. A blank price means the notes found none.

| Name | Type | What it does | Promises (of 4) | Stage (date) | Price (as read) | Commercial use (India / UK) | Source |
|---|---|---|---|---|---|---|---|
| **A. Big players and model labs** | | | | | | | |
| Google Flow Agent + Gemini Omni (+ Flow Music) | Big player | Chat agent inside Flow: plans multi-step tasks, makes variations, batch-edits; Omni edits video by conversation, extends to 40 s | 1 (P1½ P2✗ P3½ P4✗) | Shipped; agent 19 May 2026; Omni 1.1 Flash 27 Aug 2026 | Omni ≈ $0.10/s at 720p (API); AI Ultra $100 or $200/mo; no India/UK prices | API: Google "won't claim ownership"; conditional. Omni will not edit uploaded video in the UK/EEA. No indemnity found for consumer Flow → unclear | [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing); [Omni docs](https://ai.google.dev/gemini-api/docs/omni) |
| Google Vids | Big player | Prompt → script, Veo clips, avatars, voiceover, Lyria music; 16:9, 9:16 and 1:1; up to 30 min | 1 (P1½ P3½) | Shipped; Veo and Lyria added 2 Apr 2026 | Free to try; 10 Veo clips/mo on personal accounts | No indemnity found → unclear | [Google Workspace](https://workspace.google.com/products/vids/); [ppc.land](https://ppc.land/google-vids-gets-free-veo-3-1-video-generation-music-and-ai-avatars/) (secondary) |
| Google Ads Asset Studio; Pomelli | Big player | Reads brief, brand, website and goals → ad assets incl. Veo video; Pomelli builds "Business DNA" from a URL | 1 (P1½ P2½ P3✗) | Asset Studio shipped 10 Sep 2025, Omni features rolling out summer 2026; Pomelli a Labs experiment | Not stated | Unclear | [ppc.land](https://ppc.land/asset-studio-gets-gemini-omni-and-1-click-creative-testing-at-gml-2026/) (secondary); [onlinemarketing.de](https://onlinemarketing.de/technologie/googles-ai-marketing-tool-pomelli-video-ads) (search summary, unverified) |
| OpenAI Sora 2 / Sora app | Big player | Was text-to-video with audio, cameos and stitching | 0 | **Discontinued**: announced 24 Mar 2026; API off 24 Sep 2026; app reportedly closed 26 Apr 2026 | Was $0.10–$0.70/s | n/a | [OpenAI](https://developers.openai.com/api/docs/models/sora-2); [Engadget](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html) (secondary) |
| Meta Advantage+ / Ads Creative Studio / business assistant | Big player | Video from static ads (shipped); concepts with hook, audio, length and ending edits; catalog video (beta); conversational campaign creation (test) | 1.5 (P1½ P2½ P3½ P4✗) | Mixed: shipped, beta and test, 6 Oct 2026 | Not stated | Outside Meta ads: unclear | [Meta newsroom](https://about.fb.com/ltam/news/2026/10/advertising-week-new-york-2026-nuevas-capacidades-de-ia-para-guiar-campanas-y-llegar-a-los-clientes/) |
| Meta Vibes; Movie Gen; Muse Video | Big player | Short AI-clip feed (10 s edit cap); Movie Gen is a 2024 paper; Muse Video "in development" | 0 | Vibes shipped Sep 2025, standalone app in test; Movie Gen paper Oct 2024 | Freemium planned | Unclear → not allowed | [TechCrunch](https://www.techcrunch.com/2026/02/05/meta-tests-a-standalone-app-for-its-ai-generated-vibes-videos) (secondary); [arXiv 2410.13720](https://arxiv.org/abs/2410.13720); [Meta newsroom](https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/) |
| Adobe Firefly AI Assistant | Big player | Creative agent across Firefly, Premiere, Photoshop; "asks you questions"; "learns your creative preferences" (claimed); 30+ models; Quick Cut first cut; storyboard-to-video; product video | 2 (P1½ P2½ P3½ P4½) | Public beta 27 Apr 2026; new skills 18 Jun 2026; all Creative Cloud plans from 1 Oct 2026 per FAQ (search summary, unverified) | Firefly from $9.99/mo (search summary; needs checking) | Indemnity enterprise-only; reportedly excludes beta features and Runway/Kling/BFL outputs (secondary, unverified) → unclear | [Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta); [Adobe blog](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work); [Adobe Community](https://community.adobe.com/questions-404/using-firefly-ai-assistant-beta-for-final-production-and-i-indemnification-1640494) (secondary, unverified) |
| Apple Final Cut Pro | Big player | Assistive editing AI: captions, masks, beat detection, edit detection, colour match. No generative video | 0 | Shipped; 12.3 on 30 Jun 2026 | | n/a | [Apple release notes](https://support.apple.com/en-us/102825) |
| Amazon Ads Creative Agent | Big player | Chat → researches product and audience → storyboard with scene scripts → video and display ads with music and voice | 2 (P1✓ ads only, P2½ P3½ P4✗) | Shipped: UK 12 Feb 2026, Canada 25 Feb 2026; India not confirmed | No extra cost | Use outside Amazon placements unclear → not allowed | [ChannelX](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/) (secondary); [Amazon Ads](https://advertising.amazon.com/library/news/unboxed-toronto-2026) |
| Amazon Ads Video Generator | Big player | One image + ASIN → up to six 15-s videos with text and music | 1.5 (P1✓ P3½) | Open beta in **India and the UK** from 11 Nov 2025 (Sponsored Brands) | Free | Inside Amazon ads only | [Amazon Ads](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns) |
| AWS Nova Reel | Big player | Up to 2-min multi-shot 720p, storyboarding; no audio; v1.1 US East only | 0.5 (P3½) | Shipped; wind-down reported | | Not read | [AWS docs](https://docs.aws.amazon.com/nova/latest/userguide/video-generation.html); [Mezha](https://mezha.ua/en/news/amazon-shuts-down-nova-313675/amp/) (search summary, unverified) |
| Microsoft Clipchamp Copilot; Bing Video Creator | Big player | Prompt → script + stock footage + voice + music (Clipchamp); Bing used Sora | 1 (P1½ P3½) | Clipchamp shipped 2025; Bing's engine after Sora's shutdown unknown | | Not read | [heise](https://www.heise.de/en/news/Copilot-gets-Clipchamp-support-for-automatic-video-creation-10255460.html) (secondary); [Windows Report](https://windowsreport.com/microsoft-upgrades-bing-video-creator-with-openais-sora-2-ai-video-model/) (search summary) |
| NVIDIA Cosmos (Transfer 2.5, Cosmos 3) | Big player | World models for robots and cars; Transfer turns 3D renders into realistic video under depth, edge and segmentation control | 0 (a part) | Shipped open models; Transfer 2.5 on 6 Oct 2025 (now limited maintenance) | Free weights | Transfer 2.5: NVIDIA Open Model License, conditional. Cosmos 3: OpenMDW-1.1, unread → unclear | [NVIDIA Cosmos](https://www.nvidia.com/en-us/ai/cosmos/); [GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5) |
| ByteDance Seedance 2.5 / Dreamina / Pippit | Big player | Seedance 2.5: 30-s clips with audio, up to 50 references, timestamp edits. Pippit: link or file → marketing video agent with avatars and scheduling | Pippit 1.5 (P1✓ P3½) | Seedance 2.5 released 31 Jul 2026 (China; abroad via Runway, Luma, others); Pippit shipped | Seedance 2.5 via Runway $0.20–$0.68/s; Dreamina promo "from $1.50/mo" | BytePlus terms unread → unclear. **CapCut banned in India since 2020.** Studio cease-and-desists over Seedance 2.0 (Feb 2026) | [TechNode](https://technode.com/2026/07/31/bytedance-launches-seedance-2-5-video-generation-model/) (secondary); [Pippit](https://www.pippit.ai); [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/); [Wikipedia: CapCut](https://en.wikipedia.org/wiki/CapCut) (secondary) |
| Kuaishou Kling (3.0, 4.0, Agent, Canvas, MCP) | Big player | Agent inside a node Canvas (brainstorm, script, storyboard, generation, post); MCP and CLI for outside agents | 1 (P1½ P3½) | Kling 3.0 shipped Feb 2026; 4.0 Flash to Ultra yearly subscribers 28 Sep 2026; full release "October 2026" (secondary) | API prices behind login (needs checking); via Runway $0.12–$0.43/s | Unclear → not allowed | [kling.ai](https://kling.ai); [Kuaishou Q2 results](https://www.webull.com/news/15428603170825216); [AI Weekly](https://aiweekly.co/alerts/kuaishous-kling-ships-kling-40-flash-to-annual-subscribers-30-second-4khdr-ai) (secondary) |
| Alibaba Wan 3.0; Wan 2.2 | Big player | Wan 3.0: #1 on the independent with-audio board (Elo 1174), 30 s at 1080p. Wan 2.2: open weights, 5 s at 720p | 0 (engine) | Wan 3.0 broad release 24 Aug 2026 (secondary); Wan 2.2 weights 28 Jul 2025 | Wan 3.0 $0.05–$0.28/s (secondary) or CNY 0.3–1.2/s (Alibaba) | Wan 3.0 API terms unread → unclear. **Wan 2.2: Apache-2.0, allowed in India and UK** | [DataNorth](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model) (secondary); [Alibaba Model Studio](https://help.aliyun.com/en/model-studio/wan3-0-video); [Hugging Face](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B) |
| Tencent HunyuanVideo (+ Foley, Avatar) | Big player | Open-weight video, foley and avatar models | 0 | Weights; v1.5 on 21 Nov 2025 | Free | **Licence excludes the EU, UK and South Korea → not allowed for UK work**; India conditional | [HunyuanVideo-1.5 LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE) |
| MiniMax H3 / Hailuo Agent / Speech / Music | Big player | H3: 15 s with stereo audio, #4 on the board; owns speech and music models; "Hailuo Agent" is templates | 1 (P1½ P3½) | H3 API 31 Jul 2026, weights 3 Aug 2026 | ≈ $0.08–$0.13/s (secondary) | **H3 weights: UK, US, EU and South Korea are "excluded territories" → UK not allowed without a separate licence**; India conditional. Disney/Universal/WBD suit survived dismissal May 2026 | [Hugging Face MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3); [The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open) (secondary); [Bloomberg Law](https://news.bloomberglaw.com/ip-law/disneys-copyright-suit-against-chinese-ai-developer-advances) (search summary) |
| xAI Grok Imagine Video | Big player | API video with audio, 1–15 s | 0 (engine) | Shipped | $0.02–$0.08/s | Terms unread → unclear | [xAI docs](https://docs.x.ai/docs/models) |
| Runway Agent (+ Model Routers, Aleph 2, Ruby HDR) | Big player (video lab) | One conversation → commercials, ads, product videos; picks the model; voiceover, edits, resize, localise; Brand Kits, timeline, workflows, PDF briefs | 2 (P1✓ P2½ P3½ P4✗) | Shipped 13 May 2026; Agent 2.0 25 Jun 2026; Draft Mode 2 Oct 2026 | Standard $15/mo (625 credits) to Max $95; Agent from Standard; API $0.05–$1.50/s | Terms not read → unclear → not allowed until read | [Runway changelog](https://runway.com/changelog); [Runway Agent](https://runway.com/product/agent); [Runway pricing](https://runway.com/pricing) |
| Luma Agents / Ray3.2 | Big player (video lab) | Agents used for Mazda's first AI-produced commercial; Ray3.2 outputs 16-bit HDR EXR; Modify keeps pose or blocking | 1.5 (P1✓ P3½) | Agents shipped (Mazda by 15 Apr 2026); launched Mar 2026 (search summary) | Plus $30 to Ultra $300/mo | Commercial use listed from Plus; model terms unclear | [Luma news](https://lumalabs.ai/news); [Luma pricing](https://lumalabs.ai/pricing); [Luma Ray](https://lumalabs.ai/ray) |
| Pika ("New Pika") | Big player (video lab) | One studio mixing its own speech, music, SFX and colour-grade apps with third-party video models; no agent | 0.5 (P3½) | Relaunched 17 Sep 2026 | Not shown | Unclear | [pika.art](https://pika.art) |
| Lightricks LTX Studio; LTX-2.x weights | Big player (video lab) | Script → scenes → storyboard → shots with SFX and music; you drive each step; open LTX-2.5 weights | 1 (P1½ P3½) | Shipped | Lite $15, Standard $35, Pro $125/mo (page has stale promos; needs checking) | Studio: commercial from Standard; Free is personal only. **Weights free only under $10M revenue; clause (s) bars use in competing products** → ask in writing | [LTX pricing](https://ltx.io/studio/pricing); [LTX-2 licence](https://static.lightricks.com/legal/ltx-2-open-weights-license-0.X.pdf) |
| Moonvalley Marey | Big player (video lab) | Trained only on licensed data; camera moves from one image; pose, motion and trajectory control | 0 (engine) | Shipped since 8 Jul 2025; API waitlist | Contact sales (secondary figures conflict) | "Commercially safe" claimed; no indemnity read → unclear | [moonvalley.com](https://www.moonvalley.com) |
| Black Forest Labs FLUX 3 Video | Big player (video lab) | Up to 20-s multi-scene clips, native audio, lip-synced dialogue in 14+ languages, on-screen type | 0 (engine) | Shipped via API by 5 Aug 2026 | $0.06–$0.53/s | Proprietary; terms unread → unclear | [The Decoder](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/) (secondary) |
| Stability AI | Big player (lab) | No 2026 video model; licensed-data audio (Stable Audio 3.0) | 0 | Video research 2025; audio shipped 20 May 2026 | Free under $1M revenue | Conditional (Community Licence) | [Stability news](http://stability.ai/news-updates); [Stability licence](https://stability.ai/license) |
| Canva (AI 2.0; Veo clips) | Big player | Conversational design agent (preview); 8-s Veo 3 clips and its own image-to-video model inside the editor | 1.5 (P1½ P2½ P3½ P4✗) | AI 2.0 research preview 16 Apr 2026; Veo clips shipped | Pro ≈ $18/mo (search summary; needs checking) | You own output per AI terms (search summary) → unclear | [FoneArena](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html) (secondary); [Fortune](https://www.fortune.com/2026/08/12/canva-startup-growth-ai-costs-revenue-forecast-by-third/) (search summary) |
| Autodesk Flow Studio | Big player | Browser VFX/CG: mocap, CG characters, camera track; new 3D Editor + node Canvas that calls Veo, Seedance and Kling | 0.5 (P3½) | 3D Editor + Canvas launched 4 Aug 2026; "agent-driven directing" only a "potential" roadmap item | Free to Pro $95/mo (secondary; needs checking) | Unclear | [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/); [usagepricing](https://www.usagepricing.com/blueprint/wonder-dynamics) (secondary) |
| Higgsfield Supercomputer / Ads Studio | Startup (aggregator, $5.4B) | One chat "plans it, picks the models, and renders it" for short formats (UGC, ads, shorts); brand kit from a URL; "Ask before generating" setting | 1.5 (P1½ P2½ P3½) | Shipped (launch date not stated) | Needs checking (secondary figures $15–$249/mo conflict) | Commercial use allowed, **but it trains on your inputs and outputs** → unsuitable for confidential client work | [Supercomputer](https://higgsfield.ai/supercomputer); [Higgsfield terms](https://higgsfield.ai/terms-of-use-agreement) |
| Midjourney | Big player (lab) | Only V1 video: 5-s image animation, extendable to about 21 s | 0 | Shipped 18 Jun 2025; no later video model | $10–$120/mo (search summary) | Terms unread → unclear; studio lawsuit in discovery | [Midjourney](https://updates.midjourney.com/introducing-our-v1-video-model/); [CourtListener](https://www.courtlistener.com/docket/70513159/disney-enterprises-inc-v-midjourney-inc/) |
| Vidu Agent (Shengshu) | Big player (lab) | "From a single sentence to a complete work"; images → 15–30-s ads and music videos | 1 (P1✓) | Shipped 19 Dec 2025; Agent 1.0 Jan 2026 | Not shown | Unclear | [vidu.com](https://www.vidu.com); [KrASIA](https://kr-asia.com/pulses/159029) (secondary) |
| Utopai Studios (Utopai X, PAI) | Startup (studio + model) | #2 on the with-audio board (no API); licenses its PAI production software; Story Agent makes 3-min sequences | 0.5 (P3½) | Utopai X 30 Sep 2026; PAI 5 Mar 2026; no titles released | Not public | Unclear | [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video); [Wikipedia](https://en.wikipedia.org/wiki/Utopai_Studios) (secondary) |
| Baidu MuseSteamer | Big player | Image-to-video up to 10 s, business only | 0 | Shipped Jul 2025 | | Unread → unclear | [AOL/Reuters](https://www.aol.com/news/baidu-launches-ai-video-generator-084131165.html) (search summary) |
| Zhipu (Z.ai) CogVideoX | Big player | CogVideoX-3 API; open CogVideoX weights | 0 | Shipped | $0.20 per video | API unread → unclear. Open weights conditional (register; ≤1M visits/month) | [Z.ai pricing](https://docs.z.ai/guides/overview/pricing); [CogVideo licence](https://github.com/zai-org/CogVideo/blob/main/MODEL_LICENSE) |
| Decart Lucy | Startup | Real-time video restyling API | 0 | Shipped | $0.01–$0.04/s | **Terms bar giving output to third parties without written consent → not allowed for client delivery** | [Decart pricing](https://docs.platform.decart.ai/getting-started/pricing); [Decart terms](https://docs.platform.decart.ai/resources/api-terms) |
| Netflix | Big player (buyer) | Gen AI in about 300 titles in 2026, incl. India's *Glory*; partner rule: generated material is temporary unless approved | n/a | Q2 2026 letter, 16 Jul 2026 | n/a | Sets rules for suppliers | [Engadget](https://engadget.com/2217157/netflix-says-it-s-already-used-ai-in-roughly-300-titles-this-year) (secondary); [TheWrap](https://www.thewrap.com/netflix-generative-ai-use-content-production-guidelines/) (secondary) |
| Getty Images / Shutterstock | Big player (data) | License training data; Getty sells an image (not video) generator; merger ended 7 Jul 2026 | n/a | Shipped (images) | | Getty image generator "commercially-safe" | [Getty 10-Q](https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm) |
| **B. Startup agents for general, creative, story, explainer and social video** | | | | | | | |
| invideo Agent Two (and Agent One) | Startup (India-founded) | Prompt or script → script, scenes, footage from 200+ models, voice, captions; nine guided workflows (casting, production design, storyboard, reframe 16:9→9:16); project memory and roles; maps a rough cut against the shot list and flags continuity errors | **2.5** (P1✓ P2½ P3½ P4½) | Shipped on paid plans; Agent Two posts 29 Jul–8 Aug 2026 | Starter $20, Plus $60, Max $150/mo; USD only, no INR | Not stated on the pricing page → unclear | [invideo Agent Intelligence](https://invideo.io/news/introducing-agent-intelligence-invideo-agent-two/); [invideo Multi-Input](https://invideo.io/news/introducing-multi-input-intelligence-invideo-agent-two/); [invideo pricing](https://invideo.io/pricing) |
| Krea Agent | Startup | Chat brief → plans the job, picks from 150+ models, makes images, video and speech, edits with FFmpeg; at "Extra High" effort checks its own output and retries; remembers preferences | **2.5** (P1✓ P2½ P3½ P4½) | **Beta**, 8 Sep 2026 | Free; Pro $35; Max $105; Business $200/mo | Pro and up: commercial licence incl. client work; Business adds indemnity. Free: inconsistent → not allowed | [Krea blog](https://www.krea.ai/blog/what-is-krea-agent); [Krea pricing](https://www.krea.ai/pricing) |
| Flova | Startup (Singapore; >$80M raised) | Brief or script (up to 300,000 characters per the release; 100,000 per listings) → storyboard, assets, revisions, rough cuts on Seedance 2.5; project memory; 100+ skills | 1.5 (P1½ P2½ P3½) | Shipped Oct 2025 (company claim) | Not stated | Unclear | [Kyodo PR Wire](https://kyodonewsprwire.jp/release/202608244599) (press release) |
| Medeo (One2X) | Startup | Chat → video with stock, AI voices, Suno/ElevenLabs music, subtitles; 16:9 and 9:16; up to 1080p | 1.5 (P1✓ P3½) | Shipped | Pro $28, Insider $76, Elite $236/mo | Not stated → unclear | [Medeo](https://www.medeo.app/); [Medeo pricing](https://www.medeo.app/pricing) |
| Mootion | Startup | Prompt, script, audio or link → story with voice, music and effects; platform ratios; 17 languages; model per scene | 1.5 (P1✓ P3½) | Shipped (paid only) | Pricing page 404; older Standard $10, Pro $40 (Apr 2025, secondary) | Unclear | [Mootion](https://www.mootion.com/) |
| Atlabs | Startup | Script to video, "AI Director", music-video agents, 100+ models, 300+ voices, lip sync, subtitles, 9:16/16:9/1:1 plus reframes, Premiere export, up to 20 min | 1.5 (P1✓ P3½) | Shipped | $39, $79, $249/mo (own pages conflict) | Not stated → unclear | [Atlabs pricing](https://www.atlabs.ai/pricing) |
| OpenArt One-Click Story / Director | Startup | Sentence, script or song → 1-min story video; Director up to 5 min (secondary) | 1.5 (P1✓ P3½) | One-Click open beta 2025; Director on paid plans | Starter $14 to Wonder $240/mo | Commercial from Plus; **Starter not allowed** | [OpenArt pricing](https://openart.ai/pricing); [OpenArt Director](https://openart.ai/suite/director) |
| Hedra Agent | Startup | Multi-step image, video and audio work; tutorial stitches clips, adds music, emails the result; claims to learn from brand guidelines | 2 (P1½ P2½ P3½ P4½) | Shipped (tutorial 22 Jul 2026) | Basic $20 to Ultra $100/mo | "Commercial use" on every paid plan | [Hedra blog](https://www.hedra.com/blog/how-to-turn-venue-photos-into-a-finished-wedding-concept-video-with-hedra-agent); [Hedra pricing](https://www.hedra.com/pricing) |
| Agent Opus (OpusClip) | Startup | Idea or audio → short social video; independent test found garbled text and voiceover errors | 2 (P1✓ P2½ P3½) | Shipped, free tier | Needs checking | Needs checking | [opus.pro/agent](https://www.opus.pro/agent); [Duke DDMC](https://sites.duke.edu/ddmc/2026/03/27/agentopus/) (secondary) |
| Manus text-to-video | Startup | Researches topic, writes script, storyboards, animates, adds voiceover | 2 (P1✓ P2½ P3½) | Shipped (early access 4 Jun 2025) | Not stated | Unclear | [manus.im](https://manus.im/tools/ai-animation-video-generator); [Bloomberg](https://www.bloomberg.com/news/articles/2025-06-04/ai-upstart-manus-starts-text-to-video-service-to-take-on-openai) (search summary) |
| Genspark Super Agent (video) | Startup | User picks a model; 3–10-s clips; compares engines | 0.5 (P1½) | Shipped | In a $20/mo workspace (secondary) | Unclear; Trustpilot 1.7 stars on billing | [eesel](https://www.eesel.ai/blog/genspark-ai-review) (search summary) |
| Pollo Agent 2.0 | Startup | Six skills: photo, URL, script, UGC and clone ads, "Story Videos" | 1.5 (P1✓ P3½) | Shipped 6 Aug 2026 (company claim) | Not stated | Unclear | [PR Newswire Asia](https://en.prnasia.com/releases/global/pollo-ai-launches-pollo-agent-2-0-for-end-to-end-publish-ready-ai-videos-and-ads-543203.shtml) (press release) |
| Glif | Startup (a16z seed) | One agent with many models; short-form and lip-sync skills | 1.5 (P1✓ P3½) | Shipped v2, Apr 2026 | Needs checking | Needs checking | [a16z](https://a16z.com/announcement/investing-in-glif/) (secondary) |
| FLORA (FAUNA agent) | Startup | Builds workflows on a visible canvas; models the user's "creative history and instincts" | 1.5 (P1½ P2½ P4½) | Beta, 31 Mar 2026 | $18, $54, $200/mo | Unclear | [ppc.land](https://ppc.land/floras-fauna-the-ai-creative-agent-that-fights-back-against-generic/) (secondary) |
| Zebracat | Startup | Prompt → edited video with voiceover, music and captions; model per scene; 2–5-min cap | 1.5 (P1✓ P3½) | Shipped | $39–$199/mo; Enterprise $599+ | "Commercial Rights" on paid plans → allowed | [Zebracat pricing](https://www.zebracat.ai/pricing) |
| Revid | Startup | Short-form from text or links; auto-publishes; "Auto-Mode workers" watch channels for ideas | 1.5 (P1✓ P3½) | Shipped | Growth $39, Ultra $199/mo | "100% content ownership", no licence terms → unclear | [Revid pricing](https://www.revid.ai/pricing) |
| Fliki | Startup | Idea, script, blog or PPT → voice-led stock explainer | 1.5 (P1✓ P3½) | Shipped | ≈ $28–$88/mo (secondary) | Commercial rights on Standard and Premium | [Fliki pricing](https://fliki.ai/pricing) |
| Pictory | Startup | Script or URL → stock-footage video up to 30 min | 1 (P1½ P3½) | Shipped | $29–$199/mo | Unclear | [Pictory pricing](https://pictory.ai/pricing) |
| Steve.ai | Startup | Text → template animation, avatars, TTS | 1 (P1½ P3½) | Shipped | Conflicting ($10–$80/mo) | Commercial and resale on Enterprise only | [Steve.ai pricing](https://app.steve.ai/pricing) |
| Vyond Go | Startup | Prompt, URL or document → animated template video | 1.5 (P1✓ P3½) | Shipped | Not read | Free plans cannot download | [vyond.com/go](https://vyond.com/go) (search summary) |
| Visla | Startup | Text, PDF or footage → editable video with storyboard | 1 (P1½ P3½) | Shipped | ≈ $9–$39/mo (secondary) | Unclear | [aiagentstore](https://aiagentstore.ai/ai-agent/visla-ai-video-agent) (search summary) |
| Vadoo | Startup | Up to 400 videos a month, ≤5 min each; method not explained | 1 (P1½ P3½) | Shipped | $15–$99/mo | Unclear | [Vadoo pricing](https://www.vadoo.tv/pricing) |
| Hypernatural | Startup | Short-form AI video; $9.2M raised; 1M+ users (2025) | 1 (P1½ P3½) | Shipped (2025 data) | Up to $48/mo (secondary) | Unclear | [Pulse 2.0](https://pulse2.com/hypernatural-9-2-million-secured-for-scaling-ai-video-creator) (search summary) |
| Wondercraft (Wonda) | Startup | Notes, PPT or podcast → business explainer | 1 (P1½ P3½) | Video beta, then possibly shipped (unclear) | From $29/mo (secondary) | Unclear | [Podnews](https://podnews.net/press-release/wonda-launched-by-wondercraft) (search summary) |
| Showrunner (Fable Studio) | Startup | Build and remix AI shows; SHOW-2 model | 1 (P1½ P3½) | Shipped consumer platform | Not stated | Unclear | [Showrunner](https://www.showrunnerstudio.com/) |
| Story.com | Startup | 60-s animated videos | 1 (P1½ P3½) | Shipped (aggregator data) | $5–$25 one-time (unverified) | Unclear | [parse.gl](https://parse.gl/brands/story-com) (search summary) |
| Katalist | Startup | Script, CSV or PPT → storyboard → video with voice, music, SFX, lip sync | 1 (P1½ P3½) | Shipped | $19–$99/mo (page inconsistent) | Unclear; still lists Sora 2 | [Katalist pricing](https://www.katalist.ai/pricing) |
| MovieFlo.AI (Mystic Moose) | Startup | Story "co-pilot": script, characters, storyboards | 0.5 (P3½) | Shipped 2025 | | Unclear | [VentureBeat](https://venturebeat.com/business/mystic-moose-unveils-movieflo-ai-to-make-user-generated-films) (search summary) |
| TapNow | Startup | Node "agentic canvas"; agent automates storyboard planning | 0.5 (P3½) | Shipped | | Unclear | [Dreamina review](https://dreamina.capcut.com/ai-video/tapnow-ai-review) (secondary, competitor, search summary) |
| Lovart | Startup | Design agent with a chat canvas; makes video | 0.5 (P3½) | Shipped (possible waitlist) | | Unclear | [framia review](https://framia.converge.ai/blog/lovart-ai-review/) (secondary, competitor, search summary) |
| Morphic | Startup | Shared canvas plus timeline over many models; you direct it | 0.5 (P3½) | Shipped 26 Jan 2026 | | Unclear | [morphic.com](https://morphic.com/es/resources/tools/best-ai-tools-for-filmmakers) (search summary) |
| Freebeat | Startup | Beat-synced music videos from a Suno link | 1.5 (P1✓ P3½) | Shipped | From $4.99/week | Unclear | [TechFinitive](https://www.techfinitive.com/product-guides/best-ai-video-generator-tools-for-music-to-video-creation-in-2026/) (search summary) |
| Neural Frames | Startup | Audio-reactive visuals from 8 stems | 0.5 (P3½) | Shipped | From €9/mo | Unclear | [TechFinitive](https://www.techfinitive.com/product-guides/best-ai-video-generator-tools-for-music-to-video-creation-in-2026/) (search summary) |
| Weavy → Figma Weave | Startup (acquired) | Node canvas over many models; bought by Figma, announced 30 Oct 2025 | 0 | Acquired | | Unclear | [TechCrunch](https://techcrunch.com/2025/10/30/figma-acquires-ai-powered-media-generation-company-weavy) (search summary) |
| Freepik Spaces | Startup | Node workflows; no video agent | 0 | Shipped 4 Nov 2025 | | Unclear | [Business Wire](https://www.businesswire.com/news/home/20251104023735/en/Freepik-Launches-Freepik-Spaces-to-Power-AI-Visual-Creation-and-Collaboration-in-Real-Time) (search summary) |
| Kaiber Superstudio | Startup | Canvas; no agent found | 0 | Shipped Oct 2024 | | Unclear | [sp-edge](https://sp-edge.com/companies/3572261) (search summary) |
| iArt.ai; Hera; Pexo | Startups | Chat agents for promos and launch videos (Product Hunt, 2026); Pexo pitched as "brand-governed" | 1 (P1½ P3½), unverified | Launched 2026 (aggregator data) | | Unclear | [hunted.space iArt](https://hunted.space/dashboard/iart-ai) (search summary); [aitoolly](https://aitoolly.com/producthunt-daily/2026-04-30) (search summary); [hunted.space Pexo](https://www.hunted.space/product/pexo) (search summary) |
| **C. Ads, e-commerce, UGC and avatar tools** | | | | | | | |
| HeyGen Video Agent (+ Product Placement) | Startup (>$200M ARR) | Prompt → script, visuals, voiceover, presenter, B-roll, motion graphics; applies brand colours and fonts; separate product-placement tool | 2 (P1✓ P2½ P3½) | Shipped (Free: limited trial) | Creator $29, Pro $49, Business $149/mo | Paid: you own output, commercial OK; **Free: non-commercial**; HeyGen takes a broad licence incl. training on uploads | [HeyGen Video Agent](https://www.heygen.com/video-agent); [HeyGen terms](https://www.heygen.com/terms) |
| Creatify (Creative Agent, AdMax) | Startup ($9M+ ARR, May 2025) | URL → script, AI actor, B-roll, captions; AdMax makes 100+ variants and tests them on Meta | 2 (P1✓ P2½ P3½; learns from ad results, not taste) | Creative Agent shipped (Pro/Max); AdMax demo-gated | Standard $12 to Business $156/mo; API $99–$299/mo | You own creatives; Creatify takes a perpetual licence over uploads; Free rights "limited" | [Creatify pricing](https://creatify.ai/pricing); [Creatify AdMax](https://creatify.ai/admax); [Creatify terms](https://creatify.ai/terms) |
| Omneky (API + MCP) | Startup | Brand URL → finished ads in 1:1, 4:5, 9:16, 16:9 incl. video, "zero prompting"; regenerates from performance and creative scoring | 2 (all ½: claimed, not shown) | **Announced** 13 Jul 2026; availability not stated | "Low hundreds per month" (search summary) | Unclear | [Omneky newsroom](https://www.omneky.com/newsroom/omneky-public-api-mcp-server-ai-advertising-everywhere) |
| Topview AI Marketer / Video Agent | Startup (Singapore) | Brief + product photo → shot plan and shots; product avatars | 1.5 (P1✓ P3½) | Shipped (video on paid plans) | $36–$56/mo (annual billing) | Commercial-licence terms not on the page → unclear; "unlimited" bans automation | [Topview pricing](https://www.topview.ai/pricing); [Promer review](https://promer.ai/blog/topview-ai-review) (secondary, competitor) |
| Zeely | Startup | Prompt → ad → launches on Facebook/Instagram with A/B tests | 1.5 (P1✓ P3½) | Shipped | $29.95–$79.95/mo plus up to 12% of ad spend | Unclear | [Zeely pricing](https://zeely.ai/pricing) |
| Pencil (Brandtech) | Startup (owned by agency group) | Strategy and ideation agents; **its own table marks video generation and cut-downs "Coming soon"** | 1 (P1½ P2½) | Shipped; video announced | Core $14, Growth $55/mo, Pro custom | Pro: IP assignment and no training; Core/Growth unclear | [Pencil pricing](https://www.trypencil.com/pricing) |
| Synthesia (Syren agent) | Startup (UK, $4B) | Avatar video for training and internal comms; Syren agent capped at 3 min | 1 (P1½ P3½) | Shipped | Starter $29, Pro $89/mo | Not on the pricing page → unclear | [Synthesia pricing](https://www.synthesia.io/pricing) |
| Mirage (Captions) | Startup | Editing app with AI actors and "AI Ads"; "agents turn direction into films" is a vision with no date | 1 (P1½ P3½) | App shipped; agent studio a vision | $24.99–$279.99/mo (iOS) | Unclear | [mirage.app](https://mirage.app/); [Captions pricing](https://www.captions.ai/pricing) |
| Arcads | Startup | 1,000+ AI actors, product-in-hand, 30+ languages; editing and "build your own agent" marked "Soon!" | 1 (P1½ P3½) | Shipped; editing announced | Pricing page 404; ≈ $110/mo (secondary) | **Personal, non-transferable licence; actor can withdraw consent and force deletion; €500,000 per breach** → high risk | [Arcads](https://www.arcads.ai/); [Arcads terms](https://www.arcads.ai/terms) |
| Akool | Startup | "Video Agent & Agentic Canvas" listed; e-commerce product ads | 1 (P1½ P3½) | Shipped (undocumented) | $12–$174/mo per seat (annual) | **"Personal" licence below the $174 Business tier → not allowed below Business** | [Akool pricing](https://akool.com/pricing) |
| AdCreative.ai (Appier) | Startup (acquired Feb 2025) | Mostly static ads; video on a higher tier | 0.5 (P1½) | Shipped | ≈ $39–$999/mo (search summary; conflicting) | Unclear | [shhots.ai](https://shhots.ai/blog/adcreative-ai-pricing/) (search summary) |
| Smartly.io AI Studio | Startup (enterprise) | Scene generation around product shots, assembly, TTS; performance data | 0.5 (P3½) | Shipped (demo-gated) | Sales only | Unclear | [Smartly AI Studio](https://smartly.io/product/ai-studio) |
| Typeface (Arc Agents) | Startup | Brand-governed content agents incl. video via Veo (search summary) | 1 (P2½ P3½) | Shipped; video evidence thin | Needs checking | Unclear | [Typeface blog](https://typeface.ai/blog/accelerating-ai-content-lifecycle-transformation-unveiling-typeface-arc-agent-strategic-acquisitions-and-multimodal-product-innovation) (search summary) |
| Vidmob360 | Startup | MCP and agents that **score** creative against brand guidelines; generates nothing | 0.5 (P4½) | Shipped 10 Jun 2026 | | n/a | [Adweek wire](https://www.adweek.com/adweek-wire/vidmob-launches-vidmob360/) (search summary) |
| Celtra; Storyteq | Startups (enterprise) | Template-driven versioning and localisation at scale | 0.5 (P3½) | Shipped | Sales only | Unclear | [Celtra](https://www.celtra.com/); [Storyteq](https://www.storyteq.com/) |
| Tavus | Startup | Real-time conversational video API; not an ad agent | 0 (a part) | Shipped | $22–$975/mo | Unclear | [Tavus pricing](https://www.tavus.io/pricing) |
| D-ID | Startup | Talking-head API | 0 (a part) | Shipped | ≈ $4.70–$108/mo (search summary) | Commercial from Pro (search summary) → unclear | [D-ID pricing](https://www.d-id.com/pricing/) |
| Colossyan | Startup | Training video with avatars | 0.5 (P3½) | Shipped | Professional $59/mo (annual) | Unclear | [Colossyan pricing](https://www.colossyan.com/pricing) |
| MakeUGC | Startup | Avatar holds or uses product; raw clips only | 0.5 (P3½) | Shipped | $49–$119/mo (search summary) | Unclear | [Fluxnote](https://fluxnote.io/guides/makeugc-ai-review) (search summary) |
| Boolv; Mintly; Lamina; AdStellar; ImagineArt; Reloop | Startups | Product image or URL → product ad video; vendor claims only | 0.5–1 | Shipped | Lamina from $19/mo | Unclear | [Lamina comparison](https://uselamina.ai/blog/best-ai-video-agents-for-ecommerce-in-2026) (secondary, vendor) |
| Icon (AI Admaker) | Startup | "AI CMO" for Meta ads | n/a | **Appears shut down** (Mar 2026) | | n/a | [Tech Startups](https://techstartups.com/2026/03/05/icon-the-ai-ad-startup-shuts-down-after-spending-12m-on-the-icon-com-domain/) (secondary) |
| Hour One | Startup (acquired) | Avatar video; folded into Wix | n/a | Acquired 23 May 2025 | | n/a | [Techleap](https://finder.techleap.nl/news/note/wix-acquires-hour-one-boosting-its-generative-ai-ambitions) (search summary) |
| **D. AI studios, agencies and 3D-first tools** | | | | | | | |
| Galleri5 / Collective Artists Network | Startup (India; studio + platform) | "AI Studio" orchestration layer (200+ models, character LoRAs, controlled shot pipelines, 3D/VFX, lip sync, QC); "Agentic Canvas" for filmmakers and brands; *Mahabharat: Ek Dharmayudh* on Star Plus and JioHotstar | n/a (studio) | Shipped (broadcast); Agentic Canvas 18 Jun 2026; *Chiranjeevi Hanuman* feature still undated | Not public | n/a | [MediaNews4U](https://www.medianews4u.com/collective-artists-network-galleri5-launch-indias-first-cinema-native-production-operating-system-at-the-india-ai-impact-summit/) (secondary, press release); [Social News XYZ](https://www.socialnews.xyz/2026/10/10/galleri5-nxtinai-ai-is-moving-to-the-big-screen/) (secondary) |
| Dashverse | Startup (Bengaluru) | Own Frameo.AI tool; 90-min AI microdrama *Raftaar* on its own DashReels app; $13M Series A | n/a (studio + app) | Shipped | App subscriptions | n/a | [afaqs](https://www.afaqs.com/news/media/dashverse-creates-indias-first-completely-ai-generated-microdrama-10065088) (secondary) |
| Intelliflicks Studios | Startup (Chandigarh) | AI feature *Maharaja in Denims*; no release found by 15 Oct 2026 | n/a | Announced (slipping) | | n/a | [Intelliflicks](https://www.intelliflicks.com); [Agerpres](https://agerpres.ro/cultura/2026/04/16/un-film-realizat-in-intregime-cu-ai-lansat-in-curand-pe-marile-ecrane-din-india--1546991) (search summary) |
| Staircase Studios AI | Startup (US) | 30+ films planned at under $500,000 each; uses real actors' performances as the base | n/a | Announced; debut still "in production" Aug 2026 | | n/a | [TheWrap](https://thewrap.com/staircase-studio-to-produce-30-ai-films) (search summary) |
| Toonstar | Startup (US) | AI animation; HarperCollins deal 3 Apr 2026; claims "80 percent faster and 90 percent cheaper" | n/a | Shipped (YouTube series) | | n/a | [Engadget](https://engadget.com/ai/ai-animation-studio-toonstar-will-turn-books-into-digital-shows-for-harpercollins-211419155.html) (secondary) |
| Secret Level; Silverside | Startups (US studios) | Made Coca-Cola's 2024–2025 AI holiday films; hybrid of live action, synthetic characters, compositing, paint and upscaling | n/a | Shipped work | Secret Level Academy from $849 | n/a | [Topaz Labs](https://www.topazlabs.com/news/branded-content-reimagined-secret-level-and-coca-colas-ai-driven-holiday-classic) (secondary, vendor case study); [silverside.ai](https://www.silverside.ai/) |
| Wonder Studios | Startup (London) | AI production company; Lewis Capaldi music video; brand and artist commissions; 12m seed led by Atomico ($ and £ mixed in the source) | n/a | Shipped work | | n/a | [IBC](https://www.ibc.org/artificial-intelligence/news/ai-production-company-wonder-studios-secures-12m-funding/22790) (secondary) |
| Promise (MUSE); Asteria (owned by Moonvalley) | Startups (US studios) | Production software and AI-film slates; no released title found | n/a | Announced | | n/a | [Tubefilter](https://www.tubefilter.com/2025/05/20/promise-generative-ai-startup-strategic-investment-partnership-google/) (search summary); [Hollywood Reporter](https://www.hollywoodreporter.com/movies/movie-news/natasha-lyonne-jaron-lanier-ai-movie-uncanny-valley-1236202957) (search summary) |
| Indian AI production partners: TopScout & Crushed; Graphixstory; Aesthetic Intelligence Lab; Spark AI (VerSe); Zocket | Startups (India) | Make AI ads beside agencies: Emami Dermicool (Kolkata), Baazar Kolkata Pujo film, Tata Gluco+, Dhathri; Zocket runs Bata's creative with agents | n/a | Shipped work | AI MD claims ₹50–60 lakh campaigns now cost ₹8–12 lakh | n/a | [Emami press release](https://www.emamigroup.com/wp-content/uploads/2025/05/08165958/press-release-070525.pdf); [Storyboard18](https://www.storyboard18.com/amp/brand-marketing/campaign-turnaround-down-70-production-costs-cut-by-85-how-indian-brands-are-letting-ai-take-over-creative-wheel-72438.htm) (secondary); [MediaNews4U](https://www.medianews4u.com/bata-india-shifts-creative-to-ai-cuts-agency-costs-by-over-1-million-a-year/) (secondary) |
| Agency networks: WPP, Publicis, Havas, Dentsu, Ogilvy India, Stagwell, Monks | Big players (agencies) | In-house AI production: WPP's London hub (23 Sep 2026); Publicis "Leona" agentic content engine; Havas Prose on Pixels (3D inputs for camera, Runway for surfaces); Dentsu AMP (India); Ogilvy India × Google AI studio; Stagwell "The Machine" | n/a | Shipped (internal) | No public rate cards | n/a | [WPP](https://www.wpp.com/en/news/2026/09/wpp-launches-flagship-production-hub-in-east-london); [Publicis](https://www.publicisgroupe.com/en/news/press-releases/deepti-velury-named-ceo-publicis-global-production-as-group-further-accelerates-on-intelligent-creativity); [Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns) |
| Intangible | Startup (tool) | "AI 3D studio": build 3D sets from references and CAD, place cameras, then "render with the latest AI models"; MCP connector in beta | 0.5 (P3½) | Shipped; customer logos self-reported | Free; Explorer $35; Business $65/mo | Terms unread → unclear | [intangible.ai](https://www.intangible.ai/); [Intangible pricing](https://www.intangible.ai/pricing) |
| Beeble | Startup (tool) | VFX passes (PBR, depth, alpha), relighting, SDR→HDR; hosts Seedance and Kling | 0 (a part) | Shipped | $16–$84/mo | "Full commercial license" on paid plans → allowed | [beeble.ai](https://beeble.ai/) |
| **E. Open source (apps, frameworks, engines)** | | | | | | | |
| ViMax (HKUDS) | Open source | Idea2Video, Script2Video, Novel2Video; VLM picks the better of two keyframes; agent loop and web UI; calls Veo, Seedance and others by paid API | **2.5** (P1✓ P2½ P3½ P4½) | Maintained (push 30 Sep 2026); paper Jun 2026 | Free code; you pay the APIs | **MIT → allowed** (engines' terms still apply) | [GitHub](https://github.com/HKUDS/ViMax); [arXiv 2606.07649](https://arxiv.org/abs/2606.07649) |
| VideoClaw (ex-FilmAgent URL) | Open source | "Chat an Idea. Get a Film." Qwen, Seedream and Wan 2.7 via API; user can step in at any point | 1.5 (P1✓ P3½) | Maintained (Aug 2026) | Free code | MIT → allowed | [GitHub](https://github.com/HITsz-TMG/VideoClaw) |
| Toonflow; Jellyfish; wind-comic | Open source | 2026 wave of short-drama and motion-comic "AI film studio" apps over closed APIs | 1 (P1½ P3½) | Created Jan–Apr 2026; maintained | Free code | MIT; Apache-2.0; MIT → allowed | [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app); [Jellyfish](https://github.com/Forget-C/Jellyfish); [wind-comic](https://github.com/ChrisChen667788/wind-comic) |
| waoowaoo | Open source (source-available) | Assistant plus canvas over OpenRouter models; no music or voiceover | 1 (P1½ P3½) | Preview release | Free code | **Elastic License 2.0: internal use OK; hosting for clients needs permission** | [GitHub](https://github.com/waooAI/waoowaoo) |
| MoneyPrinterTurbo; MoneyPrinter; ShortGPT; NarratoAI | Open source | Topic → short video from stock footage, TTS and subtitles (ShortGPT stale since Feb 2025); NarratoAI recuts with commentary | 1.5 (P1✓ P3½) | MoneyPrinterTurbo very active (131.5k stars) | Free | MIT → allowed | [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo); [ShortGPT](https://github.com/RayVentura/ShortGPT); [NarratoAI](https://github.com/linyqh/NarratoAI) |
| video-podcast-maker | Open source | Topic → 4K narrated video with Remotion; **"cost-gated AI generation"** (the only explicit preview-before-spend found in open source) | 1.5 (P1✓ P3½) | Maintained | Free | MIT → allowed | [GitHub](https://github.com/Agents365-ai/video-podcast-maker) |
| Code2Video; Paper2Video (Show Lab) | Open source | Educational and paper videos rendered from code, with a VLM critic for layout | 2 (P1✓ P3½ P4½) | Maintained | Free | MIT → allowed | [Code2Video](https://github.com/showlab/Code2Video); [Paper2Video](https://github.com/showlab/Paper2Video) |
| HeyGen HyperFrames | Open source (per HeyGen) | "Open-source framework for agentic video creation"; 21,600 stars in a month (company claim) | not scored | Released 2026 | Free | Apache 2.0 per HeyGen's press release; repo licence not checked → unclear | [HeyGen release](https://www.heygen.com/blog/heygen-surpasses-200m-arr) |
| ComfyUI | Open source | The standard node pipeline runtime; optional paid "Partner Nodes" call closed models | 0 (a runtime) | Very active (137.7k stars) | Free; partner credits extra | GPL-3.0: fine to run internally; shipping a modified copy triggers source release | [GitHub](https://github.com/Comfy-Org/ComfyUI); [Comfy docs](https://docs.comfy.org/tutorials/api-nodes/overview) |
| Pallaidium | Open source | Generative studio inside Blender's video editor; renders a 3D strip as **control video** for LTX-2.3 | 0.5 (P3½) | Maintained | Free | GPL-3.0; warns many bundled models are non-commercial | [GitHub](https://github.com/tin2tin/Pallaidium) |
| Open video engines: Meituan LongCat-Video; Sand AI MAGI-1; Genmo Mochi 1; StepFun Step-Video; Kandinsky 5; Open-Sora 2.0; Skywork SkyReels V2/V3; NVIDIA LongLive | Open source (labs) | Self-hostable video models; LongCat makes "minutes-long" 720p; MAGI streams long video; LongLive runs 240 s in real time | 0 (engines) | Weights 2025–2026 | Free | LongCat MIT → allowed. MAGI, Mochi, Open-Sora (Apache), Step-Video, Kandinsky (MIT): weight cards not re-read → likely allowed, check. **SkyReels: custom licence unread → not allowed** | [LongCat](https://huggingface.co/meituan-longcat/LongCat-Video); [MAGI-1](https://github.com/SandAI-org/MAGI-1); [Mochi](https://huggingface.co/api/models/genmo/mochi-1-preview); [Step-Video](https://github.com/stepfun-ai/Step-Video-T2V); [Kandinsky 5](https://github.com/kandinskylab/kandinsky-5); [Open-Sora](https://github.com/hpcaitech/Open-Sora); [SkyReels-V2](https://github.com/SkyworkAI/SkyReels-V2/blob/main/LICENSE.txt); [LongLive](https://github.com/NVlabs/LongLive) |
| **F. Research systems (papers)** | | | | | | | |
| VISTA (Google) | Research | Plans the video, picks the best clip by tournament, three critics (visual, audio, context), rewrites the prompt; humans preferred it 66.4% of the time | 2 (P1✓ P3½ P4½) | Paper 17 Oct 2025; CVPR 2026 | | Code not located → not allowed | [arXiv 2510.15831](https://arxiv.org/abs/2510.15831) |
| VideoGen-Agent | Research | Agent trained with RL to call generation and verification tools; humans preferred it 84.3% of the time | 2 (P1✓ P3½ P4½) | Paper 21 Sep 2026 | | Code not checked | [arXiv 2609.24997](https://arxiv.org/abs/2609.24997) |
| Better Call CineCrew | Research | FilmDSL spec of shots, camera, assets and continuity; asset packs anchor composition; critic gives structured QA and targeted repair | 2 (P1✓ P3½ P4½) | Paper 7 Sep 2026; ECCV 2026 | | Apache-2.0 code → allowed | [arXiv 2609.07720](https://arxiv.org/abs/2609.07720); [GitHub](https://github.com/Ironieser/CineCrew) |
| UniVA | Research | Plan-and-act agent over MCP tool servers; memory includes "user-specific preferences" | 2 (P1✓ P3½ P4½) | Paper 11 Nov 2025 | | Code not found → unclear | [arXiv 2511.08521](https://arxiv.org/abs/2511.08521) |
| AniMaker; Anim-Director | Research | Director, camera, reviewer and post agents; searches over candidate clips (MCTS-Gen) and scores them in context | 2 (P1✓ P3½ P4½) | Papers 2024–2025 | | **No licence → not allowed** | [arXiv 2506.10540](https://arxiv.org/abs/2506.10540); [arXiv 2408.09787](https://arxiv.org/abs/2408.09787) |
| FilmAgent | Research | Director, writer, actor and camera agents in Unity 3D spaces; 3.98/5 from humans on 15 ideas | 2 (P1✓ P3½ P4½) | Paper 22 Jan 2025 | | Repo now VideoClaw; 3D code status unclear | [arXiv 2501.12909](https://arxiv.org/abs/2501.12909) |
| Kubrick | Research | Agents write Blender Python scripts; a reviewer checks screenshots and motion coordinates | 2 (P1✓ P3½ P4½) | Paper (CVPR 2025 workshop) | | Code not located | [arXiv 2408.10453](https://arxiv.org/abs/2408.10453) |
| FilMaster | Research | Camera language from 440,000 film clips; rough and fine cut driven by simulated audience feedback | 2 (P1✓ P3½ P4½) | Paper Jun 2025; ICLR 2026 | | Code "coming soon"; all rights reserved → not allowed | [arXiv 2506.18899](https://arxiv.org/abs/2506.18899) |
| VideoGen-of-Thought | Research | One sentence → multi-shot with self-validation and identity tokens | 2 (P1✓ P3½ P4½) | Paper (v3 Oct 2025) | | BSD-3 → allowed | [arXiv 2412.02259](https://arxiv.org/abs/2412.02259) |
| Co-Director | Research | Searches creative directions; fixes identity drift; GenAD-Bench of 400 fictional-product ads | 2 (P1✓ P3½ P4½) | Paper 27 Apr 2026 | | Code not checked | [arXiv 2604.24842](https://arxiv.org/abs/2604.24842) |
| "The Script is All You Need" (Scripter/Director/Critic agents) | Research | Dialogue → cinematic script → several video models, checked by a critic and a script-alignment metric | 2 (P1✓ P3½ P4½) | Paper Jan 2026 | | Code not checked | [arXiv 2601.17737](https://arxiv.org/abs/2601.17737) |
| StoryAgent; DreamFactory; Captain Cinema; MM-StoryAgent; DramaDirector | Research | Story or plot → multi-shot video; DramaDirector retrieves depth and pose from real shots; MM-StoryAgent adds narration, SFX, music | 1–2 | Papers 2024–2026 | | MM-StoryAgent Apache-2.0; DramaDirector MIT; others code not located | [arXiv 2411.04925](https://arxiv.org/abs/2411.04925); [arXiv 2408.11788](https://arxiv.org/abs/2408.11788); [arXiv 2507.18634](https://arxiv.org/abs/2507.18634); [arXiv 2503.05242](https://arxiv.org/abs/2503.05242); [arXiv 2606.24107](https://arxiv.org/abs/2606.24107) |
| MovieAgent; Mora; MovieDreamer; HoloCine | Research | Script-to-multi-shot film agents and engines | 0.5–1 | Papers 2024–2025 | | **No licence (MovieAgent, Mora, MovieDreamer) or non-commercial (HoloCine) → not allowed** | [arXiv 2503.07314](https://arxiv.org/abs/2503.07314); [arXiv 2403.13248](https://arxiv.org/abs/2403.13248); [arXiv 2407.16655](https://arxiv.org/abs/2407.16655); [arXiv 2510.20822](https://arxiv.org/abs/2510.20822) |
| CinePreGen; patent CN 121982167 A | Research | 3D engine renders guide diffusion for previs; a Chinese patent describes a "renderer agent" that builds a rough 3D scene and conditions video generation on it | n/a | Paper Aug 2024; patent (date unknown) | | Code not located; patent not read (unverified) | [arXiv 2408.17424](https://arxiv.org/abs/2408.17424); [goveda](https://www.goveda.com/patent/CN-121982167-A) (search summary, unverified) |

**What the map shows.** About a dozen products reach 2 or 2.5 of 4, and they reach it the same way: a full ✓ on "one prompt in", and halves elsewhere. Nobody gets a ✓ on promises 2, 3 or 4. Part suppliers (voice, music, sound, lip sync, editing, judges) are in the Section 4 tables rather than repeated here.

## 2. The four promises: who is closest, and how far from "done"

| Promise | Closest today | Stage | How far from done | Key evidence |
|---|---|---|---|---|
| **P1. One prompt in** | Runway Agent; invideo Agent Two; Krea Agent; Higgsfield Supercomputer; HeyGen Video Agent; Amazon Creative Agent (Amazon ads only) | Shipped (Krea beta) | **Nearly done** for short marketing and explainer video | Runway: "develops and generates video in one conversation" ([Runway changelog](https://runway.com/changelog)) |
| **P2. Understands; asks only when needed** | invideo Agent Two (asks setup questions, reads treatments and decks); Adobe assistant ("asks you questions along the way", beta) | Shipped / beta | **Far.** Nobody documents "asks only when it truly can't decide" | Topview's agent kept planning after it failed to read the product photo ([Promer](https://promer.ai/blog/topview-ai-review), secondary, competitor) |
| **P3. Does everything** | Runway (agent plus grading, ProRes and plugins as tools); Atlabs (widest finishing list); Adobe (30+ engines plus Premiere) | Shipped / beta | **Middle.** Parts are cheap; colour, cut-downs and licensed music are missing | No agent page among the ~35 read documents colour grading (researchers' reading of vendor pages) |
| **P4. The person likes it** | Krea Agent (checks and retries at top effort; remembers preferences); invideo (flags continuity, does not fix) | Beta / shipped | **Far.** No tested self-check; no taste learning proven for video | invideo used 41 of 164 clips ([invideo FAQ](https://invideo.io/faq/why-does-invideo-agent-one-run-out-of-credits/)) |

### P1, one prompt in: effectively solved for short formats

Many products now take one brief and return a video without a timeline or node graph. Runway Agent takes a chat, a PDF brief (up to 10 MB) and a brand kit, chooses the model itself, and returns commercials, ads and product videos ([Runway Agent](https://runway.com/product/agent)) [shipped]. invideo, Krea, Higgsfield, HeyGen, Medeo, Mootion and Zebracat do the same for their formats ([invideo pricing](https://invideo.io/pricing); [Krea blog](https://www.krea.ai/blog/what-is-krea-agent); [Higgsfield Supercomputer](https://higgsfield.ai/supercomputer); [HeyGen Video Agent](https://www.heygen.com/video-agent)). The catch is cost control, not input. invideo's own FAQ says the default mode "generates without asking", and real spend can run "3-4x higher" than one take per shot ([invideo FAQ](https://invideo.io/faq/why-does-invideo-agent-one-run-out-of-credits/)). Several big tools still make you work on a canvas or timeline: Kling's Canvas is node-based ([kling.ai](https://kling.ai)), Adobe frames its assistant as "you direct, it executes" inside timeline apps ([Adobe newsroom](https://news.adobe.com/news/2026/04/adobe-new-creative-agent)), and LTX Studio makes you drive each step ([LTX pricing](https://ltx.io/studio/pricing)).

### P2, understands and asks only when needed: the least-built promise

invideo Agent Two goes furthest on paper. At setup it asks who it should be and who the filmmaker is. It extracts project rules from treatments and pre-production decks and keeps per-scene briefs ([invideo Agent Intelligence](https://invideo.io/news/introducing-agent-intelligence-invideo-agent-two/)) [shipped]. Adobe's assistant "asks you questions along the way" ([Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta)) [beta]. Higgsfield has an "Ask before generating" switch ([Higgsfield Supercomputer](https://higgsfield.ai/supercomputer)). None of them says it asks *only* when it cannot decide. The failures point the other way. Topview's agent planned from text alone after failing to read the product photo, and did not say so ([Promer](https://promer.ai/blog/topview-ai-review), secondary, competitor). A competitor's review says Creatify's URL extraction can "invent claims" ([Zeely blog](https://zeely.ai/blog/creatify-ai-review/), search summary, competitor). In the 25+ agent papers the researchers read, asking only when needed is essentially absent; the nearest is ViMax's interactive loop for revising plans ([ViMax](https://github.com/HKUDS/ViMax)). Language is a second gap for Kolkata: Veo says "English is fully supported; other languages are untested" ([Veo docs](https://ai.google.dev/gemini-api/docs/veo)), and LTX Studio turns a script in any language into English output ([ltx.studio](https://ltx.studio/platform/script-to-video), search summary).

### P3, does everything: the pieces exist, the finishing does not

Runway comes closest. Its agent picks models, writes and swaps voiceover, edits on request, resizes for platforms and localises ([Runway Agent](https://runway.com/product/agent)). Around it sit a timeline, an HDR grading model (Ruby, 20 Aug 2026), ProRes export and Premiere and DaVinci Resolve plugins ([Runway changelog](https://runway.com/changelog)). Atlabs lists the widest finishing set: 9:16, 16:9 and 1:1 plus reframes, 300+ voices, lip sync, subtitles and Premiere export ([Atlabs pricing](https://www.atlabs.ai/pricing)). Adobe has the broadest engine list (Veo 3.1, Kling 3.0, Runway Gen-4.5, Luma Ray3.14 and others) plus Premiere's edit, audio and colour tools, and "Quick Cut" assembles a first cut ([Adobe blog](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work)) [beta]. Three things are missing everywhere. No agent documents colour grading as a step. No one makes long and short cuts automatically from one brief; Pencil lists "AI video cutdowns" as "Coming soon" ([Pencil pricing](https://www.trypencil.com/pricing)). And licensed music for film and TV is a legal problem, not a quality one (Section 4).

### P4, the person likes the result: research only, and expensive

Only Krea documents a check-and-retry loop: "Extra High is for a full campaign where you want the agent to check its own output and retry", and the agent can "remember your preferences across sessions" ([Krea blog](https://www.krea.ai/blog/what-is-krea-agent)) [beta]. invideo "flags what a continuity supervisor would catch", such as a flag pole that changes between shots, but describes flagging, not fixing ([invideo Multi-Input](https://invideo.io/news/introducing-multi-input-intelligence-invideo-agent-two/)). Adobe's preference learning is described as forward-looking ([Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta)). Research loops work but cost a lot. Google's VISTA used about 28 generated videos and 0.7M judge tokens per round, over five rounds, to win 66.4% of human comparisons (5 raters, 50 prompts) ([VISTA paper](https://arxiv.org/html/2510.15831)) [paper]. Half or more of its later comparisons were ties, so many retries bought little. Personal-taste learning has only been shown for still images: users picked their personalised image 86.1% of the time against generic ones, but only 65.4% against other people's personalised ones, in a 20-person study ([ViPer](https://arxiv.org/html/2407.17365v1)) [paper]. I found no human-validated study for video. On this evidence, a person approving a cheap preview is the most reliable taste judge available, which is what your design already does.

## 3. The big players, one by one

**Bottom line.** Google and Adobe are the most likely to ship your whole idea. Runway already ships the ad version. Amazon, Meta and Google Ads give whole-ad agents away free inside their own ad systems. OpenAI has left video. Apple, Microsoft and NVIDIA are not building it. Chinese labs lead raw quality and sell engines, not film agents.

### Google and DeepMind: every piece in-house, not yet joined
Flow Agent plans tasks, makes variations and batch-edits for all Flow users (19 May 2026) ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)) [shipped]. Gemini Omni edits video by conversation; Omni 1.1 Flash extends clips to 40 s and drafts at 360p for about a third of the cost ([Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/)). Vids outputs all three sizes with script, avatars, voice and music ([Google Workspace](https://workspace.google.com/products/vids/)). VISTA, a self-critiquing agent, is research ([arXiv](https://arxiv.org/abs/2510.15831)) [paper]. Nothing joins them yet, and no clarifying questions, self-checks or taste learning are announced. **Threat: highest.**

### OpenAI: out of video
The Sora 2 API closed on 24 Sep 2026 with "no one-to-one replacement" ([OpenAI](https://developers.openai.com/api/docs/models/sora-2)). Disney's $1B deal fell away with it ([Engadget](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html), secondary). Some tools still list Sora 2 ([Katalist pricing](https://www.katalist.ai/pricing)). **Lesson: an engine can vanish in six months.**

### Meta: whole-ad automation, for Meta ads
Video from static ads is shipped. Ads Creative Studio edits hooks, audio, length and endings; catalog video is in beta; a campaign-building assistant is in test and still needs "explicit approval before anything is published" ([Meta newsroom](https://about.fb.com/ltam/news/2026/10/advertising-week-new-york-2026-nuevas-capacidades-de-ia-para-guiar-campanas-y-llegar-a-los-clientes/)). The WSJ reported a goal of fully automated ad creation by the end of 2026 ([Campaign Asia](https://campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831), search summary). Movie Gen stayed a paper; Muse Video is "in development" ([Meta newsroom](https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/)). **Threat: high for Meta ads, low for brand films.**

### Adobe: the closest big-company match to your behaviour
Firefly AI Assistant asks questions, claims to learn preferences, and routes across 30+ models including Veo, Kling, Runway and Luma ([Adobe newsroom](https://news.adobe.com/news/2026/04/adobe-new-creative-agent)) [beta]. June added Quick Cut, storyboard-to-video and product video ([Adobe blog](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work)). The creator still provides "the vision, judgment, and creative direction". Indemnity is enterprise-only and may exclude beta features and partner models ([Adobe Community](https://community.adobe.com/questions-404/using-firefly-ai-assistant-beta-for-final-production-and-i-indemnification-1640494), secondary, unverified). **Watch Adobe MAX, 10–12 Nov 2026** ([Adobe MAX](https://www.adobe.com/es/max.html), search summary).

### Apple: no generator
Final Cut Pro added captions, masks, edit detection and colour match, but no generative video ([Apple](https://support.apple.com/en-us/102825)). WWDC 2026 upgraded still images only ([Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-intelligence-brings-powerful-ai-capabilities-into-everyday-experiences/), search summary). **0 of 4.**

### Amazon: a complete agent, for Amazon ads only
Creative Agent goes from chat to storyboard to video ads with music and voice, at no extra cost; it launched in the UK on 12 Feb 2026 ([ChannelX](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/), secondary; [Amazon Ads](https://advertising.amazon.com/library/news/unboxed-toronto-2026)). The simpler Video Generator is in open beta in India and the UK ([Amazon Ads](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns)). AWS Nova Reel makes silent 720p video, and a wind-down is reported ([Mezha](https://mezha.ua/en/news/amazon-shuts-down-nova-313675/amp/), search summary, unverified).

### Microsoft: stock-footage drafts
Clipchamp's Copilot drafts videos from stock footage, voice and music ([heise](https://www.heise.de/en/news/Copilot-gets-Clipchamp-support-for-automatic-video-creation-10255460.html), secondary). Microsoft has no video model of its own ([microsoft.ai](https://microsoft.ai/news/)), and its Sora-based Bing tool lost its engine. **Weak on all four.**

### ByteDance: top engine, legal clouds, an app banned in India
Seedance 2.5 makes 30-s clips with audio from up to 50 references ([TechNode](https://technode.com/2026/07/31/bytedance-launches-seedance-2-5-video-generation-model/), secondary). Pippit is a marketing-video agent ([Pippit](https://www.pippit.ai)). Seedance 2.0 drew studio cease-and-desist letters in Feb 2026 ([Wikipedia: Seedance 2.0](https://en.wikipedia.org/wiki/Seedance_2.0), secondary). **CapCut has been banned in India since 2020** ([Wikipedia: CapCut](https://en.wikipedia.org/wiki/CapCut), secondary), so reach Seedance through Runway, Luma, Krea or Pika.

### Kuaishou (Kling): the Chinese company most clearly building agents
Kling earned over RMB 850M in Q2 2026 and launched MCP and CLI tools so outside agents can drive it ([Kuaishou results](https://www.webull.com/news/15428603170825216)). Its own agent sits on a node canvas ([kling.ai](https://kling.ai)). Kling 4.0 (30 s, 4K) reached top subscribers on 28 Sep 2026 ([AI Weekly](https://aiweekly.co/alerts/kuaishous-kling-ships-kling-40-flash-to-annual-subscribers-30-second-4khdr-ai), secondary).

### Alibaba (Wan): best quality per dollar, cleanest open licence
Wan 3.0 is #1 on the with-audio board ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)) at roughly $0.05–$0.28 per second ([DataNorth](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model), secondary). Wan 2.2's weights are Apache-2.0, fine for India and the UK ([Hugging Face](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B)). No agent found.

### Tencent (Hunyuan): not for UK work
The licence excludes "the European Union, United Kingdom and South Korea" ([LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE)), and so do the Foley and Avatar models ([Foley LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-Foley/main/LICENSE)). No agent found.

### MiniMax (Hailuo): engine, voice and music, plus a lawsuit
H3 is #4 on the board; its weights list the UK as an "excluded territory" ([Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-H3)). MiniMax owns speech and music models and a template-style "Hailuo Agent" ([hailuoai.video](https://hailuoai.video)). The Disney, Universal and WBD suit against it survived dismissal in May 2026 ([Bloomberg Law](https://news.bloomberglaw.com/ip-law/disneys-copyright-suit-against-chinese-ai-developer-advances), search summary).

### xAI: a cheap engine, no agent
Grok Imagine costs $0.02–$0.08 per second ([xAI docs](https://docs.x.ai/docs/models)). Grok's chat uses Runway as its video layer ([Runway changelog](https://runway.com/changelog)).

### Runway: already ships the ad version of your idea
Since 13 May 2026 its Agent has added campaigns, Skills, Workflows, a timeline, Brand Kits, PDF briefs and a 480p draft mode ([Runway changelog](https://runway.com/changelog)) [shipped]. Model Routers pick engines, and one API resells most of the leaders ([Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)). It raised $315M at about $5.3B in Feb 2026 ([Bloomberg](https://bloomberg.com/news/articles/2026-02-10/ai-video-startup-runway-valued-at-5-3-billion-with-new-funding), search summary). It claims no narrative storyboards, clarifying questions or self-review. **You could build on its MCP instead of fighting it.**

### Luma: agents for agencies, with a London office
Luma Agents made Mazda's first AI-produced commercial; Luma raised $900M (Nov 2025) and opened in London under a former WPP executive ([Luma news](https://lumalabs.ai/news)). Ray3.2 outputs 16-bit HDR EXR for compositing ([Luma Ray](https://lumalabs.ai/ray)).

### Pika: an aggregator studio
Relaunched on 17 Sep 2026 with its own speech, music, SFX and colour apps over third-party video models ([pika.art](https://pika.art)). No agent.

### Lightricks (LTX): storyboard-first, with a licence trap
LTX Studio storyboards a script, but you drive each step ([LTX pricing](https://ltx.io/studio/pricing)). LTX-2 weights are free only under $10M revenue and bar products that "directly compete" with Lightricks ([LTX-2 licence](https://static.lightricks.com/legal/ltx-2-open-weights-license-0.X.pdf)). **Ask in writing before building an agent on them.**

### Moonvalley: licensed data and director controls
Marey is "trained on licensed data" and offers pose, trajectory and one-image camera moves; no prices, audio or agent ([moonvalley.com](https://www.moonvalley.com)).

### Black Forest Labs: a strong proprietary engine
FLUX 3 Video makes 20-s multi-scene clips with dialogue in 14+ languages and on-screen type, for $0.06–$0.53 per second ([The Decoder](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/), secondary). No agent.

### Stability AI: audio, not video
No 2026 video model; the focus is licensed-data Stable Audio 3.0 ([Stability news](http://stability.ai/news-updates)), free under $1M revenue ([Stability licence](https://stability.ai/license)).

### NVIDIA: parts for your skeleton, not a rival
Cosmos-Transfer2.5 turns 3D renders into realistic video under depth and edge control, with a commercially usable open licence ([GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5)). GEN3C research gives precise camera paths ([NVIDIA Research](https://research.nvidia.com/labs/toronto-ai/GEN3C/)) [paper].

### Autodesk (Flow Studio): 3D first, generate last, on a canvas
The 3D Editor + Canvas (4 Aug 2026) blocks scenes and cameras in 3D, then generates with Veo, Seedance or Kling. "Agent-driven directing" is only a "potential" future step ([Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/)). **The closest big-vendor product to your skeleton, without the checker.**

### Canva: rationing video
Canva AI 2.0 is a design agent in preview; video means 8-s Veo clips, five a month at launch ([FoneArena](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html), secondary). Canva cut its growth forecast after AI serving costs ran high ([Fortune](https://www.fortune.com/2026/08/12/canva-startup-growth-ai-costs-revenue-forecast-by-third/), search summary).

### Higgsfield: the fastest-growing aggregator, with trust problems
Supercomputer "plans it, picks the models, and renders it" for short formats ([Higgsfield](https://higgsfield.ai/supercomputer)). It reports a $700M run rate at a $5.4B valuation ([Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/08/17/higgsfield039s-valuation-soars-fourfold-to-54-billion-in-six-months-on-ai-content-demand), secondary). Its terms let it train on your inputs and outputs ([Higgsfield terms](https://higgsfield.ai/terms-of-use-agreement)), and early 2026 brought billing and marketing complaints ([Times of Central Asia](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/), secondary).

### Players the brief did not name
- **Midjourney:** only 2025 image animation, about 21 s at most ([Midjourney](https://updates.midjourney.com/introducing-our-v1-video-model/)). Its "Thinking Mode" re-checks and regenerates *images*, a shipped promise-4-style loop ([Midjourney changelog](https://updates.midjourney.com/alpha-changelog-10-7-26/)). Studio lawsuit hearing on 23 Nov 2026 ([CourtListener](https://www.courtlistener.com/docket/70513159/disney-enterprises-inc-v-midjourney-inc/)).
- **Vidu (Shengshu):** claims an agent "from a single sentence to a complete work" ([vidu.com](https://www.vidu.com)).
- **HeyGen and Synthesia:** the biggest earners (HeyGen >$200M ARR; Synthesia valued at $4B) ([HeyGen](https://www.heygen.com/blog/heygen-surpasses-200m-arr); [Synthesia](https://www.synthesia.io/post/series-e-200-million-4-billion-valuation-future-work)), selling presenter video for training and comms, not films.
- **Utopai Studios:** the #2 model on the board, no public API, no released titles ([Wikipedia](https://en.wikipedia.org/wiki/Utopai_Studios), secondary).
- **Smaller Chinese and open labs** ship engines, not agents (Section 4).
- **Netflix** used gen AI in about 300 titles in 2026, including India's *Glory* ([Engadget](https://engadget.com/2217157/netflix-says-it-s-already-used-ai-in-roughly-300-titles-this-year), secondary), and keeps generated material out of final deliverables unless approved ([TheWrap](https://www.thewrap.com/netflix-generative-ai-use-content-production-guidelines/), secondary).

## 4. The pieces, one table each

**Short version.** Buy: language models, English voice, captions, reframing, sound effects, lip sync for simple shots. Build: the planner's structure, the checker, the assembly and versioning, and a rights and provenance log. Avoid or gate: consumer music generators for film and TV, non-commercial or territory-limited open models, CapCut assets.

### 4.1 Planning: buy the language model, build the structure

Frontier language models are cheap. Papers still find that "direct end-to-end generation approaches often fail to produce well-crafted screenplays"; a two-step method (outline, then prose, then screenplay) won 75% of blind comparisons against Gemini 2.5 Pro with professional screenwriters ([arXiv 2510.23163](https://arxiv.org/abs/2510.23163)) [paper]. No benchmark scores shot lists.

| Option | What it does | Evidence of quality | Price (as read) | Commercial use | Source |
|---|---|---|---|---|---|
| Claude Opus 5.5 / Sonnet 5.5 | General planner, script, shot list, prompts | No screenwriting benchmark for these versions | $4/$20 and $2/$10 per million tokens in/out | API terms not re-read | [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| OpenAI GPT-6 Astra | Same | None found | $10/$50 per million tokens | Not re-read | [OpenAI models](https://developers.openai.com/api/docs/models) |
| Google Gemini 4 Argon | Same | None found | $2/$10 until 30 Nov 2026, then $4/$20 | Not re-read | [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| LTX Studio | Script → scenes → storyboard; pitch decks | No independent test | $15–$125/mo (stale promos; needs checking) | Free: personal only; commercial from Standard | [LTX pricing](https://ltx.io/studio/pricing) |
| Boords | Storyboards and scripts; "Boords Agent"; MCP server | No independent test | $39–$250/mo | Not stated → unclear | [Boords pricing](https://boords.com/pricing) |
| StoryboardHero | Concept → script with camera notes → storyboard; human sketch option | No independent test | $19–$199/mo | "Commercial use" on every plan | [StoryboardHero pricing](https://storyboardhero.ai/pricing) |
| Previs Pro | 3D previs on Apple devices: sets, cameras, lights, animatics | User reviews only | $119.99/yr; lifetime $359.99 | Not read | [Previs Pro pricing](https://previspro.com/pricing) |
| Storyboarder (Wonder Unit) | Free drawing storyboarder with shot metadata | — | Free | "Free and open source"; licence not verified | [Wonder Unit](https://wonderunit.com/storyboarder/) |

### 4.2 Shot generation: a crowded, fast-moving top tier

The independent Artificial Analysis board (blind votes, with audio) has the top six within about 30 Elo, with overlapping confidence ranges ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)). A second board, arena.ai, reportedly puts Google's Gemini Omni 1.1 Flash first (snapshot 21 Sep 2026) ([arena.ai](https://arena.ai/leaderboard/video/text-to-video), search summary, unverified; the page returned 403). **The two boards disagree on #1.** Kling 4.0 is on neither.

| Model (maker) | Elo (AA, with audio) | Longest single clip | Price per second (as read) | Commercial use (India / UK) | Source |
|---|---|---|---|---|---|
| Wan 3.0 (Alibaba) | 1174 (#1) | 30 s, 1080p | ≈ $0.20 (AA); $0.05–$0.28 (secondary) | API terms unread → unclear | [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video); [DataNorth](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model) (secondary) |
| Utopai X (Utopai Studios) | 1169 | Not stated | No API | n/a | [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video) |
| Seedance 2.5 (ByteDance) | 1160 | 4–30 s | fal ≈ $0.47 at 720p; Runway $0.20–$0.68 | BytePlus terms unread → unclear | [fal](https://fal.ai/learn/tools/what-is-seedance-2-5) (secondary); [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/) |
| MiniMax H3 (open weights) | 1159 | 4–15 s; 768p open, 2K hosted | ≈ $0.08 (AA) | **UK an "excluded territory" for the weights**; India conditional | [Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-H3) |
| FLUX 3 Video (BFL) | 1147 | 20 s | $0.06–$0.53 | Proprietary; unclear | [The Decoder](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/) (secondary) |
| Gemini Omni 1.1 Flash (Google) | 1132 | Extends to 40 s | ≈ $0.10 at 720p | Conditional; **no editing of uploaded video in the UK/EEA** | [Omni docs](https://ai.google.dev/gemini-api/docs/omni); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| Grok Imagine Video 1.5 (xAI) | 1061 | 1–15 s (secondary) | $0.08 | Unclear | [xAI docs](https://docs.x.ai/docs/models) |
| Kling 3.0 / 3.0 Omni (Kuaishou) | 1000 / 1019 | 3–15 s | $0.12–$0.43 via Runway | Unclear | [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/) |
| Veo 3.1 / Fast / Lite (Google) | 967 / 965 | **4, 6 or 8 s only**; extend to 148 s at 720p | $0.40 / $0.10–$0.12 / $0.05–$0.08 | Conditional; UK person generation adults only | [Veo docs](https://ai.google.dev/gemini-api/docs/veo); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| LTX-2.5 (open weights) | 949 | Not stated | ≈ $0.13–$0.17 (AA) | Free under $10M revenue | [LTX-2 licence](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x) |
| Runway Gen-4.5 / Aleph 2 | Not in top 20 | Gen-4.5 2–10 s | $0.12 / $0.28 (video-to-video) | Unclear | [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/) |
| Luma Ray3.2 | Not in top 20 | 5 or 10 s; no audio on text-to-video | Credits | Unclear | [Luma Ray](https://lumalabs.ai/ray) |
| Wan 2.2; LongCat-Video (open) | Not on board | 5 s; "minutes-long" 720p | Self-host | **Apache-2.0; MIT → allowed in India and UK** | [Wan2.2](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B); [LongCat](https://huggingface.co/meituan-longcat/LongCat-Video) |

### 4.3 Control and consistency: references are growing fast; exactness is not measured

Reference inputs grew from 3 images (Veo 3.1, Oct 2025) to a reported 50 files (Seedance 2.5, Jul 2026) ([Veo docs](https://ai.google.dev/gemini-api/docs/veo); [fal](https://fal.ai/learn/tools/what-is-seedance-2-5), secondary). Dense structure control (depth, edges, masks, pose) lives mainly in open or lower-ranked models. **No vendor publishes a measured rate for keeping a product, logo or text exact.** A May 2025 benchmark found "most struggle to generate legible, consistent text" across ten systems ([T2VTextBench](https://arxiv.org/abs/2505.04946)) [paper; predates current models].

| Tool | Control offered | Exact product / logo / text? | Commercial use | Source |
|---|---|---|---|---|
| Seedance 2.5 | Up to 50 references; timestamp edits; but timed shot lists give "proportion of screen time, not exact frames" | No claim | Unclear | [fal](https://fal.ai/learn/tools/what-is-seedance-2-5) (secondary) |
| Gemini Omni 1.1 Flash | Several image refs plus 3 short video refs; edit by instruction, incl. "change on-screen text"; **no camera parameter** | Says text renders "readably" (no metric) | Conditional; UK cannot edit uploaded video | [Omni docs](https://ai.google.dev/gemini-api/docs/omni) |
| Runway (Characters, Brand Kits, `product_ad`, `product_swap`, `product_ugc`, Aleph 2) | References, product recipes, video-to-video restyle, compositing nodes, segmentation | No exactness claim found | Unclear | [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/); [Runway changelog](https://runway.com/changelog) |
| Luma Ray3.2 Modify | Video-to-video with strict pose tracking or loose blocking; 16 keyframes; EXR out | No claim | Unclear | [Luma Ray](https://lumalabs.ai/ray) |
| Wan 2.1 VACE (open) | Control videos incl. depth, masks, references | No claim | Apache-2.0 → allowed | [VACE](https://github.com/ali-vilab/VACE) |
| NVIDIA Cosmos-Transfer2.5 (open) | Depth, segmentation, edge, blur control; "sim-to-real" | No claim | NVIDIA Open Model License → conditional | [GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5) |
| Moonvalley Marey | Pose, trajectory, camera from one image | No claim | Unclear | [Marey](https://www.moonvalley.com/marey) |
| HeyGen Product Placement | Product photo + face → avatar holding product | Independent test: label text "distorted and illegible" | Paid plans commercial | [HeyGen tool](https://www.heygen.com/en-gb/tool/ai-product-placement); [ProVideo Coalition](https://www.provideocoalition.com/ai-tools-heygen-avatar-iv-gets-real/) (secondary) |
| Research camera control (CameraCtrl, Uni3C, GEN3C, ReCamMaster, Diffusion as Shader) | Numeric camera paths from poses, point clouds or 3D tracks | Measured camera error, in papers | Mostly paper-only | [CameraCtrl](https://arxiv.org/abs/2404.02101); [Uni3C](https://arxiv.org/abs/2504.14899); [Diffusion as Shader](https://arxiv.org/abs/2501.03847) |

**The trade-off that matters for you:** the models that win human votes (Wan 3.0, Seedance 2.5, Gemini Omni, H3) expose references, keyframes and video-to-video, but no documented depth or edge inputs. The models with dense control rank lower: LTX-2.5 scores 949 against Wan 3.0's 1174 ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)). Expect to feed rendered skeleton video into a closed video-to-video model at strong adherence, with open control models as a fallback where licences allow.

### 4.4 3D or code previs as the base: established in research, early in creative products

| Who | What it does | Stage | Commercial use | Source |
|---|---|---|---|---|
| Intangible | Build 3D sets from references and CAD; place cameras; "render with the latest AI models" | Shipped | Unclear | [intangible.ai](https://www.intangible.ai/) |
| Autodesk Flow Studio 3D Editor + Canvas | Block scenes and cameras in 3D; node canvas generates with Veo, Seedance, Kling | Launched 4 Aug 2026 | Unclear | [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/) |
| NVIDIA Cosmos-Transfer2.5 | Synthetic 3D renders → realistic video under depth/segmentation/edge control (robots, cars) | Shipped open model | Conditional | [GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5) |
| NVIDIA 3D-guided blueprint | Blender viewport → depth map → FLUX image; **images only** | Shipped sample | **"Non-commercial use"** → not allowed | [GitHub](https://github.com/NVIDIA-AI-Blueprints/3d-guided-genai-rtx) |
| Pallaidium | Blender's video editor renders a 3D strip as control video for LTX-2.3 | Maintained | GPL-3.0; many bundled models non-commercial | [GitHub](https://github.com/tin2tin/Pallaidium) |
| Havas (Prose on Pixels) | "3D inputs for camera control" with Runway handling textures and lighting | In use (vendor case study) | n/a | [Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns) |
| Unilever | 3D twin of every pack; imagery "two times faster and at 50% of the previous cost" | In use (company claim; mostly stills) | n/a | [Unilever](https://www.unilever.com/news/news-search/2025/unilever-reinvents-product-shoots-with-ai-for-faster-content-creation/) (search summary) |
| DiffusionRenderer; I2V3D; GEN3C; Uni3C; Diffusion as Shader; ReCamMaster | G-buffers, coarse renders, point clouds or 3D tracks → video | Papers (2025) | Mostly unreleased or unchecked | [DiffusionRenderer](https://arxiv.org/abs/2501.18590); [I2V3D](https://arxiv.org/abs/2503.09733); [ReCamMaster](https://arxiv.org/abs/2503.11647) |
| Beeble; Luma EXR; Runway Compositing Nodes | VFX passes, relighting, HDR/ACES output for compositing back | Shipped | Beeble paid plans commercial; others unclear | [beeble.ai](https://beeble.ai/); [Luma Ray](https://lumalabs.ai/ray); [Runway changelog](https://runway.com/changelog) |

### 4.5 Voice: English is solved; Bengali is untested

English text-to-speech is cheap and good. Bengali and Hindi are listed by several vendors, but **the only head-to-head Indian-language study is vendor-commissioned** (Sarvam with Josh Talks: ElevenLabs v3 led on full-band quality; Sarvam's Bulbul v3 beat Cartesia Sonic-3) ([Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3)). Run your own blind test with Kolkata speakers. Every major vendor requires explicit consent to clone a voice ([ElevenLabs use policy](https://elevenlabs.io/use-policy)).

| Option | Quality evidence (AA blind arena, English) | Bengali / Hindi | Price (as read) | Commercial use | Source |
|---|---|---|---|---|---|
| ElevenLabs Eleven v4 / v4 Turbo | #1 and #2 (Elo 1327) | Both listed | $0.08 / $0.04 per 1,000 characters | Paid use; consent and watermark rules | [AA TTS](https://artificialanalysis.ai/text-to-speech/leaderboard); [ElevenLabs pricing](https://elevenlabs.io/pricing/api); [ElevenLabs models](https://elevenlabs.io/docs/overview/models) |
| Cartesia Sonic 3.6 | 1284 (#4) | Both listed | $5–$299/mo | Commercial on paid plans | [Cartesia pricing](https://cartesia.ai/pricing); [Cartesia languages](https://cartesia.ai/languages) |
| Google Gemini 3.8 Flash TTS | 1272 (#5) | Hindi and "Bangla" listed | ≈ $0.00225 per 10 s until 31 Dec 2026, then doubles | Voice-replication terms unread → unclear | [Gemini TTS docs](https://ai.google.dev/gemini-api/docs/speech-generation) |
| Sarvam Bulbul v3 / v4-flash | Not on AA; vendor-commissioned study only | 10 Indian languages incl. both | ≈ ₹30 per 10,000 characters (search summary) | Terms not on docs page → unclear | [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/models/bulbul) |
| Azure Speech | Not in AA top 15 | Bengali (India): only 2 standard voices | Did not render | Personal voice restricted | [Azure languages](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) |
| AI4Bharat IndicF5; Indic Parler-TTS (open) | No independent score | Both | Self-host | **MIT; Apache-2.0 → allowed** | [IndicF5](https://huggingface.co/api/models/ai4bharat/IndicF5); [Indic Parler-TTS](https://huggingface.co/api/models/ai4bharat/indic-parler-tts) |
| Chatterbox Multilingual (open) | Vendor claim only | Hindi, no Bengali | Self-host | MIT → allowed | [Chatterbox](https://huggingface.co/ResembleAI/chatterbox) |
| Fish Audio S2 Pro (open) | Open-weights board 1116 | Both | Self-host | **Non-commercial → not allowed** | [S2 Pro](https://huggingface.co/fishaudio/s2-pro) |

### 4.6 Music: quality is high; the law is the blocker

Suno v6 leads the independent music arenas (vocals 1146, instrumental 1148) ([AA vocals](https://artificialanalysis.ai/music/leaderboard/vocals)). But Suno gives no warranty that use "will not infringe", makes the user indemnify Suno ([Suno terms](https://suno.com/terms)), and UMG and Sony filed a second suit against it on 18 Sep 2026 ([EDM.com](https://edm.com/industry/universal-sony-file-another-copyright-lawsuit-against-suno/), search summary). ElevenLabs Music excludes "film, TV, radio" below its Enterprise Music tier ([ElevenLabs music terms](https://elevenlabs.io/music-terms)).

| Option | Quality (AA) | Price (as read) | Commercial use for client film work | Source |
|---|---|---|---|---|
| Suno v6 | #1 vocals and instrumental | Pro $8, Premier $24/mo (download caps) | Paid tiers allow it, but no non-infringement warranty and an active label suit → **high risk** | [Suno pricing](https://suno.com/pricing); [Suno terms](https://suno.com/terms) |
| Udio | Not on top 10 | Could not read | Reported as a "walled garden" with no external download (secondary) → **treat as not usable** | [dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026) (search summary) |
| Google Lyria 3.5 / 3 Pro | ≈ 1050 | $0.08 per song | SynthID watermark; commercial terms not on docs page → unclear | [Lyria docs](https://ai.google.dev/gemini-api/docs/music-generation) |
| ElevenLabs Music v2.5 | 1012 | $0.15 per minute | **Film, TV and radio excluded below Enterprise Music** | [ElevenLabs music terms](https://elevenlabs.io/music-terms) |
| Stable Audio 3 (Stability) | 1014 (instrumental) | Self-host or API | Free under $1M revenue; licensed training data claimed | [Stability licence](https://stability.ai/license) |
| ACE-Step 1.5 (open) | Not on top 10 | Self-host | MIT; claims partly licensed training data (vendor claim) → allowed, check provenance | [Hugging Face](https://huggingface.co/ACE-Step/Ace-Step1.5) |
| Meta MusicGen (open) | Old | Self-host | **CC-BY-NC → not allowed** | [Hugging Face](https://huggingface.co/api/models/facebook/musicgen-large) |

### 4.7 Sound effects: cheap for ambience, weak for frame-synced foley

| Option | What it does | Price | Commercial use | Source |
|---|---|---|---|---|
| ElevenLabs Sound Effects | Text → SFX, 0.1–30 s, looping ambience | $0.12/min (page also says per generation) | "Royalty-free" per pricing page | [ElevenLabs SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) |
| Veo 3.1 native audio | Sound inside each generated clip | In the per-second video price | Conditional | [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| Adobe Premiere (Firefly) | Generative Extend adds ambient sound; timeline SFX generation | Premiere $22.99/mo (first year) | Not re-read | [Adobe Premiere](https://www.adobe.com/products/premiere.html) |
| MMAudio (open) | Video-to-foley | Self-host | **Non-commercial → not allowed** | [Hugging Face](https://huggingface.co/hkchengrex/MMAudio) |
| HunyuanVideo-Foley (open) | Video-to-foley | Self-host | **UK excluded → not allowed for UK** | [Licence](https://huggingface.co/tencent/HunyuanVideo-Foley/blob/main/LICENSE) |
| ThinkSound (open) | Video-to-audio | Self-host | Apache-2.0 → allowed; quality unchecked | [Hugging Face](https://huggingface.co/api/models/FunAudioLLM/ThinkSound) |

### 4.8 Lip sync: mature for one front-facing speaker

The market leader's own docs list where it fails: profiles, occlusion, several speakers, small faces, long multi-cut clips ([sync. docs](https://sync.so/docs/models/lipsync)). No independent lip-sync benchmark exists.

| Option | Price (as read) | Limits | Commercial use | Source |
|---|---|---|---|---|
| sync. lipsync-2-pro / sync-3 | $0.067–$0.083/s; $0.107–$0.133/s (4K, handles occlusion) | 2-pro works on a 512×512 face | Terms unread → unclear | [sync. docs](https://sync.so/docs/models/lipsync) |
| HeyGen (Avatar IV, translation in 175+ languages) | Creator $29 to Business $149/mo | — | Paid plans commercial | [HeyGen pricing](https://www.heygen.com/pricing) |
| Hedra | $20–$100/mo | Model and length not stated | "Commercial use" on paid plans | [Hedra pricing](https://www.hedra.com/pricing) |
| ByteDance OmniHuman 2.0 | $0.07–$0.12/s | 720p native | Terms via sales → unclear | [BytePlus](https://www.byteplus.com/en/product/omnihuman) |
| LatentSync 1.6; MuseTalk; InfiniteTalk / Wan2.2-S2V (open) | Self-host | GPU-heavy; unbenchmarked | OpenRAIL++; MIT (check dependencies); Apache-2.0 → allowed | [LatentSync](https://huggingface.co/ByteDance/LatentSync-1.6); [MuseTalk](https://huggingface.co/TMElyralab/MuseTalk); [InfiniteTalk](https://huggingface.co/MeiGen-AI/InfiniteTalk) |

### 4.9 Editing, pacing, colour, titles, versions and delivery

Speaker-led editing and social reframing are automated and cheap. Story-level cutting and creative grading are not: Premiere's "AI color balancing" and Colourlab balance and match, they do not grade ([Adobe Premiere](https://www.adobe.com/products/premiere.html)). Delivery standards are fixed numbers an agent can check, such as EBU R128's −23 LUFS and ≤ −1 dBTP ([EBU R128](https://tech.ebu.ch/docs/r/r128.pdf)).

| Option | What it does | Price (as read) | Commercial use | Source |
|---|---|---|---|---|
| Descript + Underlord | Text-based editing agent; API and MCP | $16–$65/mo | Not read | [Descript pricing](https://www.descript.com/pricing) |
| Adobe Premiere | Generative Extend, AI colour balancing, AI music fitting, caption translation | $22.99/mo first year | Not read | [Adobe Premiere](https://www.adobe.com/products/premiere.html) |
| DaVinci Resolve 21 | IntelliScript builds timelines from a screenplay; AI search, speech generator | Free; Studio $295 one-time | — | [Resolve what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew) |
| OpusClip | Long video → shorts; reframes to 9:16, 1:1, 16:9; API and MCP | $15–$29/mo | Not read | [OpusClip pricing](https://www.opus.pro/pricing) |
| Eddie AI | Chat-directed rough cuts, multicam, social verticals | $10 per 1,000 credits (≈ 1 h of footage) | Not read | [Eddie pricing](https://www.heyeddie.ai/pricing) |
| Remotion | Titles, motion graphics and versions rendered from code | Free for companies of ≤3 people; else $100/mo minimum | Source-available; allowed within tier | [Remotion licence](https://www.remotion.pro/license) |
| Colourlab Ai 4 | AI colour matching and grading | Launch event 16 Oct 2026 | — | [Colourlab](https://www.colourlab.ai/) |
| CapCut | Consumer editor | Not read | **Materials non-commercial unless marked; "no rights" for sound recordings; banned in India** | [CapCut materials licence](https://www.capcut.com/clause/materials-license-agreement) |
| Celtra; Storyteq | Template versioning and localisation at scale | Sales only | Not read | [Celtra](https://www.celtra.com/) |

### 4.10 Automatic quality checks: how often judges agree with people

This is the piece that decides promise 4. The pattern is clear: narrow, measurable checks agree with people far better than asking a general AI "is this good?". On spatial layout, a detector agreed with people at ρ 0.71 while a video language model scored −0.15 ([T2V-CompBench](https://arxiv.org/html/2407.14505)) [paper]. People only agree with each other 65–75% of the time ([ImageReward](https://arxiv.org/html/2304.05977); [VideoPhy](https://arxiv.org/html/2406.03520)).

| Judge | What it judges | Agreement with people (as reported) | Commercial use | Source |
|---|---|---|---|---|
| GPT-5, Gemini 2.5 Pro, Claude Sonnet 4 (zero-shot) | 1–5 quality scores | **26–29% exact; 68–72% within one point** | Paid APIs | [VideoScore2 paper](https://arxiv.org/html/2509.22799v1) |
| GPT-4o (zero-shot, 4-way vote) | Which video is better | 48% (random 25%) | Paid API | [GenAI-Arena](https://arxiv.org/html/2406.04485) |
| VideoScore2 (trained, 7B) | Visual quality, alignment, physics | 44% exact; 91% within one point; ~50 out of domain | Apache-2.0 (Hugging Face metadata) → usable, check full text | [VideoScore2 paper](https://arxiv.org/html/2509.22799v1) |
| VideoReward (Kling team) | Visual, motion, text alignment | 73.6% pairwise on its own benchmark (no ties) | MIT code; Apache-2.0 weights (metadata) | [VideoAlign paper](https://arxiv.org/html/2501.13918v2) |
| VBench / VBench-2.0 | 16–18 dimensions | 82–99% — but **ranking 4 models**, not judging one clip | Apache-2.0 | [VBench-2.0](https://arxiv.org/html/2503.21755) |
| Physics judges | Physical common sense | GPT-4V ROC-AUC 53 (chance); best fine-tune 73; humans agree ~70% | Mixed | [VideoPhy](https://arxiv.org/html/2406.03520) |
| Text checks by visual question answering | On-screen text | **13.7% correct on text rendering** → use OCR instead | — | [DSG paper](https://arxiv.org/html/2310.18235) |
| Camera-path check (COLMAP) | Camera error vs plan | Measurement floor on real clips: TransErr 6.93, RotErr 1.02 | Open tools | [CameraCtrl](https://arxiv.org/html/2404.02101) |
| Google ABCD Detector (open) | YouTube "ABCD" ad rules: brand early, supers, faces, CTA | Warns of false positives and negatives; no validation published | Apache-2.0 (Google API costs) | [GitHub](https://github.com/google-marketing-solutions/abcds-detector) |
| CreativeX; Vidmob; Alison.ai; Neurons | Rule checklists and attention prediction | **No accuracy, sample size or control group published**; outcome lifts are vendor case studies | Not checked | [CreativeX](https://www.creativex.com/products/creative-quality); [Vidmob](https://vidmob.com/creative-scoring) |
| DOVER; Q-Align; VisionReward; PickScore weights | Quality and preference | Various | **Non-commercial, conflicting or registration needed → not allowed** | [DOVER licence](https://raw.githubusercontent.com/VQAssessment/DOVER/master/LICENSE); [CogVLM licence](https://huggingface.co/THUDM/cogvlm2-video-llama3-chat/blob/main/LICENSE) |

### 4.11 Learning one person's taste over time: proven for stills, not for video

| Who | Method | Evidence | Stage | Source |
|---|---|---|---|---|
| ViPer | User comments on 8–20 images → liked and disliked attributes | 86.1% picked their personalised image vs generic; 65.4% vs others' personalised (20 users) | Paper (images) | [ViPer](https://arxiv.org/html/2407.17365v1) |
| PPD | Four pairwise choices → preference embedding | 76–81% win rate, **judged by GPT-4o**, not people | Paper (images) | [PPD](https://arxiv.org/html/2501.06655) |
| BrandGuard | Learns a brand from 20–50 approved and 20–50 rejected assets | No accuracy given; **video "coming soon"** | Beta | [BrandGuard](https://www.brandguard.ai/) |
| Krea Agent | Agent memory of "your preferences across sessions" | None published | Beta | [Krea blog](https://www.krea.ai/blog/what-is-krea-agent) |
| Adobe Firefly AI Assistant | "Learns your creative preferences over time" | None published; forward-looking | Beta | [Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta) |
| Hedra; FLORA; Typeface | Brand files, "creative history", "campaign learnings" | None published | Shipped / beta | [Hedra blog](https://cms.hedra.com/blog/best-ai-agents-content-creation) (search summary); [ppc.land](https://ppc.land/floras-fauna-the-ai-creative-agent-that-fights-back-against-generic/) (secondary); [Typeface](https://www.typeface.ai/) |

**Read-across for your agent.** Each preview approval, rejection or edit is a labelled preference from this person. The research suggests tens of such labels are enough to start (PPD used four; BrandGuard asks for 20–50 of each). Log them with reasons. Note that LTX-2.x, Hunyuan and fal's terms bar using their outputs to train other models ([LTX licence](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x); [fal terms](https://fal.ai/terms)), which limits fine-tuning a taste model on their clips.

## 5. The gaps, with evidence: what the big players will close, and what stays open

**Summary.** Vendors are closing clip length, audio, resolution, reference consistency, local edits, unit price and basic one-prompt assembly, fast. They are not closing pixel-exact brand assets, numeric control, taste, selection labour, legal accountability, disclosure duties, audience acceptance or vendor stability. Those are structural: they come from how the models work, from courts and contracts, or from people.

| Gap | Evidence | Closes within ~12–18 months? | Why |
|---|---|---|---|
| **Clip length** | 8 s (Veo 3, May 2025) → 15 s (Seedance 2.0, Feb 2026) → 30 s (Seedance 2.5, Jul 2026; Kling 4.0, Oct 2026) ([Wikipedia: Seedance](https://en.wikipedia.org/wiki/Seedance), secondary; [Wikipedia: Kling AI](https://en.wikipedia.org/wiki/Kling_AI), secondary, unverified) | **Yes** (mostly closed for ads) | Most ad shots are a few seconds. Veo extensions drop to 720p, so long takes still trade quality ([Veo docs](https://ai.google.dev/gemini-api/docs/veo)) |
| **Native audio, 4K, HDR** | Audio now standard in Veo, Seedance, Kling, H3, FLUX 3; Kling 4.0 reports 4K and 10-bit HDR ([AI Weekly](https://aiweekly.co/alerts/kuaishous-kling-ships-kling-40-flash-to-annual-subscribers-30-second-4khdr-ai), secondary) | **Yes** | Visible vendor priority |
| **Consistency from references** | 3 → 12 → 50 reference files in nine months; yet Runway admits "objects may disappear or appear unexpectedly" ([Runway Gen-4.5](https://runway.com/research/introducing-runway-gen-4.5)) | **Mostly** ("good enough", not guaranteed) | No one measured identity or prop drift across a real multi-shot sequence |
| **Local edits** | Aleph object edits (Jul 2025), Veo Insert (Oct 2025), Seedance timestamp edits (Jul 2026) ([Runway Aleph](https://runway.com/research/introducing-runway-aleph); [Google blog](https://blog.google/technology/ai/veo-updates-flow/)) | **Yes** | "Nothing else changes" is not documented anywhere |
| **Unit price** | Veo 3.1 Lite $0.05–$0.08/s next to Standard $0.40/s; Runway resells 10+ families ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)) | **Yes** | Competition; but cost per *kept* second depends on hit rate |
| **One-prompt assembly and engine routing** | Runway Agent, Adobe assistant, Google Flow Agent, Amazon Creative Agent shipping or in beta | **Yes** | Big players are building exactly this |
| **Pixel-exact product, logo, legal copy, brand colour** | No vendor publishes a fidelity rate; Coca-Cola's logo was composited in ([Know Your Meme](https://knowyourmeme.com/memes/ai-generated-coca-cola-christmas-ad), secondary); practitioners advise "render the scene without text and composite the real logo" ([hermoso.ai](https://hermoso.ai/blog/why-ai-ads-look-fake/), search summary); **no colour-accuracy (ΔE) evidence exists at all** | **No** | Models redraw pixels every frame; "usually right" is not acceptable for a logo or a regulated claim |
| **Numeric, repeatable control** (lens, camera path, frame-exact timing) | Veo: 4/6/8 s, 24 fps only; Omni: "no camera parameter"; Seedance: "proportion of screen time, not exact frames" ([Veo docs](https://ai.google.dev/gemini-api/docs/veo); [Omni docs](https://ai.google.dev/gemini-api/docs/omni); [fal](https://fal.ai/learn/tools/what-is-seedance-2-5), secondary) | **No** | Words, keyframes and references are the control surface |
| **Physics and performance** | Runway admits "effects sometimes precede causes" and "actions disproportionately succeed" ([Runway Gen-4.5](https://runway.com/research/introducing-runway-gen-4.5)); physical understanding "unrelated to visual realism" ([arXiv 2501.09038](https://arxiv.org/abs/2501.09038)) | **Slowly** | Hard research problem; best action may still be driven by real performers |
| **Taste and self-judging** | Zero-shot AI judges 26–29% exact; trained judges ~50% on new data; no video taste study (Section 4.10–4.11) | **No** (research only) | Judges share the generator's blind spots: "learned judges may add little independent evidence" ([arXiv 2608.28122](https://arxiv.org/abs/2608.28122)) |
| **Selection labour and cost per kept second** | Kalshi kept 15 of 300–400 generations ([CO/AI](https://getcoai.com/news/kalshis-nba-finals-ad-costs-just-2k-using-googles-ai-video-tool/), secondary); Coca-Cola made 70,000+ clips in 30 days ([NBC Miami](https://www.nbcmiami.com/news/national-international/coca-cola-ai-generated-holiday-ad-backlash/3716580/), secondary); McDonald's NL: "ten people, five weeks", hours that "far exceeded a traditional shoot" ([NBC News](https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590), secondary; The Drum says seven weeks, a conflict) | **Partly** | Better models raise hit rates; brand review and sign-off remain |
| **Legal accountability** | US: "prompts alone" do not make you the author ([IPWatchdog](https://ipwatchdog.com/2025/01/29/part-two-copyright-office-ai-report-says-creative-prompting-doesnt-constitute-authorship/), search summary); UK plans to remove protection for computer-generated works ([Mishcon de Reya](https://www.mishcon.com/news/copyright-and-ai-the-uk-governments-report), secondary, law-firm note); open suits vs Midjourney, MiniMax, Suno; Getty appeal unheard | **No** | Settled by courts and contracts, not model releases |
| **Disclosure duties per market** | India IT Rules in force 20 Feb 2026; ASCI ad rules from ~29 Dec 2026; EU Art. 50 from 2 Aug 2026; YouTube and Meta labels (table below) | **No** (duties are growing) | An agent must label and attach metadata correctly, per market |
| **Audience acceptance** | McDonald's NL pulled its AI ad within days (Dec 2025) ([NBC News](https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590), secondary); IAB: executives 82% think consumers like AI ads vs 45% of consumers; Gen Z negativity 39% (from 21%) ([IAB](https://www.iab.com/insights/the-ai-ad-gap-widens/)); a FreeWheel survey points the other way ([PPC Land](https://ppc.land/freewheel-finds-48-of-buyers-overrate-viewer-dislike-of-ai-ads/), search summary) | **No** | Cultural; may widen. **No India or UK sentiment data found** |
| **Vendor stability** | Sora shut six months after launch; Seedance's global API was delayed after studio letters ([letsdatascience](https://letsdatascience.com/blog/bytedances-seedance-2.0-spooked-all-of-hollywood-in-72-hours), secondary) | **No** | Business decisions, not technology |
| **Indian languages** | Veo: "other languages are untested"; LTX outputs English only; no independent Bengali TTS benchmark (Section 4.5) | **Slowly** | Vendors test English first |
| **Asking only when needed (P2); colour grading; long and short cut-downs** | Not documented by any agent read (Section 2) | **Unclear** | Cut-downs are easy and likely soon (Pencil says "coming soon"); judgement about when to ask is not |

### The rules in your two markets

| Rule | India | UK |
|---|---|---|
| Labelling of AI content | **IT Rules amendment, in force 20 Feb 2026**: binds platforms and AI-tool providers (visible label, audio prefix, permanent metadata); big platforms must ask uploaders to declare synthetic content; takedown in 3 hours ([Shardul Amarchand Mangaldas](https://www.amsshardul.com/wp-content/uploads/2026/02/Legislative-Update-IT-Rules-Amendment.pdf), secondary, law-firm note). A studio delivering files is probably not an "intermediary"; it may become one if it opens its agent to outside users (needs Indian legal advice) | **No AI-specific label rule.** CAP Code applies "in full"; "the advertiser remains responsible for any output used in their ads"; fake celebrity endorsements breach the Code ([ASA](https://www.asa.org.uk/news/ai-and-deepfakes-four-things-advertisers-need-to-know-before-they-hit-run.html)) |
| Advertising | **ASCI guidelines** signed 17 Sep 2026, released 29 Sep 2026, effective **29 Dec 2026** per Khaitan or **1 Jan 2027** per exchange4media (conflict) ([ASCI text](https://foxmandal.in/wp-content/uploads/2026/09/Guidelines-for-Responsible-Labelling-of-Synthetically-Generated-Content-in-Advertising.pdf); [Khaitan](https://www.khaitanco.com/sites/default/files/2026-10/Ergo_ASCI%20Guidelines%20on%20SGC%20Labelling_12%2010%202026.pdf), secondary, law-firm note; [e4m](https://www.exchange4media.com/advertising-news/asci-issues-guidelines-on-responsible-labelling-of-ai-generated-ad-content-158710.html), search summary). **No label** for colour correction, decorative backgrounds, ambient music or obvious fantasy. **Label** for realistic product demonstrations, unbuilt products, voice or likeness replicas (even with consent). **Banned even with a label**: fake endorsements, exaggerated results, unconsented likeness | Disclosure only when the audience would otherwise be misled (law-firm summaries of CAP guidance) ([RPC](https://www.rpclegal.com/snapshots/advertising-and-marketing/summer-2025/cap-issues-guidance-on-use-of-ai-in-ads/), search summary) |
| Copyright in training | ANI v OpenAI (Delhi HC, 24 Jul 2026): training prima facie fair dealing; interim order, appeal listed for December ([SpicyIP](https://spicyip.com/2026/07/training-chatgpt-on-copyrighted-works-prima-facie-protected-under-indian-copyright-act-delhi-high-court-refuses-interim-injunction-against-openai.html), secondary). DPIIT paper proposes a mandatory paid licence (policy, not law) ([Mondaq](https://www.mondaq.com/india/copyright/1718746/exploring-the-dpiits-working-paper-on-generative-ai-and-copyright), search summary) | No law change; opt-out exception "no longer the Government's preferred option" (Mar 2026) ([Reed Smith](https://www.reedsmith.com/articles/uk-copyright-and-ai-report-the-opt-out-is-dead-but-what-comes-next/), secondary, law-firm note); Getty v Stability appeal not yet heard |
| Who owns AI output | Unresolved; DPIIT Part 2 not found | Computer-generated-works protection "will ultimately be removed" ([Mishcon de Reya](https://www.mishcon.com/news/copyright-and-ai-the-uk-governments-report), secondary, law-firm note) → protect the human-made parts in contracts |
| Voice and likeness | Courts grant fast, often ex parte injunctions against AI clones (Asha Bhosle, Aishwarya Rai Bachchan, R. Madhavan, Vivek Oberoi, Allu Arjun) ([SCC Online](https://www.scconline.com/blog/post/2025/10/03/bombay-hc-grants-interim-injunction-to-asha-bhosle-protecting-her-personality-rights-orders-blocking-of-infringing-websites-platforms-and-youtube-videos/), search summary) | Personality-right consultation promised, not opened ([Mondaq](https://www.mondaq.com/ai-deepfakes-and-image-rights-does-english-law-protect-your-face-voice-and-likeness/1846956), search summary) |
| Model licence territory | Hunyuan and MiniMax H3 weights: India inside the territory (conditional). **CapCut banned** | **Hunyuan excluded; MiniMax H3 weights need a separate licence; Gemini Omni won't edit uploaded video; Veo adult-only people** |

## 6. Your approach compared: who else builds the skeleton first, and checks against a plan

**Verdict: a real but narrow edge, not a dead end, and not new in concept.** Each part exists somewhere. The assembly you describe, with pass marks written before the clip exists and every clip measured against the 3D plan, was not found in any product, studio or open project. The search was cut short, so "not found" is weaker than "does not exist".

| Your step | Who else does it | Stage | Source |
|---|---|---|---|
| Exact parts built in code or 3D first | Intangible (3D sets from references and CAD, cameras placed by you); Autodesk Flow Studio 3D Editor; Unilever 3D pack twins; Kubrick (agents write Blender scripts); FilmAgent (agents in Unity) | Shipped / in use / paper | [intangible.ai](https://www.intangible.ai/); [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/); [arXiv 2408.10453](https://arxiv.org/abs/2408.10453); [arXiv 2501.12909](https://arxiv.org/abs/2501.12909) |
| AI paints the surface using depth, edges, masks, pose | NVIDIA Cosmos-Transfer2.5 ("sim-to-real"); Wan VACE; Luma Modify (poses or blocking); Runway Aleph 2; Havas ("3D inputs for camera control", Runway for texture and lighting); Pallaidium (Blender strip as control video); DramaDirector (retrieved depth and pose) | Shipped / in use / paper | [GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5); [Luma Ray](https://lumalabs.ai/ray); [Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns); [Pallaidium](https://github.com/tin2tin/Pallaidium) |
| A checker measures each clip against the plan | Research measures camera error and identity **after the fact** (CameraCtrl, Uni3C, OpenS2V); CineCrew's critic gives "structured QA signals" against a written spec; invideo flags continuity against a shot list. **No one gates clips on pass marks set beforehand** | Paper / shipped flagging | [CameraCtrl](https://arxiv.org/html/2404.02101); [CineCrew](https://arxiv.org/abs/2609.07720); [invideo Multi-Input](https://invideo.io/news/introducing-multi-input-intelligence-invideo-agent-two/) |
| Exact parts composited back on top | Standard VFX practice: Coca-Cola's logo; Secret Level's compositing and paint; Beeble passes; Luma EXR/ACES; Runway Compositing Nodes | Shipped / in use | [Topaz Labs](https://www.topazlabs.com/news/branded-content-reimagined-secret-level-and-coca-colas-ai-driven-holiday-classic) (secondary, vendor case study); [beeble.ai](https://beeble.ai/) |
| A person approves a cheap preview before spend | Gemini Omni 360p drafts at about a third of 720p cost; Runway's 480p Draft Mode in Agent (2 Oct 2026); video-podcast-maker's "cost-gated AI generation" | Shipped | [Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/); [Runway changelog](https://runway.com/changelog); [GitHub](https://github.com/Agents365-ai/video-podcast-maker) |
| Prior art on "3D proxy render → conditions video generation" | CinePreGen (engine-powered diffusion previs, 2024); a Chinese patent (CN 121982167 A) on a "renderer agent" | Paper; patent (unverified) | [arXiv 2408.17424](https://arxiv.org/abs/2408.17424); [goveda](https://www.goveda.com/patent/CN-121982167-A) (search summary, unverified) |

### Why it is an edge

The evidence backs your premise that generation alone cannot be trusted with exact things. Every professional example found keeps the real product, logo and text out of the generator and composites them later (Section 5). Measured checks beat AI opinions: a detector agreed with people at ρ 0.71 on layout, a video language model at −0.15 ([T2V-CompBench](https://arxiv.org/html/2407.14505)). Visual question answering gets on-screen text right only 13.7% of the time, so OCR wins ([DSG](https://arxiv.org/html/2310.18235)). The leading models cannot hit a frame or a numeric camera path (Section 5). A model-agnostic skeleton also survives an engine vanishing, as Sora did. It records which model touched which pixel, which helps with licence caps (LTX's $10M revenue limit) and with India's labelling rules. ASCI needs **no label** for colour correction, decorative backgrounds and ambient music, but **bans** exaggerated product depictions ([ASCI text](https://foxmandal.in/wp-content/uploads/2026/09/Guidelines-for-Responsible-Labelling-of-Synthetically-Generated-Content-in-Advertising.pdf)). A product built exactly from the client's CAD file cannot overstate the product. That is a compliance asset.

### Why it is narrow

Three things limit it. **First, the quality–control split.** The models people prefer do not take depth or edge maps; the ones that do rank about 200 Elo lower ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)). So the unproven "skin on skeleton" step will most likely run as render → closed video-to-video model at strong adherence → measure → composite, with looser structure than a true control input. **Second, the UK friction lands on exactly that path.** Gemini Omni will not edit uploaded video in the UK; MiniMax H3 weights need a separate UK licence; Hunyuan excludes the UK ([Omni docs](https://ai.google.dev/gemini-api/docs/omni); [Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-H3); [Tencent licence](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE)). **Third, the big models are absorbing parts of it.** References grew from 3 to 50 in nine months; Marey makes camera moves from a single image via an internal 3D scene; GEN3C builds its own 3D cache ([Marey](https://www.moonvalley.com/marey); [GEN3C](https://research.nvidia.com/labs/toronto-ai/GEN3C/)). Using the skeleton mainly to get identity and camera roughly right will matter less each quarter.

### Where it is a dead end, and where it is not

**Dead end:** selling it as "we generate better footage". Everyone rents the same Veo, Kling and Seedance. Claiming the 3D-to-generation idea as your invention would also be wrong (prior art above). **Not a dead end:** "we can prove the exact parts are exact, and say what each clip passed". That covers brand-exact logos, packshots, legal and price supers, regulated claims, exact colours and frame-timed beats. Clients are held to these by contract, and no vendor publishes accuracy for them. Two cautions from the research: set pass marks above the checker's own noise, measured first on "perfect" rendered clips (COLMAP's floor on real clips is TransErr 6.93, RotErr 1.02) ([CameraCtrl](https://arxiv.org/html/2404.02101)); and when the checker cannot measure a clip, report "cannot measure", never "pass".

## 7. The market and the money

### Who buys, and what they pay

The biggest, steadiest spend is from **enterprises buying presenter video for training, sales and localisation**. HeyGen says "85% of the Fortune 100" use it ([HeyGen](https://www.heygen.com/blog/heygen-surpasses-200m-arr)); Synthesia is used by 70% of the FTSE 100 (The Guardian, via [Wikipedia](https://en.wikipedia.org/wiki/Synthesia_%28company%29), secondary). Next come **creators, marketers and small businesses** buying credits (Higgsfield, Kling, Runway, invideo). Film, TV and agency buyers are targeted openly but disclose little. Public tool plans cost about **$10–$300 a month**; API generation about **$0.02–$0.70 per second** (Sections 1 and 4).

Ad buyers are moving. IAB (via eMarketer) reports that 22% of video ad creative was built or enhanced with gen AI in 2024, expected to reach 39% by 2026 ([eMarketer](https://www.emarketer.com/content/nearly-40--of-video-ads-will-use-genai-by-2026--says-iab), search summary). In a US sample, 83% of ad executives say their company uses AI in creative work ([IAB](https://www.iab.com/insights/the-ai-ad-gap-widens/)). In India, a GroupM report says about 18% of new digital ad assets use gen AI, yet total ad-film budgets fell only about 8% ([e4m](https://www.exchange4media.com/advertising-news/ai-can-cut-costs-but-not-replace-emotions-asserts-industry-148618.html), search summary). That suggests real savings are much smaller than the 70–85% that AI sellers claim.

| What clients pay today | Figure | Source |
|---|---|---|
| Kalshi NBA Finals ad (Veo 3, Jun 2025) | About $2,000 in 2–3 days, against production-company quotes in the "six or seven figure range" | [Yahoo](https://www.yahoo.com/entertainment/articles/chaotic-kalshi-ad-during-nba-173937071.html) (secondary) |
| Emami Dermicool, Kolkata (May 2025) | 30-s film in 30 days; "15–20%" of a comparable CG-heavy film; 8 people versus 100–150 (brand claim) | [Emami press release](https://www.emamigroup.com/wp-content/uploads/2025/05/08165958/press-release-070525.pdf); [Storyboard18](https://www.storyboard18.com/amp/brand-marketing/campaign-turnaround-down-70-production-costs-cut-by-85-how-indian-brands-are-letting-ai-take-over-creative-wheel-72438.htm) (secondary) |
| Indian AI studio claim | Campaigns of ₹50–60 lakh now ₹8–12 lakh | [Storyboard18](https://www.storyboard18.com/amp/brand-marketing/campaign-turnaround-down-70-production-costs-cut-by-85-how-indian-brands-are-letting-ai-take-over-creative-wheel-72438.htm) (secondary) |
| Bata India × Zocket | "Over $1 million a year" saved (20 Aug 2026), then "close to Rs 1 crore" (4 Sep 2026): **the two claims differ about 8×** | [MediaNews4U](https://www.medianews4u.com/bata-india-shifts-creative-to-ai-cuts-agency-costs-by-over-1-million-a-year/) (secondary); [MediaNews4U](https://www.medianews4u.com/ai-can-make-batas-ads-can-it-make-bata-desirable-prathap-suthan-asks/) (secondary) |
| Traditional 30-s ad film, India (**estimate**) | ₹3 lakh to ₹3 crore *including airtime* (agency blog; its own figures conflict) | [IRPR](https://irpr.agency/blog/30-second-tv-commercial-cost-2026-from-3-lakh-to-3-crore-what-you-get) (secondary) |
| Traditional TV ad, UK (**estimate**) | About £5,000–30,000 low, £30,000–100,000 mid, £100,000–500,000+ high (production company's page) | [Lambda Films](https://www.lambdafilms.co.uk/cost-to-advertise-on-tv-2/) (search summary) |

**My arithmetic (estimate, not a reported figure).** At Veo 3.1 Standard ($0.40/s) and Kalshi's 4–5% keep rate, generation for a 30-s spot costs roughly $300–$1,300, or a quarter of that on Fast or Lite tiers. Labour, not compute, is the cost. Your pricing should be set against what the client saves on a shoot, not against compute.

### Market size: named estimates, and why they look low

| Source (date) | Estimate | Definition | Marker |
|---|---|---|---|
| Grand View Research | **$788.5M (2025) → $3,441.6M (2033)**, 20.3% CAGR | AI video generators | Estimate; read via a reseller listing, method not public ([GII Korea](https://www.giikorea.co.kr/report/grvi1942046-ai-video-generator-market-size-share-trends.html), search summary) |
| Fortune Business Insights | **$946.4M (2026) → $3.35B (2034)**, 18.8% CAGR | Narrow AI video generators | Estimate; via a vendor roundup dated 5 Jul 2026 ([Adwave](https://adwave.com/resources/ai-video-generation-statistics-2026), secondary) |
| Meticulous Research | **$3.67B (2026) → $24.89B (2036)**, 21.4% CAGR | Generation plus editing plus avatars | Estimate; same roundup ([Adwave](https://adwave.com/resources/ai-video-generation-statistics-2026), secondary) |
| Sensor Tower (Dec 2025) | Gen AI app in-app purchases to "exceed $10 billion" in 2026 | All gen AI apps, not video only | Forecast ([Sensor Tower](https://sensortower.com/blog/predictions-digital-economy-2026)) |

These conflict with company figures. Kling alone reported over RMB 850M of revenue in Q2 2026 ([Kuaishou](https://www.webull.com/news/15428603170825216)), roughly $118M a quarter at about 7.2 RMB per dollar (my conversion), and an annualised run rate near $500M by March ([iTiger](https://www.itiger.com/news/1160238640), secondary). Higgsfield reports $700M annualised ([Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/08/17/higgsfield039s-valuation-soars-fourfold-to-54-billion-in-six-months-on-ai-content-demand), secondary), HeyGen over $200M ARR, Synthesia over $100M ARR (Apr 2025) ([Synthesia](https://www.synthesia.io/post/100-million-revenue-adobe-investment), search summary), and fal about $400M ([Dealroom](https://dealroom.co/news/126961-fal-targets-8b-valuation-in-new-raise-as-ai-inference-revenue-doubles-to/), secondary). A handful of vendors already exceed the analysts' whole "market". Treat analyst figures as rough and narrow; treat run rates as unaudited company claims. **No India- or UK-specific market size was found.**

### Funding and deals, April 2025 – October 2026

| Date | Company | Deal | Amount | Valuation | Source |
|---|---|---|---|---|---|
| Apr 2025 | Runway | Series D | $308M | >$3B (another source says $5.3B: conflict) | [Wikipedia](https://en.wikipedia.org/wiki/Runway_%28company%29) (secondary) |
| May 2025 | Hedra; Creatify | Series A | $32M; $15.5M | ≈ $200M; — | [SiliconANGLE](https://siliconangle.com/2025/05/15/ai-video-platform-hedra-raises-32m-build-digital-character-foundation-models/) (search summary); [Creatify blog](https://creatify.ai/blog/announcing-our-15-5m-series-a-a-new-chapter-for-creatify) |
| Jul 2025 | Moonvalley | Round | $84M (total $154M) | — | [InsideHPC](https://insidehpc.com/2025/07/moonvalley-raises-84m-for-ai-video-model/) (search summary) |
| Aug 2025 | Dashverse (India); Topview; Decart | Series A; Series A; Series B | $13M; ≈ $8.4M; $100M | —; ≈ $30.7M; $3.1B | [afaqs](https://www.afaqs.com/news/media/dashverse-creates-indias-first-completely-ai-generated-microdrama-10065088) (secondary); [TNGlobal](https://technode.global/2025/08/08/kamet-capital-invests-8-4m-in-singapores-ai-avatar-platform-topview/) (secondary); [Fortune](https://fortune.com/2025/08/07/exclusive-decart-raises-100-million-at-a-3-1-billion-valuation-chasing-the-future-of-real-time-creative-ai) (search summary) |
| Oct 2025 | Figma buys Weavy | Acquisition | Undisclosed (reported $150–200M+) | — | [SiliconANGLE](https://siliconangle.com/2025/10/30/figma-acquires-ai-design-startup-weavy-reported-200m/) (search summary) |
| Oct 2025 | Adobe offer for Synthesia | Rejected | $3B | — | [Wikipedia](https://en.wikipedia.org/wiki/Synthesia_%28company%29) (secondary, unverified beyond The Times) |
| Nov 2025 | Luma AI | Series C | $900M | ≈ $4B | [Bloomberg](https://www.bloomberg.com/news/articles/2025-11-19/saudi-s-humain-backs-ai-video-startup-luma-at-4-billion-value) (search summary) |
| Dec 2025 | Black Forest Labs; Arcads | Series B; seed | $300M; $16M | $3.25B; — | [Latham & Watkins](https://www.lw.com/en/news/2025/12/latham-watkins-advises-black-forest-labs-in-series-b) (search summary); [Net Influencer](https://www.netinfluencer.com/arcads-ai-secures-16m-seed-funding-to-expand-ai-video-creation-platform/) (search summary) |
| Dec 2025 | Disney–OpenAI | Equity + character licence | $1B | — | **Collapsed with Sora's shutdown** ([Engadget](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html), secondary) |
| Jan 2026 | MiniMax; Zhipu | Hong Kong IPOs | MiniMax raised $619M | — | [Malay Mail](https://malaymail.com/news/money/2026/01/09/chinese-ai-unicorn-minimax-surges-109pc-in-hong-kong-ipo-nets-us619m/204847) (search summary) |
| Jan 2026 | Synthesia (UK) | Series E | $200M | $4B | [Synthesia](https://www.synthesia.io/post/series-e-200-million-4-billion-valuation-future-work) (Wikipedia dates it Oct 2025: conflict) |
| Jan 2026 | Higgsfield | Series A extension | $80M | >$1.3B | [Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/08/17/higgsfield039s-valuation-soars-fourfold-to-54-billion-in-six-months-on-ai-content-demand) (secondary) |
| Feb 2026 | ElevenLabs; Runway | Series D; Series E | $500M; $315M | $11B; ≈ $5.3B | [MBW](https://www.musicbusinessworldwide.com/elevenlabs-creator-of-suno-rival-eleven-music-raises-500m-at-11bn-valuation) (secondary); [Bloomberg](https://bloomberg.com/news/articles/2026-02-10/ai-video-startup-runway-valued-at-5-3-billion-with-new-funding) (search summary) |
| Feb 2026 | Canva buys Cavalry and MangoAI | Acquisitions | Undisclosed | — | [TechCrunch](https://www.techcrunch.com/2026/02/23/canva-acquires-startups-working-on-animation-and-marketing/) (secondary) |
| Mar 2026 | Mirage (Captions); Netflix buys InterPositive | Growth financing; acquisition | $75M; "up to $600M" reported | — | [Trending Topics](https://trendingtopics.eu/mirage-raises-75m-to-push-ai-video-app-captions-into-asian-markets/) (search summary); [Variety AU](https://au.variety.com/2026/biz/global/netflix-acquires-ben-affleck-ai-filmmaking-startup-interpositive-33884) (search summary) |
| Mar 2026 | fal.ai | In talks | $300–350M | ≈ $8B | [Dealroom](https://dealroom.co/news/126961-fal-targets-8b-valuation-in-new-raise-as-ai-inference-revenue-doubles-to/) (secondary; talks only) |
| May 2026 | Decart | Round | $300M | $4B | [Investgame](https://investgame.net/news/decart-raises-300m-series-b-at-4b-valuation) (search summary) |
| Jun 2026 | Lionsgate–Runway | Equity stake + joint IP development | Undisclosed | — | [Runway](https://runway.com/news/runway-and-lionsgate-expand-partnership) |
| Aug 2026 | Higgsfield | Series B | $400M | $5.4B | [Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/08/17/higgsfield039s-valuation-soars-fourfold-to-54-billion-in-six-months-on-ai-content-demand) (secondary) |
| Aug 2026 | Flova | Cumulative | ">$80M" | — | [Kyodo PR Wire](https://kyodonewsprwire.jp/release/202608244599) (press release) |

Not confirmed, so left out: a Pika $250M round at $1.5B and an ElevenLabs $22B valuation (single aggregator each). **Pattern:** money is going to engines and high-volume platforms at 8–15× run rate, not to film-grade service work. The Sora collapse shows that headline deals can unwind fast.

### What production companies, studios and agencies are doing

**Global.** Big buyers use AI for *parts*: Netflix in about 300 titles, mostly in post ([Engadget](https://engadget.com/2217157/netflix-says-it-s-already-used-ai-in-roughly-300-titles-this-year), secondary); Amazon's *House of David* used 350–400 AI shots in season 2 alongside Unreal and Nuke ([Wikipedia](https://en.wikipedia.org/wiki/House_of_David_%28TV_series%29), secondary). Brands run hybrids: Coca-Cola mixed live action, synthetic characters and compositing ([Coca-Cola](https://www.coca-colacompany.com/media-center/coca-cola-refreshes-givers-of-the-season-embraces-ai-powered-storytelling-in-global-holiday-campaign.html)); Mondelez targets 30–50% lower content costs with a tool built by Publicis and Accenture ([RetailDetail](https://www.retaildetail.eu/news/food/mondelez-achieves-significant-savings-on-marketing-expenditure-thanks-to-ai/), secondary). Agencies are bringing AI production in-house: WPP opened a London hub with an LED stage and "generative and agentic AI" on 23 Sep 2026 ([WPP](https://www.wpp.com/en/news/2026/09/wpp-launches-flagship-production-hub-in-east-london)); Publicis runs "Leona, an end-to-end agentic AI content engine" ([Publicis](https://www.publicisgroupe.com/en/news/press-releases/deepti-velury-named-ceo-publicis-global-production-as-group-further-accelerates-on-intelligent-creativity)); Havas says "80% of clients ask to use AI in production" ([Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns)). AI-native studios mostly earn from software licences, commissions, courses and venture capital; every announced AI feature checked was unreleased or slipping (Utopai, Staircase, Intelliflicks, *Chiranjeevi Hanuman*) ([Wikipedia: Utopai](https://en.wikipedia.org/wiki/Utopai_Studios), secondary).

**India.** Galleri5 is the most advanced, with broadcast TV for Star Plus and JioHotstar and a "200+" model stack ([Social News XYZ](https://www.socialnews.xyz/2026/10/10/galleri5-nxtinai-ai-is-moving-to-the-big-screen/), secondary). Dashverse makes AI microdramas for its own app and reported $2M revenue in August 2025 ([afaqs](https://www.afaqs.com/news/media/dashverse-creates-indias-first-completely-ai-generated-microdrama-10065088), secondary). Ogilvy India built an AI studio with Google (14 May 2026) and Dentsu launched an AI-driven "video-first content engine" in India ([Manifest Media](https://manifest-media.in/advertising/140526/ogilvy-india-and-google-launch-ai-creative-studio-for-brand-storytelli.html), search summary; [Social Samosa](https://www.socialsamosa.com/industry-updates/dentsu-video-first-content-engine-dentsu-amp-10623913), secondary). In Bengal, Emami's Dermicool film (Kolkata), Baazar Kolkata's AI Pujo video and Tata Tea Gold's AI-led Pujo TVC show the local demand ([Ads of the World](https://www.adsoftheworld.com/campaigns/ai-durga-puja-brand-video), secondary; [Impact](https://www.impactonnet.com/more-from-impact/tata-tea-gold-and-monks-launch-banglarshilpishojjitopujo-campaign-for-durga-puja-11922.html), search summary). Pushback is real: Anurag Kashyap attacked the AI *Hanuman* feature ([Hollywood Reporter India](https://www.hollywoodreporterindia.com/features/insight/anurag-kashyap-slams-collective-artists-network-founder-vijay-subramaniam-for-producing-ai-generated-film), secondary), and Eros's AI-altered *Raanjhanaa* ending drew the director's protest ([Decrypt](https://decrypt.co/332658/indian-production-company-backlash-ai-altered-film), secondary). No Indian brand was found pulling an AI ad after backlash.

**UK.** Synthesia (London) dominates enterprise presenter video; Wonder Studios (London) does AI music videos and brand work ([IBC](https://www.ibc.org/artificial-intelligence/news/ai-production-company-wonder-studios-secures-12m-funding/22790), secondary); Luma opened a London office ([Luma news](https://lumalabs.ai/news)). "Seven in 10 UK advertisers exceed production budgets at least sometimes" ([Advanced Television](https://www.advanced-television.com/2026/08/04/research-7-in-10-uk-advertisers-exceed-production-budgets/embed/), secondary). No UK production company rate card for AI work was found.

## 8. The verdict, and three options

### Is it already done?

**In pieces, yes. Whole, no.** The "brief in, short finished video out" loop is done, cheaply, by Runway Agent for ads and by invideo Agent Two for film-style work, with Krea, Higgsfield, HeyGen, Atlabs, Medeo and Mootion close behind (Section 1). How well? Well enough to sell, not well enough to trust alone. invideo's own team kept a quarter of its clips ([invideo FAQ](https://invideo.io/faq/why-does-invideo-agent-one-run-out-of-credits/)). The best-documented brand films still took teams of 5–20+ people for weeks (Section 5). No product judges its own output in a way shown to match people, and none publishes how often it keeps a real product exact. Google and Adobe are the two most likely to ship the whole loop; Adobe MAX on 10–12 Nov 2026 is the next date to watch.

### Where real room is left

1. **Exactness you can prove.** Real product, logo, legal copy and colour, checked by measurement, with a pass/fail record per clip. No vendor offers this.
2. **Asking only when needed, for films.** Nobody documents it; invideo's setup questions are the nearest.
3. **Finishing from one brief.** Colour, all three sizes, and long and short cuts together. Nobody documents all of them.
4. **A taste loop grounded in approvals.** People's preview decisions are the best judge available; nobody ships a tested video taste model.
5. **India and UK delivery.** Bengali and Hindi voice tested by native speakers; ASCI and IT Rules labels; UK licence exclusions handled; no CapCut assets.
6. **Premium brand films, not volume variants.** Ad tools optimise for volume: Creatify's AdMax "spin[s] up 100+ creatives" for testing ([Creatify AdMax](https://creatify.ai/admax)). A warm, premium 30-s launch film is a different job.

### What makes a small company's version defensible, and what makes it pointless

| Defensible | Pointless |
|---|---|
| Exact parts built from the client's CAD and brand files, composited back by rule | Selling "one prompt, finished short video" (Medeo, Mootion, Zebracat and others already do it for $15–$150/mo) |
| Pass marks written before generation; checker noise measured first; "cannot measure" never counted as a pass | Selling engine routing (Runway's Model Routers, Adobe's 30+ models) |
| Per-market compliance and a licence ledger: which model touched which pixel, under which terms, in which country | Ad variants for Meta, Amazon or Google placements (the platforms give these away free) |
| Your own clients' approval history, logged with reasons, as taste data | Claiming better footage than the labs (everyone rents the same engines) |
| Engine-agnostic design with fallbacks (Sora proved the need) | Building on one engine, or on licences that exclude the UK or forbid client delivery (Hunyuan, H3 weights, Decart) |
| Bengali and Indian cultural craft; festive and mythological formats that ASCI treats as "obvious, unrealistic" | Competing as a consumer SaaS against companies valued at $4–5B |

### Three options

| | **A. AI-first production studio, with the agent as your in-house engine** | **B. The exactness and compliance layer** | **C. A full autonomous-agent product** |
|---|---|---|---|
| What you sell | Finished hybrid films and all their versions to brands and agencies in India and the UK, priced against a traditional shoot | The checker, composite-back and rights/label ledger, sold to agencies, studios and other AI studios, or exposed as an MCP tool that agents like Runway's or Krea's can call | A Runway/invideo-style agent for anyone |
| For it | Revenue now; generation cost is small next to client prices (Section 7); every job tests the skin-on-skeleton step and builds approval data; agencies need overflow capacity | Nobody publishes this; it complements the platforms instead of fighting them; India's ASCI rules land around 29 Dec 2026; hard to copy without your calibration data | Biggest prize; invideo shows an India-founded team can build one |
| Against | Labour-heavy and does not scale like software; competes with agency in-house AI hubs (WPP, Ogilvy × Google, Dentsu AMP) and small Indian AI partners; real savings may be nearer GroupM's ~8% than vendors' 70–85% | Demand is unproven (no buyer of "proof of exactness" was found); long B2B sales; a platform could add basic logo and OCR checks; needs the skin-on-skeleton step to work at least for packshots | Rivals raised $75M–$900M and have tens of millions of users; Google and Adobe are converging on it; promise 4 is unsolved by anyone, so you would be funding research; engine and price churn |
| Evidence strength | Medium (Kalshi, Emami, Galleri5, Secret Level show the service model works) | Low to medium (strong evidence of the gap, no evidence of willingness to pay) | Strong evidence that it is crowded |

**My pick: A, built so that B can be split out once it works.** The money in service work is real today, and your checker attacks the biggest hidden cost every competitor shows: selection and fixing labour. Running it on paid jobs is also the only way to prove the unproven step and to collect the approval data that a taste model needs. If the checker turns out to be what clients value most, package it as B. I would not pursue C.

**On the skeleton question directly:** others use 3D-first-then-generate (Havas, Unilever, Autodesk, Intangible, NVIDIA, Pallaidium), so it is not unique. Nobody found measures every clip against a plan written beforehand. It is a **niche edge**: real where clients are held to exact assets, a dead end if sold as better generation.

### First steps the evidence suggests

1. Prove the unproven step on a few packshot shots: render → closed video-to-video at strong adherence → measure → composite. Measure the checker's own noise on perfect renders first.
2. Run a blind Bengali and Hindi voice test with Kolkata speakers across ElevenLabs v4, Gemini 3.8, Cartesia and Sarvam.
3. Read the commercial terms of every engine you plan to use (Runway, Kling, Luma, BytePlus/Seedance, Alibaba/Wan 3.0); until then, treat them as not allowed for client delivery.
4. Get Indian legal advice on the IT Rules (are you an "intermediary"?) and ASCI labels, and UK advice on CAP, before launch.
5. Price from your own past budgets, not from vendors' percentage claims.

## 9. What this report could not check, and what would change its conclusions

### Research limits stated in the notes

- **Search budget.** A web-search limit shared by all researchers ("200 WebSearch calls per turn") ran out partway through every track. Some tracks got about 16 searches; the quality-and-taste track got one. After that, researchers could only open pages whose addresses they already knew.
- **Blocked or unreadable sites.** Reddit could not be fetched at all. HTTP 403 or similar from: genspark.ai, PetaPixel, G2, helpx.adobe.com, autodesk.com, canva.com, docs.midjourney.com, openai.com/index, arena.ai (LMArena), The Drum, eMarketer, exchange4media, Impact, Kuaishou investor relations, Bird & Bird, Ropes & Gray. 404 or empty: Mootion, Arcads and AdCreative pricing, hedra.com/agent, lumalabs.ai/agents, the Artificial Analysis methodology page, Kaiber pricing. Rendered only in a browser: Higgsfield pricing, Kling docs and API prices, BytePlus terms, Udio, VEED, Netflix's partner portal. Paywalled: Ad Age, Variety.
- **Not reached at all:** Snap, Pinterest, Spotify, Salesforce and Shopify video tools; Meta and Google first-party creative scoring; 2026 papers testing AI judges on video; video OCR and logo-fidelity metrics; Jogg, Simplified, AutoShorts, OiiOii, LibTV, Martini, Saga, Photoroom, Bria and Movio; Indian- or UK-built open projects; Indian and UK agency rate cards and production-cost surveys (APA, ISBA, IPA); India and UK consumer sentiment on AI ads; BCAP, Clearcast and Ofcom positions; India's Gazette text of the IT Rules; most companies' 2025–26 funding after their last public round (Shengshu, Suno, Genspark, invideo).
- **Terms not read** (so treated as not allowed): Runway, Kling, Luma (models), Alibaba Cloud (Wan 3.0), BytePlus (Seedance, OmniHuman), xAI, OpenMDW-1.1 (Cosmos 3), sync., OpusClip, Descript, Gemini voice replication, HeyGen HyperFrames' repository licence.
- **No hands-on tests.** No product was used. No independent, side-by-side test of any agent was found. Most user evidence is star ratings and complaint snippets.
- **India availability** was not confirmed for most products.

### Where the notes conflict (both figures given)

| Fact | One source says | Another says |
|---|---|---|
| Sora 2 launch | End of Sep 2025 ([TIMEWELL](https://timewell.jp/en/columns/openai-sora20), search summary) | 18 Dec 2025 ([Cliprise](https://www.cliprise.app/news/sora-2-launch), search summary); the API snapshot name shows Oct 2025 |
| Wan 3.0 price per second | $0.05–$0.28 ([DataNorth](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model), secondary) | CNY 0.3–1.2 ([Alibaba](https://help.aliyun.com/en/model-studio/wan3-0-video)); ≈ $0.20 at 1080p on AA |
| #1 text-to-video model | Wan 3.0 ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)) | Gemini Omni 1.1 Flash ([arena.ai](https://arena.ai/leaderboard/video/text-to-video), search summary, unverified) |
| Synthesia $200M / $4B round | 26 Jan 2026 ([Synthesia](https://www.synthesia.io/post/series-e-200-million-4-billion-valuation-future-work)) | Oct 2025 ([Wikipedia](https://en.wikipedia.org/wiki/Synthesia_%28company%29), secondary) |
| Runway Series D valuation (Apr 2025) | >$3B ([Wikipedia](https://en.wikipedia.org/wiki/Runway_%28company%29), secondary) | $5.3B (Multiples.vc, via the same notes) |
| ASCI guidelines take effect | 29 Dec 2026 ([Khaitan](https://www.khaitanco.com/sites/default/files/2026-10/Ergo_ASCI%20Guidelines%20on%20SGC%20Labelling_12%2010%202026.pdf), secondary, law-firm note) | 1 Jan 2027 ([e4m](https://www.exchange4media.com/advertising-news/asci-issues-guidelines-on-responsible-labelling-of-ai-generated-ad-content-158710.html), search summary) |
| Bata's AI savings | "Over $1 million a year" (20 Aug 2026) | "Close to Rs 1 crore" a year (4 Sep 2026), about 8× less ([MediaNews4U](https://www.medianews4u.com/ai-can-make-batas-ads-can-it-make-bata-desirable-prathap-suthan-asks/), secondary) |
| McDonald's NL ad effort | Five weeks ([NBC News](https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590), secondary) | Seven weeks ([The Drum](https://www.thedrum.com/news/the-most-terrible-ad-of-the-year-mcdonald-s-pulls-ai-ad), search summary) |
| Coca-Cola 2025 team size | "Five specialists" (making-of voiceover) | 20 people (Zada via THR); "over 100" (another account) ([Know Your Meme](https://knowyourmeme.com/memes/ai-generated-coca-cola-christmas-ad), secondary) |
| Flova script limit | 300,000 characters (press release) | 100,000 Chinese characters (listings, search summary) |
| Krea Agent availability | "Yes" on every plan (pricing page) | Max and up; others need an access code (blog) ([Krea pricing](https://www.krea.ai/pricing)) |
| invideo revenue | ≈ $70M ARR, 2025 ([ToolJunction](https://www.tooljunction.io/ai-tools/invideo/company), unverified) | $30M revenue, 2024 ([Latka](https://getlatka.com/companies/invideo), unverified) |
| MiniMax H3 licence | Local deployment "blocked" in the US, EU, UK, South Korea ([mer.vin](https://mer.vin/news/minimax-h3-open-weight-video-model-blocked-us-eu-uk/), secondary) | Those are "excluded territories" where users must apply for a licence ([Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-H3)) |
| Higgsfield agent's language model | "GPT-6 Astra" (homepage) | Routes to Claude Opus 4.7, GPT-5.5 Pro and Gemini 3.1 Pro ([BitsMinds](https://www.bitsminds.com/news/higgsfield-supercomputer-cloud-native-ai-agent-2026), search summary) |
| VISTA human preference | 66.4% ([arXiv](https://arxiv.org/abs/2510.15831)) | 68% ([research.google](https://research.google/pubs/vista-towards-test-time-self-improving-video-generation-agent/), search summary) |
| Wonder Studios seed | Oct 2025, "12m" in $ and £ ([IBC](https://www.ibc.org/artificial-intelligence/news/ai-production-company-wonder-studios-secures-12m-funding/22790), secondary) | Jan 2026 ([Maginative](https://www.maginative.com/wonder-studios-raises-12m-to-build-ai-production-company), search summary) |
| Manus | "Now part of Meta" (search-result title) | The page itself did not mention Meta ([manus.im](https://manus.im/tools/ai-animation-video-generator)) |

### Surprising claims that rest on few sources

Higgsfield's $700M run rate (one Reuters report of a company claim). Kling's ~$18B valuation (one secondary report). Utopai X at #2 on the board (one board; no public API). Netflix's InterPositive "up to $600M" (search summary). Adobe's rejected $3B offer for Synthesia (The Times via Wikipedia). The Coca-Cola logo composited in post (a viral X post, via Know Your Meme). VideoGen-Agent's 84.3% human preference (authors' own claim). All Indian cost-saving percentages (70–85%) come from parties who sell AI. Treat each as unconfirmed.

### What would change these conclusions

- **Adobe MAX (10–12 Nov 2026) or a Google launch** joining Flow Agent, Omni, Lyria, Vids and a VISTA-style critic. "Nobody sells the whole thing" would then be false for their users.
- **A vendor publishing product, logo or text fidelity rates**, or guaranteeing exact product swaps. That would shrink the exactness edge.
- **Top closed models adding depth, edge or pose inputs.** That would make your skeleton far more powerful.
- **Independent tests of invideo, Runway or Krea agents showing high keep rates.** Promise 4 would be closer than this report says.
- **Your own skin-on-skeleton test failing its pass marks at a viable cost.** Option A would narrow to "composite real assets over generated backgrounds".
- **Reading the engines' commercial terms.** Some engines could move from "not allowed" to "allowed", or the reverse.
- **Court outcomes:** the Getty v Stability appeal, the Suno, Midjourney and MiniMax suits, ANI v OpenAI's appeal.
- **India or UK consumer data** on AI ads, which this report lacks entirely.

## 10. Sources

Every link cited above, in order of first use. **All were read on 2026-10-15** (the research date of the notes). Marker as in the rest of the report: **primary** = the company's, court's, regulator's or paper's own page read directly; **(secondary)**, **(search summary)**, **(unverified)** and **(press release)** as defined at the top. Where one link was cited with different markers in different places, all are listed.

1. [Runway changelog](https://runway.com/changelog) — read 2026-10-15 — primary
2. [invideo Workflows](https://invideo.io/news/introducing-workflows-invideo-agent-two/) — read 2026-10-15 — primary
3. [ChannelX](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/) — read 2026-10-15 — secondary
4. [Adobe blog](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta) — read 2026-10-15 — primary
5. [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/) — read 2026-10-15 — primary
6. [OpenAI](https://developers.openai.com/api/docs/models/sora-2) — read 2026-10-15 — primary
7. [Runway pricing](https://runway.com/pricing) — read 2026-10-15 — primary
8. [invideo pricing](https://invideo.io/pricing) — read 2026-10-15 — primary
9. [Adobe newsroom](https://news.adobe.com/news/2026/04/adobe-new-creative-agent) — read 2026-10-15 — primary
10. [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video) — read 2026-10-15 — primary
11. [ProVideo Coalition](https://www.provideocoalition.com/ai-tools-heygen-avatar-iv-gets-real/) — read 2026-10-15 — secondary
12. [Know Your Meme](https://knowyourmeme.com/memes/ai-generated-coca-cola-christmas-ad) — read 2026-10-15 — secondary
13. [VideoScore2 paper](https://arxiv.org/html/2509.22799v1) — read 2026-10-15 — primary (paper)
14. [VideoAlign paper](https://arxiv.org/html/2501.13918v2) — read 2026-10-15 — primary (paper)
15. [invideo FAQ](https://invideo.io/faq/why-does-invideo-agent-one-run-out-of-credits/) — read 2026-10-15 — primary
16. [CO/AI](https://getcoai.com/news/kalshis-nba-finals-ad-costs-just-2k-using-googles-ai-video-tool/) — read 2026-10-15 — secondary
17. [NBC News](https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590) — read 2026-10-15 — secondary
18. [GitHub](https://github.com/nvidia-cosmos/cosmos-transfer2.5) — read 2026-10-15 — primary
19. [intangible.ai](https://www.intangible.ai/) — read 2026-10-15 — primary
20. [Runway customer story](https://runway.com/customers/how-havas-groups-ai-production-workflows-are-transforming-global-brand-campaigns) — read 2026-10-15 — primary
21. [Unilever](https://www.unilever.com/news/news-search/2025/unilever-reinvents-product-shoots-with-ai-for-faster-content-creation/) — read 2026-10-15 — search summary
22. [Autodesk News](https://adsknews.autodesk.com/en/news/direct-ai-3d-editor-canvas-flow-studio/) — read 2026-10-15 — primary
23. [MediaNews4U](https://www.medianews4u.com/collective-artists-network-galleri5-launch-indias-first-cinema-native-production-operating-system-at-the-india-ai-impact-summit/) — read 2026-10-15 — press release, secondary
24. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) — read 2026-10-15 — primary
25. [Omni docs](https://ai.google.dev/gemini-api/docs/omni) — read 2026-10-15 — primary
26. [Google Workspace](https://workspace.google.com/products/vids/) — read 2026-10-15 — primary
27. [ppc.land](https://ppc.land/google-vids-gets-free-veo-3-1-video-generation-music-and-ai-avatars/) — read 2026-10-15 — secondary
28. [ppc.land](https://ppc.land/asset-studio-gets-gemini-omni-and-1-click-creative-testing-at-gml-2026/) — read 2026-10-15 — secondary
29. [onlinemarketing.de](https://onlinemarketing.de/technologie/googles-ai-marketing-tool-pomelli-video-ads) — read 2026-10-15 — search summary, unverified
30. [Engadget](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html) — read 2026-10-15 — secondary
31. [Meta newsroom](https://about.fb.com/ltam/news/2026/10/advertising-week-new-york-2026-nuevas-capacidades-de-ia-para-guiar-campanas-y-llegar-a-los-clientes/) — read 2026-10-15 — primary
32. [TechCrunch](https://www.techcrunch.com/2026/02/05/meta-tests-a-standalone-app-for-its-ai-generated-vibes-videos) — read 2026-10-15 — secondary
33. [arXiv 2410.13720](https://arxiv.org/abs/2410.13720) — read 2026-10-15 — primary (paper)
34. [Meta newsroom](https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/) — read 2026-10-15 — primary
35. [Adobe blog](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work) — read 2026-10-15 — primary
36. [Adobe Community](https://community.adobe.com/questions-404/using-firefly-ai-assistant-beta-for-final-production-and-i-indemnification-1640494) — read 2026-10-15 — secondary, unverified
37. [Apple release notes](https://support.apple.com/en-us/102825) — read 2026-10-15 — primary
38. [Amazon Ads](https://advertising.amazon.com/library/news/unboxed-toronto-2026) — read 2026-10-15 — primary
39. [Amazon Ads](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns) — read 2026-10-15 — primary
40. [AWS docs](https://docs.aws.amazon.com/nova/latest/userguide/video-generation.html) — read 2026-10-15 — primary
41. [Mezha](https://mezha.ua/en/news/amazon-shuts-down-nova-313675/amp/) — read 2026-10-15 — search summary, unverified
42. [heise](https://www.heise.de/en/news/Copilot-gets-Clipchamp-support-for-automatic-video-creation-10255460.html) — read 2026-10-15 — secondary
43. [Windows Report](https://windowsreport.com/microsoft-upgrades-bing-video-creator-with-openais-sora-2-ai-video-model/) — read 2026-10-15 — search summary
44. [NVIDIA Cosmos](https://www.nvidia.com/en-us/ai/cosmos/) — read 2026-10-15 — primary
45. [TechNode](https://technode.com/2026/07/31/bytedance-launches-seedance-2-5-video-generation-model/) — read 2026-10-15 — secondary
46. [Pippit](https://www.pippit.ai) — read 2026-10-15 — primary
47. [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/) — read 2026-10-15 — primary
48. [Wikipedia: CapCut](https://en.wikipedia.org/wiki/CapCut) — read 2026-10-15 — secondary
49. [kling.ai](https://kling.ai) — read 2026-10-15 — primary
50. [Kuaishou Q2 results](https://www.webull.com/news/15428603170825216) — read 2026-10-15 — primary
51. [AI Weekly](https://aiweekly.co/alerts/kuaishous-kling-ships-kling-40-flash-to-annual-subscribers-30-second-4khdr-ai) — read 2026-10-15 — secondary
52. [DataNorth](https://datanorth.ai/news/alibaba-launches-wan3-0-video-model) — read 2026-10-15 — secondary
53. [Alibaba Model Studio](https://help.aliyun.com/en/model-studio/wan3-0-video) — read 2026-10-15 — primary
54. [Hugging Face](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B) — read 2026-10-15 — primary
55. [HunyuanVideo-1.5 LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE) — read 2026-10-15 — primary
56. [Hugging Face MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3) — read 2026-10-15 — primary
57. [The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open) — read 2026-10-15 — secondary
58. [Bloomberg Law](https://news.bloomberglaw.com/ip-law/disneys-copyright-suit-against-chinese-ai-developer-advances) — read 2026-10-15 — search summary
59. [xAI docs](https://docs.x.ai/docs/models) — read 2026-10-15 — primary
60. [Runway Agent](https://runway.com/product/agent) — read 2026-10-15 — primary
61. [Luma news](https://lumalabs.ai/news) — read 2026-10-15 — primary
62. [Luma pricing](https://lumalabs.ai/pricing) — read 2026-10-15 — primary
63. [Luma Ray](https://lumalabs.ai/ray) — read 2026-10-15 — primary
64. [pika.art](https://pika.art) — read 2026-10-15 — primary
65. [LTX pricing](https://ltx.io/studio/pricing) — read 2026-10-15 — primary
66. [LTX-2 licence](https://static.lightricks.com/legal/ltx-2-open-weights-license-0.X.pdf) — read 2026-10-15 — primary
67. [moonvalley.com](https://www.moonvalley.com) — read 2026-10-15 — primary
68. [The Decoder](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/) — read 2026-10-15 — secondary
69. [Stability news](http://stability.ai/news-updates) — read 2026-10-15 — primary
70. [Stability licence](https://stability.ai/license) — read 2026-10-15 — primary
71. [FoneArena](https://www.fonearena.com/blog/480278/canva-ai-2-0-features.html) — read 2026-10-15 — secondary
72. [Fortune](https://www.fortune.com/2026/08/12/canva-startup-growth-ai-costs-revenue-forecast-by-third/) — read 2026-10-15 — search summary
73. [usagepricing](https://www.usagepricing.com/blueprint/wonder-dynamics) — read 2026-10-15 — secondary
74. [Supercomputer](https://higgsfield.ai/supercomputer) — read 2026-10-15 — primary
75. [Higgsfield terms](https://higgsfield.ai/terms-of-use-agreement) — read 2026-10-15 — primary
76. [Midjourney](https://updates.midjourney.com/introducing-our-v1-video-model/) — read 2026-10-15 — primary
77. [CourtListener](https://www.courtlistener.com/docket/70513159/disney-enterprises-inc-v-midjourney-inc/) — read 2026-10-15 — primary
78. [vidu.com](https://www.vidu.com) — read 2026-10-15 — primary
79. [KrASIA](https://kr-asia.com/pulses/159029) — read 2026-10-15 — secondary
80. [Wikipedia](https://en.wikipedia.org/wiki/Utopai_Studios) — read 2026-10-15 — secondary
81. [AOL/Reuters](https://www.aol.com/news/baidu-launches-ai-video-generator-084131165.html) — read 2026-10-15 — search summary
82. [Z.ai pricing](https://docs.z.ai/guides/overview/pricing) — read 2026-10-15 — primary
83. [CogVideo licence](https://github.com/zai-org/CogVideo/blob/main/MODEL_LICENSE) — read 2026-10-15 — primary
84. [Decart pricing](https://docs.platform.decart.ai/getting-started/pricing) — read 2026-10-15 — primary
85. [Decart terms](https://docs.platform.decart.ai/resources/api-terms) — read 2026-10-15 — primary
86. [Engadget](https://engadget.com/2217157/netflix-says-it-s-already-used-ai-in-roughly-300-titles-this-year) — read 2026-10-15 — secondary
87. [TheWrap](https://www.thewrap.com/netflix-generative-ai-use-content-production-guidelines/) — read 2026-10-15 — secondary
88. [Getty 10-Q](https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm) — read 2026-10-15 — primary
89. [invideo Agent Intelligence](https://invideo.io/news/introducing-agent-intelligence-invideo-agent-two/) — read 2026-10-15 — primary
90. [invideo Multi-Input](https://invideo.io/news/introducing-multi-input-intelligence-invideo-agent-two/) — read 2026-10-15 — primary
91. [Krea blog](https://www.krea.ai/blog/what-is-krea-agent) — read 2026-10-15 — primary
92. [Krea pricing](https://www.krea.ai/pricing) — read 2026-10-15 — primary
93. [Kyodo PR Wire](https://kyodonewsprwire.jp/release/202608244599) — read 2026-10-15 — press release
94. [Medeo](https://www.medeo.app/) — read 2026-10-15 — primary
95. [Medeo pricing](https://www.medeo.app/pricing) — read 2026-10-15 — primary
96. [Mootion](https://www.mootion.com/) — read 2026-10-15 — primary
97. [Atlabs pricing](https://www.atlabs.ai/pricing) — read 2026-10-15 — primary
98. [OpenArt pricing](https://openart.ai/pricing) — read 2026-10-15 — primary
99. [OpenArt Director](https://openart.ai/suite/director) — read 2026-10-15 — primary
100. [Hedra blog](https://www.hedra.com/blog/how-to-turn-venue-photos-into-a-finished-wedding-concept-video-with-hedra-agent) — read 2026-10-15 — primary
101. [Hedra pricing](https://www.hedra.com/pricing) — read 2026-10-15 — primary
102. [opus.pro/agent](https://www.opus.pro/agent) — read 2026-10-15 — primary
103. [Duke DDMC](https://sites.duke.edu/ddmc/2026/03/27/agentopus/) — read 2026-10-15 — secondary
104. [manus.im](https://manus.im/tools/ai-animation-video-generator) — read 2026-10-15 — primary
105. [Bloomberg](https://www.bloomberg.com/news/articles/2025-06-04/ai-upstart-manus-starts-text-to-video-service-to-take-on-openai) — read 2026-10-15 — search summary
106. [eesel](https://www.eesel.ai/blog/genspark-ai-review) — read 2026-10-15 — search summary
107. [PR Newswire Asia](https://en.prnasia.com/releases/global/pollo-ai-launches-pollo-agent-2-0-for-end-to-end-publish-ready-ai-videos-and-ads-543203.shtml) — read 2026-10-15 — press release
108. [a16z](https://a16z.com/announcement/investing-in-glif/) — read 2026-10-15 — secondary
109. [ppc.land](https://ppc.land/floras-fauna-the-ai-creative-agent-that-fights-back-against-generic/) — read 2026-10-15 — secondary
110. [Zebracat pricing](https://www.zebracat.ai/pricing) — read 2026-10-15 — primary
111. [Revid pricing](https://www.revid.ai/pricing) — read 2026-10-15 — primary
112. [Fliki pricing](https://fliki.ai/pricing) — read 2026-10-15 — primary
113. [Pictory pricing](https://pictory.ai/pricing) — read 2026-10-15 — primary
114. [Steve.ai pricing](https://app.steve.ai/pricing) — read 2026-10-15 — primary
115. [vyond.com/go](https://vyond.com/go) — read 2026-10-15 — search summary
116. [aiagentstore](https://aiagentstore.ai/ai-agent/visla-ai-video-agent) — read 2026-10-15 — search summary
117. [Vadoo pricing](https://www.vadoo.tv/pricing) — read 2026-10-15 — primary
118. [Pulse 2.0](https://pulse2.com/hypernatural-9-2-million-secured-for-scaling-ai-video-creator) — read 2026-10-15 — search summary
119. [Podnews](https://podnews.net/press-release/wonda-launched-by-wondercraft) — read 2026-10-15 — search summary
120. [Showrunner](https://www.showrunnerstudio.com/) — read 2026-10-15 — primary
121. [parse.gl](https://parse.gl/brands/story-com) — read 2026-10-15 — search summary
122. [Katalist pricing](https://www.katalist.ai/pricing) — read 2026-10-15 — primary
123. [VentureBeat](https://venturebeat.com/business/mystic-moose-unveils-movieflo-ai-to-make-user-generated-films) — read 2026-10-15 — search summary
124. [Dreamina review](https://dreamina.capcut.com/ai-video/tapnow-ai-review) — read 2026-10-15 — secondary, search summary, competitor
125. [framia review](https://framia.converge.ai/blog/lovart-ai-review/) — read 2026-10-15 — secondary, search summary, competitor
126. [morphic.com](https://morphic.com/es/resources/tools/best-ai-tools-for-filmmakers) — read 2026-10-15 — search summary
127. [TechFinitive](https://www.techfinitive.com/product-guides/best-ai-video-generator-tools-for-music-to-video-creation-in-2026/) — read 2026-10-15 — search summary
128. [TechCrunch](https://techcrunch.com/2025/10/30/figma-acquires-ai-powered-media-generation-company-weavy) — read 2026-10-15 — search summary
129. [Business Wire](https://www.businesswire.com/news/home/20251104023735/en/Freepik-Launches-Freepik-Spaces-to-Power-AI-Visual-Creation-and-Collaboration-in-Real-Time) — read 2026-10-15 — search summary
130. [sp-edge](https://sp-edge.com/companies/3572261) — read 2026-10-15 — search summary
131. [hunted.space iArt](https://hunted.space/dashboard/iart-ai) — read 2026-10-15 — search summary
132. [aitoolly](https://aitoolly.com/producthunt-daily/2026-04-30) — read 2026-10-15 — search summary
133. [hunted.space Pexo](https://www.hunted.space/product/pexo) — read 2026-10-15 — search summary
134. [HeyGen Video Agent](https://www.heygen.com/video-agent) — read 2026-10-15 — primary
135. [HeyGen terms](https://www.heygen.com/terms) — read 2026-10-15 — primary
136. [Creatify pricing](https://creatify.ai/pricing) — read 2026-10-15 — primary
137. [Creatify AdMax](https://creatify.ai/admax) — read 2026-10-15 — primary
138. [Creatify terms](https://creatify.ai/terms) — read 2026-10-15 — primary
139. [Omneky newsroom](https://www.omneky.com/newsroom/omneky-public-api-mcp-server-ai-advertising-everywhere) — read 2026-10-15 — primary
140. [Topview pricing](https://www.topview.ai/pricing) — read 2026-10-15 — primary
141. [Promer review](https://promer.ai/blog/topview-ai-review) — read 2026-10-15 — secondary, competitor
142. [Zeely pricing](https://zeely.ai/pricing) — read 2026-10-15 — primary
143. [Pencil pricing](https://www.trypencil.com/pricing) — read 2026-10-15 — primary
144. [Synthesia pricing](https://www.synthesia.io/pricing) — read 2026-10-15 — primary
145. [mirage.app](https://mirage.app/) — read 2026-10-15 — primary
146. [Captions pricing](https://www.captions.ai/pricing) — read 2026-10-15 — primary
147. [Arcads](https://www.arcads.ai/) — read 2026-10-15 — primary
148. [Arcads terms](https://www.arcads.ai/terms) — read 2026-10-15 — primary
149. [Akool pricing](https://akool.com/pricing) — read 2026-10-15 — primary
150. [shhots.ai](https://shhots.ai/blog/adcreative-ai-pricing/) — read 2026-10-15 — search summary
151. [Smartly AI Studio](https://smartly.io/product/ai-studio) — read 2026-10-15 — primary
152. [Typeface blog](https://typeface.ai/blog/accelerating-ai-content-lifecycle-transformation-unveiling-typeface-arc-agent-strategic-acquisitions-and-multimodal-product-innovation) — read 2026-10-15 — search summary
153. [Adweek wire](https://www.adweek.com/adweek-wire/vidmob-launches-vidmob360/) — read 2026-10-15 — search summary
154. [Celtra](https://www.celtra.com/) — read 2026-10-15 — primary
155. [Storyteq](https://www.storyteq.com/) — read 2026-10-15 — primary
156. [Tavus pricing](https://www.tavus.io/pricing) — read 2026-10-15 — primary
157. [D-ID pricing](https://www.d-id.com/pricing/) — read 2026-10-15 — primary
158. [Colossyan pricing](https://www.colossyan.com/pricing) — read 2026-10-15 — primary
159. [Fluxnote](https://fluxnote.io/guides/makeugc-ai-review) — read 2026-10-15 — search summary
160. [Lamina comparison](https://uselamina.ai/blog/best-ai-video-agents-for-ecommerce-in-2026) — read 2026-10-15 — secondary
161. [Tech Startups](https://techstartups.com/2026/03/05/icon-the-ai-ad-startup-shuts-down-after-spending-12m-on-the-icon-com-domain/) — read 2026-10-15 — secondary
162. [Techleap](https://finder.techleap.nl/news/note/wix-acquires-hour-one-boosting-its-generative-ai-ambitions) — read 2026-10-15 — search summary
163. [Social News XYZ](https://www.socialnews.xyz/2026/10/10/galleri5-nxtinai-ai-is-moving-to-the-big-screen/) — read 2026-10-15 — secondary
164. [afaqs](https://www.afaqs.com/news/media/dashverse-creates-indias-first-completely-ai-generated-microdrama-10065088) — read 2026-10-15 — secondary
165. [Intelliflicks](https://www.intelliflicks.com) — read 2026-10-15 — primary
166. [Agerpres](https://agerpres.ro/cultura/2026/04/16/un-film-realizat-in-intregime-cu-ai-lansat-in-curand-pe-marile-ecrane-din-india--1546991) — read 2026-10-15 — search summary
167. [TheWrap](https://thewrap.com/staircase-studio-to-produce-30-ai-films) — read 2026-10-15 — search summary
168. [Engadget](https://engadget.com/ai/ai-animation-studio-toonstar-will-turn-books-into-digital-shows-for-harpercollins-211419155.html) — read 2026-10-15 — secondary
169. [Topaz Labs](https://www.topazlabs.com/news/branded-content-reimagined-secret-level-and-coca-colas-ai-driven-holiday-classic) — read 2026-10-15 — secondary, vendor case study
170. [silverside.ai](https://www.silverside.ai/) — read 2026-10-15 — primary
171. [IBC](https://www.ibc.org/artificial-intelligence/news/ai-production-company-wonder-studios-secures-12m-funding/22790) — read 2026-10-15 — secondary
172. [Tubefilter](https://www.tubefilter.com/2025/05/20/promise-generative-ai-startup-strategic-investment-partnership-google/) — read 2026-10-15 — search summary
173. [Hollywood Reporter](https://www.hollywoodreporter.com/movies/movie-news/natasha-lyonne-jaron-lanier-ai-movie-uncanny-valley-1236202957) — read 2026-10-15 — search summary
174. [Emami press release](https://www.emamigroup.com/wp-content/uploads/2025/05/08165958/press-release-070525.pdf) — read 2026-10-15 — primary
175. [Storyboard18](https://www.storyboard18.com/amp/brand-marketing/campaign-turnaround-down-70-production-costs-cut-by-85-how-indian-brands-are-letting-ai-take-over-creative-wheel-72438.htm) — read 2026-10-15 — secondary
176. [MediaNews4U](https://www.medianews4u.com/bata-india-shifts-creative-to-ai-cuts-agency-costs-by-over-1-million-a-year/) — read 2026-10-15 — secondary
177. [WPP](https://www.wpp.com/en/news/2026/09/wpp-launches-flagship-production-hub-in-east-london) — read 2026-10-15 — primary
178. [Publicis](https://www.publicisgroupe.com/en/news/press-releases/deepti-velury-named-ceo-publicis-global-production-as-group-further-accelerates-on-intelligent-creativity) — read 2026-10-15 — primary
179. [Intangible pricing](https://www.intangible.ai/pricing) — read 2026-10-15 — primary
180. [beeble.ai](https://beeble.ai/) — read 2026-10-15 — primary
181. [GitHub](https://github.com/HKUDS/ViMax) — read 2026-10-15 — primary
182. [arXiv 2606.07649](https://arxiv.org/abs/2606.07649) — read 2026-10-15 — primary (paper)
183. [GitHub](https://github.com/HITsz-TMG/VideoClaw) — read 2026-10-15 — primary
184. [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app) — read 2026-10-15 — primary
185. [Jellyfish](https://github.com/Forget-C/Jellyfish) — read 2026-10-15 — primary
186. [wind-comic](https://github.com/ChrisChen667788/wind-comic) — read 2026-10-15 — primary
187. [GitHub](https://github.com/waooAI/waoowaoo) — read 2026-10-15 — primary
188. [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) — read 2026-10-15 — primary
189. [ShortGPT](https://github.com/RayVentura/ShortGPT) — read 2026-10-15 — primary
190. [NarratoAI](https://github.com/linyqh/NarratoAI) — read 2026-10-15 — primary
191. [GitHub](https://github.com/Agents365-ai/video-podcast-maker) — read 2026-10-15 — primary
192. [Code2Video](https://github.com/showlab/Code2Video) — read 2026-10-15 — primary
193. [Paper2Video](https://github.com/showlab/Paper2Video) — read 2026-10-15 — primary
194. [HeyGen release](https://www.heygen.com/blog/heygen-surpasses-200m-arr) — read 2026-10-15 — primary
195. [GitHub](https://github.com/Comfy-Org/ComfyUI) — read 2026-10-15 — primary
196. [Comfy docs](https://docs.comfy.org/tutorials/api-nodes/overview) — read 2026-10-15 — primary
197. [GitHub](https://github.com/tin2tin/Pallaidium) — read 2026-10-15 — primary
198. [LongCat](https://huggingface.co/meituan-longcat/LongCat-Video) — read 2026-10-15 — primary
199. [MAGI-1](https://github.com/SandAI-org/MAGI-1) — read 2026-10-15 — primary
200. [Mochi](https://huggingface.co/api/models/genmo/mochi-1-preview) — read 2026-10-15 — primary
201. [Step-Video](https://github.com/stepfun-ai/Step-Video-T2V) — read 2026-10-15 — primary
202. [Kandinsky 5](https://github.com/kandinskylab/kandinsky-5) — read 2026-10-15 — primary
203. [Open-Sora](https://github.com/hpcaitech/Open-Sora) — read 2026-10-15 — primary
204. [SkyReels-V2](https://github.com/SkyworkAI/SkyReels-V2/blob/main/LICENSE.txt) — read 2026-10-15 — primary
205. [LongLive](https://github.com/NVlabs/LongLive) — read 2026-10-15 — primary
206. [arXiv 2510.15831](https://arxiv.org/abs/2510.15831) — read 2026-10-15 — primary (paper)
207. [arXiv 2609.24997](https://arxiv.org/abs/2609.24997) — read 2026-10-15 — primary (paper)
208. [arXiv 2609.07720](https://arxiv.org/abs/2609.07720) — read 2026-10-15 — primary (paper)
209. [GitHub](https://github.com/Ironieser/CineCrew) — read 2026-10-15 — primary
210. [arXiv 2511.08521](https://arxiv.org/abs/2511.08521) — read 2026-10-15 — primary (paper)
211. [arXiv 2506.10540](https://arxiv.org/abs/2506.10540) — read 2026-10-15 — primary (paper)
212. [arXiv 2408.09787](https://arxiv.org/abs/2408.09787) — read 2026-10-15 — primary (paper)
213. [arXiv 2501.12909](https://arxiv.org/abs/2501.12909) — read 2026-10-15 — primary (paper)
214. [arXiv 2408.10453](https://arxiv.org/abs/2408.10453) — read 2026-10-15 — primary (paper)
215. [arXiv 2506.18899](https://arxiv.org/abs/2506.18899) — read 2026-10-15 — primary (paper)
216. [arXiv 2412.02259](https://arxiv.org/abs/2412.02259) — read 2026-10-15 — primary (paper)
217. [arXiv 2604.24842](https://arxiv.org/abs/2604.24842) — read 2026-10-15 — primary (paper)
218. [arXiv 2601.17737](https://arxiv.org/abs/2601.17737) — read 2026-10-15 — primary (paper)
219. [arXiv 2411.04925](https://arxiv.org/abs/2411.04925) — read 2026-10-15 — primary (paper)
220. [arXiv 2408.11788](https://arxiv.org/abs/2408.11788) — read 2026-10-15 — primary (paper)
221. [arXiv 2507.18634](https://arxiv.org/abs/2507.18634) — read 2026-10-15 — primary (paper)
222. [arXiv 2503.05242](https://arxiv.org/abs/2503.05242) — read 2026-10-15 — primary (paper)
223. [arXiv 2606.24107](https://arxiv.org/abs/2606.24107) — read 2026-10-15 — primary (paper)
224. [arXiv 2503.07314](https://arxiv.org/abs/2503.07314) — read 2026-10-15 — primary (paper)
225. [arXiv 2403.13248](https://arxiv.org/abs/2403.13248) — read 2026-10-15 — primary (paper)
226. [arXiv 2407.16655](https://arxiv.org/abs/2407.16655) — read 2026-10-15 — primary (paper)
227. [arXiv 2510.20822](https://arxiv.org/abs/2510.20822) — read 2026-10-15 — primary (paper)
228. [arXiv 2408.17424](https://arxiv.org/abs/2408.17424) — read 2026-10-15 — primary (paper)
229. [goveda](https://www.goveda.com/patent/CN-121982167-A) — read 2026-10-15 — search summary, unverified
230. [Zeely blog](https://zeely.ai/blog/creatify-ai-review/) — read 2026-10-15 — search summary, competitor
231. [Veo docs](https://ai.google.dev/gemini-api/docs/veo) — read 2026-10-15 — primary
232. [ltx.studio](https://ltx.studio/platform/script-to-video) — read 2026-10-15 — search summary
233. [VISTA paper](https://arxiv.org/html/2510.15831) — read 2026-10-15 — primary (paper)
234. [ViPer](https://arxiv.org/html/2407.17365v1) — read 2026-10-15 — primary (paper)
235. [Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/) — read 2026-10-15 — primary
236. [Campaign Asia](https://campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831) — read 2026-10-15 — search summary
237. [Adobe MAX](https://www.adobe.com/es/max.html) — read 2026-10-15 — search summary
238. [Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-intelligence-brings-powerful-ai-capabilities-into-everyday-experiences/) — read 2026-10-15 — search summary
239. [microsoft.ai](https://microsoft.ai/news/) — read 2026-10-15 — primary
240. [Wikipedia: Seedance 2.0](https://en.wikipedia.org/wiki/Seedance_2.0) — read 2026-10-15 — secondary
241. [Foley LICENSE](https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-Foley/main/LICENSE) — read 2026-10-15 — primary
242. [hailuoai.video](https://hailuoai.video) — read 2026-10-15 — primary
243. [Bloomberg](https://bloomberg.com/news/articles/2026-02-10/ai-video-startup-runway-valued-at-5-3-billion-with-new-funding) — read 2026-10-15 — search summary
244. [NVIDIA Research](https://research.nvidia.com/labs/toronto-ai/GEN3C/) — read 2026-10-15 — primary
245. [Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/08/17/higgsfield039s-valuation-soars-fourfold-to-54-billion-in-six-months-on-ai-content-demand) — read 2026-10-15 — secondary
246. [Times of Central Asia](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/) — read 2026-10-15 — secondary
247. [Midjourney changelog](https://updates.midjourney.com/alpha-changelog-10-7-26/) — read 2026-10-15 — primary
248. [Synthesia](https://www.synthesia.io/post/series-e-200-million-4-billion-valuation-future-work) — read 2026-10-15 — primary
249. [arXiv 2510.23163](https://arxiv.org/abs/2510.23163) — read 2026-10-15 — primary (paper)
250. [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) — read 2026-10-15 — primary
251. [OpenAI models](https://developers.openai.com/api/docs/models) — read 2026-10-15 — primary
252. [Boords pricing](https://boords.com/pricing) — read 2026-10-15 — primary
253. [StoryboardHero pricing](https://storyboardhero.ai/pricing) — read 2026-10-15 — primary
254. [Previs Pro pricing](https://previspro.com/pricing) — read 2026-10-15 — primary
255. [Wonder Unit](https://wonderunit.com/storyboarder/) — read 2026-10-15 — primary
256. [arena.ai](https://arena.ai/leaderboard/video/text-to-video) — read 2026-10-15 — search summary, unverified
257. [fal](https://fal.ai/learn/tools/what-is-seedance-2-5) — read 2026-10-15 — secondary
258. [LTX-2 licence](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x) — read 2026-10-15 — primary
259. [T2VTextBench](https://arxiv.org/abs/2505.04946) — read 2026-10-15 — primary (paper)
260. [VACE](https://github.com/ali-vilab/VACE) — read 2026-10-15 — primary
261. [Marey](https://www.moonvalley.com/marey) — read 2026-10-15 — primary
262. [HeyGen tool](https://www.heygen.com/en-gb/tool/ai-product-placement) — read 2026-10-15 — primary
263. [CameraCtrl](https://arxiv.org/abs/2404.02101) — read 2026-10-15 — primary (paper)
264. [Uni3C](https://arxiv.org/abs/2504.14899) — read 2026-10-15 — primary (paper)
265. [Diffusion as Shader](https://arxiv.org/abs/2501.03847) — read 2026-10-15 — primary (paper)
266. [GitHub](https://github.com/NVIDIA-AI-Blueprints/3d-guided-genai-rtx) — read 2026-10-15 — primary
267. [DiffusionRenderer](https://arxiv.org/abs/2501.18590) — read 2026-10-15 — primary (paper)
268. [I2V3D](https://arxiv.org/abs/2503.09733) — read 2026-10-15 — primary (paper)
269. [ReCamMaster](https://arxiv.org/abs/2503.11647) — read 2026-10-15 — primary (paper)
270. [Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3) — read 2026-10-15 — primary
271. [ElevenLabs use policy](https://elevenlabs.io/use-policy) — read 2026-10-15 — primary
272. [AA TTS](https://artificialanalysis.ai/text-to-speech/leaderboard) — read 2026-10-15 — primary
273. [ElevenLabs pricing](https://elevenlabs.io/pricing/api) — read 2026-10-15 — primary
274. [ElevenLabs models](https://elevenlabs.io/docs/overview/models) — read 2026-10-15 — primary
275. [Cartesia pricing](https://cartesia.ai/pricing) — read 2026-10-15 — primary
276. [Cartesia languages](https://cartesia.ai/languages) — read 2026-10-15 — primary
277. [Gemini TTS docs](https://ai.google.dev/gemini-api/docs/speech-generation) — read 2026-10-15 — primary
278. [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/models/bulbul) — read 2026-10-15 — primary
279. [Azure languages](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) — read 2026-10-15 — primary
280. [IndicF5](https://huggingface.co/api/models/ai4bharat/IndicF5) — read 2026-10-15 — primary
281. [Indic Parler-TTS](https://huggingface.co/api/models/ai4bharat/indic-parler-tts) — read 2026-10-15 — primary
282. [Chatterbox](https://huggingface.co/ResembleAI/chatterbox) — read 2026-10-15 — primary
283. [S2 Pro](https://huggingface.co/fishaudio/s2-pro) — read 2026-10-15 — primary
284. [AA vocals](https://artificialanalysis.ai/music/leaderboard/vocals) — read 2026-10-15 — primary
285. [Suno terms](https://suno.com/terms) — read 2026-10-15 — primary
286. [EDM.com](https://edm.com/industry/universal-sony-file-another-copyright-lawsuit-against-suno/) — read 2026-10-15 — search summary
287. [ElevenLabs music terms](https://elevenlabs.io/music-terms) — read 2026-10-15 — primary
288. [Suno pricing](https://suno.com/pricing) — read 2026-10-15 — primary
289. [dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026) — read 2026-10-15 — search summary
290. [Lyria docs](https://ai.google.dev/gemini-api/docs/music-generation) — read 2026-10-15 — primary
291. [Hugging Face](https://huggingface.co/ACE-Step/Ace-Step1.5) — read 2026-10-15 — primary
292. [Hugging Face](https://huggingface.co/api/models/facebook/musicgen-large) — read 2026-10-15 — primary
293. [ElevenLabs SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) — read 2026-10-15 — primary
294. [Adobe Premiere](https://www.adobe.com/products/premiere.html) — read 2026-10-15 — primary
295. [Hugging Face](https://huggingface.co/hkchengrex/MMAudio) — read 2026-10-15 — primary
296. [Licence](https://huggingface.co/tencent/HunyuanVideo-Foley/blob/main/LICENSE) — read 2026-10-15 — primary
297. [Hugging Face](https://huggingface.co/api/models/FunAudioLLM/ThinkSound) — read 2026-10-15 — primary
298. [sync. docs](https://sync.so/docs/models/lipsync) — read 2026-10-15 — primary
299. [HeyGen pricing](https://www.heygen.com/pricing) — read 2026-10-15 — primary
300. [BytePlus](https://www.byteplus.com/en/product/omnihuman) — read 2026-10-15 — primary
301. [LatentSync](https://huggingface.co/ByteDance/LatentSync-1.6) — read 2026-10-15 — primary
302. [MuseTalk](https://huggingface.co/TMElyralab/MuseTalk) — read 2026-10-15 — primary
303. [InfiniteTalk](https://huggingface.co/MeiGen-AI/InfiniteTalk) — read 2026-10-15 — primary
304. [EBU R128](https://tech.ebu.ch/docs/r/r128.pdf) — read 2026-10-15 — primary
305. [Descript pricing](https://www.descript.com/pricing) — read 2026-10-15 — primary
306. [Resolve what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew) — read 2026-10-15 — primary
307. [OpusClip pricing](https://www.opus.pro/pricing) — read 2026-10-15 — primary
308. [Eddie pricing](https://www.heyeddie.ai/pricing) — read 2026-10-15 — primary
309. [Remotion licence](https://www.remotion.pro/license) — read 2026-10-15 — primary
310. [Colourlab](https://www.colourlab.ai/) — read 2026-10-15 — primary
311. [CapCut materials licence](https://www.capcut.com/clause/materials-license-agreement) — read 2026-10-15 — primary
312. [T2V-CompBench](https://arxiv.org/html/2407.14505) — read 2026-10-15 — primary (paper)
313. [ImageReward](https://arxiv.org/html/2304.05977) — read 2026-10-15 — primary (paper)
314. [VideoPhy](https://arxiv.org/html/2406.03520) — read 2026-10-15 — primary (paper)
315. [GenAI-Arena](https://arxiv.org/html/2406.04485) — read 2026-10-15 — primary (paper)
316. [VBench-2.0](https://arxiv.org/html/2503.21755) — read 2026-10-15 — primary (paper)
317. [DSG paper](https://arxiv.org/html/2310.18235) — read 2026-10-15 — primary (paper)
318. [CameraCtrl](https://arxiv.org/html/2404.02101) — read 2026-10-15 — primary (paper)
319. [GitHub](https://github.com/google-marketing-solutions/abcds-detector) — read 2026-10-15 — primary
320. [CreativeX](https://www.creativex.com/products/creative-quality) — read 2026-10-15 — primary
321. [Vidmob](https://vidmob.com/creative-scoring) — read 2026-10-15 — primary
322. [DOVER licence](https://raw.githubusercontent.com/VQAssessment/DOVER/master/LICENSE) — read 2026-10-15 — primary
323. [CogVLM licence](https://huggingface.co/THUDM/cogvlm2-video-llama3-chat/blob/main/LICENSE) — read 2026-10-15 — primary
324. [PPD](https://arxiv.org/html/2501.06655) — read 2026-10-15 — primary (paper)
325. [BrandGuard](https://www.brandguard.ai/) — read 2026-10-15 — primary
326. [Hedra blog](https://cms.hedra.com/blog/best-ai-agents-content-creation) — read 2026-10-15 — search summary
327. [Typeface](https://www.typeface.ai/) — read 2026-10-15 — primary
328. [fal terms](https://fal.ai/terms) — read 2026-10-15 — primary
329. [Wikipedia: Seedance](https://en.wikipedia.org/wiki/Seedance) — read 2026-10-15 — secondary
330. [Wikipedia: Kling AI](https://en.wikipedia.org/wiki/Kling_AI) — read 2026-10-15 — secondary, unverified
331. [Runway Gen-4.5](https://runway.com/research/introducing-runway-gen-4.5) — read 2026-10-15 — primary
332. [Runway Aleph](https://runway.com/research/introducing-runway-aleph) — read 2026-10-15 — primary
333. [Google blog](https://blog.google/technology/ai/veo-updates-flow/) — read 2026-10-15 — primary
334. [hermoso.ai](https://hermoso.ai/blog/why-ai-ads-look-fake/) — read 2026-10-15 — search summary
335. [arXiv 2501.09038](https://arxiv.org/abs/2501.09038) — read 2026-10-15 — primary (paper)
336. [arXiv 2608.28122](https://arxiv.org/abs/2608.28122) — read 2026-10-15 — primary (paper)
337. [NBC Miami](https://www.nbcmiami.com/news/national-international/coca-cola-ai-generated-holiday-ad-backlash/3716580/) — read 2026-10-15 — secondary
338. [IPWatchdog](https://ipwatchdog.com/2025/01/29/part-two-copyright-office-ai-report-says-creative-prompting-doesnt-constitute-authorship/) — read 2026-10-15 — search summary
339. [Mishcon de Reya](https://www.mishcon.com/news/copyright-and-ai-the-uk-governments-report) — read 2026-10-15 — secondary, law-firm note
340. [IAB](https://www.iab.com/insights/the-ai-ad-gap-widens/) — read 2026-10-15 — primary
341. [PPC Land](https://ppc.land/freewheel-finds-48-of-buyers-overrate-viewer-dislike-of-ai-ads/) — read 2026-10-15 — search summary
342. [letsdatascience](https://letsdatascience.com/blog/bytedances-seedance-2.0-spooked-all-of-hollywood-in-72-hours) — read 2026-10-15 — secondary
343. [Shardul Amarchand Mangaldas](https://www.amsshardul.com/wp-content/uploads/2026/02/Legislative-Update-IT-Rules-Amendment.pdf) — read 2026-10-15 — secondary, law-firm note
344. [ASA](https://www.asa.org.uk/news/ai-and-deepfakes-four-things-advertisers-need-to-know-before-they-hit-run.html) — read 2026-10-15 — primary
345. [ASCI text](https://foxmandal.in/wp-content/uploads/2026/09/Guidelines-for-Responsible-Labelling-of-Synthetically-Generated-Content-in-Advertising.pdf) — read 2026-10-15 — primary
346. [Khaitan](https://www.khaitanco.com/sites/default/files/2026-10/Ergo_ASCI%20Guidelines%20on%20SGC%20Labelling_12%2010%202026.pdf) — read 2026-10-15 — secondary, law-firm note
347. [e4m](https://www.exchange4media.com/advertising-news/asci-issues-guidelines-on-responsible-labelling-of-ai-generated-ad-content-158710.html) — read 2026-10-15 — search summary
348. [RPC](https://www.rpclegal.com/snapshots/advertising-and-marketing/summer-2025/cap-issues-guidance-on-use-of-ai-in-ads/) — read 2026-10-15 — search summary
349. [SpicyIP](https://spicyip.com/2026/07/training-chatgpt-on-copyrighted-works-prima-facie-protected-under-indian-copyright-act-delhi-high-court-refuses-interim-injunction-against-openai.html) — read 2026-10-15 — secondary
350. [Mondaq](https://www.mondaq.com/india/copyright/1718746/exploring-the-dpiits-working-paper-on-generative-ai-and-copyright) — read 2026-10-15 — search summary
351. [Reed Smith](https://www.reedsmith.com/articles/uk-copyright-and-ai-report-the-opt-out-is-dead-but-what-comes-next/) — read 2026-10-15 — secondary, law-firm note
352. [SCC Online](https://www.scconline.com/blog/post/2025/10/03/bombay-hc-grants-interim-injunction-to-asha-bhosle-protecting-her-personality-rights-orders-blocking-of-infringing-websites-platforms-and-youtube-videos/) — read 2026-10-15 — search summary
353. [Mondaq](https://www.mondaq.com/ai-deepfakes-and-image-rights-does-english-law-protect-your-face-voice-and-likeness/1846956) — read 2026-10-15 — search summary
354. [Wikipedia](https://en.wikipedia.org/wiki/Synthesia_%28company%29) — read 2026-10-15 — secondary, unverified
355. [eMarketer](https://www.emarketer.com/content/nearly-40--of-video-ads-will-use-genai-by-2026--says-iab) — read 2026-10-15 — search summary
356. [e4m](https://www.exchange4media.com/advertising-news/ai-can-cut-costs-but-not-replace-emotions-asserts-industry-148618.html) — read 2026-10-15 — search summary
357. [Yahoo](https://www.yahoo.com/entertainment/articles/chaotic-kalshi-ad-during-nba-173937071.html) — read 2026-10-15 — secondary
358. [MediaNews4U](https://www.medianews4u.com/ai-can-make-batas-ads-can-it-make-bata-desirable-prathap-suthan-asks/) — read 2026-10-15 — secondary
359. [IRPR](https://irpr.agency/blog/30-second-tv-commercial-cost-2026-from-3-lakh-to-3-crore-what-you-get) — read 2026-10-15 — secondary
360. [Lambda Films](https://www.lambdafilms.co.uk/cost-to-advertise-on-tv-2/) — read 2026-10-15 — search summary
361. [GII Korea](https://www.giikorea.co.kr/report/grvi1942046-ai-video-generator-market-size-share-trends.html) — read 2026-10-15 — search summary
362. [Adwave](https://adwave.com/resources/ai-video-generation-statistics-2026) — read 2026-10-15 — secondary
363. [Sensor Tower](https://sensortower.com/blog/predictions-digital-economy-2026) — read 2026-10-15 — primary
364. [iTiger](https://www.itiger.com/news/1160238640) — read 2026-10-15 — secondary
365. [Synthesia](https://www.synthesia.io/post/100-million-revenue-adobe-investment) — read 2026-10-15 — search summary
366. [Dealroom](https://dealroom.co/news/126961-fal-targets-8b-valuation-in-new-raise-as-ai-inference-revenue-doubles-to/) — read 2026-10-15 — secondary
367. [Wikipedia](https://en.wikipedia.org/wiki/Runway_%28company%29) — read 2026-10-15 — secondary
368. [SiliconANGLE](https://siliconangle.com/2025/05/15/ai-video-platform-hedra-raises-32m-build-digital-character-foundation-models/) — read 2026-10-15 — search summary
369. [Creatify blog](https://creatify.ai/blog/announcing-our-15-5m-series-a-a-new-chapter-for-creatify) — read 2026-10-15 — primary
370. [InsideHPC](https://insidehpc.com/2025/07/moonvalley-raises-84m-for-ai-video-model/) — read 2026-10-15 — search summary
371. [TNGlobal](https://technode.global/2025/08/08/kamet-capital-invests-8-4m-in-singapores-ai-avatar-platform-topview/) — read 2026-10-15 — secondary
372. [Fortune](https://fortune.com/2025/08/07/exclusive-decart-raises-100-million-at-a-3-1-billion-valuation-chasing-the-future-of-real-time-creative-ai) — read 2026-10-15 — search summary
373. [SiliconANGLE](https://siliconangle.com/2025/10/30/figma-acquires-ai-design-startup-weavy-reported-200m/) — read 2026-10-15 — search summary
374. [Bloomberg](https://www.bloomberg.com/news/articles/2025-11-19/saudi-s-humain-backs-ai-video-startup-luma-at-4-billion-value) — read 2026-10-15 — search summary
375. [Latham & Watkins](https://www.lw.com/en/news/2025/12/latham-watkins-advises-black-forest-labs-in-series-b) — read 2026-10-15 — search summary
376. [Net Influencer](https://www.netinfluencer.com/arcads-ai-secures-16m-seed-funding-to-expand-ai-video-creation-platform/) — read 2026-10-15 — search summary
377. [Malay Mail](https://malaymail.com/news/money/2026/01/09/chinese-ai-unicorn-minimax-surges-109pc-in-hong-kong-ipo-nets-us619m/204847) — read 2026-10-15 — search summary
378. [MBW](https://www.musicbusinessworldwide.com/elevenlabs-creator-of-suno-rival-eleven-music-raises-500m-at-11bn-valuation) — read 2026-10-15 — secondary
379. [TechCrunch](https://www.techcrunch.com/2026/02/23/canva-acquires-startups-working-on-animation-and-marketing/) — read 2026-10-15 — secondary
380. [Trending Topics](https://trendingtopics.eu/mirage-raises-75m-to-push-ai-video-app-captions-into-asian-markets/) — read 2026-10-15 — search summary
381. [Variety AU](https://au.variety.com/2026/biz/global/netflix-acquires-ben-affleck-ai-filmmaking-startup-interpositive-33884) — read 2026-10-15 — search summary
382. [Investgame](https://investgame.net/news/decart-raises-300m-series-b-at-4b-valuation) — read 2026-10-15 — search summary
383. [Runway](https://runway.com/news/runway-and-lionsgate-expand-partnership) — read 2026-10-15 — primary
384. [Wikipedia](https://en.wikipedia.org/wiki/House_of_David_%28TV_series%29) — read 2026-10-15 — secondary
385. [Coca-Cola](https://www.coca-colacompany.com/media-center/coca-cola-refreshes-givers-of-the-season-embraces-ai-powered-storytelling-in-global-holiday-campaign.html) — read 2026-10-15 — primary
386. [RetailDetail](https://www.retaildetail.eu/news/food/mondelez-achieves-significant-savings-on-marketing-expenditure-thanks-to-ai/) — read 2026-10-15 — secondary
387. [Manifest Media](https://manifest-media.in/advertising/140526/ogilvy-india-and-google-launch-ai-creative-studio-for-brand-storytelli.html) — read 2026-10-15 — search summary
388. [Social Samosa](https://www.socialsamosa.com/industry-updates/dentsu-video-first-content-engine-dentsu-amp-10623913) — read 2026-10-15 — secondary
389. [Ads of the World](https://www.adsoftheworld.com/campaigns/ai-durga-puja-brand-video) — read 2026-10-15 — secondary
390. [Impact](https://www.impactonnet.com/more-from-impact/tata-tea-gold-and-monks-launch-banglarshilpishojjitopujo-campaign-for-durga-puja-11922.html) — read 2026-10-15 — search summary
391. [Hollywood Reporter India](https://www.hollywoodreporterindia.com/features/insight/anurag-kashyap-slams-collective-artists-network-founder-vijay-subramaniam-for-producing-ai-generated-film) — read 2026-10-15 — secondary
392. [Decrypt](https://decrypt.co/332658/indian-production-company-backlash-ai-altered-film) — read 2026-10-15 — secondary
393. [Advanced Television](https://www.advanced-television.com/2026/08/04/research-7-in-10-uk-advertisers-exceed-production-budgets/embed/) — read 2026-10-15 — secondary
394. [TIMEWELL](https://timewell.jp/en/columns/openai-sora20) — read 2026-10-15 — search summary
395. [Cliprise](https://www.cliprise.app/news/sora-2-launch) — read 2026-10-15 — search summary
396. [The Drum](https://www.thedrum.com/news/the-most-terrible-ad-of-the-year-mcdonald-s-pulls-ai-ad) — read 2026-10-15 — search summary
397. [ToolJunction](https://www.tooljunction.io/ai-tools/invideo/company) — read 2026-10-15 — unverified
398. [Latka](https://getlatka.com/companies/invideo) — read 2026-10-15 — unverified
399. [mer.vin](https://mer.vin/news/minimax-h3-open-weight-video-model-blocked-us-eu-uk/) — read 2026-10-15 — secondary
400. [BitsMinds](https://www.bitsminds.com/news/higgsfield-supercomputer-cloud-native-ai-agent-2026) — read 2026-10-15 — search summary
401. [research.google](https://research.google/pubs/vista-towards-test-time-self-improving-video-generation-agent/) — read 2026-10-15 — search summary
402. [Maginative](https://www.maginative.com/wonder-studios-raises-12m-to-build-ai-production-company) — read 2026-10-15 — search summary
