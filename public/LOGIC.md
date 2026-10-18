# ED Code Assist — Page Logic (update 2.8: the workup DDx gate + the audit without a DDx call + the Alt-key map + the Tintinalli index; 2.5: the diagnosis-row +, the hover rationale, the audit-section fold; 2.4: the dashboard fold, the ", + dx" DDx append, the Clinical Note entry + the AI-audit score, the codes-button rename; 2.3: the unified ICD-10 dashboard, the live-pill deletion, the AI-auditor ER-course rule; 2.2: the documented fold + the ⓘ stows + the justify-box clear; 2.1: the dual-auditor note audit + the AI-verdict filter; one-row top panel; the notes left panel)

This file documents, as Mermaid diagrams, **how the webpage actually works** — so you can compare it against the suggested design and **rectify any drift**. It is written for update 2.5 — 2.4 and 2.5 shipped together — (in 2.4: the ICD-10 dashboard folds with an **Expand / Collapse** pair beside the title and the same pair at the end of the section, and a jump into a subsection re-expands it; adding a DDx **one by one** extends an existing DDx statement — its own line or mid-paragraph — with ", + differential" instead of opening a second line; the codes button is **notes, DDX, ICD**; the left panel's Audit entry became **Clinical Note** and shows the audit score (e.g. 6/9) only after the AI auditor pass — never on the offline view. In 2.5: every differential with a suggested code carries its own **+** on the diagnosis row — one click adds its code to the selected codes; the Clinical-Based ICD coding rationale rides on the **code hover**; the audit section folds with the same top + bottom pairs). On top of update 2.3 (the DDx and ICD sections merged into ONE unified ICD-10 dashboard — the DDx-based ICD subsection first (the copy buttons deleted, + Notes / + kept, the Add-all pair at the top, every code and its buttons on one row), the Clinical-Based ICD subsection second (the listing unchanged); the live note-audit pill deleted — the debounced re-audit survives; the AI auditor now counts the ER course as documented on general-wording labs / rads or a consultation. On top of update 2.2: the audit list declutters — the agree-documented items collapse into one expandable ✓ line while wrong + controversial items stay expanded; every section's how-it-works prose sits behind a small ⓘ icon; New Patient also clears the justify box; and the 2.1 layer: the note audit runs two auditors — the offline rules locally and instantly plus an AI auditor pass on the endpoint — and the display follows the AI auditor: flagged by both, or by the AI auditor alone; offline-only flags are skipped); regenerate it after any change (see the maintenance note at the end).

Key invariants of update 2.1 (21 added by 2.8):

