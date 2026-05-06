# Eval — Ground Truth

Hand-coded extractions for 5 sources, performed before pipeline execution to establish a ground-truth baseline against which the pipeline's structured outputs are compared. The 5 sources span all 5 source types in the corpus: job_description, Review (G2/Gartner), Reddit, Vendor Perspective, and a multi-pain Review used to validate de-duplication.

For each source, this document records:
- The source text (verbatim)
- The extraction I would produce manually, before seeing the pipeline output

The pipeline-vs-ground-truth comparison lives in [`eval_results.md`](eval_results.md).

---

## Source 1 — JD - Peachtree Loan Servicing Analyst (row 15, `job_description`)

**Source text (Quick Note routing — workflow→pain pre-translation):**

> Covenant compliance is "ad-hoc review" — not automated covenant tracking. Analyst reads loan docs to verify compliance manually. Direct covenant-tracking pain.

**Hand-coded extraction:**

```json
{
  "pain_summary": "Manual covenant compliance review; no automated tracking",
  "verbatim_quotes": [
    "Covenant compliance is \"ad-hoc review\" — not automated covenant tracking",
    "Analyst reads loan docs to verify compliance manually"
  ],
  "severity_signal": "high",
  "dollar_signal": null,
  "user_segment": "Loan servicing analyst",
  "proposed_solution": null,
  "context_tag": "core_workflow"
}
```

**Notes:** Severity = high because covenant breaches carry direct financial consequences (loan defaults, regulatory exposure) and "ad-hoc review" implies the analyst catches violations only when looking. JD-routed input — using the pre-translated Quick Note rather than raw responsibility-line text.

---

## Source 2 — Finastra LoanIQ (row 4, `Review`, Gartner)

**Source text:**

> Overall Comment: "I am a daily user of Loan IQ. I use it for both bi-lateral and syndicated loan facility structures. I work in an area with non-traditional loans that often have customized features. We tend to have quite a few problems where we have to go back to Finastra to fix issues and the resolutions are not as quick as we need. This often bleeds over reporting periods which is problematic. It is a broad range product and I work for a very large company that is consolidating loans and Loan IQ is the primary loan system. I will say, other peers in my world prefer their existing loan systems over Loan IQ."
>
> What do you like most about the product or service? It is a product that can handle a wide array of loan products...
>
> What do you dislike most about the product or service? I find the research to be difficult and not intuitive. It took me a long time to figure out where to find things. I know our Operational personnel struggle to learn all of it and there is a long learning curve with it. We have some experienced ops personnel that do not know how to fairly simple tasks due to the complicated interface.

**Hand-coded extraction (2 pains):**

```json
{
  "source_id": "Finastra LoanIQ - row 4",
  "pains": [
    {
      "pain_summary": "Vendor issue resolution slow; bleeds over reporting periods",
      "verbatim_quotes": [
        "we have to go back to Finastra to fix issues and the resolutions are not as quick as we need",
        "This often bleeds over reporting periods which is problematic"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": "Daily user at very large enterprise consolidating loan systems; works on non-traditional loans with customized features",
      "proposed_solution": null,
      "context_tag": "support"
    },
    {
      "pain_summary": "Complex UI; experienced ops personnel struggle with simple tasks",
      "verbatim_quotes": [
        "I find the research to be difficult and not intuitive",
        "It took me a long time to figure out where to find things",
        "Operational personnel struggle to learn all of it",
        "experienced ops personnel that do not know how to [do] fairly simple tasks due to the complicated interface"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": "Operational personnel at large enterprise",
      "proposed_solution": null,
      "context_tag": "core_workflow"
    }
  ]
}
```

**Notes:** UI complexity is mentioned in 4 distinct ways. Hand-coded as **one pain with four supporting quotes**, not four pains — testing the dedup capability of the pipeline. The comparative statement "other peers in my world prefer their existing loan systems over Loan IQ" is competitive dissatisfaction signal, not a specific pain — deliberately excluded from extraction.

---

## Source 3 — nCino (row 29, `Reddit`)

**Source text:**

> nCino code is also held by duct tape so many null pointer exceptions. And their support is not very good. There's a rare few that are actually helpful/know what they're talking about. nCino is pure trash. That's why they refuse to provide either a hands-on trial period or any technical documentation at all until AFTER you sign the contract.

**Hand-coded extraction (3 pains):**

```json
{
  "source_id": "Ncino - row 29",
  "pains": [
    {
      "pain_summary": "Code quality poor; many null pointer exceptions",
      "verbatim_quotes": [
        "nCino code is also held by duct tape",
        "so many null pointer exceptions",
        "nCino is pure trash"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": null,
      "proposed_solution": null,
      "context_tag": "performance"
    },
    {
      "pain_summary": "Support quality poor; few competent reps",
      "verbatim_quotes": [
        "their support is not very good",
        "There's a rare few that are actually helpful/know what they're talking about"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": null,
      "proposed_solution": null,
      "context_tag": "support"
    },
    {
      "pain_summary": "No trial or technical documentation pre-contract",
      "verbatim_quotes": [
        "they refuse to provide either a hands-on trial period or any technical documentation at all until AFTER you sign the contract"
      ],
      "severity_signal": "medium",
      "dollar_signal": null,
      "user_segment": null,
      "proposed_solution": null,
      "context_tag": "procurement"
    }
  ]
}
```

