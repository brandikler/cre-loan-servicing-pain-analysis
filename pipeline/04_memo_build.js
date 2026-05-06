// ============================================================
// Stage 5 — Memo generation
// ============================================================
//
// This script is a RECORD of the actual memo-generation step,
// not an API-calling pipeline. It uses docx-js (npm package: docx)
// to assemble the synthesis memo from the encoded outputs of
// Stages 2-4 plus structural elements (persona, methodology,
// implications, recommended next steps, eval, appendix).
//
// Run:  node 04_memo_build.js
// Out:  External State of CRE Loan Servicing.docx
//
// To regenerate after corpus / cluster / adversarial changes,
// re-run Stages 2-4 and update the corresponding sections of
// this script (or refactor to read directly from outputs/*.json).
// ============================================================

// Build the EXTERNAL/PUBLIC version of the synthesis memo.
// Matches the Trimont-internal format (summary table at top, numbered implications,
// 3-column theme tables, persona card, recommended-next-steps table, eval comparison)
// with all Trimont/TriVinna references generalized for public publication.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
} = require('docx');

const F = "Arial";

// ===== helpers =====
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 120, ...opts.spacing },
  alignment: opts.alignment,
  children: [new TextRun({ text, font: F, size: opts.size || 22, bold: opts.bold, italics: opts.italics, color: opts.color })],
});
const Pmix = (runs, opts = {}) => new Paragraph({
  spacing: { after: 120, ...opts.spacing },
  alignment: opts.alignment,
  children: runs.map(r => new TextRun({ font: F, size: r.size || 22, ...r })),
});
const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, font: F, size: 32, bold: true, color: "1F4E79" })]
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, font: F, size: 26, bold: true, color: "2E5395" })]
});
const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, font: F, size: 22, bold: true, color: "555555" })]
});
const BULL = (text, opts = {}) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children: [new TextRun({ text, font: F, size: 22, ...opts })]
});
const BULLmix = (runs) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children: runs.map(r => new TextRun({ font: F, size: 22, ...r }))
});
const HR = () => new Paragraph({
  spacing: { before: 100, after: 200 },
  children: [],
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB", space: 1 } }
});
const SPACER = (h = 0) => new Paragraph({ spacing: { after: h }, children: [new TextRun({ text: "", font: F, size: 22 })] });

const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const cellOpts = {
    borders: opts.borders || borders,
    width: { size: opts.width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: opts.vAlign || "top",
  };
  if (opts.fill) cellOpts.shading = { fill: opts.fill, type: ShadingType.CLEAR };
  if (opts.rowSpan) cellOpts.rowSpan = opts.rowSpan;

  const children = Array.isArray(text)
    ? text
    : [new Paragraph({
        spacing: { after: 0 },
        alignment: opts.align,
        children: [new TextRun({ text, font: F, size: opts.size || 20, bold: opts.bold, italics: opts.italics, color: opts.color })]
      })];

  return new TableCell({ ...cellOpts, children });
}

// Specialized helper: a cell with multiple paragraphs (incl. bullets)
function cellPars(paragraphs, opts = {}) {
  return new TableCell({
    borders: opts.borders || borders,
    width: { size: opts.width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: opts.vAlign || "top",
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children: paragraphs,
  });
}

const docHeader = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: "State of the CRE Loan Servicing Market", font: F, size: 18, color: "777777", italics: true })]
  })]
});
const docFooter = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "Page ", font: F, size: 18, color: "777777" }),
      new TextRun({ children: [PageNumber.CURRENT], font: F, size: 18, color: "777777" }),
      new TextRun({ text: " · Brandi Kler · May 2026", font: F, size: 18, color: "777777" }),
    ]
  })]
});

// ===== TITLE BLOCK =====
const titleBlock = [
  new Paragraph({
    spacing: { before: 0, after: 100 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: "State of the CRE Loan Servicing Market", font: F, size: 44, bold: true })]
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "An AI-Synthesized Pain Atlas", font: F, size: 28, italics: true, color: "555555" })]
  }),
  Pmix([
    { text: "Author: ", bold: true }, { text: "Brandi Kler" },
    { text: "  ·  Date: ", bold: true }, { text: "May 2026" },
    { text: "  ·  Methodology: ", bold: true }, { text: "AI-augmented user research synthesis" },
    { text: "  ·  ", bold: true }, { text: "40 sources  ·  47 extracted pains" },
  ], { size: 18 }),
  HR(),
];