1. **THE DDx STEP RUNS FIRST.** It is its own AI call. The ICD-10 codes, the suggested workup and the justification of investigations all receive the DDx items in their user messages, and **none of them runs before the DDx exists**.
2. The **workup is gated**: no DDx items, no workup (a clear explanation is shown instead).
3. The **justification gap box** appears **only when at least one listed test is not justifiable from the available data** (the DDx + the clinical notes) — and it always carries the standing warning to never fake a complaint, an examination finding, or a result.
4. The audit's **offline part is local and instant** (nothing leaves the machine for it) and accepts **non-verbatim disposition plans**. Since 2.1 the button also runs an **AI auditor pass** on the endpoint, and the merged display follows the AI verdict (see invariant 13). Since 2.8 the button — renamed **only Audit notes** — makes **no DDx call** (the 1.3/1.4 keep-fresh phase was deleted) and its click **navigates to the audit section**.
5. The **Clinical Notes tab is the default tab** (the URL hash still restores the last tab).
6. There is **no Audit all button** (removed in 1.4) — every button runs the DDx step itself.
7. **The suggested workup is cross-checked against the ED CPG** (clinical governance): every suggested item on an in-play CPG section carries a **★ CG** badge, and the in-play CPG investigations the AI guidelines did not suggest are **appended as extra ★ CG cards** — so the workup also recommends the CPG file. Matching is local, deterministic, and negation-aware ("denies chest pain" / "no fever" never switches a section on).
8. **Clicking a workup card ORDERS the investigation** (click again to un-order). Each order drafts one reason sentence in the **labs-reasoning box** — since update 1.6 that sentence is the AI's **`doc` field, written for THIS encounter from the DDx + the clinical notes** (rule 6 of the workup prompt: "X is done to exclude …" documentation phrasing, varied wording, no invented findings). The local opener pools survive only as the **legacy fallback** (replies without `doc`; CPG-appended cards the review did not cover draft from the CG's curated kind + target). The box offers **Copy reasons** and **Add to clinical notes** and warns: order only what you genuinely requested.
9. **The gap box is SPLIT IN TWO (update 1.5).** The explanation — the "first phase", e.g. *"X was ordered, but no documented indication … per guideline recommendations"* — is advisory only: not selectable, **no Copy button, no Add-to-notes button** — it can never be copied and never enter the clinical notes. The **isolated indications** (`gap_items`; extracted from the prose when a legacy reply carries none) render as separate rows, **each with its own Copy and Add-to-notes button**, so every indication is handled solitarily — and the anti-faking warning stays at the bottom of the box.
10. **Four colour themes (update 1.5): Day (default) / Sepia / Dark / Night**, chosen in the header, saved in localStorage (`edca-theme`), restored **before first paint**. Every colour in the file is a CSS variable; one `data-theme` attribute on `<html>` swaps the whole palette (solid buttons keep their own dark fills so white text stays readable).
11. **CPG investigations the notes do NOT justify carry supporting data (update 1.6).** The workup reply's `cpg_review` compares every unsupported in-play CPG investigation against the other guidelines in use (ACEP / Tintinalli's / Rosen's / Harwood-Nuss') and returns the 2-4 short phrases that, had they been genuinely documented, would have justified it. The appended card renders them as **"Add supporting data like: …"** with a **⚠ needs supporting data** chip and the standing anti-faking rule — add them only if genuinely asked, examined, or found. An appended card with **no** review entry (older models) gets the softer local "verify the supporting data" note; the tool never invents supporting data itself.
12. **The Quick start & tips guide and the ⚙ Admin settings live in the TOP PANEL (update 1.6).** The guide drops down OVER the page (never pushes the content; a `:not([open])` guard hides it — Chrome renders closed-details children as boxes otherwise); the Admin button sits in the header tabs beside the theme picker.
13. **The note audit is a dual-auditor view with an AI-verdict filter (update 2.1).** The offline rules render instantly; the AI auditor pass then merges its per-item verdicts. Every card carries **both marks** (offline teal, AI purple) but the DISPLAY verdict — banner, chips, counts, Insert-missing-headings — follows the **AI auditor alone**: items flagged by both, or by the AI auditor alone, are shown as missing; items flagged **only by the offline auditor are skipped** (their offline marks stay visible). The parser is **strict on completeness** (all nine items or the reply is unusable — the offline view stands with a notice); an edit after a merged audit re-renders the offline view with a stale hint. The sick-leave item now recognizes the **duration wording** ("Sick leave : 48 hrs" → "duration: 48 hrs").
14. **The top panel is ONE ROW (update 2.1) and the Clinical Notes tab has a left panel.** The header carries the logo, the tabs, ⚙ Admin, the theme picker, the **New Patient** reset (note + results + tray, undo for the codes) and the Quick start strip on a single line; the code-helper subtitle was deleted. The notes tab carries a sticky **lt panel** — six subsection entries (Note / DDx / codes / workup / audit / justify) with icons, disabled while their section is empty, a scrollspy, and **number keys 1-6** (Notes tab only, never while typing, never over a modal or the open guide). The Keyboard shortcuts section moved into the Quick start guide; the tray's clear button is **Delete codes**; the long Data statement sits behind an expandable footer button.
15. **Update 2.2 — the decluttered audit list + the ⓘ stows.** `auditFoldSplit()` runs at render: the items the auditors **agree** are documented collapse into ONE closed `✓ N documented` line (the labels + an expand hint in the summary; one click reveals the cards and their `found:` evidence); the **wrong** items and the **controversial** ones (the two auditors disagree — a teal offline mark against the shown verdict) stay **expanded** in the grid, so the offline-only disagreements stay visible while their findings are skipped. Every long how-it-works prose block sits behind a small **ⓘ** toggle, collapsed by default (the notebar workflow line, the ai-tools explanation, the DDx hint, the codes Privacy footer, the workup header tail, the ordered-reasons hint, the justify footer, the audit rules) — the text stays verbatim inside the toggle (textContent checks unaffected; the Chrome closed-details guard applies). **New Patient** (and **Clear note & results**, the shared PHI clear) also empties the **Justify workup** box — the ordered-tests list dies with its encounter; the undo still restores the codes only.

