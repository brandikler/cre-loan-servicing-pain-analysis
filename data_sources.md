# Data Sources

This document describes where the 40 corpus rows came from, the collection methodology, and the redaction policy applied to `corpus.xlsx` for public publication.

## Sources by type

### Reviews — G2, Gartner Peer Insights, Capterra, SoftwareAdvice (11 rows)

Verbatim user reviews from public review platforms. Each review row preserves the platform's "Pros / Cons / Overall" sections to retain the original structure (the "Cons" section is typically where the highest-signal pain content lives). Reviews were chosen for `persona_fit ≥ 3` against the CRE Loan Servicing Analyst persona.

**Products covered:**
- Finastra Loan IQ (Gartner)
- Abrigo / Sageworks (G2 + ForumAggregate)
- Nortridge Loan System (Capterra, SoftwareAdvice — heavy concentration; see memo's Limitations section)
- Built Technologies (G2)

### Reddit (2 rows)

Posts and comments from public Reddit threads, primarily from `r/salesforce` (the nCino "duct tape" comment) and aggregated discussion across `r/banking` and `r/CommercialRealEstate`.

### Forum Aggregate (2 rows)

Single Reddit threads where multiple users discussed loan-servicing platforms in one place. Aggregated as one source row each rather than splitting into per-comment rows, with multiple supporting quotes preserved in the `raw_text`.

### Vendor Perspective (3 rows)

Public LinkedIn commentary from one vendor founder (Trazmo) describing what the vendor sees as user pain in the loan-servicing space. **Tagged transparently as `Vendor Perspective`** because vendor commentary has known incentive bias — vendors articulating "industry pain" have a commercial interest in claiming the pain is widespread and severe. The pipeline does not infer this bias automatically; it relies on the source-type label.

### Job Descriptions (23 rows, 60% of corpus)

Active LinkedIn job postings for roles including: CRE Asset Manager (with QAR responsibilities), Loan Servicing Analyst, Senior Associate Capital Markets, and Loan Operations roles. Each row represents *one responsibility line* from the JD, treated as a workflow-pain artifact.

**Companies represented (sampled, not exhaustive):**
- Peachtree (Stonehill loan servicing)
- Sany Capital USA (loan operations / commercial finance)
- A capital-markets analyst role at a balance-sheet lender (anonymized)
- A CRE asset manager role with Quarterly Asset Report responsibilities

JD content is treated as **workflow-pain artifacts**, not user-voiced friction. A responsibility line like *"Maintain renovation budgets, review and analyze draw requests, and coordinate with borrowers, construction monitoring firms, loan participants, and others"* implies that draw processing requires manual coordination across 4+ external parties — this implication is captured in the `quick_note` column, which is what the pipeline consumes for JD rows (see `corpus_schema.md`).

## Redaction policy

**For JD rows (`source_type = job_description`), the `raw_text` column has been redacted in the public `corpus.xlsx`.** The redacted placeholder reads:

> *"[Raw text redacted from public corpus — JD content from public LinkedIn postings. Quick Note column contains the workflow→pain pre-translation used by the pipeline. See data_sources.md for redaction policy.]"*

### Why redact

The verbatim JD responsibility lines are public LinkedIn postings (not confidential), but publishing them in a portfolio piece raises two concerns:

1. **Currency.** LinkedIn JDs expire. A redacted placeholder is more honest than presenting expired text as a stable corpus.
2. **Misuse risk.** Republishing JD verbatim text *with implied pain interpretations* could expose the listing companies to mischaracterization. The pain interpretations are author judgment; preserving them in `quick_note` while redacting the source line keeps the audit trail without misrepresenting the listing.

### What is preserved

- `quick_note` (the workflow→pain interpretation) is preserved in full. This is what the pipeline consumes.
- Company name and role title are preserved in `source_id` (e.g., `JD - Peachtree Loan Servicing Analyst`).
- All other columns are unchanged.

### Pipeline impact

Zero. The Stage 2 extraction prompt routes JD rows through `quick_note`, not `raw_text`. The pipeline reproduces identically against the redacted public corpus.

## What is *not* in this corpus

- **Major commercial servicing platforms** — Black Knight MSP, Mortgage Cadence, McCracken Strategy, Sagent, FIS LoanServ. These have very limited public review presence; the corpus covers them only through Vendor Perspective and JD content. See the memo's Limitations section and Recommended Next Step #4 for how this gap is acknowledged and addressed.
- **Glassdoor employee reviews of third-party servicers.** Identified as a high-yield untapped source; deferred to a follow-up iteration. Cons sections of analyst-role reviews at firms like Walker & Dunlop or Situs would supply the direct user voice the corpus is currently missing.
- **CMBS or capital markets industry reports.** Out of scope for this synthesis; the persona is operational rather than market-analytical.

## Collection methodology

- **Manual collection.** No scrapers, no LinkedIn scraping (LinkedIn ToS prohibits it). Each source was collected by visiting the public URL and copying the relevant section.
- **Persona scoring at collection time.** Each source was scored 1–5 for persona fit at the moment of collection. Rows scoring <3 were excluded from the corpus before pipeline execution.
- **Deliberate inclusion of vendor perspectives** despite obvious bias, because vendor commentary articulates pain in the most precise language available; the source-type label preserves the bias for downstream cross-source diversity scoring.
- **No use of paid review aggregators.** Trustpilot, Glassdoor (gated), and similar paid sources were not used.
