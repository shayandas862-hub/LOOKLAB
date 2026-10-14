# Face scans to a personalised digital character: law, platform rules and safeguards (EU, UK, US, India; as of October 2026)

Research notes, not legal advice. Every source was read on **2026-10-14**. A citation marked **[snippet]** was seen only as a search-engine summary of that page, not opened in full; treat it as weaker and confirm against the page. Law-firm briefings are secondary sources. "Lawyer to confirm" marks points where a qualified lawyer must sign off before a design decision rests on them.

## 1. EU GDPR: when face data is biometric or special-category data, consent, DPIA, EDPB guidance, transfers to US model providers

### Takeaway
A selfie is not automatically biometric data. It becomes biometric data once "specific technical processing" turns it into something that allows or confirms unique identification, such as a face embedding or template. It is special-category data (Art. 9) only when processed "for the purpose of uniquely identifying" a person. The moment the app verifies that a scan is the user's own face (liveness plus a 1:1 match), it is doing exactly that. So design for Art. 9: explicit consent, a DPIA, and an alternative for people who refuse. Transfers to US providers can rely on the EU–US Data Privacy Framework (DPF), but its legality is under appeal at the CJEU (case C-703/25 P).

### Cited Findings
- **Art. 4(14) definition (verbatim):** "'biometric data' means personal data resulting from specific technical processing relating to the physical, physiological or behavioural characteristics of a natural person, which allow or confirm the unique identification of that natural person, such as facial images or dactyloscopic data" — [GDPR Art. 4, gdpr-info.eu](https://gdpr-info.eu/art-4-gdpr/)
- **Recital 51 (verbatim):** "The processing of photographs should not systematically be considered to be processing of special categories of personal data as they are covered by the definition of biometric data only when processed through a specific technical means allowing the unique identification or authentication of a natural person." — [GDPR Recital 51, gdpr-info.eu](https://gdpr-info.eu/recitals/no-51/)
- **Art. 9(1) (verbatim):** "Processing of personal data revealing racial or ethnic origin, … biometric data for the purpose of uniquely identifying a natural person, data concerning health … shall be prohibited." — [GDPR Art. 9, gdpr-info.eu](https://gdpr-info.eu/art-9-gdpr/)
- **Art. 9(2)(a) (verbatim):** "the data subject has given explicit consent to the processing of those personal data for one or more specified purposes, except where Union or Member State law provide that the prohibition referred to in paragraph 1 may not be lifted by the data subject" — [GDPR Art. 9](https://gdpr-info.eu/art-9-gdpr/)
- **Art. 9(4) (verbatim):** "Member States may maintain or introduce further conditions, including limitations, with regard to the processing of genetic data, biometric data or data concerning health." National add-ons can therefore exist in each EU state. — [GDPR Art. 9](https://gdpr-info.eu/art-9-gdpr/)
- **EDPB Guidelines 3/2019 (video devices):** the final version is 2.0, adopted 29 Jan 2020. A secondary summary says that to count as biometric data, processing of raw physical characteristics "must imply a measurement of this characteristics", and "the video footage of an individual cannot however in itself be considered as biometric data". Art. 9 turns on the purpose of unique identification. — [EDPB Guidelines 3/2019 PDF](https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en.pdf) [snippet]; [Eurosmart summary](https://www.eurosmart.com/?id=87&na=v) [snippet]
- **EDPB Guidelines 05/2022 (facial recognition):** version 2.0 adopted 26 Apr 2023, framed for law enforcement. They state that facial recognition "is built on the processing of biometric data, therefore, it encompasses the processing of special categories of personal data". Commentary reports the EDPB's view that both authentication (1:1) and identification (1:N) process biometric data, a shift from the Spanish DPA's earlier view that 1:1 was not special category. — [Stibbe](https://www.stibbe.com/publications-and-insights/digital-law-uptodate-edpb-guidelines-on-facial-recognition-in-the-area-of) [snippet]; [Taylor Wessing on AEPD](https://www.taylorwessing.com/de/global-data-hub/2023/november---facial-recognition-technology-biometrics-and-monitoring/spanish-supervisory-authoritys-approach-to-biometrics) [snippet]
- **EU–US DPF status:**
  - The General Court dismissed Latombe's annulment action on 3 Sep 2025 (T-553/23).
  - Latombe appealed on 31 Oct 2025 (C-703/25 P), and the appeal was pending as of June 2026, when Microsoft intervened in support of the Commission.
  - No Advocate General opinion or judgment had been found. Companies can keep using the DPF, SCCs and BCRs while the appeal is pending.
  - Sources: [WilmerHale (1 Dec 2025)](https://www.wilmerhale.com/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework) [snippet]; [Streamlex DPF tracker](https://streamlex.eu/resources/dpf-developments-tracker/) [snippet]; [IEU Monitoring, 28 Jun 2026](https://ieu-monitoring.com/editorial/microsoft-backs-eu-commission-in-eu-court-case-on-transatlantic-data-flows-and-privacy/1244467/) [snippet]
- **AI Act Omnibus and GDPR-adjacent data (for context):** Reg. (EU) 2026/1744 adds an Art. 4a. It lets providers, and in some cases deployers, process special-category data "exceptionally" where strictly necessary for bias detection. Safeguards include deletion once the bias is corrected, and the article creates no obligation to do bias detection. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)

### Inferences
- **Selfie upload, no embedding extracted:** a photo used purely as an image-to-image or video reference may stay ordinary personal data. Even then, face images can reveal racial or ethnic origin (the ICO makes this point, see §2), so treat them as sensitive anyway.
- **Face embedding for identity consistency** (e.g., ArcFace-style identity vectors or adapters, a per-user LoRA): this is "specific technical processing" producing data that "allow[s] … unique identification". It is very likely biometric data under Art. 4(14).
  - Whether it is Art. 9 data turns on purpose. "We only use it to keep the character looking like you" is an arguable non-identification purpose.
  - The argument is weak and contested, given the EDPB's 1:1 view. Lawyer to confirm.
- **"Only-your-own-face" verification** (selfie vs liveness capture, 1:1 match) is biometric verification. That is processing for the purpose of unique identification, so Art. 9 applies and explicit consent is the realistic condition. The safeguard itself triggers special category, so the privacy-first design is to treat the whole pipeline as Art. 9 from day one.
- **Explicit consent needs:**
  - A separate, specific screen (not bundled into the T&Cs) naming the purposes: build character, verify it is you, send to model provider X, retention period.
  - An affirmative act.
  - Easy withdrawal.
  - A non-biometric alternative where feasible. This is required by the ICO for UK users (§2), and EU DPAs take the same "freely given" line.
- **DPIA:** large-scale processing of special-category data and new technology make an Art. 35 DPIA effectively mandatory. Do it before launch. The Art. 35 text and the national DPIA lists were not re-read in this pass.
- **Transfers to US model APIs:** for EU users, use DPF-certified providers (check the DPF list) and keep SCCs plus a transfer impact assessment as a fallback, in case the CJEU annuls the DPF in C-703/25 P. Sign a DPA (Art. 28) with each provider.

### Gaps
- Not re-read in this pass: EDPB Guidelines 05/2020 on consent (the explicit-consent mechanics), the Art. 35 text, and the EDPB/WP29 DPIA criteria.
- I found no EDPB or DPA statement on whether generative-avatar face embeddings are processed "for the purpose of uniquely identifying". This is the central legal grey zone. Lawyer to confirm.
- I did not verify whether the UK–US Data Bridge (UK extension to the DPF) remains in place as of Oct 2026.
- No CJEU hearing date or AG opinion was found for C-703/25 P.

## 2. UK GDPR, Data Protection Act 2018, the Data (Use and Access) Act 2025, and the ICO's biometric guidance

### Takeaway
UK law mirrors the GDPR test: biometric data is special category only when used to uniquely identify someone. The ICO says explicit consent is "likely to be the most appropriate condition", a DPIA is required before using biometric recognition, people who refuse must get a suitable alternative, and biometric data must be encrypted. The main DUAA 2025 changes have been in force since 5 Feb 2026, including the new "not materially lower" transfer test. The ICO's biometric guidance is "under review" because of the DUAA. Since 6 Feb 2026 it has been a criminal offence to create, or request, a sexually explicit deepfake of an adult without consent.

### Cited Findings
- **ICO, special category depends on purpose (verbatim):**
  - "If you use biometric data for unique identification, it is special category biometric data."
  - "Not all biometric data is automatically special category biometric data. It only becomes this if you use it to uniquely identify someone. Your purpose for processing biometric data is therefore important."
  - Source: [ICO, Key data protection concepts](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/key-data-protection-concepts/)
- **ICO, other special categories (verbatim):** "even if this is not your purpose, the biometric data you process may still be considered another type of special category information. For example, you could use biometric data to infer someone's racial or ethnic origin or consider it as health data." — [ICO, Key concepts](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/key-data-protection-concepts/)
- **ICO, photographs (verbatim):** "While someone's physical characteristics may be shown in a photo, this isn't enough to make that photo biometric data. It's only when something else happens to that photo … that the result becomes biometric data. For example, if specific techniques are applied to the photo to extract someone's facial features, then the photo has been 'processed through a specific technical means'…"
  - The ICO adds that this covers "any information produced by these specific technical processes, regardless of how long it exists for".
  - Source: [ICO, Biometric recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/biometric-recognition/)
- **ICO, verification counts:** "Biometric recognition includes both biometric identification and biometric verification." A worked example (a selfie compared against a driving-licence photo) "involves processing special category biometric data to uniquely identify someone." — [ICO, Biometric recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/biometric-recognition/)
- **ICO, lawful basis and consent (verbatim):**
  - "Explicit consent is likely to be the most appropriate condition available to you to process special category biometric data." "If you can't identify a valid condition, you must not use special category biometric data."
  - Consent must be "specific and informed", which requires you "to clearly set this information apart from other terms and conditions".
  - Consent must be "freely given": "You must give them the opportunity to refuse or easily withdraw their consent at any time without detriment. You must also offer a suitable alternative to people who choose not to consent."
  - Source: [ICO, How do we process biometric data lawfully?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-process-biometric-data-lawfully/)
- **ICO, DPIA (verbatim):** "You must complete a DPIA before you use a biometric recognition system." It is "highly likely" to be triggered, and "even if you don't use special category biometric data, you may assess that your proposal … is still likely to result in high risk". — [ICO, How do we demonstrate compliance?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-demonstrate-our-compliance-with-our-data-protection-obligations/)
- **ICO, security (verbatim):** "You must also appropriately encrypt any biometric data that you use." "'Appropriate' is a higher bar here than for personal information more generally."
  - The ICO recommends template protection per ISO/IEC 24745: irreversibility, unlinkability, revocability and renewability.
  - It also recommends on-device verification, where "no biometric data leaves it – only a token or proof of the verification".
  - Source: [ICO, How do we keep biometric data secure?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/)
- **Guidance status (verbatim):** "Due to changes made by the Data (Use and Access) Act, this guidance is under review and may be subject to change." — [ICO biometric guidance hub](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/)
- **DUAA 2025 commencement:**
  - Royal Assent 19 Jun 2025.
  - The main Part 5 data protection changes came into force on 5 Feb 2026 (SI 2026/82), amending the UK GDPR, the DPA 2018 and PECR.
  - The duty for controllers to handle complaints (s.103, new s.164A DPA 2018) commenced 19 Jun 2026.
  - "Recognised legitimate interests" (Art. 6(1)(ea), Annex 1), which need no balancing test, are in force from 5 Feb 2026.
  - Sources: [gov.uk commencement plan](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement) [snippet]; [legislation.gov.uk SI 2026/82](https://legislation.gov.uk/uksi/2026/82) [snippet]; [Bratby Law](https://bratby.law/data-use-and-access-act-2025-commencement/) [snippet]; [Kennedys 2026](https://www.kennedyslaw.com/en/thought-leadership/article/2026/the-data-use-and-access-act-2025-commencement-dates-and-planned-guidance-for-2026) [snippet; the page returned 403 when opened]
- **DUAA transfers:**
  - The standard moves from "essentially equivalent" to "not materially lower". A transfer risk assessment is now called a "data protection test" (from 5 Feb 2026).
  - Article numbering (45A/45B) differs between sources.
  - The ICO updated its international transfers guidance on 15 Jan 2026.
  - Sources: [Burges Salmon](https://www.burges-salmon.com/?p=15019) [snippet]; [Kennedys](https://kennedyslaw.com/en/thought-leadership/article/2025/the-uk-dua-act-s-reform-pillars-divergence-from-the-eu-gdpr-international-data-transfers) [snippet]; [ICO transfers guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/how-do-we-comply-with-the-transfer-rules-if-were-initiating-the-restricted-transfer) [snippet]
- **Sexually explicit deepfake offence:**
  - DUAA 2025 s.138 inserts offences into the Sexual Offences Act 2003 covering creating, or requesting the creation of, a purported intimate image of an adult without consent. They are in force from 6 Feb 2026, with an unlimited fine.
  - Secondary sources differ on the inserted section number.
  - A separate offence aimed at providers of "nudification" tools was proposed in the Crime and Policing Bill; its status was not confirmed.
  - Sources: [MoJ letter via committees.parliament.uk](https://committees.parliament.uk/publications/51181/documents/284050/default/) [snippet]; [gov.uk press release](https://gov.uk/government/news/better-protection-for-victims-thanks-to-new-law-on-sexually-explicit-deepfakes) [snippet]; [Olliers](https://www.olliers.com/news/new-law-criminalises-deepfake-creation/) [snippet]

### Inferences
- For UK users, follow the ICO's playbook literally:
  - A separate explicit-consent screen.
  - A DPIA before launch.
  - A non-biometric alternative, e.g., let users build a stylised character from a manual avatar editor or text description without a face scan. Otherwise consent is arguably not "freely given".
  - Encryption at rest, and template protection where templates are stored.
- On-device liveness and matching (e.g., Apple Vision or ML Kit on the phone) is the ICO-endorsed way to cut how much biometric data leaves the device. But the generation step still sends face images to a model API, so this reduces exposure rather than removing it.
- "Recognised legitimate interests" do not help here. Art. 9 still needs a separate condition, and explicit consent remains the realistic one.
- The product must block sexual content of real people. In the UK, a user prompting such content is now committing an offence, and the operator faces regulatory risk (Online Safety Act duties were not researched in this pass).

### Gaps
- Not verified in this pass: whether the DUAA changed UK Art. 9 or the biometric definition, and whether a power to add new special categories has been used.
- Not researched: Online Safety Act 2023 duties (Ofcom codes, age assurance) for a UK app that hosts or shares user-generated AI content.
- Not confirmed: the Crime and Policing Bill nudification-tool offence (Royal Assent and commencement).

## 3. EU AI Act: Article 50 deepfake transparency, the marking Code of Practice, the 2026 Omnibus, and relevant prohibited practices

### Takeaway
Article 50 has applied since 2 Aug 2026:
- **Providers of generative systems** must mark outputs in a machine-readable, detectable way (Art. 50(2)). Systems already on the market before 2 Aug 2026 have until 2 Dec 2026 under the Omnibus, Reg. (EU) 2026/1744.
- **Deployers** must disclose deepfakes (Art. 50(4)). For "evidently artistic, creative, satirical, fictional" works this is a lighter, non-intrusive disclosure.
- **Code of Practice:** the final voluntary Code (10 Jun 2026) expects at least two machine-readable marking layers and an EU icon for labelling deepfakes.
- **New prohibition from 2 Dec 2026:** an Art. 5 ban on AI systems that generate non-consensual intimate imagery or CSAM where that output is foreseeable and safeguards are lacking.

### Cited Findings
- **Art. 50(2) (verbatim):** providers of "AI systems, including general-purpose AI systems, generating synthetic audio, image, video or text content" must ensure outputs are "marked in a machine-readable format and detectable as artificially generated or manipulated". Solutions must be "effective, interoperable, robust and reliable as far as this is technically feasible". — [AI Act Art. 50](https://artificialintelligenceact.eu/article/50/)
- **Art. 50(4) (verbatim):**
  - Deployers of a system generating "image, audio or video content constituting a deep fake" must "disclose that the content has been artificially generated or manipulated".
  - For "evidently artistic, creative, satirical, fictional or analogous" work, the duty is limited to disclosing "the existence of such generated or manipulated content in an appropriate manner that does not hamper the display or enjoyment of the work".
  - Source: [AI Act Art. 50](https://artificialintelligenceact.eu/article/50/)
- **Art. 50(5) (verbatim):** information must be given "in a clear and distinguishable manner at the latest at the time of the first interaction or exposure" and "shall conform to the applicable accessibility requirements". — [AI Act Art. 50](https://artificialintelligenceact.eu/article/50/)
- **Art. 3(60) deep fake (verbatim):** "AI-generated or manipulated image, audio or video content that resembles existing persons, objects, places … and would falsely appear to a person to be authentic or truthful". — [AI Act Art. 50 page](https://artificialintelligenceact.eu/article/50/)
- **Application date and Code of Practice:**
  - The final Code of Practice on marking and labelling AI-generated content was published 10 Jun 2026. It is open for signature and its adequacy is being assessed by the Commission and the AI Board.
  - Transparency obligations "take effect on August 2, 2026".
  - The Code requires "at least two layers of machine-readable marking where necessary" (metadata, watermarks or other measures) and labelling "through the use of the publicly available EU icon or equivalent labels".
  - If the Code is assessed positively, "signatories may rely on the Code's measures to demonstrate compliance".
  - Source: [Jones Day, Jun 2026](https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content)
  - Secondary sources disagree on whether signing gives a "presumption of conformity". — [search summary of SCL / Freevacy / Commission page](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content) [snippet]
- **Digital Omnibus on AI:**
  - Political agreement 6 May 2026, confirmed by member states 13 May 2026. — [Gibson Dunn, 27 May 2026](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
  - Published in the OJ on 24 Jul 2026 as Reg. (EU) 2026/1744 (dated 8 Jul 2026); in force three days after publication. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
  - Art. 50(2) marking for generative systems "placed on the market before August 2, 2026" applies from 2 Dec 2026. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
  - Other Art. 50 duties are unaffected. — [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
  - High-risk dates move to 2 Dec 2027 (Annex III) and 2 Aug 2028 (Annex I). — [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
- **New Art. 5 prohibitions:**
  - The Omnibus prohibits AI systems that "generate or manipulate realistic images, videos, or audio of an identifiable person's intimate parts or sexually explicit activity without that person's consent", plus CSAM.
  - For providers this applies where such output is the intended purpose, or is reasonably foreseeable and reproducible without adequate safety measures. For deployers it applies only where they use the system for that purpose.
  - Sources: [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published); [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
  - The consolidated Art. 5 page shows new points (ba) "generates or manipulates realistic images, videos, audio or similar material of an identifiable natural person" and (bb) (CSAM), marked "Comes into force 2 December 2026". — [AI Act Art. 5](https://artificialintelligenceact.eu/article/5/)
- **Existing prohibitions (in force since 2 Feb 2025):**
  - 5(1)(e): "AI systems that create or expand facial recognition databases through the untargeted scraping of facial images from the internet or CCTV footage".
  - 5(1)(f): emotion inference "in the areas of workplace and education institutions" (medical or safety exception).
  - 5(1)(g): "biometric categorisation systems that categorise individually natural persons based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious or philosophical beliefs…"
  - Source: [AI Act Art. 5](https://artificialintelligenceact.eu/article/5/)

### Inferences
- An app that wraps third-party generation APIs and offers the feature under its own name is very likely a "provider" of a generative AI system for Art. 50(2). It should carry machine-readable marks through to the files users download, keeping the model provider's C2PA/SynthID marks and adding our own. It should not rely only on the upstream provider. Lawyer to confirm the provider/deployer split.
- Users who publish their own character videos may be "deployers". As I understand the Art. 3(4) deployer definition, private non-professional use is excluded (definition not re-read in this pass). A visible "AI-generated" label on exports is cheap and covers Art. 50(4), India's IT Rules and China's rules alike.
- Design must avoid:
  - inferring race or ethnicity from the face scan to pick styles (Art. 5(1)(g) risk);
  - emotion inference in any workplace or education deployment;
  - building face databases by scraping.
- The NCII/CSAM ban from 2 Dec 2026 makes nudity and sexual blocks a legal requirement in the EU, not just good practice.

### Gaps
- Not found: whether the Commission/AI Board adequacy assessment of the Code had concluded by Oct 2026, and the Commission's Art. 50 scope guidelines.
- Exact Art. 50(2) Omnibus wording not verified against the OJ text. Sources differ on whether the grace period covers only pre-2-Aug-2026 systems; the Cuatrecasas reading says yes.

## 4. United States: biometric privacy statutes, TAKE IT DOWN, NO FAKES, state digital-replica and right-of-publicity laws

### Takeaway
- **Illinois BIPA is the biggest exposure.** It requires a written public retention policy, notice of purpose and term, and a written release (an e-signature is allowed since 2024). It has a private right of action with $1,000/$5,000 liquidated damages. Since Aug 2024 damages are capped at one recovery per person per method, and the Seventh Circuit applied that retroactively on 1 Apr 2026.
- **Texas CUBI** covers "face geometry": notice and consent, no sale, destruction within one year after the purpose expires, and AG penalties of up to $25,000 per violation.
- **Washington:** RCW 19.375 excludes photographs, but the My Health My Data Act (MHMDA) defines biometric data to include face imagery "from which an identifier template can be extracted", requires opt-in consent and carries a private right of action.
- **Colorado** added biometric rules from 1 Jul 2025, and **California** treats biometric data used to identify as "sensitive personal information".
- **TAKE IT DOWN:** platform duties (a 48-hour NCII removal process) have been live since 19 May 2026.
- **NO FAKES** passed the Senate Judiciary Committee in June 2026 but is not law.

### Cited Findings
- **BIPA core duties:**
  - No private entity may "collect, capture, purchase, receive through trade, or otherwise obtain" biometric identifiers or information unless it gives notice, states "the specific purpose and length of term", and obtains a written release.
  - It must "develop a written policy, made available to the public" with a retention schedule and destruction guidelines.
  - Damages are up to $1,000 per negligent and $5,000 per intentional or reckless violation, plus fees.
  - A private right of action is available to "any person aggrieved"; under *Rosenbach v. Six Flags* (2019), no actual injury is needed beyond the violation.
  - Source: [Davis Wright Tremaine (updated 20 Apr 2026)](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages)
- **BIPA 2024 amendment (SB 2979):**
  - Signed 2 Aug 2024 and effective immediately. Collecting or disclosing the "same biometric identifier or biometric information from the same person using the same method of collection" is one violation with at most one recovery.
  - Consent may be given by electronic signature, now a defined term. — [DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages)
  - Statutory wording: "only commits one single violation, for which the aggrieved party is entitled to, at most, one recovery" (740 ILCS 14/20(b), (c)). — [Paul Hastings](https://www.paulhastings.com/insights/ph-privacy/7th-circuit-confirms-bipa-amendment-has-retroactive-application)
- **BIPA retroactivity:** *Clay v. Union Pacific R.R.* (7th Cir. No. 25-2185, decided 1 Apr 2026) held the amendment procedural and retroactive to pending cases. Illinois state courts could still decide otherwise. — [Paul Hastings](https://www.paulhastings.com/insights/ph-privacy/7th-circuit-confirms-bipa-amendment-has-retroactive-application); [DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages)
- **Texas CUBI, Bus. & Com. Code §503.001 (verbatim):**
  - "'biometric identifier' means a retina or iris scan, fingerprint, voiceprint, or record of hand or face geometry."
  - A person may not capture one "for a commercial purpose unless the person: (1) informs the individual before capturing the biometric identifier; and (2) receives the individual's consent".
  - The person may not "sell, lease, or otherwise disclose" it (narrow exceptions), and must use "reasonable care".
  - The person "shall destroy the biometric identifier within a reasonable time, but not later than the first anniversary of the date the purpose for collecting the identifier expires".
  - "civil penalty of not more than $25,000 for each violation", recoverable by the attorney general.
  - Source: [Tex. Bus. & Com. Code §503.001 (texas.public.law mirror)](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001)
- **Washington RCW 19.375 (verbatim):**
  - "'Biometric identifier' … does not include a physical or digital photograph, video or audio recording or data generated therefrom".
  - "A person may not enroll a biometric identifier in a database for a commercial purpose, without first providing notice, obtaining consent, or providing a mechanism to prevent the subsequent use".
  - The holder may retain it "no longer than is reasonably necessary to … [p]rovide the services for which the biometric identifier was enrolled".
  - Source: [RCW 19.375](https://app.leg.wa.gov/RCW/default.aspx?cite=19.375&full=true)
- **Washington MHMDA, RCW 19.373.010 (verbatim):**
  - "'Biometric data' means data that is generated from the measurement or technological processing of an individual's physiological, biological, or behavioral characteristics and that identifies a consumer … includes … (a) Imagery of the iris, retina, fingerprint, face … from which an identifier template can be extracted".
  - "Consumer health data" expressly includes "(ix) Biometric data".
  - "'Consent' means a clear affirmative act that signifies a consumer's freely given, specific, informed, opt-in, voluntary, and unambiguous agreement".
  - Source: [RCW 19.373.010](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010)
- **MHMDA enforcement:** a private right of action via Washington's Consumer Protection Act, plus AG enforcement. Selling requires a signed authorisation; in effect from 31 Mar 2024 (30 Jun 2024 for small businesses). — [Sidley](https://datamatters.sidley.com/?p=4971) [snippet]; [Kelley Drye](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/my-health-my-data-washingtons-health-data-privacy-revolution) [snippet]
- **Colorado HB24-1130 (in force 1 Jul 2025):**
  - Amends the Colorado Privacy Act.
  - Requires a written policy with a retention schedule and permanent destruction "by the earliest of certain dates", plus disclosure and consent before collecting.
  - Reportedly applies regardless of the usual CPA size thresholds.
  - Sources: [ACLU of Colorado](https://www.aclu-co.org/legislation/hb24-1130-privacy-biometric-identifiers-data-0/) [snippet]; [Digital Policy Alert](https://digitalpolicyalert.org/event/32355-act-amending-colorado-privacy-act-for-enhanced-biometric-data-protection-entered-into-force-bill-no-hb-24-1130) [snippet]; [Captain Compliance](https://captaincompliance.com/education/colorados-biometrics-privacy-rules/) [snippet; low-quality source]
- **California CCPA/CPRA:**
  - Biometric information processed to identify a consumer is "sensitive personal information", subject to the right to limit.
  - Updated CPPA regulations (Sept 2025) add risk assessments and ADMT duties. The phase-in dates were unclear in the sources (some say 2027+).
  - Sources: [DLA Piper, 30 Sep 2025](https://www.dlapiper.com/insights/publications/2025/09/ccpa-2025-updated-regulations) [snippet]; [Morgan Lewis, Jul 2026](https://www.morganlewis.com/pubs/2026/07/ccpa-risk-assessment-requirements-and-best-practices) [snippet]
- **TAKE IT DOWN Act (FTC enforces s.3):**
  - Covered platforms had to be compliant by 19 May 2026.
  - They must: run a victim request process; give clear and conspicuous notice of it; remove NCII within 48 hours of a valid request; and make "reasonable efforts" to remove identical copies.
  - There is a good-faith removal safe harbour.
  - "Covered platform" includes a "website, online service, online application, or mobile application" primarily providing a forum for user-generated content.
  - The FTC chair sent warning letters to platforms before the deadline.
  - Sources: [Wiley](https://www.wiley.law/alert-May-19-Deadline-for-TAKE-IT-DOWN-Act-Compliance-Is-Your-Company-Prepared) [snippet]; [WilmerHale, 15 Jun 2026](https://wilmerhale.com/en/insights/client-alerts/20260615-the-take-it-down-act-goes-live) [snippet]; [FTC](https://www.ftc.gov/node/332132) [snippet]
- **NO FAKES Act (S. 4591, 2026):**
  - Passed the Senate Judiciary Committee by unanimous voice vote, dated 18 Jun 2026 by most sources (one says 26 Jun), and placed on the Senate calendar. Not law.
  - It would create a federal right in voice and visual likeness that is non-assignable during life, licensable, and survives death.
  - It includes notice-and-takedown with counter-notice, and exemptions for news, satire and similar.
  - It would preempt future state digital-replica laws but not state causes of action existing as of 1 Jan 2025.
  - Sources: [Sen. Blackburn press release](https://www.blackburn.senate.gov/2026/6/blackburn-coons-bipartisan-bill-to-protect-individuals-and-creators-from-deepfakes-passes-senate-judiciary-committee) [snippet]; [Mondaq](https://www.mondaq.com/unitedstates/patent/1805904/senate-committee-advances-bill-to-protect-name-image-likeness-and-voice-against-unauthorized-ai-use) [snippet]; [CMS](https://cms.law/en/gbr/publication/the-war-on-digital-replicas-the-no-fakes-act-advances) [snippet]
- **State digital-replica laws:**
  - **California AB 2602 and AB 1836:** signed 17 Sep 2024, effective 1 Jan 2025. AB 2602 voids vague performer contract terms on digital replicas made without counsel or union representation. AB 1836 requires estate consent for digital replicas of deceased performers in audiovisual works and sound recordings. — [Foley](https://www.foley.com/p/102jk3d/california-governor-gavin-newsom-signs-two-ai-bills-to-protect-entertainment-indu/) [snippet]; [Hollywood Reporter](https://www.hollywoodreporter.com/business/business-news/gavin-newsom-signs-ai-bills-supported-sag-aftra-1236004935/) [snippet]
  - **Tennessee ELVIS Act** (in effect from July 2024) extends the state's personal rights law to AI-generated voice and likeness. — [DWT, Mar 2025](https://www.dwt.com/insights/2025/03/state-laws-regulating-ai-in-entertainment-industry) [snippet]
  - **New York:** on 11 Dec 2025 Gov. Hochul signed two bills, one requiring disclosure of AI "synthetic performers" in advertising and one broadening the deceased-performer digital-replica rules. Earlier law (SB 7676B) covers digital-replica contract terms from 1 Jan 2025. — [MSK](https://www.msk.com/newsroom-alerts-3114) [snippet]

### Inferences
- **Treat every US user as if BIPA applies:**
  - Before any capture: a standalone notice naming purpose and term, plus an affirmative written or e-signed release.
  - A public biometric retention and destruction policy.
  - No selling or "profiting" from face data.
  - These steps also satisfy CUBI, RCW 19.375, MHMDA and Colorado in most respects.
- **Face embeddings, LoRAs and identity adapters derived from a selfie** are plausibly "face geometry" (CUBI), and plausibly MHMDA "biometric data" (imagery "from which an identifier template can be extracted"). The photo exclusions in BIPA (reportedly) and RCW 19.375 should not be relied on for derived embeddings. Lawyer to confirm.
- **Destruction:** CUBI's hard cap (one year after the purpose expires) and the BIPA/Colorado "earliest date" rules support one global policy:
  - delete raw captures as soon as the character is built;
  - delete derived embeddings and LoRAs on account deletion, consent withdrawal, or after a fixed inactivity period (e.g., 12 months);
  - propagate deletion to every model provider.
- **TAKE IT DOWN:** if the app lets users post, share or host generated media (a gallery, a feed, public links), it is likely a "covered platform". It needs a 48-hour NCII removal channel and notice even with strong generation filters.
- **Public figures:** state publicity laws (ELVIS, NY, CA post-mortem) and the pending NO FAKES make generating likenesses of celebrities or anyone other than the verified user high-risk. Hence the "only your own face" design.

### Gaps
- BIPA §10 and §15 text not read directly (ilga.gov unreachable from this environment): the photograph exclusion, the "face geometry" wording, the 3-year destruction outer limit, and the §15(c) no-profit clause are from memory and secondary sources. Verify at 740 ILCS 14.
- Colorado's exact destruction deadlines (C.R.S. §6-1-1314) not verified.
- CCPA statutory definition text and the risk-assessment phase-in dates not verified.
- Texas AG biometric enforcement history (e.g., large settlements with Meta and Google) not sourced in this pass.
- TAKE IT DOWN s.2 criminal provisions (publishing NCII and "digital forgeries") and their effective date not sourced in this pass.
- NY synthetic-performer law bill numbers and effective dates not verified.
- No research on other state biometric or consumer privacy laws (e.g., Oregon, Texas TDPSA, Virginia), most of which treat biometric data as sensitive data needing opt-in consent.

## 5. India: DPDP Act 2023, DPDP Rules 2025, and the IT Rules amendments on synthetically generated information

### Takeaway
- **DPDP Rules:** notified mid-November 2025 and phased in. The Data Protection Board and procedural rules applied at once, consent managers come on about 13 Nov 2026, and the core obligations (notice, security, breach notification, rights, children) apply from about 13 May 2027.
- **Children:** the Act defines a child as under 18, requires verifiable parental consent, and bans tracking, behavioural monitoring and targeted ads aimed at children.
- **Transfers:** cross-border transfer is allowed unless the government blacklists a country.
- **IT Rules amendment:** separately, the amendment notified 10 Feb 2026 and effective 20 Feb 2026 regulates "synthetically generated information". It requires prominent labels and permanent provenance metadata, obliges SGI-tool intermediaries to block unlawful SGI (incl. NCII and CSAM), and cuts takedown on orders to 3 hours.

### Cited Findings
- **DPDP Rules commencement:**
  - Notified 13 Nov 2025 (one source says 14 Nov). Rules 1, 2 and 17–21 (the Board etc.) apply from publication.
  - Rule 4 (consent managers) applies after 12 months, about 13 Nov 2026.
  - Rules 3, 5–16, 22 and 23 apply after 18 months, about 13 May 2027.
  - Sources: [Deccan Herald](https://www.deccanherald.com/amp/story/india%2Fcentre-notifies-dpdp-rules-implementation-planned-in-phases-spread-over-12-18-months-3798465) [snippet]; [Mondaq](https://webiis08.mondaq.com/india/data-protection/1775140/from-draft-to-reality-key-changes-in-indias-dpdp-rules-2025) [snippet]; [JSA Prism Nov 2025](https://www.jsalaw.com/?p=55573) [snippet]
- **DPDP Act s.9 (verbatim, via an unofficial mirror):**
  - "(1) The Data Fiduciary shall, before processing any personal data of a child … obtain verifiable consent of the parent of such child…"
  - "(2) … shall not undertake such processing of personal data that is likely to cause any detrimental effect on the well-being of a child."
  - "(3) … shall not undertake tracking or behavioural monitoring of children or targeted advertising directed at children."
  - Source: [dpdpa.com s.9](https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html)
  - A child is an individual under 18. — [KS&K](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/) [snippet]
- **DPDP Rules, Rule 10 (verbatim, via an unofficial mirror):** verifiable parental consent requires "due diligence, for checking that the individual identifying herself as the parent is an adult who is identifiable", by reference to "reliable details of identity and age" or "a virtual token mapped to such details", including via a "Digital Locker service provider". — [dpdpa.com Rule 10](https://dpdpa.com/dpdparules/rule10.html)
- **DPDP Act s.16 (verbatim, via an unofficial mirror):** "(1) The Central Government may, by notification, restrict the transfer of personal data by a Data Fiduciary for processing to such country or territory outside India as may be so notified." Subsection (2) preserves sectoral laws with stricter rules. — [dpdpa.com s.16](https://www.dpdpa.com/dpdpa2023/chapter-4/section16.html)
- **IT Rules amendment, synthetically generated information (SGI):**
  - Notified 10 Feb 2026, effective 20 Feb 2026.
  - SGI is audio, visual or audio-visual content "artificially or algorithmically created, generated, modified, or altered using a computer resource" that appears real and depicts people or events as indistinguishable from real ones.
  - Exclusions: good-faith editing (e.g., colour adjustment, compression), templates and accessibility tools.
  - Permitted SGI must be "prominently labelled and embedded with permanent metadata or provenance markers", including unique identifiers linking to the intermediary's computer resource, and platforms may not let anyone remove them.
  - Intermediaries offering SGI tools must deploy technical measures, including automated tools, to prevent unlawful SGI: CSAM, NCII, obscene content, false documents, deceptive portrayals of individuals or events.
  - Significant social media intermediaries (more than 5 million Indian users) must collect user declarations of SGI and verify them.
  - Takedown on government or court orders within 3 hours (was 36 hours).
  - Source: [Hogan Lovells](https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content)
- A separate 2-hour window for complaints about non-consensual sexual imagery is reported by one secondary source but not by Hogan Lovells. — [Mondaq](https://mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations) [snippet]; [iPleaders](https://blog.ipleaders.in/it-rules-2026/) [snippet]

### Inferences
- **Under-18s:** the DPDP child threshold of 18 and the Rule 10 parental-identity checks make a hard block on face scans by under-18s far simpler than building verifiable parental consent. This also fits the EU/UK minors risk and NCII/CSAM concerns.
- **Consent and notice:** although the core DPDP duties apply from about May 2027, build now to the DPDP's itemised notice and consent standard. The EU, UK and US standards already need it.
- **Transfers:** sending Indian users' faces to US or other model providers is allowed unless the government restricts that country. Check for any s.16 notification before launch. Consider whether China-hosted APIs could become restricted.
- **IT Rules:** an app that lets users generate realistic videos of themselves is very likely an intermediary "offering SGI tools" for Indian users. Every output needs a visible label plus permanent provenance metadata (C2PA fits), and proactive NCII/CSAM/impersonation filters.

### Gaps
- Official Gazette text of the DPDP Rules (G.S.R. number, exact dates) and Rule 14 on processing outside India not read: the dpdpa.com mirror reset the connection. dpdpa.com is an unofficial mirror; confirm on meity.gov.in or egazette.gov.in.
- DPDP penalty schedule (e.g., up to ₹250 crore for security failures) not verified in this pass.
- My understanding is that the DPDP Act has no separate "sensitive" or biometric category, unlike the old SPDI Rules 2011, which reportedly stay in force during the transition. Not verified this pass. Lawyer to confirm.
- IT Rules: Gazette number not confirmed (one source says G.S.R. 120(E)). Not confirmed whether the final text kept the October 2025 draft's minimum label size; Hogan Lovells cites none.
- No source found on whether the Data Protection Board has issued any guidance or decisions yet.

## 6. Other jurisdictions: Denmark's likeness bill, and China's deep-synthesis and labelling rules and transfer concerns when using Chinese model APIs

### Takeaway
Denmark's copyright-style protection for face and voice is still a bill. It was tabled 8 Oct 2026 and targets 1 Jan 2027, with a consent requirement and protection for 50 years after death. China already requires explicit and implicit labels on AI content (since 1 Sep 2025) and treats biometrics as sensitive personal information under the PIPL. The bigger practical issue for using Kling, Seedance or Hailuo APIs is the opposite direction: sending EU, UK and Indian users' faces to providers that may process in China, which has no EU adequacy decision.

### Cited Findings
- **Denmark:**
  - The Culture Minister introduced the bill on 8 Oct 2026. It would bar sharing "realistic deepfakes of people's faces and voices without their consent".
  - Exceptions cover satire, parody, caricature and social criticism, but not misinformation posing serious dangers.
  - Intended start "at the start of 2027"; enforcement details were not given.
  - Source: [Euronews, 8 Oct 2026](https://www.euronews.com/2026/10/08/denmark-introduces-a-bill-protecting-peoples-faces-and-voices-from-deepfakes)
  - Secondary reports give the bill as L 49, an amendment to the Copyright Act protecting appearance, voice and movements for 50 years post-mortem. They say an earlier version lapsed at the general election, give EU TRIS notification 2025/0654/DK with Commission comments on 3 Feb 2026, and disagree on whether penalties are civil only. — [PPC Land](https://ppc.land/denmarks-deepfake-bill-makes-publishers-prove-consent-from-january-2027/) [snippet]; [EU IP Helpdesk](https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/denmarks-proposed-copyright-rules-deepfakes-2026-06-01_en) [snippet]
- **China, labelling:**
  - The CAC and three agencies issued the Measures for Labeling AI-Generated Synthetic Content, effective 1 Sep 2025, with mandatory national standard GB 45438-2025.
  - Explicit (visible) labels plus implicit (metadata) labels are required, including on downloaded or exported files.
  - Platforms must verify labels and users must declare AI content.
  - These sit alongside the Deep Synthesis Provisions (2022) and the Interim Measures for Generative AI Services (2023).
  - Sources: [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/03/chinas-ai-labeling-measures-and-mandatory-national-standards-take-effect-september-1) [snippet]; [Technology's Legal Edge](https://www.technologyslegaledge.com/2025/03/china-released-new-measures-for-labelling-ai-generated-and-synthetic-content/) [snippet]
- **China, PIPL and transfers:**
  - Biometrics are sensitive personal information under the PIPL, needing separate consent, and separate consent is also needed for transferring data abroad.
  - The PIPL applies extraterritorially to processing of people in China.
  - The Measures for Certification of Cross-Border Personal Information Transfer took effect 1 Jan 2026, and the revised Cybersecurity Law also took effect 1 Jan 2026.
  - Collectors above certain volumes of facial recognition data face CAC filing requirements.
  - Sources: [Seers.ai](https://seers.ai/blogs/china-data-privacy-2-0-cross-border-consent-rules/) [snippet; vendor blog, weak]; [ComplianceHub](https://compliancehub.wiki/china-pipl-cross-border-certification-route-cybersecurity-law-penalties-2026/) [snippet; weak]
- **Kling (Kuaishou):**
  - Its privacy policy was last updated 21 Apr 2026. A search summary reports that it says Kling does not analyse facial features, identify individuals, or collect, share or store face data.
  - Third-party analyses say the terms grant Kling a broad licence to use uploaded content, including for model development, and that data "may" be processed in China.
  - Sources: [Kling privacy policy](https://kling.ai/docs/privacy-policy) [snippet]; [ConductAtlas on Kling ToS](https://conductatlas.com/platform/kling-ai/kling-ai-terms-of-service/) [snippet; third-party]; [CometAPI](https://www.cometapi.com/are-kling-videos-private/) [snippet; inference, not confirmed]

### Inferences
- Do not rely on Denmark's bill as law. Do design for it, because "consent of the person depicted" is exactly the app's model: users only animate their own verified face.
- **Before sending EU, UK or Indian faces to a Chinese-owned API:**
  - Establish the contracting entity and processing location (some offer non-China entities or regions; unverified).
  - Sign a DPA with SCCs and do a transfer impact assessment that addresses Chinese state-access laws.
  - Confirm no-training and deletion terms. A broad content licence for "model development" is incompatible with a privacy-first face product.
- These providers are not a good fit as the default route for face-bearing inputs until terms are confirmed. Lawyer to confirm. Use them only with an opt-in and clear notice naming the country.
- If the app is ever offered to users in China, the labelling measures and GB 45438-2025 apply directly. Out of scope for now.

### Gaps
- Not read: the text of the Danish bill (L 49) or its final penalty structure.
- Not verified: Kling, Seedance (BytePlus) or Hailuo (MiniMax) API data-processing terms, hosting regions, retention or training use for API inputs. Primary DPA documents must be read before integration.
- PIPL sources found were weak vendor blogs. No law-firm or official source on whether non-China users' data sent to a China-hosted API triggers Chinese export rules (it may, if the data is later exported again).

## 7. Platform rules: Apple App Store and TrueDepth; Google Play

### Takeaway
- **Apple** forbids using face or depth mapping data (ARKit, Camera or Photo APIs) "for marketing, advertising or use-based data mining, including by third parties". It requires apps to "clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so". It requires in-app account deletion, and age-restriction mechanisms in creator apps.
- **Google Play's AI-Generated Content policy** explicitly covers "Apps that create voice and/or video recordings of real-life individuals using AI". It bans "AI-generated non-consensual deepfake sexual material" and sexually gratifying generative apps, and makes developers responsible for blocking offensive output.

### Cited Findings
- **Apple 5.1.2(vi) (verbatim):** "Data gathered from the HomeKit API, HealthKit, Clinical Health Records API, MovementDisorder APIs, ClassKit or from depth and/or facial mapping tools (e.g. ARKit, Camera APIs, or Photo APIs) may not be used for marketing, advertising or use-based data mining, including by third parties." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple 5.1.2(i) (verbatim):** "You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple 5.1.1(v) (verbatim):** "If your app supports account creation, you must also offer account deletion within the app." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple 1.2.1(a) (verbatim):** "Creator apps must provide a way for users to identify content that exceeds the app's age rating, and use an age restriction mechanism based on verified or declared age to limit access by underage users." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple 1.1.1 (verbatim):** bars "Defamatory, discriminatory, or mean-spirited content … particularly if the app is likely to humiliate, intimidate, or harm a targeted individual". The page shown had no "last updated" date, and the fetch was truncated at 100k characters, so later sections were not read. — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple Developer Program License Agreement, TrueDepth face data (2018 reporting, current text not verified):**
  - Apps must obtain "clear and conspicuous consent" before collecting or storing face data, and only for a legitimate app feature.
  - It may not be used for advertising or marketing, or sold to data brokers or analytics firms.
  - Sources: [CGTN (2018)](https://news.cgtn.com/news/33557a4e33597a6333566d54/index.html) [snippet]; [Gizmodo AU](https://gizmodo.com.au/?p=1073510) [snippet]
  - A 2026 note reports DPLA §3.3.3(D) "Updated language on requirements for data and privacy". — [iClarified, 9 Apr 2026](https://www.iclarified.com/entry/index.php?enid=9925) [snippet]
- **Google Play AI-Generated Content policy:**
  - Scope includes "Apps that create voice and/or video recordings of real-life individuals using AI" and image-generation apps.
  - Violations include:
    - "AI-generated non-consensual deepfake sexual material";
    - "Voice or video recordings of real-life individuals that facilitate scams";
    - "Content generated to facilitate bullying and harassment";
    - "Generative AI applications primarily intended to be sexually gratifying".
  - "Developers are responsible for ensuring that their generative AI apps do not generate offensive content."
  - Source: [Google Play Console Help 14094294](https://support.google.com/googleplay/android-developer/answer/14094294)
- **Google Play, June 2024 update:** AI apps must block restricted content and provide in-app ways for users to flag offensive output. Apps marketed as able to "undress people" can be removed even if they cannot do it. — [TechCrunch, 6 Jun 2024](https://techcrunch.com/2024/06/06/google-play-cracks-down-on-ai-apps-after-circulation-of-apps-for-making-deepfake-nudes) [snippet]

### Inferences
- **iOS:**
  - Never use face or depth data (or derived embeddings) for ads, analytics profiling or "data mining", and never share it with ad SDKs.
  - Show an explicit, per-provider permission screen before sending selfies to any third-party model API (5.1.2(i)).
  - Build in-app account deletion that also deletes face data and character models.
  - If ARKit/TrueDepth is used for the scan, comply with DPLA face-data terms (consent, legitimate feature, no sale).
- **Android:**
  - In-app report/flag on every generated output.
  - Strict sexual-content filters, and no marketing copy suggesting nudity or "anyone's face".
  - Complete the Play Data safety form to declare biometric/photo data collection and sharing with AI providers (Data safety rules not researched in this pass).

### Gaps
- Current DPLA face-data wording (Schedule/§3.3) not read; Apple's developer site requires a session for the full DPLA.
- Not read: the remainder of the App Store guidelines after character 100k, Apple's guidance on generative AI apps (if any) and the latest guideline revision date.
- Not read: Google Play's Personal and Sensitive User Data policy, Data safety form requirements, and any 2026 changes to the AI-Generated Content policy.

## 8. Model provider terms on uploading real people's faces (OpenAI, Google, Runway, Kling, fal.ai)

### Takeaway
All major providers forbid non-consensual intimate imagery and deceptive impersonation, and make the developer responsible for end users:
- **OpenAI** (policies effective 29 Oct 2025) bans using someone's likeness without consent "in ways that could confuse authenticity" and facial-recognition databases without consent.
- **Google** bans "using personal data or biometrics without legally-required consent".
- **fal.ai** makes developers "fully responsible for your and your users' use". Its AUP security clause, read literally, lists "Biometric data (such as facial recognition data…)" among data you must not "collect, process, or disclose". That needs written clarification from fal before face-scan pipelines run through it.

### Cited Findings
- **OpenAI Usage Policies (effective 29 Oct 2025):** prohibited uses include "facial recognition databases without data subject consent", "real-time remote biometric identification in public spaces", and "using someone's likeness, including their photorealistic image or voice, without their consent in ways that could confuse authenticity", plus "sexual violence or non-consensual intimate content". The quoted wording is from a search-engine summary; the page returned 403 to direct fetch. — [OpenAI Usage Policies](https://openai.com/policies/usage-policies/) [snippet]
- **Google Generative AI Prohibited Use Policy (last modified 17 Dec 2024, verbatim):**
  - "Facilitates non-consensual intimate imagery"
  - "Relates to child sexual abuse or exploitation"
  - "using personal data or biometrics without legally-required consent"
  - "Tracks or monitors people without their consent"
  - "Impersonating an individual (living or dead) without explicit disclosure, in order to deceive"
  - "Misrepresenting the provenance of generated content by claiming it was created solely by a human, in order to deceive"
  - Source: [Google Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)
- **Gemini API:** use binds developers to the Gemini API Additional Terms and the Prohibited Use Policy, enforced through automated and manual review. — [Gemini API usage policies](https://ai.google.dev/gemini-api/docs/usage-policies?hl=ca) [snippet]
- **Veo person generation:** a developer-forum post reports that in the EU, UK, Switzerland and MENA, Veo 3/3.1 allows only `allow_adult` person generation, and some features need allowlisting. User-generated forum content; verify in the official docs. — [Google AI developer forum](https://discuss.ai.google.dev/t/request-allowlist-access-for-veo-3-1-person-generation-project-gen-lang-client-00201875/174711) [snippet]; [Vertex AI Veo responsible AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/responsible-ai-and-usage-guidelines) [snippet]
- **fal.ai Acceptable Use Policy (verbatim):**
  - "fal provides access to AI models developed by third parties. While these providers may apply their own safeguards, users remain subject to this acceptable use policy."
  - "You acknowledge and agree that you are fully responsible for your and your users' use of the Services."
  - Prohibited: "Depicting the likeness of an individual in a sexual or pornographic manner without their consent", and "Identity theft, impersonation, or deepfakes, including using another person's name, image, voice, or other likeness without their consent to impersonate them in any commercial, profane, defamatory, illegal, or otherwise harmful manner."
  - Under "Security": "Don't use the Services to collect, process, disclose, or otherwise compromise any personal, sensitive, or confidential information … including: Collecting, processing, or disclosing personal or sensitive information such as … An individual's image, voice, or likeness in violation of their rights. Biometric data (such as facial recognition data, fingerprints, voiceprints, or retinal scans)."
  - Source: [fal.ai AUP](https://fal.ai/legal/acceptable-use-policy)
- **fal.ai Terms:** reportedly contain a representation that you hold "the written consent, release, and/or permission of each and every identifiable individual person" in your contributions. — [fal.ai Terms](https://fal.ai/terms) [snippet; the page reset the connection]
- **Runway:**
  - Its Usage and Content Policy reportedly bars using another person's image, video or audio without that person's permission, without specifying the form of permission.
  - Its Terms reportedly let Runway train on uploaded content.
  - Source: [ConductAtlas on Runway Usage Policy](https://conductatlas.com/platform/runway/runway-usage-policy/prohibition-on-real-person-likeness-without-permission/) [snippet; third-party monitor, not Runway's text]
- **Kling:** see §6 (privacy policy updated 21 Apr 2026; a broad licence over uploads per third-party analysis). — [Kling privacy policy](https://kling.ai/docs/privacy-policy) [snippet]

### Inferences
- **Consent warranty:** each provider effectively requires the app to warrant that it holds the depicted person's consent. "Only your own face, verified" plus an explicit consent record is the cleanest way to give that warranty truthfully.
- **fal.ai's security clause** can be read as barring biometric data processing outright, or only when it compromises data. Get fal's written confirmation before routing selfies or face embeddings through fal, or route face-bearing jobs to providers whose terms clearly permit consented biometric inputs. Lawyer to confirm.
- **Contract checklist per provider:**
  - a DPA and processor role;
  - no training on inputs (Runway's default reportedly trains; opt out or use enterprise terms);
  - input/output retention period and zero-data-retention options;
  - processing region;
  - a deletion-on-request route;
  - DPF certification (for EU transfers).

### Gaps
- Not obtained (OpenAI's page returned 403): the exact current text of OpenAI's usage policies, OpenAI API data retention and ZDR terms, and any Sora or image-API likeness/consent rules.
- Not read: Runway's own policy text, Kling, Seedance (BytePlus), Hailuo (MiniMax) or Luma developer terms, or provider DPAs.
- Not confirmed: whether providers will delete specific inputs or fine-tunes on request, and how fast.

## 9. Safeguards good practice: own-face verification, consent logs, deletion, minors, NCII and public-figure blocks, provenance labels, encryption, minimisation, retention

### Takeaway
The law across all four regions converges on one design:
- explicit, separate, logged consent before any face capture;
- verification that the face belongs to the account holder, done on-device where possible;
- no under-18 scans;
- hard blocks on sexual content and on other people's or public figures' likenesses;
- visible "AI-generated" labels plus at least two machine-readable marks (C2PA metadata plus a watermark);
- encryption and template protection;
- deleting raw captures quickly and derived models on withdrawal or account deletion, with deletion pushed to every provider;
- a 48-hour takedown channel.

Several of these are now legal requirements, not just good practice.

### Cited Findings
- **Consent capture:** explicit consent set apart from other terms, easy withdrawal "without detriment", and a "suitable alternative" for those who refuse (ICO). Written or e-signed release with purpose and term stated (BIPA). Opt-in "clear affirmative act" (MHMDA). Explicit permission before sharing with "third-party AI" (Apple 5.1.2(i)). — [ICO lawful processing](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-process-biometric-data-lawfully/); [DWT on BIPA](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages); [RCW 19.373.010](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010); [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Verification counts as biometric processing:** 1:1 verification is special category biometric processing (ICO), and on-device verification reduces biometric data leaving the device. — [ICO biometric recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/biometric-recognition/); [ICO security](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/)
- **Encryption and template protection:** "You must also appropriately encrypt any biometric data". Use templates that are irreversible, unlinkable and revocable (ISO/IEC 24745). — [ICO security](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/)
- **Retention and destruction anchors:**
  - CUBI: within a reasonable time, at most one year after the purpose expires. — [Tex. §503.001](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001)
  - RCW 19.375: no longer than reasonably necessary. — [RCW 19.375](https://app.leg.wa.gov/RCW/default.aspx?cite=19.375&full=true)
  - BIPA: a public retention schedule. — [DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages)
  - Colorado: destruction by the earliest of set dates. — [ACLU-CO](https://www.aclu-co.org/legislation/hb24-1130-privacy-biometric-identifiers-data-0/) [snippet]
- **Account deletion in-app:** required by Apple 5.1.1(v). — [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Minors:**
  - DPDP: verifiable parental consent for under-18s, and no tracking or behavioural monitoring of children. — [dpdpa.com s.9](https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html)
  - Apple 1.2.1(a): age restriction mechanism for creator apps. — [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
  - EU Art. 5 ban on CSAM generation from 2 Dec 2026. — [AI Act Art. 5](https://artificialintelligenceact.eu/article/5/)
- **NCII blocks:**
  - EU Art. 5 NCII prohibition (2 Dec 2026). — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
  - UK creation/request offence (6 Feb 2026). — [gov.uk](https://gov.uk/government/news/better-protection-for-victims-thanks-to-new-law-on-sexually-explicit-deepfakes) [snippet]
  - India's SGI-tool prevention duty. — [Hogan Lovells](https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content)
  - Google Play ban. — [Google Play](https://support.google.com/googleplay/android-developer/answer/14094294)
  - Provider policies. — [Google GenAI policy](https://policies.google.com/terms/generative-ai/use-policy); [fal AUP](https://fal.ai/legal/acceptable-use-policy)
  - TAKE IT DOWN 48-hour removal. — [Wiley](https://www.wiley.law/alert-May-19-Deadline-for-TAKE-IT-DOWN-Act-Compliance-Is-Your-Company-Prepared) [snippet]
- **Provenance and labels:**
  - EU Code: at least two machine-readable layers plus the EU icon. — [Jones Day](https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content)
  - India: prominent label plus permanent metadata with unique identifiers. — [Hogan Lovells](https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content)
  - China: explicit and implicit labels on exported files. — [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/03/chinas-ai-labeling-measures-and-mandatory-national-standards-take-effect-september-1) [snippet]
  - C2PA describes itself as "an open technical standard for publishers, creators and consumers to establish the origin and edits of digital content. It's called Content Credentials." — [C2PA](https://c2pa.org/)
- **No ad or analytics use of face data:** Apple 5.1.2(vi). — [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **No race or ethnicity inference from biometrics:** EU AI Act Art. 5(1)(g). — [AI Act Art. 5](https://artificialintelligenceact.eu/article/5/)
- **Impersonation and public figures:**
  - Google bans impersonation without disclosure. — [Google GenAI policy](https://policies.google.com/terms/generative-ai/use-policy)
  - OpenAI bans likeness use without consent that could confuse authenticity. — [OpenAI](https://openai.com/policies/usage-policies/) [snippet]
  - NO FAKES (pending) and the Danish bill (pending) require consent of the person depicted. — [Blackburn](https://www.blackburn.senate.gov/2026/6/blackburn-coons-bipartisan-bill-to-protect-individuals-and-creators-from-deepfakes-passes-senate-judiciary-committee) [snippet]; [Euronews](https://www.euronews.com/2026/10/08/denmark-introduces-a-bill-protecting-peoples-faces-and-voices-from-deepfakes)

### Inferences
A proposed privacy-first baseline, synthesised from the above. It is not a sourced legal requirement as a whole; a lawyer should review it in the DPIA.

1. **Age gate before the camera opens.** Declared age plus age assurance; no face scan for under-18s in any region. This avoids DPDP verifiable parental consent, EU/UK child-data risk and CSAM exposure.
2. **Separate explicit-consent screen, logged.**
   - It names each purpose: build character, verify it's you, generate images and video, send to [named provider, country], keep for [period].
   - It has a typed or e-signed release for BIPA.
   - Store an append-only consent record: user id, timestamp, notice version hash, purposes, providers, country, method, app version.
   - Withdrawal is one tap and triggers deletion.
3. **Non-biometric alternative path** (manual avatar builder or text-described character) so consent is freely given (ICO).
4. **Own-face verification:** liveness plus a 1:1 match of the capture to the session's live selfie, on-device where possible. Keep only a pass/fail token server-side, not the probe template. Block uploads of third-party photos and scans of screens or prints.
5. **Minimisation:**
   - Keep the generated character assets (stylised references, LoRA/adapter weights) rather than raw selfies.
   - Delete raw captures once the character is built (e.g., within 24 hours to 30 days; pick and publish a number).
   - Treat LoRAs and identity embeddings as biometric data too: encrypt them, key them per user, and never reuse them across users or for training without separate consent.
6. **Retention schedule published** (BIPA and Colorado style):
   - derived face models deleted at account deletion, consent withdrawal, or after 12 months' inactivity (inside CUBI's one-year-after-purpose cap);
   - deletion propagated to providers by API delete calls or written request, and logged.
7. **Providers:**
   - DPA, no-training, zero or short retention, DPF/SCCs, region pinning.
   - Avoid providers whose terms take a broad licence over uploads or are unclear on biometric inputs (fal security clause, Kling licence) until clarified.
8. **Generation guardrails:**
   - prompt and output classifiers for nudity and sexual content (hard block);
   - minors-appearance block;
   - public-figure and celebrity face-match block;
   - no "swap face onto someone else's body" or other-person features;
   - violence and humiliation filters (Apple 1.1.1).
9. **Labels:**
   - a visible "AI-generated" badge or EU icon on every export;
   - C2PA Content Credentials manifest plus an invisible watermark (two layers, per the EU Code);
   - keep upstream SynthID/C2PA marks;
   - never strip metadata (India, China).
10. **Abuse handling:**
    - in-app report on every output (Google Play);
    - a 48-hour NCII removal process with public notice (TAKE IT DOWN);
    - a 3-hour response path for Indian government or court orders;
    - hash-matching to remove identical copies.
11. **No ads or analytics on face data** (Apple 5.1.2(vi)), and no inferring ethnicity or emotion from the scan.
12. **DPIA before launch** (ICO "must"; GDPR Art. 35), reviewed whenever a provider or feature changes.

### Gaps
- No authoritative standard found for "liveness plus match" assurance levels for consumer avatar apps (e.g., ISO/IEC 30107-3 presentation-attack detection levels); not researched.
- No regulator guidance found specifically on whether LoRA weights or identity adapters trained on one person's face are "biometric data". Treating them as such is a conservative inference.
- C2PA spec version and Content Credentials support in major model APIs (OpenAI, Google SynthID, Runway, Kling) not verified in this pass.
- Provider-side deletion SLAs (how quickly inputs and fine-tunes are purged) not found for any provider.
