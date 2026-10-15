# Big US technology and creative-software players: whole-video AI agents (state as of 2026-10-15)

Scope: what large US companies have shipped, announced or signalled towards an AI agent that makes whole videos (multi-shot, edit, sound, versions), measured against Das Production's four promises:
- **P1** one prompt in, no node graph or timeline;
- **P2** understands intent, audience, brand and format, and asks only when needed;
- **P3** does everything: script, storyboard, shot list, shots, voice, music, sound, edit, colour, titles, versions (16:9, 9:16, 1:1), delivery;
- **P4** the person likes the result: it judges its own output, fixes what fails, and learns the person's taste.

How to read this:
- **Stage labels:** [Shipped] generally available; [Beta]; [Test] limited test; [Announced] or [Press release] not yet usable; [Demo]; [Paper] research only; [Discontinued]; [Report] a news report of plans.
- **Source markers:** (search summary) means the fact came from a search-engine summary, not the page itself; (secondary) means news, a blog, a reseller or a forum; (unverified) means I could not confirm it.
- **Dates:** every source was read on 2026-10-15.
- **Coverage limits:**
  - The shared web-search budget ran out partway through. Canva, Autodesk Flow Studio pricing, Netflix, Getty/Shutterstock, Snap, Pinterest, Spotify, Salesforce and Shopify could not be researched or confirmed. They are listed under Gaps rather than filled from memory.
  - Several primary pages returned HTTP 403 to the fetcher: helpx.adobe.com, autodesk.com, canva.com, openai.com/index, windowsreport.com and mezha.ua.

---

## Google and Google DeepMind: what is shipped, announced and signalled, and how far is it from the four promises?

### Takeaway
Google is the large player closest to a whole-video agent. It ships:
- a conversational multi-step agent inside a filmmaking tool (Flow Agent, May 2026, all Flow users globally);
- a new video model built for conversational editing and character consistency (Gemini Omni Flash, then Omni 1.1 Flash in August 2026);
- a business-video tool that already generates script, avatars, voiceover and music in widescreen, vertical and square (Google Vids);
- ad-side generators (Asset Studio, Pomelli).

Its researchers have also published a self-critiquing, self-improving multi-scene video agent (VISTA). The pieces are not yet joined into one "prompt in, finished cut out" product. No shipped Google product claims to judge its own output or learn a person's taste, and Flow Agent's announcement does not say it asks clarifying questions.