**Notes:** `user_segment` correctly null — Reddit poster, identity unknown. Severity boosted to "high" by the explicit emotional language ("pure trash"). The third pain is procurement-shaped — the existing `context_tag` enum has no procurement value, which is itself a finding. Hand-coded as `procurement` to flag the enum gap.

---

## Source 4 — Trazmo (row 40, `Vendor Perspective`)

**Source text:**

> Reconciliation drift, numbers stop matching and no one trusts the reports

**Hand-coded extraction:**

```json
{
  "pain_summary": "Reconciliation drift; numbers stop matching; reports lose trust",
  "verbatim_quotes": [
    "Reconciliation drift, numbers stop matching and no one trusts the reports"
  ],
  "severity_signal": "high",
  "dollar_signal": null,
  "user_segment": "Loan servicing organizations (vendor articulation)",
  "proposed_solution": null,
  "context_tag": "core_workflow"
}
```

**Notes:** Severity = high based on the cumulative claim ("no one trusts the reports"). `user_segment` is honestly tagged as a *vendor's articulation* of who the user is, not a user's self-description — the source-bias label is human responsibility, not pipeline responsibility.

---

## Source 5 — Nortridge Loan System (row 32, `Review`, multi-pain)

**Source text:**

> This company attempts to make themselves look big and like they can handle big business, but when it comes to true support they cannot keep up.
>
> Pros: Better than having no account management software. I'm sure if you are just doing automobile or home loan financing, it probably works fine.
>
> Cons: Their User Interface is ancient and is not awful to use, but it's certainly not easy. I would HIGHLY recommend never using NLS provided hosting. Their hosting product is on a shared environment where one clients setup can affect another clients setup. Our software developers have found multiple bugs in their product and when we report them they either try to argue that it's not a bug or they take 6+ months to fix the bug. - NortRidge's support of their NLS product is horrible. * I would HIGHLY recommend never using NLS provided hosting. Their hosting product is on a shared environment where one clients setup can affect another clients setup. * We use their report server product (which is just a replicated MSSQL database) on their hosted platform and one time they moved it to a new server without telling us and changed the database path without telling us. Our internal manager asked them multiple times if their update would require and username, password, or server changes and they kept telling him 'No'. * They will only do software updates during standard business hours, so they have to take your business offline while they do it and you have to pray they don't cause new problems after the software updates are done. We most certainly had issues with bugs or problems after an update and they don't have a rollback process

**Hand-coded extraction (5 pains):**

```json
{
  "source_id": "Nortridge Loan System - row 32",
  "pains": [
    {
      "pain_summary": "Support is horrible; 6+ months to fix bugs; argues bugs aren't bugs",
      "verbatim_quotes": [
        "when it comes to true support they cannot keep up",
        "they either try to argue that it's not a bug or they take 6+ months to fix the bug",
        "NortRidge's support of their NLS product is horrible"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": "Licensed user with internal software developers",
      "proposed_solution": null,
      "context_tag": "support"
    },
    {
      "pain_summary": "User Interface is ancient and not easy to use",
      "verbatim_quotes": [
        "Their User Interface is ancient and is not awful to use, but it's certainly not easy"
      ],
      "severity_signal": "medium",
      "dollar_signal": null,
      "user_segment": null,
      "proposed_solution": null,
      "context_tag": "core_workflow"
    },
    {
      "pain_summary": "Shared hosting; one client's setup affects others",
      "verbatim_quotes": [
        "I would HIGHLY recommend never using NLS provided hosting",
        "Their hosting product is on a shared environment where one clients setup can affect another clients setup"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": "Hosted-platform customer",
      "proposed_solution": null,
      "context_tag": "performance"
    },
    {
      "pain_summary": "Vendor moved server and changed DB path without notification",
      "verbatim_quotes": [
        "they moved it to a new server without telling us and changed the database path without telling us",
        "Our internal manager asked them multiple times if their update would require and username, password, or server changes and they kept telling him 'No'"
      ],
      "severity_signal": "high",
      "dollar_signal": null,
      "user_segment": "Hosted-platform customer using report server / MSSQL replica",
      "proposed_solution": null,
      "context_tag": "support"
    },
    {
      "pain_summary": "Updates only during business hours; no rollback process",
      "verbatim_quotes": [
        "They will only do software updates during standard business hours, so they have to take your business offline while they do it",
        "you have to pray they don't cause new problems after the software updates are done",
        "We most certainly had issues with bugs or problems after an update and they don't have a rollback process"
      ],
      "severity_signal": "high",
      "dollar_signal": "take your business offline",
      "user_segment": "Hosted-platform customer",
      "proposed_solution": null,
      "context_tag": "support"
    }
  ]
}
```

**Notes:** Multi-pain review used as a stress test for both pain count and dedup. Five distinct pains captured — they look related at first read but each has a different root cause (support process, UI, hosting architecture, communication, release management). Tests the pipeline's ability to extract many pains from one source without collapsing them into a generic "Nortridge has issues" cluster.
