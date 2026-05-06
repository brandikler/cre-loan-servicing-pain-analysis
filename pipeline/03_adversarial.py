"""
Stage 4 — Adversarial pass on top-5 clusters
=============================================

This script is a RECORD of the actual pipeline run that produced
adversarial_outputs.json and adversarial_memo.md, NOT a re-runnable
API-calling pipeline.

For each of the top 5 clusters from Stage 3, the adversarial prompt
in /prompts/adversarial_prompt.md was applied to produce:
  - the strongest counter-argument an exec would raise
  - a falsifiability test with explicit confirm and kill signals
  - a cheapest validation experiment with ship/kill thresholds
  - a calibrated 0-100 confidence score with explicit justification

Note: the top 5 chosen here (C6, C1, C8, C2, C5) are NOT the top 5 by
raw composite score from Stage 3. C5 (loan boarding) is included
despite a low raw score because of its strategic relevance to
third-party servicers. The adversarial pass intentionally surfaces
this overreach in its counter-argument; see C5 in adversarial_outputs.json.

To re-execute against an updated cluster set:
  1. Read clusters.json
  2. For each top-N cluster, send the cluster summary + supporting
     quotes to Claude API with the adversarial prompt.
  3. Parse the structured JSON output per cluster.

Outputs:
  - adversarial_outputs.json
  - adversarial_memo.md
"""

"""
Apply the adversarial layer prompt to the top 5 clusters.
Produces:
  - adversarial_outputs.json (machine-readable)
  - adversarial_memo.md (human-readable, becomes the synthesis memo body)
"""
import json

# Top 5 clusters from the ranking, in order:
# C6, C1, C8, C2, C5

# ============================================================
# C6 — Vendor support quality, responsiveness & release management
# ============================================================
C6 = {
    "cluster_id": "C6",
    "label": "Vendor support quality, responsiveness & release management",
    "supporting_evidence_summary": (
        "7 pains, 6 high-severity, across 4 unique sources (Nortridge, nCino, "
        "LoanIQ, Sany Capital JD) and 3 source types (Review, Reddit, "
        "job_description). Includes: bug-fix cycles 6+ months, customers running "
        "UAT for vendor releases, undisclosed server moves, no rollback process, "
        "vendor resolution delays bleeding over reporting periods."
    ),
    "counter_argument": (
        "Five of seven pains in this cluster come from Nortridge customers — a "
        "smaller, mid-market loan-servicing platform. The cluster looks larger "
        "than it is because Nortridge is over-represented in the corpus (8 of 40 "
        "source rows, ~20%). The major commercial-servicing platforms relevant "
        "to Trimont (Black Knight MSP, Mortgage Cadence, McCracken, Sagent, FIS "
        "LoanServ) are not in the corpus at all due to thin public review "
        "presence, so we can't conclude that vendor-support pain is a "
        "market-wide phenomenon — it may be a Nortridge-specific quality "
        "problem. More fundamentally: 'vendor support is bad' is not a product "
        "shape Trimont can productize. Trimont is a servicer, not a platform "
        "vendor. Even for TriVinna's platform side, 'we have better support' is "
        "table stakes, not a differentiator. This theme reads as venting, not as "
        "an addressable opportunity."
    ),
    "falsifiability": {
        "question": (
            "Of all the platform-related friction your team experiences in a "
            "typical month, what percentage is attributable to (a) vendor "
            "support response time, (b) vendor release defects, (c) vendor "
            "inability to fix bugs, versus (d) inherent product-feature gaps?"
        ),
        "who_to_ask": (
            "8 servicing operations leaders (VP/Director level) at firms using "
            "Black Knight MSP, Mortgage Cadence, McCracken Strategy, Sagent, or "
            "FIS LoanServ — explicitly excluding Nortridge customers, since "
            "they are the source of the existing signal."
        ),
        "confirm_signal": (
            "≥40% of friction attributed to categories a–c at >50% of firms "
            "interviewed. Confirms vendor-support pain is market-wide and not "
            "Nortridge-specific."
        ),
        "kill_signal": (
            "<20% of friction attributed to a–c at majority of firms; >60% "
            "attributed to product-feature gaps. Confirms vendor support is not "
            "the dominant pain on enterprise-grade platforms."
        ),
        "is_falsifiable": True
    },
    "validation_experiment": {
        "description": (
            "Scrape the next 30 days of new public reviews (G2, Capterra, "
            "Gartner Peer Insights, Reddit) for the five major commercial "
            "servicing platforms above. Code each review for support-related "
            "complaints using a fixed rubric."
        ),
        "estimated_cost_eng_days": 2,
        "decision_metric": (
            "% of new reviews from non-Nortridge platforms that explicitly "
            "mention vendor support quality, responsiveness, or release "
            "management as a negative."
        ),
        "ship_threshold": "≥25% of reviews mention these as a negative.",
        "kill_threshold": "<10% mention these as a negative."
    },
    "confidence": {
        "score": 50,
        "justification": (
            "Cluster is real but heavily Nortridge-weighted; corroborating "
            "voices (LoanIQ Gartner, nCino Reddit, Sany JD UAT line) are thin "
            "but independent. The 'customers run UAT for vendor releases' line "
            "is uniquely damning. Discount aggressively for source bias."
        )
    }
}

