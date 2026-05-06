# Extraction Prompt — Stage 2

Used in Stage 2 of the synthesis pipeline to extract structured pain points from each source row.

## Design notes

- **Verbatim-quote requirement** is the single biggest anti-hallucination defense. Every extracted pain must cite a verbatim quote from the source. If the model can't find one, it must skip the pain entirely.
- **Explicit pain-vs-feature distinction** prevents the common failure mode of extracting feature requests as pains. Feature requests get captured as `proposed_solution` on a related pain, not as standalone pains.
- **Null-friendly schema** — every field except `pain_summary` and `verbatim_quotes` is allowed to be null. Forcing the model to fill ambiguous fields produces hallucinated content.
- **Source-type routing** — for `source_type = job_description`, the pipeline uses the Quick Note column (workflow→pain pre-translation) instead of Raw Text. JDs describe duties neutrally, not friction; running the unmodified prompt against raw JD text returned 0 pains (see `/eval/eval_results.md`).

## Model

Claude Sonnet 4.5 or later. Haiku struggles on the dedup and severity calibration.

---

## Prompt

```
You are a senior product researcher extracting structured insights from a single user signal (interview transcript, review, support ticket, or forum post).

Your job is to identify PAIN POINTS — moments where the user expresses friction, unmet need, or frustration with a product or workflow.

DISTINGUISH CAREFULLY:
- Pain points (friction the user experiences) → EXTRACT
- Feature requests (solutions the user proposes) → capture as `proposed_solution` on the related pain, NOT as a standalone pain
- Praise or satisfaction signals → IGNORE
- Off-topic content → IGNORE

CRITICAL RULES:
1. Every pain point MUST include at least one verbatim quote from the source. If you cannot find a verbatim supporting quote, do not extract that pain.
2. Do not infer, summarize, or generalize beyond what the user actually said. If they said "it's slow," extract "it's slow" — not "performance issues."
3. If a field cannot be determined from the source, set it to null. Do NOT guess.
4. One pain point per distinct friction. If the same complaint appears in multiple places, capture it once with multiple supporting quotes.

For each pain point, output:
{
  "pain_summary": "<10 words or fewer, using the user's own framing>",
  "verbatim_quotes": ["<exact quote 1>", "<exact quote 2>"],
  "severity_signal": "low" | "medium" | "high" | null,
    // high: user describes blocking work, churning, lost money/time, or strong emotion ("hate", "deal-breaker", "switched away")
    // medium: ongoing friction, workarounds, or repeated annoyance
    // low: mentioned but not dwelled on
    // null: no severity signal in the text
  "dollar_signal": "<verbatim phrase indicating revenue/cost impact, or null>",
    // e.g., "we'd pay double for this," "costs us 10 hours a week," "almost canceled"
  "user_segment": "<role, company size, use case if stated, or null>",
  "proposed_solution": "<verbatim, if user suggested a fix, else null>",
  "context_tag": "onboarding" | "core_workflow" | "integration" | "pricing" | "support" | "performance" | "other"
}

Output a single JSON object:
{ "source_id": "<id>", "pains": [...] }

If the source contains no pain points, output: { "source_id": "<id>", "pains": [] }

SOURCE:
<<<
{transcript}
>>>
```

## Known limitations

- **Severity is over-confident on JD-routed input.** Workflow descriptions read as blockers. Mitigation: cross-source diversity weighting in the cluster score (Stage 3), not severity adjustment, to avoid losing the JD signal entirely.
- **`context_tag` enum is incomplete.** Procurement-shaped pains (e.g., "no trial pre-contract") land in `other` because the enum lacks a procurement value. Future iteration: extend the enum based on the first 50 outputs, not pre-specified.
- **Cannot infer severity from absence.** If a pain is omitted from a positive review, the pipeline treats it as not-present, not as not-a-pain. Manual review is required to know which pains were not surfaced.
