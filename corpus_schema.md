# Corpus Schema

`corpus.xlsx` is a single-sheet workbook with 40 data rows and 7 columns. Each row represents one source signal — a review, a forum post, a vendor commentary excerpt, or a job description responsibility line.

## Columns

| Column | Type | Required | Description |
|---|---|---|---|
| `source_id` | string | yes | Identifier for the source. For products: the product name (e.g., `Finastra LoanIQ`, `Nortridge Loan System`). For job descriptions: `JD - <Company>` (e.g., `JD - Peachtree Loan Servicing Analyst`). For vendor perspectives: vendor name (e.g., `Trazmo`). |
| `source_url` | string | no | Public URL where the source can be re-accessed. Null for JDs (LinkedIn postings expire) and for vendor perspectives. |
| `source_type` | enum | yes | One of: `Review`, `Reddit`, `ForumAggregate`, `Vendor Perspective`, `job_description`. |
| `date` | date | no | Date the source was published or the JD was active. |
| `persona_fit` | int (1–5) | yes | Author's score for how well the source speaks to the CRE Loan Servicing Analyst persona. Rows with `persona_fit < 3` were dropped from the corpus before pipeline execution. |
| `raw_text` | string | yes (mostly) | The verbatim source content. **For `job_description` rows in the public corpus, this column has been redacted to a placeholder string** — see `data_sources.md` for the redaction policy. The pipeline does not consume this column for JD rows; it consumes `quick_note`. |
| `quick_note` | string | conditionally | For `job_description` rows: the workflow→pain pre-translation that Stage 2 of the pipeline routes to instead of `raw_text`. For other source types: optional analyst note, often null. |

## `source_type` enum values

| Value | Meaning | Count in corpus |
|---|---|---:|
| `Review` | Verbatim user review pulled from G2, Gartner Peer Insights, Capterra, or SoftwareAdvice. Includes the reviewer's "Pros," "Cons," and "Overall" sections. | 11 |
| `Reddit` | Reddit post or comment, typically from r/banking, r/CommercialRealEstate, r/CRE, or r/salesforce. | 2 |
| `ForumAggregate` | Aggregated quotes from a single Reddit thread or similar forum, where multiple users discuss platforms. Counted as one source even when containing multiple quotes. | 2 |
| `Vendor Perspective` | Public commentary from a vendor (e.g., a Trazmo founder LinkedIn post) describing what the vendor sees as user pain in the space. **Tagged transparently because vendor perspectives have known incentive bias.** | 3 |
| `job_description` | Active LinkedIn job posting, parsed for analyst responsibility lines. Treated as workflow-pain artifacts rather than user-voiced friction. | 23 (60%) |

Total: **40 rows**, after dropping 6 rows during corpus cleanup that fit a different persona (mortgage origination LOS rather than CRE servicing).

## `persona_fit` rubric

The persona is the CRE Loan Servicing Analyst at a third-party servicer or lender's internal servicing arm — see the memo's Persona section for the full definition.

| Score | Meaning |
|---|---|
| 5 | Direct fit: source speaks to a CRE servicing analyst's daily workflow (covenant tracking, draw processing, QAR generation, watchlist management, capital-provider reporting). |
| 4 | Strong adjacent fit: commercial loan servicing more broadly (commercial banking, equipment finance, multi-vertical servicing platforms). |
| 3 | Tangential: commercial lending workflows that include some servicing-relevant signal but are not directly servicing-shaped. |
| < 3 | Dropped from corpus. Typically: consumer/SMB lending, mortgage origination, or cross-vertical lending tools without CRE specificity. |

## Notes on schema choices

- **Single sheet, flat schema.** Earlier iterations had two sheets and inconsistent column ordering across them; consolidation to a single normalized sheet was a prerequisite for the Stage 2 pipeline.
- **`source_url` allowed null** because JD URLs expire and vendor commentary is often pulled from posts that get edited after the fact. Source_id + source_type + date are usually sufficient for re-finding.
- **`raw_text` redaction for JDs in the public version** is documented in `data_sources.md`. The pipeline produces identical output whether `raw_text` is present or redacted, because JD rows are routed through `quick_note` regardless.