# ============================================================
# C1 — Manual / bespoke reporting & analytics
# ============================================================
C1 = {
    "cluster_id": "C1",
    "label": "Manual / bespoke reporting & analytics",
    "supporting_evidence_summary": (
        "7 pains, 6 high-severity, across 5 unique sources (CRE Analyst JD, "
        "Peachtree JD, Sany Capital JD, Capital Markets JD, Nortridge) and 2 "
        "source types (job_description, Review). Includes: weekly portfolio "
        "updates manually compiled, QARs hand-built each quarter, KPI reports "
        "require eng team + Power BI, analysts using SQL to work around "
        "platform UI."
    ),
    "counter_argument": (
        "Six of seven pains come from job descriptions. JDs describe what an "
        "analyst is HIRED to do, not necessarily what the platform fails to do. "
        "'Develop reporting data' and 'prepare weekly portfolio updates' may "
        "simply be the role of an analyst at a financial firm — every business "
        "needs custom views that no platform can pre-build, and judgment-based "
        "narrative reporting will always need a human. Excel + Power BI is not "
        "evidence of platform failure; it's the industry-standard finance "
        "tooling stack. The corpus may be confusing 'analyst does report-building "
        "work' with 'platform should automate report-building.' Building a "
        "self-serve reporting layer might displace 30% of grunt work but leave "
        "the underlying job structure unchanged — questionable ROI for a product "
        "investment."
    ),
    "falsifiability": {
        "question": (
            "If you had a self-serve reporting layer that could generate 80% of "
            "your standard portfolio reports without analyst intervention, "
            "would you (a) reduce headcount, (b) keep headcount but redirect "
            "to higher-value analysis, or (c) it wouldn't change your team "
            "structure because the work isn't really about report production?"
        ),
        "who_to_ask": (
            "8 heads of loan operations or servicing at lender/servicer firms "
            "with $50M+ AUM."
        ),
        "confirm_signal": (
            "≥6 of 8 select (a) or (b). Implies the manual reporting work has "
            "real opportunity cost and a self-serve layer would shift labor."
        ),
        "kill_signal": (
            "≥4 of 8 select (c). Implies bespoke reporting IS the analyst's "
            "value-add, and automating it doesn't change the role."
        ),
        "is_falsifiable": True
    },
    "validation_experiment": {
        "description": (
            "Build a thin demo: given a portfolio CSV (or anonymized loan "
            "data), generate the kind of weekly/monthly portfolio updates and "
            "QAR-shape reports described in the JDs. Show it to 5 friendly "
            "servicing analysts (LinkedIn outreach + 30-min calls). Behavioral "
            "metric: do they ask integration questions, or politely thank you "
            "and move on?"
        ),
        "estimated_cost_eng_days": 4,
        "decision_metric": (
            "Average number of unprompted integration/adoption questions per "
            "demo (e.g., 'how would this connect to our system?', 'can I try "
            "this on our portfolio?', 'who would I talk to to get this?')."
        ),
        "ship_threshold": "Average ≥3 integration questions across 5 demos.",
        "kill_threshold": "Average <1 integration question across 5 demos."
    },
    "confidence": {
        "score": 65,
        "justification": (
            "Best cross-source corroboration in the corpus (5 unique sources). "
            "Penalty: 6 of 7 pains are JD-derived, which over-states severity. "
            "The Capital Markets JD's 'analysts use SQL to work around the "
            "platform' is independent corroboration of platform reporting "
            "weakness, not just job duty."
        )
    }
}

