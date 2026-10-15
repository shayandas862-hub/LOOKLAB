# Open-source and academic landscape: agentic film-making, script-to-video pipelines, workflow tools, open video engines, evaluation code (as of 2026-10-15)

Reading conventions for the report writer:
- Every URL below was read on **2026-10-15**.
- **GitHub figures** (licence SPDX id, stars, created date, last push date) come from the GitHub repository-search API on 2026-10-15. The cited URL is the repo page. An SPDX id of `none` means GitHub found no licence file. With no licence, nothing is granted by default, so it counts as **not allowed**. `NOASSERTION` means a custom licence, and I read it where marked.
- **arXiv figures** (title, authors, first-version date, latest-version date, abstract claims) come from the arXiv export API by paper ID on 2026-10-15. The cited URL is the abs page. Claims taken from an abstract are **the authors' own claims**, and nobody has reproduced them.
- Labels:
  - (search summary): a web-search snippet, not the page itself.
  - (secondary): an aggregator.
  - (unverified): I could not confirm it.
- Commercial verdicts:
  - **allowed**: the licence permits commercial use.
  - **conditional**: allowed, but with stated limits.
  - **not allowed**: no grant, a non-commercial licence, or a territory exclusion.
  - **unclear = not allowed**: I could not read the governing terms.
- The code licence and the model-weight licence are separate. A pipeline under MIT that calls a non-commercial or territory-limited model inherits that model's limits.
- Promise coverage uses the client's four promises:
  - **P1**: one prompt in.
  - **P2**: it understands and asks only when it needs to.
  - **P3**: it does everything (script, storyboard, shot list, shots, voice, music, sound, edit, colour, titles, versions, delivery).
  - **P4**: the person likes the result (self-judging, fixing, learning taste).
  - Scores: Y (yes), part (partial), N (no), ? (not stated in what I read).
- **Limits of this research:**
  - The shared web-search budget ran out partway through. After that I used only direct fetches of known primary URLs (arXiv records, GitHub, Hugging Face, terms pages).
  - So these were **not** searched: open video models released in Aug–Oct 2026 that I didn't already know of, Comfy Cloud pricing, the full Skywork licence PDF, and the code status of several papers. They are listed under Gaps.

---

## 1. Research systems that turn a prompt or script into a multi-shot video with agents (2024 to Oct 2026)

