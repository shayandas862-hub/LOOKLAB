# Autonomous video agent: planning, audio (voice, music, SFX, lip sync) and editing/delivery, as of 2026-10-15

**How to read these notes**
- Every source was read on **2026-10-15** unless a row says otherwise. Prices are what the page showed that day.
- Origin labels: **[shipped]** product or docs page for a live product; **[preview]** or **[beta]** as the vendor labels it; **[paper]** arXiv or other paper; **[press]** news article; **[vendor claim]** the maker's own unverified claim; **[secondary]** a third-party write-up; **[search summary]** a web-search answer whose underlying page I did not open (lower confidence); **[unverified]** could not be confirmed.
- Licence rule used throughout: if the terms are unclear, the item counts as **not allowed** for commercial client work.
- Session limits:
  - The shared web-search budget ran out partway through, so later checks used direct fetches of known URLs only.
  - GitHub API access was blocked in this session. Open-model licences come from the Hugging Face model API and model cards.
  - Several pages render only with JavaScript and could not be read: Udio, Kling, VEED, Netflix's sound spec, the Adobe helpx "what's new" page and Adobe GenStudio. These appear under Gaps.

---

## 1. Planning: how well do LLMs and tools turn a brief into a script, shot list and storyboard?

### Takeaway
- Frontier LLMs are cheap and fast enough to write drafts of scripts, shot lists and prompts. Papers from 2025–26 still find that end-to-end LLM screenplays are structurally weak: generic, inconsistent characters, poor plot logic.
- No public benchmark scores a shot list for shot grammar.
- Storyboard tools are cheap ($15–$125/month), but their commercial terms vary, and most image allowances come from third-party models.
- Planning is "buy the LLM, build the structure": decompose the task, use schemas, and check continuity yourself.

### Cited Findings

**Table P: planning options (read 2026-10-15)**