### Cited Findings
**Models and pricing**
- [Shipped] Veo 3.1 is still the current Veo. No Veo 4 had been announced as of mid-2026; one third-party page says that as of 2026-05-19 there was no Veo 4 announcement, model ID or pricing — [pixverse.ai blog, read 2026-10-15](https://pixverse.ai/en/blog/veo-4-release) (search summary, secondary).
- [Shipped] Gemini API paid-tier video prices per second (video with audio), from the pricing page dated "Last updated 2026-10-15" — [Gemini API pricing, read 2026-10-15](https://ai.google.dev/gemini-api/docs/pricing):

  | Model | 720p | 1080p | 4K |
  |---|---|---|---|
  | Veo 3.1 | $0.40 | $0.40 | $0.60 |
  | Veo 3.1 Fast | $0.10 | $0.12 | $0.30 |
  | Veo 3.1 Lite | $0.05 | $0.08 | not supported |

  Veo is not on the free tier.
- [Shipped] Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) is billed by token: $1.50 per 1M input tokens and $17.50 per 1M video-output tokens. 720p video is counted at 5,792 tokens per second, so it works out to roughly $0.10 per second (my arithmetic: 5,792 × $17.50 / 1,000,000 = $0.101) — [Gemini API pricing, read 2026-10-15](https://ai.google.dev/gemini-api/docs/pricing).
- [Shipped] Veo 3.1 Lite was introduced for developers on 2026-03-31 — [letsdatascience.com, read 2026-10-15](https://www.letsdatascience.com/news/google-launches-veo-31-lite-video-9345d526) (search summary, secondary).

**Gemini Omni**
- [Shipped] Gemini Omni was announced at Google I/O on 2026-05-19 and summarised on 2026-05-29.
  - It is "a model that can create anything from any input, starting with video". It takes text, image, video and audio in and puts video out, with "Every instruction builds on the last" multi-turn conversational editing, and keeps characters, physics and scene continuity across edits.
  - It is rolling out "to all Google AI Plus, Pro and Ultra subscribers globally" in the Gemini app and Google Flow, at no cost in YouTube Shorts and the YouTube Create app. API access was due "in the coming weeks".
  - The page does not describe multi-shot or audio generation as features.

  [Google blog, Gemini Omni and 3.5 demos, read 2026-10-15](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-3-5-videos)
- [Shipped] Gemini Omni 1.1 Flash, 2026-08-27:
  - scene extension: it reads up to 10 s of prior context and extends in 10 s steps, up to 40 s in total;
  - first-and-last-frame control;
  - 360p drafts that are up to 60% faster and about a third of the 720p cost;
  - upscaling to 1080p or 4K, and up to 3 s of video as a reference.

  It is available in AI Studio and the Gemini API, through the Gemini Enterprise Agent Platform, and in Flow for AI Plus, Pro and Ultra subscribers globally. The page does not mention audio, indemnity or SynthID — [Google blog, read 2026-10-15](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/).

**Flow and Flow Agent**
- [Shipped] Flow Agent, announced 2026-05-19 by Elias Roman (VP Product, Google Labs):
  - it can "plan and reason through complex tasks with your inputs, under your control";
  - it brainstorms plot and dialogue and "help[s] create multiple variations at one time";
  - it batch-edits "so your tweaks are reflected across all your assets", and organises and renames assets;
  - "The agent is now available to all Google Flow users globally."

  The post does not mention storyboarding, multi-shot assembly, sound, aspect-ratio versions, export, clarifying questions, self-checking or preference learning — [Google blog, Flow updates, read 2026-10-15](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/).
- [Shipped / Beta] Other items in the same post:
  - **Flow Tools:** users build custom tools in natural language, such as "video resizers"; all users can use them, and subscribers can create and remix them.
  - **Flow Music:** section editing, covers and "Omni-powered music videos" directed conversationally with the agent.
  - **Mobile:** the Flow Android app is "in beta" (iOS coming soon).
  - Features "may vary by Google AI subscription tier, platform (web vs. mobile), and region". The apps are 18+.

  [Google blog, read 2026-10-15](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)
- [Shipped] Flow became an additional Google service for Workspace customers in January 2026, running Veo 3.1 and Nano Banana Pro — [Google Workspace Updates, read 2026-10-15](https://workspaceupdates.googleblog.com/2026/01/flow-available-additional-google-service-workspace.html) (search summary).
- [Shipped, 2025] Flow launched in May 2025 with Scenebuilder (edit and extend shots into scenes), camera controls and Flow TV — [BGR, read 2026-10-15](https://bgr.com/2034360/google-flow-nano-banana-pro-video-editing-ai/) (search summary, secondary).

**Subscriptions**
- [Shipped] Plan changes announced 2026-05-19:
  - a new $100/month AI Ultra plan, with the top Ultra tier cut "from $250 to $200" per month;
  - limits are now compute-based, so video prompts use more;
  - pay-as-you-go top-up credits for Flow;
  - Project Genie, the world model, for $200-Ultra subscribers globally, 18+.

  No India or UK prices are given — [Google blog, AI subscriptions, read 2026-10-15](https://blog.google/products-and-platforms/products/google-one/google-ai-subscriptions/).

**Google Vids**
- [Shipped] Google Vids product page:
  - "let AI generate the video, music, avatars, and voiceovers to build the perfect narrative";
  - edit "by editing the text transcript like a document";
  - "widescreen, vertical, and square" output;
  - avatars and voiceovers in 24 languages, and videos up to 30 minutes;
  - creation on desktop only;
  - "available to try at no cost", with advanced use on Workspace and Google AI plans.

  [Google Workspace, Vids, read 2026-10-15](https://workspace.google.com/products/vids/)
- [Shipped] On 2026-04-02 Vids added:
  - 10 free Veo 3.1 generations per month for personal accounts;
  - Lyria 3 music (30 s to 3 min) and directable Veo 3.1 avatars for AI Pro and Ultra;
  - up to 1,000 Veo videos per month on AI Ultra;
  - direct publishing to YouTube, defaulting to Private.

  The euro prices quoted there (AI Pro €21.99, Ultra €274.99) predate the May 2026 Ultra price cut and need checking — [ppc.land, read 2026-10-15](https://ppc.land/google-vids-gets-free-veo-3-1-video-generation-music-and-ai-avatars/) (secondary).

**YouTube**
- [Shipped] At Made on YouTube 2025 (September 2025), YouTube put Veo 3 Fast (a custom 480p, low-latency version with sound) into Shorts for free. It also announced "Edit with AI", which turns raw footage into a first-draft Short, and Speech to Song (Lyria 2). The rollout was initially in the US, UK, Canada, Australia and New Zealand — [YouTube blog, read 2026-10-15](https://blog.youtube/news-and-events/generative-ai-creation-tools-made-on-youtube-2025/) (search summary).
- [Shipped] On 2026-05-19, "Remixing with Omni is rolling out today at no cost in YouTube Shorts Remix and the YouTube Create app". Remixes carry watermarks, metadata and a link to the original. The page names no regions — [YouTube blog, I/O 2026, read 2026-10-15](https://blog.youtube/news-and-events/youtube-news-google-io-2026/).

**Ads and marketing**
- [Shipped / rolling out] Google Ads Asset Studio:
  - It launched on 2025-09-10 with Veo video generation.
  - At Google Marketing Live (2026-05-20) it gained Gemini Omni, a natural-language interface that "understands a marketer's brief, brand guidelines, website, and campaign goals", and 1-Click Creative Testing.
  - These were "rolling out globally in English this summer".
  - No agent is mentioned.

  [ppc.land, read 2026-10-15](https://ppc.land/asset-studio-gets-gemini-omni-and-1-click-creative-testing-at-gml-2026/) (secondary)
- [Shipped / Labs experiment] Pomelli, Google Labs with DeepMind:
  - builds a "Business DNA" from a website URL;
  - added video ads from static creatives (December 2025) and "Animate" on Veo 3.1 (January 2026);
  - a "Pomelli Agent" was named at I/O 2026 with no detail found;
  - reportedly restricted in the EU.

  [onlinemarketing.de, read 2026-10-15](https://onlinemarketing.de/technologie/googles-ai-marketing-tool-pomelli-video-ads) (search summary, secondary, unverified)

**Research**
- [Paper] VISTA: "A Test-Time Self-Improving Video Generation Agent", arXiv 2510.15831, 2025-10-17. Authors: Do Xuan Long, Xingchen Wan, Hootan Nakhost, Chen-Yu Lee, Tomas Pfister and Sercan Ö. Arık.
  - It "decomposes a user idea into a structured temporal plan" and picks the best clip by pairwise tournament.
  - Three critic agents review visual, audio and contextual fidelity, and a reasoning agent rewrites the prompt.
  - It covers single- and multi-scene video, with up to a 60% pairwise win rate and human preference in 66.4% of comparisons.

  [arXiv, read 2026-10-15](https://arxiv.org/abs/2510.15831). Listed for CVPR 2026 on a Google researcher's publications page — [research.google, read 2026-10-15](https://www.research.google/people/xingchenwan/) (search summary). The arXiv abstract page does not show affiliations.

**Commercial terms**
- Google's Terms of Service (effective 2026-07-30) say "Google won't claim ownership over that content" for content users generate. The passage does not single out AI output. The separate Generative AI Additional Terms "no longer apply" since 2024-05-22, except for business partners with signed agreements — [Google ToS, read 2026-10-15](https://policies.google.com/terms); [Google GenAI Additional Terms, read 2026-10-15](https://policies.google.com/terms/generative-ai).
- Google Cloud's list of indemnified generative-AI services includes Veo used through the Gemini Enterprise Agent Platform API (formerly Vertex AI), for generally available versions only — [Google Cloud indemnified services, read 2026-10-15](https://cloud.google.com/terms/generative-ai-indemnified-services) (search summary). I found no indemnity for consumer Flow, Gemini app or Vids output, so treat that as unclear, and therefore as not covered.

### Inferences
**Against the four promises today:**
- **P1, partial.** Flow Agent and Omni take conversational prompts, but Flow is still a canvas and scene tool. Vids gives a prompt-to-draft path for business or explainer video.
- **P2, partial.** Asset Studio reads brief, brand and website, and Pomelli's "Business DNA" reads brand. No shipped Google video product says it asks clarifying questions only when needed.
- **P3, partial and fragmented.** Shots, music (Flow Music, Lyria), voice and avatars (Vids), 16:9, 9:16 and 1:1 (Vids) and variations and batch edits (Flow Agent) all exist, but in different products. No single product does script → shot list → shots → sound → edit → colour → versions → delivery.
- **P4, research only (VISTA).** No product claims self-critique or taste learning.

**Direction:** strongly towards whole-video agents. The pattern is an agent in Flow, a model built for multi-turn editing and consistency, scene extension, a self-improving multi-scene agent paper, and a brief-to-assets ad tool. Joining Flow Agent + Omni + Flow Music + the Vids format and voice stack + a VISTA-style critic would deliver most of Das Production's promise. Google has every component in-house. That is the single largest build-it-themselves risk.

**Google's limits that leave room:**
- Single engine: Veo and Omni only in Flow. Partner models appear in Adobe Firefly, not the reverse.
- No published taste learning.
- Consumer-tier outputs have no stated indemnity.
- Region and tier caveats.

### Gaps
- No primary page confirms whether Flow Agent can assemble a multi-shot cut with sound and export aspect-ratio versions; the announcement is silent.
- Flow plan quotas and per-video cost in Flow credits, and India and UK subscription prices, need checking.
- "Pomelli Agent": no detail found.
- Genie 3 / Project Genie video-creation relevance: only its availability was found.
- Whether Veo-in-Ads output carries Google indemnity: not found.

---

## OpenAI: Sora 2, the Sora app, API, partnerships and agent features

### Takeaway
OpenAI has left video generation as a product.
- It announced on 2026-03-24 that it would discontinue Sora in both the consumer app and the API.
- The Sora 2 models and Videos API were shut down on 2026-09-24, and OpenAI says "There is no one-to-one replacement API".
- The Disney character-licensing deal was reported as unwound.

As of October 2026, OpenAI covers none of the four promises for video. Its exit is mainly a warning about depending on any single engine.

### Cited Findings
- [Discontinued] OpenAI's deprecations page, entry "2026-03-24: Sora 2 video generation models and Videos API":
  - developers were notified on 2026-03-24, with "removal from the API on September 24, 2026";
  - the replacement column is empty;
  - affected: the Videos API, `sora-2`, `sora-2-pro`, `sora-2-2025-10-06`, `sora-2-2025-12-08` and `sora-2-pro-2025-10-06`.

  [OpenAI API deprecations, read 2026-10-15](https://developers.openai.com/api/docs/deprecations)
- [Discontinued] The Sora 2 model page now says "The Sora 2 models and Videos API were shut down on September 24, 2026 and are no longer available" and "There is no one-to-one replacement API". Historical prices per second:

  | Model | Resolution | Price per second |
  |---|---|---|
  | sora-2 | 720x1280 / 1280x720 | $0.10 |
  | sora-2-pro | 720p | $0.30 |
  | sora-2-pro | 1024x1792 | $0.50 |
  | sora-2-pro | 1080p | $0.70 |

  [OpenAI Sora 2 model page, read 2026-10-15](https://developers.openai.com/api/docs/models/sora-2)
- [Discontinued] OpenAI's X post of 2026-03-24 read "We're saying goodbye to Sora". A spokesperson said "We've decided to discontinue Sora in the consumer app and API", citing compute demand; the Sora research team moves to world simulation for robotics. Appfigures showed new downloads down 32% month on month in December 2025. Disney "is exiting its deal" and "will not invest $1 billion", per The Hollywood Reporter — [Engadget, read 2026-10-15](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html) (secondary).
- [Discontinued] The consumer app closed on 2026-04-26 according to two non-OpenAI pages — [pasqualepillitteri.it, read 2026-10-15](https://pasqualepillitteri.it/en/news/4453/what-happened-to-sora-openai-shutdown) (search summary, secondary, unverified). Engadget says OpenAI had not given app dates at announcement.
- [Shipped then Discontinued] Sora 2 and the Sora app launched at the end of September 2025 — [TIMEWELL, read 2026-10-15](https://timewell.jp/en/columns/openai-sora20) (search summary, secondary). Another blog gives 2025-12-18, which conflicts — [Cliprise, read 2026-10-15](https://www.cliprise.app/news/sora-2-launch) (search summary, secondary). The API snapshot name `sora-2-2025-10-06` (primary, above) shows the API existed by October 2025.
- [Shipped then Discontinued] On 2025-10-29 Sora added reusable "character cameos" and video stitching into longer sequences — [The Decoder, read 2026-10-15](https://the-decoder.com/openai-adds-character-cameos-and-video-stitching-to-its-sora-generator/) (search summary, secondary). A storyboard mode for multiple scene "beats" is described by a third-party blog only — [Cliprise, read 2026-10-15](https://www.cliprise.app/news/sora-2-launch) (search summary, secondary, unverified).
- [Press release then reported collapsed] In December 2025, Disney announced:
  - a $1B equity investment in OpenAI;
  - a three-year licence for 200+ Disney, Marvel, Pixar and Star Wars characters in Sora and ChatGPT Images, excluding talent likenesses and voices;
  - curated Sora videos on Disney+.

  The deal was subject to definitive agreements — [Fox Business, read 2026-10-15](https://www.foxbusiness.com/economy/disney-announces-major-openai-deal-includes-1b-equity-investment-use-characters-sora-video-platform) (search summary, secondary). Reported exit: see Engadget above.

### Inferences
- **Four promises:** 0 of 4 today. OpenAI has no video product to build on.
- **Signal against "big players will build it":** a frontier lab found consumer AI video too compute-hungry relative to demand and pulled both app and API with six months' notice and no replacement.
- **Design lesson for Das Production's "picks the right engine per shot":** engines can vanish. The agent must be engine-agnostic, with fallbacks and re-renderable shot specs.
- OpenAI's general-purpose agents and models could still be used as the planning or judging brain of a third-party video agent, but I found no OpenAI video-agent feature.

### Gaps
- Whether ChatGPT itself retains any video generation after 2026-09-24 could not be confirmed. One aggregator suggested it might; it was not verified and not cited as fact.
- The final status of the Disney agreement rests on secondary reporting.
- Whether OpenAI plans to re-enter video, for example through world-simulation research, is unknown.

---

## Meta: Movie Gen, Vibes, Meta AI video editing, Advantage+ generative video, roadmap to fully AI-made ads, licensing

### Takeaway
Meta's video AI effort is aimed at advertisers, not filmmakers.
- Generating video from static assets is generally available in Advantage+ creative.
- Ads Creative Studio generates video concepts with hook, audio, length, caption and end-scene editing.
- Catalog-to-video is in beta.
- A conversational "Meta AI business assistant" that would plan and create campaigns is in test.

Meta's reported goal is full automation of ad creation and targeting by the end of 2026, but its own October 2026 post still requires advertiser approval before anything publishes. On the consumer side:
- Vibes is a short-clip AI video feed, with a standalone app in test.
- Movie Gen remains a 2024 research paper.
- Meta's in-house "Muse Video" is only "in development".

### Cited Findings
**Ads**
- [Shipped / Beta / Test] Meta at Advertising Week New York, 2026-10-06 (Spanish-language newsroom post):
  - **[Shipped]** "Advertisers and agencies can now generate video from existing static assets", which is generally available.
  - **Ads Creative Studio:** "generate new video concepts and variations, then edit hooks, audio, clip duration and endings".
  - **[Beta]** Catalog product videos, for eligible advertisers.
  - **[Test]** Meta AI business assistant agentic actions: "Soon you'll be able to plan and create a campaign, generate images and text, or change a budget conversationally". Scheduled tasks and alerts are also in test.
  - **Ads MCP:** "Agent-prepared work now arrives as a draft in Ads Manager".
  - Control: "Every action is subject to the permissions set by the advertiser and explicit approval before anything is published."

  [Meta newsroom (LatAm), read 2026-10-15](https://about.fb.com/ltam/news/2026/10/advertising-week-new-york-2026-nuevas-capacidades-de-ia-para-guiar-campanas-y-llegar-a-los-clientes/) (translated by the fetch tool)
- [Report] In June 2025 the Wall Street Journal reported that Meta aims to let brands fully automate ad creation and targeting with AI by the end of 2026. The advertiser would supply a product image and budget goal, the AI would create the imagery, video and text and choose targeting and placement, and there would be real-time personalised versions — [Campaign Asia, read 2026-10-15](https://campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831) (search summary, secondary). I found no Meta statement confirming the date.
- [Shipped, 2025] At Cannes 2025, Meta announced multi-scene video ads with music and text overlay from up to 20 product stills — [ContentGrip, read 2026-10-15](https://www.contentgrip.com/meta-advantage-plus-gen-ai-tools/) (search summary, secondary).

**Models and consumer products**
- [Shipped / Announced] Muse Image (2026-07-07, updated 2026-07-10) is Meta Superintelligence Labs' first image model, in Meta AI and Instagram, with WhatsApp in limited countries. Advertisers were to get it via Advantage+ creative "in the coming weeks". "With Muse Video already in development" is the only mention of video, with no date — [Meta newsroom, read 2026-10-15](https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/).
- [Paper] Movie Gen: "A Cast of Media Foundation Models", arXiv 2410.13720, v1 2024-10-17. It produces 1080p video in multiple aspect ratios with synchronised audio, with a 30B model at about 16 s at 16 fps, instruction-based editing and personalisation — [arXiv, read 2026-10-15](https://arxiv.org/abs/2410.13720). I found no evidence that Movie Gen shipped as a named product.
- [Shipped / Test] Vibes launched in September 2025 inside Meta AI. On 2026-02-05 Meta confirmed a test of a standalone Vibes app, with features to generate or remix, add visuals and music, adjust style, and cross-post to Instagram and Facebook. A freemium subscription was planned "in the coming months". No models are named — [TechCrunch, read 2026-10-15](https://www.techcrunch.com/2026/02/05/meta-tests-a-standalone-app-for-its-ai-generated-vibes-videos) (secondary). The test reportedly runs in Brazil and Mexico — [screenapp.io, read 2026-10-15](https://screenapp.io/it/blog/meta-vibes-app-ai-video-generation-review) (search summary, secondary, unverified).
- [Shipped] Editing in Meta AI and Vibes covers restyling, Extend, Music, Lip sync and Voice, with a 10-second maximum video length — [Meta Help Center, read 2026-10-15](https://www.meta.com/help/artificial-intelligence/996454095987249/) (search summary).
- [Announced, 2025] In August 2025 Meta licensed Midjourney's image and video technology, with a research collaboration. Financial terms were not disclosed — [TechCrunch, read 2026-10-15](https://techcrunch.com/2025/08/22/meta-partners-with-midjourney-on-ai-image-and-video-models) (search summary, secondary).

**Policy**
- Meta reportedly requires disclosure of AI-generated content in ads and rejects undisclosed ads — [relevantaudience.com, read 2026-10-15](https://www.relevantaudience.com/meta/meta-advertising-week-new-york-2026-ad-tools/) (search summary, secondary, unverified).

### Inferences
**Against the four promises (ads only):**
- **P1, partial.** Video comes from static assets or a catalog with no timeline, but the agentic campaign assistant is in test.
- **P2, partial.** It imports brand voice guidelines (secondary) and uses historical campaign data.
- **P3, narrow.** Short ad videos, hooks, audio, captions and end scenes, but no film-style script, voice acting, colour or long form.
- **P4, a different kind.** Meta "judges" output by audience performance and optimisation, not by a person's taste.

**Consumer:** Vibes covers short clips only, 0 to 1 of 4.

**Threat to Das Production:** high for performance-ad variants on Meta placements, which Meta will give away free inside Ads Manager. Low for brand films, narrative and multi-platform deliverables outside Meta.

### Gaps
- An English Meta source for the October 2026 features, and their availability in India and the UK, were not checked.
- Whether Ads Creative Studio is generally available, and which models power Vibes and the ad video (Midjourney, Muse or another), were not found.
- Commercial-use terms for Vibes or Meta AI video outside Meta ads are unclear, so treat them as not allowed for client work.

---

## Adobe: Firefly Video, Firefly app and Boards, partner models, Premiere AI, creative agent, GenStudio, indemnity

### Takeaway
On paper, Adobe's Firefly AI Assistant is the closest large-vendor match to Das Production's promises.
- It is a "creative agent" that runs multi-step workflows across Firefly, Premiere, Photoshop, Express and others.
- It "asks you questions along the way" and "learns your creative preferences over time".
- It orchestrates 30+ models, including Google Veo 3.1, Runway Gen-4.5, Kling 3.0 and Luma Ray3.14.
- It added Quick Cut (auto first cut), storyboard-to-video and short product-video skills in June 2026.

The limits:
- It is a public beta, launched 2026-04-27 and due to reach all Creative Cloud plans from 2026-10-01 per the FAQ (search summary).
- Adobe frames it as executing the creator's direction, not autonomously finishing a film.
- Adobe's IP indemnity is enterprise-only and, per a non-official reading of Adobe's terms, excludes beta features.
- Adobe MAX 2026 (10–12 November 2026) is the next likely announcement point.

### Cited Findings
**Firefly AI Assistant**
- [Press release] 2026-04-15, Firefly AI Assistant "powered by Adobe's creative agent":
  - runs multi-step workflows across Firefly, Photoshop, Premiere, Lightroom, Express and Illustrator from one chat;
  - "asks contextual questions, surfaces decisions" and keeps context across sessions;
  - can learn preferences over time and integrates with Frame.io review;
  - the creator "provide[s] the vision, judgment, and creative direction" while the assistant "handles the orchestration and execution".

  The Firefly Video Editor is multi-track, with Enhance Speech, noise, reverb and mix tools, colour controls and Adobe Stock (800M+ assets). Firefly has 30+ models: Kling 3.0 and Kling 3.0 Omni (new), Veo 3.1, Nano Banana 2, Runway Gen-4.5, Luma Ray3.14, FLUX.2[pro], ElevenLabs Multilingual v2, Topaz Astra and Firefly models. Adobe plans to bring the approach to third-party models including Anthropic's Claude. No indemnity statement — [Adobe newsroom, read 2026-10-15](https://news.adobe.com/news/2026/04/adobe-new-creative-agent).
- [Beta] 2026-04-27: the public beta was "Available globally starting today" for Creative Cloud Pro and paid Firefly plans (Pro, Pro Plus, Premium), with complimentary daily credits for the assistant during the beta.
  - "It asks you questions along the way to stay aligned with your creative vision."
  - Users can "refine, redirect or take over at any point".
  - It offers "a personalized experience that learns your creative preferences over time" (framed as forward-looking).
  - No GA date.

  [Adobe blog, read 2026-10-15](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta)
- [Beta / Private beta] 2026-06-18, new assistant skills:
  - "Transform product photos into polished short-form video content" with lighting, motion, audio and brand styling;
  - Quick Cut: "Automatically assemble footage into a polished first cut";
  - storyboards and "generate video directly from your storyboard";
  - brand kit creation.

  AI Assistant is in public beta across Premiere, Photoshop, Illustrator, InDesign and Frame.io (private beta in After Effects). A new Firefly studio with timeline editing is in private beta by waitlist. "More personalized and context-aware over time." The post does not mention clarifying questions or self-checking of output — [Adobe blog, read 2026-10-15](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work).
- [Beta → wider] According to the FAQ, the assistant becomes available to all users with a Creative Cloud plan from 2026-10-01 — [Adobe Firefly AI Assistant FAQ, read 2026-10-15](https://helpx.adobe.com/firefly/web/firefly-ai-assistant/ai-assistant-faq.html) (search summary; the page returned 403 to the fetcher, unverified).
- [Shipped] Adobe launched a "connector" making Adobe tools available inside Claude on 2026-04-28 — [Adobe blog, read 2026-10-15](https://blog.adobe.com/en/publish/2026/04/28/adobe-for-creativity-connector) (search summary; title only).

**Partner models**
- [Shipped] Adobe's partner-model help page lists:
  - Veo by Google for Firefly Boards, Firefly Graph, the video editor and the AI Assistant (beta);
  - Runway Gen-4.5 and Aleph 2.0 for prompt-to-edit video;
  - Sora 2 listed in a July 2026 Generate Video picker (now moot after the OpenAI shutdown).

  Each Adobe surface has its own model inventory — [Adobe HelpX partner models, read 2026-10-15](https://helpx.adobe.com/firefly/get-set-up/learn-the-basics/non-adobe-models-in-adobe-products.html) (search summary; the page returned 403 to the fetcher).

**Adobe MAX 2025 and 2026**
- [Shipped / Beta, 2025] At MAX on 2025-10-28 Adobe announced:
  - Firefly Generate Soundtrack and Generate Speech, and a timeline-based Firefly video editor;
  - Project Moonlight (private beta; a cross-app agent that learns tone and style, the origin of the AI Assistant);
  - Firefly Image Model 5;
  - the Photoshop and Express AI assistants (beta, waitlist).

  [Adobe blog, MAX 2025 moments, read 2026-10-15](https://blog.adobe.com/en/publish/2025/11/06/13-memorable-moments-from-adobe-max-2025) (search summary); [BGR, read 2026-10-15](https://bgr.com/2009551/adobe-max-2025-firefly-photoshop-premiere-ai-agents/) (search summary, secondary).
- [Announced] Adobe MAX 2026 runs 10–12 November 2026 at Miami Beach (online 10–11 November) — [Adobe MAX, read 2026-10-15](https://www.adobe.com/es/max.html) (search summary).

**Premiere Pro**
- [Shipped, 2025] Premiere Pro 25.2 (April 2025) made Generative Extend generally available (4K, landscape and vertical, plus audio, on the Firefly Video Model, with Content Credentials). It also added Media Intelligence (on-device content search) and caption translation in 27 languages — [Silicon UK (Adobe press release), read 2026-10-15](https://www.silicon.co.uk/press-release/new-ai-innovation-in-industry-leading-adobe-premiere-pro-empowers-video-pros-to-generate-edit-and-search-footage-at-lightning-speed) (search summary).

**Pricing and indemnity**
- Firefly plans reportedly start at $9.99/month — [RedShark News, read 2026-10-15](https://www.redsharknews.com/adobe-firefly-ai-assistant) (search summary, secondary). Needs checking against adobe.com.
- **Indemnity, official:** Adobe's enterprise page says customers can buy an entitlement "with contractual IP indemnification for select Firefly outputs" via Express/Firefly site licences or certain Creative Cloud enterprise plans, which needs a new contract — [Adobe Firefly Enterprise, read 2026-10-15](https://www.adobe.com/ie/products/firefly/enterprise.html) (search summary).
- **Indemnity, non-official reading (2026-09-07):** an Adobe Community Expert, explicitly "not an official Adobe response", quotes Adobe's product description as excluding "any features designated as 'beta' or 'trial'". On that reading the AI Assistant is not covered while in beta. Enterprise indemnity is said to cover outputs from "Adobe Firefly, Google, and OpenAI models" but not Runway, Kling or Black Forest Labs, and individual and team plans are not covered — [Adobe Community thread, read 2026-10-15](https://community.adobe.com/questions-404/using-firefly-ai-assistant-beta-for-final-production-and-i-indemnification-1640494) (secondary, unverified against Adobe's product-description document).

### Inferences
**Against the four promises today:**
- **P1, partial.** Chat-driven, but Adobe's model is "you direct, it executes", inside apps that still have timelines.
- **P2, yes on paper.** It "asks you questions" and uses brand kits.
- **P3, partial but broadest.** It has 30+ engines including Veo, Runway and Kling, plus Premiere editing, audio clean-up, colour controls, Quick Cut, storyboard-to-video and product video. It is not yet a single "finished multi-format cut" pipeline.
- **P4, partial and claimed.** "Learns your creative preferences over time"; no self-judging or auto-fix of failed shots is described.

**Overlap with Das Production:** Adobe is the most direct competitor to the "orchestrator that picks the right engine per shot" idea. It already routes across many third-party models in one UI.

**Where Das Production can differ:**
- autonomy (finish the film rather than assist);
- explicit self-critique and repair;
- per-person taste learning that actually ships;
- India and UK client-specific delivery.

**Legal risk:** commercial-use comfort for agency work is weaker than Adobe's "commercially safe" branding suggests when partner models or beta features are used.

### Gaps
- Firefly Video Model (Adobe's own) version and current per-plan video credit costs were not read; helpx returned 403.
- GenStudio for Performance Marketing video capabilities and pricing were not researched.
- Region restrictions for India and the UK beyond "globally" were not confirmed.
- Whether the assistant can output 16:9, 9:16 and 1:1 versions of one edit automatically was not found.
- MAX 2026 announcements are still to come, after 2026-10-15.

---

## Apple: Final Cut Pro, Apple Intelligence video, research

### Takeaway
Apple ships assistive, on-device editing AI in Final Cut Pro:
- masks and captions;
- transcript, visual and beat search;
- edit detection and colour match.

Apple ships no generative video and no video agent. Its research includes a text- and image-to-video model paper (STIV), but there is no product signal of a whole-video agent. Apple covers none of the four promises.

### Cited Findings
- [Shipped] Final Cut Pro release notes:
  - **11.0 (2024-11-13):** Magnetic Mask and Transcribe to Captions.
  - **11.1 (2025-03-27):** Image Playground (Apple Intelligence still images).
  - **12.0 (2026-01-28):** Transcript Search, Visual Search and Beat Detection.
  - **12.3 (2026-06-30):** Generate Captions (Apple silicon, US English only), Auto Mask, Edit Detection and Match Color.
  - **12.4 (2026-09-29):** Cinematic-mode editing, needing macOS 27.

  No release includes generative video — [Apple Support, Final Cut Pro release notes, read 2026-10-15](https://support.apple.com/en-us/102825).
- [Paper] STIV: "Scalable Text and Image Conditioned Video Generation", arXiv 2412.07730 (v1 2024-12-10, v2 2025-10-06). An 8.7B DiT model at 512 px scores 83.1 on VBench T2V and 90.1 on I2V, and the method extends to long-video and multi-view generation. The abstract page does not show affiliations, so Apple authorship is unverified here — [arXiv, read 2026-10-15](https://arxiv.org/abs/2412.07730).
- [Shipped] An "Apple Creator Studio" bundle with AI features across Final Cut Pro, Logic Pro and Pixelmator Pro was reported in 2026 — [Deccan Herald, read 2026-10-15](https://www.deccanherald.com/technology/artificial-intelligence/apple-creator-studio-gets-new-value-added-ai-features-and-more-4058840) (search summary, secondary, unverified).

### Inferences
- **Four promises:** 0 of 4. Apple is a tool and platform supplier, possibly the edit or finishing surface. It is not a likely builder of an autonomous whole-video agent in the near term, based on its shipped record.

### Gaps
- WWDC 2026 video or Apple Intelligence announcements were not researched (search budget).
- Final Cut Pro for iPad AI features specifically were not checked.
- Other Apple video-generation papers were not reviewed.

---

## Amazon: Nova Reel, Amazon Ads Creative Agent and Video Generator, Prime Video, AWS

### Takeaway
Amazon Ads' Creative Agent is the most complete end-to-end video agent any large company ships, but only for Amazon ad formats.
- It is chat-based.
- It researches product and audience, and builds storyboards with scene-level scripts.
- It produces multi-scene video and display ads with animation, music and voiceover.
- It costs nothing extra, with edit or regenerate at each stage.
- Launches were reported in the UK (2026-02-12) and Canada (2026-02-25).

On AWS:
- Nova Reel can produce up to 2-minute multi-shot 720p video with automated storyboarding, but is US East only for v1.1, and its docs mention no audio.
- The Nova 2 family lists no video-generation model.
- A secondary report says Amazon is winding down Reel and Canvas (unverified).

### Cited Findings
**Amazon Ads**
- [Shipped, UK] Creative Agent, 2026-02-12, inside Creative Studio:
  - chat-based;
  - "researches products and audiences, suggests ad concepts and taglines, and builds storyboards with scene-level scripts and visuals", then produces video and display ads with animation, music and voiceovers;
  - advertisers can edit or regenerate at each stage;
  - formats: Amazon DSP, Streaming TV, Sponsored Display, Sponsored Brands (and Video) and Brand Stores;
  - "at no additional cost";
  - "designed … to interact with advertisers and showcase its thinking at every step".

  The beta or GA status is unclear — [ChannelX, read 2026-10-15](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/) (secondary).
- [Shipped, Canada] Amazon Ads (unBoxed Toronto, 2026-02-25; page dated 2026-03-25): Creative Agent is "an agentic AI tool that enables advertisers to easily create professional-quality ads", with storyboard-format concepts and 50+ tools for copy, scripts, voices, music and video, "in just hours" at no additional cost. It uses "the recently launched Video Generator" — [Amazon Ads, read 2026-10-15](https://advertising.amazon.com/library/news/unboxed-toronto-2026).

**AWS**
- [Shipped] Amazon Nova Reel (`amazon.nova-reel-v1:1`): text-to-video and image-to-video "up to two minutes long … in six second increments at 1280x720 … 24 frames per second". It has automated multi-shot (4,000-character prompt), manual multi-shot and "Storyboarding videos", and is English only. Reel 1.1 is only in US East (N. Virginia), and Reel 1.0 is in us-east-1, eu-west-1 and ap-northeast-1. The docs page shows no audio and no deprecation notice — [AWS Nova Reel docs, read 2026-10-15](https://docs.aws.amazon.com/nova/latest/userguide/video-generation.html).
- [Shipped] The Nova 2 docs list Nova 2 Lite (text output), Nova 2 Sonic (speech) and Multimodal Embeddings. There is no video-generation model — [AWS Nova 2 docs, read 2026-10-15](https://docs.aws.amazon.com/nova/latest/nova2-userguide/what-is-nova-2.html).
- [Report] Business Insider reported, via Mezha, that Amazon is winding down Nova Premier, Omni, Reel and Canvas to focus on a new flagship model, possibly shown at re:Invent by the end of 2026 — [Mezha, read 2026-10-15](https://mezha.ua/en/news/amazon-shuts-down-nova-313675/amp/) (search summary, secondary, unverified; page 403).

### Inferences
**Against the four promises (Amazon ads only):**
- **P1, yes within ads:** chat in, ad out.
- **P2, partial:** it researches audience and shows its thinking.
- **P3, closest of any big player for short ads:** script, storyboard, scenes, voice, music, final video. No colour, titles or social-platform versions outside Amazon formats are documented.
- **P4, not stated.**

**Strategic read:** retail-media platforms (Amazon, Meta, Google Ads) are building whole-ad agents for free, to sell media. That commoditises short product video for their own placements. It does not target directed brand films, narrative, or cross-platform delivery.

**AWS signals:** possible retreat from in-house video generation (unverified), which means less pressure from AWS as an engine supplier.

### Gaps
- Whether Creative Agent is available in India or the US was not confirmed (search budget exhausted).
- Video Generator's underlying model is unknown.
- Prime Video's use of generative AI and AWS re:Invent 2025 video announcements were not researched.
- Nova Reel pricing per second was not read.
- Commercial terms for using Creative Agent output outside Amazon placements are unclear, so treat as not allowed.

---

## Microsoft: Bing Video Creator, Clipchamp, Copilot, MAI models

### Takeaway
Microsoft has no in-house video-generation model. Its MAI line covers image, voice and transcription. Its video features:
- **Clipchamp's Copilot Video Creator:** prompt → script + stock footage + AI voiceover + music + text, aimed at Microsoft 365 business users.
- **Bing Video Creator:** licensed OpenAI's Sora. Its status after the Sora API shutdown on 2026-09-24 is unknown.

Microsoft is weak on all four promises for professional video.

### Cited Findings
- [Shipped] The Microsoft AI news page lists MAI-Image-1 (about October 2025), MAI-Image-2 (about March 2026), 2-Efficient, 2.5, 2.5-Pro and 2.6 (about September 2026), MAI-Voice-2 and 2-Flash, and MAI-Transcribe-1. "No MAI-Video or other video generation model appears". Dates are inferred from image upload paths — [microsoft.ai news, read 2026-10-15](https://microsoft.ai/news/).
- [Shipped, 2025] Clipchamp Copilot Video Creator: "Enter a prompt and Clipchamp will create a customized script, source high-quality stock video footage", plus AI voiceover, music, text overlays and transitions. The draft opens in Clipchamp for editing. It is for Microsoft 365 Copilot business users and was scheduled for GA in February 2025. It does not generate video, using stock footage instead — [heise online, 2025-01-24, read 2026-10-15](https://www.heise.de/en/news/Copilot-gets-Clipchamp-support-for-automatic-video-creation-10255460.html) (secondary).
- [Shipped, 2025] Bing Video Creator launched in June 2025 on the Bing mobile app (Sora-powered, free fast generations) and was later upgraded to Sora 2, with C2PA credentials — [Windows Report, read 2026-10-15](https://windowsreport.com/microsoft-upgrades-bing-video-creator-with-openais-sora-2-ai-video-model/) (search summary, secondary; page 403).

### Inferences
- **Four promises:** Clipchamp covers parts of P1 and P3 for stock-based corporate video. P2 and P4 are absent.
- Microsoft's dependence on Sora for generative video is exposed by OpenAI's shutdown.
- Microsoft looks unlikely to lead in whole-film agents in the near term. A Copilot "make a video" for Microsoft 365 users is the likely shape, which competes with Google Vids, not with production houses.

### Gaps
- What powers Bing Video Creator after 2026-09-24 is unknown.
- Microsoft Build 2026 video announcements: only a "MAI keynote transcript" title was seen.
- Clipchamp pricing, regions and terms were not read.

---

## NVIDIA: Cosmos and controllable-video research

### Takeaway
NVIDIA's video models (Cosmos, now Cosmos 3) are world foundation models for physical AI: robotics, autonomous vehicles and video analytics. They are not creative tools. NVIDIA research on camera-controlled, 3D-consistent video (GEN3C) is relevant to shot control. NVIDIA is a supplier of models, GPUs and research, not a likely builder of a consumer or pro whole-video agent. It covers none of the four promises.

### Cited Findings
- [Shipped / open models] The Cosmos page:
  - Cosmos 3 is "The first omni-model with native reasoning, world and action generation".
  - Uses: vision reasoning, robot policy, "a controllable, physics-grounded world simulator", and synthetic video for training physical AI.
  - Use cases are robotics, AV and video-analytics agents. There is no mention of media, entertainment or creative pipelines.
  - "Cosmos WFMs are available under the OpenMDW1.1 license from Linux Foundation"; the page does not address commercial use.

  [NVIDIA Cosmos, read 2026-10-15](https://www.nvidia.com/en-us/ai/cosmos/)
- [Paper] GEN3C (CVPR 2025 Highlight; NVIDIA, University of Toronto, Vector Institute) builds a 3D point-cloud cache to give "precise camera control" and world-consistent video, including object removal and trajectory edits. Code is at github.com/nv-tlabs/GEN3C, with the licence not stated on the page — [NVIDIA Research GEN3C, read 2026-10-15](https://research.nvidia.com/labs/toronto-ai/GEN3C/).

### Inferences
- **Four promises:** 0 of 4. Possible ingredients for Das Production: camera-controlled generation, and an open-weights world model for previs-style shots. Licence terms (OpenMDW-1.1, and the GEN3C repo licence) must be read before any commercial use. Unclear means no.

### Gaps
- Cosmos Predict, Transfer and Reason version names and NVIDIA's GTC 2026 creative-pipeline announcements were not confirmed (search budget).
- The OpenMDW-1.1 commercial terms were not read.

---

## Autodesk (Flow Studio), Canva, and other large players (Netflix, Getty/Shutterstock, Snap, Pinterest, Spotify, Salesforce, Shopify)

### Takeaway
I could not verify these from current sources in this session. The shared search budget ran out, and autodesk.com and canva.com returned HTTP 403. The one confirmed fact is that wonderdynamics.com now redirects to Autodesk's Flow Studio product page, consistent with the Wonder Studio → Flow Studio rebrand. Everything else here is a gap, not a finding.

### Cited Findings
- [Shipped] wonderdynamics.com 301-redirects to https://www.autodesk.com/products/flow-studio. That product page returned 403, so its features and pricing could not be read — [Autodesk Flow Studio, read 2026-10-15](https://www.autodesk.com/products/flow-studio).
- [Unreachable] Netflix's former partner-help article on "Using Generative AI in Content Production" now 301-redirects to studiopartner.netflix.net. The page body was not readable — [Netflix Studio Partner, read 2026-10-15](https://studiopartner.netflix.net/studio/generative-workflows-applications-and-use-cases).

### Inferences
- None drawn. These companies should be researched in a follow-up session before the report states anything about them.

### Gaps
- **Autodesk Flow Studio:** what it does today (AI motion capture, CG character replacement, camera tracking and exports are its known scope, but not verified this session), plans and prices, and commercial terms. Needs checking.
- **Canva:** whether its video generation is Veo-powered or its own, generation limits per plan, Canva AI agent video features, Affinity, and any video-AI acquisitions. Needs checking.
- **Netflix:** generative-AI use in production and its partner guidance. Needs checking.
- **Getty Images / Shutterstock:** licensed video models and indemnity. Needs checking.
- **Snap, Pinterest, Spotify, Salesforce, Shopify:** any whole-video or ad-video agents. Not researched.

---

## Cross-company: will the big players build Das Production's autonomous whole-video agent themselves?

### Takeaway
They are building pieces, and two are converging on it.
- **Google** has every component in-house: Flow Agent, Gemini Omni, Flow Music, Vids, Asset Studio and VISTA research.
- **Adobe** has the closest shipped behaviour: a beta creative agent that asks questions, learns preferences, routes across 30+ models and auto-assembles first cuts.

The ad platforms are shipping free whole-ad agents for their own placements: Amazon Creative Agent, Meta Advantage+ and Ads Creative Studio, and Google Asset Studio and Pomelli. OpenAI has exited video entirely. Microsoft, Apple and NVIDIA are not building it.

No large player ships, as of 2026-10-15, a product that meets all four promises:
- one prompt to a finished multi-format cut with sound;
- asks only when needed;
- self-judges and repairs failed shots;
- learns an individual's taste.

### Cited Findings
- Google Flow Agent: "available to all Google Flow users globally"; plans multi-step tasks, variations and batch edits — [Google blog, read 2026-10-15](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/).
- Google researchers' VISTA: plan → generate → tournament → three critics → rewrite, multi-scene — [arXiv, read 2026-10-15](https://arxiv.org/abs/2510.15831).
- Adobe Firefly AI Assistant: "asks you questions along the way", "learns your creative preferences over time", public beta — [Adobe blog, read 2026-10-15](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta). Quick Cut and storyboard-to-video — [Adobe blog, read 2026-10-15](https://blog.adobe.com/en/publish/2026/06/18/adobe-firefly-introduces-new-agentic-capabilities-and-an-upgraded-creative-ai-studio-built-for-the-way-you-work).
- Amazon Creative Agent: storyboard, scene scripts, voiceover, music, final ad, no extra cost — [ChannelX, read 2026-10-15](https://channelx.world/2026/02/amazon-ads-launches-creative-agent-for-professional-quality-ads/) (secondary); [Amazon Ads, read 2026-10-15](https://advertising.amazon.com/library/news/unboxed-toronto-2026).
- Meta: agentic campaign creation in test, with "explicit approval before anything is published" — [Meta newsroom, read 2026-10-15](https://about.fb.com/ltam/news/2026/10/advertising-week-new-york-2026-nuevas-capacidades-de-ia-para-guiar-campanas-y-llegar-a-los-clientes/).
- OpenAI: Sora 2 and the Videos API shut down 2026-09-24, "no one-to-one replacement" — [OpenAI, read 2026-10-15](https://developers.openai.com/api/docs/models/sora-2).

**Scorecard against the four promises** (today, shipped or beta; my assessment from the findings above):

| Company / product | P1 one prompt, no timeline | P2 intent, asks only when needed | P3 does everything | P4 self-judge, fix, taste | Stage |
|---|---|---|---|---|---|
| Google Flow Agent + Omni (+ Flow Music) | Partial | Not stated | Partial (shots, music videos, variations) | No (VISTA paper only) | Shipped (agent global; Omni for subscribers) |
| Google Vids | Partial (prompt to draft) | Not stated | Partial (script, avatars, voice, music, 16:9/9:16/1:1) | No | Shipped |
| Adobe Firefly AI Assistant | Partial | Yes (claimed) | Partial, broadest (30+ models, Premiere, Quick Cut, storyboard-to-video) | Partial (claims preference learning; no self-judging) | Public beta |
| Amazon Ads Creative Agent | Yes (ads only) | Partial | Ads only (script, storyboard, voice, music, video) | Not stated | Shipped (UK, Canada) |
| Meta Advantage+ / Ads Creative Studio | Partial | Partial (brand guidelines; secondary) | Ads only | Ad-performance optimisation, not taste | Shipped, beta and test mix |
| OpenAI Sora | None | None | None | None | Discontinued |
| Microsoft Clipchamp Copilot | Partial (stock-based) | No | Partial (script, stock, voice, music) | No | Shipped (2025) |
| Apple Final Cut Pro | No | No | No (assistive editing only) | No | Shipped |
| NVIDIA Cosmos | No | No | No (physical AI) | No | Shipped open models |

### Inferences
- **Risk is highest from Google, then Adobe.**
  - Google owns the engines (Veo, Omni, Lyria), the agent, the distribution (YouTube, Shorts, Vids, Ads) and the research on self-improving multi-scene agents. A joined-up "Flow makes your whole film" is a plausible next step, but it is not announced.
  - Adobe is the direct match on orchestration across engines and on asking questions and learning preferences. Adobe MAX (10–12 November 2026) is the next date to watch.
- **The ad platforms will give whole-ad agents away free** inside their own ad systems. Das Production should not compete on single-platform performance ads.
- **Gaps big players leave, as of this date:**
  1. Real self-judging and repair of failed shots in a shipped product: research only.
  2. Per-person taste learning that is shipped, not claimed.
  3. Engine-agnostic routing that survives an engine's disappearance (OpenAI's exit proves the need).
  4. Indemnity-aware model choice for client work. Adobe's indemnity is enterprise-only and excludes beta and some partner models (unverified); Google's indemnity is stated for GA Veo on its cloud API.
  5. India and UK client delivery norms: languages, formats, brand review.
- **Sources of these inferences:** they combine the cited findings; none is a statement by the companies.

### Gaps
- Big-company job postings and earnings-call roadmap statements on video agents were not researched; the search budget ran out.
- Adobe MAX 2026 (November) and AWS re:Invent 2026 (expected late 2026) fall after this research date.
- India-specific availability was not confirmed for most products. "Global" claims (Gemini Omni, Flow Agent, Firefly AI Assistant) come from company posts that also say features vary by region and tier.