### Takeaway
At least 25 research systems now plan and generate multi-shot video with LLM/VLM agents. None covers all four promises.
- **P1 (one prompt):** typical.
- **P2 (asking only when needed):** essentially absent. Clarification is either not mentioned or happens through free chat (ViMax's agent loop).
- **P3 (does everything):** always partial. Script, storyboard and shots are common. Voice and music are sometimes present. Colour, titles, versions in every size and delivery are absent from every paper I read.
- **P4 (self-judging):** reduced to candidate selection or critic-and-rewrite loops (AniMaker, VISTA, CineCrew, VideoGen-Agent). Nothing persistently learns a client's taste, apart from UniVA's claimed "user-specific preferences" memory, whose code I could not find.

Commercially usable code is the exception:
- Several flagship repos have **no licence file at all**: MovieAgent, Mora, MovieDreamer, Anim-Director/AniMaker, MovieBench and Preacher.
- HoloCine is **CC BY-NC-SA, academic only**.
- The usable MIT/Apache/BSD repos are ViMax, VideoGen-of-Thought, MM-StoryAgent, Code2Video, Paper2Video, DramaDirector, CineCrew and LongLive (code).

### Cited Findings

**Agent frameworks: general narrative and film**

- **FilmAgent** (Zhenran Xu, Longyue Wang et al., 10 authors; HIT Shenzhen per the repo owner HITsz-TMG; arXiv 2501.12909, 2025-01-22, marked "Work in progress"):
  - Method: LLM multi-agent framework for "end-to-end film automation in our constructed 3D virtual spaces". Agents act as directors, screenwriters, actors and cinematographers across idea → outline → script → camera setups, with "iterative feedback and revisions".
  - Evaluation: human evaluation on **15 ideas and 4 aspects**, averaging **3.98/5**. GPT-4o in multi-agent form beat single-agent o1. — [arXiv 2501.12909](https://arxiv.org/abs/2501.12909)
  - Runtime: needs pre-built 3D spaces and Unity to run (secondary). — [SourcePulse listing](https://www.sourcepulse.org/projects/1843170)
  - **Repo status:** github.com/HITsz-TMG/FilmAgent now resolves to **HITsz-TMG/VideoClaw**, an API-driven idea-to-film pipeline. VideoClaw:
    - Licence MIT, 1,861 stars, last push 2026-08-26, repo created 2024-08-29.
    - Default models: Qwen `qwen3.5-plus`, Doubao Seedream for images, `wan2.7-i2v` for video. Defaults are 16:9 / 720P.
    - News: 2026-03-27 "end-to-end automation from idea to video and user intervention at any point"; 2026-04-09 short-drama optimisation; 2026-04-29 digital-human narration; 2026-06-11 first-frame, first/last-frame and reference modes. — [github.com/HITsz-TMG/FilmAgent → VideoClaw](https://github.com/HITsz-TMG/FilmAgent); [VideoClaw repo](https://github.com/HITsz-TMG/VideoClaw)
  - Stage: the paper is research. The Unity/3D code's current availability is unclear, because the repo was repurposed.
  - Promises (paper): P1 Y (idea); P2 N; P3 part (script and camera in a 3D engine; no generative video; sound ?); P4 part (agent critique of scripts).
- **Anim-Director** (Yunxin Li et al., 8 authors; SIGGRAPH Asia 2024; arXiv 2408.09787, 2024-08-19):
  - Method: an LMM agent goes from storyline to director's script, then scene images, then animated video. LMMs "evaluate visual quality, and select the best one".
  - Repo HITsz-TMG/Anim-Director: **no licence**, 262 stars, last push 2026-01-07. Commercial verdict: **not allowed**. — [arXiv 2408.09787](https://arxiv.org/abs/2408.09787); [repo](https://github.com/HITsz-TMG/Anim-Director)
  - Promises: P1 Y; P2 N; P3 part (no audio stated); P4 part (best-of selection).
- **AniMaker** (Haoyuan Shi, Yunxin Li, …, Min Zhang; arXiv 2506.10540, v1 2025-06-12, v2 2025-10-02):
  - Agents: Director (storyboard), Photography (clips), Reviewer and Post-Production ("editing and voiceover").
  - **MCTS-Gen** searches over multiple candidate clips. **AniEval** scores each clip in the context of the clips before and after it.
  - Evaluation: authors claim gains on VBench and AniEval. — [arXiv 2506.10540](https://arxiv.org/abs/2506.10540)
  - A "14.6% AniEval gain" appears only in a search summary (unverified). — (search summary) [hyper.ai](https://hyper.ai/en/papers/2506.10540)
  - Code is linked at HITsz-TMG/Anim-Director/tree/main/AniMaker, a repo with **no licence**. Commercial verdict: **not allowed**. The project page names no video models, output length or human-evaluation numbers. — [project page](https://animaker-dev.github.io/)
  - Promises: P1 Y; P2 N; P3 part (voiceover; music ?); P4 part (generate, review, select).
- **MovieAgent** (Weijia Wu, Zeyu Zhu, Mike Zheng Shou; Show Lab; arXiv 2503.07314, 2025-03-10):
  - Input/output: "Given a script and character bank", it produces multi-scene, multi-shot video. It claims character consistency, synchronised subtitles and stable audio.
  - Roles: hierarchical chain-of-thought (CoT) agents act as director, screenwriter, storyboard artist and location manager. — [arXiv 2503.07314](https://arxiv.org/abs/2503.07314)
  - README models: GPT-4o; ROICtrl and StoryDiffusion ("manual configuration"); SVD and **HunyuanVideo-I2V**.
  - Repo: **no LICENSE file**. Its news line "Mar. 18, 2024. Release the inference code" predates the paper and is probably a typo. 368 stars, last push 2025-03-26. — [repo](https://github.com/showlab/MovieAgent)
  - Commercial verdict: **not allowed**. Its HunyuanVideo dependency also carries the UK exclusion (see §4).
  - Promises: P1 N (needs a script and a character bank); P2 N; P3 part; P4 N.
- **Mora** (Zhengqing Yuan et al., 13 authors; arXiv 2403.13248, v3 2024-10-03):
  - A multi-agent "generalist" that reproduces Sora-like features, not a film pipeline.
  - Claims VBench Video Quality 0.800 vs Sora's 0.797. — [arXiv 2403.13248](https://arxiv.org/abs/2403.13248)
  - Repo: **no licence**, 1,591 stars, last push **2024-10-10** (stale). Commercial verdict: **not allowed**. — [repo](https://github.com/lichao-sun/Mora)
- **VideoGen-of-Thought (VGoT)** (Mingzhe Zheng et al., 11 authors; arXiv 2412.02259, v3 2025-10-02; repo says "NeurIPS 2025 NextVid Workshop Oral"):
  - Method: one sentence becomes shot drafts, then specifications "with self-validation". Identity-preserving portrait tokens keep characters consistent. Adjacent-latent transitions smooth cuts. It is training-free.
  - Claimed results: +20.4% within-shot face consistency, +17.4% style consistency, "10x fewer manual adjustments". — [arXiv 2412.02259](https://arxiv.org/abs/2412.02259)
  - Repo: **BSD-3-Clause**, 66 stars, last push 2025-09-22. Code: **allowed**; check the models it calls. — [repo](https://github.com/DuNGEOnmassster/VideoGen-of-Thought)
  - Promises: P1 Y; P2 N; P3 part (video only); P4 part.
- **DreamFactory** (Zhifei Xie et al.; arXiv 2408.11788, 2024-08-21):
  - Method: LLM multi-agent with a "Key Frames Iteration Design Method".
  - New metrics: Cross-Scene Face Distance Score and Cross-Scene Style Consistency Score. Dataset: Multi-Scene Videos Dataset, ">150 human-rated videos". — [arXiv 2408.11788](https://arxiv.org/abs/2408.11788)
  - Code: not located. Stage: paper only, as far as I could see.
- **StoryAgent** (Panwen Hu et al.; arXiv 2411.04925, 2024-11-07):
  - Method: customised storytelling video, with agents for story design, storyboard, video creation, coordination and "result evaluation". Adds LoRA-BE, a custom image-to-video method. — [arXiv 2411.04925](https://arxiv.org/abs/2411.04925)
  - Code: not located.
- **MM-StoryAgent** (Xuenan Xu et al.; X-PLUG/Alibaba repo; arXiv 2503.05242, 2025-03-07):
  - Output: narrated storybook videos with "role-consistent images" and "multi-channel audio" (narration, sound effects, music). Evaluated with objective and subjective measures. — [arXiv 2503.05242](https://arxiv.org/abs/2503.05242)
  - Repo: **Apache-2.0**, 309 stars, last push 2024-08-23. That push predates the paper, so the repo looks unmaintained. — [repo](https://github.com/X-PLUG/MM_StoryAgent)
  - Promises: P1 Y; P3 part (audio yes; its visuals are images, so motion is unclear).
- **MovieDreamer** (aim-uofa; ICLR 2025; arXiv 2407.16655, v3 2025-11-25):
  - Method: an autoregressive visual-token model handles the narrative, and diffusion renders the frames.
  - Repo: **no licence**, 324 stars, last push 2024-08-10. Commercial verdict: **not allowed**. — [arXiv](https://arxiv.org/abs/2407.16655); [repo](https://github.com/aim-uofa/MovieDreamer)
- **Captain Cinema** (Junfei Xiao, Ceyuan Yang, Lvmin Zhang et al.; JHU, ByteDance Seed, Stanford, CUHK per search summary; arXiv 2507.18634, 2025-07-24; ICLR 2026):
  - Method: "top-down keyframe planning" from a storyline, then "bottom-up video synthesis" with an MM-DiT trained on interleaved long-context data. — [arXiv 2507.18634](https://arxiv.org/abs/2507.18634); [ICLR 2026 proceedings](https://proceedings.iclr.cc/paper_files/paper/2026/hash/86ab3ff2c1387c895766f5c5fc2b610c-Abstract-Conference.html)
  - Code: not located (project page thecinema.ai). Stage: paper, plus demos.
- **FilMaster** (Kaiyi Huang, …, Xihui Liu; HKU, Kuaishou, MSR, Tsinghua per search summary; arXiv 2506.18899, 2025-06-23; ICLR 2026 poster):
  - Camera language: chosen by RAG over **440,000 film clips**.
  - Edit: "Rough Cut and Fine Cut" steps driven by **simulated audience feedback**.
  - Claims "editable, industry-standard outputs" and introduces the FilmEval benchmark. — [arXiv 2506.18899](https://arxiv.org/abs/2506.18899)
  - Project page: code "Coming Soon", "© 2025 FilMaster Team. All rights reserved." It reports no human study. — [project page](https://filmaster-ai.github.io/)
  - Commercial verdict: **not available / not allowed**.
- **Kubrick** (Liu He et al.; CVPR 2025 AI4CC workshop; arXiv 2408.10453, v2 2025-05-05):
  - Method: VLM agents (Director, Programmer, Reviewer) **write Blender Python scripts** and render the video. The Reviewer checks intermediate screenshots and motion coordinates, and the Programmer iterates.
  - Claimed results: better than commercial video models on five metrics, and preferred in a user study. — [arXiv 2408.10453](https://arxiv.org/abs/2408.10453)
  - Code: not located.
- **UniVA** (Zhengyang Liang et al., 11 authors; arXiv 2511.08521, 2025-11-11):
  - Architecture: Plan-and-Act. A planner decomposes the request, and executors call **MCP-based tool servers** for generation, editing, tracking and segmentation.
  - Memory: "global knowledge, task context, and user-specific preferences". Benchmark: UniVA-Bench. Claims to be "fully open-sourced". — [arXiv 2511.08521](https://arxiv.org/abs/2511.08521)
  - The Hugging Face org links github.com/univa-agent, but its models are "None public yet", the demo is invite-only and the leaderboard shows "Runtime error". — [HF org](https://huggingface.co/UniVA-Agent)
  - GitHub search for `org:univa-agent` failed with "resources do not exist" on 2026-10-15. Licence unknown. Commercial verdict: **unclear = not allowed**.
- **VISTA** (Do Xuan Long, …, Tomas Pfister, Sercan Ö. Arık; Google and NUS per search summary; arXiv 2510.15831, 2025-10-17; CVPR 2026):
  - Loop: a structured temporal plan, then a **pairwise tournament** to pick the best video. Three critics then review it (visual, audio, context), and a reasoning agent **rewrites the prompt** for the next round.
  - Results: "up to 60% pairwise win rate" against baselines, and humans preferred VISTA "in 66.4% of comparisons". — [arXiv 2510.15831](https://arxiv.org/abs/2510.15831)
  - A Google research page is reported to say 68% (search summary): a minor conflict. — (search summary) [research.google](https://research.google/pubs/vista-towards-test-time-self-improving-video-generation-agent/)
  - Code: not located.
  - Promises: P4 part (self-judging and fixing, but only through the prompt).
- **ViMax** (Lingxuan Huang, Sizhe He, Hengji Zhou, Liqiang Nie, Lianghao Xia, Chao Huang; HKUDS; arXiv 2606.07649, 2026-06-02, v2 2026-07-21):
  - Method: hierarchical narrative engine with RAG, "dependency-aware visual consistency", and "VLM-guided agents continuously monitor and refine". — [arXiv 2606.07649](https://arxiv.org/abs/2606.07649)
  - Workflows: Idea2Video, Script2Video, Novel2Video (2026-06-07), AutoCameo, an Agent Loop and TUI (2026-06-08), and a Web UI (v1.2.0, 2026-07-20).
  - Models in the examples, via APIs: Gemini 2.5 Flash Lite via OpenRouter, Nano Banana, Veo, Seedance 2.0 Fast (2026-07-17), GPT Image 2 and Google Omni.
  - Quality checks: generates **2 keyframe candidates and a VLM picks one**. It claims "automated quality control" and voice and sound effects, but names no audio model and describes no regeneration step.
  - No quantitative results are in the README, although a `vimax_benchmark` folder exists. — [repo README](https://github.com/HKUDS/ViMax)
  - Repo: **MIT**, 12,666 stars, last push 2026-09-30. Stage: **maintained**. Commercial verdict for code: **allowed**, but it depends on paid closed APIs (Veo, Seedance and others).
  - Promises: P1 Y; P2 part (interactive agent loop for revising plans); P3 part (no colour, titles, versions or delivery found); P4 part.
- **"The Script is All You Need" / ScripterAgent–DirectorAgent–CriticAgent** (Chenyu Mu et al., 16 authors; Tencent Hunyuan and Xidian per search summary; arXiv 2601.17737, 2026-01-25, v3 2026-05-27):
  - Method: dialogue → "executable cinematic script" → orchestration of several video models, scored by a CriticAgent and a new Visual-Script Alignment (VSA) metric. Includes the ScriptBench benchmark.
  - Finding: a "trade-off in current SOTA models between visual spectacle and strict script adherence". — [arXiv 2601.17737](https://arxiv.org/abs/2601.17737)
  - Code: not checked.
- **Co-Director** (Yale Song et al., 16 authors; arXiv 2604.24842, 2026-04-27):
  - Method: hierarchical multi-agent. A **multi-armed bandit** searches creative directions, and a local multimodal self-refinement loop corrects identity drift.
  - Benchmark: **GenAD-Bench**, 400 scenarios of fictional products for personalised advertising. Directly relevant to product ads. — [arXiv 2604.24842](https://arxiv.org/abs/2604.24842)
  - Code: not checked.
- **VideoGen-Agent** (Binxu Li et al., 12 authors; arXiv 2609.24997, 2026-09-21, v3 2026-10-05):
  - Method: an agent trained by SFT and then RL to call **augmentation, generation and verification tools** over several turns.
  - Results on VABench (600 prompts, including multi-shot structure): 56.5 → 75.6, and 86.1 with upgraded tools. Human raters preferred it in **84.3%** of comparisons. — [arXiv 2609.24997](https://arxiv.org/abs/2609.24997)
  - Code: not checked.
- **DramaDirector** (Hengji Zhou, …, Liqiang Nie; HIT Shenzhen, SCUT, HKUST-GZ per search summary; arXiv 2606.24107, 2026-06-23):
  - Method: plot-to-short-drama. The planner is trained with schema-constrained SFT and GRPO. It **retrieves depth and pose references from a gallery of real short-drama shots** to guide first-frame generation and image-to-video.
  - Benchmark: DramaBoard, built from 35 live-action dramas, 2.8K episodes and 81K shots. — [arXiv 2606.24107](https://arxiv.org/abs/2606.24107)
  - Repo: **MIT**, 12 stars, last push 2026-06-29. — [repo](https://github.com/iLearn-Lab/DramaDirector)
- **Better Call CineCrew** (Jiaben Chen, …, Wojciech Matusik; ECCV 2026; arXiv 2609.07720, 2026-09-07):
  - Structured layer: **FilmDSL**, a film-oriented domain-specific language that makes shot and camera directives, assets, continuity and persona cues explicit.
  - Generation: an agent builds **asset packs and storyboard keyframes that "anchor composition before clip-by-clip synthesis"**.
  - Checking: a **critic agent produces "structured QA signals and triggers targeted refinement"**.
  - Evaluation: tested on TV-style segments against text-only and reference-only baselines. — [arXiv 2609.07720](https://arxiv.org/abs/2609.07720)
  - Repo: **Apache-2.0**, 13 stars, last push 2026-09-29. — [repo](https://github.com/Ironieser/CineCrew)
  - The project page names no generators, durations or human-evaluation results, and still has "TODO" placeholders. — [project page](https://jiabenchen.github.io/cinecrew/)

**Engine-level multi-shot and long-video research models**
These are engines, not agents.
- **HoloCine** (Yihao Meng et al.; arXiv 2510.20822, 2025-10-23; CVPR 2026 Highlight):
  - Method: generates whole multi-shot scenes with Window Cross-Attention and Sparse Inter-Shot Self-Attention. — [arXiv 2510.20822](https://arxiv.org/abs/2510.20822)
  - README facts:
    - Uses the Wan 2.2 T5 encoder and VAE, with released 14B full and sparse checkpoints.
    - Default 241 frames (about 15 s); examples use 5–6 shots.
    - **"licensed under the CC BY-NC-SA 4.0 … for academic research purposes only"**.
    - No human evaluation is reported.
  - Repo: 706 stars, last push 2025-11-26. — [repo](https://github.com/yihao-meng/HoloCine)
  - Commercial verdict: **not allowed**.
- **LongLive** (Shuai Yang et al.; NVIDIA NVlabs repo; arXiv 2509.22622, 2025-09-26):
  - Method: frame-level autoregressive, real-time, interactive prompt switching. A 1.3B model runs at **20.7 FPS on one H100** and supports **up to 240 s** of video. — [arXiv 2509.22622](https://arxiv.org/abs/2509.22622)
  - Repo: **Apache-2.0**, 2,793 stars, last push 2026-10-13. The description now reads "Long Video Gen / World Model / World Action Model". — [repo](https://github.com/NVlabs/LongLive)
  - Weight licence: not read.
- **ShotPlan** (arXiv 2607.17675, 2026-07-20):
  - Method: learnable planning tokens with FRoPE control where shots change within a video diffusion model. — [arXiv 2607.17675](https://arxiv.org/abs/2607.17675)
  - Code: not checked.

**Non-narrative agentic video**
These are the closest to "exact parts built in code".
- **Code2Video** (Show Lab; arXiv 2510.01174, 2025-10-01; "ICML 2026" per repo):
  - Agents: Planner, Coder ("executable Python code" with "scope-guided auto-fix") and Critic (a VLM with "visual anchor prompts").
  - Results: "40% improvement over direct code generation", using the MMMC benchmark and the TeachQuiz metric. — [arXiv 2510.01174](https://arxiv.org/abs/2510.01174)
  - Repo: **MIT**, 2,131 stars, last push 2026-08-24. — [repo](https://github.com/showlab/Code2Video)
- **Paper2Video / PaperTalker** (Show Lab; arXiv 2510.05096):
  - Output: slides, subtitles, speech, cursor and a talking head. Benchmark of 101 papers. — [arXiv 2510.05096](https://arxiv.org/abs/2510.05096)
  - Repo: **MIT**, 2,383 stars, last push 2026-03-05. — [repo](https://github.com/showlab/Paper2Video)
- **Preacher** (Jingwei Liu et al.; ICCV 2025; arXiv 2508.09632):
  - Method: paper-to-video with Progressive CoT. — [arXiv 2508.09632](https://arxiv.org/abs/2508.09632)
  - Repo Gen-Verse/Paper2Video: **no licence**, 52 stars, created and last pushed on the same day (2025-09-01). — [repo](https://github.com/Gen-Verse/Paper2Video)
  - Commercial verdict: **not allowed**. It may also be largely empty (unverified).

**Datasets and surveys**
- **MovieBench** (Show Lab; CVPR 2025; arXiv 2411.15262): a hierarchical movie-level dataset. Repo: **no licence**, 102 stars, last push 2025-03-16. — [arXiv](https://arxiv.org/abs/2411.15262); [repo](https://github.com/showlab/MovieBench)
- **"Agentic Visual Generation: From Generative Models to Agentic Control"** (arXiv 2609.06758, 2026-09-06) grades systems by what the controller can actually decide:
  - L1 conditioning control.
  - L2 execution control.
  - **L3 outcome-adaptive control**: observes an intermediate result and changes the next operation.
  - **L4 experience-adaptive control**: keeps experience across tasks.
  - L0: fixed generators, evaluators and benchmarks with no controller. — [arXiv 2609.06758](https://arxiv.org/abs/2609.06758)
- **"Agentic Artifact Creation" survey** (arXiv 2608.28122, 2026-08-28): reviewed 259 works up to 2026-08-20. Warns: "**Learned judges may add little independent evidence when they share the generator's preferences or blind spots**". Recommends "turning feedback into targeted repair, and revalidating affected state after change." — [arXiv 2608.28122](https://arxiv.org/abs/2608.28122)

### Inferences
- **Self-judging today:** the field converges on plan → keyframes → image-to-video → critic → regenerate. Even the best self-judging is usually a VLM, or a learned reward, that picks among candidates or rewrites the prompt (AniMaker, VISTA, ViMax, VideoGen-Agent). None of the papers I read measures a clip against an explicit geometric or timing specification with thresholds fixed beforehand.
- **Closest to the client's design:** CineCrew's FilmDSL comes nearest to a "skeleton". It is a structured spec with critique and targeted repair, but it is a text/DSL specification, not 3D geometry. Its code is very new (13 stars).
- **Licence reality:** most named academic systems cannot be built on commercially.
  - No licence: MovieAgent, Mora, MovieDreamer, Anim-Director/AniMaker, Preacher, MovieBench.
  - Non-commercial: HoloCine.
  - Code not released: FilMaster.
  - What the client can legally reuse as code: ViMax, VGoT, MM-StoryAgent, Code2Video, Paper2Video, DramaDirector, CineCrew and LongLive's code, and mostly as ideas and architecture.
- **P2 (ask only when needed)** is an open gap in the literature. The client could reasonably differentiate there.
- **P4 (learning taste):** UniVA is the only system whose stated design includes persistent user-preference memory. In the survey's terms, it is L4 experience-adaptive control.
- **Evaluation weakness:** human evaluation is thin. FilmAgent used 15 ideas. VISTA, VideoGen-Agent and Kubrick report preference percentages or user studies. Most papers rely on automatic metrics they invented themselves (AniEval, FilmEval, VSA, VABench, DramaBoard). Results are not comparable across papers, and the demos on project pages are cherry-picked.

### Gaps
- Code and licence status was **not verified** for: DreamFactory, StoryAgent, Captain Cinema, VISTA, Kubrick, ScriptAgent, Co-Director, VideoGen-Agent and ShotPlan. These are paper-only as far as I know, because web search ran out before I could check.
- Affiliations come from search summaries, or are inferred from repo owners, except where an arXiv record carried them. Treat them as (unverified).
- I did not check whether FilmAgent's original Unity/3D code survives anywhere, for example in VideoClaw's git history.
- I did not read full papers, so I have no per-paper output durations, resolutions or human-study sample sizes beyond what abstracts and READMEs state.
- I did not check what CineCrew's critic's "structured QA signals" contain: numeric thresholds or VLM judgements.

---

## 2. Open-source script/prompt-to-video apps (GitHub, by stars), licence and maintenance

### Takeaway
The most-starred "one prompt to video" apps fall into two groups.
- **Stock footage plus TTS plus subtitles assemblers:** MoneyPrinterTurbo (131.5k stars, MIT, active), MoneyPrinter and ShortGPT (stale since Feb 2025). NarratoAI is a commentary/recut tool (MIT, active).
- **A new 2026 wave of Chinese short-drama/comic "AI film studio" apps:** Toonflow (MIT, 17.9k), waoowaoo (source-available **Elastic License 2.0**, 14.6k), Jellyfish (Apache-2.0, 6.7k), VideoClaw (MIT), wind-comic (MIT). These orchestrate **closed APIs** (Seedance, Wan 2.7, Veo, MiniMax, Nano Banana). None publishes quality evaluations.

All of them are P1-capable. None does P2. P3 is partial: no colour grading or multi-size delivery found. P4 is limited to human review on a canvas. Pallaidium is the notable Blender-native exception (see §3).

### Cited Findings

| Repo | Licence (verdict) | Stars | Created → last push | What it is (from repo description/README) |
|---|---|---|---|---|
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | MIT (allowed) | 131,531 | 2024-03-11 → 2026-10-15 | "Generate HD short videos from a topic or keyword with an automated AI workflow". Topics: ffmpeg, subtitles, text-to-speech, youtube-shorts |
| [FujiwaraChoki/MoneyPrinter](https://github.com/FujiwaraChoki/MoneyPrinter) | MIT (allowed) | 14,061 | 2024-01-31 → 2026-03-26 | "Automate Creation of YouTube Shorts using MoviePy" |
| [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT) | MIT (allowed) | 8,032 | 2023-06-27 → **2025-02-10 (stale)** | "Experimental AI framework for youtube shorts / tiktok channel automation" |
| [linyqh/NarratoAI](https://github.com/linyqh/NarratoAI) | MIT (allowed) | 11,410 | 2024-08-12 → 2026-09-17 | AI one-click commentary narration and editing of existing video (Chinese description) |
| [HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app) | MIT (allowed) | 17,865 | 2026-01-29 → 2026-10-13 | Short-drama and motion-comic tool: script writing, storyboarding, character/scene asset management, image and video generation, infinite canvas, AI agents, self-hosted, MCP and plugins |
| [waooAI/waoowaoo](https://github.com/waooAI/waoowaoo) | **Elastic License 2.0**, source-available (conditional: internal business use OK; "hosted or managed access" for third parties "requires separate permission") | 14,561 | 2026-01-22 → 2026-09-21 | "Preview release". Assistant plus canvas. Models via **OpenRouter**: GPT Image 2, Nano Banana, Seedance, MiniMax H3. "Music and voiceover are not included". No benchmarks. Marketing claims ("Hollywood-standard") are unsupported. [README read](https://github.com/waooAI/waoowaoo) |
| [Forget-C/Jellyfish](https://github.com/Forget-C/Jellyfish) | Apache-2.0 (allowed) | 6,744 | 2026-03-06 → 2026-07-30 | "End-to-end production workspace for AI-generated short dramas… script input to structured storyboarding, consistency management, shot preparation, video generation, and export" |
| [HKUDS/ViMax](https://github.com/HKUDS/ViMax) | MIT (allowed; calls closed APIs) | 12,666 | 2025-03-30 → 2026-09-30 | See §1 |
| [HITsz-TMG/VideoClaw](https://github.com/HITsz-TMG/VideoClaw) (ex-FilmAgent URL) | MIT (allowed; calls closed APIs) | 1,861 | 2024-08-29 → 2026-08-26 | "Chat an Idea. Get a Film." Qwen, Seedream, Wan 2.7 i2v via API. Topics include tts |
| [ChrisChen667788/wind-comic](https://github.com/ChrisChen667788/wind-comic) | MIT (allowed) | 707 | 2026-04-26 → 2026-10-15 | "Multi-agent AI pipeline that turns one line of text into a finished short-form drama" |
| [Agents365-ai/video-podcast-maker](https://github.com/Agents365-ai/video-podcast-maker) | MIT (allowed) | 1,680 | 2026-02-16 → 2026-10-01 | "Topic → 4K narrated video for coding agents… Remotion composition, **cost-gated AI generation**", local TTS |
| [showlab/Code2Video](https://github.com/showlab/Code2Video), [showlab/Paper2Video](https://github.com/showlab/Paper2Video) | MIT (allowed) | 2,131 / 2,383 | see §1 | Educational / paper videos rendered from code |

- The three "AI film studio" repos (Toonflow, waoowaoo, Jellyfish) were all created in **January–March 2026**. That points to a recent surge rather than mature products. — repo metadata as linked above.
- MCKRUZ/ComfyUI-Expert: a Claude Code agent for ComfyUI video production, 49 stars, last push 2026-03-18 (search summary). — (search summary) [gittrend](https://gittrend.io/repo/MCKRUZ/ComfyUI-Expert)

### Inferences
- **Two models of "AI film studio":** the high-star 2026 apps are **orchestration shells around paid closed APIs**. Running one offline on open weights would mean swapping in Wan, LTX-2 and similar models. This matches the "AI-video-as-API-orchestration" pattern. None implements a measured checker.
- **Licence caution on waoowaoo:** its licence is **not open source**. Das Production may use it internally, but cannot offer it to clients as a hosted service without permission.
- **Maintenance:** MoneyPrinterTurbo and Toonflow are the most actively maintained (pushes on 2026-10-15 and 2026-10-13). ShortGPT is effectively abandoned.
- **Cost gate:** video-podcast-maker's "cost-gated AI generation" is the only explicit match I saw to the client's "approve a cheap preview before generation spend". It is a small project.

### Gaps
- I did not read the MoneyPrinterTurbo, Toonflow, Jellyfish or wind-comic READMEs in full, so default engines, aspect ratios and audio stacks are unverified.
- I could not locate AIDC-AI/Pixelle-Video (VideoClaw uses its templates); GitHub search did not return it.
- I did not systematically search Indian- or UK-built open projects. Search budget was exhausted.

---

## 3. Workflow tools for assembling pipelines (ComfyUI and others), licences

### Takeaway
**ComfyUI** is the de facto open pipeline runtime.
- Licence: GPL-3.0, 137.7k stars, pushed daily.
- Comfy Org adds optional, credit-billed **Partner (API) Nodes** for closed models, and keeps the core "fully open-source and free for local users".
- Video, control and 3D come mostly from community node packs:
  - kijai's **WanVideoWrapper**: Apache-2.0.
  - **Advanced-ControlNet** and **VideoHelperSuite**: GPL-3.0.
  - **controlnet_aux** preprocessors: Apache-2.0.
  - **3D-Pack**: MIT.
  - **BlenderAI-node** bridge: GPL-3.0.
  - Lightricks' **ComfyUI-LTXVideo**: custom licence, not read.
- **Pallaidium** (GPL-3.0) puts generative video, voice and music directly into Blender's Video Sequence Editor. It can render Blender scene strips as control video, which is the closest off-the-shelf thing to "3D skeleton → generative paint".
- **InvokeAI** (Apache-2.0) and **DiffSynth-Studio** (Apache-2.0) are alternatives.

### Cited Findings
- **ComfyUI** ([Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI)): GPL-3.0, 137,692 stars, last push 2026-10-15. Related repos: [comfy-cli](https://github.com/Comfy-Org/comfy-cli) GPL-3.0 (1,014 stars) and [ComfyUI_frontend](https://github.com/Comfy-Org/ComfyUI_frontend) GPL-3.0.
- **Comfy Partner Nodes (API nodes):**
  - They "call closed-source, third-party hosted AI models". The doc page names Kling, Luma and GPT-Image-1.
  - Billing: prepaid credits only, with a Comfy account. Monthly credits expire at the end of the billing period, top-ups after 1 year, and credits are non-refundable. Balances can go negative.
  - **"completely optional"**: disable them with `--disable-partner-nodes`, or use `--offline`.
  - ComfyUI "will always remain fully open-source and free for local users". — [docs.comfy.org API nodes overview](https://docs.comfy.org/tutorials/api-nodes/overview)

**Video, control and 3D node packs**

| Repo | Licence | Stars | Last push | Role |
|---|---|---|---|---|
| [kijai/ComfyUI-WanVideoWrapper](https://github.com/kijai/ComfyUI-WanVideoWrapper) | Apache-2.0 | 6,732 | 2026-05-24 (1,284 open issues) | Wan family in ComfyUI |
| [kijai/ComfyUI-HunyuanVideoWrapper](https://github.com/kijai/ComfyUI-HunyuanVideoWrapper) | **none** (not allowed) | 2,590 | 2025-08-20 | HunyuanVideo in ComfyUI |
| [Lightricks/ComfyUI-LTXVideo](https://github.com/Lightricks/ComfyUI-LTXVideo) | NOASSERTION (not read = unclear) | 4,198 | 2026-10-14 | LTX in ComfyUI |
| [Kosinkadink/ComfyUI-AnimateDiff-Evolved](https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved) | Apache-2.0 | 3,557 | 2026-07-28 | AnimateDiff |
| [Kosinkadink/ComfyUI-Advanced-ControlNet](https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet) | GPL-3.0 | 1,019 | 2026-07-28 | ControlNet scheduling and masking with sliding context |
| [Kosinkadink/ComfyUI-VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite) | GPL-3.0 | 1,878 | 2026-09-02 | Video load and save nodes |
| [Fannovel16/comfyui_controlnet_aux](https://github.com/Fannovel16/comfyui_controlnet_aux) | Apache-2.0 | 4,226 | 2026-10-11 | Depth, pose and edge preprocessors |
| [MrForExample/ComfyUI-3D-Pack](https://github.com/MrForExample/ComfyUI-3D-Pack) | MIT | 3,884 | 2025-12-29 | Mesh and UV texture processing |
| [AIGODLIKE/ComfyUI-BlenderAI-node](https://github.com/AIGODLIKE/ComfyUI-BlenderAI-node) | GPL-3.0 | 1,562 | 2025-11-28 | Blender ↔ ComfyUI bridge |
| [tin2tin/Pallaidium](https://github.com/tin2tin/Pallaidium) | GPL-3.0 | 1,546 | 2026-10-15 | Generative studio inside Blender's Video Sequence Editor (VSE) |
| [invoke-ai/InvokeAI](https://github.com/invoke-ai/InvokeAI) | Apache-2.0 | 28,659 | 2026-10-15 | Creative engine, image-centric |
| [modelscope/DiffSynth-Studio](https://github.com/modelscope/DiffSynth-Studio) | Apache-2.0 | 13,252 | 2026-10-15 | Diffusion framework (video support not verified) |

- **Pallaidium**, from its README:
  - Scope: "A free generative AI movie studio integrated into the Blender Video Editor", covering script to shots, images, animation, voices, music and editing.
  - Video models: LTX-2/LTX-2.3, Wan 2.1 and SkyReels-V1, plus cloud MiniMax, Veo and fal Seedance.
  - Audio models: Chatterbox, Fish Audio Drama 3, MMAudio, ACE Step, YuE2, Stable Audio Open and others.
  - 3D input: the **"LTX-2.3 3DREAL mode renders the active strip to a trimmed clip and uses it as control video"**, plus an EEVEE Mist/depth pass. It can also use remote backends (ComfyUI, fal).
  - Licence warning: GPL-3.0 add-on, and it warns "many [models] are meant for non-commercial or research use" (for example YuE2 weights are CC BY-NC 4.0).
  - Requirements: Blender 5.2+ and an NVIDIA GPU with 6–16 GB VRAM. — [README](https://github.com/tin2tin/Pallaidium)

### Inferences
- **GPL-3.0 implications (my reading, not legal advice):** ComfyUI's GPL-3.0 lets Das Production run it internally, or as a server behind its own product, without releasing its own code. GPL-3.0, unlike AGPL, has no network-use clause. **Distributing** a modified ComfyUI, or GPL node packs bundled into an app shipped to clients, would trigger source-release obligations. Workflows (JSON graphs) are generally treated as data, but that is untested.
- **Licences multiply:** every node pack and every preprocessor's model weights carries its own licence, so a ComfyUI graph's commercial status is the **weakest link** across all of them. Some depth or pose estimators bundled by preprocessors have non-commercial weights (unverified for specific ones here).
- **Pallaidium** is the closest open tool to the client's "3D skeleton drives the generator" idea. It is Blender, plus render-to-control-video, plus a timeline. It lacks automated checking and agents.

### Gaps
- **Comfy Cloud** (hosted ComfyUI) terms and pricing, and the current list of video Partner Nodes (Veo, Runway, Seedance and so on), were not read; search budget was exhausted.
- I did not read Lightricks/ComfyUI-LTXVideo's custom licence.
- I did not read the licences of the individual preprocessor model weights that controlnet_aux downloads.
- A notable Wan/VACE ControlNet workflow set beyond the wrappers listed was not inventoried.

---

## 4. Open video models usable as engines: licence verdict for India and UK, and hosted-inference terms

### Takeaway
For a company working in **India and the UK**:
- **Cleanest:** **Wan 2.1/2.2** (Apache-2.0 weights; T2V/I2V at 480P/720P, 5 s), **LongCat-Video** (MIT weights; 720p 30 fps, "minutes-long") and **VACE** (Apache-2.0 repo; reference, edit and mask control).
- **Apache/MIT repos whose weight cards I did not re-read:** Mochi 1, Open-Sora 2.0, MAGI-1, Step-Video and Kandinsky 5.
- **LTX-2/2.x** (19B, joint audio and video): free only while the licensee group's **annual revenue is under US$10M**; paid licence above that.
- **CogVideoX-5B:** commercial use needs **registration** and a **≤1M visits/month** cap.
- **HunyuanVideo and HunyuanVideo 1.5:** the Tencent Hunyuan Community License **"DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA"**. So no for UK work, and usable in India only under its terms.
- **Not allowed / unclear:** **HoloCine** (CC BY-NC-SA), **SkyReels-V2** (custom Skywork licence, full text not read) and **SkyReels-V3** (not read).
- **Wan 2.5 and later:** I found no open release. The Wan-Video GitHub org holds only Wan2.1, Wan2.2, Wan-Animate-2, Wan-Dancer and Wan-skills.
- **Hosted inference:** fal and Replicate do not remove model licences. Replicate explicitly makes users comply with each model's licence.

### Cited Findings

**Model licence verdicts**

| Model (date) | What the source says it does | Weights licence (read?) | India | UK |
|---|---|---|---|---|
| **Wan 2.1** (arXiv 2503.20314, 2025-03-26) | 1.3B and 14B. "1.3B … only 8.19 GB VRAM". Up to 8 tasks [arXiv](https://arxiv.org/abs/2503.20314) | Apache-2.0 repo, 17,211 stars, last push 2026-03-05 [repo](https://github.com/Wan-Video/Wan2.1) | allowed | allowed |
| **Wan 2.2** (weights 2025-07-28) | T2V-A14B and I2V-A14B at 480P/720P; TI2V-5B at 720P/24 fps; **5-second** clips; single-GPU run "at least 80GB VRAM". "claim no rights over the your generated contents" | **Apache-2.0 (read on card)** [HF card](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B); repo 17,950 stars, last push 2026-09-21 [repo](https://github.com/Wan-Video/Wan2.2) | allowed | allowed |
| Wan-Animate-2, Wan-Dancer (repos created 2026-07-13) | capabilities not read | Apache-2.0 repo [Wan-Animate-2](https://github.com/Wan-Video/Wan-Animate-2), [Wan-Dancer](https://github.com/Wan-Video/Wan-Dancer); weights not read | likely allowed (check) | likely allowed (check) |
| **VACE** (arXiv 2503.07598, 2025-03-10; ICCV 2025) | Unified reference-to-video, video-to-video edit and masked edit via a "Video Condition Unit" [arXiv](https://arxiv.org/abs/2503.07598) | Apache-2.0 repo, 3,975 stars, last push 2025-10-17 [repo](https://github.com/ali-vilab/VACE); weights not re-read | allowed (check weights) | allowed (check weights) |
| **HunyuanVideo** (2024-12-03) | 13B+. Professional raters beat Runway Gen-3 and Luma 1.6 (authors' claim) [arXiv](https://arxiv.org/abs/2412.03603) | **Tencent Hunyuan Community License (read)**: Territory "worldwide … excluding the European Union, United Kingdom and South Korea"; >100M MAU must ask Tencent [LICENSE](https://github.com/Tencent-Hunyuan/HunyuanVideo/blob/main/LICENSE.txt) | conditional (AUP, MAU cap) | **not allowed** |
| **HunyuanVideo 1.5** (arXiv 2511.18870, 2025-11-24) | 8.3B, "efficient inference on consumer-grade GPUs", T2V and I2V [arXiv](https://arxiv.org/abs/2511.18870) | **Same licence family (read)**: UK, EU and South Korea excluded. Section 5(b) bars using outputs "to improve any other AI model" [LICENSE](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5/blob/main/LICENSE) | conditional | **not allowed** |
| HunyuanVideo-Avatar, HunyuanVideo-Foley | Foley audio; avatar | NOASSERTION, not read [Avatar](https://github.com/Tencent-Hunyuan/HunyuanVideo-Avatar), [Foley](https://github.com/Tencent-Hunyuan/HunyuanVideo-Foley) | unclear = not allowed | unclear = not allowed (probably same exclusion) |
| **LTX-Video** (arXiv 2501.00103, 2024-12-30) | 5 s of 24 fps 768×512 "in just 2 seconds on an Nvidia H100" [arXiv](https://arxiv.org/abs/2501.00103) | repo Apache-2.0 (11,108 stars, last push 2026-01-05) [repo](https://github.com/Lightricks/LTX-Video); per-version weight licences not re-read | needs checking | needs checking |
| **LTX-2 / LTX-2.x** (arXiv 2601.03233, 2026-01-06; LTX-2.3; "LTX-2.5 versions released since August 11, 2026") | 14B video stream + 5B audio stream; "temporally synchronized audiovisual content" with speech, foley and background [arXiv](https://arxiv.org/abs/2601.03233). Card: 19B; example 768×512, 121 frames, 24 fps; LoRA and IC-LoRA; fp8/nvfp4; distilled 8-step [HF card](https://huggingface.co/Lightricks/LTX-2) | **LTX-2.x Community License (read)**: free "for any purpose" below threshold; "Entities with annual revenues of at least $10,000,000" (affiliates aggregated) need a paid licence; "Licensor claims no rights in the Output"; may not use outputs "To train, improve, or fine-tune any other machine learning model"; sanctions-only territory clause [LICENSE-2_x](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x); [LICENSE index](https://github.com/Lightricks/LTX-2/blob/main/LICENSE) | conditional (<US$10M revenue) | conditional (<US$10M revenue) |
| **CogVideoX-5B** (arXiv 2408.06072; ICLR 2025) | Card: 720×480 only, 6 s, 8 fps, 49 frames [HF card](https://huggingface.co/zai-org/CogVideoX-5b). The paper's 10 s / 768×1360 / 16 fps figure is a different variant [arXiv](https://arxiv.org/abs/2408.06072) | **CogVideoX MODEL_LICENSE (read)**: "must register and obtain a basic commercial license"; "must not exceed 1 million visits per month"; worldwide; bans uses that "undermine China's national security" [MODEL_LICENSE](https://github.com/zai-org/CogVideo/blob/main/MODEL_LICENSE). Repo Apache-2.0 (code), last push 2025-11-04 [repo](https://github.com/zai-org/CogVideo) | conditional (register, cap) | conditional (register, cap) |
| **Mochi 1** (Genmo) | not read: needs checking | repo Apache-2.0, 3,751 stars, last push 2026-10-06 [repo](https://github.com/genmoai/mochi); weights card not read | likely allowed (check) | likely allowed (check) |
| **Open-Sora 2.0** (arXiv 2503.09642) | trained for "$200k"; "comparable to … HunyuanVideo and … Runway Gen-3 Alpha" by human evaluation and VBench (authors) [arXiv](https://arxiv.org/abs/2503.09642) | repo Apache-2.0, 29,873 stars, last push 2026-04-09 [repo](https://github.com/hpcaitech/Open-Sora) | likely allowed (check weights) | likely allowed (check weights) |
| **SkyReels-V2** (arXiv 2504.13074, 2025-04-17) | "Infinite-length Film Generative Model", diffusion forcing, shot-language captioner [arXiv](https://arxiv.org/abs/2504.13074) | **Skywork Community License**. The repo LICENSE says commercial use is supported, with no re-application needed. Full terms are in a PDF I did not read. "not … for internet services without appropriate security reviews and records" [LICENSE](https://github.com/SkyworkAI/SkyReels-V2/blob/main/LICENSE.txt) | unclear = not allowed | unclear = not allowed |
| SkyReels-V3 (repo created 2026-01-15) | "Multimodal Video Generation Model" | NOASSERTION, not read [repo](https://github.com/SkyworkAI/SkyReels-V3) | unclear = not allowed | unclear = not allowed |
| **MAGI-1** (arXiv 2505.13211) | autoregressive chunks, streaming; 24B; "constant peak inference cost, regardless of video length" [arXiv](https://arxiv.org/abs/2505.13211) | repo Apache-2.0, 3,795 stars, last push 2026-06-17 [repo](https://github.com/SandAI-org/MAGI-1) | likely allowed (check weights) | likely allowed (check weights) |
| **Step-Video-T2V** (arXiv 2502.10248) | 30B; "up to 204 frames" [arXiv](https://arxiv.org/abs/2502.10248) | repo MIT, last push **2025-03-17** (stale) [repo](https://github.com/stepfun-ai/Step-Video-T2V); TI2V repo MIT [repo](https://github.com/stepfun-ai/Step-Video-TI2V) | likely allowed (check weights) | likely allowed (check weights) |
| **LongCat-Video** (arXiv 2510.22200, 2025-10-25) | 13.6B; T2V, I2V and video continuation; 720p 30 fps; "minutes-long videos" [arXiv](https://arxiv.org/abs/2510.22200) | **MIT weights (read on card)**; "does not grant any rights to use Meituan trademarks or patents" [HF card](https://huggingface.co/meituan-longcat/LongCat-Video); repo MIT, last push 2026-05-27 [repo](https://github.com/meituan-longcat/LongCat-Video) | allowed | allowed |
| **Kandinsky 5.0** (arXiv 2511.14993, v3 2026-05-26) | Video Lite 2B and Video Pro 19B; "10-second video"; human evaluation claimed [arXiv](https://arxiv.org/abs/2511.14993) | repo MIT, last push 2026-08-07 [repo](https://github.com/kandinskylab/kandinsky-5); weights not read | likely allowed (check) | likely allowed (check) |
| **HoloCine** | see §1 | **CC BY-NC-SA 4.0, academic only** | **not allowed** | **not allowed** |
| Waver (FoundationVision) | "Industry-level video foundation model" | **no licence** [repo](https://github.com/FoundationVision/Waver) | not allowed | not allowed |
| Diffusion as Shader (SIGGRAPH 2025; arXiv 2501.03847) | 3D tracking videos as the control signal for camera, motion and editing [arXiv](https://arxiv.org/abs/2501.03847) | repo Apache-2.0, 846 stars, last push 2025-06-09 [repo](https://github.com/IGL-HKUST/DiffusionAsShader); base-model licence not checked | check base model | check base model |

- **Wan's newer versions:** the Wan-Video GitHub org lists only Wan2.2, Wan-Animate-2, Wan-Dancer, Wan-skills ("AI Agent Skills for Wan") and Wan2.1. — [GitHub org search: Wan-Video](https://github.com/Wan-Video). Meanwhile VideoClaw's default video model is `wan2.7-i2v` via API. — [VideoClaw](https://github.com/HITsz-TMG/VideoClaw)

**Hosted inference terms**

- **fal.ai** (Terms "Last Updated: September 8, 2026"):
  - Outputs: fal does not take "any intellectual property rights in any Output Content".
  - Third-party models: "Third-Party Materials may be subject to additional terms".
  - Restrictions: Section 14(c) bars using third-party materials **or their outputs** to build competing products or to train AI models.
  - Territory: "worldwide" API access, subject to US export and embargo rules.
  - Data: Usage Data, which can derive from inputs, may be used "to design, develop, and offer Company products, services, and AI models". — [fal.ai/terms](https://fal.ai/terms)
- **Replicate** (Terms "Last Update: April 1, 2026"):
  - Outputs: Replicate grants "all right, title and interest, if any, in and to Output", "**subject to any Third Party Terms**".
  - Licences: "You must review and agree to comply with such Third-Party Terms, **including the applicable Model licenses**".
  - Data: licence to use Customer Data to "train and generate Customer Derivative Models".
  - Territory: US-embargo exclusions. — [replicate.com/terms](https://replicate.com/terms)

### Inferences
- **UK work:** HunyuanVideo, HunyuanVideo 1.5 and anything built on them must be excluded from any pipeline that touches UK clients or UK-based staff. That includes MovieAgent's HunyuanVideo-I2V path, and probably SkyReels-V1, which Pallaidium lists as "SkyReels-V1 Hunyuan".
  - The licence also applies only "in the Territory". Whether outputs made in India and delivered to UK clients are covered is a legal question.
  - Under "unclear = not allowed", treat Hunyuan-family weights as **not usable for UK-market work**.
- **LTX-2:** the US$10M threshold is aggregated across affiliates. A small production company is likely under it today, but the paid-licence trigger needs monitoring as the business grows.
- **Output-training bans:** LTX-2.x, Hunyuan and fal's terms each restrict using outputs to train other models. That limits plans to fine-tune the client's own "taste" model on generated clips from those engines (relevant to P4).
- **Self-hosted vs hosted:** the most permissive self-hostable set is Wan 2.1/2.2, VACE and LongCat-Video, with Mochi, Open-Sora 2.0, MAGI-1, Step-Video and Kandinsky 5 pending weight-card checks. Hosted APIs (fal, Replicate) do not launder licences.
- **Controllability:** for the client's control-heavy design (depth, edges, masks, pose), the open engines with explicit control support in what I read are:
  - VACE: masks, reference, video-to-video.
  - Wan-Animate-2: capabilities not read.
  - LTX-2: trainable IC-LoRAs.
  - Diffusion as Shader / Uni3C: 3D tracking, point clouds, SMPL-X.
  - Base T2V models alone are not enough.

### Gaps
- **Search budget exhausted:** open video models released Aug–Oct 2026 that I did not already know of were not searched for. So "any newer ones as of Oct 2026" is incomplete, beyond LTX-2.5 (named in the licence), Wan-Animate-2/Wan-Dancer (repos) and SkyReels-V3 (repo).
- I did not read the Hugging Face weight-card licences for Mochi, Open-Sora 2.0, MAGI-1, Step-Video, Kandinsky 5, LongLive, VACE, LTX-Video 0.9.x or Wan-Animate-2. Those are "likely allowed (check)", not confirmed.
- I did not read the full Skywork Community License PDF, the HunyuanVideo-Avatar/Foley licences, or SkyReels-V3's licence.
- I did not read Mochi's model card, so it has no capability figures.
- I did not read Comfy Org's, fal's or Replicate's model-specific pricing.
- Wan 2.5–2.7 open-weight status: no open repo found. I could not confirm whether any weights were released elsewhere.

---

## 5. Evaluation code: inventory, what each measures, licence

### Takeaway
The main open evaluators fall into four groups.
- **Benchmark suites:** VBench, VBench++ and VBench-2.0 (one repo, Apache-2.0, maintained).
- **Learned scorers and rewards:** VideoScore / VideoScore2 (MIT), VideoAlign/VideoReward (MIT, now under KlingAIResearch) and VisionReward (Apache-2.0 code).
- **MLLM-judge benchmarks:** Video-Bench (Apache-2.0).
- **No licence (not allowed):** EvalCrafter and T2V-CompBench.

Agent papers each ship their own evaluator (AniEval, FilmEval, VSA/CriticAgent, VABench, UniVA-Bench, DramaBoard, MMMC/TeachQuiz). These are mostly not packaged for reuse.

None of them measures a clip against a client-specific geometric or brand specification. They score generic quality, alignment and physics.

### Cited Findings

| Tool | What it measures (from paper/README) | Licence (verdict) | Stars, last push |
|---|---|---|---|
| **VBench** (arXiv 2311.17982) / **VBench++** (2411.13503) | "16 dimensions", e.g. subject identity inconsistency, motion smoothness, temporal flickering, spatial relationship; human-preference annotations per dimension; VBench++ adds image-to-video [VBench](https://arxiv.org/abs/2311.17982), [VBench++](https://arxiv.org/abs/2411.13503) | Apache-2.0 (allowed) | 1,823; 2026-08-21 [repo](https://github.com/Vchitect/VBench) |
| **VBench-2.0** (arXiv 2503.21755) | "intrinsic faithfulness": Human Fidelity, Controllability, Creativity, Physics, Commonsense [arXiv](https://arxiv.org/abs/2503.21755) | same repo, Apache-2.0 | same |
| **EvalCrafter** (arXiv 2310.11440) | 700 prompts; 17 objective metrics (visual, content, motion, text-video alignment), fitted to user opinions [arXiv](https://arxiv.org/abs/2310.11440) | **no licence (not allowed)** | 196; **2024-10-03 (stale)** [repo](https://github.com/evalcrafter/EvalCrafter) |
| **VideoScore** (arXiv 2406.15252) | trained on VideoFeedback (37.6K videos, human multi-aspect scores); Spearman 77.1 with humans on its own test set [arXiv](https://arxiv.org/abs/2406.15252) | MIT code (weights not read) | 126; 2025-12-04 [repo](https://github.com/TIGER-AI-Lab/VideoScore) |
| **VideoScore2** (arXiv 2509.22799) | visual quality, text alignment, physical/common-sense consistency with chain-of-thought rationales; 27,168 human-annotated videos; SFT + GRPO [arXiv](https://arxiv.org/abs/2509.22799) | MIT code (weights not read) | 59; 2026-09-14 [repo](https://github.com/TIGER-AI-Lab/VideoScore2) |
| **T2V-CompBench** (arXiv 2407.14505; CVPR 2025) | compositionality: attribute binding, spatial relations, motion and action binding, interactions, numeracy; 1,400 prompts; MLLM, detection and tracking metrics [arXiv](https://arxiv.org/abs/2407.14505) | **no licence (not allowed)** | 125; 2025-10-25 [repo](https://github.com/KaiyueSun98/T2V-CompBench) |
| **Video-Bench** (arXiv 2504.04907; CVPR 2025) | MLLM-based scoring across dimensions with "few-shot scoring and chain-of-query" [arXiv](https://arxiv.org/abs/2504.04907) | Apache-2.0 (allowed) | 82; 2025-06-09 [repo](https://github.com/Video-Bench/Video-Bench) |
| **VideoAlign / VideoReward** (arXiv 2501.13918) | reward on Visual Quality, Motion Quality and Text Alignment; Flow-DPO, Flow-RWR and Flow-NRG alignment [arXiv](https://arxiv.org/abs/2501.13918) | MIT code; weights on HF, licence not read | 518; news through 2025-08-14 [repo (now KlingAIResearch/VideoAlign)](https://github.com/KwaiVGI/VideoAlign) |
| **VisionReward** (arXiv 2412.21059; AAAI 2026) | hierarchical, interpretable multi-dimensional preference for image and video; "surpasses VideoScore by 17.2% in preference prediction accuracy" [arXiv](https://arxiv.org/abs/2412.21059) | Apache-2.0 code (weights not read) | 427; 2025-03-26 [repo](https://github.com/zai-org/VisionReward) |
| AniEval (in AniMaker) | multi-shot animation: story consistency, action completion, context-aware per clip [arXiv](https://arxiv.org/abs/2506.10540) | in an unlicensed repo (not allowed) | — |
| FilmEval (FilMaster) | "cinematic dimensions" (no detail published) [project](https://filmaster-ai.github.io/) | not released | — |
| VSA metric + CriticAgent + ScriptBench | script-to-video alignment [arXiv 2601.17737](https://arxiv.org/abs/2601.17737) | not checked | — |
| VABench (VideoGen-Agent) | 600 prompts incl. identity preservation, physics, multi-shot structure [arXiv 2609.24997](https://arxiv.org/abs/2609.24997) | not checked | — |
| UniVA-Bench | multi-step agentic video tasks [arXiv 2511.08521](https://arxiv.org/abs/2511.08521) | HF datasets; licence not read | — |
| MovieGen-Bench (VISTA) | single- and multi-scene tasks (search summary) | not checked | — |
| GenAD-Bench (Co-Director) | 400 fictional-product ad scenarios [arXiv 2604.24842](https://arxiv.org/abs/2604.24842) | not checked | — |
| DramaBoard (DramaDirector) | 35 dramas, 2.8K episodes, 81K shots [arXiv 2606.24107](https://arxiv.org/abs/2606.24107) | MIT code; source-video rights unclear | — |
| Paper2Video benchmark, MMMC/TeachQuiz | presentation and educational video [Paper2Video](https://arxiv.org/abs/2510.05096), [Code2Video](https://arxiv.org/abs/2510.01174) | MIT repos | — |

### Inferences
- **Usable off the shelf:** VBench (incl. 2.0), Video-Bench, VideoScore2 code, VideoAlign code and VisionReward code are licensable for commercial internal use. Weights for the learned scorers need separate checking. VBench also calls many third-party sub-models, each with its own licence.
- **Generic scores only:** these tools score quality, alignment and plausibility. None checks "logo at pixel X, product colour within ΔE, camera move matches the planned path, cut at frame N". The client's skeleton-referenced checker would need to be built in-house, using classical measures such as optical flow, keypoints, segmentation IoU, colour difference and OCR. The learned scorers could serve as a secondary aesthetic and plausibility gate.
- **Judge independence:** the "Agentic Artifact Creation" survey warns that learned judges sharing the generator's blind spots add little evidence. That argues for the client's measured, specification-based pass marks over VLM-only judging.

### Gaps
- Agreement with human judgement is covered by another researcher, so it is not assessed here.
- I did not read the Hugging Face licences for the VideoScore, VideoScore2, VideoReward and VisionReward weights.
- I did not inventory the licences of the third-party models bundled by VBench.
- Code and licence status for the VSA/CriticAgent, VABench, MovieGen-Bench and GenAD-Bench evaluators was not checked.

---

## 6. Does any open project already implement "3D skeleton → generative surface with control inputs → measured check against the skeleton with pass marks set beforehand → composite exact parts back → preview approval before spend"?

### Takeaway
**No single open project does all of it.** The pieces exist separately, and the combination is still open territory.
- **3D-first, render-only:** Kubrick (agents write Blender scripts, a reviewer checks screenshots; code not located) and FilmAgent (agents in Unity 3D spaces).
- **3D or geometry → generative:**
  - Pallaidium: Blender strips rendered as LTX-2.3 control video. GPL-3.0, maintained.
  - DramaDirector: retrieved depth and pose references guide generation. MIT, tiny.
  - CinePreGen: engine-powered diffusion previs, with a user study.
  - Diffusion as Shader / Uni3C / GO-Renderer / Shape-for-Motion: 3D tracking, point-cloud, SMPL-X or 3D-proxy control of video diffusion.
- **Structured spec → critic → targeted repair:** CineCrew's FilmDSL (Apache-2.0), plus VideoGen-Agent's verification tools.
- **Missing everywhere:** checks measured numerically against the 3D skeleton with thresholds fixed before generation, and compositing exact parts back.

### Cited Findings
- **Kubrick:** VLM agents "create Blender scripts which render a video". The Reviewer uses "character motion coordinates, and intermediate screenshots" to feed back to the Programmer. — [arXiv 2408.10453](https://arxiv.org/abs/2408.10453)
- **FilmAgent:** "end-to-end film automation in our constructed 3D virtual spaces", with agents deciding camera setups and actor positions. — [arXiv 2501.12909](https://arxiv.org/abs/2501.12909)
- **CinePreGen:** "visual previsualization system enhanced with engine-powered diffusion". It has a camera and storyboard interface, "multi-masked IP-Adapter and engine simulation guidelines", and a within-subjects user study (arXiv 2408.17424, 2024-08-30). — [arXiv 2408.17424](https://arxiv.org/abs/2408.17424). Code not located.
- **Pallaidium:** "LTX-2.3 3DREAL mode renders the active strip to a trimmed clip and uses it as control video, with a reference image for appearance". It also adds an EEVEE Mist/depth pass. — [README](https://github.com/tin2tin/Pallaidium)
- **DramaDirector:** "retrieves depth-pose references to guide first-frame generation and image-to-video synthesis". MIT. — [arXiv 2606.24107](https://arxiv.org/abs/2606.24107); [repo](https://github.com/iLearn-Lab/DramaDirector)
- **Better Call CineCrew:** FilmDSL makes "shot and camera directives, asset and continuity requirements" explicit. Asset packs and keyframes "anchor composition before clip-by-clip synthesis". A "critic agent produces structured QA signals and triggers targeted refinement". Apache-2.0. — [arXiv 2609.07720](https://arxiv.org/abs/2609.07720); [repo](https://github.com/Ironieser/CineCrew)
- **Diffusion as Shader:** "leverages 3D tracking videos as control inputs, making the video diffusion process inherently 3D-aware". Apache-2.0. — [arXiv 2501.03847](https://arxiv.org/abs/2501.03847); [repo](https://github.com/IGL-HKUST/DiffusionAsShader)
- **Uni3C:** point clouds unprojected from monocular depth for camera control, plus "scenic point clouds and SMPL-X characters" as 3D world guidance (SIGGRAPH Asia 2025). — [arXiv 2504.14899](https://arxiv.org/abs/2504.14899)
- **GO-Renderer:** "reconstructed 3D proxies to guide the video generative models" for object rendering at "arbitrary viewpoints under arbitrary lighting". Relevant to exact product shots. — [arXiv 2603.23246](https://arxiv.org/abs/2603.23246)
- **Shape-for-Motion:** a "3D proxy" mesh is edited, then "projected onto the 2D space to produce the edited geometry and texture renderings, which serve as inputs to a decoupled video diffusion model". — [arXiv 2506.22432](https://arxiv.org/abs/2506.22432)
- **VideoGen-Agent:** coordinates "augmentation, generation, and verification tools", with a reward that checks tool-call validity and video quality. — [arXiv 2609.24997](https://arxiv.org/abs/2609.24997)
- **Code2Video:** controls a "renderable environment … via logical commands (e.g., code)", with a VLM Critic for layout. This is deterministic rendering for exact parts. — [arXiv 2510.01174](https://arxiv.org/abs/2510.01174)
- **Patent (search summary):** Chinese patent CN 121982167 A describes a "renderer agent" that builds a rough 3D scene with layout, lighting and camera tracks, renders a multi-channel 2D proxy, and feeds it to a video diffusion model as conditioning. I did not read the patent itself and do not know its date (unverified). — (search summary) [goveda.com](https://www.goveda.com/patent/CN-121982167-A)
- **Preview approval / cost gate:** among open projects, only video-podcast-maker advertises "cost-gated AI generation". — [repo](https://github.com/Agents365-ai/video-podcast-maker)
  - VideoClaw allows "user intervention at any point". — [repo](https://github.com/HITsz-TMG/VideoClaw)
  - ViMax's TUI and Web UI let the user review text artifacts and control rendering. — [README](https://github.com/HKUDS/ViMax)

### Inferences
- **Novelty:** the client's combination is not implemented in any open project I found. Two elements look genuinely novel relative to the open literature:
  - Pass marks written before generation and measured against a 3D ground truth.
  - Compositing deterministic exact parts back over the generated surface.
- **Closest buildable open stack:**
  - Blender as the skeleton.
  - Pallaidium or a ComfyUI-BlenderAI bridge to render control passes (both GPL-3.0).
  - An Apache/MIT engine with control: Wan 2.2 plus VACE, LTX-2 IC-LoRA under the revenue cap, or Diffusion-as-Shader-style 3D tracking.
  - A CineCrew-style structured spec plus critic/repair loop (Apache-2.0).
  - A custom, measurement-based checker.
- **Prior art risk:** the Chinese patent (if accurate) and CinePreGen show that "3D proxy render → diffusion conditioning" is known prior art. Any IP or novelty claim by the client should be about the **measured, pre-registered checking and compositing loop**, not the conditioning itself.

### Gaps
- I did not locate code for Kubrick, CinePreGen, GO-Renderer or Uni3C. Uni3C's project page is on GitHub (ewrfcas/Uni3C), but I did not check its licence.
- I did not read the Chinese patent or check its date or status.
- I did not check whether CineCrew's critic uses numeric thresholds.
- Commercial products, for example LTX Studio's 3D blocking and other closed previs-to-AI tools, are out of scope and were not checked.
