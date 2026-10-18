# ED Code Assist — ICD-10-CM Clinical Coding Helper

**Files:** `ed-code-assist.html` (the tool) + `ai_gateway.py` (optional AI relay)
+ `PROMPT.md` (every AI prompt, verbatim).

The HTML is a single, offline file. Open it in any modern browser (double-click,
USB stick, hospital share). No installation needed. The Diagnosis and Complaint
tabs run 100% offline — nothing leaves the machine. The Clinical Notes tab uses
AI Assist (internet required): the note is sent to the admin-configured endpoint
(**Groq by default** — free tier, called directly from the browser).

> **Deployed site:** the same tool is served by the bundled Next.js project
> (root route redirects to `/ed-code-assist.html`). Everything below applies
> identically — the file is the app.

## What it does

Three ED workflows in one screen:

1. **Diagnosis tab** — type any diagnosis ("gastroenteritis", "STEMI", "ankle
   sprain"). Fuzzy search over the **ED-relevant subset of the official FY2026
   code set (37,941 billable codes)**, ranked by match + ED frequency. Patient
   language works too: "heart attack" → I21.x, "sob" → R06.x.
2. **Presenting Complaint tab** — type one or several complaints separated by
   commas ("chest pain, shortness of breath, fever"). **Typo-tolerant since
   update 0.3**: "chset pain", "shortnes of breath", "hedache" still find the
   right card (Damerau-Levenshtein fuzzy matching). One card per complaint:
   column 1 = the appropriate symptom ICD-10 code; column 2 = differentials
   (red = not-to-miss) so you can pick a more specific code when justified.
3. **Clinical Notes tab** (update 0.4; the **default tab since update 1.4**) —
   paste free-text notes and press **Ctrl+Enter**. **Every AI feature runs the
   DDx step first** (update 1.4): a dedicated call derives the **Suggested DDx**
   (working diagnosis first, then the differentials), and the ICD-10 codes,
   the workup and the justification of investigations all build on it — their
   user messages carry the DDx items before the clinical notes, and none of
   them runs before the DDx exists. The codes come back validated against the
   official FY2026 list; every suggested code on the
   department's **ED preferred diagnosis list** (clinical governance v2.0 —
   update 0.9) carries a **★ star** — tap it for the detail; the AI gives
   those codes a slight preference but may deviate slightly when the note
   fits better (a code off the list shows no star — update 1.2 removed the
   hollow ☆ because it read like a rating). **When the notes carry no DDx**
   (update 1.0), the AI's proposed differentials appear as a **ready-to-copy
   human phrase** ("DDx / working diagnosis: …") — since update 1.3 each
   differential is its own row with **+ Notes** buttons (or all of
   them at once), carrying its **suggested ICD code inline** — and since
   update 2.6 every differential carries its code (a working diagnosis
   documented in the note included); the **+** on either row adds that code
   to the selected codes. Code them even
   before writing the DDx into the notes. **Suggested workup** (Alt+W) is
   **DDx-targeted** (update 1.3): the DDx step runs first when the current
   note has no DDx items yet, then the workup is built from those DDx items
   **plus the clinical notes** — and it never runs without DDx items — with
   each
   workup item referencing **ACEP / Tintinalli's / Rosen's / Harwood-Nuss'
   Clinical Practice of Emergency Medicine** where a reference genuinely
   applies (update 0.5 — Harwood-Nuss chapter citations are real chapter
   numbers, picked from an embedded 383-chapter index, and link straight to
   the referenced chapter on doctorlib.org — that source is used for
   Harwood-Nuss only). Since update 1.4 (part 2) the workup is also
   **cross-checked against the ED CPG** (clinical governance): investigations
   on the CPG carry a **★ CG** badge — including items suggested by the other
   guidelines — and the in-play CPG investigations the other guidelines
   missed are **added as cards** and marked the same way, so the suggested
   workup also recommends the CPG file. Every card is **orderable**:
   **clicking a card orders the investigation** (click again to un-order),
   and the reason drafted in the **labs-reasoning box** below is **written
   by the AI for this encounter** (update 1.6 — from the DDx + the notes, in
   “X is done to exclude …” documentation phrasing with varied wording),
   with **Copy** and **Add to clinical notes** buttons. CPG items the current
   notes do **not** justify are compared against the other guidelines in use
   and carry a **⚠ needs supporting data** note — “add supporting data
   like …” with the details that would make the test justified, added only
   if genuinely asked, examined, or found (update 1.6). Ordered
   something outside the
   suggested workup? The **Justify** box (update 0.7; DDx-first since update
   1.4) replies in parts: a candid **verdict** on each test — advisory only,
   deliberately not copyable, and it keeps the textbook tone and the
   references — and a
   justification **draft** written in **clinical-note phrasing** (update 1.1):
   short documentation sentences — “Electrolytes are drawn to exclude …”,
   “CRP done to exclude systemic infection or inflammation” — that you can
   paste straight into the notes or append with one click, with no textbook
   prose or citations in the record. It tells you
   plainly when no guideline-based justification exists (no fabricated
   evidence — update 0.8/0.9 harden the prompt against invented citations,
   reworded references, and unstable verdicts, and **evidence links** under
   the draft let you verify each citation — the verified ACEP clinical-policies page and
   Harwood-Nuss chapters only, never a guessed URL — while staying out of
   the copied text). **When the investigation is not justified by the
   available data** (the DDx + the clinical notes), a red **gap box** appears
   — **split in two since update 1.5**: the explanation ("X was ordered, but
   no documented indication … per guideline recommendations") is advisory
   only — not selectable, no buttons — so it can never be copied or pasted
   into the clinical notes, while the **isolated indications** that would
   have justified the investigation render underneath, **each with its own
   Copy and Add-to-notes button** so every indication is handled on its own,
   ending with the standing warning to **never fake a complaint, an
   examination finding, or a result**. A summary
   banner warns when AI-suggested codes are
   symptom-only or unspecified and points at the fix — add the working
   diagnosis / DDx to the clinical notes (update 0.8/0.9). **Audit clinical
   notes** (update 1.0, Alt+A) checks the note offline for the
   clinical-documentation essentials — complaints (c/o, Co accepted), HPI,
   PMH/PSH (PMHx / PSHx accepted), vitals, local examination, working
   diagnosis / DDx, ER course (ED
   medications, Ix done, consultation), disposition (OPD follow-up /
   admission / normal / DAMA / LAMA / died — accepts "opd fu", and since
   update 1.4 the non-verbatim plans: "the patient is for OPD", "for
   admission", "transferred to ward", "kept for observation") and sick
   leave — and flags the
   critical fields (complaints, PMH/PSH, disposition, and sick leave unless
   the disposition is DAMA / admission / death) when they are missing, in
   neutral wording.

   **Update 2.8** — token saving, a focused keyboard map, and Tintinalli's indexed: **Suggested workup** now stays disabled until **notes, DDX, ICD** has generated the DDx items for the note — it then drafts from those DDx items + the clinical notes with **no extra DDx call**; **only Audit notes** (renamed) audits the notes alone (the offline checks + AI auditor exactly as before, no DDx refresh) and clicking it **jumps to the audit section**. The keyboard map is now **Alt+Q** codes · **Alt+A** workup · **Alt+Y** AI justify · **Alt+N** new patient (each shown on the button hover; Ctrl+Enter and Alt+W retired). **Tintinalli's** joined Harwood-Nuss' as an **indexed** reference: the workup and justification prompts carry a verified chapter index of the **9th edition** (304 chapters, from the book's official chapter list on tintinalliem.com) and cite it chapter-by-chapter — every Tintinalli chapter citation links to the official chapter-list page, so a chapter number is never invented.
   **Update 2.7** — the guideline references now run on **ACEP** (the American College of Emergency Physicians) instead of NICE: the workup and justification prompts cite ACEP clinical policies **by topic** — never an invented policy ID — and every ACEP citation links to ACEP's verified clinical-policies page so each citation can be checked. Tintinalli's, Rosen's, Harwood-Nuss' and the department CPG are unchanged.

   **Update 2.6** — the **+** reaches **every** differential in **DDx-based ICD**: the DDx step now returns a suggested ICD code for each differential in every case — including when the note documents the working diagnosis (until 2.6 those differentials carried no code, so no **+** appeared at all). A differential whose code fails validation (or that the AI leaves without one) shows no **+** — it can never pick up a neighbouring differential's code; the **+ Notes** buttons are untouched.

   **Update 2.5** — in **DDx-based ICD**, every differential with a
   suggested code now carries its own **+** on the diagnosis row — one click
   adds that differential's code to the selected codes (the code row keeps
   its own +). In **Clinical-Based ICD**, the coding rationale moved onto
   the **code hover** — hover a code to read why it was suggested; the
   listing stays lean. The codes button is now **notes, DDX, ICD**. The
   **Clinical notes audit** section gained the same **Expand / Collapse**
   pair at its top and bottom.

   **Update 2.4** — the **ICD-10 dashboard** folds: an **Expand / Collapse**
   pair beside the title and the same pair again at the end of the section,
   so it collapses without scrolling back up (either pair works; jumping to
   a subsection re-expands it). Adding differentials **one by one** now
   reads like a doctor writes: when the note already carries a DDx
   statement — its own line or mid-paragraph — **+ Notes** extends it with
   ", + differential" instead of opening another line. The codes button was
   renamed (see 2.5 — **notes, DDX, ICD**). The clinical-notes **left
   panel** entry **Audit** became **Clinical Note** — the shortcuts stay,
   and after an **AI audit** the entry shows the score (e.g. **6/9**); the
   offline audit shows no score.

   **Update 2.3** — the DDx and the ICD code sections merged into one
   unified **ICD-10 dashboard** with two subsections: **DDx-based ICD**
   first (the suggested DDx and their codes — the copy buttons were
   deleted; **+ Notes** and **+** stay, and the two **Add all** buttons
   moved to the top), **Clinical-Based ICD** second (the codes suggested
   from the clinical note itself, unchanged). Every ICD code now keeps
   its buttons on its own row. The **live note-audit pill** was deleted
   (a better indicator will come later). The AI auditor now counts the
   **ER course** as documented when investigations appear in general
   wording (labs / bloods / Ix / rads / imaging — with or without
   results), ED medications are given, or a consultation is documented.

   **Update 2.2** — the audit list is decluttered: the items the auditors
   **agree** are documented collapse into one **✓ N documented** line
   (click to expand and re-check their evidence), while the **wrong** and
   the **controversial** items (the auditors disagree) stay expanded —
   every offline disagreement remains visible as a teal mark. Every
   section's long how-it-works prose moved behind a small **ⓘ icon**
   (the workflow line, the button-bar note, the DDx / codes / workup /
   ordered-reasons / justification footers and the audit rules — collapsed
   by default, one click to read, text unchanged). **New Patient** (and
   **Clear note & results**) now also clears the **Justify workup** box —
   the ordered-tests list dies with its encounter.

   **Update 2.1** — the note audit became a **dual-auditor** view: the
   offline checks render instantly and an **AI auditor pass** runs on the
   endpoint; every card carries both verdicts (offline teal, AI purple), and
   what is *shown* follows the AI auditor — items flagged by both, or by the
   AI auditor alone; items flagged only by the offline auditor are skipped.
   The sick-leave item now recognizes the duration wording ("Sick leave :
   48 hrs" → "duration: 48 hrs"). The **top panel is one row** (the
   code-helper subtitle deleted; a **New Patient** button clears the note,
   every result and the tray — undo for the codes); the Clinical Notes tab
   gained a **left panel** for moving between its subsections (icons + keys
   **1-6**); **Keyboard shortcuts** moved into **Quick start & tips**; the
   tray's clear button is now **Delete codes**; the long **Data & build**
   statement sits behind an expandable footer button; the justify
   how-it-works prose and the audit footnote stowed behind ⓘ toggles.

   **Update 1.6** — the suggested workup grew an honest layer for the CPG:
   every CPG-recommended investigation the current clinical notes do **not**
   justify is compared against the other guidelines in use (ACEP /
   Tintinalli's / Rosen's / Harwood-Nuss') and its card carries a **⚠ needs
   supporting data** note — "add supporting data like …" with the specific
   findings that would justify the test (from the AI's `cpg_review`), plus
   the standing rule that supporting data is added **only if genuinely
   asked, examined, or found** — never faked; appended CPG cards the review
   did not cover get the softer local "verify the supporting data" note (the
   tool never invents supporting data itself). The reason drafted when a
   card is ordered is now **written by the AI for this encounter** (the
   `doc` field — from the DDx + the notes, in the established "X is done to
   exclude …" style with varied wording) instead of assembled from fixed
   local phrase pools, which survive only as the fallback for replies
   without the field. The **Quick start & tips** guide and the **⚙ Admin**
   settings both moved into the **top panel**: the guide is a strip in the
   sticky header that drops down over the page, the admin button sits beside
   the tabs.

   **Update 1.5** — the gap box (investigation not justified by the available
   data) is now **split in two**: the explanation — the "first phase", e.g.
   *"Abdominal ultrasound was ordered, but no documented indication … is
   present to justify its use per guideline recommendations"* — is advisory
   only: not selectable, **no copy button, no add button**, so it can never
   be pasted or added into the clinical notes; the **isolated indications**
   (abdominal pain / abnormal abdominal exam / suspicion of AAA …) render as
   separate rows, **each with its own Copy and Add-to-notes button**, so the
   physician can copy or add **every indication solitarily** — after
   verifying it was genuinely asked, examined, or found. The anti-faking
   warning stays at the bottom of the box. Replies from models that do not
   return the indications as a structured list fall back to extracting them
   from the prose. New **colour theme setting** in the header: **Day**,
   **Sepia**, **Dark** and **Night** — saved per device, restored before
   first paint, with every colour in the file theme-aware (solid buttons keep
   their own dark fills so labels stay readable in all four themes).

   **Update 1.4** — the **DDx step became its own call that runs FIRST**: the
   ICD codes, the suggested workup and the justification of investigations
   all receive the DDx items in their user messages and none of them runs
   before the DDx exists (pressing any button first runs the DDx step — the
   codes button as step 1 of 2, the workup / audit / justify buttons through
   the shared DDx fetch). The justification grew the **gap box** described
   above. The **Clinical Notes tab is now the default tab**; the note audit
   accepts **non-verbatim disposition plans**; and the **Audit all button
   was removed** — every button runs the DDx step itself, so a chained
   sequence is no longer needed. **Part 2** adds the **ED CPG cross-check**
   (★ CG badges, missed-CPG items appended as cards — matching is local and
   negation-aware, and the CPG dataset is a clearly-marked placeholder until
   the CG's real CPG Markdown replaces `scripts/cpg_source.md`) and the
   **orderable cards + labs-reasoning box**: a click orders the investigation
   and drafts its reason with deliberately varied wording, ready to copy or
   append to the clinical notes. A **LOGIC.md** Mermaid diagram of the whole
   page logic now ships alongside (see the Files section).

   **Update 1.3** — the **Suggested DDx** became a first-class panel that every
   Notes-tab button keeps fresh: the DDx items (working diagnosis first, then
   the differentials, priority-ordered) come from the DDx suggestion step, and
   the **Suggested workup** button and the **Audit clinical notes** button (and,
   until update 1.4 removed it, Audit all) all run the DDx step automatically
   when the current note has no DDx items yet — you can press any button first
   and the DDx is always there. Each differential can be **copied** or **added
   to the clinical notes on its own** (a green "✓ in notes" badge appears once
   it is in the note), or all of them at once (**Copy all DDx** copies the human
   phrase "DDx / working diagnosis: …", **Add all DDx** appends it);
   differentials with suggested ICD codes carry them inline (click to copy, +
   adds to the tray, **Copy DDx codes** / **Add all DDx codes** act on the
   whole set). The suggested workup is now **DDx-targeted and gated**: it
   orders tests that evaluate, confirm or risk-stratify those differentials,
   grounded in the documented findings — and it **never runs without DDx
   items** (a note with no suggestible differentials gets a clear explanation
   instead of a workup; a dead endpoint produces one error, not three). The
   audit button still runs its audit locally and instantly, but its DDx
   refresh does send the note to the AI endpoint — the tooltips say so.

   **Update 1.2** — workflow and accessibility pass: a **live audit pill**
   beside the note re-audits as you type (local, nothing sent); every
   documented audit item shows **what actually matched** (found: "…") so you
   can judge presence checks yourself, and **Insert missing headings** drops
   the missing labels into the note for you to fill; a **results quick-nav**
   (Codes · Workup · Audit · Justify, with counts) appears once results exist;
   long AI calls can be **Cancelled** (and cancelling stops the remaining
   Audit-all steps) with all AI buttons locked against duplicate submissions
   while one runs; the **Selected codes tray** became an encounter list — it
   **survives a page reload** (sessionStorage: dies with the tab, so shared
   workstations keep nothing behind), **reorders for the coding sequence**
   (the first code is marked **1st** = principal diagnosis), every removal
   offers **Undo**, **New patient** clears it for the next encounter, and
   **Copy all** comes in **EMR formats** (codes + descriptions / one per line
   / comma-separated). Diagnosis rows now surface the ★ preferred-list badge
   while searching, matched search terms are highlighted, and a one-line
   header states the real match count. Esc closes dialogs first, blurs the
   search box before clearing it, and Enter only adds a highlighted code from
   the search box itself. Contrast, focus outlines, tap targets, aria
   roles/labels and 16px inputs were fixed throughout; the admin settings
   moved to a quiet footer link.

Soft, non-blocking specificity warnings (amber chips) flag symptom/unspecified
codes and offer one-click "more specific alternatives" — never a hard stop.

## Click-to-copy & keyboard shortcuts

Every suggested code copies on click — in the AI suggestions and in the
**Selected codes** tray — no detour through the tray needed (the copied code
flashes green). Workup cards no longer copy on click (update 1.4 part 2):
**a click orders the investigation** and drafts its reason in the
labs-reasoning box, whose **Copy reasons** button puts the drafted sentences
on the clipboard. **Copy all** honours the selected **EMR
format** (codes + descriptions / one per line / comma-separated) and
**Export CSV** (timestamp, code, description, source, specificity flags — for
governance audit) remains available. **Delete codes** clears the tray for the
next encounter with an Undo offer (renamed in 2.0 — the **New Patient**
button in the top panel now resets the whole encounter: note, results, the
justify box and the tray, undo offered for the codes — the undo restores
the codes only); the tray survives a page reload and dies
with the tab. Keyboard map (update 2.8 — each hint shows on the button hover):
**Alt+Q** suggest codes (notes, DDX, ICD) · **Alt+A** suggested workup
(enabled once the DDx exists) · **Alt+Y** run AI Justify · **Alt+N** new
patient (works on every tab) · **Alt+J** jump to the justify box · **Alt+C**
copy all suggested codes · **1-6** jump between the notes subsections (the
2.1 left panel — never while typing). Ctrl+Enter and Alt+W retired with the
old map; the audit button has no shortcut — its click navigates to the audit
section.
The full list lives in **Quick start & tips** in the top panel. Diagnosis
tab: **/** focus, **↑↓**
navigate, **Enter** add — Enter only adds while the search box is focused.
**Esc** closes any open dialog first, blurs the search box on the first press
and clears it on the second. **Cancel** stops a running AI request. The Clinical Notes tab opens by
   default (update 1.4); the URL hash keeps the last tab across refreshes and
   links.

## The ED code subset (update 0.1)

The full FY2026 billable list has 74,719 codes — over half of it is
follow-up/sequela injury variants and specialty detail an ED never codes. The
embedded set is the **ED-relevant half (37,941 codes, 50.8%)**:

- All medical chapters kept in full (infections, neoplasms, blood, endocrine,
  mental, neuro, circulatory, respiratory, digestive, skin, GU, congenital,
  symptoms R, perinatal, health-status Z) — ED bread-and-butter + PMH.
- Injury/poisoning (S/T): **initial-encounter codes only** (7th char A/B/C —
  including all poisoning intents and open-fracture types); subsequent and
  sequela variants dropped.
- Musculoskeletal/eye/ear/pregnancy: ED-relevant categories kept, specialty
  detail (cataract, strabismus, labor mechanics, chiropractic…) dropped.
- External causes (V/W/X/Y): falls, transport (pedestrian/cyclike/motorcycle/
  car), poisoning, self-harm, assault, undetermined intent, place/activity
  supplements kept; war/military/water-air-rail detail dropped.
- **Safety net:** every complaint symptom code, differential, quick pick and
  ED-priority code is force-kept.
- A compressed copy of the **full official 96,482-code list** stays embedded
  purely for validation (see AI Assist) — the zero-invented-codes guarantee
  holds for the complete code set, not just the subset.

To embed the full 74,719-code set instead: `ED_FILTER=0 python3
scripts/build_ed_code_assist.py`.

## The notes engine (offline, feeds the AI)

The offline matching engine still runs silently on every AI Assist call — its
validated candidates anchor the AI to the ED code set — but its own suggestion
list is no longer displayed (update 0.4 removed the offline suggestion UI from
the Notes tab). Tuned by reverse-engineering the market-leading free lookup
site and the official NLM search API (REA tool), it provides:

- **125 lay-term synonyms** — heart attack → myocardial infarction, stomach flu
  → gastroenteritis, passed out → syncope, kidney stone, pink eye, twisted
  ankle… (also applied to Diagnosis and Complaint search queries).
- **94 ED abbreviations** — STEMI, SOB, fx, lac, pna, SAH/SDH/ICH, RUQ/RLQ,
  vtach, pyelo, TCA/SSRI…
- **C/O complaint detection** — "c/o", "complains of", "presents with", "here
  for", "brought in with", "chief complaint:"… The captured phrase is matched
  to the curated complaint list; the complaint's symptom code is boosted and
  its differentials surface only when the note independently supports them.
  Detected complaints appear as teal chips so the physician sees exactly what
  the engine read.
- **Inclusion-term matching**, **negation detection** ("denies chest pain",
  "no SOB", "ruled out PE"), **family-history exclusion** ("father had MI"),
  **acuity ranking** (acute outranks "old MI" unless the note is historical),
  **pregnancy/perinatal gating**, **stemming**, **focused results**.

## AI Assist — Groq by default, NVIDIA optional (updates 0.9 / 1.0; default model 2.8)

The Notes tab uses a **two-step workflow** (update 0.6), each step a separate
on-demand call to the admin-configured OpenAI-compatible endpoint:

- **Groq (default)** — free-tier models, called **directly from the browser**
  (api.groq.com allows CORS — no server needed). Model picker in ⚙ Admin:
  `openai/gpt-oss-120b` (default since 2.8 — strong reasoning; the in-page
  truncation auto-retry already covers its reasoning tokens),
  `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`,
  `openai/gpt-oss-20b`, `moonshotai/kimi-k2-instruct`, `qwen/qwen3-32b`,
  Llama 4 Scout/Maverick, `deepseek-r1-distill-llama-70b`, or a custom id.
  Fresh devices and **Reset to built-in defaults** pick up the new default;
  a device with saved Admin settings keeps its saved model.
- **NVIDIA NIM — GLM 5.3** — deeper coder reasoning, but browsers cannot call
  it directly (CORS). Run the included gateway once and the tool auto-detects
  and uses it:

```
python3 ai_gateway.py            # opens http://localhost:8787/ automatically
```

The gateway (pure Python stdlib, ~150 lines) serves the tool itself at
`http://localhost:8787/` and relays `/v1/chat/completions` upstream with CORS
headers. It logs no request bodies (PHI-safe). For production, set
`NVIDIA_API_KEY=nvapi-xxxx` in its environment and distribute an HTML rebuilt
without the embedded pilot key — then the key never ships inside the HTML.

### What the AI returns (validated, no invented codes)

**Step 1 — notes, DDX, ICD** (the codes button — renamed in 2.5, the
   two-step behaviour unchanged; or `Ctrl+Enter`): suggests codes
from the pasted note. If the selected-codes tray already holds codes, the tool
**asks first** whether to clear it or keep building on it — nothing is cleared
silently. Every returned code is validated client-side against the
official CMS FY2026 list before display:

- code in the embedded ED set → "verified · official FY2026"
- code valid but outside the ED subset → "valid · outside ED set"
- anything else → rejected, shown crossed-out, never addable

Review the suggestions and click **+** to add the codes you keep to the
selected-codes tray.

**Update 1.0 / 1.3 / 1.4 / 2.3 — the DDx-based ICD subsection:** the reply's
differentials are rendered in the **DDx-based ICD** subsection of the unified
**ICD-10 dashboard** (update 2.3 merged the DDx and the codes sections into
one dashboard: DDx-based ICD first, **Clinical-Based ICD** — the codes
suggested from the note itself — second) — since update 1.3 it is fed by
**every** Notes-tab button, and update 1.4 made the DDx step a dedicated call
that runs first for all of them (the codes button, the workup button, the
audit button and the justify box all fetch it through `ensureDDx()`, so the
DDx panel is always fresh for the current note). The items are priority-ordered (working
diagnosis / most likely first, numbered) and each one is its own row with
**+ Notes** (appends "DDx: …" to the note — the button flips to a green
"✓ in notes" state once the text is in the note; since update 2.4, when
the note already carries a DDx statement — its own line or mid-paragraph —
the differential joins it as ", + dx" instead of opening a second line).
Since update 2.5 every differential with a suggested code also carries a
**+** on its diagnosis row — one click adds its code to the selected codes.
Since update 2.3 the copy
buttons are deleted (per-item Copy, the Copy-all and Copy-codes bulk buttons,
and the inline chip's click-to-copy) and the two bulk tools sit at the TOP of
the section: **Add all DDx to clinical notes** (the human phrase "DDx /
working diagnosis: …") and **Add all DDx codes** (when the note documents no
DDx). A differential with a suggested ICD code (the reply's `ddxCodes` array,
aligned by position) carries the **code inline** under it as plain text
(preferred-list star, specificity chip, **+** to tray — and every code keeps
its buttons on its own row), validated against the official FY2026 list
exactly the same way. The main `codes` are never upgraded beyond what the
note documents — the proposals live only in the DDx lane.

**Step 2 — Suggested workup** (button or `Alt+W`): **DDx-targeted** (update
1.3; DDx step repointed 1.4) — the DDx step runs first when the current note
has no DDx items yet (update 1.4: its own dedicated call, no longer the same
call as the codes), then the workup is built from
those **DDx items plus the clinical notes**, in that order. The workup
**never runs without DDx items**: a note from which no differentials can be
proposed gets a clear "needs DDx items first" explanation instead. The
selected-codes tray never feeds this call. Each item carries type (lab /
imaging / ecg / bedside), reason, and guideline reference (ACEP, Tintinalli's,
Rosen's, Harwood-Nuss', or "standard ED practice" — the prompt explicitly
forbids invented citations, and every test must be grounded in findings that
are actually written in the notes). "Harwood-
Nuss ch. N" citations are automatically linked to the referenced chapter
page (chapter N is page N+1 on doctorlib.org).

**The CPG cross-check and the orderable cards (update 1.4 part 2):** after
the reply, the tool cross-checks every suggested item against the embedded
**ED CPG** investigations (clinical governance) for the presentations in
play — matched locally, with a negation guard ("denies chest pain" never
switches a CPG section on). Items on the CPG carry the **★ CG** badge
(tap it: which CPG section, and whether the other guidelines suggested it
too); in-play CPG investigations no suggested item covers are **appended as
extra ★ CG cards** (guideline "ED CPG — clinical governance"), so the workup
also recommends the CPG file. Since update 1.6 an appended CPG card the
reply's `cpg_review` flags as **not justified by the DDx + the notes**
carries the **⚠ needs supporting data** annotation: the other-guidelines
comparison (is it in ACEP / Tintinalli's / Rosen's / Harwood-Nuss' for
this presentation, or only on the CPG?), the **"Add supporting data like:
…"** line with the concrete phrases that would have justified the test, and
the anti-faking rule — the phrases name what to **verify**, never what to
invent; a card with no review entry (older models) gets the softer local
"verify the supporting data" note. **Clicking a card orders the
investigation** (click again to un-order; the ✕ in the box un-orders too)
and drafts one reason sentence in the **labs-reasoning box** — since update
1.6 the AI's **`doc` sentence verbatim, written for THIS encounter from the
DDx + the clinical notes** ("X is done to exclude …" documentation phrasing,
varied wording) — plus **Copy reasons** (one sentence per line) and **Add to
clinical notes** (appends under "Ix reasons:"); a flagged card's ordered row
carries the ⚠ marker. Replies without `doc` fields (older models) fall back
to the CG's curated kind + reason target for CPG-appended cards and the
local opener pools otherwise. Orders live per note and survive a workup
re-run for the same note; the box carries the standing reminder to order
only what you genuinely requested.

Re-run the workup any time — the header records the basis ("based on the N
suggested DDx items + the clinical notes (working diagnosis / most likely
first)") plus the CPG counts ("X of Y on the ED CPG (★ CG) · Z added from
the CPG · K need supporting data" — and the header names the AI-drafted
reason since 1.6).

### Suggested-code specificity warnings (updates 0.8 / 0.9)

Every AI-suggested code that is symptom-only (R chapter) or "unspecified"
carries an amber chip, and a summary banner sits above the suggestions:

- **Some** codes non-specific — "N of M suggested codes are symptom-only or
  unspecified — prefer a more specific code when the documentation supports
  it…" plus, since update 0.9, the fix: "Adding the working diagnosis / DDx
  to the clinical notes helps the AI suggest more specific codes."
- **All** codes non-specific — the banner states the clinical notes may lack
  diagnostic detail and spells out the improvement: add the working diagnosis
  / DDx, exam findings, and lab or imaging results, then run AI Assist again
  for specific, billable diagnosis codes.
- The **Suggested DDx panel** (updates 0.9 → 1.3) shows the differentials the
  AI actually weighed — the working diagnosis first, one row each — making
  the reasoning behind the codes visible and giving the workup its targets.

The coding prompt itself (see `PROMPT.md`) describes what a high-quality ED
ICD-10 code looks like and forbids inventing diagnoses for symptom-only
notes.

### The ED preferred diagnosis list (update 0.9)

The department's **ER ICD-10 Preferred Diagnosis List** (clinical governance
working copy v2.0 — 401 rows, 449 codes + 3 section ranges) is embedded in
the tool:

- Every AI-suggested code carries a **★ (gold) / ☆ (grey) star**: on the
  preferred list or not. Hover a star for detail; the suggestions header
  carries the keymap; on-list rows also get a "preferred list" chip.
- Candidates sent to the AI that are on the list are tagged `[PREFERRED]`,
  and the coding prompt asks for a **slight preference** for them — a
  preference, never a mandate (the model may still deviate slightly when the
  note fits better).
- The star is always computed by the tool from the embedded list — never
  trusted to the model.

### only Audit notes (update 2.8: renamed from "Audit clinical notes", no DDx call, the click navigates to the audit section; update 2.3: the AI auditor counts the ER course on general-wording labs / rads or a consultation, and the live pill was deleted; update 2.2: documented items collapsed by default; 2.1: offline instantly + the AI auditor) — merged, AI-verdict-filtered

**Audit clinical notes** (button or **Alt+A**) checks whether the pasted note
documents each of the clinical-documentation essentials. The offline part remains a local deterministic check — identical notes
always get the identical audit, instant, working fully offline. Since
**update 2.1** the button also runs an **AI auditor pass** on the configured
endpoint, and the merged view follows the **AI auditor**: every card carries
**both verdicts** (offline in teal, AI in purple), and an item is shown as
missing only when the AI auditor flags it — by both auditors, or by the AI
auditor alone; items flagged **only by the offline auditor are skipped**
(the AI auditor proved the more reliable of the two). When the endpoint is
unavailable the offline view stands with a notice; an edit after a merged
audit re-renders the offline view with a stale hint. The sick-leave item
recognizes the duration wording ("Sick leave : 48 hrs" → the detail shows
"duration: 48 hrs"; a duration-less line shows "no duration stated").
Since **update 2.2** the list is decluttered: the items the auditors
**agree** are documented sit minimized in one collapsed **✓ N documented**
line (the labels are named in the summary; one click expands it to reveal
the cards and their `found:` evidence), while the **wrong** items and the
**controversial** ones — the two auditors disagree — stay **expanded**, so
a skipped offline-only finding still shows its teal offline mark on the
card. The header rules moved behind the ⓘ toggle together with the rest of
the how-it-works prose. Since **update 2.3** the AI auditor's prompt
carries an explicit ER-course rule: investigations documented in general
wording (labs / bloods / Ix / rads / imaging — with or without results and
without an "ER course" heading), ED medications given, or a consultation in
any form all count the item as documented. The **live note-audit pill**
that used to sit beside the note was deleted in 2.3 (a better indicator
will come later) — the local re-audit still refreshes a showing audit
panel in place as you type. Since **update 2.5** the audit section folds
with the same **Expand / Collapse** pair the ICD-10 dashboard got in 2.4 —
one pair beside the title and one at the bottom of the section (either
works; the folded state survives the live re-render, and Clear note &
results starts the next audit unfolded). Since **update 2.4** the left
panel's **Audit** entry is **Clinical Note** (same icon, same key **5**) and
shows the audit score — e.g. **6/9** — **only after the AI auditor pass**;
the offline audit never shows a score, and a note edit (which re-renders
the offline view) hides it again.
Items (lenient — an item counts as
documented when its label or a common wording appears anywhere in the note):

- **Complaints** (critical) — accepts c/o, Co, chief complaint, complains /
  complaining of, CC:
- **HPI** — HPI / history of present illness
- **PMH / PSH** (critical) — accepts PMH, PMHx, PSH, PSHx, past medical /
  surgical history; either label documents the field; the card explains which
  of the two was found
- **Vitals** — vitals label or numeric signs (BP 120/80, HR 88)
- **Local examination** — local exam, on examination, physical exam…
- **Working diagnosis / DDx** — same heuristic as the workup basis
- **ER course** — with three sub-items: **ED medications** (the wording
  counts, no more detail required), **Ix done** (the general "labs" /
  "rads" wording accepted), **consultation done** (any form)
- **Disposition** (critical) — OPD follow-up / admission / normal discharge /
  DAMA / LAMA wordings; accepts "opd fu", "OPD FUp", and died / dead /
  expired / passed away (update 1.1: death counts as a disposition) — and
  since update 1.4 the **non-verbatim plans** physicians actually write:
  "the patient is for OPD", "for admission", "for discharge", "for home",
  "to / in / at OPD", "OPD clinic / appointment / referral / review",
  "transferred / referred / shifted to ward / ICU / CCU / HDU", and "kept
  in ED for observation" (a ward/ICU transfer also counts as admission for
  the sick-leave exemption)
- **Sick leave** (critical — update 1.1) — **mandatory whether needed or
  not**, *except* when the disposition is DAMA, admission or death (then the
  card shows a green "not required" chip instead). LAMA is not an exemption.

**Fuzzy tolerance (update 1.1):** physicians write C/O, Co, PMHx, "opd fu" and
the occasional spelling or grammar slip — none of that is penalized.
Keywords of 5+ letters match note words within one edit (insert, delete,
substitution or adjacent transposition); short abbreviations stay exact-match
so they can never fire on unrelated words.

When **Complaints**, **PMH/PSH** or **Disposition** is missing — or **Sick
leave** is missing while the disposition is not DAMA / admission / death —
the audit shows a **red-flag banner** (naming the missing critical fields)
and the offending cards turn red with a "MISSING —
critical" chip. Warnings are soft — nothing is ever blocked. A later update
will make the checks tighter (per governance); the current lenient behaviour
is pinned by the regression tests.

The **Audit all** button that update 1.1 shipped (Alt+L) was **removed in
update 1.4**: every button now runs the DDx step itself, so a chained
sequence is no longer needed — press the three buttons in any order and each
keeps the Suggested DDx fresh for the current note (the audit button still
runs its checks locally and instantly, then refreshes the DDx through the
DDx step when the note has none yet).

### Justify workup outside the suggested list (updates 0.7 → 1.5)

The justify box sends the **whole context** — since update 1.4 the **DDx step
runs first** when the current note has no DDx items yet, then the user
message carries the **Suggested DDx block** + the clinical notes + the last
Suggested-workup run for this note + the tests to justify — with a prompt that
demands **radical honesty**: if no guideline-based justification exists, the
AI says so instead of faking evidence. Update 0.8 added the **consistency
contract**: a test counts as justifiable only when the note documents an
indicating finding *and* a real reference supports it, claims must be
grounded in the note's own words, chapter numbers and guideline IDs may
never be guessed, and the sampling temperature was lowered (0.4 → 0.2) so
the same notes stop flipping between justified and not-justified across
runs. Update 0.9 hardened it further: the criteria now include **the DDx /
working diagnosis documented in the notes** (never assume differentials that
are not written), a **CITE THE REFERENCE AS IT IS** block forbids rewording,
renumbering, or inventing citations, and the **verdict and the draft must
agree on every single test** — a test can never be justified in one part and
not-justifiable in the other. If no workup has been requested yet, that
context states so and every listed test is justified from the notes
directly. The reply comes in **two visible parts** (plus a machine-readable
`refs` list):

- **AI verdict** — an amber advisory box ("which tests are justifiable, which
  are not") for the physician's eyes only. It carries **no copy control and is
  unselectable** (`user-select: none`), so it can never be pasted into the
  patient record. Since update 1.1 it deliberately **keeps the textbook tone
  and the references** — the guideline citations live here.
- **Justification draft** — written in **clinical-note phrasing** (update
  1.1): short documentation sentences of the form *"what was done + what it
  aims to exclude, evaluate or confirm"* — e.g. "Electrolytes are drawn to
  exclude …", "CRP done to exclude systemic infection or inflammation." —
  one short paragraph per test, **no textbook prose, no guideline names, no
  citations** (none of that belongs in a clinical note). Rendered as prose
  with two buttons: **Copy justification** copies **the draft only**, and
  **Add to clinical notes** (update 0.9) appends the same draft to the
  clinical notes above — never the verdict, never the links.
- **Evidence links** (update 0.9) — under the draft, every cited reference
  becomes a link you can open to verify the evidence: ACEP citations link to
  ACEP's verified clinical-policies page, "Harwood-Nuss ch. N" citations link to the
  chapter on doctorlib.org. Tintinalli's and Rosen's render as plain text
  (no verified public online source exists — the tool never guesses a URL).
  The links are for your review only and never enter the copied justification
  or the clinical notes.
- **The gap box** (update 1.4; **split in two in update 1.5**) — rendered
  **only when at least one listed test is not justifiable from the available
  data** (the reply's `gaps` field is non-empty). Since update 1.5 the box has
  two strictly separated parts:
  - **the explanation — the "first phase"** (e.g. *"CT abdomen with contrast
    was ordered, but no documented indication is present in this note to
    justify its use per guideline recommendations"*): advisory only —
    unselectable, **no Copy button, no Add-to-notes button**. It can never be
    copied and never be added to the clinical notes; **Copy justification**
    and **Add to clinical notes** (the draft-level buttons) never include it.
  - **the isolated indications** — the reply's `gap_items`, each one a short
    clinical phrase (a symptom, a finding, a risk, an examination result)
    that, had it been genuinely documented, would have justified the
    investigation. Each renders as its **own row with its own Copy and
    Add-to-notes buttons** — copy or add **every indication solitarily**,
    after verifying it was genuinely asked, examined, or found (the toasts
    repeat the rule). When a reply carries no `gap_items` (older models), the
    tool extracts the indications from the prose itself — bullet lines,
    "(e.g., …)" lists, "the notes do not document …" clauses — so every
    indication still gets its own buttons.
  The box ends with the fixed warning: **never fake a complaint, an
  examination finding, or a result to justify an investigation** — if it was
  not genuinely asked, examined, or found, it must not be documented.

Verify any guideline reference before it goes into the record — the ordering
physician remains responsible.

All prompts are documented verbatim in **`PROMPT.md`** (with instructions to
customize them).

The ⚙ **Admin** button (top right) lets the ED administrator switch provider
and model, set the API key (stored per-device in localStorage; the embedded
keys never display), and the endpoint URL, plus a connection test. The
endpoint accepts either the full chat-completions URL
(`https://api.groq.com/openai/v1/chat/completions`) or a pasted base URL
(`https://api.groq.com/openai/v1`) — base URLs are auto-completed, and an
older base-URL entry saved on a device is silently corrected on the next
load. Regular users never need this screen.

**Multiple users / multiple keys:** Admin settings live in each browser's own
localStorage. Two physicians on two computers (or two browsers on one
computer) each keep their **own independent** provider, model and key — one
user switching to their personal Groq key never affects the other. Only
users sharing the *same browser profile* on the *same machine* share a
config. Note the flip side: the built-in default key ships inside the HTML,
so on a deployed site anyone who can open the page can read it from the page
source — for production, distribute a keyless build and let each admin enter
their own key in ⚙ Admin (stored per-device), or put a server-side proxy in
front.

**Privacy:** the offline engine never leaves the machine. AI Assist explicitly
sends the pasted note to the configured external endpoint — align with your
hospital's PHI policy before enabling physicians to use it.

## Colour themes (update 1.5)

The header carries a small **theme picker** with four settings: **Day** (the
default — the original light look), **Sepia** (warm paper tones), **Dark**
(standard dark) and **Night** (pure black with dimmer text and accents — the
dark-room variant). The choice is saved per device in localStorage
(`edca-theme`) and restored by a tiny script in `<head>` **before the first
paint**, so a Night user never sees a light flash on load. Every colour in
the file is a CSS variable; one `data-theme` attribute on `<html>` swaps the
whole palette, and solid buttons keep their own dark fills so white labels
stay readable in all four themes. Nothing about the theme is sent anywhere.

## Data provenance (no invented codes)

- Official CMS ICD-10-CM **FY2026 (April 2026) tabular list** — 46,881 XML
  nodes expanded per CMS 7th-character rules and validated against the official
  **98,186-code order file** → 74,719 billable codes → 37,941 embedded after
  the ED filter; the full list stays embedded for validation.
- 11,093 codes carry official instructional notations (Includes / Excludes 1 /
  Excludes 2), shown in the code detail panel.
- 90 ED presenting complaints with symptom code + differentials, 329-code ED
  priority set, all validated at build time — the build **fails loudly** if any
  reference does not exist in the official list.

## Updating to a newer code set (FY2027+)

1. Drop the new CMS tabular XML + order-code list into
   `icd-data/simple_icd_10_CM/data/`.
2. Update the two paths in `scripts/build_ed_code_assist.py`.
3. Run it — complaints/lay/abbrev dictionaries live in
   `scripts/complaints_data.py`; the ED filter rules in `scripts/ed_filter.py`;
   the HTML assembly template is `scripts/ed_code_assist_template.html`.

## Files

- `ed-code-assist.html` — the tool (4.79 MB; Diagnosis + Complaint tabs fully
  offline, Notes tab uses AI Assist) — also served by the Next.js project in
  the workspace root (`/` redirects to `/ed-code-assist.html`)
- `ai_gateway.py` — local AI relay + file server (optional, for NVIDIA GLM 5.3)
- `PROMPT.md` — every AI prompt verbatim (DDx, codes, workup, justify, and
   since 2.1 the AI auditor) + customization guide
- `LOGIC.md` (update 2.8) — a Mermaid diagram of the whole page logic (tabs,
   the one-row top panel, the unified ICD-10 dashboard (2.3) with the
   live-pill deletion + the AI-auditor ER-course rule, the DDx-first
   pipeline, the workup gate incl. the 1.6 supporting-data annotation +
   AI-drafted reasons, the justify gap box incl. the 1.5 split + fallback,
   the 2.1 dual-auditor audit + AI-verdict filter with the 2.2 documented
   fold, the notes left panel, the tray, and since 2.4/2.5 the two
   section folds, the ", + dx" DDx append, the Clinical Note entry + the
   AI-only score, the diagnosis-row + and the hover rationale) —
   check it to confirm the implementation matches the suggested design, and
   update it after any change
- `screenshot-diagnosis-tab.png`, `screenshot-complaint-tab.png`,
  `screenshot-notes-tab.png` — quick look
- Since 2.8 the build also embeds `scripts/tt_chapters.json` (the verified
  Tintinalli 9th-ed. chapter index, built by `scripts/build_tt_chapters.py`
  from the book's official chapter-references page)
- Source/build pipeline is in `scripts/` (see project root)