// ===== EXECUTIVE SUMMARY =====
const execSummary = [
  H1("Executive Summary"),
  Pmix([
    { text: "Headline. ", bold: true },
    { text: "Analysts are the de facto integration layer between origination, servicing, accounting, and capital-provider reporting. The opportunity is not better features — it is removing the manual seams between these domains." }
  ]),
  P("Commercial loan servicing analysts spend their days working around their platforms, not within them. Across 40 signals collected from G2, Gartner, Capterra, Reddit, vendor commentary, and active job descriptions, the dominant pains are not feature gaps but operational debt: bespoke reporting workflows, reconciliation drift between systems, vendor support friction, and the customization gymnastics required to make general-purpose lending platforms fit commercial real estate use cases."),
  P("Five themes surface from the synthesis. Each is paired with a counterargument, a falsifiability test, and a calibrated confidence score. The strongest cross-source insight is reconciliation drift; the most actionable is manual reporting; the most strategically important for a CRE-native platform is the loan boarding handoff — which the corpus suggests but does not yet establish."),
  SPACER(),

  // Summary table
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 4060, 900, 1400],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("Theme", { width: 3000, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Headline Finding", { width: 4060, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Score", { width: 900, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Confidence", { width: 1400, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("#1  Manual Reporting & Analytics", { width: 3000, bold: true }),
        cell("Analysts build QARs, portfolio updates, and KPI reports manually every period — SQL workarounds confirm platform gaps", { width: 4060 }),
        cell("29", { width: 900, align: AlignmentType.CENTER }),
        cell("65/100", { width: 1400, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("#2  Reconciliation Drift", { width: 3000, bold: true }),
        cell("Capital-provider reports don't match internal books; reconciliation becomes a recurring full-time job", { width: 4060 }),
        cell("16", { width: 900, align: AlignmentType.CENTER }),
        cell("55/100", { width: 1400, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("#3  Vendor Support & Release Quality", { width: 3000, bold: true }),
        cell("6+ month bug cycles; customers run UAT on vendor releases — real but Nortridge-weighted", { width: 4060 }),
        cell("32", { width: 900, align: AlignmentType.CENTER }),
        cell("50/100", { width: 1400, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("#4  Customization & Extensibility", { width: 3000, bold: true }),
        cell("Two distinct pains conflated: vertical fit gaps and developer-experience barriers", { width: 4060 }),
        cell("24", { width: 900, align: AlignmentType.CENTER }),
        cell("50/100", { width: 1400, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("#5  Loan Boarding Handoff", { width: 3000, bold: true }),
        cell("Origination → servicing data flow is manual or absent; structurally the highest-priority hypothesis for third-party CRE servicers", { width: 4060 }),
        cell("4", { width: 900, align: AlignmentType.CENTER }),
        cell("35/100", { width: 1400, align: AlignmentType.CENTER, bold: true }),
      ]}),
    ]
  }),
  SPACER(),
];

// ===== STRATEGIC IMPLICATIONS (numbered with big numerals) =====
function implRow(num, title, body) {
  return new TableRow({ children: [
    cell(num, {
      width: 800, fill: "1F4E79", color: "FFFFFF", bold: true, size: 36,
      align: AlignmentType.CENTER, vAlign: "center",
    }),
    cellPars([
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: title, font: F, size: 22, bold: true, color: "1F4E79" })]
      }),
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text: body, font: F, size: 22 })]
      })
    ], { width: 8560 }),
  ]});
}

const implications = [
  H1("Strategic Implications"),
  P("This memo was scoped to the analyst persona, not to any single product organization's competitive positioning. The findings, however, suggest four orientation points for product teams serving this market."),
  SPACER(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [800, 8560],
    rows: [
      implRow("1",
        "Attack the seams, not the features.",
        "The strongest finding (manual reporting) and the most strategically important hypothesis (reconciliation drift) both describe analysts gluing together systems that don't talk to each other. A platform that owns the integration layer between origination, servicing, accounting, and capital-provider reporting has a more defensible competitive position than one that wins on individual features. The incumbents have features; they don't have seams."
      ),
      implRow("2",
        "Loan boarding is the natural product wedge for third-party servicers.",
        "Theme #5 sits at the origination-to-servicing handoff — a workflow that third-party CRE servicers touch on every single new loan. The corpus does not yet validate this pain at scale (one strong data point), but the structural fit to the third-party servicing business model is unusually clean. For organizations whose business touches this handoff, it is also where a platform offering could deliver immediate operational efficiency to internal servicers while building the beachhead for an external offering. This is where the first discovery interviews should be invested."
      ),
      implRow("3",
        "Two audiences require two discovery tracks.",
        "This memo focuses on the CRE loan servicing analyst — the primary persona for an operational workflow layer. A parallel discovery track is needed for the institutional lender and investor audience: the capital providers who need portfolio-level visibility, market-data benchmarking, and early-warning signals on their positions. These users have different jobs-to-be-done, different data access expectations, and different definitions of value. An analytics layer powered by proprietary market data serves this audience, not the analyst."
      ),
      implRow("4",
        "Be skeptical of the highest raw scores.",
        "The two clusters with the highest composite scores — vendor support (Theme #3) and customization barriers (Theme #4) — are the least productizable findings. Vendor support is not a product shape; it is a service-delivery standard. Customization barriers collapse into two unrelated problems: vertical fit gaps and developer experience. Themes #3 and #4 are table-stakes signals rather than differentiation opportunities."
      ),
    ]
  }),
  HR(),
];