# ============================================================
# C8 — Customization & extensibility barriers
# ============================================================
C8 = {
    "cluster_id": "C8",
    "label": "Customization & extensibility barriers (APIs, modeling, fit)",
    "supporting_evidence_summary": (
        "6 pains, only 1 high-severity, across 4 unique sources (Abrigo, "
        "LoanIQ, CRE Analyst JD, Nortridge) and 3 source types. Includes: "
        "Abrigo geared to consumer not commercial, LoanIQ insufficient "
        "customization, sparse API docs, undocumented programming languages, "
        "even simple changes need developer support, servicing platforms can't "
        "model financials forcing Excel."
    ),
    "counter_argument": (
        "This cluster mixes two distinct pains glued together by superficial "
        "similarity: (a) 'platform doesn't fit my segment' (Abrigo "
        "consumer-vs-commercial, servicing platforms not built for CRE "
        "financial modeling) and (b) 'customizing the platform is hard' "
        "(Nortridge sparse API docs, dev support required). These are "
        "different products: (a) is a positioning/strategy problem solved by "
        "vertical-specific platforms; (b) is a developer-experience problem "
        "solved by better SDKs and docs. Treating them as one cluster will "
        "produce a muddled product recommendation. Also: only 1 of 6 pains is "
        "high-severity. The rest are friction, not blockers — which suggests "
        "users have built workarounds and customization-pain is annoying but "
        "not deal-killing."
    ),
    "falsifiability": {
        "question": (
            "What's the single most important workflow your servicing platform "
            "doesn't natively support, that you've built around in Excel or "
            "via custom development? Describe the workflow and how you "
            "currently handle it."
        ),
        "who_to_ask": (
            "12 CRE loan-servicing analysts and managers, weighted toward "
            "third-party servicers (Trimont's competitive set) and life-co/"
            "debt-fund servicing arms."
        ),
        "confirm_signal": (
            "≥7 of 12 cite a CRE-specific workflow (rent rolls, covenant "
            "tracking, draw management, watchlist, QAR generation). This "
            "confirms the dominant theme is 'platforms aren't CRE-native "
            "enough' — the (a) variant of the cluster — and the customization "
            "pain is downstream of vertical fit."
        ),
        "kill_signal": (
            "≥5 of 12 cite cross-vertical workflows (financial modeling, "
            "custom reporting, integration plumbing). This means the gap is "
            "universal extensibility, not CRE-specific — kills the "
            "'CRE-native platform' positioning angle and forces split into "
            "(a) and (b) clusters."
        ),
        "is_falsifiable": True
    },
    "validation_experiment": {
        "description": (
            "Audit public API docs and developer forum activity (Stack "
            "Overflow tags, GitHub issues if available) for the 5 commercial "
            "servicing platforms. Count: (1) breadth of API surface, (2) doc "
            "quality (presence of tutorials, working examples), (3) "
            "frequency of unresolved questions. Compare to a known "
            "developer-friendly SaaS benchmark (e.g., Stripe) for reference."
        ),
        "estimated_cost_eng_days": 3,
        "decision_metric": (
            "Composite developer-experience index: (API surface score × "
            "doc-quality score) ÷ (unresolved-question rate)."
        ),
        "ship_threshold": (
            "Index for top 3 servicing platforms < 30% of Stripe benchmark — "
            "confirms broad market gap in developer experience."
        ),
        "kill_threshold": (
            "Index ≥ 60% of Stripe benchmark — major platforms have adequate "
            "DX, customization pain is niche or skill-gap on customer side."
        )
    },
    "confidence": {
        "score": 50,
        "justification": (
            "Decent cross-source signal but cluster is plausibly two themes "
            "merged. Severity is mostly medium, suggesting friction not "
            "blocker. Recommend splitting into (a) vertical fit and (b) "
            "developer experience before promoting either as a roadmap "
            "anchor."
        )
    }
}

