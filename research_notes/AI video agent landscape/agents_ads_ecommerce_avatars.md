# AI video agents and pipelines for ads, e-commerce, UGC-style social ads and avatars / presenters

Scope: products sold to make ad, e-commerce, UGC-style and avatar/presenter video, checked against Das Production's four promises (one prompt in; it understands; it does everything; the person likes the result). Market lens: India and UK.

Conventions used below:
- Every URL was read (WebFetch) or searched (WebSearch) on **2026-10-15** unless another date is given.
- Source tags: **(primary)** = the company's own page, terms or press release, read in full by the fetch tool; **(secondary)** = news, review, reseller or competitor page read in full; **(search summary)** = the fact came from a search engine's summary, not from the page itself; **(unverified)** = could not be confirmed, or user reviews that the host site says it does not verify.
- Stage tags: **[GA]** shipped and on sale; **[beta]**; **[announced]** press release or "coming soon" only; **[defunct]**.
- Research limit: the shared web-search budget for this run ran out partway through (200 searches per turn across all agents). Products not searched for as a result are listed under Gaps. The person can send a follow-up to continue.

## Q1. What each product really does end to end (output, quality, manual work, product handling, questions / self-checks / brand kits, price, audience)

### Takeaway
Every product sold as an "AI ad agent" today does one slice well: a script, an avatar or AI actor talking, B-roll, captions and stock music, in social sizes, at volume. None documents asking clarifying questions, judging its own output for taste, or grading colour. The real product mostly gets in through an uploaded image that is regenerated (image-to-video or "product placement"), and reviewers report warped labels.

### Cited Findings