| Option | What it does | How good (evidence) | Price (read now) | Licence / commercial use | Known limits | Source |
|---|---|---|---|---|---|---|
| Claude (Anthropic): Opus 5.5, Fable 5.1, Sonnet 5.5 | General LLM for treatment, script, shot list, prompt writing | No screenwriting benchmark of these versions found | Opus 5.5 $4 in / $20 out per MTok. Fable 5.1 $10 / $50. Sonnet 5.5 $2 / $10. Haiku 5.5 $0.10 / $0.50 (prompts ≤100k tokens) [shipped] | API terms not re-read here | See the papers below | [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| OpenAI GPT-6 Astra (`gpt-6-astra`) | Flagship general LLM | No screenwriting benchmark found | $10 in / $50 out per 1M tokens [shipped] | Not re-read | — | [OpenAI models](https://developers.openai.com/api/docs/models) |
| Google Gemini 4 Argon (`gemini-4-argon`) | Flagship general LLM | No screenwriting benchmark found | $2 in / $10 out per 1M tokens until 30 Nov 2026, then $4 / $20 from 1 Dec 2026. Not on the free tier [shipped] | Not re-read | — | [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| LTX Studio (Lightricks) | Script-to-video, AI storyboards, pitch decks, node "Flows". Bundles LTX-2.5/2.3 and partner models: Veo 3.1, Kling 2.6/3.0 Pro, Seedance 2.0, Nano Banana 2, FLUX.2 Pro, ChatGPT Images 2.0 [shipped] | No independent test found | Free: 800 one-time credits. Lite $15/mo (8,000 credits). Standard $35/mo or $28 yearly (28,000 credits). Pro $125/mo or $100 yearly (110,000 credits). Enterprise custom. **The page also carries stale promotions** ("Cyber Monday", "FLUX.2 promotional offer valid until December 12, 2025"), so treat prices as "needs checking" | Free is a "Personal use license … Cannot be used for business, marketing, or paid work". Standard and up carry a "Commercial use license". Lite's commercial status is not stated, so treat it as not allowed | Veo 3.1 only on Pro and up. Enterprise adds custom LTX-2.3 training and "multi-language video versioning" | [LTX pricing](https://ltx.io/studio/pricing) |
| Boords | Storyboards and scripts, AI storyboard and script generators, "Boords Agent", MCP server on paid plans [shipped] | No independent test | Solo $39/mo ($26 yearly), 250 AI images/mo. Pro $75 ($50), 1,000. Team $125 ($85), 2,000. Agency $250 ($165), 3,000 | The pricing page says nothing about commercial use of AI images, so **unclear, treat as not allowed until checked** | Free: 5 storyboards and 3 scripts | [Boords pricing](https://boords.com/pricing) |
| Katalist | Script-to-storyboard with consistent characters, AI voiceover, lip sync, video credits. Lists Runway Gen-4, Veo 3.2, Kling, Pixverse, WAN, **Sora 2**, LTX-2. Premiere Pro integration on Pro [shipped] | No independent test | Essential $19 (200 image / 700 video credits). Pro $39. Unlimited $99. The page also shows different annual figures ($29, $31, $79/mo), which is inconsistent: needs checking | Commercial terms not read, so unclear | The page still lists Sora 2, but OpenAI shut the Sora 2 API down on 24 Sep 2026 (see §4). Possibly stale | [Katalist pricing](https://www.katalist.ai/pricing) |
| StoryboardHero | Concept → structured script (VO, camera angle, transitions) → storyboard, with optional human sketch artists [shipped] | No independent test | Solo $19/mo (1 seat, 100 premium images). Starter $59 (5 seats). Advanced $199 (10 seats). Human sketches: 10 credits for $99 | "Commercial use" listed on every plan | — | [StoryboardHero pricing](https://storyboardhero.ai/pricing) |
| Previs Pro | 3D previs on Mac, iPad and iOS: sets, cameras, lights, FaceCap/PoseCap, screenplay import, animatics, export to 2D/3D/MP4/NLE. AI-generated actors, props, images and video "by use" [shipped] | User reviews only | Free. Monthly shown as "$39 99" (garbled; verify). Annual $119.99/yr. Lifetime $359.99. Apple adjusts prices by region | Not read | Apple only. Free exports carry a watermark | [Previs Pro pricing](https://previspro.com/pricing) |
| Storyboarder (Wonder Unit) | Free drawing-based storyboarder: shot type and timing metadata, export to Premiere, Final Cut, Avid, PDF. Version 1.0.0 [shipped] | — | Free | Page says "free and open source". Exact licence not verified (GitHub blocked this session) | No AI generation | [Wonder Unit](https://wonderunit.com/storyboarder/) |

**Papers and benchmarks on LLM screenwriting and shot planning**
- **[paper]** "Beyond Direct Generation" (DSR), arXiv 2510.23163 (v1 27 Oct 2025, v3 7 Jan 2026), [link](https://arxiv.org/abs/2510.23163):
  - The authors say "direct end-to-end generation approaches often fail to produce well-crafted screenplays". Such screenplays "mimic superficial style but lack the deep structural integrity and storytelling substance required for professional use".
  - Their two-stage method (outline → novel-style prose → formatted screenplay) had a **75% win rate against Gemini-2.5-Pro** in blind evaluation by professional screenwriters and reached **82.7% of human-level performance**.
  - The search summary says the test set was 32 TV scenes **[search summary]**.
- **[paper]** CML-Bench, arXiv 2510.06231 (1 Oct 2025), [link](https://arxiv.org/abs/2510.06231):
  - Scores scripts on Dialogue Coherence, Character Consistency and Plot Reasonableness.
  - States that LLMs "often fail to capture" the storytelling and emotional depth of movie scripts. No scores appear in the abstract.
- **[paper]** DramaBench, arXiv 2512.19012 (Dec 2025), [link](https://arxiv.org/abs/2512.19012):
  - Six dimensions: Format Standards, Narrative Efficiency, Character Consistency, Emotional Depth, Logic Consistency, Conflict Handling.
  - 8 LLMs (unnamed in the abstract), 1,103 scripts, 8,824 evaluations.
  - 65.9% of 252 pairwise comparisons were significant. Human agreement was "substantial" on only 3 dimensions.
- **[paper]** ViMax, "Agentic Video Generation", arXiv 2606.07649 (June/July 2026), [link](https://arxiv.org/abs/2606.07649):
  - Hierarchical narrative engine with RAG, dependency-aware tracking of character and environment state across scenes, VLM-guided checking agents.
  - The abstract names "lack [of] cross-scene consistency" as the core problem with existing methods. No results in the abstract.
- **[search summary]** Related work I did not open:
  - [DramaDirector / DramaBoard (arXiv 2606.24107)](https://arxiv.org/html/2606.24107v1): shot-level storyboard benchmark.
  - [ViStoryBench (arXiv 2505.24862)](https://arxiv.org/html/2505.24862v4): storyboard-to-image consistency metrics.
  - [Stable Cinemetrics (arXiv 2509.26555)](https://arxiv.org/pdf/2509.26555): taxonomy of shot controls.
  - [FilmBench (arXiv 2607.24241)](https://arxiv.org/html/2607.24241v1): multi-shot prompts with shot scale, camera move and composition.
  - [SAGE (arXiv 2608.17468)](https://arxiv.org/pdf/2608.17468): self-evolving storyboard skills.
  - The search found **no paper that benchmarks LLMs on writing shot lists as such**.

### Inferences
- The papers agree that one-shot "write me a film" prompting gives generic or weak structure. A decomposed pipeline does measurably better in at least one blind professional test: brief → beats → scenes → shot list, with schema-constrained output and a continuity tracker for characters, wardrobe, props and locations. This favours *building* the planning layer on top of a bought LLM.
- The LLM itself is a commodity. Claude Sonnet 5.5, Gemini 4 Argon and similar cost dollars per film plan. The value Das Production can add is the shot-grammar and continuity rules, plus its own past scripts and analyses (it already has das-analyst and das-writer workflows).
- Storyboard SaaS tools mostly wrap the same third-party image and video models. For an autonomous agent they are useful mainly as a human review surface (Boords has an MCP server; LTX has Flows), not as the planning brain.

### Gaps
- No independent screenwriting or shot-list scores exist for the current frontier versions (Claude Opus 5.5 / Fable 5.1, GPT-6 Astra, Gemini 4 Argon). The EQ-Bench creative-writing board did not render ([eqbench](https://eqbench.com/creative_writing.html)).
- Not checked: "Shai" and other storyboard tools; Boords' and Katalist's AI-output licence terms; the Storyboarder licence file.
- Nothing found on Bengali or Hindi screenwriting quality from LLMs.

---

## 2. Voice: TTS, cloning and consent, Bengali and Hindi quality

### Takeaway
- English TTS is effectively solved and cheap. ElevenLabs Eleven v4 (launched 28 Sep 2026) leads the independent Artificial Analysis arena.
- Bengali and Hindi are supported by ElevenLabs v4, Gemini 3.8 TTS, Cartesia, Sarvam Bulbul, Azure and the open AI4Bharat models.
- The only head-to-head Indian-language evidence I found is a vendor-commissioned study (Sarvam / Josh Talks). Independent Bengali quality data effectively does not exist, so Das Production should run its own listening test.
- Cloning needs explicit consent under every major provider's terms.

### Cited Findings

**Table V: voice options (read 2026-10-15)**

| Option | What it does | How good (evidence) | Price (read now) | Licence / commercial / consent | Known limits | Source |
|---|---|---|---|---|---|---|
| ElevenLabs Eleven v4 and v4 Turbo [shipped; launched 28 Sep 2026 per press] | TTS in 90+ languages. Expression tags. Cloning from about 10 s of audio [press / vendor claim] | Artificial Analysis Speech Arena (provider voices): **#1 v4 Turbo 1327, #2 v4 1327**. Controlled-voice (cloning) board: v4 Turbo 1162 (#3), v4 1159 (#4). English US/UK only | API: v4 $0.08 per 1K chars, v4 Turbo $0.04. Creator plan $22/mo includes 275k v4 characters | Use policy (updated 9 Oct 2026): no cloning a living person "without explicit and informed consent"; no voice recordings of under-18s; no bypassing Voice CAPTCHA verification; no removing ElevenLabs watermarks or provenance signals | v4: 10,000 chars per request. Docs list **Hindi (hi) and Bengali (bn)** plus 12 more Indian languages. Multilingual v2 and Flash v2.5 have Hindi but **no Bengali** | [AA leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard); [AA controlled](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice); [EL API pricing](https://elevenlabs.io/pricing/api); [EL models](https://elevenlabs.io/docs/overview/models); [EL languages](https://elevenlabs.io/docs/help-center/other/what-languages-do-you-support.md); [EL use policy](https://elevenlabs.io/use-policy); [TechCrunch](https://techcrunch.com/?p=3170480) |
| Google Gemini 3.8 Flash TTS and Flash-Lite TTS [shipped; not labelled preview] | TTS with single or multi-speaker output (multi-speaker only with prebuilt voices, max 2), voice design and voice replication. 30 prebuilt voices plus an extended library | AA arena: 3.8 Flash TTS **1272 (#5)**, Flash-Lite 1246 (#8) | Flash: $0.50 per 1M text tokens in, $9.00 per 1M audio tokens out, until 31 Dec 2026; both double from 1 Jan 2027 (about $0.00225 per 10 s now). Flash-Lite: $6.00 per 1M out | Gemini API terms for cloned voices not read, so treat as unclear | Hindi and "Bangla" listed for both 3.8 models. 200 stateful custom voices per project | [Gemini TTS docs](https://ai.google.dev/gemini-api/docs/speech-generation); [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing); [AA](https://artificialanalysis.ai/text-to-speech/leaderboard) |
| OpenAI gpt-4o-mini-tts, tts-1, tts-1-hd [shipped] | TTS | Not in the AA top 15 | gpt-4o-mini-tts $12 per 1M audio output tokens (text in $0.60/1M). tts-1 $15 per 1M chars. tts-1-hd $30 per 1M chars | Not read | Hindi and Bengali quality not verified | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| Cartesia Sonic 3.6 [shipped] | Low-latency TTS, instant and professional cloning | AA arena **1284 (#4)**, controlled-voice 1149. AA's new multilingual boards (9 languages, India's flag shown) reportedly have Sonic leading 8 of 9 **[search summary; AA's X post returned HTTP 402, unverified]** | Pro $5/mo (100K credits). Startup $49 (1.25M). Scale $299 (8M). 1 credit = 1 character; about 750–800 credits per minute. Overage $38–65 per 1M | Commercial use on paid plans. Professional clones only on Startup and up | Languages page lists **Bengali and Hindi** plus 7 other Indian languages | [Cartesia pricing](https://cartesia.ai/pricing); [Cartesia languages](https://cartesia.ai/languages); [AA X post (search)](https://x.com/ArtificialAnlys/status/2102490340678856997) |
| Sarvam AI Bulbul v3 (stable) and bulbul:v4-flash ("latest, recommended") [shipped] | Indian-language TTS: 11 languages (10 Indian plus en-IN), including **Hindi and Bengali**. 30+ named speakers. 8–48 kHz | Sarvam's blog (7 Feb 2026) cites a blind A/B study by Josh Talks: 11 languages, 20,000+ votes, 500+ annotators. **ElevenLabs v3 alpha led on full-band quality.** Bulbul v3 beat Cartesia Sonic-3 and others and led at 8 kHz telephony. Error-rate and CER claims are Sarvam's own, with no numbers published **[vendor-commissioned]** | About ₹30 per 10K characters for v3 (₹15 for v2). Free tier with 1,000 credits **[search summary of sarvam.ai pages]** | Licence and terms not on the docs page. Cloning is "consent-based" via enterprise sales [vendor claim] | 2,500 chars per REST request. No v4-flash quality data found | [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/models/bulbul); [Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3); [Sarvam TTS page (search)](https://www.sarvam.ai/text-to-speech); [usagepricing (secondary, search)](https://usagepricing.com/blueprint/sarvam-ai) |
| Microsoft Azure Speech [shipped] | Neural TTS, custom and personal voice | Not in the AA top 15 | Price figures did not render (placeholders), so needs checking | Personal voice is "limited-access … restricted to pre-approved use cases" | bn-IN: only 2 standard voices (Tanishaa, Bashkar); bn-BD: 2. hi-IN: 9 standard plus 4 HD (MAI-Voice-2). No Bengali HD voices | [Azure languages](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts); [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/) |
| AI4Bharat IndicF5 (open) | Zero-shot, reference-voice TTS in 11 Indian languages, **including Bengali and Hindi**. Trained on 1,417 h from Rasa, IndicTTS, LIMMITS and IndicVoices-R | "Near-human" [vendor claim]. No independent score found | Self-host | HF licence tag **MIT**; gated (automatic approval). Training-data licences not checked | Needs a reference clip, which means consent from that speaker | [HF API](https://huggingface.co/api/models/ai4bharat/IndicF5); [GitHub README](https://github.com/AI4Bharat/IndicF5) |
| AI4Bharat Indic Parler-TTS (open) | Description-prompted TTS in 18+ languages, including bn and hi | No independent score found | Self-host | HF licence tag **Apache-2.0**; gated (automatic) | — | [HF API](https://huggingface.co/api/models/ai4bharat/indic-parler-tts) |
| Resemble AI / Chatterbox Multilingual V3 (open) | 0.5B multilingual cloning TTS, 23 languages including **Hindi (no Bengali)**, plus a Hindi single-language finetune | Card says it is "consistently preferred" over ElevenLabs in side-by-side tests [vendor claim] | Self-host. Resemble's paid site now sells detection and watermarking (e.g. audio detection $0.015–0.035/s) | Model **MIT**. Resemble sells PerTh watermarking and C2PA provenance | Not on the AA top lists | [Chatterbox card](https://huggingface.co/ResembleAI/chatterbox); [Resemble pricing](https://www.resemble.ai/pricing/) |
| Fish Audio S2 Pro (open weights) | 80+ languages including hi and bn, inline emotion tags | AA open-weights board 1116. Fish Audio Drama 3 Preview tops open weights at **1242** | Self-host | **Fish Audio Research License: non-commercial only**; commercial use needs a separate licence, so **not allowed** | — | [S2 Pro card](https://huggingface.co/fishaudio/s2-pro); [AA open weights](https://artificialanalysis.ai/text-to-speech/leaderboard/provider-voice/open-weights) |
| Others on the AA top 15 | Alibaba Qwen-Audio-3.1-TTS-Plus 1296 (#3, $19.3/1M chars), Inworld Realtime TTS-2 1260, Speechify Simba 3.2 1244 ($6.6/1M) | — | Prices per AA | Not checked | Indian-language support not checked | [AA](https://artificialanalysis.ai/text-to-speech/leaderboard) |

**Other findings**
- HeyGen Voice tops the Artificial Analysis controlled-voice (cloning) board at 1200. That board uses 8 cloned voices, 4 US and 4 UK, so English only ([AA controlled](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)).
- AA's main TTS page has no Hindi or multilingual board. The only filters are US and UK accents ([AA](https://artificialanalysis.ai/text-to-speech/leaderboard)).
- Earlier snapshots differ: one cited Gemini 3.1 Flash TTS as the leader at 1214, a third party had Inworld leading in April. The live page read today has Eleven v4 first **[search summary for the older snapshots]**.
- DaVinci Resolve 21 now has an "AI Speech Generator" that speaks with a Blackmagic voice or a cloned short sample ([Resolve what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)).

### Inferences
- **Buy, don't build**:
  - English and UK voice: ElevenLabs v4 is the quality leader by independent blind vote. Gemini 3.8 Flash TTS is about 5–10× cheaper per minute and only modestly lower on Elo.
  - Bengali: the only evidence is Sarvam's commissioned study, which put ElevenLabs v3 ahead on studio-quality audio and Bulbul ahead of Cartesia. Eleven v4, Gemini 3.8, Cartesia and Bulbul v3/v4 all list Bengali.
  - A 30-minute in-house blind test with Kolkata native speakers would decide this. Score names, numbers, code-mixed Bengali-English and emotion.
- **Open, self-hostable Indian voices that are commercially clean**: IndicF5 (MIT) and Indic Parler-TTS (Apache-2.0). Fish S2 is not usable commercially.
- **Consent**: every serious vendor requires explicit consent to clone and forbids removing provenance or watermarks. The agent should store a signed consent record per cloned voice and never clone from scraped audio.

### Gaps
- No independent Bengali or Hindi TTS benchmark found. The AA multilingual board post could not be opened (HTTP 402).
- No current Azure TTS prices (the page did not render).
- Not checked: OpenAI TTS Hindi/Bengali quality, Gemini voice-replication consent terms, ElevenLabs commercial rights per TTS plan.
- India's rules on labelling AI-generated (synthetic) media could not be researched because the search budget was spent, and they matter for delivery in India. **Needs checking.**
- India personality-rights case law on voice cloning: not researched.

---

## 3. Music: generators, quality, licences, and what the 2025–26 label deals mean

### Takeaway
- Suno v6 is the clear quality leader on Artificial Analysis's music arenas, and Lyria 3.5 / 3 Pro are next among the big labs.
- The legal picture has **not** settled:
  - Warner has licensed Suno.
  - **UMG and Sony filed a second suit against Suno on 18 Sep 2026, targeting v6** **[search summary]**.
  - Suno gives no non-infringement warranty and makes the user indemnify Suno.
  - ElevenLabs Music **excludes film, TV and radio** below its Enterprise Music tier.
- For client film work the safest options are an enterprise music licence, or an open model trained on licensed data (ACE-Step 1.5 says it is) with your own legal review. Stock or library music remains a valid fallback.

### Cited Findings

**Table M: music options (read 2026-10-15)**

| Option | What it does | How good (evidence) | Price (read now) | Licence / commercial use | Known limits / legal | Source |
|---|---|---|---|---|---|---|
| Suno v6, v6-wild, v6-mini [shipped] | Full songs with vocals; stems (Pro: 2 types, Premier: 3); Suno Studio (Premier) | AA music arena: **Vocals #1 Suno v6 1146, #2 v6-mini 1130. Instrumental #1 v6 1148, #2 v6-mini 1114** | Free (50 credits/day, no downloads). Pro $8/mo (2,500 credits, **20 downloads/mo**). Premier $24/mo (10,000 credits, 60 downloads/mo). 20% off yearly | Terms revised 10 Aug 2026, effective 3 Sep 2026. Free output is personal and non-commercial only. Paid tiers may use output commercially only via permitted downloads. Suno "makes no representation … that any copyright will vest". **No warranty** that use "will not infringe". **The user indemnifies Suno**. Suno may watermark and publicly identify output as Suno-made | Warner settled Nov 2025 and V6 is said to be built on Warner, BMG and Believe licences **[secondary/search summary]**. **UMG and Sony sued again on 18 Sep 2026** (D. Mass., 60,202 recordings, aimed at v6 training on outputs and preference data of older models); Suno says v6 used licensed partner content and community signals **[search summary of edm.com, mlex]** | [AA vocals](https://artificialanalysis.ai/music/leaderboard/vocals); [AA instrumental](https://artificialanalysis.ai/music/leaderboard/instrumental); [Suno pricing](https://suno.com/pricing); [Suno terms](https://suno.com/terms); [EDM.com (search)](https://edm.com/industry/universal-sony-file-another-copyright-lawsuit-against-suno/); [tech-insider (secondary, search)](https://tech-insider.org/suno-v6-warner-bmg-licensing-deal-2026/) |
| Udio [status unclear] | Music generation | Not on the AA top 10 | Could not read (JavaScript page) | UMG settled with Udio in Oct 2025 to build a licensed platform for 2026. Reported as a "walled garden" where **outputs cannot be downloaded or distributed** externally **[search summary; secondary]**. Reports conflict on whether Warner settled with Udio | **Treat as not usable** for client delivery | [dubspot (secondary, search)](https://blog.dubspot.com/ai-music-licensing-explained-2026); [dynamoi timeline (secondary, search)](https://dynamoi.com/learn/ai-music-distribution/ai-music-copyright-cases-timeline) |
| Google Lyria 3.5, Lyria 3 Pro (preview), Lyria 3 Clip (preview) [shipped / preview] | Full songs with vocals and timed lyrics, or instrumental. Up to 10 image inputs. 44.1 kHz stereo MP3 or WAV | AA: Vocals Lyria 3.5 1052 (#5), 3 Pro 1051 (#6). Instrumental 3 Pro 1080, 3.5 1078 | **$0.08 per full song** (3.5 and 3 Pro). $0.04 per 30 s clip | Every output carries a **SynthID** watermark. Prompts naming artist voices or copyrighted lyrics are blocked. The docs page says nothing about commercial use, so **unclear** (check Gemini API terms and indemnity) | Single-turn only, no edit or refine. Lyrics follow the prompt language; Hindi and Bengali not confirmed. Length "a couple of minutes" | [Lyria docs](https://ai.google.dev/gemini-api/docs/music-generation); [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing); [AA](https://artificialanalysis.ai/music/leaderboard/vocals) |
| ElevenLabs Music (Eleven Music v2.5) [shipped] | Songs and instrumentals | AA Vocals v2.5 **1012 (#7)**. Instrumental Eleven Music 1021 | API $0.15 per minute. "Commercial use licensing on Starter+ plans" | Music terms updated 9 Oct 2026. Free through Business plans: "All online and offline commercial use permitted, **except film, TV, radio, and Studio Games**". Only **Enterprise Music** has unrestricted media rights. Streaming distribution from Creator up. Scale is for <10 employees, Business for <50. No building music libraries | A film company needs the Enterprise Music tier for film or TV use | [EL music terms](https://elevenlabs.io/music-terms); [EL API pricing](https://elevenlabs.io/pricing/api) |
| Mureka V9.5 / V9 | Songs | AA Vocals **#3 (1107)**, Instrumental #3 (1084) | Not checked | Not checked, so unclear | — | [AA](https://artificialanalysis.ai/music/leaderboard/vocals) |
| MiniMax Music 3.0 / 2.5+ | Songs | AA anchor at 1000 (vocals). 2.5+ at 1007 (instrumental) | Not checked | Not checked | — | [AA](https://artificialanalysis.ai/music/leaderboard/instrumental) |
| Stability AI Stable Audio 3 Large; Stable Audio Open | Instrumental and SFX generation | AA Instrumental Stable Audio 3 Large **1014 (#8)** | Self-host or API | Community Licence: **free for organisations under US$1M annual revenue**; Enterprise licence above that. "Stable Audio 3.0" is listed as covered. You own outputs. Stable Audio Open 1.0 uses the "stable-audio-community" licence | No vocals focus | [Stability licence](https://stability.ai/license); [HF API](https://huggingface.co/api/models/stabilityai/stable-audio-open-1.0) |
| ACE-Step 1.5 (open) | Open music model: an LM planner writes a song blueprint, a DiT renders it. Loops up to 10-minute songs, covers, repainting, 50+ lyric languages | "Commercial-grade" and full song in <10 s on an RTX 3090 **[vendor claim / secondary]**. Not on the AA top 10 | Self-host | HF licence **MIT** (v1.5; v1 was Apache-2.0). The card says it was trained partly on "professionally licensed music tracks" and that output can be used "for commercial purposes" **[vendor claim]** | Training-data provenance is self-reported | [HF card](https://huggingface.co/ACE-Step/Ace-Step1.5); [HF API v1](https://huggingface.co/api/models/ACE-Step/ACE-Step-v1-3.5B); [search summary](https://comfyui-wiki.com/en/models/ace-step/ace-step-v1-5) |
| YuE (open) | Lyrics-to-song with vocals | Not on the AA top 10 | Self-host | HF tag **Apache-2.0** (YuE-s1-7B-anneal-en-cot). Training-data provenance not checked | — | [HF API](https://huggingface.co/api/models/m-a-p/YuE-s1-7B-anneal-en-cot) |
| Meta MusicGen (open) | Instrumental generation | Old (2023) | Self-host | **CC-BY-NC-4.0: non-commercial, not allowed** | — | [HF API](https://huggingface.co/api/models/facebook/musicgen-large) |

**What the label deals mean** (mostly **[secondary]**)
- Commercial use now depends on platform, tier and model version. Output of a licensed model on a paid tier is not the same as output of an older, unlicensed model ([dubspot, secondary via search](https://blog.dubspot.com/ai-music-licensing-explained-2026); [versely, secondary via search](https://www.versely.studio/blog/music-licensing-after-settlements)).
- In the UMG/Sony case, Judge Saylor declined on 18 Aug 2026 to expand the first case. The new complaint went to the same judge, who wants a fair-use ruling **[search summary]** ([EDM.com](https://edm.com/industry/universal-sony-file-another-copyright-lawsuit-against-suno/)).

### Inferences
- The "deals" did not make AI music safe for client film work:
  - Suno, the quality leader, is still being sued by two of the three majors, and its terms push infringement risk onto the user.
  - ElevenLabs carves film and TV out below Enterprise.
  - Udio reportedly cannot export at all.
- For a production company delivering to clients, use one of three routes:
  - an enterprise music agreement (ElevenLabs Enterprise Music, or a Lyria/Google deal with indemnity, which must be checked);
  - a self-hosted model whose terms are clear (ACE-Step 1.5 MIT, Stable Audio under $1M revenue), backed by a provenance log;
  - conventional library music or a composer for hero pieces.
- Quality spread: the gap between Suno v6 (1146) and Lyria (about 1050) or ElevenLabs (about 1012) is large on AA's arena. Open models do not appear in the top 10 at all, so open music is clearly behind closed music.

### Gaps
- Could not read Udio's site, so its current download and commercial status is secondary only.
- Not checked: Mureka and MiniMax terms; Google's indemnity coverage for Lyria; Hindi and Bengali vocal quality for any music model.
- Primary label press releases were not read (search budget exhausted).

---

## 4. Sound effects and foley

### Takeaway
- Text-to-SFX up to 30 s is cheap and good enough for ambience and spot effects (ElevenLabs).
- Native audio inside video models (Veo 3.1) is bundled into the per-second price.
- Video-to-foley sync models exist as open source, but the strongest-known ones are **non-commercial (MMAudio)** or **exclude the UK and EU (HunyuanVideo-Foley)**.
- The OpenAI Sora 2 API was shut down on 24 Sep 2026.

### Cited Findings

**Table S: SFX and foley options (read 2026-10-15)**

| Option | What it does | How good | Price (read now) | Licence / commercial | Known limits | Source |
|---|---|---|---|---|---|---|
| ElevenLabs Sound Effects [shipped] | Text-to-SFX. 0.1–30 s per generation, looping ambiences, WAV 48 kHz (non-looping) or MP3 | No independent benchmark found | 40 credits per second when the duration is set. Pricing page: $0.12 per minute (the page also says "billed per generation", which conflicts) | Pricing page calls SFX "royalty-free". Per-plan terms not stated in the docs | 30 s maximum per generation | [EL SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects); [EL API pricing](https://elevenlabs.io/pricing/api) |
| Google Veo 3.1 (native audio) [preview model IDs] | Video with synced audio | Ranks for video quality are covered elsewhere; no audio-specific score found | With audio, per second: Standard $0.40 (720p/1080p), $0.60 (4K). Fast $0.10–0.12, $0.30 (4K). Lite $0.05–0.08 | Gemini API terms not re-read | Audio is not separable as its own product | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| OpenAI Sora 2 / Sora 2 Pro | Video with synced audio | — | Was $0.10/s (Sora 2), $0.30–0.70 (Pro) | — | **API shut down 24 Sep 2026, "no one-to-one replacement"** | [OpenAI Sora 2 docs](https://developers.openai.com/api/docs/models/sora-2) |
| Adobe Premiere (Firefly) [shipped] | Generative Extend "generate[s] missing ambient sound". Timeline generation of "video and sound effects" using the sequence as reference | No benchmark | Premiere $22.99/mo (first year, new subscribers) | Adobe Firefly terms not re-read | — | [Adobe Premiere](https://www.adobe.com/products/premiere.html) |
| Runway Seed Audio 1.0 (in Runway) [shipped] | Audio generation | — | 15 credits per minute | Runway plan terms not read | — | [Runway pricing](https://runway.com/pricing) |
| MMAudio (open) | Video-to-audio foley | Widely used in research; no score read | Self-host | **CC-BY-NC-4.0 checkpoints: "non-commercial purposes only"**, so not allowed | — | [HF card](https://huggingface.co/hkchengrex/MMAudio) |
| Tencent HunyuanVideo-Foley (open) | Video-to-foley | No score read | Self-host | Tencent Hunyuan Community licence: "**DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA**". Use of the works or **their output** outside the Territory is "unlicensed". Not usable for UK work; risky for India-made content shown in the UK | Above 100M MAU needs a separate licence | [Licence file](https://huggingface.co/tencent/HunyuanVideo-Foley/blob/main/LICENSE) |
| ThinkSound (FunAudioLLM, open) | Video-to-audio | Not checked | Self-host | HF tag **Apache-2.0** | Quality not checked | [HF API](https://huggingface.co/api/models/FunAudioLLM/ThinkSound) |
| Kling 3.0 native audio | Video with audio | — | Kling's billing page did not render, so needs checking | Not checked | — | [Kling billing (failed)](https://kling.ai/document-api/productBilling/prePaidResourcePackage) |

### Inferences
- SFX and ambience can be bought cheaply: ElevenLabs SFX, or audio bundled with Veo.
- Frame-accurate foley tied to on-screen action is the weak spot:
  - Commercially clean open options are thin (ThinkSound Apache-2.0, quality unverified).
  - The best-known open ones fail Das Production's licence test.
- Practical agent design: generate SFX per shot from the shot list's text, place them with timeline logic, and keep a curated licensed SFX library as fallback.

### Gaps
- No independent SFX or foley quality benchmark found.
- Kling's audio pricing and terms not read.
- Not checked: ElevenLabs SFX commercial terms per plan; Veo audio quality limits (e.g. speech in generated audio).

---

## 5. Lip sync

### Takeaway
- Lip sync is commercially mature for single, front-on, human speakers (sync. lipsync-2/2-pro/sync-3, HeyGen, Hedra, OmniHuman).
- The vendor's own docs list the hard cases: profiles, occlusion, multiple speakers, small faces, beards and teeth, non-human faces, long multi-cut clips.
- Open options with clear commercial licences exist: MuseTalk (MIT), LatentSync 1.6 (OpenRAIL++), InfiniteTalk and Wan2.2-S2V (Apache-2.0).
- **No independent lip-sync benchmark was found.**

### Cited Findings

**Table L: lip-sync options (read 2026-10-15)**

| Option | What it does | How good | Price (read now) | Licence / commercial | Known limits | Source |
|---|---|---|---|---|---|---|
| sync. (Sync Labs): lipsync-2, lipsync-2-pro, sync-3, react-1 [shipped] | Video-to-video lip sync from new audio | No independent benchmark. Vendor guidance only | lipsync-2 $0.04–0.05/s. **lipsync-2-pro $0.067–0.083/s (about $4–5/min)**. **sync-3 $0.107–0.133/s**. react-1 (expressive emotion, paid only) $0.133–0.167/s. Plans: Hobbyist $5/mo up to Scale $249/mo. Free: 3 generations/mo, ≤20 s | Terms not read, so unclear | lipsync-2 and 2-pro work on a **512×512 face** and chunk at 30–40 s. Not supported or weaker for: non-human faces, multiple speakers, small or profile faces, occlusion, silent segments, long multi-cut videos (may time out). sync-3: full shot, occlusion detection, extreme angles, **4K native** | [sync models](https://sync.so/docs/models/lipsync); [sync pricing (search)](https://sync.so/pricing) |
| HeyGen (Avatar IV, lip-sync video translation) [shipped] | Avatars, talking photos, video translation with lip sync in 175+ languages and dialects | HeyGen Voice tops AA's controlled-voice (cloning) board (1200) | Creator $29/mo ($24 yearly, 600 credits, 1080p). Pro $49 (1,000 credits, 4K). Business $149 + $20/seat. Pro tiers up to 100,000 credits for $4,300 | Per-plan commercial rights not stated on the pricing page; "Commercial terms" listed under Enterprise only, so unclear | Translation up to 30 min (Creator/Pro), 60 min (Business). Free 1 min. API pricing not shown | [HeyGen pricing](https://www.heygen.com/pricing); [AA controlled](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice) |
| Hedra [shipped] | Character video and lip sync | No independent test | Basic $20/mo (2,000 credits). Pro $50 (7,200). Ultra $100. Teams $75 | **Commercial use: yes** on all listed paid plans | Model version, maximum length and resolution not stated | [Hedra pricing](https://www.hedra.com/pricing) |
| ByteDance OmniHuman 2.0 (BytePlus API) [shipped, access by request] | One image plus audio/text gives a talking or gesturing avatar video; multi-person; "SOTA Lip Sync" tier [vendor claim] | No independent test | $0.07/s (film-grade camera and body, multi-person, 30–300 s). $0.12/s (lip-sync avatar) | Terms only via sales, so unclear | **720p native**. 30–300 s outputs | [BytePlus OmniHuman](https://www.byteplus.com/en/product/omnihuman) |
| Kling LipSync (via fal.ai) [shipped] | Lip sync applied to an existing video from audio | No independent test | **$0.014 per 5 s increment** as read (looks low, verify) | "Commercial use via fal partnership" | Input video 2–10 s, 720–1920 px. Audio ≤60 s. About 12 min processing | [fal Kling lipsync](https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video) |
| ByteDance LatentSync 1.6 (open) | Diffusion lip sync | 1.6 retrained on 512×512 because users found 1.5 teeth and lips blurry | Self-host | **OpenRAIL++** (commercial allowed with use restrictions) | Face-region resolution limits | [HF card](https://huggingface.co/ByteDance/LatentSync-1.6) |
| TMElyralab MuseTalk (open) | Real-time lip sync | No independent test | Self-host | Code MIT. Model "available for any purpose, even commercially". **Dependencies (whisper, ft-mse-vae, dwpose, S3FD) carry their own licences**. Test data is non-commercial | Lists Chinese, English and Japanese audio | [HF card](https://huggingface.co/TMElyralab/MuseTalk) |
| MeiGen InfiniteTalk; Wan2.2-S2V-14B (open) | Audio-driven talking video / dubbing | Wan claims to beat closed models on its own Wan-Bench 2.0 [vendor claim] | Self-host (14B: GPU heavy) | **Apache-2.0**; "We claim no rights over … generated contents" | — | [InfiniteTalk card](https://huggingface.co/MeiGen-AI/InfiniteTalk); [Wan2.2-S2V card](https://huggingface.co/Wan-AI/Wan2.2-S2V-14B) |
| Others named but not checked | Runway (Act-Two / lip sync not on the pricing page), Captions "AI Lipdub", VEED lip-sync API, Katalist lip sync, Descript avatars | — | — | — | — | [Runway](https://runway.com/pricing); [Captions](https://www.captions.ai/pricing) |

### Inferences
- For dubbing a real performance into Bengali or Hindi, sync-3 or lipsync-2-pro is the current safest buy at about $4–8 per output minute. The agent must route around the documented failure cases: profiles, occlusion, multiple speakers.
- For avatar-led content, HeyGen, Hedra and OmniHuman are cheap, but their commercial terms need reading (HeyGen, OmniHuman) before client use.
- Self-hosting with MuseTalk, LatentSync or InfiniteTalk is licence-clean (check MuseTalk's dependencies). It needs GPUs, and quality is unbenchmarked, so it is a build option rather than a drop-in.
- Agent check step: lip sync is the piece most in need of automated QC, such as a SyncNet-style offset score plus face-size and angle gating. Vendors admit quality drops in common film situations.

### Gaps
- No independent lip-sync benchmark found (no AA board exists for lip sync).
- Not read: sync. terms of service; HeyGen and OmniHuman commercial terms; Hedra model version; Kling native lip sync pricing.
- No Bengali or Hindi lip-sync quality reports found.

---

## 6. Editing, pacing to music, colour, titles, versions (16:9 / 9:16 / 1:1, long and short) and delivery

### Takeaway
- Talking-head and social repurposing is largely automated and cheap: clipping, captions, reframing to 9:16, 1:1 and 16:9, filler removal.
  - Tools: OpusClip $15–29/mo, Descript's Underlord agent, Captions, Kapwing, Eddie AI.
- Narrative editing is still mostly manual. Beat-matched pacing, story-level cut decisions and creative colour have only partial AI help: Premiere "AI music fitting" and "AI color balancing", Resolve 21's AI tools.
- Programmatic titles and versioning (Remotion) is cheap and controllable. Delivery standards are fixed numbers an agent can check, for example EBU R128 at −23 LUFS and −1 dBTP.

### Cited Findings

**Table E: editing, colour, titles, versioning and delivery (read 2026-10-15)**

| Option | What it does | How good | Price (read now) | Licence / commercial | Known limits | Source |
|---|---|---|---|---|---|---|
| Descript + Underlord [shipped] | Text-based editor. Underlord is an "AI video agent" that "can read your script, watch your video, and decide what to do next". Edits, clips, zooms, avatar explainers. **API + MCP** for editing through code or an AI assistant | Vendor claims only | Free (60 min media, 720p). Hobbyist $16–24. Creator $24–35/person (full Underlord, 4K, 30 h media). Business $50–65 (translation proofreading, avatars). Enterprise custom | Not read | Media-hour caps. Strongest for speech-led content [inference] | [Descript pricing](https://www.descript.com/pricing); [Underlord](https://www.descript.com/underlord) |
| Adobe Premiere [shipped; some beta] | Generative Extend (frames plus ambient sound), Media Intelligence natural-language clip search, caption translation into 18 languages, text-based editing, Enhance Speech, Object Mask, **AI color balancing**, **AI music fitting** ("auto-fits music tracks to clips"), timeline generation of video and SFX. **Color Mode (beta)** | No independent tests read | Premiere $22.99/mo (first year, new subscribers). Creative Cloud Pro $69.99/mo. Teams $37.99/licence | Adobe terms not read | Auto Reframe not mentioned on the page | [Adobe Premiere](https://www.adobe.com/products/premiere.html) |
| DaVinci Resolve 21 / Studio [shipped] | New in 21: AI IntelliSearch (objects, dialogue, faces), AI Speech Generator, AI CineFocus, Face Age Transformer, Face Reshaper, Blemish Removal, AI Slate ID, UltraSharpen, Motion Deblur. IntelliScript now accepts Final Draft and text screenplays (builds timelines from a script). Studio adds the DaVinci Neural Engine for AI region tracking. 21.1 exists | No independent tests read | Free version. **Studio $295 one-time** | — | The pages read did not mention beat detection, IntelliCut or auto-subtitles, so not verified for v21 | [Resolve what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew); [Resolve edit](https://www.blackmagicdesign.com/products/davinciresolve/edit) |
| OpusClip [shipped] | Long video to shorts with Virality Score, AI reframe to 9:16, 1:1 and 16:9 with object tracking, animated captions in 20+ languages, B-roll, AI sound effects, dubbing, export XML to Premiere/Resolve, **API and MCP**, "AI Producer" | Vendor claims | Free (60 credits, watermark, 3-day expiry). Starter $15/mo (150 credits). Pro $29/mo or $14.50/mo yearly (300 credits). Business custom | Not read | Built for talking-head and podcast content | [OpusClip pricing](https://www.opus.pro/pricing) |
| Captions (Mirage) [shipped] | AI Edit styles, chat-based editor, clips, AI music, sounds, voiceover, AI Lipdub, captions in 100+ languages | Vendor claims | Max $24.99/mo (iOS pricing). Frontier $69.99 / $139.99 / $279.99 | Training-data exclusion offered only on Enterprise | Prices shown are the iOS plans | [Captions pricing](https://www.captions.ai/pricing) |
| Eddie AI [shipped] | Chat-directed editing: rough cuts, multicam to the active speaker, scripted edits (best take), social verticals with captions, A/B-roll logging, transcripts in 100+ languages. Enterprise: on-prem, bring your own LLM | Vendor claims | Pay as you go: 1,000 credits $10 (about 1 h of footage), 5,000 $45, 15,000 $120, 50,000 $350. 500 free | Not read | — | [Eddie pricing](https://www.heyeddie.ai/pricing) |
| Runway (Aleph 2.0 video editing, Gen-4.5) [shipped] | Generative video editing, generation, TTS, Lyria in-app | AA video-editing board: **Aleph 2.0 1014 (#8 of 9)**. Leaders: Wan 3.0 1200 ($12/min), Seedance 2.5 1155, Gemini Omni Flash 1.1 1149 ($9.64/min) | Standard $15/mo (625 credits). Pro $35 (2,250). Max $95 (9,500). Aleph 2.0 140 credits per 5 s. Gen-4.5 12 credits/s | Commercial terms not on the page | — | [Runway pricing](https://runway.com/pricing); [AA video editing](https://artificialanalysis.ai/video/leaderboard/video-editing) |
| CapCut [shipped] | Consumer and pro-sumer editor with templates and music | — | Not read | Terms updated 15 Apr 2026. Materials Licence (US, 22 Jan 2026): platform materials are **non-commercial unless marked "commercial"**. "**NO RIGHTS ARE LICENSED WITH RESPECT TO SOUND RECORDINGS**". Users grant a perpetual, sub-licensable licence to their content | Unsuitable for client deliverables that use CapCut assets [inference] | [CapCut ToS](https://www.capcut.com/clause/terms-of-service); [CapCut materials licence](https://www.capcut.com/clause/materials-license-agreement) |
| Kapwing [shipped] | Browser editor: Smart Cut (silences), resize, Speaker Focus auto-resize, subtitles, dubbing in 40+ languages | — | Free (720p, 4 min, watermark). Pro $16/mo (1,000 credits, 4K, 2 h exports). Business: higher tier | Not read | — | [Kapwing pricing](https://www.kapwing.com/pricing) |
| VEED [shipped] | Editor, subtitles, translation, lip-sync API, Fabric 1.0 avatar API | — | Pricing did not render, so needs checking | Not read | — | [VEED pricing](https://www.veed.io/pricing) |
| Colourlab Ai 4 [announced] | AI colour matching and grading (earlier versions) | — | Pricing page 404 | — | **Launch event 16 Oct 2026**; v4 details not public on the page | [Colourlab](https://www.colourlab.ai/) |
| Remotion (React video) [shipped] | Programmatic titles, motion graphics and versions rendered from code; an agent can write it | — | Free for individuals and **companies ≤3 people**. Company licence: Automators $0.01/render, **$100/mo minimum**. Creators $25/seat/mo. Enterprise from $500/mo | Source-available; commercial use allowed within the tier | Das Production needs a Company licence if it has 4+ people | [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md); [remotion.pro](https://www.remotion.pro/license) |
| Creative automation (Celtra, Storyteq) [shipped] | Template-driven versioning and localisation at scale. Celtra: 450+ enterprise customers, 20M+ ads/yr. Storyteq: "high-volume variants", localisation (site copyright: Inspired Thinking Group) | Vendor claims | Pricing not shown (demo or sales) | Not read | Enterprise-oriented | [Celtra](https://www.celtra.com/); [Storyteq](https://www.storyteq.com/) |
| LTX Studio Enterprise | "Multi-language video versioning", dubbing, captions | — | Custom | — | — | [LTX pricing](https://ltx.io/studio/pricing) |

**Delivery and loudness**
- EBU R 128-2023 (version 5.0, Nov 2023):
  - Programme loudness target **−23.0 LUFS**.
  - True peak **≤ −1 dBTP** ("may be lower for different distribution systems").
  - Tolerance ±0.5 LU since v3 (2014).
  - v4 (2020) added references to R128 s1 and s2; v5 references R128 s4 for cinematic content.
  - Source: [EBU R128 PDF](https://tech.ebu.ch/docs/r/r128.pdf); [EBU page](https://tech.ebu.ch/publications/r128).
- Netflix's sound-mix spec moved to a partner portal that did not render, so it was not read ([Netflix](https://studiopartner.netflix.net/studio/branded-sound-mix-spec-and-best-practices)).

### Inferences
- **Effectively automated and cheap (buy)**:
  - Captions and subtitles, auto-reframe to 9:16, 1:1 and 16:9 for speaker content, silence and filler removal, short clips from long video, loudness normalisation to a target, multi-aspect templated titles (Remotion).
  - OpusClip and Descript expose APIs or MCP, which suits an agent.
- **Partial (build orchestration on top)**:
  - Beat-synced cutting and pacing: Premiere's "AI music fitting" is the only first-party claim read.
  - Reframing narrative shots with multiple subjects.
  - Colour: Premiere "AI color balancing", Colourlab, Resolve tools. These balance and match; they do not grade creatively.
  - An agent can do beat cutting itself: beat and onset detection on the music, then cut points snapped to beats in an EDL/XML or Remotion timeline. That is standard signal processing, not a product gap.
- **Still manual or weak**: story-level editorial judgment on narrative film, and creative grading. No benchmark measures either.
- **Agent design**: drive Resolve or Premiere through XML/EDL/OTIO, or build the cut in Remotion and FFmpeg. Run loudness (R128 or platform targets) and caption QC as hard automated gates.

### Gaps
- Not read:
  - Adobe's helpx "what's new" page (HTTP 403) and Adobe GenStudio and Firefly Services (404/503).
  - Smartly; Jitter; After Effects automation (templates, nexrender, Plainly); VEED pricing; Colourlab Ai 4 details (launches 16 Oct 2026).
  - Netflix, YouTube, Instagram, TikTok and Indian broadcast loudness targets.
  - Resolve 21's beat-detection and subtitle features.
- CapCut availability in India: CapCut was among apps blocked in India in 2020 (from memory, **unverified this session; needs checking**). The terms read are the US version.
- No independent benchmark of AI editing quality on narrative content was found. AA's video-editing board measures generative video edits (e.g. Aleph), not timeline editing.

---

## 7. Which pieces are effectively solved and cheap to buy, and which are still weak?

### Takeaway
- **Solved and cheap**:
  - English and UK TTS.
  - Captions and translation.
  - Social reframing and clipping.
  - SFX up to 30 s.
  - LLM drafting of scripts and shot lists.
  - Loudness and format delivery, which is rule-based.
- **Usable but needs QC and routing**:
  - Hindi and Bengali TTS (no independent evidence).
  - Lip sync, which fails on profiles, occlusion and multiple speakers.
  - Storyboard images.
- **Weak or risky**:
  - Script and story quality without decomposition.
  - Shot-grammar and continuity planning (no benchmark).
  - Frame-synced foley under clean licences.
  - Narrative editing judgment and creative colour.
  - **Commercial AI music for film and TV**, where the legal and licence terms are the main blocker rather than quality.

### Cited Findings
- English TTS quality leaders, per AA's independent blind arena:
  - ElevenLabs v4 1327, Cartesia 1284, Gemini 3.8 Flash 1272 ([AA](https://artificialanalysis.ai/text-to-speech/leaderboard)).
  - Gemini 3.8 Flash TTS output costs about $0.00225 per 10 s until 31 Dec 2026 ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)).
- Bengali and Hindi:
  - Supported by ElevenLabs v4 ([EL models](https://elevenlabs.io/docs/overview/models)), Gemini 3.8 TTS ([docs](https://ai.google.dev/gemini-api/docs/speech-generation)), Cartesia ([languages](https://cartesia.ai/languages)), Sarvam ([docs](https://docs.sarvam.ai/api-reference-docs/models/bulbul)) and IndicF5 ([HF](https://huggingface.co/api/models/ai4bharat/IndicF5)).
  - The only comparison is vendor-commissioned ([Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3)).
- Script weakness: direct LLM screenplays "lack the deep structural integrity" for professional use ([arXiv 2510.23163](https://arxiv.org/abs/2510.23163)); LLMs "often fail to capture" storytelling depth ([CML-Bench](https://arxiv.org/abs/2510.06231)).
- Lip-sync limits are documented by the market leader itself ([sync docs](https://sync.so/docs/models/lipsync)).
- Music legal risk:
  - Suno's terms: no non-infringement warranty, and the user indemnifies Suno ([Suno terms](https://suno.com/terms)).
  - UMG and Sony's second suit, 18 Sep 2026 ([EDM.com, via search](https://edm.com/industry/universal-sony-file-another-copyright-lawsuit-against-suno/)).
  - ElevenLabs Music excludes film, TV and radio below Enterprise ([EL music terms](https://elevenlabs.io/music-terms)).
- Foley licences: MMAudio is non-commercial ([HF](https://huggingface.co/hkchengrex/MMAudio)); HunyuanVideo-Foley excludes the UK and EU ([licence](https://huggingface.co/tencent/HunyuanVideo-Foley/blob/main/LICENSE)).
- Platform churn: the Sora 2 API shut down on 24 Sep 2026 ([OpenAI](https://developers.openai.com/api/docs/models/sora-2)), while third-party tools still list it ([Katalist](https://www.katalist.ai/pricing)).
- Social repurposing is cheap: OpusClip Pro $29/mo with 9:16, 1:1 and 16:9 reframing and API/MCP ([OpusClip](https://www.opus.pro/pricing)).

### Inferences
- **Build vs buy for Das Production**:
  - **Buy**: TTS (ElevenLabs v4 or Gemini; plus Sarvam or ElevenLabs for Bengali after an in-house test); lip sync (sync-3 or 2-pro); SFX (ElevenLabs); captions and translation; social clipping and reframing.
  - **Build**: the planner (decomposed script → shot list → continuity state, using a bought LLM); the QC and repair loop (lip-sync offset, loudness, caption, continuity checks); beat-snapped assembly and versioning (Remotion or FFmpeg, or Resolve/Premiere through XML); a licence and provenance ledger (consents, model, terms version, watermark status per asset).
  - **Avoid or gate**: consumer music generators for client film and TV deliverables until enterprise terms are signed; NC- or territory-restricted open models (MMAudio, HunyuanVideo-Foley, Fish S2, MusicGen); CapCut assets in client work.
- Vendor churn is real: Sora 2 was retired within weeks, model names changed several times in 2026, and promotional pages are stale. The agent should treat engines as swappable plug-ins and re-check terms on a schedule.

### Gaps
- Not found: independent benchmarks for lip sync, SFX/foley, AI editing, Bengali TTS and LLM shot-list quality.
- India's AI-content labelling rules and personality or voice rights were not researched (search budget exhausted). They are material for delivery in India.
- Commercial terms not read: sync., HeyGen, OmniHuman, Runway, OpusClip, Descript, Gemini API (Lyria, TTS voice replication).
