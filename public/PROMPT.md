# ED Code Assist — AI Prompts (update 2.8: the Tintinalli chapter index + the 2.8 call chain; 2.1: the AI auditor on the note audit)

This file documents, **verbatim**, every prompt the tool sends to the AI backend, so you can review them, tune them, or work around them if needed.

- **Provider default:** Groq (`openai/gpt-oss-120b` — strong reasoning — since update 2.8; free tier, called directly from the browser — no server needed). Switchable in **⚙ Admin** to NVIDIA NIM (GLM 5.3, requires the bundled `ai_gateway.py` relay when running locally because of CORS) or to any other Groq model (llama-3.3-70b-versatile remains in the picker). The prompt texts are identical for every model.
- **Four calls (update 1.4) — the DDx step runs FIRST for every one of them:** ⓪ **DDx suggestion** is a dedicated call that derives the suggested DDx (working diagnosis first, then the differentials) plus each differential's suggested ICD code; ① **AI Assist — ICD-10 codes** builds on it: its user message carries the `SUGGESTED DDx` block (from the DDx step) before the clinical notes, with a **slight preference for the department's preferred diagnosis list** — and never upgrades a code beyond what the note documents; ② **Suggested workup** is **DDx-targeted**: its user message carries the same DDx block first, and it never runs without DDx items — since 1.6 every suggested item also returns its **doc** (the AI-drafted documentation sentence the labs-reasoning box drafts when the card is ordered) and the reply reviews the unsupported CPG investigations (**cpg_review**: the other-guidelines comparison + the "add supporting data like …" phrases); ③ **Justify** is DDx-first too: verdict + clinical-note draft + refs, plus a fourth part **gaps** with its **gap_items** companion (update 1.5: the advisory explanation + the isolated indications, each with its own Copy / Add-to-notes button) — shown only when at least one listed test is **not justified** by the available data. Update 2.8 re-pointed the chain for token saving: the **codes button** and the **justify box** run the DDx step themselves when the current note has no DDx items yet (through the shared `ensureDDx()`); the **Suggested workup** button is GATED on the DDx — it stays disabled until notes, DDX, ICD has generated the DDx items for the note, then reuses them with no DDx call of its own; and **only Audit notes** never touches the DDx (one AI call, the auditor).
- **Update 1.4 highlights (all three downstream prompts changed + one new prompt):** the DDx suggestion became its own call that runs before the ICD codes, the workup and the justification — all three now receive the DDx items in their user messages. The justification grew a **gap box**: when the investigation is not justified by the available data, the reply's `gaps` field answers *what could be missed or forgotten in the DDx or the clinical notes that would justify the investigation* — a reminder that it can be justified if that was genuinely the case, with the standing instruction to **never propose faking a complaint, an examination finding, or a result** (the UI carries the same warning in the box). The Clinical Notes tab is now the **default tab**; the note audit accepts **non-verbatim disposition plans** ("the patient is for OPD", "for admission", "transferred to ward"); the **Audit all button was removed** — every button runs the DDx step itself, so the chain is no longer needed. A `LOGIC.md` diagram of the whole page ships alongside this file.
- **Update 1.5 highlights:** the gap box is **split in two** — the explanation (the "first phase", e.g. *"X was ordered, but no documented indication … per guideline recommendations"*) is advisory-only: not selectable, no buttons, never copyable, never added to the clinical notes; the **isolated indications** (`gap_items`) render underneath, each with its own **Copy** and **Add to notes** button so every indication is handled solitarily, with the anti-faking warning kept. Replies without `gap_items` fall back to extracting the indications from the prose. New **colour theme setting** in the header: **Day / Sepia / Dark / Night**, saved in localStorage (`edca-theme`) and restored before first paint.
- **Update 1.6 highlights (workup prompt only — the DDx, codes and justify prompts are byte-identical to 1.5):** every suggested workup item now carries a **`doc`** field — the one-sentence clinical-documentation reason the AI writes for THIS encounter from the DDx + the notes (the dynamic reasoning: what the labs-reasoning box drafts verbatim when the card is ordered; the local opener pools remain only as the legacy fallback), and the reply carries **`cpg_review`**: for every CPG investigation the DDx + the notes do **not** support, the other guidelines in use that do (or `none`), the 2-4 **supporting phrases** that would have justified it (rendered as "Add supporting data like: …" on the flagged card, with the anti-faking rule that they are added only if genuinely asked, examined, or found), and its doc sentence. Appended CPG cards without a review entry get the softer local "verify the supporting data" note — the tool never invents supporting data itself. The **Quick start & tips** guide and the **⚙ Admin** settings both moved into the top panel (the header).
- **Update 1.3 highlights:** the **Suggested DDx is a first-class panel** fed by every Notes-tab button — each differential can be copied or added to the clinical notes on its own (or all at once, with its suggested ICD code inline when one exists). The **workup is DDx-targeted and gated**: its user message carries a `SUGGESTED DDx` block (working diagnosis / most likely first, numbered) **before** the clinical notes, and the workup **never runs without DDx items** — when the DDx step returns none, the button explains that instead of sending anything.
- **Update 1.2 note (no prompt changes):** all three AI prompts were byte-identical to update 1.1 — that release was a UI/UX and accessibility pass (live note-audit pill with per-item evidence, insert-missing-headings, results quick-nav, Cancel for in-flight AI calls, encounter tray with reorder/undo/New patient/EMR copy formats, Esc & Enter keyboard fixes, ★ shown only for preferred-list codes, decluttered AI rows, contrast/aria/16px-input fixes).
- **Update 1.1 highlights:** the audit accepted the fuzzy abbreviations physicians actually write (**C/O, Co, PMHx, PSHx, “opd fu”**) and tolerated minor spelling or grammar slips (one-edit word matching for 5+-letter keywords — never penalized), recognized **death** as a disposition, and made **sick leave critical when missing** — required whether needed or not, **unless** the disposition is **DAMA, admission or death**; the justification **draft** was written in clinical-note phrasing while the **verdict** keeps the textbook tone. (Its one-click Audit all button was removed in 1.4 — every button now runs the DDx step itself.)
- **Update 1.0 also ships the note audit** — **Audit clinical notes** is a *local deterministic check* (no AI call, nothing leaves the machine) of whether the note documents complaints (c/o accepted), HPI, PMH/PSH, vitals, local examination, working diagnosis / DDx, ER course (ED medications as a wording without more detail, Ix done accepting the general “labs”/“rads” wording, consultation), disposition and sick leave. Complaints, PMH/PSH and disposition are critical — missing ones raise a warning banner in neutral wording (soft, never blocks; since 1.1 sick leave too, unless DAMA/admission/death; since 1.2 every documented item shows what actually matched and a button inserts the missing headings).
- **Update 2.8 highlights:** the workup and justification prompts now carry TWO reference indexes — Harwood-Nuss' (6th ed.) and, new, **Tintinalli's Emergency Medicine (9th ed.)**: the verified 304-chapter index (sourced from the book's official chapter-references page on tintinalliem.com) is embedded, a local matcher appends only the note-relevant chapters, and the model cites Tintinalli's **chapter-by-chapter** ("Tintinalli's ch. N - chapter title", N only from the index). Every Tintinalli chapter citation links to the official chapter-list page (`https://www.tintinalliem.com/references_9e.php` — the hub pattern: one stable verified landing page); a book-level Tintinalli's cite and Rosen's stay plain text. On the page: **Suggested workup** is gated on the DDx (disabled until notes, DDX, ICD generated it; then no extra DDx call), **only Audit notes** (renamed) audits the notes alone and navigates to the audit section, and the keyboard map is Alt+Q codes · Alt+A workup · Alt+Y AI justify · Alt+N new patient.
- **Update 2.1 highlights:** the **Audit clinical notes** button now runs **two auditors**: the offline rules locally and instantly, plus an **AI auditor pass** on the configured endpoint. Every item card carries **both verdicts** (offline in teal, AI in purple), and the display follows the AI auditor — items flagged by **both** auditors, or by the **AI auditor alone**, are shown as missing; items flagged **only by the offline auditor are skipped** (it proved the less reliable of the two). When the endpoint is unavailable the offline view stands with a notice; an edit after a merged audit re-renders the offline view with a stale hint.
- **Update 0.9 highlights:** every AI-suggested code on the **ED preferred diagnosis list** (clinical governance v2.0) carries a **★ star** (since 1.2 it is tappable for the detail, and off-list codes show no star); non-specific suggestions raise a banner that points the physician at the fix — **add the working diagnosis / DDx to the clinical notes**; the justification shows **evidence links** (verified NICE guideline pages and Harwood-Nuss chapters only — never a guessed URL) that stay out of the copied text, plus an **Add to clinical notes** button that appends the draft to the notes.
- **Where the prompts live:** inside `ed-code-assist.html`, in the main `<script>` block — search for `DDX_SYSTEM` (DDx step), `AI_SYSTEM` (codes), `WORKUP_SYSTEM` (workup), and `JUSTIFY_SYSTEM` (justification). Edit the string arrays and save; no rebuild needed for a single copy.
- **Maintained pipeline:** edit `scripts/ed_code_assist_template.html`, then run `python3 scripts/build_ed_code_assist.py`.
- All calls are OpenAI-compatible `POST {endpoint}/v1/chat/completions` with `Authorization: Bearer <key>`, `temperature`, and `max_tokens`.

---

## The ED preferred diagnosis list (update 0.9)

The department's **ER ICD-10 Preferred Diagnosis List** (clinical governance working copy v2.0, 2026-09-13 — 401 rows → **449 exact codes + 3 section ranges**) is embedded in the tool and used two ways:

- **UI star icons:** every AI-suggested code is matched locally against the embedded list — ★ (gold) = on the list, ☆ (grey) = not on it. Hover a star for detail; the suggestions header carries the keymap. Matching normalizes codes (dots removed) and honors the governance document's conventions: ` / `-separated alternatives, section ranges (`X60-X84`, `S42-S92`, `X93-X95` — matched on the 3-character category prefix), and trailing-zero variants (`I47.10` in the document = billable `I47.1`).
- **AI slight preference:** candidates fed to the codes prompt that are on the list are tagged **`[PREFERRED]`** (rule 6 below asks for a *slight* preference — never a mandate, the model may still deviate slightly). The star icon itself is always computed by the tool from the embedded list, never trusted to the model.
- **Maintaining the list:** edit `scripts/preferred_list_source.md` (the governance team's working copy), then run `python3 scripts/build_preferred.py` and `python3 scripts/build_ed_code_assist.py`. Entries that are not billable FY2026 codes simply never match a suggestion — the icon stays honest.

---

## The reference indexes: Harwood-Nuss (update 0.5) + Tintinalli's (update 2.8)

The workup and justify prompts are extended at call time with **REFERENCE INDEX** blocks listing the chapters of *Harwood-Nuss' Clinical Practice of Emergency Medicine* (6th ed.) and — since update 2.8 — *Tintinalli's Emergency Medicine: A Comprehensive Study Guide* (9th ed.) that are relevant to the current context. This keeps citations real: the model may only cite chapter numbers from the provided lists.

- Chapter data: `scripts/hn_chapters.json` (383 chapters, parsed from the doctorlib.org table of contents by `scripts/fetch_hn_chapters.ts`).
- **Page offset:** on doctorlib.org the book's pages are offset by one — chapter N is at `https://doctorlib.org/medical/clinical-practice-emergency-medicine/(N+1).html` (e.g. ch. 67 "Sinusitis and Rhinitis" = `/68.html`). The tool computes these links itself for every "Harwood-Nuss ch. N" citation shown in the workup cards **and** in the justification evidence links.
- Selection: a local matcher scores chapters by word overlap with the (lay/abbrev-expanded) note. Since update 0.9 the workup call matches on the note only (the selected-codes descriptions were dropped together with the selected-codes basis). It requires the chapter's distinguishing word and at least half its title words to appear, and adds a curated bridge list (`HN_EXTRA` in the template) for presentations whose wording differs from the chapter title ("STEMI" → ch. 82 Acute Coronary Syndrome, "ear pain" → ch. 68, …). At most ~24 chapters are appended per call — never the full 383, keeping prompts light.
- If nothing matches, the block tells the model to prefer the other references or "standard ED practice" rather than guessing a chapter number.
- **Tintinalli's (update 2.8):** `scripts/tt_chapters.json` — the VERIFIED 304-chapter list (1-303 with 29A/29B), written by `scripts/build_tt_chapters.py` from the book's official 9th-edition chapter-references page (`https://www.tintinalliem.com/references_9e.php`, fetched 2026-10-18; the page's "Flank and.Buttocks" typo for ch. 264 normalized to the real title). The same matcher + bridge pattern (`TT_EXTRA`) picks the relevant chapters; citations take the form "Tintinalli's ch. N - chapter title" and every chapter citation links to the official chapter-list page (the hub pattern — the book has no public per-chapter pages). Rosen's stays book-level (the owner kept the other references as they are).
- The DDx step (⓪) and the codes call (①) do not append the reference index — they cite no guidelines, so the index would only add tokens.

---

## 0. DDx suggestion — THE DDx STEP THAT RUNS FIRST (update 1.4)

A dedicated call run by **every Notes-tab button** (through `ensureDDx()`) whenever the current note has no DDx items yet — the codes button runs it as its step 1 of 2, and the workup, audit and justify buttons run it before their own analysis. It never drags the ICD codes along (they are their own call now), and its items feed the `SUGGESTED DDx` block of the codes, workup and justify user messages.

- `temperature`: 0.1 · `max_tokens`: Groq 3000 / GLM-flash 5000 / GLM-deep 6000
- System prompt = `DDX_SYSTEM` (below). No reference index; no candidate codes (the DDx items are short clinical phrases — the `ddxCodes` are validated against the official list exactly like every other code, invalid ones are rejected).
- User message = the clinical note only (lean by design — this call runs before everything, so it stays the cheapest).
- Every returned `ddxCodes` entry is validated against the official CMS ICD-10-CM FY2026 list before display (invalid codes are rejected, never shown as addable).
- **Gate:** when this step returns no differentials, the workup button shows "Suggested workup needs DDx items first" and sends nothing (update 1.3 rule, unchanged); the codes and justify calls still run grounded in the note alone.

### System prompt (verbatim)

```text
You are an Emergency Department clinical reasoning advisor. Given the de-identified ED clinical notes, derive the suggested differential diagnoses for this encounter.

DERIVATION RULES
1. When the note documents a working diagnosis / DDx (Assessment, Impression, DDx, working dx wording), list it first, then the plausible differentials for the documented presentation.
2. When the note documents NO working diagnosis, propose the most likely differentials from the documented complaint and HPI - clearly as proposals, never as established diagnoses.
3. Order by likelihood: working diagnosis / most likely first. Return 0-5 short clinical phrases (e.g. "Aortic dissection"), never sentences.
4. Derive differentials ONLY from what the notes document - never invent a finding, symptom, or risk to support a differential. "ddx" is empty only when nothing plausible can be proposed - never invent differentials.
5. Also return "ddxCodes": the best ICD-10-CM code for each differential, in the same order - one entry per differential, only standard billable codes, as specific as the differential itself supports. Return a code for EVERY differential, including when the note documents the working diagnosis (the first item). Use null for an entry only when no standard billable code plausibly fits that differential.

OUTPUT FORMAT - return ONLY a JSON object, no markdown fences, no prose:
{"ddx": ["working diagnosis first, then the differentials"], "ddxCodes": [{"code": "X##.#X", "description": "short official description", "confidence": 0-100, "in_list": true, "rationale": "one short sentence for the differential"}]}
"ddxCodes" carries one entry per differential (null when no billable code fits) - a null entry leaves that differential without a suggested code. If the text is not a clinical note, return {"ddx": [], "ddxCodes": []}.
```

### User message template

```text
CLINICAL NOTES:
{the pasted clinical note}
```

### Expected response format

```json
{"ddx": ["Acute STEMI - working diagnosis", "Aortic dissection"], "ddxCodes": [{"code": "I26.99", "description": "Other pulmonary embolism without acute cor pulmonale", "confidence": 40, "in_list": true, "rationale": "proposed differential — not documented as established"}]}
```

When the note documents the working diagnosis, `ddx` lists it first and `ddxCodes` is `[]` (the working diagnosis belongs in the codes step). When the note documents no DDx, `ddx` carries the proposed differentials and `ddxCodes` their best ICD codes — as specific as each differential itself supports. `parseDDxReply` (in the tool) tolerates fences and prose-wrapped JSON; a reply without a `ddx`/`ddxCodes` array is rejected as unparsable (with the same one-retry-on-truncation budget as every other call).

---

## 1. AI Assist — ICD-10 codes (update 1.4: built on the DDx step)

Triggered by the **AI Assist — ICD-10 codes** button or **Ctrl+Enter** in the Clinical Notes tab. If the selected-codes tray is not empty, the tool first asks whether to clear it or keep building on it (nothing is cleared silently). **DDx-first:** when the current note has no DDx items yet, the DDx step (⓪ above) runs first as step 1 of 2, then this call suggests the codes from the DDx + the note as step 2.

- `temperature`: 0.1 · `max_tokens`: Groq 4000 / GLM-flash 8000 / GLM-deep 9000
- System prompt = `AI_SYSTEM` (below). No reference index is appended.
- User message = the `SUGGESTED DDx` block FIRST (numbered, priority order, from the DDx step), then the clinical notes, then the candidate codes from the local ED coding engine (`[PREFERRED]` tags on the department's preferred-list candidates).
- The model's reply is parsed as JSON; every returned code is validated against the official CMS ICD-10-CM FY2026 list before display (invalid codes are rejected, never shown as addable).
- **Update 1.4 output change:** the codes reply is `{"codes": [...]}` ONLY — the DDx items and their codes live in the DDx step's reply, never here (a legacy reply that still carries `ddx`/`ddxCodes` is tolerated by the parser and simply ignored).
- **Update 0.8 UI behavior:** suggested codes that are symptom-only or unspecified (per the same specificity heuristic used across the tool) carry amber chips, plus a summary banner — "N of M suggested codes are symptom-only or unspecified"; if **all** suggestions are non-specific, the banner instead says the clinical notes may lack diagnostic detail.
- **Update 1.3 UI behavior:** the **Suggested DDx panel** renders with every DDx-step run (its own result section) — working diagnosis first, then the differentials; each item copies or adds to the clinical notes on its own (or all at once), and a differential with a suggested ICD code carries the code inline (click to copy, + adds to the tray).

### System prompt (verbatim)

```text
You are an expert ICD-10-CM clinical coder supporting an Emergency Department physician.
Given the de-identified ED clinical notes (with the suggested DDx already derived by the DDx suggestion step), select the most appropriate ICD-10-CM codes for this encounter.

WHAT A HIGH-QUALITY ED ICD-10-CM CODE LOOKS LIKE
- A documented definitive diagnosis beats a symptom code: for a note that documents acute STEMI, the high-quality answer is I21.3 - not R07.9 (chest pain, unspecified).
- The most specific documented subtype: capture acuity, laterality, site, severity, and with/without complications exactly as the note documents them. Never fall back to the ".9" unspecified variant when the note supports something better.
- A symptom or unspecified code is acceptable ONLY when the note genuinely establishes nothing more specific for that problem - do not upgrade it to an unconfirmed diagnosis.
- Every additional code must earn its place: a documented condition that influenced this encounter's management (complication, comorbidity, relevant PMH).
- Code exactly what is documented as established on this encounter - the best code is the specific one the note can actually defend in an audit.

CODING RULES
1. First-listed code = the main reason for this visit: the final working diagnosis when documented, otherwise the presenting complaint's symptom code.
2. Prefer the MOST SPECIFIC billable code the documentation supports. Avoid symptom-only R codes and "unspecified" codes when a definitive diagnosis is documented.
3. Add secondary codes only for conditions clinically relevant to this encounter (documented comorbidities / PMH are acceptable when they matter for management).
4. NEVER include: negated findings ("denies chest pain"), family history, ruled-out or suspected-but-unconfirmed diagnoses, or resolved remote problems.
5. PREFER codes from the candidate list provided (produced by the local validated ED code set). If a clearly better code exists outside the list, propose it and set "in_list": false.
6. SLIGHT PREFERENCE for candidates tagged [PREFERRED] — they are on the department's clinical-governance preferred diagnosis list. When a [PREFERRED] candidate is at least as specific and clinically appropriate as an untagged one, choose it. The tag never overrides accuracy or specificity: you may still choose a slightly different code — from the list or not — when it fits the documented note better. The list is a preference, not a mandate.
7. Only standard ICD-10-CM billable codes (no category headers, no ICD-9, no SNOMED).
8. If the note documents only symptoms with no working diagnosis, return the best symptom codes with honestly lower confidence - do NOT invent a diagnosis just to avoid a symptom code.
9. The SUGGESTED DDx block in the user message comes from the DDx suggestion step, which derived it from these same notes. Let it guide code selection - the working diagnosis / most likely differentials first when the note documents them - but never upgrade any code beyond what the note documents (rule 8): a differential that is only proposed never becomes an established diagnosis code.

OUTPUT FORMAT - return ONLY a JSON object, no markdown fences, no prose:
{"codes": [{"code": "X##.#X", "description": "short official description", "confidence": 0-100, "in_list": true, "rationale": "one short sentence citing the note"}]}
Return 3-8 codes, most important first. The DDx items and their codes come from the DDx suggestion step (a separate call) - do not return them here. If the text is not a clinical note, return {"codes": []}.
```

### User message template

```text
SUGGESTED DDx (from the DDx suggestion step - working diagnosis / most likely first - let it guide code selection, never beyond what the note documents):
1. {first DDx item — the working diagnosis when one is documented}
2. {second DDx item}
…

CLINICAL NOTES:
{the pasted clinical note}

CANDIDATE CODES from the local ED coding engine (prefer these when suitable for the DIAGNOSIS CODES only; those tagged [PREFERRED] are on the department's preferred diagnosis list - choose them when equally appropriate):
{code} - {description} [PREFERRED]
{code} - {description}
…   (up to 45 candidate codes produced by the offline engine; the [PREFERRED]
     tag is appended by the tool whenever the candidate is on the embedded
     department preferred list; the DDx block is omitted entirely when the
     DDx step returned no items)
```

### Expected response format

```json
{"codes": [{"code": "X##.#X", "description": "…", "confidence": 0-100, "in_list": true, "rationale": "…"}]}
```

The offline engine runs silently before this call (its own suggestions are not displayed) to produce the candidate list; the DDx block at the top comes from the DDx step's result for the same note. When the DDx step returned no differentials, the codes still run grounded in the note alone (no DDx block is appended).

---

## 2. Suggested workup — the suggested DDx + the clinical notes + the ED CPG (update 1.3; DDx step repointed 1.4; CPG cross-check added 1.4 part 2; doc + cpg_review contracts added 1.6)

Triggered by the **Suggested workup** button or **Alt+A**. The workup is **DDx-targeted** (update 1.3): it is drafted from the suggested DDx items **plus** the clinical notes, in that order. **Update 2.8 — the gate:** the button is DISABLED until **notes, DDX, ICD** has run and generated the DDx items for the current note (`wkDdxGate()` — any note edit stales the DDx and closes the gate); once open, the workup **reuses those DDx items with no DDx call of its own** (the token-saving change — the step-1-of-2 DDx fetch was deleted). The defensive guard inside `wkBtnRun` still answers a programmatic press with "Suggested workup needs the DDx items first — run notes, DDX, ICD". The result header states the basis ("based on the N suggested DDx items + the clinical notes (working diagnosis / most likely first)"). The selected-codes tray never feeds this call.

**Update 1.4 part 2 — the ED CPG cross-check.** The department's CPG (clinical governance) investigations are embedded in the tool (currently a clearly-marked placeholder dataset, `v1.0-seed`, built from `scripts/cpg_source.md` by `scripts/build_cpg.py` — replace the source with the CG's real CPG Markdown and re-run both builders). The CPG reaches this call twice:

- **In the prompt:** when a CPG section matches the DDx items or the note (keyword match with a negation guard — "denies chest pain" / "no fever" never switches a section on), the user message carries a `DEPARTMENT CPG` block listing that section's investigations, and rule 5 tells the model to include every one the DDx or the documented findings support, cited as `"ED CPG (clinical governance)"`.
- **Locally after the reply:** every suggested item that appears on an in-play CPG section (alias matching against the embedded dataset) carries a **★ CG** badge — whether the AI cited NICE / Tintinalli's / Rosen's / Harwood-Nuss' or the CPG itself — and the in-play CPG investigations no suggested item covers are **appended as extra cards** (marked ★ CG, guideline `ED CPG — clinical governance`). The suggested workup therefore also recommends the CPG file, and the cross-marking is guaranteed locally, not left to the model. Since update 1.6 an appended card the reply's `cpg_review` flags as **not justified by the DDx + the notes** carries a **⚠ needs supporting data** annotation: the other-guidelines comparison (from `also_in`), the **"Add supporting data like: …"** line with the concrete phrases that would have justified the test (from `supporting`), and the standing anti-faking rule. An appended card with **no** review entry (older models) gets the softer local note — "verify the supporting data before ordering" — and the tool never invents supporting data locally.

Every card is **orderable**: a click orders the investigation (click again to un-order), and the labs-reasoning box below the grid drafts its reason — with **Copy reasons** and **Add to clinical notes** buttons. Since update 1.6 that sentence is **written by the AI for this encounter**: the `doc` field each suggested item carries (rule 6), drafted from the DDx + the clinical notes in the established documentation phrasing ("X is done to exclude …" / "was sent to rule out …" / "was drawn as a baseline before …") with varied wording — no templated local assembly. The opener pools survive only as the **legacy fallback**: a reply without `doc` fields (older models) still drafts, from the CG's curated kind + reason target for CPG-appended cards and the AI's `reason` phrase otherwise; a flagged card ordered in the box carries the ⚠ **needs supporting data** marker on its row.

- `temperature`: 0.2 · `max_tokens`: Groq 4000 / GLM-flash 6000 / GLM-deep 7000
- System prompt = `WORKUP_SYSTEM` (below) + the REFERENCE INDEX block for the note.
- User message = the `SUGGESTED DDx` block FIRST (numbered, priority order), then the clinical notes, then the `DEPARTMENT CPG` block (only when a CPG section is in play).

### System prompt (verbatim, before the reference index is appended)

```text
You are an Emergency Department workup advisor.
You will receive: (1) the suggested DDx (working diagnosis first, then the differentials), (2) the de-identified ED clinical notes.

WORKUP RULES
1. Base the suggested workup on the suggested DDx provided in the user message AND the clinical notes (presenting complaints, symptoms, exam findings, documented assessment), in that order - order tests that evaluate, confirm, or risk-stratify those differentials, most likely first, as the documented findings support.
2. The suggested DDx comes from the DDx suggestion step, which derived it from these same notes. Target it, but ground every test in what the notes actually document: never invent findings, vitals, results, or differentials that are not written in the notes, and do not order extra tests for a differential that no documented finding supports.
3. Suggest only standard emergency-department tests for this presentation (labs, ECG, plain imaging, bedside tests) - no invasive procedures, no resuscitative interventions, no admission-only pathways.
4. In "guideline", name the real reference that supports the test when one genuinely applies: ACEP (the American College of Emergency Physicians - cite its clinical policies by topic, e.g. "ACEP clinical policy - Suspected Venous Thromboembolism"; never invent a policy ID, number or title), Tintinalli's Emergency Medicine (cite as "Tintinalli's ch. N - chapter title", with N taken ONLY from the Tintinalli REFERENCE INDEX chapters listed after these rules), Rosen's Emergency Medicine, or Harwood-Nuss' Clinical Practice of Emergency Medicine (cite as "Harwood-Nuss ch. N - chapter title", with N taken ONLY from the Harwood-Nuss REFERENCE INDEX chapters listed after these rules). If you cannot confidently name one, write "standard ED practice" - never invent a citation.
5. The user message may carry a DEPARTMENT CPG block: investigations the department's clinical-governance CPG recommends for this presentation. Include every CPG investigation that the suggested DDx or the documented findings support, and cite it in "guideline" as "ED CPG (clinical governance)" - never include one they do not support. The CPG never overrides rules 1-3: a CPG item still needs a documented basis, and a test the findings do not support stays out whatever the CPG says.
6. For EVERY suggested item also write "doc": the one-sentence clinical-documentation reason the physician would paste into the notes when the test is ordered - the form "what is done + what it aims to exclude, evaluate, confirm or screen for", e.g. "12-lead ECG is done to exclude ongoing ischaemia in the crushing chest pain." or "Electrolytes were sent to assess renal function before anticoagulation." Draft each "doc" from THIS encounter only: name the documented finding, symptom, risk or differential the test addresses, and vary the openers ("is done to exclude", "was sent to rule out", "is ordered to evaluate", "was drawn as a baseline before", "is performed to screen for" ...) so the sentences never read templated. Never invent a finding the notes do not document; when a test is aimed at a differential rather than a documented finding, say so (e.g. "...to evaluate the suggested pulmonary embolism"). No guideline names and no citations inside "doc" - plain clinical documentation only.
7. The DEPARTMENT CPG block may list investigations the suggested DDx and the documented findings do NOT support. For every such unsupported CPG investigation add one entry to "cpg_review": "item" (the CPG investigation name as written in the block), "also_in" (which of the other guidelines in use - ACEP, Tintinalli's, Rosen's, Harwood-Nuss' - genuinely recommend it for THIS presentation, or "none" when none of them do), "supporting" (a JSON array of 2-4 short clinical phrases - each ONE specific symptom, finding, risk or examination result that, had it been genuinely documented in the notes, would have justified this investigation), and "doc" (its documentation sentence, same rules as rule 6, phrased for the case where the physician orders it after verifying a real indication). Never put a supported CPG investigation in "cpg_review", and never word a supporting phrase as an instruction to document it as fact - the phrases describe what to VERIFY was genuinely asked, examined, or found.

OUTPUT FORMAT - return ONLY a JSON object, no markdown fences, no prose:
{"workup": [{"item": "test name", "type": "lab", "reason": "one short sentence", "doc": "the one-sentence clinical-documentation reason", "guideline": "reference or 'standard ED practice'"}], "cpg_review": [{"item": "CPG investigation the notes do not support", "also_in": "other guideline(s) or 'none'", "supporting": ["short phrase that would justify it"], "doc": "its documentation sentence"}]}
"type" values: lab | imaging | ecg | bedside. Return 3-8 workup items, most important first. "cpg_review": [] when the user message carries no DEPARTMENT CPG block or every listed CPG investigation is supported. If the text is not a clinical note, return {"workup": [], "cpg_review": []}.
```

### User message template

```text
SUGGESTED DDx (from the DDx suggestion step - working diagnosis / most likely first - the workup targets these differentials in this order):
1. {first DDx item — the working diagnosis when one is documented}
2. {second DDx item}
…

CLINICAL NOTES:
{the pasted clinical note}

DEPARTMENT CPG (clinical governance - investigations the ED CPG recommends for this presentation; include every one the suggested DDx or the documented findings support, cited as "ED CPG (clinical governance)"; never include one they do not support):
- {CPG section title}: {investigation} (to {exclude/screen for/evaluate/baseline before/confirm/monitor} {reason target}); {investigation} (…)
…   (the whole block is omitted when no CPG section matches the DDx items or the note)
```

(The DDx items come first — the workup targets them; the clinical notes follow and ground every test; the CPG block rides last and only when a section is in play. No selected-codes block is ever appended.)

### Expected response format

```json
{"workup": [{"item": "…", "type": "lab|imaging|ecg|bedside", "reason": "…", "doc": "the one-sentence clinical-documentation reason drafted for THIS encounter (what is done + what it aims to exclude / evaluate / confirm / screen for)", "guideline": "NICE CG95 / Tintinalli's ch. 53 / Rosen's ch. 26 / Harwood-Nuss ch. 6 - Chest Pain / 'standard ED practice' / 'ED CPG (clinical governance)'"}],
 "cpg_review": [{"item": "a CPG investigation the DDx + the notes do NOT support", "also_in": "the other guidelines in use that recommend it for THIS presentation, or 'none'", "supporting": ["one short phrase — a symptom / finding / risk / examination result that, had it been genuinely documented, would have justified the investigation", "…"], "doc": "its documentation sentence for the ordered case"}]   // [] when no CPG block is in play or every listed CPG investigation is supported
```

"Harwood-Nuss ch. N" citations are automatically rendered as links to the corresponding doctorlib.org chapter page in the workup cards. After the reply, the local cross-check adds the ★ CG badge to every item on an in-play CPG section and appends the missed CPG investigations as extra cards (guideline `ED CPG — clinical governance`) — since update 1.6 an appended card's ordering reason comes from its `cpg_review` doc when the review flags it (and it carries the needs-supporting-data annotation), otherwise the CG's curated kind + reason target serves as the fallback.

---

## 3. Workup justification — verdict + clinical-note draft + refs + gaps + gap_items (updates 0.7 → 1.5)

Triggered by the **Justify with AI Assist** button in the "Justify workup outside the suggested list" box. The suggested-workup half of the prompt is the **last Suggested-workup run for this note** (update 0.6); if workup has not been requested, that section reads "(no suggested workup has been requested for this note)" and every listed test is justified from the notes directly. **Update 1.4 — DDx-first:** when the current note has no DDx items yet, the DDx step runs first (step 1 of 2), then the justify call receives the `SUGGESTED DDx` block at the top of its user message (step 2). When the DDx step returns no differentials, the justification still runs from the documented findings alone.

- `temperature`: 0.2 (update 0.8: lowered from 0.4 for deterministic verdicts; the draft keeps its human tone from the prompt) · `max_tokens`: Groq 4000 / GLM-flash 4000 / GLM-deep 6000
- System prompt = `JUSTIFY_SYSTEM` (below) + the REFERENCE INDEX block for the note.
- Since update 0.7 the reply is multi-part: an advisory **verdict** — rendered in an amber box that is deliberately unselectable and carries no copy control, so it can never reach the patient record — and the **draft** — the justification itself, rendered as prose with a **Copy justification** button that copies the draft only. Update 0.9 added **refs**; update 1.4 added **gaps**; update 1.5 split the gap answer in two: **gaps** is now the advisory explanation and the new **gap_items** array carries the isolated indications.
- **Update 1.4 — the gap box / Update 1.5 — the split:** when at least one listed test is NOT justifiable from the available data (the DDx + the clinical notes), the reply's `gaps` field is non-empty and the tool renders a red **"Not justified by the available data — what could justify it"** box after the verdict — now **split in two** so the explanation can never travel into the record together with the indications:
  - **the explanation (the "first phase")** — the `gaps` prose (e.g. *"CT abdomen with contrast was ordered, but no documented indication is present in this note to justify its use per guideline recommendations"*): advisory only, `user-select: none`, **no Copy button, no Add-to-notes button** — it can never be copied and never be added to the clinical notes.
  - **the isolated indications** — the `gap_items` array: each entry renders as its own row with its own **Copy** and **Add to notes** buttons, so the physician can copy or add **every indication solitarily**, after verifying it was genuinely asked, examined, or found. Each row re-enables text selection; the toasts repeat the verify-first rule.
  The box ends with the fixed standing warning: **"Never fake a complaint, an examination finding, or a result to justify an investigation. If it was not genuinely asked, examined, or found, it must not be documented."** **Copy justification** and **Add to clinical notes** (the draft-level buttons) still act on the draft only — the explanation never enters either path. When every listed test is justifiable, `gaps` is `""` and no box appears.
  - **legacy fallback:** when a reply carries `gaps` but no `gap_items` (older models), the tool pulls the isolated indications out of the prose itself — bullet lines first, then "(e.g., a, b, c)" lists, then "the notes do not document a, b, c" clauses — so every indication still gets its own buttons; bullet lines are stripped from the displayed explanation.
- The CONSISTENCY block (update 0.8) and the CITE THE REFERENCE AS IT IS block (update 0.9) are unchanged in spirit; the agreement rule now extends to `gaps` / `gap_items` (non-empty / non-empty array only when the verdict flags a test as not justifiable, empty / `[]` when it does not), and the two-criteria test reads "the clinical notes - with the suggested DDx provided in the user message - document a finding, symptom, or risk…". The HONESTY section carries the anti-faking rule for both the gaps explanation and every gap item.
- **Update 1.1 — the draft is clinical-note phrasing:** the copyable draft is written exactly as it will be pasted into the patient's clinical notes — short clinical-documentation sentences of the form *"what was done + what it aims to exclude, evaluate or confirm"* (e.g. "Electrolytes are drawn to exclude …", "CRP done to exclude systemic infection or inflammation."), one short paragraph per test. **No textbook tone, no guideline names or IDs, no citations, no long explanations in the draft** — the record gets plain clinical documentation, while the reasoning and the references stay in the **verdict**, which keeps the textbook tone exactly as before. `refs` therefore lists only the references cited in the verdict (the draft carries none).
- **Update 0.9 UI (repointed 2.7):** an **Evidence links** box under the draft turns the citations into verified links so the physician can check them — ACEP citations link to ACEP's verified clinical-policies hub (`https://www.acep.org/patient-care/clinical-policies`; policies are cited by topic since 2.7, never an invented ID), "Harwood-Nuss ch. N" citations link to the doctorlib.org chapter page and — since 2.8 — "Tintinalli's ch. N" citations link to the book's official chapter-list page (`https://www.tintinalliem.com/references_9e.php`, the verified 304-chapter index). A book-level Tintinalli's cite and Rosen's are rendered as plain text (no verified public online source — the tool never guesses a URL). The links are display-only: **Copy justification** copies the draft without them, and **Add to clinical notes** appends the draft (never the verdict, never the gaps, never the links) to the clinical notes with a confirmation toast.

### System prompt (verbatim, before the reference index is appended)

```text
You are an Emergency Department clinical governance advisor. A physician ordered diagnostic tests that fall outside the workup suggested for their patient, and needs an honest, guideline-based justification to document.

You will receive: (1) the suggested DDx (working diagnosis first, then the differentials), (2) the clinical notes, (3) the suggested workup, (4) the tests that need justification.

CONSISTENCY - APPLY THE SAME TEST EVERY TIME (NON-NEGOTIABLE)
- A test is justifiable ONLY IF both hold: (a) the clinical notes - with the suggested DDx provided in the user message - document a finding, symptom, or risk that plausibly indicates the test, AND (b) the REFERENCE INDEX, ACEP, Tintinalli's, Rosen's, or standard ED practice supports ordering it for that indication. If either fails, the test is NOT justifiable - state that conclusion without hedging.
- Ground every claim in words that actually appear in the notes (e.g. the notes state "pleuritic pain, low pre-test probability"). The suggested DDx block is a proposal derived from the same notes - it may guide the gaps answer, but it is never evidence that a finding was documented. Never invent findings, vitals, results, or differentials that are not written in the notes; when no DDx items are provided, reason from the documented findings alone.
- Be deterministic: identical notes and identical tests must always receive the identical verdict. Never flip a test between justified and not justified across runs - apply the two criteria mechanically.
- The verdict and the draft MUST agree on every single test: a test justified in the verdict must be justified in the draft, and a test that is not justifiable must be stated as not justifiable in both parts - and "gaps" / "gap_items" must match them: gaps and gap_items only when at least one test is not justifiable, empty / [] when every test is justifiable.
- Cite chapter numbers ONLY from the REFERENCE INDEX after these rules. Never guess a chapter number, an ACEP policy number, or any guideline ID.

CITE THE REFERENCE AS IT IS (NON-NEGOTIABLE)
- Quote references exactly as they are named: "ACEP clinical policy - Topic" (the ACEP policy named by its topic, e.g. "ACEP clinical policy - Suspected Venous Thromboembolism" - never an invented policy ID, number or title), "Tintinalli's ch. N - Chapter Title" (the chapter number and title copied from the Tintinalli REFERENCE INDEX), "Rosen's Emergency Medicine", or "Harwood-Nuss ch. N - Chapter Title" with the chapter number and title copied from the Harwood-Nuss REFERENCE INDEX.
- Never reword, renumber, shorten, or combine references; never attach a chapter number to an ACEP clinical policy or a guideline ID to a textbook; never invent a page, table, study, or statistic.
- If a reference does not support the indication, say so plainly - a missing citation honestly stated beats a fabricated one.

HOW TO REPLY - exactly five parts, returned as ONE JSON object (no markdown fences, no text outside it):
{"verdict": "your advisory verdict", "draft": "the justification note", "refs": ["the references you cited, exactly as cited"], "gaps": "why the available data does not justify the test", "gap_items": ["the isolated indications that would justify it"]}

"verdict" - 2-4 candid sentences for the physician only, never pasted into the record: which of the listed tests are justifiable from the notes and guidelines, which are not, and any caveat worth flagging. This part keeps the textbook tone: where a genuine guideline or reference supports the conclusion, name it here - ACEP (its clinical policy, named by topic), Tintinalli's Emergency Medicine (cite "Tintinalli's ch. N - chapter title" using ONLY the chapters listed in the Tintinalli REFERENCE INDEX after these rules), Rosen's Emergency Medicine (chapter if known), or Harwood-Nuss' Clinical Practice of Emergency Medicine (cite "Harwood-Nuss ch. N - chapter title" using ONLY the chapter numbers listed in the Harwood-Nuss REFERENCE INDEX after these rules).
"draft" - the justification exactly as it will be pasted into the patient's clinical notes: short clinical-documentation sentences of the form "what was done + what it aims to exclude, evaluate or confirm", e.g. "Electrolytes are drawn to exclude ..." or "CRP done to exclude systemic infection or inflammation." One short paragraph per test (separate paragraphs with \n\n), one or two sentences each. NO textbook tone in the draft, NO guideline names or IDs, NO citations, NO long explanations - the record gets plain clinical documentation, while the reasoning and the references stay in the verdict.
"refs" - every reference you actually cited in the verdict (the draft carries none), one array entry each, named exactly as cited (e.g. ["ACEP clinical policy - Suspected Venous Thromboembolism", "Tintinalli's ch. 56 - Venous Thromboembolism Including Pulmonary Embolism"]). Empty array if you cited none.
"gaps" - only when at least one listed test is NOT justifiable from the notes: 2-3 candid sentences for the physician, explaining THAT the investigation is not justified by the available data and why - e.g. "CT abdomen with contrast was ordered, but no documented indication is present in this note to justify its use per guideline recommendations" - naming the test and what kind of indication is missing, WITHOUT enumerating the specific indications (those go in gap_items). Physician-facing, no citations. This explanation is advisory only - it never enters the clinical record. When every listed test is justifiable, return "gaps": "" (empty string).
"gap_items" - alongside a non-empty "gaps": the ISOLATED indications, a JSON array of 3-6 short clinical phrases, each ONE specific symptom, finding, risk, or examination result that, had it been genuinely documented, would have justified the investigation (e.g. ["abdominal pain", "abdominal tenderness on examination", "nausea or vomiting", "suspicion of abdominal aortic aneurysm"]). Each item is a short phrase of 2-8 words - never a full sentence, never an explanation, never a test name, never a diagnosis alone. The array is a checklist of what to VERIFY in the history, the examination and the DDx - each item is shown with its own copy and add-to-notes button, so keep every item independently meaningful on its own. When "gaps" is empty, return "gap_items": [].

HONESTY - NON-NEGOTIABLE
- Only cite a guideline you are confident actually recommends this. If you are not sure, say you cannot point to a specific guideline and give general emergency-medicine reasoning instead.
- If a test is not justifiable from the notes - say so plainly in BOTH parts: flag it in the verdict, and state in the draft that no guideline-based justification exists and the physician must document their own clinical reasoning.
- "gaps" and "gap_items" name what COULD have been documented to justify the test - a reminder to check whether that information was genuinely asked, examined, or found and simply not written down. They must never suggest faking a complaint, an examination finding, or a result to justify an investigation - if it was not genuinely asked, examined, or found, it must not be documented, and no gap item may be worded as an instruction to write it down as fact.
- NEVER invent evidence, statistics, studies, or guideline names. A missing justification honestly stated is a pass; a fabricated citation is a governance failure.
```

### User message template

```text
SUGGESTED DDx (from the DDx suggestion step - working diagnosis / most likely first):
1. {first DDx item — the working diagnosis when one is documented}
2. {second DDx item}
…   (omitted entirely when the DDx step returned no items)

CLINICAL NOTES:
{the pasted clinical note}

SUGGESTED WORKUP (from the AI assistant, derived from the suggested DDx and the clinical notes):
- {item} ({guideline})
- {item} ({guideline})
…   (or "(no suggested workup has been requested for this note)")

TESTS TO JUSTIFY (ordered by the physician, outside the suggested workup):
{whatever the physician typed into the justify box}
```

### Expected response format (updates 0.7 / 0.9 / 1.1 / 1.4)

```json
{"verdict": "2-4 candid advisory sentences for the physician (never copied; keeps the textbook tone and the references)", "draft": "the justification in clinical-note phrasing — one short documentation sentence per test ('Electrolytes are drawn to exclude ...'), paragraphs separated by \n\n, no citations", "refs": ["NICE NG158", "Tintinalli's Emergency Medicine"], "gaps": "when at least one test is not justifiable: the advisory explanation — why the available data does not justify the test (never copyable, never added to the notes) — empty string when every test is justifiable", "gap_items": ["when gaps is non-empty: the isolated indications — short phrases, each one a symptom / finding / risk / examination result that would have justified the test; each renders with its own Copy and Add-to-notes button — [] when every test is justifiable"]}
```

The parser (`parseJustifyReply`) also tolerates: markdown fences and prose-wrapped JSON; a `verdict:` / `draft:` marker layout if a model ignores the JSON contract; a missing `refs` field (the tool then scans the reply text for NICE IDs, "Harwood-Nuss ch. N", Tintinalli's and Rosen's mentions to build the evidence links); a missing or non-string `gaps` field (an array of sentences is joined with newlines; absent/empty = no gap box); a missing `gap_items` field (update 1.5: the isolated indications are then pulled out of the `gaps` prose — bullet lines, "(e.g., …)" lists, "do not document …" clauses — so every indication still gets its own Copy / Add-to-notes button; items are cleaned, deduped and capped at 8); and legacy free-prose replies (the whole reply is shown as the draft, no verdict box, no gap box). The **Copy justification** button always copies the draft only, and **Add to clinical notes** always appends the draft only — the verdict box and the gap **explanation** are unselectable (`user-select: none`) and the evidence links never enter either one; inside the gap box only the isolated indication rows are selectable and actionable, one indication at a time.

---

## 4. Audit note — local deterministic check (update 1.0; 1.1 fuzzy tolerance; 1.4 non-verbatim dispositions)

**Audit clinical notes** (Notes tab, also **Alt+A**) is live. It is deliberately **not an AI call**: it is a local, deterministic, offline check — identical notes always get the identical audit, the note text never leaves the machine, and the result is instant. (There is therefore no prompt to document verbatim on this page; the rules live in `auditNote()` inside the tool.) The **Audit all** button that update 1.1 shipped was **removed in 1.4**: every button now runs the DDx step itself (the audit button still runs its local checks instantly, then refreshes the suggested DDx through the DDx step when the note has none yet).

It checks whether the note documents each of these items — an item counts as documented when its label or a common wording appears anywhere in the note (lenient by design). **Fuzzy tolerance (update 1.1):** the abbreviations physicians actually write — **C/O, Co, PMHx, PSHx, "opd fu"** — are all accepted, and a minor **spelling or grammar slip never fails an item**: keywords of 5+ letters also match any note word within one edit (insert, delete, substitution or adjacent transposition — `auditWordNear`, the same Damerau-Levenshtein idea as the search boxes). Short abbreviations (co, CC, PMH…) stay exact-match only, so they can never fire on unrelated short words. **Non-verbatim disposition plans (update 1.4):** the Disposition item also accepts the plans physicians actually write — "the patient **is for OPD**", "**for admission**", "**for discharge**", "**for home**", "referred/sent **to OPD**", "**OPD clinic / appointment / referral / review**", "**transferred / referred / shifted to ward / ICU / CCU / HDU**", and "**kept (in ED) for observation**" all count as a documented disposition (a ward/ICU transfer also counts as admission for the sick-leave exemption).

| Item | Critical | Accepted wording (examples) |
|---|---|---|
| Complaints | **yes — red flag when missing** | c/o, Co, chief complaint, complaint(s), complains/complaining of, CC: |
| HPI | no | HPI, history of present illness |
| PMH / PSH | **yes — red flag when missing** | PMH, PMHx, past medical history, PSH, PSHx, past surgical history (either label documents the field; the card explains which of the two was found) |
| Vitals | no | vitals label, or numeric signs (BP 120/80, HR 88, 120/80) |
| Local examination | no | local exam(ination), on examination, on exam, physical exam, examination of … |
| Working diagnosis / DDx | no | working dx / diagnosis, DDx, differentials, impression, assessment (same heuristic as the workup basis) |
| ER course | no (parent) | ER course label, or any of its three sub-items |
| — ED medications | sub-item | "ED medications given" counts as a wording without more detail; meds/medications given/administered; given in the ER/ED |
| — Ix done | sub-item | general wording accepted: labs, bloods, rads, x-ray/XR, imaging, ECG, CXR, cultures, investigations, Ix |
| — Consultation | sub-item | consult / consulted / consultation done (any form) |
| Disposition | **yes — red flag when missing** | disposition, discharge(d), admitted/admission, DAMA, LAMA, opd fu / opd fup / OPD follow-up / follow-up … OPD, went home, sent home, died / dead / death / expired / passed away — **and (update 1.4) the non-verbatim plans**: "is/was for OPD / for admission / for discharge / for home", "for OPD", "to / in / at OPD", "OPD clinic / appointment / referral / review", "referred / transferred / shifted / moved to ward / ICU / CCU / HDU", "kept / observed / monitored (in ED) for observation" |
| Sick leave | **yes — red flag when missing, unless DAMA / admission / death** (update 1.1) | sick leave, sick note, medical leave/certificate, off work, work excuse — **mandatory whether needed or not**; when the disposition is DAMA, admission or death (a ward/ICU transfer counts, update 1.4) the item shows a green "not required" chip instead |

**Red flags:** when Complaints, PMH/PSH or Disposition is missing — or Sick leave is missing **and** the disposition is not DAMA / admission / death — the audit shows a red banner naming the missing critical fields, and the offending cards turn red with a "MISSING — critical" chip. Warnings are soft: nothing is ever blocked and the coding physician remains responsible for the note. (LAMA is *not* an exemption: a patient who leaves against medical advice still needs their sick-leave status documented.)

**Future:** a later pass will make the checks tighter (per governance). The lenient behaviour is recorded in the template comments, `auditNote()`, and the regression tests (`scripts/test_update10_unit.mjs`, `scripts/test_update11_unit.mjs`).

---

## 4. Note audit — the AI auditor (update 2.1)

The **Audit clinical notes** button runs the offline rules (local, instant, deterministic — identical notes always get the identical audit) and **then** an AI auditor pass on the configured endpoint. The system prompt:

```text
You are an Emergency Department clinical-documentation auditor.
You will receive: the de-identified ED clinical notes.

AUDIT RULES
1. Judge these nine documentation essentials, in this order, using these item names: Complaints, HPI, PMH / PSH, Vitals, Local examination, Working diagnosis / DDx, ER course, Disposition, Sick leave.
2. For each item return "status": "present" (documented in the note), "missing" (not documented), "wrong" (present but clinically wrong or incomplete - e.g. a sick-leave line with no duration when one is needed, or a disposition that contradicts the rest), or "not required" (only Sick leave: the disposition is DAMA, admission, death or a ward / ICU / CCU / HDU transfer, so no sick-leave line is needed).
3. Judge like an experienced ED physician reading the note: fuzzy abbreviations (C/O, PMHx, "opd fu"), non-verbatim disposition plans ("the patient is for OPD", "transferred to ward", "kept for observation") and minor spelling slips count as present. A generic wording can pass an item - flag "missing" only when the note genuinely lacks it. Never invent text the note does not contain.
4. "ER course": count it "present" when the note documents any part of the emergency course, even in general wording - investigations (labs, bloods, Ix, rads, imaging, x-ray, ECG; with or without results, and without an "ER course" heading), ED medications given, or a consultation in any form (e.g. "consulted surgery", "ortho review"). Flag it "missing" only when none of these appears anywhere in the note.
5. For every item also return "found": the exact substring from the note that justifies "present" (empty string otherwise), and "remark": one short sentence (max 120 characters) written only for "missing" / "wrong" items - what to add, phrased as documentation guidance; never as an instruction to fabricate a finding.

OUTPUT FORMAT - return ONLY a JSON object, no markdown fences, no prose:
{"audit": [{"item": "Complaints", "status": "present", "found": "exact substring or empty", "remark": "one short sentence"}]}
Return one entry for EVERY one of the nine items, in the rule-1 order, with those item names. If the text is not a clinical note, return {"audit": []}.
```

The user message is just the note:

```text
CLINICAL NOTES:
<the de-identified ED clinical note text>
```

After the reply, `parseAuditReply` (tolerant of fences and prose wrappers, like every other parser) maps the items onto the nine local labels via a normalized key + alias table. It is **strict on completeness**: a reply that does not cover all nine items is treated as unusable — the offline view stands and a notice is appended (a partial reply must never silently pass items the offline audit flags). `mergeAuditView` then renders every card with **both verdicts** — offline in teal, AI in purple — while the **display verdict follows the AI auditor alone**: items flagged by both, or by the AI auditor alone, are shown as missing (banner, chips, counts, Insert-missing-headings); items flagged only by the offline auditor are **skipped** as findings but their offline marks stay visible. An edit after a merged audit re-renders the offline view (the AI verdicts are stale) with a "press Audit clinical notes again" hint.

## Customizing

1. **Edit a single copy of the tool** — open `ed-code-assist.html` in any text editor, find `const DDX_SYSTEM = [`, `const AI_SYSTEM = [`, `const WORKUP_SYSTEM = [`, `const JUSTIFY_SYSTEM = [` or `const AUDIT_SYSTEM = [`, edit the lines (each line is a JS string; keep the quoting/escaping intact), save. Done.
2. **Edit the build pipeline** — change `scripts/ed_code_assist_template.html` the same way and rebuild with `python3 scripts/build_ed_code_assist.py` (re-embeds the CMS FY2026 data set + the Harwood-Nuss chapter index + the department preferred list).
3. **Keep the contract intact** — the audit prompt (update 2.1) must return the `{"audit": [{"item", "status", "found", "remark"}]}` object with **all nine items** in the rule-1 order (an incomplete reply is treated as unusable — the offline view stands); the DDx prompt must return the `{"ddx": [...], "ddxCodes": [...]}` object; the codes prompt the `{"codes": [...]}` shape (a legacy reply that still carries `ddx`/`ddxCodes` is tolerated and ignored); the workup prompt the `{"workup": [...]}` shape. The justification prompt must return the `{"verdict": "...", "draft": "...", "refs": [...], "gaps": "...", "gap_items": [...]}` object — the **verdict** keeps the textbook tone and the references, the **draft** is clinical-note phrasing with no citations (update 1.1), `refs` is optional (the tool falls back to scanning the text), `gaps` is optional (a string or an array of sentences; absent/empty = no gap box), and `gap_items` is optional since update 1.5 (an array of short indication phrases; when absent, the tool extracts the indications from the `gaps` prose). A free-prose reply still renders, but only as the draft (the physician loses the advisory verdict part, the gap box, and the reliable evidence links).
4. **Guideline scope** — accepted references are ACEP (cited by clinical-policy topic, never an invented policy ID — since 2.7), Tintinalli's Emergency Medicine, Rosen's Emergency Medicine, and Harwood-Nuss' Clinical Practice of Emergency Medicine (6th ed., with real chapter numbers from the embedded index). To add another reference, add it to the guideline lists in the workup and justify prompts and to the UI hint texts (workup header, justify box subtitle, footer), and — if it is a chaptered book — extend the reference-index mechanism.
5. **Evidence links** — links are built only from `citationLink()`'s verified sources: the ACEP clinical-policies hub (`https://www.acep.org/patient-care/clinical-policies` — one stable landing page for every ACEP citation since 2.7) and Harwood-Nuss chapters (doctorlib.org, page N+1). **The doctorlib.org source is used for Harwood-Nuss only** — it is not a source for any other reference; Tintinalli's and Rosen's deliberately render as plain text. To link another reference you must first verify a real public URL for it — never guess.
6. **The preferred list** — edit `scripts/preferred_list_source.md` (keep one diagnosis per row, ` / `-separated alternatives, hyphenated ranges), then run `python3 scripts/build_preferred.py && python3 scripts/build_ed_code_assist.py`. The star icons, the "preferred list" chips, and the `[PREFERRED]` candidate tags all update together.
7. **Harwood-Nuss bridges** — the `HN_EXTRA` array in the template maps note wording to chapter numbers (e.g. `[/pulmonary embolism|\bpe\b/, 79]`). Add or correct entries there; the build **fails loudly** if a referenced chapter number does not exist in the book.

*Update 1.4 — see LOGIC.md (shipped alongside) for the full page-logic diagram.*