**Creatify (incl. Creative Agent, "Ad Agent + Automations", AdMax)**
- Pricing page lists Standard $12/mo (55 credits, videos up to 2 min, 1 seat), Pro $44/mo (280 credits, up to 10 min), Max $76/mo (730 credits, 3 seats), Business $156/mo (1,500+ credits, 10 seats), Enterprise custom. These are shown as struck-through discounts from $15/$55/$95/$195, under a "Save 20% on annual plan" banner that does not say which price is annual. API Starter $99/mo, API Pro $299/mo. Export resolution not stated — [Creatify pricing](https://creatify.ai/pricing) (primary)
- "Creative Agent" is listed under Creation. "Ad Agent + Automations" is included in Pro and Max but not Standard. AI Actor library: 300 (Standard) and 1,500 (Pro and up). "Brand Spaces": 1 to 10 by plan. No "brand kit" by that name. FAQ: "You own all of your creatives, even after your plan ends" — [Creatify pricing](https://creatify.ai/pricing) (primary)
- AdMax page: an agent called "Max" benchmarks competitors, "spin[s] up 100+ creatives", runs creative tests, gives insights on hooks, formats, CTAs, lengths and fatigue, and tracks competitor trends across Meta. It connects to your Meta account and uses past Meta campaign data to recommend creatives. TikTok launch is not mentioned. Pricing is "Let's talk" / book a demo. Clarifying questions and product fidelity are not addressed. Brand assets: "upload your brand assets (or let AdMax help)" — [Creatify AdMax](https://creatify.ai/admax) (primary)
- AdMax customer claim: 1MORE (Global Marketing Manager "Celine") reports 80% lower UGC video costs and "3x more AI-generated UGC video assets" — [Creatify AdMax](https://creatify.ai/admax) (primary; testimonial)
- Hands-on review: an Amazon Crock-Pot URL went to "Analyze URL", then the reviewer edited the auto-filled product details, picked an avatar and visual style, edited and rendered (5 credits). Verdict: realistic avatar and voice and well-matched B-roll, but an avatar glitch midway made it read as AI. It lacks advanced editing and "the creative touch of human-produced content". The article carries affiliate links. Published 5 Nov 2024, updated 30 Mar 2026 — [Unite.AI Creatify review](https://www.unite.ai/creatify-review/) (secondary, affiliate)
- A competitor review says Creative Agent launched May 2026, writes scripts, picks avatars and assembles an ad set, and that the credit cost "depends on prompt complexity and how many generation attempts" (you learn the price after the run). It also warns that URL extraction can "invent claims" — [Zeely blog: Creatify review](https://zeely.ai/blog/creatify-ai-review/) (search summary; competitor)
- Trustpilot: 3.8/5 from 838 reviews. Recent complaints (Aug to Oct 2026) about billing: annual charges and charges after cancelling. Quality complaints: "face changed into a different person while she was moving" (12 Sep 2026); a truck appearing to drive backward and a voiceover in the wrong gender (3 Sep 2026). Credits: "200 coins for a video" with a poor result — [Trustpilot: Creatify](https://www.trustpilot.com/review/creatify.ai) (unverified user reviews)
- Who it is for: performance marketers and DTC/app advertisers who need many paid-social variants. Inferred from AdMax and pricing positioning ([AdMax](https://creatify.ai/admax), primary).

**HeyGen (Video Agent, Avatar IV/V, Product Placement)**
- Video Agent: a text prompt (500-character limit shown), a chosen length (60 s shown) and orientation produce a script, visuals paired to each scene, voiceover, edits and transitions, motion graphics, B-roll and AI presenter footage. Output up to 1080p or 4K, with a scene-by-scene preview. "Refine through conversation." Brand colours and typography "apply automatically". Text, position, colour, timing and layout stay editable in AI Studio. The page states no models, no clarifying-question behaviour, no product/logo upload and no launch date — [HeyGen Video Agent](https://www.heygen.com/video-agent) (primary)
- Pricing: Free $0 (1-min videos, 3/mo), Creator $29/mo ($24 annual), Pro $49/mo, Business $149/mo (+$20 per seat), Enterprise custom. FAQ: the Free plan has "limited trial access to Video Agent". The plan tables do not list Video Agent per tier, and the Creator card says 1080p while the table says up to 4K — [HeyGen pricing](https://www.heygen.com/pricing) (primary)
- Product Placement: you upload a product image (720p+, centred, front-facing; a render or 3D mock-up is allowed) plus a face photo, and the Avatar IV engine "combines them". HeyGen claims the product is set into the scene "at the pixel level rather than pasting it on top", matching lighting, shadows, reflections and scale. The page gives no evidence for this. "You own the videos and can publish them directly to your ad accounts" — [HeyGen AI Product Placement](https://www.heygen.com/en-gb/tool/ai-product-placement) (primary)
- HeyGen help content: Product Placement is paid-only (Creator, Teams, Enterprise). Two models: Avatar IV (single scene) or Veo 3.1 (multi-scene). Small hand-held products such as a phone or bottle work best — [HeyGen community: product placement](https://community.heygen.com/public/resources/product-placement-create-avatars-including-products) (search summary)
- Independent test of Product Placement (Jeff Foster, 14 Sep 2025): "the text on the can is distorted and illegible when zoomed in". Voice controls are "quite robotic in their raw form". A Midjourney model with a Photoshop-edited product also came out distorted. A different workflow eventually gave him the result he wanted — [ProVideo Coalition](https://www.provideocoalition.com/ai-tools-heygen-avatar-iv-gets-real/) (secondary, independent)
- Platform direction: Avatar V (from a 15-second source video), HeyGen MCP, and HyperFrames, which HeyGen calls an Apache 2.0 open-source framework for agentic video creation (21,600 GitHub stars in its first month). Company says it shipped 63 products and features in three months — [HeyGen $200M ARR release, 25 Jun 2026](https://www.heygen.com/blog/heygen-surpasses-200m-arr) (primary)
- Who it is for: everyone from solo creators to the Fortune 100. The examples HeyGen gives are course creators, realtors and YouTube educators, not ad agencies ([HeyGen release](https://www.heygen.com/blog/heygen-surpasses-200m-arr), primary).

**Arcads**
- Homepage: 1,000+ AI actors or your own avatar; "avatar holding your product, showing your app, or wearing your clothes"; emotion set by text; translation into 30+ languages; a "Create Workflow" infinite canvas; ad presets. Models offered: Seedance (incl. 2.5), Seedream, Nano Banana, GPT Image, Kling. "AI video editing" (B-roll, music, captions, transitions in one click) is marked **"Soon!"**. "Build your own AI Agent for marketing" appears as a heading with no detail. No prices on the page — [Arcads home](https://www.arcads.ai/) (primary)
- Pricing page: https://www.arcads.ai/pricing returned HTTP 404 — [Arcads pricing](https://www.arcads.ai/pricing) (primary, not reachable). A third-party figure of about $110/mo, which Lamina says has no public pricing page behind it — [Lamina comparison, 25 Sep 2026](https://uselamina.ai/blog/best-ai-video-agents-for-ecommerce-in-2026) (secondary; Lamina is a competing vendor). **Price: needs checking.**
- Trustpilot: 2.6/5 from 187 reviews (49% one-star). "Videos produced look NOTHING like their ads - glitchy/not lip synced & clearly AI" (15 Jan 2026). Output "720p and soft" with a generic character off brief (27 Sep 2026). One small fix triggered a full re-render of about 3,000 credits (27 Sep 2026). A minimum of £425/month for own-video lip-sync (2 Oct 2026). One positive review (9 Oct 2026) says connecting Arcads to Claude Code sped up ad creation, but "strategy and human review are still needed" — [Trustpilot: Arcads](https://www.trustpilot.com/review/arcads.ai) (unverified user reviews)
- An older Dealroom profile said Arcads "does not support showcasing physical products with AI actors" — [Dealroom: Arcads](https://app.dealroom.co/companies/arcads_ai) (search summary). The current homepage now advertises product holding ([Arcads](https://www.arcads.ai/), primary), so the profile looks out of date.
- Who it is for: "Fast growing D2C brands, $1B mobile app studios, top marketing agencies". Logos on the page (Asana, ClickFunnels, Bending Spoon, etc.) are not stated to be customers — [Arcads home](https://www.arcads.ai/) (primary)

**Synthesia (incl. "Syren" agent)**
- Plans: Basic $0 (10 min video, watermark), Starter $29/mo ($18/mo billed yearly), Pro $89/mo ($64/mo billed yearly), Enterprise custom. The page itself is inconsistent on annual credits. The AI video agent "Syren" is listed on all plans, with a limited-time promo of 2,000 Syren-only credits, and Syren videos are capped at 3 minutes. Brand kits are listed under Enterprise. Dubbing covers 70+ languages (140+ on Enterprise). About 100 credits per finished minute — [Synthesia pricing](https://www.synthesia.io/pricing) (primary)
- Positioning: corporate training and internal knowledge. Named clients Bosch, Merck, SAP. Interactive AI "agents" are a "core strategic focus". Marketing or ads are not mentioned — [TechCrunch, 26 Jan 2026](https://techcrunch.com/2026/01/26/synthesia-hits-4b-valuation-lets-employees-cash-in) (secondary)

**Mirage (formerly Captions the company; Captions app, Mirage Studio)**
- The company rebranded from Captions to Mirage in September 2025 to position itself as a video-model research lab. Mirage Studio (ads/brands, launched June 2025) was folded under the Mirage name, and the Captions app kept its name — [Yahoo/TechCrunch](https://finance.yahoo.com/news/captions-rebrands-mirage-expands-beyond-153915128.html); [Net Influencer](https://www.netinfluencer.com/captions-rebrands-as-mirage-in-pivot-to-ai-video-research/) (search summary)
- The current mirage.app homepage lists Captions ("Your workspace for making video"), "Tesseract — professional creative tools for your AI agent" (linked to a social-ads use case) and APIs. It describes a future studio where "agents turn direction into films, soundtracks, and 3D scenes" with no timeline, and does not name Mirage Studio — [mirage.app](https://mirage.app/) (primary)
- Captions pricing (the page says "iOS plans only"): Max $24.99/mo (500 credits, digital twins / custom AI actors), Frontier $69.99, Frontier 2x $139.99, Frontier 4x $279.99, Enterprise custom. "AI Ads" appears in the comparison table — [Captions pricing](https://www.captions.ai/pricing) (primary)
- Who it is for: mobile-first creators and small businesses. The web marketing suite targets SMBs making marketing video in bulk — [Yahoo/TechCrunch, 24 Mar 2026](https://finance.yahoo.com/sectors/technology/articles/mirage-raises-75m-continue-building-130000702.html) (secondary)

**Icon (icon.me / icon.com), "AI Admaker" / "AI CMO"**
- Pitched as "ChatGPT + CapCut, but for making winning ads"; the "AI CMO" would suggest and auto-launch Meta ad variations — [Sacra: Icon](https://sacra.com/c/icon/) (secondary); [Kennan Davison on X](https://x.com/kennandavison/status/1886836061378372064) (search summary)
- **Appears shut down.** As of 5 Mar 2026, icon.com showed a Vercel password prompt, the team appeared to have left by Feb 2026, and Trustpilot/Reddit reviewers reported billing and cancellation problems. There was no formal announcement and no confirmed bankruptcy filing — [Tech Startups, 5 Mar 2026](https://techstartups.com/2026/03/05/icon-the-ai-ad-startup-shuts-down-after-spending-12m-on-the-icon-com-domain/) (secondary; indirect evidence)

**Topview AI (Singapore)**
- Plans on the pricing page: Plus $36/mo billed annually ($432/yr, 100 credits/mo); Business $44/mo ($528/yr, 3,000 credits/yr); Ultra $50/mo ($599.90/yr); Team $56/seat/mo; Enterprise custom with "legal indemnification" and "No training on your data". Models: Seedance 2.5/2.0, Veo 3.1 Fast, Kling 2.6/O1, Wan 3.0, MiniMax, Nano Banana, GPT Image. Sora is not listed. Product Avatar (unlimited saved), 5,000+ public avatars, Avatar 4 up to 180 s, lip sync up to 30 min, MCP and API. The Brand Kit sits in the Team plan. "Unlimited" generation is web-only, for "personal, human use only", and automation is prohibited — [Topview pricing](https://www.topview.ai/pricing) (primary)
- Hands-on (30 Sep 2026, Free plan): the "AI Marketer" agent returned a five-shot plan in about one minute from a brief (15 s, 9:16, UGC, women 25–35) and a product photo. The run log said "Failed to read file.webp", so the agent probably planned from text alone and did not stop or say so. The Product Avatar image took more than 16 minutes, not the estimated 2. The Free plan stops before video, so the product's fidelity in video was not tested. The reviewer advises checking the script against the product page, and downloading and uploading to ad platforms yourself — [Promer AI review](https://promer.ai/blog/topview-ai-review) (secondary; Promer sells a competing product)
- Product Avatar and AnyShoot 2.0: "only one product image" is needed. Avatars "physically" catch, hold and demonstrate the product — [TNGlobal, 8 Aug 2025](https://technode.global/2025/08/08/kamet-capital-invests-8-4m-in-singapores-ai-avatar-platform-topview/) (secondary)

**Zeely**
- An AI ad platform that generates creatives and launches them on Facebook/Instagram, with performance tracking, AI forecasts, recommendations and A/B testing. "No marketing experience is needed." Plans: Starter $29.95/mo, Plus $49.95, Growth $79.95 (reduced from $49.95/$89.95/$149.95). The FAQ also says "from $19.99". Ads run through Zeely carry extra charges "potentially" up to 12%. No user counts or case data on the page — [Zeely pricing](https://zeely.ai/pricing) (primary)

**Pencil (The Brandtech Group)**
- Core $14/mo ($11 annual, 50 generations), Growth $55/mo ($44 annual, 250), Pro custom (bulk generation from feeds, brand workspaces, AI governance, IP assignment, "no train"). Models from Anthropic, OpenAI, Google, Kling "and others". In the comparison table, **AI video generation, AI video cutdowns and the AI video editor all read "Coming soon"**, while a testimonial says Veo is reached via Pro. The page recommends uploading a brand kit with logos, fonts and colours — [Pencil pricing](https://www.trypencil.com/pricing) (primary)
- Agents for image, video, beauty shots, ad improvement, consumer insights, personas, campaign ideation, brand strategy and media planning. A review says it handles motion-graphic and product-showcase video but "does not generate convincing talking-head testimonials or emotionally resonant narrative video". It distributes to 7 ad platforms but does not manage bids or budgets — [AdLibrary review 2026](https://adlibrary.com/posts/pencil-ai-review-2026); [toolsforhumans](https://www.toolsforhumans.ai/ai-tools/pencil-ai) (search summary)

**Omneky**
- Public API and MCP server (13 Jul 2026): a brand URL goes in, and "finished, ready-to-launch ad creative" comes out in 1:1, 4:5, 9:16 and 16:9, including UGC-style and short-form video. It needs "zero prompting", reads positioning, colours and fonts from the site, and regenerates creative from performance data and creative scoring. The MCP server works with Claude. Pricing and availability are not stated — [Omneky newsroom](https://www.omneky.com/newsroom/omneky-public-api-mcp-server-ai-advertising-everywhere) (primary)
- Pricing "starts in the low hundreds per month" and scales with ad spend and seats; aimed at mid-market e-commerce/DTC — [Omniconvert comparison](https://www.omniconvert.com/nexus/compare/omneky-vs-pencil/) (search summary; competitor-authored). **Price: needs checking.**

**AdCreative.ai (owned by Appier)**
- Pricing page https://www.adcreative.ai/pricing returned 404. Third-party figures: Starter about $39/mo (statics only), Professional $249/mo (video features), Ultimate $999/mo. Credits are consumed on download, and the per-video credit cost is not published — [shhots.ai](https://shhots.ai/blog/adcreative-ai-pricing/); [superscale](https://superscale.ai/alternatives/adcreative.ai/pricing) (search summary; conflicting). **Price: needs checking.**

**Amazon Ads Video Generator** (platform-native; relevant to India and UK sellers)
- One product image or video plus an ASIN (it also draws on detail pages and A+ content) produces up to six multi-scene 15-second videos with text animation and music. Advertisers can set headlines, fonts, colours and logo placement. No added cost. Sponsored Brands video campaigns only, through Creative Studio. Expanded on 11 Nov 2025 to Canada, Mexico, **India, the UK**, Germany, Spain, Italy and France as an **Open Beta**. The page does not say how product accuracy is kept — [Amazon Ads announcement](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns) (primary)
- Available to all US advertisers from 10 Jun 2025, after a Sept 2024 beta that made 8-second low-motion clips from one image — [Amazon Ads: video generator](https://advertising.amazon.com/library/news/video-generator) (search summary)

**Akool**
- Pricing (yearly, per seat): Starter $12/mo, Pro $21, Pro Max $41.30, Business $174.30, Enterprise custom. "Video Agent & Agentic Canvas" is on all plans, along with an "E-commerce Product Ads" tool, Seedance 2.0/2.5 and Kling 3.0. **Licence column: "Personal" for Starter, Pro and Pro Max; "Business" only from the $174.30 Business tier.** Up to 60 min per video on Business — [Akool pricing](https://akool.com/pricing) (primary)

**Hedra**
- Basic $20/mo, Pro $50, Ultra $100, Teams $75, Enterprise custom, all listing "Commercial use". The pricing page names no ad or product features — [Hedra pricing](https://www.hedra.com/pricing) (primary)
- Character-3 is an "omnimodal" model for character performance video (spokespeople, mascots). The 2025 Series A was framed as moving from creators to enterprise marketers — [Unite.AI](https://www.unite.ai/hedra-raises-32m-to-power-the-future-of-generative-video-with-lifelike-digital-characters/); [CFOtech](https://cfotech.co.uk/story/hedra-raises-major-funding-boost-to-expand-ai-video-platform) (search summary)

**Tavus**
- A developer API for real-time "Conversational Video Interface" (CVI) agents plus some video generation minutes. Plans: Free, Starter $22/mo, Builder $59, Growth $397, Business $975, Enterprise custom (an older Starter $59 / Growth $397 table also sits on the page). No marketing-video product is described — [Tavus pricing](https://www.tavus.io/pricing) (primary). Not an ad-production agent.

**D-ID**
- The pricing page read shows no plan prices, only that minutes round up to 15 s, do not roll over, and Trial/Lite carry watermarks — [D-ID pricing](https://www.d-id.com/pricing/) (primary)
- Third-party: Lite from $4.70/mo annual (personal use only), Pro $16/mo annual or $29 monthly (commercial rights start here), Advanced around $108/mo — [Creatify blog on D-ID pricing](https://creatify.ai/blog/d-id-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay); [Argil blog](https://argil.ai/blog/d-id-pricing) (search summary; both are competitors). **Price: needs checking.**

**Colossyan**
- Starter free; Professional $59/mo billed yearly; Enterprise custom. Positioned for "training and enablement" (SCORM, LMS), with conversational avatars on Enterprise only. Marketing is not targeted — [Colossyan pricing](https://www.colossyan.com/pricing) (primary)

**Hour One**
- Acquired by Wix on 23 May 2025 (terms undisclosed); the technology is folded into Wix's site tools. No longer a standalone ad-video vendor — [Techleap](https://finder.techleap.nl/news/note/wix-acquires-hour-one-boosting-its-generative-ai-ambitions) (search summary)

**MakeUGC**
- An avatar holds, applies or drinks the product from an uploaded photo. Third-party pricing runs $49 to $119/mo for 5 to 20 videos, and product-in-hand is limited to the Growth/Pro tiers. A 2026 review flags inconsistent lip-sync, "raw video-only output (no captions, music, or B-roll built in)" and a disputed refund policy — [Fluxnote review](https://fluxnote.io/guides/makeugc-ai-review); [Superscale](https://superscale.ai/alternatives/makeugc/review) (search summary). **Price: needs checking.**

**Smartly.io (AI Studio)**
- "AI-powered scene generation, video assembly, and text-to-speech" to turn product shots into ads; background removal, cropping, upscaling, "brand-safe automation". No agents, models, pricing or fidelity statement; demo only. Case results: Kavak (41% lower CPL, 46% higher CTR via AI Scene Generation), S360/NiceHair, Foot Locker (28% lower CPA) — [Smartly AI Studio](https://smartly.io/product/ai-studio) (primary; vendor case claims)

**Typeface**
- "Arc Agents" for email, web, ads, images, video and brand workflows. Typeface says it uses Gemini Flash 2.5 and Veo 3 for video. Earlier video work came through the TensorTour acquisition — [Typeface blog, Sep 2024](https://typeface.ai/blog/accelerating-ai-content-lifecycle-transformation-unveiling-typeface-arc-agent-strategic-acquisitions-and-multimodal-product-innovation) (search summary). Current pricing and video output: **needs checking.**

**Vidmob**
- Vidmob360 (launched 10 Jun 2026): MCP services, APIs and agents that let Claude, Gemini or ChatGPT **evaluate creative against brand guidelines** using creative-performance data. It does not generate video — [CustomerThink](https://customerthink.com/vidmob-launches-vidmob360-bringing-creative-intelligence-into-the-ai-advertising-era/); [Adweek wire](https://www.adweek.com/adweek-wire/vidmob-launches-vidmob360/) (search summary)

**Celtra**
- Only a 2026 "vision" resource page: GenAI speeds execution "while keeping creative on brand", with no product specifics — [Celtra 2026 vision](https://celtra.com/resource/celtra-creative-automation-2026-vision/) (search summary)

**Boolv (Boolvideo), Mintly, Pexo, Lamina, Pippit and others**
- Boolv: a Shenzhen e-commerce product-video tool founded 2021; no third-party case studies with verifiable results — [Airframe analysis](https://www.airframe.ai/product/boolv-tech/analysis); [CB Insights](https://www.cbinsights.com/investor/boolv) (search summary)
- Mintly (Flame Industries): upload a product image to get static or video ads, aimed at Shopify, Amazon and TikTok Shop sellers. Vendor claims only — [Microsoft AppSource listing](https://appsource.microsoft.com/en-us/product/web-apps/flameindustriesinc1739473666491.instaclip-ai) (search summary)
- Pexo: positioned as an "end-to-end AI video agent for brand-governed production" but "not documented as a URL-to-video or one-tap publishing tool". Lamina: product images and video from a product shot and brand kit, from $19/mo. Pippit (ByteDance/CapCut): product link to vertical UGC ad with one-tap TikTok publishing, free and from about $24/mo annual. TikTok Seller Center also has an AI Video Maker — [Lamina comparison, 25 Sep 2026](https://uselamina.ai/blog/best-ai-video-agents-for-ecommerce-in-2026) (secondary; Lamina is a vendor in its own table). Pippit is covered in depth by another researcher.
- Other names that surfaced but were not verified: AdStellar (launches ads to Meta), ImagineArt AI Ad Studio, Reloop (product URL to subtitled video) — [search summary of vendor roundups](https://www.cometly.com/post/ai-product-video-ad-generator); [Reloop](https://reloop.so/blog/article/video-ad-agency/) (search summary; vendor-written)

### Inferences
- What the category actually ships is "brief or URL in, a stack of short paid-social variants out", usually avatar or AI-actor talking head plus B-roll, captions and stock music. Creatify, Arcads, Topview, Zeely, MakeUGC, Omneky and Amazon all optimise for volume (Creatify: "100 video ads in the time it takes to make 1"). None is aimed at one premium 30-second launch film with a grade, designed sound and a crafted edit.
- Colour grading, sound design (beyond stock music and TTS), and automatic long and short cut-downs across 16:9, 9:16 and 1:1 are absent or undocumented everywhere I read. Pencil lists "AI video cutdowns" as "Coming soon".
- Several vendors now expose MCP or APIs (HeyGen MCP and HyperFrames, Omneky MCP, Topview MCP/API, Vidmob360 MCP, and an Arcads user driving it from Claude Code). For Das Production these are more useful as parts an orchestrating agent can call than as finished agents. The terms limit this: Topview's "unlimited" bans automation.
- User-review sites show a pattern across volume UGC tools. Credits are spent on failed renders, small edits trigger full re-renders, and billing and refund disputes are common (Creatify 3.8/5, Arcads 2.6/5 on Trustpilot). "Autonomous" retry loops would make this cost problem worse unless the tool checks its own output before rendering at full price.

### Gaps
- Could not read Arcads' or AdCreative.ai's pricing pages (404), or D-ID's prices (not on the fetched page). Synthesia's Syren agent had no page I could read beyond its pricing line. Mirage Studio's ad product page was not found under that name.
- Not searched because the shared search budget ran out: Meta Advantage+ generative video, Google's ad video tools (Veo in Google Ads / Asset Studio, Pomelli), Higgsfield's ad products, Photoroom video, Bria video, Movio, current Typeface pricing, Sora- or Veo-based "UGC ad" generator apps, Reddit threads (r/PPC, r/FacebookAds, r/ecommerce, r/aivideo) and G2.
- No independent, like-for-like quality benchmark across these tools was found.

## Q2. Funding, revenue / ARR, users and named customers

### Takeaway
Avatar and presenter platforms are large: HeyGen claims more than $200M ARR (June 2026) and Synthesia raised at $4B (Jan 2026). The ad-agent specialists are small: Creatify about $9M ARR (May 2025), Arcads about $10M ARR (Nov 2025, founder interview). Most ARR figures are company-stated and unaudited. One heavily hyped ad agent (Icon) appears to have shut down.

### Cited Findings
- **HeyGen:** "surpassed $200 million in annual recurring revenue, doubling in eight months" (25 Jun 2026); 30M+ users in 196 countries; "85% of the Fortune 100"; 118M+ videos. No new funding round announced — [HeyGen press release](https://www.heygen.com/blog/heygen-surpasses-200m-arr) (primary; company-reported). Sacra estimates $205M ARR in Jun 2026, up from $123M at the end of 2025 — [Sacra: HeyGen](https://sacra.com/c/heygen/) (search summary). Last reported round: $60M at a $500M valuation led by Benchmark (dated June 2024 by Wikipedia; sources disagree on the date), so it falls outside the Apr 2025 – Oct 2026 window — [Wikipedia: HeyGen](https://en.wikipedia.org/wiki/HeyGen) (search summary)
- **Synthesia:** $200M Series E at a $4B valuation, led by GV with NVentures, Kleiner Perkins, Accel, NEA and others, plus an employee secondary via Nasdaq (26 Jan 2026). Crossed $100M ARR in April 2025. Customers Bosch, Merck, SAP; 500+ staff — [TechCrunch](https://techcrunch.com/2026/01/26/synthesia-hits-4b-valuation-lets-employees-cash-in) (secondary). A figure of about $150M ARR is an estimate — [Clinkbill](https://clinkbill.com/arr-leaderboard/synthesia) (search summary; unverified)
- **Creatify:** $15.5M Series A co-led by WndrCo and Kindred Ventures (28 May 2025), tied to the AdMax launch. $9M+ ARR in 18 months; 1.5M+ community members and 10,000+ teams; named customers NewsBreak, Zumper, RingWave Media — [Creatify blog](https://creatify.ai/blog/announcing-our-15-5m-series-a-a-new-chapter-for-creatify) (primary). Total funding $23M, with NFDG, Millennium NH, Creator Ventures and Leadout — [BusinessWire release](https://www.businesswire.com/news/home/20250528506486/en/Creatify-Crosses-$9M-ARR-Raises-$15.5M-Series-A-to-Launch-the-First-End-to-End-AI-Ad-Agent-for-Video) (search summary). No newer figures found.
- **Arcads:** $16M seed led by Eurazeo, with Alpha Intelligence Capital and Sequoia Scout; CB Insights dates it 17 Dec 2025 — [Net Influencer](https://www.netinfluencer.com/arcads-ai-secures-16m-seed-funding-to-expand-ai-video-creation-platform/); [CB Insights](https://www.cbinsights.com/company/arcads/financials) (search summary). $10M ARR, 6,000+ customers and a team of 8, per a founder interview in Nov 2025 — [Latka interview](https://getlatka.com/interviews/arcadsai-romain-torres-co-founder-2025); [Founderpath](https://founderpath.com/resources/romain-torres-arcads-10m-arr-ai-video-ads-sales) (search summary; founder-stated). Total raised is reported as $16M or $25M (conflict). Homepage claims "1B views" for ads made with Arcads, and showcase "revenue generated" figures that are not verified — [Arcads](https://www.arcads.ai/) (primary; marketing claim). The operator named in the terms is FRESHR — [Arcads terms](https://www.arcads.ai/terms) (primary)
- **Mirage (Captions):** $75M growth financing from General Catalyst's Customer Value Fund (24 Mar 2026). Captions: 3.2M downloads and $28.4M in-app revenue over the previous 365 days (Appfigures); 200M+ videos made; about 25% of revenue from the US — [Yahoo/TechCrunch](https://finance.yahoo.com/sectors/technology/articles/mirage-raises-75m-continue-building-130000702.html) (secondary). The funding is reported as backing a push into Asian markets — [Trending Topics](https://www.trendingtopics.eu/mirage-raises-75m-to-push-ai-video-app-captions-into-asian-markets/) (search summary)
- **Topview:** about $8.4M Series A led by Kamet Capital at about a $30.7M valuation (8 Aug 2025); customers L'Oréal, ANTA, Anker; "over 50 percent month-over-month growth in recurring revenue since the V2.0 release" — [TNGlobal](https://technode.global/2025/08/08/kamet-capital-invests-8-4m-in-singapores-ai-avatar-platform-topview/) (secondary). Tracxn lists $14M across two rounds, including an unexplained Feb 2026 Series A — [Tracxn](https://tracxn.com/d/companies/topviewai/__IBWFj0e2DN4y1OzaC7npVs3Yi6ppNbf3-lSgmDxhkT8) (search summary; unverified)
- **Icon:** $9.2M seed led by Founders Fund (Sept 2024, before the window). No ARR figure on Sacra — [Sacra: Icon](https://sacra.com/c/icon/) (secondary). Latka lists "$5M ARR" — [Latka: Icon](https://getlatka.com/companies/icon.com) (search summary; unverified). The founder reportedly paid $12M for icon.com. The company appears shut down as of Mar 2026 — [Tech Startups](https://techstartups.com/2026/03/05/icon-the-ai-ad-startup-shuts-down-after-spending-12m-on-the-icon-com-domain/) (secondary)
- **Tavus:** $40M Series B led by CRV (Nov 2025), with Scale Venture Partners, Sequoia, YC, HubSpot Ventures and Flex. One listing names Scale as lead instead (conflict). An $8M+ ARR figure is a triangulated estimate — [Crunchbase](https://crunchbase.com/organization/tavus); [Seedtable](https://seedtable.com/companies/tavus/funding-rounds/series-b-2025-11) (search summary)
- **Hedra:** $32M Series A led by a16z's Infrastructure fund (May 2025); about $44M total; a reported $200M valuation (citing Reuters) — [Unite.AI](https://www.unite.ai/hedra-raises-32m-to-power-the-future-of-generative-video-with-lifelike-digital-characters/); [Verdict](https://www.verdict.co.uk/?p=389207) (search summary)
- **Akool:** the founder states about $25M recognised revenue in 2025 (from $12M in 2024), monthly revenue above $3M in June 2026 and about 30,000 paying customers; Coca-Cola is the first major enterprise account — [Founderpath](https://founderpath.com/resources/jeff-lu-akool-25m-revenue-ai-video-avatars); [Latka interview](https://getlatka.com/interviews/akool-jeff-lu-2026) (search summary; founder-stated). Funding totals conflict ($10M per Latka vs $250K per CB Insights).
- **AdCreative.ai:** acquired by Appier (TSE-listed) in Feb 2025 for about $38.7M, just before the window — [CB Insights](https://www.cbinsights.com/company/adcreative); [Capterra](https://www.capterra.com/p/253052/AdCreativeai/) (search summary)
- **Hour One:** acquired by Wix on 23 May 2025 — [Techleap](https://finder.techleap.nl/news/note/wix-acquires-hour-one-boosting-its-generative-ai-ambitions) (search summary)
- **Pencil:** acquired by The Brandtech Group (June 2023); "more than 1,000 brands" — [Campaign](https://www.campaignlive.com/article/brandtech-group-acquires-ai-ad-generator-pencil/1826457); [toolsforhumans](https://www.toolsforhumans.ai/ai-tools/pencil-ai) (search summary)
- **Omneky:** "more than 6,000 customers"; partnerships with NVIDIA, AWS, Meta, SoftBank (company claims) — [Omneky newsroom](https://www.omneky.com/newsroom/omneky-5-best-ai-ad-creation-platforms-2026) (search summary). No recent funding found.
- **Smartly.io:** letter of intent to acquire INCRMNTAL (17 Mar 2026); Amazon DSP integration (2 Mar 2026) — [Smartly press](https://www.smartly.io/press) (search summary). Customer results quoted on its AI Studio page (Kavak, S360, Foot Locker) — [Smartly AI Studio](https://smartly.io/product/ai-studio) (primary; vendor case claims)
- **Typeface:** $100M Series B at $1B led by Salesforce Ventures (June 2023); no newer round found — [Forbes Argentina](https://www.forbesargentina.com/innovacion/asi-typeface-startup-recaudo-us-100-millones-montar-una-fabrica-contenido-n36293) (search summary)
- **D-ID:** last round found was $25M Series B (Mar 2022) — [StartupIntros](https://startupintros.com/news/2022-03-01-d-id-series-b) (search summary). Nothing newer found.

### Inferences
- The money and scale sit with horizontal avatar/presenter platforms (HeyGen, Synthesia), not with ad-specific agents. Synthesia's own investor story is corporate training, not ads.
- The ad-agent niche shows fragility and churn: Icon (well funded, heavily hyped) appears to have shut down within about 18 months, and several tools have poor billing reputations. When choosing suppliers to build on, Das Production should weight vendor survival and terms, not only output.

### Gaps
- No audited revenue for any company. Recent figures for Creatify (after May 2025) and Arcads (after Nov 2025) were not found from primary sources.
- Funding for Zeely, MakeUGC, Mintly, Pexo and Lamina was not checked (search budget exhausted).

## Q3. Stage of each claim (shipped / beta / announced / defunct), with dates

### Takeaway
The prompt-to-video "agent" features from HeyGen, Topview, Creatify (Creative Agent), Akool and Synthesia (Syren) are on sale now. Creatify's AdMax full loop is demo-gated, Omneky's agentic API is a July 2026 announcement, Arcads' one-click editing and agent builder are "Soon!", and Pencil's video generation is "Coming soon" in its own pricing table.

### Cited Findings
- HeyGen Video Agent **[GA, limited trial on Free]**: live prompt page; the pricing FAQ says the Free plan has "limited trial access" — [HeyGen Video Agent](https://www.heygen.com/video-agent); [HeyGen pricing](https://www.heygen.com/pricing) (primary, read 2026-10-15). Product Placement **[GA, paid plans]** — [HeyGen tool page](https://www.heygen.com/en-gb/tool/ai-product-placement) (primary)
- Creatify Creative Agent / "Ad Agent + Automations" **[GA on Pro/Max]** — [Creatify pricing](https://creatify.ai/pricing) (primary). AdMax was **[announced 28 May 2025]**. Today it is **[demo / sales-led; GA status not stated]** — [Creatify blog](https://creatify.ai/blog/announcing-our-15-5m-series-a-a-new-chapter-for-creatify); [AdMax page](https://creatify.ai/admax) (primary). One review called AdMax a beta — [agent-finder](https://agent-finder.co/reviews/creatify-agent) (search summary; unverified)
- Arcads: AI actors, product holding and translation **[GA]**. "AI video editing" with B-roll, music, captions and transitions **[announced: "Soon!"]**. "Build your own AI Agent" **[announced, no detail]** — [Arcads home](https://www.arcads.ai/) (primary)
- Synthesia Syren agent **[GA, 3-min cap, promo credits]** — [Synthesia pricing](https://www.synthesia.io/pricing) (primary). Interactive "video agents" for company knowledge **[strategy, Jan 2026]** — [TechCrunch](https://techcrunch.com/2026/01/26/synthesia-hits-4b-valuation-lets-employees-cash-in) (secondary)
- Mirage: Captions app **[GA]**. "Agents turn direction into films, soundtracks, and 3D scenes" **[vision, no date]** — [mirage.app](https://mirage.app/) (primary)
- Topview Video Agent / AI Marketer **[GA; video needs a paid plan]** — [Topview pricing](https://www.topview.ai/pricing) (primary); [Promer review, 30 Sep 2026](https://promer.ai/blog/topview-ai-review) (secondary)
- Pencil video generation, cutdowns and editor **["Coming soon" in its own table]**, while a testimonial says Veo is reached via Pro **[conflicting]** — [Pencil pricing](https://www.trypencil.com/pricing) (primary)
- Omneky public API + MCP **[announced 13 Jul 2026; availability and pricing not stated]** — [Omneky newsroom](https://www.omneky.com/newsroom/omneky-public-api-mcp-server-ai-advertising-everywhere) (primary)
- Amazon Ads Video Generator: **[GA in the US from 10 Jun 2025]** — [Amazon Ads](https://advertising.amazon.com/library/news/video-generator) (search summary). The Sponsored Brands version is in **[Open Beta in India and the UK from 11 Nov 2025]** — [Amazon Ads announcement](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns) (primary)
- Akool "Video Agent & Agentic Canvas" **[listed on all plans; no further detail]** — [Akool pricing](https://akool.com/pricing) (primary)
- Vidmob360 MCP/agents **[launched 10 Jun 2026]** — [Adweek wire](https://www.adweek.com/adweek-wire/vidmob-launches-vidmob360/) (search summary)
- Icon **[defunct, apparently, Mar 2026]** — [Tech Startups](https://techstartups.com/2026/03/05/icon-the-ai-ad-startup-shuts-down-after-spending-12m-on-the-icon-com-domain/) (secondary). Hour One **[acquired by Wix, May 2025]** — [Techleap](https://finder.techleap.nl/news/note/wix-acquires-hour-one-boosting-its-generative-ai-ambitions) (search summary)

### Inferences
- "Agent" on these pages usually means one of two things: a chat front end that writes a script and assembles avatar, B-roll and voice in one pass (HeyGen, Topview, Creatify Creative Agent, Synthesia Syren), or a performance loop on ad-account data (AdMax, Omneky, Zeely). No shipped product joins both with a quality and taste check in between.
- The showreel demos on vendor homepages (Arcads "revenue generated" cards, HeyGen's pixel-level placement claim) count as demos and marketing, not as evidence of typical output.

### Gaps
- Release notes and changelogs were not read for each vendor (search budget). Exact GA dates for HeyGen Video Agent, Creatify Creative Agent (one competitor review says May 2026) and Synthesia Syren are unconfirmed.

## Q4. Scores against the four promises (0–4 each), and does the autonomous agent already exist?

### Takeaway
No. Nothing read scores above about 9/16. The best are Omneky (claimed, not yet shown), Creatify, HeyGen Video Agent, Topview and Zeely, and each covers "brief in, many short ads out". All are weakest on promise 2 (none documents asking clarifying questions) and promise 4 (no documented self-check of quality, taste or brand; "learning" means ad-performance data, not this person's taste). Promise 3 stops at avatar plus B-roll plus captions plus stock music. Nobody documents grading, designed sound, or long and short cut-downs.

### Cited Findings
Evidence used for the scores (each is cited in full in Q1–Q3):
- No vendor page read documents the agent asking clarifying questions. HeyGen offers "Refine through conversation" — [HeyGen Video Agent](https://www.heygen.com/video-agent) (primary). In Topview's agent, a failed product-image read did not stop the plan — [Promer review](https://promer.ai/blog/topview-ai-review) (secondary).
- Performance-learning loops exist: AdMax uses past Meta campaign data and flags fatigue ([Creatify AdMax](https://creatify.ai/admax), primary). Omneky regenerates from performance data and creative scoring ([Omneky newsroom](https://www.omneky.com/newsroom/omneky-public-api-mcp-server-ai-advertising-everywhere), primary). Zeely offers forecasts, recommendations and A/B tests ([Zeely pricing](https://zeely.ai/pricing), primary). Vidmob360 evaluates creative against brand guidelines but does not generate ([Adweek wire](https://www.adweek.com/adweek-wire/vidmob-launches-vidmob360/), search summary).
- Brand: HeyGen applies brand colours and typography ([HeyGen Video Agent](https://www.heygen.com/video-agent), primary). Omneky reads colours and fonts from the URL (primary). Topview has a Brand Kit on Team ([Topview pricing](https://www.topview.ai/pricing), primary). Pencil asks you to upload a brand kit ([Pencil pricing](https://www.trypencil.com/pricing), primary). Synthesia has brand kits on Enterprise ([Synthesia pricing](https://www.synthesia.io/pricing), primary).
- Reviewers still do manual work. They fact-check scripts against the product page and upload to ad platforms themselves ([Promer review](https://promer.ai/blog/topview-ai-review), secondary). They edit auto-filled details and fix glitches in an editor ([Unite.AI Creatify review](https://www.unite.ai/creatify-review/), secondary). "Strategy and human review are still needed" ([Trustpilot: Arcads](https://www.trustpilot.com/review/arcads.ai), unverified).

### Inferences
Scores are my judgement from the cited evidence. P1 = one prompt in, P2 = understands / asks only when needed, P3 = does everything, P4 = the person likes it (self-check, fix, learn).

| Product | P1 | P2 | P3 | P4 | Total /16 | Where it falls short |
|---|---|---|---|---|---|---|
| Omneky (API/MCP, announced Jul 2026) | 3.5 | 1.5 | 2 | 2 | 9 | Claims "zero prompting" from a URL and performance-driven regeneration, but it is a newsroom announcement with no pricing, output samples or independent review |
| Creatify (Creative Agent + AdMax) | 3 | 1.5 | 2 | 1.5 | 8 | Volume UGC/avatar variants; AdMax learns from Meta results, not taste; no self-QA (users report morphing faces); demo-gated loop |
| HeyGen Video Agent | 3 | 1 | 2 | 1 | 7 | Prompt to a finished presenter/explainer video with brand fonts and colours, but product placement is a separate tool, multi-size versions are not automatic, and there is no self-check or preference learning |
| Topview (AI Marketer / Video Agent) | 3 | 1.5 | 2 | 1 | 7.5 | Brief plus product photo gives a shot plan and shots; carried on after failing to read the product image; manual upload; no self-check |
| Zeely | 3 | 1 | 2 | 1.5 | 7.5 | Prompt-to-ad plus Meta launch and A/B testing for SMBs; low craft; no evidence of quality; up to 12% fee on ad spend |
| Pencil (Brandtech) | 2.5 | 1.5 | 1.5 | 2 | 7.5 | Strong strategy/insight agents and performance prediction, but its own table marks video generation and cutdowns "Coming soon" |
| Amazon Ads Video Generator | 3.5 | 1 | 1.5 | 0.5 | 6.5 | ASIN to six 15-s videos free, India and UK in open beta; Sponsored Brands only; template-like; no taste loop |
| Typeface (Arc Agents) | 2 | 1.5 | 1.5 | 1.5 | 6.5 | Enterprise brand-governed content agents; video evidence comes only from a search summary |
| AdCreative.ai | 2.5 | 1 | 1 | 1.5 | 6 | Mostly statics; video behind $249/mo; credit cost per video undisclosed |
| Synthesia (Syren) | 2.5 | 1 | 1.5 | 1 | 6 | Agent capped at 3 min; built for training/internal comms, not ads |
| Smartly.io AI Studio | 1 | 0.5 | 1.5 | 2 | 5 | Enterprise creative automation with performance data; scene generation around product shots; no prompt-to-film agent |
| Mirage / Captions | 2 | 1 | 2 | 1 | 6 (low confidence) | Strong editing app plus AI actors; the "agents make films" studio is a vision without a date |
| Akool | 2 | 0.5 | 1.5 | 0.5 | 4.5 | "Video Agent & Agentic Canvas" listed, undocumented; Personal licence below the $174/mo tier |
| Arcads | 1.5 | 0.5 | 1.5 | 0.5 | 4 | Script-and-actor driven; editing and agent builder "Soon!"; poor user reviews on realism and credits |
| Colossyan | 1.5 | 0.5 | 1 | 0.5 | 3.5 | Training-video tool, not ads |
| MakeUGC | 1.5 | 0 | 1 | 0 | 2.5 | Raw avatar clips; no captions, music or B-roll |
| D-ID / Hedra / Tavus | 1 | 0 | 1 | 0 | 2 | Talking-head or character engines and APIs (useful as parts), not agents |
| Vidmob360 | 0 | 0.5 | 0 | 2 | 2.5 | Judges creative against brand guidelines (a P4 part); generates nothing |
| Icon | n/a | n/a | n/a | n/a | n/a | Appears shut down (Mar 2026) |
| Hour One | n/a | n/a | n/a | n/a | n/a | Absorbed into Wix (May 2025) |

- Overall: Das Production's agent, as promised, does not exist in this category. The closest products are volume tools for performance marketers, which is a different job from "a 30-second launch film, warm, premium, that this person likes".
- The pieces Das Production could orchestrate rather than rebuild:
  - presenter and avatar engines: HeyGen, with its MCP and the Apache-2.0 HyperFrames that HeyGen describes;
  - performance and brand evaluation: Vidmob360 MCP;
  - URL-to-ad generation: Omneky API, once it is actually available;
  - free ASIN video for Amazon India and UK sellers: Amazon's generator.

  The missing parts nobody sells are the clarifying-question planner, the taste and brand critic, and craft finishing (grade, sound, cut-downs).

### Gaps
- No product could be tested hands-on in this research (no accounts). Scores rest on vendor pages, a few independent reviews and unverified user reviews.
- HeyGen's HyperFrames licence was taken from HeyGen's press release, not from the repository. Check the repository's LICENSE before relying on it.

## Q5. Is anyone reliably solving "the exact real product, logo and on-screen text" in generated footage?

### Takeaway
No vendor read publishes a fidelity measure. The only independent test found (HeyGen Product Placement) produced distorted, illegible label text. Even a vendor's own comparison (Lamina) says the evidence supports no fidelity ranking for any of six tools. The tools that keep the product exact appear to be those that animate or composite the real packshot (Amazon, Smartly-style scene generation), not those that regenerate it in an actor's hands. That is an inference: none of them documents which method it uses.

### Cited Findings
- HeyGen claims pixel-level integration with matched lighting, shadows, reflections and scale, and asks for a product image of 720p or more, front-facing and centred — [HeyGen AI Product Placement](https://www.heygen.com/en-gb/tool/ai-product-placement) (primary; claim). Its help content says small hand-held products work best — [HeyGen community](https://community.heygen.com/public/resources/product-placement-create-avatars-including-products) (search summary)
- An independent test found "the text on the can is distorted and illegible when zoomed in" (14 Sep 2025) — [ProVideo Coalition](https://www.provideocoalition.com/ai-tools-heygen-avatar-iv-gets-real/) (secondary)
- Lamina's six-tool comparison (Creatify, Pippit, Arcads, Pexo, HeyGen, Lamina): for Arcads and HeyGen, the positioning "does not prove an exact SKU stays undistorted". For Pippit and Lamina, the "evidence does not support any fidelity ranking". For Creatify, fidelity "must be judged on renders from your own catalogue" — [Lamina, 25 Sep 2026](https://uselamina.ai/blog/best-ai-video-agents-for-ecommerce-in-2026) (secondary; vendor-authored)
- Topview: "only one product image" is needed and avatars "physically" catch and hold products (vendor claim) — [TNGlobal](https://technode.global/2025/08/08/kamet-capital-invests-8-4m-in-singapores-ai-avatar-platform-topview/) (secondary). The one hands-on test did not reach video, and the agent failed to read the product image file — [Promer review](https://promer.ai/blog/topview-ai-review) (secondary)
- Arcads and MakeUGC advertise product holding from a photo; neither publishes accuracy data — [Arcads](https://www.arcads.ai/) (primary); [Fluxnote on MakeUGC](https://fluxnote.io/guides/makeugc-ai-review) (search summary). Arcads users report output that is "glitchy" and "clearly AI" — [Trustpilot: Arcads](https://www.trustpilot.com/review/arcads.ai) (unverified)
- Creatify users report temporal errors: a face changing to a different person mid-motion, a truck driving backward — [Trustpilot: Creatify](https://www.trustpilot.com/review/creatify.ai) (unverified). Creatify says its product videos show "your item naturally held, used, or demonstrated" — [Creatify App Store listing](https://apps.apple.com/us/app/-/id6755723951) (search summary; marketing claim)
- Amazon builds from the real product image or video and detail-page content, with text animation and advertiser-set logo placement. It claims "creative consistency" but does not say how — [Amazon Ads announcement](https://advertising.amazon.com/resources/whats-new/video-generator-for-sponsored-brands-video-campaigns) (primary)
- Smartly: AI scene generation around product shots plus background removal across catalogues, with no fidelity statement — [Smartly AI Studio](https://smartly.io/product/ai-studio) (primary)
- No Reddit threads on logo or text distortion surfaced in the one search made; a direct Reddit search was not possible after the budget ran out — [search summary](https://dev.to/artturijalli/3-best-ai-ugc-ad-generators-of-2025-lco) (search summary)

### Inferences
- Three methods are in use:
  1. **Composite or template.** The real packshot sits on top, with generated backgrounds, motion and text. Product pixels and on-screen text stay exact because they are never regenerated. Amazon and Smartly-style tools look like this.
  2. **Image-to-video or reference-conditioned regeneration** (HeyGen Product Placement, Topview Product Avatar, Arcads and MakeUGC product-in-hand). The product is redrawn every frame, so small text, logos and shape drift. This is exactly where the independent test failed.
  3. **Text-to-video with the product described in words.** The product is never exact.

  Only the first method is reliable today for labels and logos. On-screen titles should be rendered as graphics, not generated.
- For a "premium launch film", an agent should therefore keep the hero product as real footage, a 3D model or the composited packshot. It should use generation for environment, people and B-roll, and run an automatic check on product frames (logo/OCR comparison against the reference) before delivery. No vendor documents that check. This is the clearest gap for Das Production to fill.

### Gaps
- No vendor publishes a product-fidelity benchmark (e.g. logo or OCR match rate). Independent tests beyond the one ProVideo Coalition article were not found.
- I could not confirm which vendors composite and which regenerate, because they do not say.

## Q6. Commercial use of outputs, and avatar / likeness consent terms

### Takeaway
On most paid plans the output may be used commercially, but terms differ in ways that matter for client work:
- HeyGen's Free plan is non-commercial.
- Akool's plans below $174/mo carry a "Personal" licence, which is unclear, so treat it as not allowed.
- Arcads grants only a non-exclusive, personal, non-transferable licence. A creator can withdraw consent and force deletion of the ads "from all supports", and each breach carries a €500,000 lump sum.
- Several vendors (HeyGen, Creatify) take a broad licence over uploaded content, including for training.

### Cited Findings
- **HeyGen** (terms last updated 23 Jul 2026): on paid plans "you own all rights in your User Input or User Output" and may use it "for your own purposes (including for commercial purposes)". Free-plan output is "solely for personal, non-commercial, and internal evaluation purposes". Uploading "images of individuals… without their consent" is prohibited. Users grant HeyGen a "royalty-free, transferable, sublicensable, worldwide and irrevocable" licence, including "to train or otherwise improve" its models — [HeyGen terms](https://www.heygen.com/terms) (primary)
- **Arcads (FRESHR)** (terms "Entry into force: 08/10/2026", date format ambiguous): "a non-exclusive, personal and non-transferable license on the Video". Commercial distribution is allowed within that licence. Creators of AI actors may restrict fields of use; no "misleading or deceptive advertising"; no cloning or modifying the creator's image or voice. After a creator withdraws, FRESHR may require deletion of videos "from all supports". Breach (after a 30-day cure) carries a "lump-sum indemnity of 500.000,00 euros" per breach. Unused credits are not refunded — [Arcads terms](https://www.arcads.ai/terms) (primary)
- **Creatify** (effective 23 Sep 2024): "You own all your original content in the Assets you create", but "Users of the Free Tier have limited rights" (undefined). Creatify takes a "perpetual, worldwide, non-exclusive, sublicensable… irrevocable license" to your prompts, images and Assets to provide, promote and improve the service. Users are responsible for clearances and rights of publicity — [Creatify terms](https://creatify.ai/terms) (primary). The FAQ says creatives can be used "in any channel without limitations" — [Creatify pricing](https://creatify.ai/pricing) (primary; conflicts with the terms on Free)
- **Topview**: a "Commercial license" row exists, but the terms were not on the page. Enterprise adds legal indemnification and "No training on your data". Unlimited use is "personal, human use only", with automation prohibited — [Topview pricing](https://www.topview.ai/pricing) (primary). **Commercial terms per plan: needs checking (treat as unclear).**
- **Akool**: licence "Personal" on Starter, Pro and Pro Max; "Business" on Business; "Enterprise" on Enterprise. What each permits is not explained — [Akool pricing](https://akool.com/pricing) (primary). **Unclear, so treat as not allowed below the Business tier.**
- **Hedra**: "Commercial use" listed on every paid plan — [Hedra pricing](https://www.hedra.com/pricing) (primary)
- **Pencil**: Pro includes "IP assignment" and "no train". Core and Growth ownership is not stated on the pricing page — [Pencil pricing](https://www.trypencil.com/pricing) (primary). **Core/Growth: unclear.**
- **Synthesia, Captions/Mirage, Tavus, Colossyan, D-ID**: their pricing pages did not state commercial-use terms — [Synthesia](https://www.synthesia.io/pricing), [Captions](https://www.captions.ai/pricing), [Tavus](https://www.tavus.io/pricing), [Colossyan](https://www.colossyan.com/pricing), [D-ID](https://www.d-id.com/pricing/) (primary). D-ID reportedly allows commercial use from Pro — [Creatify blog](https://creatify.ai/blog/d-id-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay) (search summary; competitor). **All unclear until their terms are read.**
- Underlying models offered inside these platforms (Seedance, Kling, Veo 3.1, Nano Banana, GPT Image, Wan, MiniMax) are licensed to the user only through each platform's own terms. No model-level terms were read for this note — [Topview pricing](https://www.topview.ai/pricing); [Arcads](https://www.arcads.ai/) (primary)

### Inferences
- For client ads in India and the UK, Arcads' creator-withdrawal clause is a real campaign risk: an ad could have to be pulled mid-flight, with a €500k penalty for non-compliance. HeyGen's and Creatify's broad licences over uploads (including training) may conflict with client NDAs for unreleased products. Enterprise tiers (Topview, Pencil Pro) are where no-train and indemnity appear.
- Stock-avatar endorsement rules are thin everywhere. Only Arcads states creator-level use restrictions and a ban on misleading advertising. Neither HeyGen nor Creatify addresses stock-avatar endorsements specifically, though HeyGen requires AI disclosure where the law requires it.

### Gaps
- Not read: Synthesia, Topview, Captions/Mirage, Akool, Tavus, Colossyan and D-ID terms of service; HeyGen's Acceptable Use and Ethics policies; and the terms for underlying models (Seedance, Kling, Veo) as passed through each platform.
- India-specific rules (e.g. ASCI guidance on AI-generated or virtual-influencer ads) and UK rules (ASA/CAP on AI disclosure) were not researched in this note.
