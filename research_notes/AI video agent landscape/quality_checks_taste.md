# Automatic quality checking and taste for generated video: judges, agreement with people, taste learning and checking against a plan

Scope: research notes for Das Production (Kolkata; India and UK markets). Their planned agent judges its own clips for quality, taste, on-brief and on-brand, retries what fails and learns what one person likes. Their method is a 3D/code "skeleton", generative surface, a checker with pass marks set before generation, and a cheap preview a person approves.

Conventions in these notes:
- Every source was read on **2026-10-15** unless marked otherwise. An arXiv ID gives the paper's first-submission month (2311 = Nov 2023).
- Each claim is labelled by origin: **(paper)**, **(open-source tool)**, **(shipped product page)**, **(vendor marketing)**, **(leaderboard)** or **(beta)**.
- **(abstract only)** means only the arXiv abstract was read, not the tables.
- **(fetch summary)** means a fetch tool's summary of a long page. Numbers were checked against the table where the tool quoted it, but they could not be checked line by line.
- **Licences:** "HF metadata" means the licence tag on the Hugging Face model card read through the HF API, not the full licence text. When a licence is unclear or conflicting, it is treated as **not allowed**.
- **Research limit:** the shared WebSearch budget ran out after one search in this session. Everything else came from fetching URLs I already knew. Many product help pages returned HTTP 403: Midjourney docs, Adobe Firefly help, Canva help, Runway help and the LMArena leaderboard. Product coverage for taste and personalisation is therefore thin and marked as gaps.

---

## 1. Benchmarks and metrics (VBench family, EvalCrafter, T2V-CompBench, FETV, Video-Bench, physics benchmarks): what they measure and how well they agree with people

### Takeaway
The benchmarks' headline human-alignment numbers in the 80–99% range compare **model rankings**, so they rest on a handful of models. VBench-2.0 has 4 data points per dimension. That says nothing about whether one clip is good. Where alignment is measured **per clip or per sample**, the best automatic metrics reach Spearman ρ ≈ 0.3–0.79, depending on the property. Physics and human anatomy are the weakest: the authors say VLMs "cannot serve as reliable evaluators" there, and GPT-4V scores near chance on physics.

### Cited Findings

**Master table: evaluation and judging methods and their measured agreement with humans.** Each row gives what is measured, the unit of agreement, the number and a licence verdict for commercial use.