# ============================================================
# C2 — Reconciliation drift between systems & reports
# ============================================================
C2 = {
    "cluster_id": "C2",
    "label": "Reconciliation drift between systems & reports",
    "supporting_evidence_summary": (
        "4 pains, 4 high-severity, across only 2 unique sources (Trazmo, "
        "Capital Markets JD) but 2 source types (Vendor Perspective, "
        "job_description). Trazmo articulates: recon drift, manual work in "
        "money events, recon-becomes-full-time-job-driving-system-switches. "
        "Capital Markets JD: org developing recon procedures, capital "
        "provider reports don't naturally match business-level reports."
    ),
    "counter_argument": (
        "This cluster looks better-corroborated than it is. Two unique "
        "sources only: Trazmo (a vendor with obvious incentive to claim "
        "recon is a major industry pain — they sell recon software) and a "
        "single Capital Markets JD. Trazmo wrote three separate quotes; the "
        "JD contributed two responsibility lines. Strip away the framing and "
        "this is one vendor's narrative plus one company's job posting. The "
        "pain may be very real, but the corpus does not strongly establish "
        "it across user voices. There is zero direct user testimony — no G2 "
        "review, no Reddit complaint, no LinkedIn post — saying 'reconciling "
        "between my servicing platform and capital provider reports is "
        "killing me.' Suspect the Trazmo founder has identified a real "
        "problem AND has a strong incentive to make it sound bigger than it "
        "is."
    ),
    "falsifiability": {
        "question": (
            "When you produce monthly reports for capital providers (or "
            "investors, or trustees), what percentage of the time do the "
            "totals reconcile to your internal books on the first attempt? "
            "When they don't, how long does reconciliation typically take, "
            "and what's the most common cause?"
        ),
        "who_to_ask": (
            "10 capital-markets, fund-administration, or loan-operations "
            "leaders at lender/servicer firms with active capital-provider "
            "reporting obligations (CMBS issuers, debt funds, life-co loan "
            "servicers, balance-sheet lenders with warehouse facilities)."
        ),
        "confirm_signal": (
            "≥6 of 10 report <80% first-attempt reconciliation match AND "
            "name a consistent cause (e.g., timing differences in fee "
            "accruals, write-downs, modifications, paydowns). Persistent "
            "drift is real and structural."
        ),
        "kill_signal": (
            "≥6 of 10 report >95% first-attempt match. Recon drift is not a "
            "material industry pain and Trazmo is overselling."
        ),
        "is_falsifiable": True
    },
    "validation_experiment": {
        "description": (
            "Build a small CLI tool: input two CSVs (a servicing-system "
            "extract and an accounting/capital-provider extract), output a "
            "reconciliation diff with categorized variances (timing, "
            "amount, missing, duplicated). Demo to 3 friendly capital-"
            "markets analysts. Behavioral test: do they request to try it "
            "on real (anonymized) data within a week of demo?"
        ),
        "estimated_cost_eng_days": 3,
        "decision_metric": (
            "Number of demos resulting in an unprompted 'can I try this on "
            "real data' request within 7 days."
        ),
        "ship_threshold": "≥2 of 3 demos result in real-data trial requests.",
        "kill_threshold": (
            "0 of 3 demos result in real-data requests; analysts express "
            "polite interest but no urgency."
        )
    },
    "confidence": {
        "score": 55,
        "justification": (
            "If real, this is the most strategically important pain in the "
            "corpus — it's the one Trazmo's founder believes drives system "
            "switching. But corpus evidence is structurally weak (one "
            "vendor + one JD, zero direct user voice). Confidence should be "
            "moderate until validated. Strongest single thing in the memo's "
            "favor: independent corroboration between a vendor saying it's "
            "a market problem and an enterprise lender's job posting that "
            "treats it as a staffed-against problem."
        )
    }
}

# ============================================================
# C5 — Loan boarding handoff broken
# ============================================================
C5 = {
    "cluster_id": "C5",
    "label": "Loan boarding handoff broken (origination → servicing)",
    "supporting_evidence_summary": (
        "1 pain, high-severity, from 1 source (Peachtree JD): 'Loan boarding "
        "is a manual handoff. Origination → servicing data flow is broken or "
        "absent; analyst manually facilitates onboarding for both originated "
        "and acquired loans.' Tangentially supported by Sany JD's contract "
        "data-entry pain."
    ),
    "counter_argument": (
        "This is one pain from one job description. There is no user voice "
        "in the corpus directly attesting to boarding pain — the entire "
        "'finding' is built from the inference that 'JD mentions onboarding "
        "as analyst responsibility, therefore boarding is broken.' That "
        "inference is plausible but not established. Most lending "
        "organizations split origination and servicing teams; some manual "
        "handoff is structural to the industry, not a product gap. "
        "Including this in the top 5 is overreach driven by Trimont-"
        "relevance bias rather than evidence weight. A hiring manager will "
        "notice if you weight it equally with cross-source themes."
    ),
    "falsifiability": {
        "question": (
            "Walk me through what happens when a new loan transitions from "
            "origination to servicing at your firm. Specifically: how many "
            "data fields require manual entry or correction on day 1, what "
            "fields are typically missing or wrong, and how long until the "
            "loan is 'cleanly boarded' in your servicing system?"
        ),
        "who_to_ask": (
            "8 servicing operations leaders at lenders that originate loans "
            "in-house, plus 4 servicing leaders at third-party servicers "
            "(Trimont's competitive set: Situs, KeyBank Real Estate Capital, "
            "Walker & Dunlop)."
        ),
        "confirm_signal": (
            "≥8 of 12 describe ≥3 manual data-entry steps OR routinely "
            "wrong/missing fields on day 1, AND clean-boarding takes >5 "
            "business days on average. Confirms boarding is a real pain."
        ),
        "kill_signal": (
            "≥8 of 12 say boarding is largely automated, with <2 manual "
            "steps and clean-boarding in ≤2 days. Pain doesn't exist or has "
            "already been solved by mainstream platforms."
        ),
        "is_falsifiable": True
    },
    "validation_experiment": {
        "description": (
            "Three 30-minute interviews with servicing operations leaders, "
            "specifically about loan boarding. Code answers for: (1) # of "
            "manual data steps reported, (2) typical defects on day 1, "
            "(3) days-to-clean-boarded, (4) what tooling currently bridges "
            "origination → servicing."
        ),
        "estimated_cost_eng_days": 1,
        "decision_metric": (
            "Average number of manual data-entry steps reported during "
            "boarding."
        ),
        "ship_threshold": (
            "Average ≥4 manual steps OR average days-to-clean-boarded ≥5."
        ),
        "kill_threshold": (
            "Average ≤1 manual step AND days-to-clean-boarded ≤2."
        )
    },
    "confidence": {
        "score": 35,
        "justification": (
            "Hypothesis with one data point, not a finding. The pain is "
            "plausible and uniquely Trimont-relevant — boarding is literally "
            "Trimont's handoff point as a third-party servicer. But the "
            "corpus does not establish it. Treat as a 'hypothesis worth "
            "interviewing' in the memo, not a validated insight. The honest "
            "framing is: 'Given Trimont's business model, this is the area "
            "where I would invest the next 3 user interviews if I joined.'"
        )
    }
}