// ===== RECOMMENDED NEXT STEPS =====
const nextSteps = [
  H1("Recommended Next Steps"),
  P("If I were leading product at a CRE servicing platform today, this is the sequence I would run to validate, kill, or refine each hypothesis — ordered by domain-relevance to third-party servicers, research cost, and decision urgency."),
  SPACER(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [400, 1100, 3860, 3000, 1000],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("#", { width: 400, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Timing", { width: 1100, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Activity", { width: 3860, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Decision Metric", { width: 3000, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Cost", { width: 1000, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("1", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 1", { width: 1100 }),
        cell("3 × 30-min interviews with servicing ops leaders specifically on loan boarding: manual steps, day-1 defects, days-to-clean-boarded.", { width: 3860 }),
        cell("Ship if avg ≥ 4 manual steps or ≥ 5 days-to-clean. Kill if ≤ 1 step and ≤ 2 days.", { width: 3000 }),
        cell("1 day", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("2", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 2", { width: 1100 }),
        cell("8 interviews with servicing heads on manual reporting: \"If a self-serve layer eliminated 80% of standard reports, would you reduce headcount, redirect effort, or neither?\" Confirms or kills Theme #1 as a staffed-against pain vs. analyst value-add.", { width: 3860 }),
        cell("Ship if ≥ 6 of 8 select (a) or (b). Kill if ≥ 4 select (c).", { width: 3000 }),
        cell("3 days", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("3", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 2", { width: 1100 }),
        cell("10 interviews with capital markets / fund-admin leaders on reconciliation: \"What % of capital-provider reports reconcile to internal books on first attempt? What breaks?\" Validates or kills Theme #2.", { width: 3860 }),
        cell("Ship if ≥ 6 of 10 report < 80% first-attempt match with a named cause.", { width: 3000 }),
        cell("3 days", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("4", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 3", { width: 1100 }),
        cell("30-day scrape of G2, Capterra, Gartner, Reddit for Black Knight MSP, Mortgage Cadence, McCracken, Sagent, FIS LoanServ. Code for vendor-support and UI complaints. Rebalances Nortridge bias in Theme #3.", { width: 3860 }),
        cell("Ship Theme #3 if ≥ 25% of new reviews cite support as a negative across platforms.", { width: 3000 }),
        cell("2 days", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("5", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 3", { width: 1100 }),
        cell("Begin separate discovery track for institutional lender / investor persona. 5 interviews with CRE portfolio managers at life companies, debt funds, or balance-sheet lenders. Map their reporting needs and define what \"portfolio intelligence\" means to them.", { width: 3860 }),
        cell("Identify 3+ unmet needs that only proprietary market-data positioning can address.", { width: 3000 }),
        cell("3 days", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell("6", { width: 400, align: AlignmentType.CENTER, bold: true }),
        cell("Week 4", { width: 1100 }),
        cell("Build thin demo: given a portfolio CSV, generate a weekly portfolio update and a QAR-shaped report. Show to 5 servicing analysts. Behavioral metric: unprompted integration questions per demo.", { width: 3860 }),
        cell("Ship if avg ≥ 3 integration questions. Kill if avg < 1.", { width: 3000 }),
        cell("4 days", { width: 1000, align: AlignmentType.CENTER }),
      ]}),
    ]
  }),
  SPACER(),
  Pmix([
    { text: "Total research cost before any roadmap commitment: ", bold: true },
    { text: "~16 eng-days of validation experiments + 26 stakeholder interviews across 4 weeks. At the end of this sequence, the top-5 themes are confirmed, killed, or resized — and the roadmap is anchored to user behavior, not corpus inference." }
  ], { italics: false }),
  HR(),
];

// ===== PERSONA (card-style) =====
const persona = [
  H1("Persona"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3200, 6160],
    rows: [
      new TableRow({ children: [
        cellPars([
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "CRE Loan", font: F, size: 32, bold: true, color: "FFFFFF" })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Servicing Analyst", font: F, size: 32, bold: true, color: "FFFFFF" })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "Primary Persona", font: F, size: 18, italics: true, color: "FFFFFF" })] }),
        ], { width: 3200, fill: "1F4E79", vAlign: "center" }),
        cellPars([
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Where they work", font: F, size: 20, bold: true, color: "1F4E79" })] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: "Third-party servicers: Situs, KeyBank Real Estate Capital, Walker & Dunlop, and similar firms", font: F, size: 20 })] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 140 }, children: [new TextRun({ text: "Lender internal servicing arms: life companies, debt funds, balance-sheet lenders", font: F, size: 20 })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "What they own", font: F, size: 20, bold: true, color: "1F4E79" })] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: "Borrower payment processing · covenant tracking · watchlist management · draw processing · investor and capital-provider reporting", font: F, size: 20 })] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 0 }, children: [new TextRun({ text: "Daily tooling: legacy servicing platform + Excel models + email/PDF workflows", font: F, size: 20 })] }),
        ], { width: 6160 }),
      ]}),
    ]
  }),
  SPACER(),
  P("Note: This persona is the core internal user of third-party CRE servicers and the primary operational workflow audience for any platform serving this market. A parallel institutional lender / investor persona — served by a separate analytics layer — requires its own discovery track (see Recommended Next Steps #5).", { italics: true, size: 20, color: "555555" }),
  HR(),
];

// ===== METHODOLOGY =====
const methodology = [
  H1("Methodology"),
  P("This memo was produced via a four-stage AI-augmented synthesis pipeline. Each stage was instrumented for inspection; the pipeline was eval-tested against hand-coded ground truth before scaling."),
  H3("Pipeline"),
  BULLmix([{ text: "Stage 1 — Corpus collection. ", bold: true }, { text: "40 source rows across G2 (8), Gartner Peer Insights (3), Capterra/SoftwareAdvice (~6), Reddit (2), vendor commentary (3), and active job descriptions (23, parsed from public LinkedIn postings). Manual collection. No scrapers." }]),
  BULLmix([{ text: "Stage 2 — Per-document extraction. ", bold: true }, { text: "Each source row was processed through a structured-extraction prompt requiring verbatim-quote provenance, severity calibration, and pain-vs-feature distinction. Two pipelines: one for review/forum content, one for job descriptions (pre-translated workflow-to-pain via Quick Note column). 47 pains extracted across 38 of 40 sources." }]),
  BULLmix([{ text: "Stage 3 — Clustering. ", bold: true }, { text: "Manual semantic clustering by LLM at n=47. 47 pains grouped into 13 clusters. Composite ranking score = severity-weighted sum + (unique-source-IDs × unique-source-types)." }]),
  BULLmix([{ text: "Stage 4 — Adversarial pass. ", bold: true }, { text: "Top 5 clusters subjected to an adversarial prompt requiring (a) the strongest counterargument an exec would raise, (b) a falsifiable next research step with confirm/kill signals, (c) a cheapest validation experiment with behavioral metrics, (d) calibrated confidence (0–100)." }]),
  H3("Source Mix & Bias Notes"),
  Pmix([{ text: "JD over-representation (deliberate). ", bold: true }, { text: "23 of 40 source rows are job-description-derived. Commercial loan servicing platforms have very limited public review presence. JDs, treated as workflow-pain artifacts, proved richer in signal than thin G2 reviews. Trade-off: JDs over-state severity because every responsibility line reads as a blocker. This bias is corrected in the adversarial layer — JD-derived pains are discounted ~0.7x relative to user-voiced reviews." }]),
  Pmix([{ text: "Single-platform over-representation. ", bold: true }, { text: "8 of 40 source rows (20%) are reviews of a single mid-market platform (Nortridge). Concentration in the corpus inflates vendor-support and UI/UX themes. The major commercial-servicing platforms (Black Knight MSP, Mortgage Cadence, McCracken, Sagent, FIS LoanServ) have limited public review presence. Recommended Next Step #4 addresses this gap directly." }]),
  HR(),
];

// ===== TOP THEMES (3-column tables: Focus Area | Detail | Validation) =====
function themeTable(title, conf, evidence, evidenceNote, counter, counterNote, falsQ, falsWho, falsConfirm, expSummary) {
  return [
    H2(`Theme ${title}`),
    Pmix([
      { text: `${conf}/100  `, bold: true, size: 22, color: "1F4E79" },
      { text: "Confidence", italics: true, color: "555555", size: 20 }
    ]),
    SPACER(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1500, 5200, 2660],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cell("Focus Area", { width: 1500, bold: true, fill: "1F4E79", color: "FFFFFF" }),
          cell("Detail", { width: 5200, bold: true, fill: "1F4E79", color: "FFFFFF" }),
          cell("Validation", { width: 2660, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        ]}),
        new TableRow({ children: [
          cell("Evidence", { width: 1500, bold: true, fill: "EAF1F8" }),
          cellPars(evidence.map(b => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: b, font: F, size: 20 })] })), { width: 5200 }),
          cell(evidenceNote, { width: 2660, italics: true, color: "555555" }),
        ]}),
        new TableRow({ children: [
          cell("Counterargument", { width: 1500, bold: true, fill: "EAF1F8" }),
          cellPars(counter.map(b => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: b, font: F, size: 20 })] })), { width: 5200 }),
          cell(counterNote, { width: 2660, italics: true, color: "555555" }),
        ]}),
        new TableRow({ children: [
          cell("Falsifiability Test", { width: 1500, bold: true, fill: "EAF1F8" }),
          cellPars([
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: "Question: ", bold: true, font: F, size: 20 }), new TextRun({ text: falsQ, font: F, size: 20 })] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: "Who to ask: ", bold: true, font: F, size: 20 }), new TextRun({ text: falsWho, font: F, size: 20 })] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: falsConfirm, font: F, size: 20 })] }),
          ], { width: 5200 }),
          cell(expSummary, { width: 2660, italics: true, color: "555555" }),
        ]}),
      ]
    }),
    SPACER(),
  ];
}