16. **Update 2.3 — the unified ICD-10 dashboard + the pill deletion + the ER-course AI rule.** The DDx panel and the ICD code list merged into ONE dashboard (`#dash`, hidden until either subsection has content — `updateResNav` mirrors the res-nav emptiness): the first subsection is **DDx-based ICD** (`#ddx-results`, relabelled `DDx-based ICD — Suggested DDx`), the second is **Clinical-Based ICD** (`#ai-results`, relabelled; the listing unchanged). In the DDx subsection the **copy buttons are deleted** (per-item Copy, Copy all DDx, Copy DDx codes, and the inline chip's click-to-copy — the chip is plain text now); **+ Notes** (add to clinical note) and **+** (add to selected codes) stay, the **Add-all pair sits at the TOP** of the section, and every ICD code keeps its buttons **on its own row** (`.di-main` / `.di-code` are nowrap; the text wraps inside `.di-t` / `.di-cd` instead). The **live note-audit pill is deleted** (a better indicator will come later) — the debounced `refreshLiveAudit` (450 ms) survives and still refreshes a SHOWING audit panel in place (2.1 stale-hint path untouched; a PENDING pre-press timer is cancelled at the audit press — 2.3 race fix, so a keystroke from before the press can never clobber the fresh merged render with the offline view). The **AI auditor prompt** gained the ER-course rule: investigations in general wording (labs / bloods / Ix / rads / imaging, with or without results, no heading needed), ED medications given, or a consultation in any form all count the item as present.

17. **Update 2.4 — the dashboard fold, the doctor-phrasing DDx append, the Clinical Note entry.** The unified dashboard carries an **Expand / Collapse** pair **beside the title** and the **same pair at the end of the section** (either collapses or expands both subsections; the `.folded` class sits on `#dash` itself, so a re-render of either subsection keeps the folded state; the res-nav and lt-panel jumps **re-expand** a folded dashboard — a jump target must never stay hidden; Clear note & results / New Patient reset the folded state for the next encounter). Adding a DDx **one by one** now reads like a doctor: when the note already carries a DDx statement — its own line **or mid-paragraph** — `+ Notes` rewrites ONLY the DDx segment (`DDx:` / `D/Dx:` / `DD:` / `differential diagnosis` / `working diagnosis` label with a `:-/` separator, running to the first sentence period, newline or end) extending it with **", + differential."**; an empty `DDx:` label receives the differential directly; with no DDx statement the original fresh-line append stands. The codes button is renamed **notes, DDX, ICD** (the net of the 2.4 and 2.5 specs — the id, the title, the Ctrl+Enter contract and the two-step behaviour are untouched). The lt-panel entry **Audit** became **Clinical Note** (icon + key-5 shortcut unchanged) and carries a score badge driven by `ltPanelSync` from `lastAudit.ai` — **only the merged AI-audit view shows it** (`nOk/9`); an offline render, or the live re-audit that follows a note edit, hides it again.

20. **Update 2.7 — the guideline references run on ACEP, cited by topic.** NICE is retired from the whole reference system (the owner's report: the NICE citations were "not that good" — the UK guideline IDs were a hallucination magnet and UK-centric for a US-textbook ED tool). The workup and justify prompts now name **ACEP — the American College of Emergency Physicians — cited by clinical-policy topic** (`"ACEP clinical policy - Suspected Venous Thromboembolism"`), with the invented-policy-ID ban written into the never-guess rules; Tintinalli's / Rosen's / Harwood-Nuss' and the department CPG are untouched. `citationLink()` maps every ACEP citation to the **verified ACEP clinical-policies hub** (`https://www.acep.org/patient-care/clinical-policies` — a stable landing page, never a guessed deep URL, exactly like the doctorlib base for Harwood-Nuss), and the `justifyCitations` legacy scan canonicalises both ACEP forms (`"policy - Topic"` and `"policy on topic"`) with the topic trimmed at punctuation and connector words. The historical What's-new 1.6 entry keeps its NICE wording — the changelog records history, it is not rewritten.
19. **Update 2.6 — one code per differential, always.** The DDx step's prompt (rule 5) no longer returns `"ddxCodes": []` when the note documents a working diagnosis — that clause had left the documented case with **no codes at all**, so the 2.5 diagnosis-row **+** never appeared on the owner's typical notes. The AI now returns **one entry per differential in every case** (the documented working diagnosis included; `null` only when no standard billable code plausibly fits), and the pipeline keeps the pairing honest end to end: `parseDDxReply` aligns `ddxCodes` to the **sanitized** `ddx` by **raw index** (sanitizeDdx may drop entries — dups, non-strings, >80 chars, past 6 — and a drop must never shift a code onto the wrong differential), and `runDDxRequest` validates **each entry in place** (`validateAIList([e])` per slot; a missing or invalid code becomes `null` at its own index, never dropped — dropping would shift the pairing). `renderDDx` treats a `null` slot as "no code": no code row, no **+** on that differential, and the Add-all-codes button + the how-to tail gate on `.some(c => c)` while the Add-all loop skips the nulls. The **+ Notes** buttons are untouched.
21. **The 2.8 DDx gate:** Suggested workup is disabled until notes, DDX, ICD has generated DDx items for the CURRENT note (`wkDdxGate()` — re-applied by `lockAll(false)`, the note-input listener and `clearNoteResults`); the workup then reuses the DDx with **no DDx call of its own**, and any note edit closes the gate again. The keyboard map is Alt+Q codes · Alt+A workup · Alt+Y AI justify · Alt+N new patient (global); Ctrl+Enter and Alt+W are retired, and the audit button carries no shortcut. The Tintinalli 9th-ed. index (304 verified chapters) rides the workup + justify prompts exactly like the Harwood-Nuss index, and only chapter ids present in the verified list ever link.
18. **Update 2.5 — the diagnosis-row +, the hover rationale, the audit fold.** In **DDx-based ICD** every differential with a suggested code carries its own **+** on the diagnosis row (`.di-main .addbtn`, styled as a `dtool`): one click runs the same `addTray(code, 'DDx', desc)` as the code row's +, and `refreshAddBtns` manages it identically (it flips to a green ✓ once the code is in the tray) — differentials **without** a code get no button; the code row keeps its own +. In **Clinical-Based ICD** the coding rationale moved onto the **code chip's title tooltip** ("Coding rationale: … — click to copy this code", quotes escaped so an AI phrase can never break the attribute) — the visible `.rat` line and its CSS are retired, the listing stays lean, and the click-to-copy is untouched. The **Clinical notes audit** section folds with the same shared `.tgl` pair — one beside the title (inside `.ai-head`) and one at the bottom (`.audit-foot`) — around a `.audit-body` wrapper that hides when `#audit-results` carries `.folded`; the class sits on the container, so it **survives the innerHTML re-renders** (the live re-audit included), and Clear note & results resets it with the encounter.

---

## 1. Page structure & data flow

```mermaid
flowchart TD
    LOAD["Page load (single file, 4.75 MB)"] --> THEME["head script restores the saved theme<br/>BEFORE first paint (Day default)"]
    THEME --> TOP["TOP PANEL — ONE ROW (update 2.1): the sticky header carries<br/>logo · tabs · ⚙ Admin · theme picker · New Patient<br/>(note+results+tray reset, undo for codes) ·<br/>the Quick start &amp; tips strip (drops over the page)"]
    TOP --> TAB{"Tab from URL hash?<br/>(#dx / #cc / #notes)"}
    TAB -- "no hash (default)" --> NOTES["Clinical Notes tab<br/>DEFAULT since 1.4"]
    TAB -- "#dx" --> DX["Diagnosis tab — 100% offline<br/>fuzzy search over the ED subset<br/>(37,941 billable FY2026 codes)"]
    TAB -- "#cc" --> CC["Presenting Complaint tab — 100% offline<br/>one card per complaint:<br/>symptom code + differentials"]

    subgraph NOTES_TAB["Clinical Notes tab (the workflow tab)"]
        PASTE["Paste the note into #note-input"] --> PILL["update 2.3: the live pill was deleted;<br/>the debounced re-audit remains —<br/>a SHOWING audit panel refreshes<br/>in place as you type (local)"]
        PASTE --> BTN["Press any button —<br/>every one runs the DDx step first"]
        BTN --> AI["notes, DDX, ICD — the codes button<br/>(renamed 2.5; Ctrl+Enter) —<br/>the two-step is unchanged"]
        BTN --> WK["Suggested workup<br/>(Alt+W)"]
        BTN --> AU["Audit clinical notes<br/>(Alt+A) — offline instantly,<br/>then the AI auditor pass (2.1)"]
        BTN --> JU["Justify box (Alt+J focuses it)<br/>for tests ordered outside<br/>the suggested workup"]
        DASH["the unified ICD-10 dashboard (update 2.3):<br/>DDx-based ICD (#ddx-results) then<br/>Clinical-Based ICD (#ai-results), one #dash<br/>wrapper, hidden until content (updateResNav).<br/>update 2.4: the Expand / Collapse pairs<br/>(beside the title + at the end) fold it —<br/>.folded on #dash survives re-renders;<br/>a subsection jump re-expands it"]
        AI -. "a codes run renders both subsections" .-> DASH
    end

    subgraph OFFLINE["Offline engines (this machine only)"]
        ENG["notes matching engine<br/>(feeds validated candidates<br/>to the codes call)"]
        AUDIT["auditNote()<br/>deterministic 9-item check"]
    end

    subgraph CLOUD["AI endpoint (admin-configured;<br/>Groq by default) — the note text<br/>leaves the machine"]
        DDXCALL["DDX call"]
        CODECALL["Codes call"]
        WKCALL["Workup call"]
        JUCALL["Justify call"]
        AUDCALL["Audit call — the AI auditor<br/>(update 2.1)"]
    end

    AI --> DDXGATE
    WK --> DDXGATE
    AU --> AUDIT
    AU --> AUDCALL
    %% update 2.1: AU also fires the AI auditor pass (AUDCALL)
    JU --> DDXGATE
    DX -.adds.-> TRAY
    CC -.adds.-> TRAY
    NOTES_TAB -. "codes / DDx codes<br/>add with +" .-> TRAY["Selected codes tray<br/>(reorder · 1st = principal ·<br/>EMR copy formats · CSV ·<br/>survives reload, New patient clears)"]
```

---

## 2. THE DDx-FIRST PIPELINE (the core of update 1.4)

Every AI feature goes through the same gate. `ddxReady(note)` is true when the **last DDx run was for this exact note and returned items** — the DDx is fetched **once per note** and reused by every button.

```mermaid
flowchart TD
    PRESS["A button is pressed with a note pasted"] --> EMPTY{"Note empty?"}
    EMPTY -- yes --> USAGE["Usage error — 'Paste some clinical note<br/>text first' (nothing runs)"]
    EMPTY -- no --> GATE{"DDx items already exist<br/>for THIS note? (ddxReady)"}

    GATE -- "yes (reused, no call)" --> FEATURE
    GATE -- "no" --> DDXSTEP["STEP 1 — THE DDx STEP (ensureDDx)<br/>user message: CLINICAL NOTES only<br/>system: DDX_SYSTEM (temperature 0.1)"]
    DDXSTEP --> DDXR{"DDx step result"}

    DDXR -- "ready (1-5 items)" --> PANEL["Suggested DDx panel renders<br/>working diagnosis / most likely first,<br/>per item: Copy · + Notes (green 'in notes' badge)<br/>+ inline suggested ICD code per differential<br/>whole-list: Copy all · Add all ·<br/>Copy DDx codes · Add all DDx codes"]
    DDXR -- "empty (nothing plausible)" --> EMPTYBOX["DDx panel: 'no differentials<br/>could be suggested'"]
    DDXR -- "error (dead endpoint etc.)" --> ERRBOX["DDx panel shows the error box<br/>(retry offered; a fresh press retries)"]

    PANEL --> FEATURE
    EMPTYBOX --> FEATURE
    ERRBOX --> FEATURE

    subgraph FEATURE["STEP 2 — the button's own analysis (never before the DDx)"]
        A["Codes button: step 2 of 2<br/>user: SUGGESTED DDx block FIRST<br/>+ CLINICAL NOTES + CANDIDATE CODES<br/>[PREFERRED] tags (offline engine)<br/>reply: codes only — every code validated<br/>against the official FY2026 list<br/>(invalid ones rejected, never addable)"]
        B["Workup button (2.8: GATED on the DDx —<br/>disabled until the codes run generated it,<br/>then NO DDx call of its own):<br/>user: SUGGESTED DDx FIRST + notes +<br/>DEPARTMENT CPG block (sections in play)<br/>system: WORKUP_SYSTEM + REFERENCE INDEXES<br/>(Harwood-Nuss + Tintinalli chapters) —<br/>every chapter citation linked to a verified page"]
        C["only Audit notes button (2.8 rename):<br/>offline checks instant + the AI auditor pass<br/>(note -> endpoint); the 2.1 filter merges the<br/>two verdicts (the AI verdict decides the display);<br/>NO DDx call (2.8) + the click navigates to<br/>the audit section"]
        D["Justify button: step 2 of 2<br/>user: SUGGESTED DDx FIRST + notes +<br/>the last suggested workup for this note +<br/>the tests to justify<br/>system: JUSTIFY_SYSTEM + REFERENCE INDEX"]
    end

    A --> ASK{"Codes already in the tray?"}
    ASK -- yes --> TRAYQ["Ask: clear / keep / cancel<br/>(nothing is cleared silently)"]
    ASK -- no --> RENDER1["Codes panel + DDx panel render<br/>(DDx Ns · codes Ns in the header)"]
    TRAYQ -- answered --> RENDER1
```

### The workup gate + the CPG cross-check + ordering (update 1.4 part 2; dynamic reasons + supporting data since 1.6)

```mermaid
flowchart TD
    WKPRESS["Suggested workup button<br/>(2.8: Alt+A)"] --> WGATE{"DDx items exist for<br/>THIS note? (the wkDdxGate —<br/>the button itself is disabled<br/>until the codes run answers yes)"}
    WGATE -- "no (button disabled —<br/>the press does nothing,<br/>the tooltip says to run<br/>notes, DDX, ICD first)" --> GATED["GATED — nothing sent; a programmatic<br/>press gets the 'needs the DDx items first —<br/>run notes, DDX, ICD' explanation"]
    WGATE -- "yes (reused — NO DDx call, the<br/>2.8 token-saving change)" --> SECS

    SECS["CPG sections in play? — the CG's embedded<br/>CPG dataset (v1.0-seed placeholder until the<br/>CG's real file replaces it) matched by keyword<br/>against the DDx items + the note<br/>NEGATION GUARD: 'denies chest pain',<br/>'no fever' never switch a section on"]
    SECS -- "none in play" --> CALL["Workup call — DDx-targeted, no CPG block"]
    SECS -- ">= 1 section in play" --> CALL2["Workup call — DDx FIRST + notes +<br/>DEPARTMENT CPG block (rules 5-7: include<br/>every CPG item the DDx/findings support,<br/>cited 'ED CPG (clinical governance)'; every<br/>item also returns its doc sentence — rule 6;<br/>the unsupported CPG items are reviewed — rule 7)"]

    CALL --> MERGE
    CALL2 --> MERGE["LOCAL CPG CROSS-CHECK (cpgMerge) —<br/>guaranteed regardless of what the AI did:<br/>1. every suggested item that matches an<br/>in-play CPG investigation (alias match)<br/>gains the ★ CG badge — including items the<br/>AI cited to ACEP / Tintinalli's / Rosen's /<br/>Harwood-Nuss' (cross-marked: on the CPG<br/>AND suggested by the other guidelines)<br/>2. in-play CPG investigations no suggested<br/>item covers are APPENDED as extra ★ CG<br/>cards, guideline 'ED CPG — clinical governance'<br/>3. (update 1.6) an appended card the reply's<br/>cpg_review flags is NOT justified by the<br/>DDx + notes carries the ⚠ needs-supporting-data<br/>annotation: the other-guidelines comparison<br/>(also_in) + 'Add supporting data like: …'<br/>(the supporting phrases) + the anti-faking<br/>rule; no review entry → the softer local<br/>'verify the supporting data' note"]

    MERGE --> WKPANEL["Workup panel: 'based on the N suggested DDx items<br/>+ the clinical notes' + CPG counts in the header<br/>('X of Y on the ED CPG (★ CG) · Z added from the CPG ·<br/>K need supporting data · AI-drafted reason')<br/>chapter citations link to the reference"]

    WKPANEL --> CARD["Click a card ⇒ ORDER the investigation<br/>(click again to un-order; ✕ in the box un-orders too)<br/>card turns green + '✓ ordered' chip"]
    CARD --> BOX["LABS-REASONING BOX (only while >= 1 ordered)<br/>one drafted sentence per order — since 1.6 the<br/>AI's doc sentence VERBATIM, written for THIS<br/>encounter from the DDx + the notes (rule 6:<br/>'X is done to exclude …' documentation phrasing,<br/>varied wording, no invented findings)<br/>a flagged card's row carries the ⚠ marker<br/>LEGACY FALLBACK (replies without doc): the CG's<br/>curated kind + target, else the opener pools"]
    BOX --> BTNS["Copy reasons (one sentence per line) ·<br/>Add to clinical notes (appends under 'Ix reasons:') ·<br/>standing reminder: order only what you genuinely<br/>requested — never document an investigation<br/>that was not ordered"]
```

---

## 3. The justification reply & the gap box (updates 1.3 → 1.5 of the request list)

The gap box is the box at the level of justification that appears **only when the investigation done is not justified by the available data from the DDx and the clinical notes**. Since update 1.5 it is **split in two**: the explanation ("the first phase") is advisory-only and can never be copied or added to the notes, while the isolated indications below it act on the record **one indication at a time**, each through its own buttons.

```mermaid
flowchart TD
    JBTN["Justify pressed (tests listed<br/>in the justify box)"] --> JGATE{"DDx items exist<br/>for this note?"}
    JGATE -- no --> JDDX["DDx step runs first (step 1 of 2)"]
    JDDX --> JR{"Result"}
    JR -- error --> JBLOCK["Justify blocked — points at the DDx error"]
    JR -- "ready or empty" --> JCALL
    JGATE -- "yes (reused)" --> JCALL["Justify call (step 2 of 2)<br/>DDx block FIRST in the user message"]
    JCALL --> JREPLY{"Reply (verdict + draft +<br/>refs + gaps + gap_items)"}

    JREPLY --> VERDICT["AI verdict — amber box<br/>advisory only: unselectable,<br/>no copy control, keeps the<br/>textbook tone + the references"]
    JREPLY --> GAPS{"gaps non-empty?<br/>(= at least one test NOT<br/>justifiable from the available data)"}
    GAPS -- "no (every test justifiable)" --> NOGAP["No gap box rendered"]
    GAPS -- "yes (investigation NOT justified)" --> GAPBOX["THE GAP BOX — red —<br/>'Not justified by the available data —<br/>what could justify it'<br/>SPLIT IN TWO since update 1.5"]
    GAPBOX --> EXP["PART 1 — THE EXPLANATION ('the first phase')<br/>e.g. 'CT abdomen was ordered, but no<br/>documented indication is present in this<br/>note to justify its use per guideline<br/>recommendations' — advisory ONLY:<br/>user-select:none, NO copy button,<br/>NO add button — it can never be<br/>copied and never enter the notes"]
    GAPBOX --> GIT{"gap_items present<br/>in the reply?"}
    GIT -- yes --> ITEMS["PART 2 — THE ISOLATED INDICATIONS<br/>one row each (selectable), every row:<br/>the indication + its OWN Copy button<br/>+ its OWN Add-to-notes button —<br/>each indication acts SOLITARILY;<br/>toasts repeat: keep it only if it was<br/>genuinely asked, examined, or found"]
    GIT -- "no (legacy reply)" --> FB["local fallback: extract the indications<br/>from the gaps prose —<br/>bullet lines, then '(e.g., a, b, c)' lists,<br/>then 'the notes do not document a, b, c'<br/>(bullet lines are stripped from the<br/>displayed explanation)"]
    FB --> ITEMS
    EXP --> WARN["the box ends with the fixed standing warning:<br/>'Never fake a complaint, an examination<br/>finding, or a result to justify an<br/>investigation. If it was not genuinely<br/>asked, examined, or found, it must not<br/>be documented.'"]
    ITEMS --> WARN
    JREPLY --> DRAFT["Justification draft — clinical-note phrasing<br/>(Copy copies the draft ONLY ·<br/>Add to clinical notes appends the draft ONLY —<br/>never the explanation, never the indications)"]
    JREPLY --> LINKS["Evidence links — the verified ACEP policies<br/>hub + Harwood-Nuss chapters only;<br/>never a guessed URL"]
```

---

## 4. The clinical-notes audit (update 2.1: offline + the AI auditor)

```mermaid
flowchart TD
    AUD["Audit clinical notes pressed<br/>(or Alt+A, or the live pill click)"] --> LOCAL["auditNote() runs locally, instantly —<br/>identical notes always get the<br/>identical audit; nothing leaves the machine<br/>for the OFFLINE part (2.1)"]
    LOCAL --> ITEMS["9 items — Complaints* · HPI · PMH/PSH* · Vitals ·<br/>Local examination · Working diagnosis / DDx ·<br/>ER course (ED meds · Ix done · consultation) ·<br/>Disposition* · Sick leave*<br/>(* = critical: red banner when missing)"]

    subgraph DISP["Disposition acceptance (update 1.4)"]
        D1["verbatim wordings:<br/>disposition, discharge(d), admitted,<br/>admission, DAMA, LAMA, opd fu,<br/>OPD follow-up, went/sent home,<br/>died / dead / expired / passed away"]
        D2["NON-VERBATIM plans (update 1.4):<br/>'the patient is for OPD / for admission /<br/>for discharge / for home' · 'for OPD' ·<br/>'to / in / at OPD' · 'OPD clinic /<br/>appointment / referral / review' ·<br/>'transferred / referred / shifted to<br/>ward / ICU / CCU / HDU' ·<br/>'kept (in ED) for observation'"]
    end

    ITEMS --> DISP
    ITEMS --> SL{"Sick leave missing?"}
    SL -- "disposition is DAMA / admission / death<br/>(a ward/ICU transfer counts)" --> SLEX["green 'not required' chip"]
    SL -- "otherwise" --> SLRED["red flag — mandatory whether<br/>needed or not (LAMA is NOT an exemption)"]
    ITEMS --> FUZZ["Fuzzy tolerance: C/O, Co, PMHx, PSHx,<br/>'opd fu' accepted; one-edit spelling<br/>slips never fail an item (5+-letter keywords)"]
    ITEMS --> EVI["every documented item shows what actually<br/>matched (found: '…'); Insert missing headings<br/>drops the missing labels into the note"]
    LOCAL --> AIPASS["update 2.1: the AI auditor pass —<br/>AUDIT_SYSTEM on the configured endpoint;<br/>on failure a notice is appended,<br/>the offline view stands.<br/>update 2.3: the ER-course rule —<br/>general-wording labs / rads / imaging,<br/>ED meds, or a consultation<br/>all count the item as present"] --> PARSE["parseAuditReply — strict:<br/>all nine items or the reply is<br/>unusable (a partial reply must<br/>never silently pass items)"] --> MERGE["mergeAuditView — the 2.1 filter:<br/>findings = what the AI auditor flags<br/>(by both, or by the AI auditor alone);<br/>offline-only flags are skipped but<br/>stay visible as teal offline marks;<br/>dual marks on every card:<br/>offline teal, AI purple"] --> FOLD["auditFoldSplit (update 2.2):<br/>the agree-documented cards minimize into ONE<br/>closed '✓ N documented' line (expandable;<br/>the labels in the summary, the found:<br/>evidence one click away); WRONG and<br/>CONTROVERSIAL cards (the auditors<br/>disagree) stay EXPANDED in the grid.<br/>update 2.5: the section itself folds —<br/>the Expand / Collapse pairs at the top and<br/>the bottom around .audit-body; .folded on<br/>#audit-results survives the live re-renders"] --> STALE["an edit after a merged audit<br/>re-renders the offline view +<br/>a 'press Audit again' hint<br/>(the debounced re-audit, 1.2 —<br/>2.3 deleted the live pill,<br/>the refresh survives)"]
    MERGE --> SLDUR["the sick-leave item carries the<br/>duration wording (update 2.0):<br/>'Sick leave : 48 hrs' -><br/>detail 'duration: 48 hrs';<br/>no duration -> 'no duration stated'"]
    MERGE --> SCORE["update 2.4: the merged view drives the<br/>lt-panel Clinical Note score badge —<br/>nOk/9 shown ONLY after the AI auditor<br/>pass; an offline render or a live<br/>re-audit hides it again"]
    LOCAL --> REFRESH["then: if the current note has no DDx items<br/>yet, the DDx step runs"]
```

---

## 5. Copy / add rules (what can ever enter the record)

| Element | Copyable? | Can reach the clinical notes? |
|---|---|---|
| Suggested DDx item | update 2.3: no copy button — **+ Notes** only | yes — "DDx: …" per item; since 2.4 an existing DDx statement (own line or mid-paragraph) is EXTENDED with ", + dx" instead; or the human phrase for all (Add all DDx) |
| Inline DDx code | update 2.3: plain text (the click-to-copy went with the copy buttons) — **+** adds to the tray (since 2.5 a **+** sits on the diagnosis row too) | via the tray (never auto-documented) |
| AI code suggestions | yes (click; + adds to the tray); since 2.5 the coding rationale rides on the code hover (title tooltip), the visible line is retired | via the tray |
| Suggested workup card | via its drafted reason (clicking ORDERS it) | via the labs-reasoning box only |
| Ordered-investigation reason | **yes — Copy reasons (one per line)** | **yes — Add to clinical notes appends under "Ix reasons:"** |
| **CPG needs-supporting-data note** (update 1.6) | display-only (selectable text, no buttons) | never auto-added — the "add supporting data like …" phrases name what to VERIFY; they enter the record only if genuinely asked, examined, or found |
| Justification verdict | **no** — unselectable, no copy control | **never** |
| **The gap-box explanation** (the "first phase") | **no** — unselectable, no copy control, no add button | **never** — it exists to remind, never to enter the record |
| **The gap-box isolated indications** (update 1.5) | **yes — each indication copies on its own** | **yes — each indication appends on its own line, after verifying it was genuinely asked, examined, or found** |
| Justification draft | **yes — Copy copies the draft only** | yes — Add appends the draft only |
| Evidence links | display-only (open to verify) | never |

---

## Maintenance

- Source of truth: `scripts/ed_code_assist_template.html` (rebuild with `python3 scripts/build_ed_code_assist.py`).
- The CPG dataset: `scripts/cpg_source.md` → `scripts/build_cpg.py` → embedded — **currently a clearly-marked placeholder (v1.0-seed)**; replace the source with the CG's real CPG Markdown (format documented in the file header) and re-run both builders.
- After ANY change to the flow, update this file in the same commit — it exists so drift is visible.
- The AI prompts themselves are documented verbatim in `PROMPT.md` (DDx, codes, workup, justify, and since 2.1 the AI auditor); the regression suites that pin this logic live in `scripts/test_update06.sh` … `scripts/test_update14.sh`, `scripts/test_update14b.sh`, `scripts/test_update15.sh`, `scripts/test_update16.sh` and `scripts/test_update21.sh` … `scripts/test_update28.sh` (plus the unit suites `test_update09_unit.mjs`, `test_update10_unit.mjs`, `test_update11_unit.mjs`, `test_parse_just_reply.mjs`, `test_workup_doc.mjs`, `test_update21_unit.mjs` … `test_update28_unit.mjs` — the last five pin the gap_items + 1.6 doc/cpg_review contracts, the 2.1 audit-parser/merge/filter + sick-leave-duration contracts, the 2.2 fold split + justify-box clear + ⓘ-stow contracts, the 2.3 dashboard/pill-deletion/ER-course-rule contracts, and the 2.4/2.5 contracts: the two folds, the ", + dx" append, the renames, the AI-only score, the diagnosis-row + and the hover rationale).
- The theme system: every colour is a CSS variable on `:root`; the three override blocks are `html[data-theme="sepia" / "dark" / "night"]` in the template. The picker is `#theme-select` in the header; the storage key is `edca-theme`; the pre-paint restore script sits in `<head>`.

*ED Code Assist update 2.8 · the logic above is verified by 999 automated checks (555 e2e + 444 unit) across the suites.*