ALL = [C6, C1, C8, C2, C5]

# ============================================================
# OUTPUT 1: JSON
# ============================================================
out_json = '/sessions/kind-hopeful-edison/mnt/outputs/adversarial_outputs.json'
with open(out_json, 'w') as f:
    json.dump(ALL, f, indent=2)

# ============================================================
# OUTPUT 2: Markdown memo body
# ============================================================
md = ['# Adversarial Pass — Top 5 Themes\n']
md.append('*Output of the adversarial-layer prompt applied to the top 5 ranked clusters from the synthesis pipeline. This is the body of the synthesis memo: counter-arguments, falsifiability tests, validation experiments, and calibrated confidence per theme.*\n')
md.append('---\n')

for i, c in enumerate(ALL, 1):
    md.append(f'## #{i} — {c["label"]} (`{c["cluster_id"]}`)\n')
    md.append(f'**Supporting evidence:** {c["supporting_evidence_summary"]}\n')
    md.append('### Counter-argument\n')
    md.append(c['counter_argument'])
    md.append('\n### Falsifiability test\n')
    md.append(f'**Question:** {c["falsifiability"]["question"]}\n')
    md.append(f'**Who to ask:** {c["falsifiability"]["who_to_ask"]}\n')
    md.append(f'**Confirm signal:** {c["falsifiability"]["confirm_signal"]}\n')
    md.append(f'**Kill signal:** {c["falsifiability"]["kill_signal"]}\n')
    md.append(f'**Is falsifiable:** {c["falsifiability"]["is_falsifiable"]}\n')
    md.append('### Cheapest validation experiment\n')
    md.append(f'**Experiment:** {c["validation_experiment"]["description"]}\n')
    md.append(f'**Estimated cost:** {c["validation_experiment"]["estimated_cost_eng_days"]} eng-days\n')
    md.append(f'**Decision metric:** {c["validation_experiment"]["decision_metric"]}\n')
    md.append(f'**Ship threshold:** {c["validation_experiment"]["ship_threshold"]}\n')
    md.append(f'**Kill threshold:** {c["validation_experiment"]["kill_threshold"]}\n')
    md.append('### Confidence\n')
    md.append(f'**Score:** {c["confidence"]["score"]}/100\n')
    md.append(f'**Justification:** {c["confidence"]["justification"]}\n')
    md.append('---\n')

with open('/sessions/kind-hopeful-edison/mnt/outputs/adversarial_memo.md', 'w') as f:
    f.write('\n'.join(md))

# ============================================================
# OUTPUT 3: Confidence summary table
# ============================================================
print('=== Adversarial pass — confidence summary ===')
print(f'{"Cluster":<10} {"Theme":<55} {"Conf":>5}')
print('-' * 75)
for c in ALL:
    label_trunc = c['label'][:50] + '...' if len(c['label']) > 50 else c['label']
    print(f'{c["cluster_id"]:<10} {label_trunc:<55} {c["confidence"]["score"]:>5}')
print()
print(f'Saved JSON: {out_json}')
print('Saved Markdown: /sessions/kind-hopeful-edison/mnt/outputs/adversarial_memo.md')