const topThemes = [
  H1("Top 5 Themes — Evidence & Validation"),
  P("Themes are ordered by adversarial-pass confidence, not raw composite score. Each includes evidence summary, the strongest counterargument, falsifiability test, and cheapest validation experiment."),

  ...themeTable(
    "#1  Manual / Bespoke Reporting & Analytics", 65,
    [
      "7 pains, 6 high-severity, across 5 unique sources (CRE Analyst JD, Peachtree JD, Sany Capital JD, Capital Markets JD, Nortridge) and 2 source types",
      "Analysts use SQL to work around the platform UI — independent corroboration of platform weakness beyond job duty"
    ],
    "Best cross-source corroboration in corpus (5 unique sources). 6 of 7 pains are JD-derived — severity discounted accordingly.",
    [
      "JDs describe what an analyst is hired to do, not necessarily what the platform fails to do",
      "Excel and Power BI are industry-standard finance tooling — not evidence of platform failure",
      "Judgment-based narrative reporting requires a human regardless of platform quality"
    ],
    "Falsifiable: Yes. The SQL workaround line is the most independent corroborating signal — it implies analyst is circumventing the platform, not supplementing it.",
    "If a self-serve layer generated 80% of standard reports without analyst intervention, would you (a) reduce headcount, (b) redirect to higher-value work, or (c) it wouldn't change the team structure?",
    "8 heads of loan operations at servicer/lender firms with $50M+ AUM",
    "Confirm: ≥ 6 of 8 select (a) or (b). Kill: ≥ 4 select (c).",
    "Cheapest experiment: build a thin demo from a portfolio CSV; show to 5 analysts. Ship if avg ≥ 3 unprompted integration questions. Cost: 4 eng-days."
  ),

  ...themeTable(
    "#2  Reconciliation Drift Between Systems & Reports", 55,
    [
      "4 pains, all 4 high-severity, across 2 unique sources (Trazmo vendor perspective, Capital Markets JD)",
      "Trazmo: recon drift drives full-time manual work and system switches. Capital Markets JD: org developing recon procedures from scratch; capital-provider reports don't match business-level reports"
    ],
    "Most strategically important hypothesis despite smaller raw count. Independent corroboration between a vendor claiming market pain and an enterprise lender staffing against it.",
    [
      "Two sources: one vendor with incentive to claim recon is a major pain, one JD. Strip framing and evidence is structurally thin.",
      "Zero direct user testimony — no G2, Reddit, or LinkedIn post saying \"reconciling between servicing and capital-provider reports is killing me.\"",
      "The pain may be real but the corpus does not establish it across user voices"
    ],
    "Falsifiable: Yes. Strongest signal if validated — a vendor in this space believes it drives platform switching.",
    "When you produce monthly reports for capital providers, what % reconcile to internal books on first attempt? When they don't, how long does recon take?",
    "10 capital markets / fund-admin / loan-ops leaders at firms with active capital-provider reporting obligations (CMBS issuers, debt funds, life-co servicers)",
    "Confirm: ≥ 6 of 10 report < 80% first-attempt match AND name a consistent cause. Kill: ≥ 6 report > 95% first-attempt match.",
    "Cheapest experiment: CLI tool — input two CSVs (servicing + capital-provider extracts), output reconciliation diff. Demo to 3 analysts. Ship if ≥ 2 of 3 request real-data trial within 7 days. Cost: 3 eng-days."
  ),

  ...themeTable(
    "#3  Vendor Support Quality, Responsiveness & Release Management", 50,
    [
      "7 pains, 6 high-severity, across 4 unique sources (Nortridge, nCino, LoanIQ, Sany Capital JD) and 3 source types",
      "Includes: bug-fix cycles 6+ months, customers running UAT on vendor releases, undisclosed server moves, no rollback process, vendor delays bleeding over reporting periods"
    ],
    "Cluster is real but Nortridge-weighted — 5 of 7 pains from Nortridge. \"Customers run UAT on vendor releases\" is uniquely damning regardless of platform.",
    [
      "5 of 7 pains from Nortridge — a smaller mid-market platform over-represented at 20% of corpus",
      "Major commercial-servicing platforms (Black Knight MSP, Mortgage Cadence, McCracken, Sagent, FIS LoanServ) are not in corpus — cannot conclude this is market-wide",
      "\"Better support\" is hygiene, not differentiation — not a productizable shape for product organizations operating at this layer"
    ],
    "Discount aggressively for source bias. This theme informs service-delivery standards and SLA commitments more than product roadmap.",
    "Of all platform-related friction in a typical month, what % is attributable to (a) vendor support response time, (b) release defects, (c) inability to fix bugs, vs. (d) inherent feature gaps?",
    "8 servicing ops leaders (VP/Director) at firms using Black Knight MSP, Mortgage Cadence, McCracken, Sagent, or FIS LoanServ — explicitly excluding the over-represented mid-market platform",
    "Confirm: ≥ 40% of friction attributed to a–c at > 50% of firms. Kill: < 20% attributed to a–c at majority.",
    "Cheapest experiment: scrape 30 days of new public reviews for the 5 major platforms, code for support complaints. Ship Theme #3 if ≥ 25% cite support. Kill if < 10%. Cost: 2 eng-days."
  ),

  ...themeTable(
    "#4  Customization & Extensibility Barriers", 50,
    [
      "6 pains, only 1 high-severity, across 4 unique sources (Abrigo, LoanIQ, CRE Analyst JD, Nortridge) and 3 source types",
      "Includes: Abrigo geared to consumer not commercial, LoanIQ insufficient customization, sparse API docs, undocumented languages, even simple changes need developer support, servicing platforms can't model financials forcing Excel"
    ],
    "Decent cross-source signal but cluster is plausibly two distinct themes merged. Severity is mostly medium.",
    [
      "This cluster mixes two distinct pains: (a) \"platform doesn't fit my segment\" — a positioning problem, and (b) \"customizing the platform is hard\" — a developer experience problem",
      "These require different product responses and should not be treated as one cluster",
      "Only 1 of 6 pains is high-severity — the rest are friction, not blockers"
    ],
    "Recommendation: split into (a) vertical fit and (b) developer experience before promoting either as a roadmap anchor.",
    "What's the single most important workflow your servicing platform doesn't natively support, that you've built around in Excel or via custom development?",
    "12 CRE loan-servicing analysts and managers, weighted toward third-party servicers and life-co/debt-fund arms",
    "Confirm: ≥ 7 of 12 cite a CRE-specific workflow (rent rolls, covenant tracking, draw management, watchlist, QAR). Kill: ≥ 5 cite cross-vertical workflows.",
    "Cheapest experiment: audit public API docs and developer forum activity for the 5 platforms; compare to a known DX benchmark (e.g., Stripe). Ship if top 3 score < 30%. Cost: 3 eng-days."
  ),

  ...themeTable(
    "#5  Loan Boarding Handoff — Origination → Servicing", 35,
    [
      "1 pain, high-severity, from 1 source (Peachtree JD): \"Loan boarding is a manual handoff. Origination → servicing data flow is broken or absent; analyst manually facilitates onboarding for both originated and acquired loans.\"",
      "Tangentially supported by Sany JD's contract data-entry pain"
    ],
    "One strong data point, not a finding. Honest framing: this is the hypothesis to prioritize validating first given third-party servicers' position at the origination-to-servicing handoff.",
    [
      "This is one pain from one job description — the entire finding is built on the inference that JD mentions onboarding = boarding is broken",
      "Most lending organizations split origination and servicing teams; some manual handoffs are structural to the industry, not a product gap",
      "Including this in top 5 risks promoting a hypothesis to a finding — acknowledge the evidence gap explicitly"
    ],
    "Reframe as a priority research question, not a validated pain. The structural fit with the third-party servicing business model is what makes it worth investigating, not the corpus evidence.",
    "Walk me through what happens when a new loan transitions from origination to servicing at your firm. How many fields require manual entry on day 1? What's typically missing or wrong? How long until cleanly boarded?",
    "8 servicing ops leaders at lenders that originate in-house + 4 at third-party servicers (e.g., Situs, KeyBank Real Estate Capital, Walker & Dunlop)",
    "Confirm: ≥ 8 of 12 describe ≥ 3 manual steps OR routinely wrong/missing fields AND clean boarding takes > 5 days. Kill: ≥ 8 say boarding largely automated.",
    "Cheapest experiment: 3 × 30-min interviews with servicing ops leaders specifically about loan boarding. Cost: 1 eng-day. This is the first call to make on Week 1."
  ),

  HR(),
];