| Method (origin, date) | What it judges | Agreement with humans (as reported) | Unit of agreement | Licence / commercial use |
|---|---|---|---|---|
| VBench (paper, Nov 2023) | 16 dimensions, e.g. subject consistency, motion smoothness, flicker, spatial relationship | Text says "highly correlated"; per-dimension Spearman ρ appears only in Fig. 5, which I could not read as text | Model-level win ratios from pairwise human votes (4 models per group) | Code Apache-2.0 ([LICENSE](https://raw.githubusercontent.com/Vchitect/VBench/master/LICENSE)). The sub-models it calls have their own licences, not checked → check each one |
| VBench-2.0 (paper, Mar 2025) | 5 areas: Human Fidelity, Controllability, Creativity, Physics, Commonsense (18 sub-dimensions) | Spearman ρ 81.7% (Composition) to 99.5% (Human Identity) | **Model-level, 4 models**: "each value rests on four data points" | Not checked (assumed same repo family) → unclear |
| EvalCrafter (paper, Oct 2023) | 17 metrics over visual, content and motion quality and text-video alignment; 700 prompts | Fitted score Spearman ρ: visual quality 55.4, motion amplitude 45.0, temporal consistency 56.7, text-video alignment 32.3 (×100) | Sample-level human 1–5 ratings, 20% held out | LICENSE file not found in repo (404) → unclear → not allowed |
| T2V-CompBench (paper, Jul 2024) | Composition: attribute binding, spatial, motion, action, interaction, counting | Best metric per category, Kendall τ / Spearman ρ: consistent attributes 0.66/0.79 (Grid-LLaVA); spatial 0.58/0.71 (G-DINO detection); counting 0.41/0.54 (G-DINO); motion 0.45/0.54 (DOT tracking); dynamic attributes 0.44/0.51 (D-LLaVA). CLIP baseline as low as −0.01 | Sample-level human ratings | LICENSE 404 → unclear → not allowed |
| Video-Bench (paper, CVPR 2025) | GPT-4o-based judge with few-shot and chain-of-query prompting, 9 dimensions | Spearman ρ 0.402 (temporal consistency) to 0.750 (colour consistency); my average ≈ 0.67. Best non-MLLM baselines: MUSIQ 0.363, LAION aesthetic 0.446, CLIP temporal 0.260 | Against human ratings (level not confirmed) | Not checked; uses paid GPT-4o |
| FETV (paper, Nov 2023) | Fine-grained prompt categories, including temporal ones | CLIPScore and FVD "correlate poorly with human evaluation"; numbers not in the abstract | – | Not checked |
| VideoPhy (paper, Jun 2024) | Physical commonsense (PC) and semantic adherence (SA) | Best generator passes both in only 39.6% of cases. Judges, ROC-AUC vs humans (SA / PC): GPT-4-Vision 53/53, Gemini-1.5-Pro 73/58, VideoCon-Physics 82/73. **Human inter-annotator agreement 75% SA, 70% PC** | Per clip | Not checked |
| PhyGenBench / PhyGenEval (paper, Oct 2024) | 160 prompts, 27 physical laws | "Aligns closely with human feedback"; no number in the abstract | – | Not checked |
| Physics-IQ (paper, Jan 2025) | Real-video continuation of physical events; spatial and spatiotemporal IoU, MSE | Best model (VideoPoet multiframe) scores 29.5 of 100 (physical-variance ceiling = 100). Gemini 1.5 Pro tells real from generated (2AFC) at 86.9% for Lumiere down to 55.6% for Sora | Per clip, against real footage, not people | Apache-2.0 software, CC-BY-4.0 materials ([LICENSE](https://raw.githubusercontent.com/google-deepmind/physics-IQ-benchmark/main/LICENSE)) |
| VideoScore v1 (paper, Jun 2024) | Multi-aspect 1–5 scores; trained on 37.6K videos from 11 generators | Spearman 77.1 on its own VideoFeedback-test | Per clip | Apache-2.0 (HF metadata, [model](https://huggingface.co/TIGER-Lab/VideoScore)); v1.1 MIT; dataset VideoFeedback Apache-2.0 (HF metadata). Base model (Mantis) licence not checked |
| VideoScore2 (paper, Sep 2025) | Visual quality, text alignment, physical/common-sense consistency, with written reasoning | Exact 1–5 match 44.35%; within ±1 point 90.78%; PLCC 60.37 (in-domain). Out-of-domain average 50.37 | Per clip | Apache-2.0 (HF metadata); base Qwen2.5-VL-7B-Instruct Apache-2.0 (HF metadata); dataset VideoFeedback2 Apache-2.0 (HF metadata) → usable, pending a full-text check |
| VideoReward / VideoAlign, Kuaishou Kling team (paper, Jan 2025) | Visual quality, motion quality, text alignment; trained on 182k human pairs, 108k videos, 12 generators | Pairwise accuracy without ties: 73.59% on its own VideoGen-RewardBench, 72.89% on GenAI-Bench. With ties: 61.26% / 49.41% | Per pair | Code MIT ([LICENSE](https://raw.githubusercontent.com/KwaiVGI/VideoAlign/main/LICENSE)); weights Apache-2.0 (HF metadata, [KlingTeam/VideoReward](https://huggingface.co/KlingTeam/VideoReward)); base Qwen2-VL-2B-Instruct Apache-2.0 (HF metadata) → usable, pending a full-text check |
| VisionReward (paper, Dec 2024) | Hierarchical, interpretable image and video preference | "Surpasses VideoScore by 17.2%" in preference prediction; on VideoGen-RB 67.59% without ties | Per pair | CogVLM licence: academic use free; **commercial use requires registering with Zhipu**; Llama 3 licence also applies; PRC law governs ([licence](https://huggingface.co/THUDM/cogvlm2-video-llama3-chat/blob/main/LICENSE)) → not allowed until registered and reviewed |
| UnifiedReward (paper, Mar 2025) | One reward model for image and video understanding and generation; pairwise and pointwise | No video numbers in the abstract | – | MIT (HF metadata, [2.0-qwen-7b](https://huggingface.co/CodeGoat24/UnifiedReward-2.0-qwen-7b)). Trained on a mix of datasets (HPD, LiFT-HRA, VideoFeedback, VideoDPO…) whose licences were not checked → unclear for commercial use |
| DOVER (paper/tool, ICCV 2023) | Technical and aesthetic video quality of user-generated footage | PLCC 0.883 on KoNViD-1k, 0.889 on LSVQ_test (natural video, not AI video). On AI video (VideoScore-Bench-v2): exact match 34.00%, PLCC 38.69 | Per clip | **Conflict:** GitHub carries the S-Lab License 1.0, "non-commercial purpose" ([LICENSE](https://raw.githubusercontent.com/VQAssessment/DOVER/master/LICENSE)); HF card says MIT ([teowu/DOVER](https://huggingface.co/teowu/DOVER)) → **not allowed** |
| Q-Align / OneAlign (paper, Dec 2023) | Image quality, aesthetics and video quality through discrete text levels | No numbers in the abstract | – | **Conflict:** GitHub S-Lab 1.0, non-commercial ([LICENSE](https://raw.githubusercontent.com/Q-Future/Q-Align/main/LICENSE)) vs HF MIT ([one-align](https://huggingface.co/q-future/one-align)) → **not allowed** |
| LAION improved aesthetic predictor (open-source tool) | CLIP ViT-L/14 + MLP "how much people on average like an image" | No accuracy reported in the repo. As a video aesthetic baseline, Spearman 0.446 (Video-Bench). On Pick-a-Pic, 56.8% preference accuracy | Per frame | Apache-2.0 ([LICENSE](https://raw.githubusercontent.com/christophschuhmann/improved-aesthetic-predictor/main/LICENSE)) |
| PickScore (paper, May 2023; image) | Prompt + image preference | 70.5% on Pick-a-Pic vs expert humans 68.0%, HPS 66.7, ImageReward 61.1, CLIP-H 60.8 | Per pair (image) | Code MIT ([LICENSE](https://raw.githubusercontent.com/yuvalkirstain/PickScore/main/LICENSE)); **weights have no licence tag** ([HF](https://huggingface.co/yuvalkirstain/PickScore_v1)) → unclear → not allowed |
| ImageReward (paper, Apr 2023; image) | Prompt + image preference | 65.14% vs CLIP 54.82, aesthetic 57.35, BLIP 57.76. **Researcher vs individual annotator agreement 65.3% (±8.5)**; vs annotator majority 73.4% | Per pair (image) | Apache-2.0 (HF metadata, [zai-org/ImageReward](https://huggingface.co/zai-org/ImageReward)) |
| HPS v2 (paper, Jun 2023; image) | Prompt + image preference; 798,090 choices on 433,760 pairs | "More accurately predicts" preferences; no number in the abstract | Per pair (image) | Apache-2.0 (repo [LICENSE](https://raw.githubusercontent.com/tgxs002/HPSv2/master/LICENSE) and HF metadata) |
| DSG, Davidsonian Scene Graph (paper, Oct 2023; image) | Prompt → atomic questions → VQA answers | Spearman ρ 0.571 vs human Likert (PaLI). VQA matches human answers 73.8% overall, **13.7% on text rendering, 21.1% on style, 67.4% on counting** | Per item | Not checked |
| GPT-4o / Gemini-1.5-Pro as zero-shot video judges (GenAI-Arena, paper, Jun 2024) | Four-way pairwise vote (left, right, tie, both bad) | Text-to-video exact match: GPT-4o 48.46%, Gemini-1.5-Pro 46.21%, random 25.16%; most open VLMs score below random | Per pair | Paid APIs |
| GPT-5, Gemini-2.5-Pro, Claude-Sonnet-4 as zero-shot scorers (VideoScore2 paper, Sep 2025) | 1–5 scores on three dimensions | Exact match 26.24% / 27.90% / 28.93%; within ±1 point 69.01% / 67.94% / 71.74%; PLCC 17.99 / 26.47 / 22.94. All below the trained 7B VideoScore2 (44.35 / 90.78 / 60.37) | Per clip | Paid APIs |

Sources for the table rows:
- VBench, Nov 2023 (paper, abstract and §3.3/§4.2): 16 dimensions. Human data is pairwise: 4 models per prompt group, 5 groups per prompt, 6 pairs per group, order randomised. Correlation values appear only in Fig. 5 — [VBench abs](https://arxiv.org/abs/2311.17982), [VBench html](https://arxiv.org/html/2311.17982)
- VBench-2.0, Mar 2025 (paper): Spearman ρ by dimension: Human Anatomy 95.46%, Human Clothes 90.89%, Human Identity 99.46%, Composition 81.70%, Diversity 94.53%, Mechanics 93.56%, Material 93.71%, Thermotics 93.86%, Multi-View Consistency 98.44%, Dynamic Spatial Relationship 97.36%, Dynamic Attribute 90.95%, Motion Order 99.31%, Human Interaction 89.28%, Complex Landscape 91.82%, Complex Plot 89.59%, Camera Motion 97.95%, Motion Rationality 87.97%, Instance Preservation 99.11%. Computed over the win ratios of four models (fetch summary) — [VBench-2.0](https://arxiv.org/html/2503.21755)
- VBench-2.0's evaluator limits (paper): current large models "cannot serve as reliable evaluators" for human anatomy and motion rationality, so the authors used specialist detectors. VLMs "perform poorly" at counting and 3D understanding. They hallucinate interactions when only one person is present. They make errors summarising long videos. Fine-tuned specialists may overfit — [VBench-2.0](https://arxiv.org/html/2503.21755)
- VBench++, Nov 2024 (abstract only): adds image-to-video and "trustworthiness"; no alignment numbers in the abstract — [VBench++](https://arxiv.org/abs/2411.13503)
- EvalCrafter (paper): 7 users rated each metric 1–5. Of 8,647 scores, 1,024 were kept. Linear regression was fitted on 80% and tested on 20%. In the paper, the fitted score barely beats a plain average: visual quality 55.4 vs 55.0, text-video alignment Kendall 22.5 vs 22.7 — [EvalCrafter html](https://arxiv.org/html/2310.11440)
- T2V-CompBench (paper): full table, including CLIP dynamic attributes −0.0096 / −0.014 and PLLaVA spatial −0.125 / −0.151 — [T2V-CompBench html](https://arxiv.org/html/2407.14505)
- Video-Bench (paper): GPT-4o (gpt-4o-2024-08-06) reads the frames and GPT-4o-mini builds the query chains. Temporal consistency is reported as 0.402 in Table 2 but 0.531 in ablation Table 4(a), so the paper is inconsistent with itself — [Video-Bench html](https://arxiv.org/html/2504.04907)
- FETV (abstract only) — [FETV](https://arxiv.org/abs/2311.01813)
- VideoPhy (paper) — [abs](https://arxiv.org/abs/2406.03520), [html Table 4](https://arxiv.org/html/2406.03520)
- PhyGenBench (abstract only): models struggle with physics, and scaling or prompt engineering does not fix it, especially for dynamic scenes — [PhyGenBench](https://arxiv.org/abs/2410.05363)
- Physics-IQ (paper): "physical understanding is severely limited, and unrelated to visual realism" — [abs](https://arxiv.org/abs/2501.09038), [html](https://arxiv.org/html/2501.09038v3)

### Inferences
- Benchmark "alignment" figures such as VBench-2.0's 82–99% show that a benchmark **ranks models** as people would. They are not evidence that the same metric can pass or fail **one clip**. Das Production needs per-clip decisions. The relevant numbers are the per-sample ones: ρ ≈ 0.3–0.57 for EvalCrafter, ≈ 0.4–0.75 for Video-Bench, ≈ 0.5–0.79 for the best T2V-CompBench metric in each category.
- Narrow, geometric questions are judged better by detectors and trackers than by VLMs. In T2V-CompBench, spatial relationships score ρ 0.71 with G-DINO but −0.15 with PLLaVA. Motion scores 0.54 with DOT tracking but 0.16 with Grid-LLaVA. This supports the client's design: deterministic checks against an explicit skeleton, with the VLM kept for semantics.
- Physics is the weakest area for every automatic judge. Even humans agree with each other only about 70% of the time on physical commonsense (VideoPhy).

### Gaps
- VBench's per-dimension Spearman values sit only in a figure; I did not read them.
- PhyGenEval, FETV and Q-Align correlations: only abstracts were read.
- No benchmark validated with Indian or UK audiences specifically was found. With search exhausted, I could not look further.
- Licences of the sub-models VBench calls (MUSIQ, RAFT, AMT, GRiT, DINO and others) were not checked.

---

## 2. Learned scorers and reward models (VideoScore/VideoScore2, VisionReward, VideoAlign/VideoReward, UnifiedReward, Q-Align, DOVER, aesthetic predictors, frame-level image scorers)

### Takeaway
The best trained video reward models agree with human pairwise preference about **72–74%** of the time when ties are excluded, on data like their training data. That is roughly the ceiling set by human-to-human agreement of 65–75%. Out of domain they fall apart: VideoScore scores **50.2%, chance level,** on VideoReward's benchmark, and the best out-of-domain average is about 50. Absolute 1–5 scores match a person exactly only **~44%** of the time at best, and within one point ~91%.

### Cited Findings
- VideoReward / VideoAlign (paper, Jan 2025):
  - Data: 182k annotated triplets, 16k prompts, 108k videos, 12 generators; 13k held out.
  - Pairwise accuracy on VideoGen-RewardBench, with ties / without ties: Random 41.86 / 50.30; VideoScore 41.80 / 50.22; LiFT 39.08 / 57.26; VisionReward 56.77 / 67.59; VideoReward 61.26 / 73.59.
  - On GenAI-Bench, VisionReward beats it with ties (51.56 vs 49.41).
  - Per dimension, without ties: visual quality 75.66, motion quality 74.70, text alignment 72.20.
  - [VideoAlign html](https://arxiv.org/html/2501.13918v2)
- VideoScore v1 (abstract only, Jun 2024): 37.6K videos from 11 generators; Spearman 77.1 on VideoFeedback-test, "about 50 points" above prior metrics — [VideoScore](https://arxiv.org/abs/2406.15252)
- VideoScore2 (paper, Sep 2025):
  - Trained on 27,168 human-annotated videos with scores and reasoning traces; supervised fine-tuning then GRPO.
  - In-domain average, exact / within ±1 / PLCC: VideoScore2 44.35 / 90.78 / 60.37; VideoScore1.1 38.41 / 86.77 / 42.30; VisionReward 36.61 / 84.57 / 43.47; DOVER 34.00 / 78.48 / 38.69; VideoReward 26.16 / 64.03 / 47.34.
  - Out-of-domain averages: VideoScore2 50.37; Q-Insight 46.05; VideoReward 44.73; VisionReward 42.86.
  - VideoReward is best on VideoGenReward (59.69). On VideoPhy2-test, every model scores 22–34.
  - Authors' stated limit: models "still struggle in evaluating physics and common senses".
  - Human inter-annotator agreement (30 videos per trial), within ±1 / Krippendorff α: VQ 93.33/92.06 and 96.67/90.61; TA 93.33/82.71 and 80.00/77.62; PC 83.33/82.99 and 80.00/80.95.
  - [VideoScore2 html](https://arxiv.org/html/2509.22799v1)
- VisionReward (abstract only, Dec 2024): video preference accuracy "surpasses VideoScore by 17.2%" (absolute or relative not stated); 31.6% higher pairwise win rate when used for optimisation — [VisionReward](https://arxiv.org/abs/2412.21059)
- UnifiedReward (abstract only, Mar 2025): the "first unified reward model" for multimodal understanding and generation; pairwise and pointwise; used to build DPO data. No video accuracy in the abstract — [UnifiedReward](https://arxiv.org/abs/2503.05236)
- DOVER (open-source tool, ICCV 2023): disentangles aesthetic and technical quality of user-generated video. PLCC: KoNViD-1k 0.883, LIVE-VQC 0.854, LSVQ_test 0.889, LSVQ_1080p 0.830 — [DOVER repo](https://github.com/VQAssessment/DOVER)
- Q-Align (abstract only, Dec 2023): scores image quality, aesthetics and video quality as discrete levels; OneAlign unifies them — [Q-Align](https://arxiv.org/abs/2312.17090)
- Frame-level image scorers (papers, image only):
  - PickScore 70.5% vs expert humans 68.0% on Pick-a-Pic.
  - On MS-COCO captions, PickScore correlates 0.917 with human raters while FID correlates −0.900. FID penalises the vivid, high-guidance images people prefer.
  - [Pick-a-Pic html](https://arxiv.org/html/2305.01569v2); [ImageReward html](https://arxiv.org/html/2304.05977); [HPSv2](https://arxiv.org/abs/2306.09341)
- Seedance 1.0 (paper, ByteDance, Jun 2025): uses three internal reward models (foundational VLM, motion, aesthetic on keyframes) for RLHF. **It reports no accuracy for any of them**, only training reward curves — [Seedance 1.0 html](https://arxiv.org/html/2506.09113)
- Licences (see the master table): usable on current metadata are VideoScore2, VideoReward, UnifiedReward (training data unclear), the LAION aesthetic predictor, HPSv2 and ImageReward. Not allowed or unclear are DOVER, Q-Align, PickScore weights, VisionReward (registration needed), EvalCrafter and T2V-CompBench.

### Inferences
- A reward model trained on someone else's generators and annotators is a **generic** taste proxy. VideoScore fell to chance on a newer benchmark, so pass marks built on these scores need recalibration on the client's own clips, and on clips from current-generation models (2026), which none of these were trained on.
- Exact 1–5 agreement is poor even for the best models, at 44%. Using these scores as **relative rankers** (best-of-N, pairwise) is better supported than using them as absolute thresholds ("score ≥ 4 passes").
- Image scorers applied to frames (PickScore, HPS, LAION aesthetic) cannot see motion, flicker or physics. In Video-Bench, LAION aesthetic reaches ρ 0.446 against human aesthetic ratings, against 0.702 for a GPT-4o judge.

### Gaps
- None of these scorers was tested on 2026 generators such as Wan 3.0, Seedance 2.x or Veo 3.x. Their numbers may not carry over.
- UnifiedReward's video accuracy and Q-Align's correlations were not read (abstracts only).
- The full licence texts behind the HF metadata tags were not read. VideoScore v1's base model (Mantis) licence was not checked.
- No scorer trained on Indian-market or UK-market raters was found (search budget exhausted).

---

## 3. Vision-language model judges (Gemini, GPT, Claude, Qwen-VL) used on video: agreement with people, biases, failure modes

### Takeaway
Zero-shot frontier VLM judges are **weaker than small trained scorers** on generated video. On VideoScore2's benchmark (Sep 2025), GPT-5, Gemini-2.5-Pro and Claude-Sonnet-4 match a person's 1–5 score exactly only 26–29% of the time, against 44% for a 7B fine-tune. GPT-4V scores at chance on physics (ROC-AUC 53). VLM judges show position bias, length bias and hallucination. They do best at **pairwise** comparisons with both orders checked.

### Cited Findings
- **GenAI-Arena** (paper, Jun 2024): on text-to-video, exact match with the human 4-way vote is GPT-4o 48.46%, Gemini-1.5-Pro 46.21%, random 25.16%. LLaVA-1.5-7B scores 30.40, Idefics2 16.46, QwenVL 2.15 and VideoLLaVA 0.00; most open models fall below random. Mantis and Kosmos-2 could not follow the instructions — [GenAI-Arena html](https://arxiv.org/html/2406.04485); abstract: GPT-4o averages 49.19 across the three tasks — [abs](https://arxiv.org/abs/2406.04485)
- **VideoScore2** (paper, Sep 2025): GPT-5 26.24% exact, 69.01% within ±1, PLCC 17.99. Gemini-2.5-Pro 27.90 / 67.94 / 26.47. Claude-Sonnet-4 28.93 / 71.74 / 22.94. Qwen2.5-VL-72B is listed as a baseline but no result for it was found in the fetched text — [VideoScore2 html](https://arxiv.org/html/2509.22799v1)
- **VideoPhy** (paper, Jun 2024): ROC-AUC against humans (semantic adherence / physical commonsense): GPT-4-Vision 53/53, Gemini-1.5-Pro-Vision 73/58. A fine-tuned VideoCon-Physics reaches 82/73 — [VideoPhy html](https://arxiv.org/html/2406.03520)
- **Physics-IQ** (paper, Jan 2025): Gemini 1.5 Pro can often tell generated video from real (86.9% for Lumiere, 55.6% for Sora), yet physical accuracy and visual realism are unrelated — [Physics-IQ html](https://arxiv.org/html/2501.09038v3)
- **VBench-2.0** (paper, Mar 2025): VLMs are unreliable on anatomy and motion rationality, poor at counting and 3D, and hallucinate human interactions. "VLM training data rarely includes the anomalies common in generated videos" (fetch summary) — [VBench-2.0](https://arxiv.org/html/2503.21755)
- **DSG** (paper, Oct 2023, image VQA): VQA models answer text-rendering questions correctly only 13.7–24.9% of the time and style questions 21.1%. PaLI gets about 40% of counting cases wrong — [DSG html](https://arxiv.org/html/2310.18235)
- **MLLM-as-a-Judge** (paper, Feb 2024, images):
  - GPT-4V agreement with humans: pair comparison without ties 0.773, with ties 0.636; scoring Pearson 0.490; batch ranking Levenshtein 0.361. Gemini: 0.615 / 0.509 / 0.304 / 0.432.
  - **Position bias:** LLaVA repeats an "ABCD" order in 88.2% of batch-ranking answers.
  - **Length bias:** longer answers with the same content raise scores by +0.6 (GPT-4V) and +0.75 (Gemini).
  - Slight self-preference for GPT-4V; hallucination worst in batch ranking.
  - Abstract: MLLMs show "remarkable human-like discernment in Pair Comparison" but "significant divergence" in scoring and ranking.
  - [MLLM-as-a-Judge html](https://arxiv.org/html/2402.04788), [abs](https://arxiv.org/abs/2402.04788)
- **Video-Bench** (paper, CVPR 2025): GPT-4o with few-shot examples and chain-of-query prompting reaches Spearman 0.40–0.75 per dimension, beating classical metrics in every dimension. Prompting structure matters — [Video-Bench html](https://arxiv.org/html/2504.04907)
- How current systems reduce bias:
  - VISTA (paper, Oct 2025) runs every judge comparison in both orders and records a tie when the two orders conflict — [VISTA html](https://arxiv.org/html/2510.15831)
  - PPD (paper, Jan 2025) also swaps image order and filters out inconsistent judgements — [PPD html](https://arxiv.org/html/2501.06655)

### Inferences
- "Ask Gemini or Claude whether the clip is good" as the main quality gate is not supported by the evidence. Zero-shot it is close to coin-flip on fine quality and physics. VLMs are useful for (a) semantic and on-brief questions phrased as atomic yes/no checks, (b) pairwise comparisons in both orders, (c) explaining failures for a retry prompt.
- VLMs should not check text rendering, counting or precise geometry. OCR, detectors, trackers and pose estimators do this better (see §7).
- A judge also needs **temporal artefact** detection: flicker, morphing hands, identity drift. VLMs sample frames sparsely and were not trained on these anomalies (VBench-2.0), so specialist metrics are needed. These include VBench-style temporal and subject-consistency metrics and face-identity similarity over all frames.

### Gaps
- No 2026 paper measuring Gemini 3.x, GPT-5.x or Claude 4.x-family judges on video against people was reached; search was exhausted. The newest numbers here are from the VideoScore2 paper (Sep 2025).
- Leniency (judges rating everything highly) was not found quantified for video. The MLLM-as-a-Judge length-bias result is for images.
- Qwen-VL-72B judge numbers were not extracted.

---

## 4. Human preference arenas (Artificial Analysis Video Arena, LMArena video, makers' internal GSB tests)

### Takeaway
Arenas rank **models** for an average crowd. The leading 2026 text-to-video models sit within ~40 Elo of each other, about a **56% head-to-head preference**, with overlapping confidence intervals. They say little about one person's taste or one brief. Makers' internal "GSB" (good/same/bad) tests use expert raters but publish results mainly as charts without rater counts.

### Cited Findings
- **Artificial Analysis Video Arena** (leaderboard, read 2026-10-15; no data date shown, models released up to Sep 2026):
  - Board "AA-Video-T2V v2.1". It "ranks video models on generating video with audio from a text prompt, by Elo from pairwise human preference votes". The FAQ adds: "blind comparisons judged by our validated private evaluators".
  - Top 10, Elo ± 95% CI (samples): Wan 3.0 1174±15 (5,850); Utopai X 1169±16 (5,269); Dreamina Seedance 2.5 1160±15 (5,924); MiniMax H3 768p 1159±15 (5,946); MiniMax H3 Max 1155±16 (5,599); FLUX 3 1147±16 (5,027); Dreamina Seedance 2.0 1136±16 (4,972); Gemini Omni Flash 1.1 1132±15 (6,285); Agnes-Video-2.5 1069±17 (3,736); Grok Imagine Video 1.5 1061±17 (3,729). Ranks are shown as ranges because of overlap.
  - [AA T2V leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video)
  - The arena itself: users enter a prompt, pick one of two videos, and the model names are revealed after the vote. Modes are text-to-video, image-to-video and video editing, with audio on or off — [AA arena](https://artificialanalysis.ai/text-to-video/arena)
  - The methodology page URL I tried returned 404, so details were not read.
- **GenAI-Arena** (paper, Jun 2024):
  - Anonymous pairwise votes with four options (left, right, tie, both bad).
  - The leaderboard uses a Bradley-Terry fit, not online Elo, because Elo is order-sensitive and unstable at this vote volume. Ties are split half and half.
  - 2,024 text-to-video votes; "over 9000" votes across tasks.
  - [GenAI-Arena html](https://arxiv.org/html/2406.04485)
- **LMArena** (now arena.ai): the text-to-video leaderboard redirected to arena.ai and returned **403**, so it was not read — [arena.ai](https://arena.ai/leaderboard/text-to-video)
- **Seedance 1.0 internal GSB** (paper, Jun 2025):
  - GSB = pairwise "Good/Same/Bad" relative quality.
  - SeedVideoBench-1.0 has 300 prompts each for text-to-video and image-to-video, scored by experts "with film directors". Rater count not stated.
  - Dimensions: motion quality, prompt following, aesthetic quality, preservation (image-to-video only), on a 5-point Likert scale.
  - GSB numbers appear only in Figs. 10–13. Text findings: Kling 2.1 has strong motion but weaker prompt following; Veo 3 is realistic but weaker in motion and loses the reference image in image-to-video.
  - [Seedance 1.0 html](https://arxiv.org/html/2506.09113)
- Kling's own GSB figures: no primary source was reached (search exhausted).

### Inferences
- Elo gap → win probability, by the standard Elo formula (my calculation): rank 1 vs rank 8 differs by 42 Elo, so P(win) = 1 / (1 + 10^(−42/400)) ≈ 0.56. Among the top 8 models, crowd preference is close to a toss-up. Choosing a generator therefore matters less to "the person likes it" than choosing and checking the shot.
- An arena measures preference across many people with no brief or brand. Das Production's question is preference of one person or brand, conditioned on a brief, which no public arena measures.
- An internal GSB is the right **shape** for the client's own evaluation: pairwise tests on fixed prompt sets from their own briefs, with named expert raters. Its results are only as reliable as the rater count and agreement, which makers rarely publish.

### Gaps
- LMArena video methodology and current standings (403).
- Kling, Veo and Runway internal GSB methods (not reached).
- Artificial Analysis does not say how its "validated private evaluators" are recruited or validated, or where they are (no India or UK breakdown).

---

## 5. Brand and ad-creative scoring in industry (CreativeX, Vidmob, Alison.ai, Neurons, BrandGuard, Frontify, Adobe GenStudio, Google/Meta)

### Takeaway
Industry "creative scoring" is mostly **rule checklists** (brand shown early, logo, supers, aspect ratio, sound on, pacing) detected by vision models and scored against guidelines, plus vendor-reported outcome lifts. **No vendor page read gives an accuracy figure for its detectors, a correlation, a sample size or a control group.** The most transparent tool is Google's open-source ABCD Detector, which warns of hallucinations and publishes no validation.

### Cited Findings
- **CreativeX** (shipped product page):
  - Criteria: Aspect Ratio, Brand Early, Safe Zones, Sound On, Supers Present, Video Length, Brand Audio Mention, CTA Platform Button Close-Up, Pacing, Thumbnail Branding, Close Up "and more custom guidelines". These are condensed into one Creative Quality Score (CQS), checked before launch ("pre-flight") and during the campaign ("in-flight").
  - Method (AI, rules or people) and weighting are not disclosed.
  - [Creative Quality](https://www.creativex.com/products/creative-quality)
  - Outcome claims (vendor marketing, client-reported, no method): Nestlé "+74% ROAS" for high-CQS ads on Meta; Bayer "107% avg. increase in brand lift" on YouTube; Mars "+33% Sales Lift ROI" on TikTok "as measured by NCSolutions" — [CreativeX home](https://www.creativex.com/)
- **Vidmob** (vendor marketing): "40 proprietary AI models", "3 trillion creative elements tied to performance", "18M assets analyzed from 300,000+ ad accounts", "2X increase in CTR and VTR". No method or baseline is given — [Vidmob](https://vidmob.com/). The Creative Scoring page checks brand guidelines and platform best practices and gives "a quality score". No method, no validity data — [Vidmob Creative Scoring](https://vidmob.com/creative-scoring)
- **Alison.ai** (vendor marketing): "Preflight Plus" scores each creative against platform rules plus the advertiser's own account data and returns "one number, before you spend a cent". "Creative Genome maps video elements". Claims of "3X Creative ROAS" and one client's +31% ROAS, with no method and no accuracy — [Alison.ai](https://www.alison.ai/)
- **Neurons** (vendor marketing): predicts attention heatmaps, focus, cognitive demand and areas of interest (logo, product). Claims "+95% predictive precision, compared to research" without defining it. Trained on a "consumer neuroscience database (300,000+ people)". Video is mentioned only as "time on an element vs. its exposure time" — [Neurons](https://www.neuronsinc.com/predict)
- **BrandGuard** (beta / early access):
  - Learns a brand from a style guide plus "20-50 approved assets and 20-50 assets that were not approved".
  - Outputs overall, On-Brand and Safety percentage scores.
  - **Video is listed as "coming soon"**, the Chrome plugin is "in beta", and parts of the page are still lorem ipsum. No accuracy figures.
  - [BrandGuard](https://www.brandguard.ai/)
- **Frontify** (shipped product page): no AI compliance checker for images or video is described. It offers guidelines next to assets, auto-tagging, a "Brand Assistant", and brand knowledge exposed to other AI tools through MCP and API — [Frontify](https://www.frontify.com/en/)
- **Adobe GenStudio for Performance Marketing** (shipped product docs): brand "validation" keeps content "consistent with your brand identity and accessibility concerns". What it checks and any score were not described on the page read. The linked "Brand validation" article URL I tried returned 404 — [GenStudio brands](https://experienceleague.adobe.com/en/docs/genstudio-for-performance-marketing/user-guide/guidelines/brands)
- **Google ABCD Detector** (open-source tool; "NOT an official Google product"):
  - Checks video ads against YouTube's ABCD rubric, 24 variants: quick pacing (and in the first 5 s), dynamic start, early speech, brand visuals, brand mention in speech, product visuals and mentions, supers, visible face close-up and in the first 5 s, presence of people, call to action in text and speech.
  - Pipeline: Video Intelligence API annotations (labels, faces, text, objects, logos, speech, shots), then Gemini 1.5 Pro answers a question per rule. Users can set their own scoring logic.
  - Warning: "Since the LLM approach is prone to hallucinations, False Positives or False Negatives will be expected"; human QA is needed for 100% accuracy. A consensus approach is on the roadmap.
  - Limits: 10–15 videos per run, MP4 ≤ 50 MB. **Apache-2.0** (Google Cloud API costs apply).
  - [abcds-detector](https://github.com/google-marketing-solutions/abcds-detector)
- **Pencil** (shipped product page): orchestrates models from OpenAI, Google (Veo via "Pencil Pro"), Adobe, Runway and Stability. "Enforce brand standards"; "Your data never trains our models". No performance-prediction claims. L'Oréal "33% cut-down in costs producing 46K AI assets" — [Pencil](https://www.trypencil.com/)
- **Typeface** (shipped product page): "Arc Graph" holds "brand guidelines, audiences, assets, and campaign learnings"; brand-safe models. No video, no learning from approvals described, no numbers — [Typeface](https://www.typeface.ai/)

### Inferences
- Industry scoring maps closely onto the client's "pass marks written beforehand" idea: brand early, logo present, safe zones, duration, supers. Each item is a detectable, binary rule. The client could implement most ABCD-style rules with detectors and OCR rather than buying a score.
- The outcome lifts (+74% ROAS and similar) are **correlational, vendor-selected case studies**. They show that ads following basic rules do better on average. They are not evidence that a score predicts whether a particular person will like a particular film.
- None of these products checks a clip against a **shot plan or 3D layout**. They check against brand and platform rules.

### Gaps
- Google Ads / YouTube and Meta first-party creative scoring documents were not reached. No primary validation study for any vendor was found, and search was exhausted.
- Adobe GenStudio's brand-validation method and video support (404 on the guessed URL).
- Pricing and India availability for CreativeX, Vidmob, Alison.ai and Neurons were not checked.

---

## 6. Self-checking and self-correcting video agents (generate → critique → regenerate)

### Takeaway
The leading published loop is Google's **VISTA** (Oct 2025), built on Veo 3 and Gemini 2.5 Flash. It improves results, but at about **28 generated videos and ~0.7M judge tokens per iteration over 5 iterations**, so roughly 140 videos per prompt. Its main win rates come from an MLLM judge; one human test (5 annotators, 50 prompts) gave **66.4%** preference. **VideoRepair** fixes only the misaligned regions, for +3–9% relative alignment at 9–21× the base latency. Both loops are judged by a VLM, which carries the judge weaknesses in §3 into the loop.

### Cited Findings
- **VISTA** (paper, Oct 2025, Google):
  - Models: Veo 3 (veo-3.0-generate-preview) and Gemini 2.5 Flash (gemini-2.5-flash-preview-05-20).
  - Loop: the prompt is split into a temporal plan. Each iteration samples 5 prompts × 3 variants × 2 videos = 30 videos. A pairwise tournament picks the best. Visual, audio and context critic agents review it, and a reasoning agent rewrites the prompt. 5 iterations in total (1 initial + 4 improvements).
  - Judging: MLLM judge, both orders; a clip wins if it is better on ≥ 3 of 10 criteria and does not lose on text-video alignment; conflicting orders count as ties.
  - Results vs direct prompting at iteration 5: single-scene 45.9% win / 50.2% tie / 13.9% loss; multi-scene 46.3% / 42.5% / 11.2%. Against all baselines, 27.8–60.0% (single-scene) and 18.5–53.2% (multi-scene).
  - Human test: 5 annotators, 50 prompts, 66.4% vs 33.6% for the best baseline.
  - Cost: "about 0.7M tokens and 28 videos consumed per iteration", excluding generation tokens; no dollar figure.
  - Authors' limits: relying on MLLMs "may introduce systematic biases"; default metrics "may not generalize across cultures, creative styles, or user preferences".
  - [VISTA html](https://arxiv.org/html/2510.15831), [abs](https://arxiv.org/abs/2510.15831)
- **VideoRepair** (paper, Nov 2024, revised later):
  - Method: no training. An MLLM generates questions about the prompt and finds misaligned entities. Correct regions are kept and segmented (MolmoE-1B pointing + Semantic-SAM), and only the bad regions are regenerated.
  - Evaluator: GPT-4o (questions written by GPT-4-0125). Swapping in Qwen2.5-VL-7B or Gemini-2.5-Flash changed scores little.
  - EvalCrafter alignment (base → repaired): VideoCrafter2 45.97→48.83 (+6.22%); T2V-turbo 43.94→47.30 (+7.65%); CogVideoX-5B 45.01→46.41 (+3.11%); Wan2.1-1.3B 44.83→49.01 (+9.32%).
  - T2V-CompBench average: 0.4977→0.5383, 0.5004→0.5439, 0.4479→0.5190, 0.5358→0.5646.
  - Latency: base T2V-turbo 3.55 s/video; VideoRepair 32.78 s (k=1), 52.5 s (k=5, 6 LLM/MLLM calls + 4 external model calls), 76.01 s (k=5, DSG ranking). Two RTX 6000 GPUs. Compared methods: OPT2I 288.3 s with 61 LLM calls; SLD 545.2 s.
  - [VideoRepair html](https://arxiv.org/html/2411.15115v3), [abs](https://arxiv.org/abs/2411.15115). Code licence file not found (404) → unclear.
- Reward-guided best-of-N: VideoScore2 is positioned for best-of-N sampling as a reward model — [VideoScore2](https://arxiv.org/html/2509.22799v1). Seedance uses its internal reward models in RLHF at training time, not as a runtime checker — [Seedance 1.0](https://arxiv.org/html/2506.09113)

### Inferences
- These loops scale generation, so cost grows quickly. VISTA spends roughly 140 Veo 3 generations per prompt. The client's design puts a cheap human-approved preview **before** generation spend and runs deterministic checks after. That avoids most of this cost and is the more economical design. The cost of a Veo 3 generation needs checking against current Google pricing; I did not read it.
- In VISTA, half or more of the comparisons at iteration 5 are ties. The judge often cannot tell iterations apart, so many retries buy little.
- A self-correction loop is only as good as its judge. With zero-shot VLM judges at ~26–48% exact agreement (§3), a retry loop can "fix" things people do not mind and miss things they do. Retry triggers built on measured skeleton deviations (§7) are better grounded.

### Gaps
- No dollar cost for any agent loop was published.
- VISTA's code and licence availability was not checked.
- Commercial agent products (e.g. Runway, Luma, Higgsfield, LTX "agents") and their self-check claims were not reached (search exhausted).
- No independent replication of VISTA's human result was found.

---

## 7. Checking generated output against an explicit plan (shot list, storyboard, layout, camera path, product geometry, text, logo, identity) with pass marks set in advance

### Takeaway
Measuring a generated clip against an **explicit target** is common in research **as a benchmark metric**:
- camera-pose error against a given trajectory;
- face-identity similarity against a reference;
- detector-based spatial and counting checks against a prompt;
- question-answer checks against a decomposed prompt;
- LLM-written layout plans.

It is **rare as a production gate with thresholds set before generation.** I found no paper or product that checks clips against a 3D skeleton with pre-registered pass marks. The client's approach looks ahead of published practice, but the measuring tools exist and have known error floors.

### Cited Findings
- **Camera path: CameraCtrl** (paper, Apr 2024):
  - Generated camera poses are estimated with COLMAP. RotErr = Σ arccos((tr(R_gen·R_gtᵀ) − 1)/2); TransErr = Σ ‖t_gen − t_gt‖².
  - Results on RealEstate10K: CameraCtrl image-to-video TransErr 9.02 / RotErr 1.18 vs MotionCtrl 10.21 / 1.41; text-to-video 12.98 / 1.29 vs 14.02 / 1.58.
  - **Measurement floor:** COLMAP on real 16-frame clips already gives TransErr 6.93 and RotErr 1.02.
  - Limits: COLMAP "can not extract precise camera poses in short videos" stably, so failed clips were **removed by hand**. Scale ambiguity is handled by rescaling with the first two frames.
  - [CameraCtrl html](https://arxiv.org/html/2404.02101)
- **Identity: ConsisID** (paper, Nov 2024):
  - FaceSim-Arc (ArcFace) and FaceSim-Cur (CurricularFace): ConsisID 0.58 / 0.60 vs ID-Animator 0.32 / 0.33. CLIPScore 27.93 vs 24.97.
  - FID is worse for ConsisID (151.82 vs 117.46). The authors call FID "presented solely as a reference due to its limited alignment" with people.
  - [ConsisID html](https://arxiv.org/html/2411.17440v3)
- **Layout and counting: T2V-CompBench** (paper, Jul 2024): detection-based spatial (G-DINO) ρ 0.7057, counting ρ 0.5378; tracking-based motion (DOT) ρ 0.5366 against human ratings — [T2V-CompBench](https://arxiv.org/html/2407.14505)
- **LLM-written plan → generation: VideoDirectorGPT** (abstract only, Sep 2023): GPT-4 writes a "video plan" of scene descriptions, entities with layouts, backgrounds and consistency groups. Layout2Vid follows it and improves "layout and movement control"; no numbers read — [VideoDirectorGPT](https://arxiv.org/abs/2309.15091)
- **Prompt decomposed into atomic checks: DSG** (paper, Oct 2023, image):
  - Questions match human judgement: precision 92.2%, recall 100% (manual, 30 prompts).
  - VQA answers match people 73.8% overall but only **13.7% on text rendering**.
  - Score vs human Likert ρ 0.571.
  - [DSG html](https://arxiv.org/html/2310.18235)
- **VQAScore** (abstract only, Apr 2024): asks a VQA model whether the image shows the prompt and uses the probability of "Yes". It "can also align text with video", but no video numbers were in the abstract — [VQAScore](https://arxiv.org/abs/2404.01291)
- **Plan-first agents:** VISTA splits a prompt into a structured temporal plan, but checks the result with MLLM critics, not with measured geometry — [VISTA](https://arxiv.org/html/2510.15831). VideoRepair checks against auto-generated questions about the prompt — [VideoRepair](https://arxiv.org/html/2411.15115v3)
- **Rule checklist with detectors, in industry:** ABCD Detector uses Video Intelligence API logo, text and face detection plus Gemini questions, with user-defined scoring logic — [abcds-detector](https://github.com/google-marketing-solutions/abcds-detector). CreativeX checks binary rules such as "Brand Early" and "Safe Zones" — [CreativeX](https://www.creativex.com/products/creative-quality)
- **Physical ground truth:** Physics-IQ compares generated continuations with real filmed continuations using spatial and spatiotemporal IoU. Real-vs-real variance sets the ceiling (score 100), which gives a reference for how much error is noise — [Physics-IQ](https://arxiv.org/html/2501.09038v3)

### Inferences
- The client's checker is in line with the strongest evidence. Narrow, measurable properties checked with specialist tools agree better with people than holistic VLM judgements: detector ρ 0.71 vs VLM −0.15 on spatial relationships.
- Two cautions from the literature:
  1. **Set pass marks above the measurement floor.** Measure the checker's own noise on real or rendered "perfect" clips first, as CameraCtrl did with COLMAP (TransErr 6.93) and Physics-IQ did with physical variance.
  2. **Count checker failures.** Pose estimators fail on short clips; CameraCtrl dropped failures by hand. A checker failure should read "cannot measure", never "pass".
- Text and logos should be checked with OCR and logo detection, not VLM questions (13.7% VQA accuracy on text in DSG). Character identity can use ArcFace-style similarity on every frame. Typical published values (0.3–0.6) are model-to-model comparisons, not human-validated pass marks, so the client must calibrate its own threshold with people.
- "Is this approach common?" As offline evaluation, yes. As pre-registered thresholds in a generation loop, I found no example, but that finding is weak because search was cut short.

### Gaps
- OCR and text-rendering benchmarks specific to video, logo-fidelity metrics for generated video, and product-geometry (CAD-to-video) checks were not reached (search exhausted).
- No study measuring human agreement with FaceSim thresholds ("at what ArcFace similarity do people say it's the same person?") was found.
- VideoDirectorGPT's layout metrics were not read beyond the abstract.

---

## 8. Learning a person's or brand's taste over time (products and research)

### Takeaway
Research shows **few-shot personal taste is learnable for still images**:
- ViPer: users pick their own personalised image first 86.1% of the time when it sits among 7 non-personalised ones (12.5% chance), with 20 users. Against other users' personalised images it falls to 65.4%.
- PPD: 76–81% win rate from 4 examples, but **judged by GPT-4o**, which agrees with real labels 83% of the time.

I found **no published, human-validated study of personal-taste learning for video**. Products offer style and brand references and reward-from-approvals features, but publish no accuracy numbers on the pages I could read.

### Cited Findings
- **ViPer** (paper, Jul 2024, images):
  - Users comment on 8–20 images, explaining what they like and dislike; an LLM turns the comments into liked and disliked attributes that guide SDXL.
  - User study: 20 users, 12–15 prompts each.
  - Personalised vs not: users' top-1 86.1%, proxy 86.7%, chance 12.5%.
  - Own vs other users' personalisation: users 65.4%, proxy 71.6%.
  - Proxy accuracy on 1,000 automated agents: 89.1% (not human).
  - [ViPer html](https://arxiv.org/html/2407.17365v1), [abs](https://arxiv.org/abs/2407.17365)
- **PPD, Personalized Preference fine-tuning of Diffusion** (paper, Jan 2025, images):
  - A VLM extracts a preference embedding from a user's few pairwise choices, then DPO conditioned on that embedding.
  - Abstract: "as few as four preference examples" → 76% average win rate over Stable Cascade.
  - Body: 83% on seen users, 78% on unseen, 81% overall; the 76% and 81% are not reconciled.
  - **Judged by GPT-4o** (GPT-4o-mini in an appendix) conditioned on the user's examples. That judge matches real Pick-a-Pic personal labels with **83% accuracy**. **No real-human evaluation.**
  - Users come from Pick-a-Pic v2: 192 held-out and 277 in-distribution.
  - [PPD html](https://arxiv.org/html/2501.06655), [abs](https://arxiv.org/abs/2501.06655)
- **How much people disagree** (papers, images):
  - ImageReward: a researcher agrees with an individual annotator only 65.3% (±8.5) of the time, 73.4% with a majority vote — [ImageReward](https://arxiv.org/html/2304.05977)
  - Pick-a-Pic: expert humans predict a user's choice 68.0% of the time; PickScore 70.5% — [Pick-a-Pic](https://arxiv.org/html/2305.01569v2)
  - VideoPhy: video annotators agree 75% on semantic adherence and 70% on physics — [VideoPhy](https://arxiv.org/html/2406.03520)
- **VISTA** authors on taste: default judge metrics "may not generalize across cultures, creative styles, or user preferences" — [VISTA](https://arxiv.org/html/2510.15831)
- **Products:**
  - BrandGuard (beta): trains a brand model from 20–50 approved plus 20–50 rejected assets and a style guide; video "coming soon"; no accuracy given — [BrandGuard](https://www.brandguard.ai/)
  - Runway Gen-4 (shipped; page undated, © 2026): consistent characters "with a single reference image", and keeps "style, mood and cinematographic elements… without the need for fine-tuning". **Demos only, no measurements** — [Runway Gen-4](https://runway.com/research/introducing-runway-gen-4)
  - Typeface: "campaign learnings" stored in Arc Graph; learning from approvals not described — [Typeface](https://www.typeface.ai/)
  - Pencil: "Your data never trains our models", so it does not learn taste from customer data by training — [Pencil](https://www.trypencil.com/)
  - Frontify: Brand Assistant and brand knowledge over MCP and API; no taste learning described — [Frontify](https://www.frontify.com/en/)
  - Midjourney personalisation and moodboards: docs returned **403** (both URLs tried); the updates page listed only Oct 2026 post titles, e.g. "Testing Thinking Mode" (Oct 8) — [Midjourney updates](https://updates.midjourney.com/). Mechanism and numbers **not read; needs checking**.
  - Adobe Firefly custom models: help page **403**; not read — [Firefly custom models](https://helpx.adobe.com/firefly/web/custom-models/overview.html)
  - Canva Brand Kit: help page **403**; not read — [Canva Brand Kit](https://www.canva.com/help/brand-kit/)
  - Krea and Leonardo custom models: not reached (search exhausted).

### Inferences
- How well a system can predict one person's taste is bounded by how consistent that person is. Generic human-to-human agreement is 65–75%, and a single annotator agrees with a reference about 65% of the time. Personal models raise this in narrow tests (ViPer 86% top-1 against generic outputs), but less so when telling apart two outputs that are both already "good" (65.4% against other people's personalisations). Between two strong finalists, even a personal model may be near chance.
- The cheapest reliable signal in the client's workflow is the **preview approval** itself. Each approve, reject or edit is a labelled pairwise preference about this person's taste, which is exactly what PPD and BrandGuard-style learning need: tens of labelled examples. Logging decisions with reasons, as ViPer's comments do, gives text attributes a planner can reuse without retraining.
- Product claims about learning brand taste are unvalidated in public material. Treat them as features (references, style codes, brand kits), not as measured taste prediction.

### Gaps
- No video-specific personal-preference study with real users was found.
- No study of **learning from edits** (as opposed to ratings) for video was reached.
- Midjourney, Firefly, Canva, Krea and Leonardo personalisation details and numbers were blocked or not reached and need checking.
- No India- or UK-specific taste data was found.

---

## 9. Bottom line: how close is "the system knows whether the person will like it"?

### Takeaway
Not close for open-ended taste. Close enough to be useful for **measurable, pre-specified properties**.

- **Generic preference:** the best video reward models agree with people **~72–74%** of the time on pairwise choices in-domain (without ties). Humans agree with each other ~65–75%. Out of domain, models drop to **~50–60%**.
- **Absolute scores:** the best trained scorer matches a person's 1–5 exactly **44%** of the time (within one point 91%). Frontier VLMs zero-shot match **26–29%** exactly (within one point 68–72%) and **~48%** on a 4-way video vote (25% chance).
- **Physics:** judges score ROC-AUC 53–82. Humans agree with each other ~70%.
- **Personal taste:** up to ~86% top-1 in a 20-person **image** study against generic outputs, and ~65% between personalised options. **No validated video number exists.**
- **Plan adherence** (camera, identity, layout, counting, text by OCR): measurable with specialist tools that correlate better with people than VLMs do (e.g. ρ 0.71 for detector-based spatial checks). Their error floors are known and must be set before the pass marks.

### Cited Findings
- Pairwise ceiling and reward models: VideoReward 73.59% / 72.89% without ties; VideoScore 50.22% on VideoGen-RB — [VideoAlign](https://arxiv.org/html/2501.13918v2). Human agreement 65.3% individual, 73.4% majority — [ImageReward](https://arxiv.org/html/2304.05977). Experts 68.0% vs PickScore 70.5% — [Pick-a-Pic](https://arxiv.org/html/2305.01569v2)
- Absolute scoring: VideoScore2 44.35% exact / 90.78% within ±1; GPT-5 26.24 / 69.01; Gemini-2.5-Pro 27.90 / 67.94; Claude-Sonnet-4 28.93 / 71.74 — [VideoScore2](https://arxiv.org/html/2509.22799v1)
- Zero-shot vote: GPT-4o 48.46%, Gemini-1.5-Pro 46.21%, random 25.16% — [GenAI-Arena](https://arxiv.org/html/2406.04485)
- Physics: GPT-4V 53/53, Gemini-1.5-Pro 73/58, VideoCon-Physics 82/73 ROC-AUC; humans 75% / 70% — [VideoPhy](https://arxiv.org/html/2406.03520). Best generator scores 29.5 of 100 on Physics-IQ — [Physics-IQ](https://arxiv.org/html/2501.09038v3)
- Personal taste: ViPer 86.1% / 65.4% (20 users) — [ViPer](https://arxiv.org/html/2407.17365v1). PPD 76–81% judged by GPT-4o, which agrees with labels 83% — [PPD](https://arxiv.org/html/2501.06655)
- Self-correction: VISTA 66.4% human preference (5 annotators, 50 prompts) at ~28 videos and ~0.7M tokens per iteration × 5 iterations — [VISTA](https://arxiv.org/html/2510.15831). VideoRepair +3–9% relative alignment at 9–21× latency — [VideoRepair](https://arxiv.org/html/2411.15115v3)
- Plan checking: G-DINO spatial ρ 0.7057; DOT motion 0.5366 — [T2V-CompBench](https://arxiv.org/html/2407.14505). COLMAP error floor TransErr 6.93 / RotErr 1.02 on real clips — [CameraCtrl](https://arxiv.org/html/2404.02101). VQA text-rendering accuracy 13.7% — [DSG](https://arxiv.org/html/2310.18235)
- Industry brand scores: rule checklists; outcome lifts are vendor case studies without method; the ABCD Detector warns of false positives and negatives — [CreativeX](https://www.creativex.com/), [abcds-detector](https://github.com/google-marketing-solutions/abcds-detector)
- Crowd preference between top 2026 models: 42 Elo separates rank 1 (1174) from rank 8 (1132) — [AA leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video). That is ≈ 56% expected preference by the Elo formula (my calculation).

### Inferences
- An honest framing of promise 4, "the person likes the result", given this evidence:
  1. "It meets the plan" can be **measured**, with known error, using skeleton checks.
  2. "It has no obvious defects" can be **estimated**: trained scorers rank reasonably, while VLMs and physics checks are weak.
  3. "This person will like it" can only be **predicted at about 65–75% on a pairwise choice** with generic models, and somewhat better with that person's own labelled history. That gain is unproven for video.
- The human preview gate is not a stopgap. On this evidence it is the most reliable "taste judge" available. The agent should treat the person's approvals as ground truth and its own taste scores as a ranker for what to show them.
- Licence-clean building blocks as of 2026-10-15 (subject to reading the full licence texts):
  - VideoScore2 (Apache-2.0; Qwen2.5-VL base Apache-2.0)
  - VideoReward (MIT code, Apache-2.0 weights, Qwen2-VL-2B base Apache-2.0)
  - LAION aesthetic predictor (Apache-2.0)
  - HPSv2 (Apache-2.0)
  - ImageReward (Apache-2.0)
  - Physics-IQ (Apache-2.0 / CC-BY-4.0)
  - ABCD Detector (Apache-2.0, with paid Google APIs)
  - Not allowed or unclear: DOVER and Q-Align (S-Lab non-commercial vs HF MIT conflict), PickScore weights (no licence), VisionReward (CogVLM commercial registration), EvalCrafter, T2V-CompBench and VideoRepair code (no licence file found), UnifiedReward (training-data licences unclear).

### Gaps
- No study measures any judge's agreement with **one specific person's** taste on **video** over time.
- None of the scorers was validated on 2026 generators or on Indian or UK audiences.
- Costs need checking and were not read: Veo 3 per-second pricing and Gemini 2.5 Flash token pricing, which would turn VISTA's 28 videos and 0.7M tokens per iteration into money.
- Search was exhausted early in this session. Rerunning this brief with search available should target:
  - LMArena video methodology
  - Kling GSB
  - Midjourney, Firefly and Krea personalisation docs
  - Meta and Google first-party creative scoring
  - 2026 VLM-judge-on-video papers
  - video OCR and logo-fidelity metrics