// ===== LIMITATIONS & EVAL =====
const limitations = [
  H1("Limitations & Eval"),
  P("This section is disclosed because the synthesis is opinionated and the methodology is non-trivially novel."),
  H3("Methodology Limitations"),
  BULLmix([{ text: "Manual LLM clustering ", bold: true }, { text: "(Stage 3) is less reproducible than embedding-based methods — a different LLM run might split or merge clusters differently. The thematic finding is robust because corroboration is at the source level, not the cluster level." }]),
  BULLmix([{ text: "JD over-representation ", bold: true }, { text: "(23 of 40 rows): severity for JD-derived pains should be discounted ~0.7x relative to user-voiced reviews. Adversarial pass corrects for this implicitly via cross-source diversity scoring." }]),
  BULLmix([{ text: "Single-platform over-representation ", bold: true }, { text: "(8 of 40 rows, 20%, Nortridge): inflates apparent severity of vendor-support and UI/UX themes. Theme #3 validation experiment specifically targets this gap." }]),
  BULLmix([{ text: "Sparse coverage of major commercial servicing platforms ", bold: true }, { text: "(Black Knight MSP, Mortgage Cadence, McCracken, Sagent, FIS LoanServ): limited public review presence. Corpus relies on JDs and forum aggregates to triangulate." }]),
  H3("Eval — Hand-Coded Ground Truth"),
  P("Five sources were hand-coded by the author before pipeline execution. Pipeline outputs were compared against hand-coded results across three dimensions:"),
  SPACER(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 3480, 3480],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("Dimension", { width: 2400, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Pipeline Matched", { width: 3480, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Pipeline Failed — Corrected", { width: 3480, bold: true, fill: "1F4E79", color: "FFFFFF" }),
      ]}),
      new TableRow({ children: [
        cell("Verbatim-quote provenance", { width: 2400, bold: true }),
        cell("Every extracted pain included verbatim source quote; no inference-only extractions", { width: 3480 }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
      ]}),
      new TableRow({ children: [
        cell("Pain vs. feature distinction", { width: 2400, bold: true }),
        cell("Proposed solutions captured as proposed_solution, not standalone pains", { width: 3480 }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
      ]}),
      new TableRow({ children: [
        cell("De-duplication", { width: 2400, bold: true }),
        cell("Multi-mention LoanIQ UI complaint correctly collapsed to 1 pain with 4 supporting quotes", { width: 3480 }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
      ]}),
      new TableRow({ children: [
        cell("JD extraction", { width: 2400, bold: true }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
        cell("JDs returned empty extractions under strict \"user expresses friction\" prompt. Fix: route JD rows through Quick Note column (workflow→pain pre-translation). Two-line pipeline change.", { width: 3480 }),
      ]}),
      new TableRow({ children: [
        cell("JD severity", { width: 2400, bold: true }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
        cell("JDs defaulted to \"high\" severity. Mitigation: cross-source diversity weighting, not severity adjustment, to avoid losing JD signal entirely.", { width: 3480 }),
      ]}),
      new TableRow({ children: [
        cell("Context tag enum", { width: 2400, bold: true }),
        cell("—", { width: 3480, align: AlignmentType.CENTER, color: "999999" }),
        cell("Procurement-shaped pains landed in \"other\" — enum lacked procurement value. Fix: extend enum based on first 50 outputs, not pre-specified.", { width: 3480 }),
      ]}),
    ]
  }),
  SPACER(),
  H3("What the Pipeline Cannot Do"),
  BULLmix([{ text: "Cannot infer severity from absence ", bold: true }, { text: "— if a pain is omitted from a positive review, pipeline treats it as not-present, not as not-a-pain." }]),
  BULLmix([{ text: "Cannot judge source authenticity ", bold: true }, { text: "— vendor-perspective quotes were tagged at ingestion; the pipeline did not infer the source bias. Source labeling remains a human responsibility." }]),
  BULLmix([{ text: "Cannot validate findings without follow-up research ", bold: true }, { text: "— adversarial-pass falsifiability tests are designs, not data. The next phase is interviewing (see Recommended Next Steps)." }]),
  HR(),
];

// ===== APPENDIX =====
const appendix = [
  H1("Appendix"),
  H2("A. Corpus Statistics"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("Metric", { width: 4680, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Value", { width: 4680, bold: true, fill: "1F4E79", color: "FFFFFF" }),
      ]}),
      ...[
        ["Total source rows", "40"],
        ["Total pains extracted", "47"],
        ["Pains per source (avg)", "1.18"],
        ["Sources with 0 pains extracted", "2 (correctly: positive review, platform identifier)"],
        ["Severity: high / medium / low", "31 / 11 / 5"],
        ["Source types represented", "5 (Review, ForumAggregate, Reddit, Vendor Perspective, Job Description)"],
        ["Unique products / orgs in corpus", "9"],
        ["Total clusters identified", "13"],
        ["Top 5 clusters subjected to adversarial pass", "C1, C2, C5, C6, C8"],
      ].map(([k, v]) => new TableRow({ children: [
        cell(k, { width: 4680 }),
        cell(v, { width: 4680 }),
      ]}))
    ]
  }),
  SPACER(),

  H2("B. Full Cluster Ranking"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [400, 4400, 700, 700, 1000, 2160],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("#", { width: 400, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Theme", { width: 4400, bold: true, fill: "1F4E79", color: "FFFFFF" }),
        cell("Pains", { width: 700, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Score", { width: 700, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Confidence", { width: 1000, bold: true, fill: "1F4E79", color: "FFFFFF", align: AlignmentType.CENTER }),
        cell("Notes", { width: 2160, bold: true, fill: "1F4E79", color: "FFFFFF" }),
      ]}),
      ...[
        [1, "Vendor support quality, responsiveness & release management", 7, 32, "50", "Nortridge-weighted"],
        [2, "Manual / bespoke reporting & analytics", 7, 29, "65", "Strongest cross-source"],
        [3, "Customization & extensibility barriers", 6, 24, "50", "Two themes conflated"],
        [4, "Reconciliation drift between systems & reports", 4, 16, "55", "Most strategic if confirmed"],
        [5, "UI/UX complexity & long learning curve", 4, 15, "—", ""],
        [6, "Manual data ingest from borrowers/contracts", 4, 14, "—", ""],
        [7, "Code quality, performance & hosting", 3, 13, "—", ""],
        [8, "Manual covenant/event/trigger monitoring", 3, 11, "—", ""],
        [9, "Manual money-event workflows (draws, disbursements)", 2, 10, "—", ""],
        [10, "Pricing, missing features & procurement gaps", 3, 10, "—", ""],
        [11, "Manual compliance auditing", 2, 7, "—", ""],
        [12, "Loan boarding handoff broken", 1, 4, "35", "Third-party servicer structural wedge"],
        [13, "Process gap acknowledgment (meta)", 1, 3, "—", ""],
      ].map(row => new TableRow({ children: [
        cell(String(row[0]), { width: 400, align: AlignmentType.CENTER }),
        cell(row[1], { width: 4400 }),
        cell(String(row[2]), { width: 700, align: AlignmentType.CENTER }),
        cell(String(row[3]), { width: 700, align: AlignmentType.CENTER }),
        cell(String(row[4]), { width: 1000, align: AlignmentType.CENTER }),
        cell(row[5], { width: 2160, italics: true, color: "555555" }),
      ]}))
    ]
  }),
  SPACER(),
  P("Composite score = severity-weighted sum + (unique source IDs × unique source types). Severity weights: high=3, medium=2, low=1. Confidence is the 0–100 calibrated score from the adversarial pass; only top-5 clusters were fully processed.", { italics: true, size: 18, color: "555555" }),
  SPACER(),
  HR(),
  SPACER(60),
  P("The corpus is a starting point, not a conclusion.", { alignment: AlignmentType.CENTER, italics: true, size: 24, color: "1F4E79", bold: true }),
  P("The 26 interviews and validation experiments in the Recommended Next Steps section will either confirm this roadmap or save us from building the wrong thing.", { alignment: AlignmentType.CENTER, italics: true, size: 20, color: "555555" }),
];

// ===== ASSEMBLE =====
const doc = new Document({
  creator: "Brandi Kler",
  title: "State of the CRE Loan Servicing Market",
  description: "AI-synthesized pain atlas based on 40 cross-source signals.",
  styles: {
    default: { document: { run: { font: F, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: F, color: "1F4E79" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: F, color: "2E5395" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: F, color: "555555" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: { default: docHeader },
    footers: { default: docFooter },
    children: [
      ...titleBlock,
      ...execSummary,
      ...implications,
      ...nextSteps,
      ...persona,
      ...methodology,
      ...topThemes,
      ...limitations,
      ...appendix,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const out = "/sessions/kind-hopeful-edison/mnt/outputs/External State of CRE Loan Servicing.docx";
  fs.writeFileSync(out, buffer);
  console.log("Saved: " + out);
});
