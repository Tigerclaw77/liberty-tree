import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../normalization/text.mjs";

const UNKNOWN = "Unknown";
const WORKBENCH_SOURCE_ID = "SRC-WB-001";
const METRIC_SOURCE_ID = "SRC-METRIC-001";
const RULE_SOURCE_ID = "SRC-RULE-001";

const BASELINE_TIME_ESTIMATES = Object.freeze({
  previousAnalystAssemblyMinutes: 342,
  newAnalystAssemblyMinutes: 75,
  previousAnalystEngagementMinutes: 570,
  expertReviewMinutes: 150,
});

const ANALYST_ACTIONS = Object.freeze({
  VERIFIED: "VERIFIED",
  DUPLICATE: "DUPLICATE",
  IGNORED: "IGNORED",
  NEEDS_EXPERT_REVIEW: "NEEDS_EXPERT_REVIEW",
  MISSING_DOCUMENT: "MISSING_DOCUMENT",
});

const REQUIRED_VERIFIED_CATEGORIES = ["PFAS", "SDS"];

function padId(index) {
  return String(index).padStart(3, "0");
}

function refs(sourceIds) {
  return `[${sourceIds.filter(Boolean).join("; ")}]`;
}

function withRefs(statement, sourceIds) {
  return `${statement} ${refs(sourceIds)}`;
}

function normalizeQuery(query = {}) {
  return {
    manufacturer: query.manufacturer || UNKNOWN,
    product: query.product || UNKNOWN,
    productCode: query.productCode || query.product_code || "",
  };
}

function packetDate(value) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function isoDate(value) {
  return packetDate(value).toISOString().slice(0, 10);
}

function dateId(value) {
  return isoDate(value).replace(/-/g, "");
}

function displayDate(value) {
  if (!value) return UNKNOWN;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(parsed));
}

function documentKey(document) {
  return document.document_key || document.key || document.url || `${document.document_type}:${document.title}`;
}

function isIgnored(document) {
  return document.analyst_action === ANALYST_ACTIONS.IGNORED;
}

function isDuplicate(document) {
  return document.analyst_action === ANALYST_ACTIONS.DUPLICATE;
}

function isMissing(document) {
  return document.status === "MISSING" || document.analyst_action === ANALYST_ACTIONS.MISSING_DOCUMENT;
}

function isExpertReview(document) {
  return document.analyst_action === ANALYST_ACTIONS.NEEDS_EXPERT_REVIEW;
}

function isVerified(document) {
  return document.analyst_action === ANALYST_ACTIONS.VERIFIED;
}

function documentCategory(document) {
  const text = `${document.category || ""} ${document.document_type || ""} ${document.title || ""} ${document.url || ""}`.toLowerCase();
  if (text.includes("pfas") || text.includes("polyfluoro")) return "PFAS";
  if (text.includes("sds") || text.includes("msds") || text.includes("safety data sheet")) return "SDS";
  if (text.includes("tds") || text.includes("technical data sheet")) return "TDS";
  if (text.includes("rohs")) return "RoHS";
  if (text.includes("reach") || text.includes("svhc")) return "REACH";
  if (text.includes("tsca")) return "TSCA";
  if (text.includes("prop 65") || text.includes("prop65") || text.includes("calprop")) return "Prop 65";
  if (text.includes("environment")) return "Environmental";
  return document.category || document.document_type || "Other";
}

function reviewStatus(document) {
  if (isMissing(document)) return "Missing";
  if (isVerified(document)) return "Analyst verified";
  if (isExpertReview(document)) return "Needs expert review";
  if (isDuplicate(document)) return "Duplicate";
  if (isIgnored(document)) return "Ignored";
  if (document.status === "FOUND") return "Pending analyst verification";
  return "Candidate pending review";
}

function confidence(document) {
  return document.confidence || UNKNOWN;
}

function priorityForCategory(category) {
  if (category === "PFAS" || category === "SDS") return "High";
  if (category === "TDS" || category === "REACH" || category === "RoHS" || category === "TSCA" || category === "Prop 65") {
    return "Medium";
  }
  return "Low";
}

function packetId(query, generatedAt) {
  const scope = slugify(`${query.manufacturer}-${query.productCode || query.product}`);
  return `PFAS-PKT-${scope || "unknown"}-${dateId(generatedAt)}-DRAFT`;
}

function computeFallbackSummary(documents) {
  const activeDocuments = documents.filter((document) => !isIgnored(document));
  const missing = activeDocuments.filter(isMissing).length;
  const verified = activeDocuments.filter(isVerified).length;
  const needsExpert = activeDocuments.filter(isExpertReview).length;
  const possible = activeDocuments.filter((document) => document.status === "POSSIBLE").length;
  const found = activeDocuments.filter((document) => document.status === "FOUND").length;

  return {
    documents_found: found,
    possible_documents: possible,
    missing_documents: missing,
    documents_verified: verified,
    needs_expert_review: needsExpert,
    remaining_gaps: missing + needsExpert,
    estimated_packet_readiness: found > 0 && missing + needsExpert <= 3 ? "CONDITIONAL" : "NOT_READY",
  };
}

function buildMetrics() {
  const previous = BASELINE_TIME_ESTIMATES.previousAnalystAssemblyMinutes;
  const current = BASELINE_TIME_ESTIMATES.newAnalystAssemblyMinutes;
  const reduction = ((previous - current) / previous) * 100;
  const analystEngagementAfterAutomation = BASELINE_TIME_ESTIMATES.previousAnalystEngagementMinutes - (previous - current);
  const totalEngagementAfterAutomation = analystEngagementAfterAutomation + BASELINE_TIME_ESTIMATES.expertReviewMinutes;

  return {
    previous_analyst_assembly_minutes: previous,
    new_analyst_assembly_minutes: current,
    assembly_reduction_percent: reduction,
    previous_analyst_engagement_minutes: BASELINE_TIME_ESTIMATES.previousAnalystEngagementMinutes,
    new_analyst_engagement_minutes: analystEngagementAfterAutomation,
    expert_review_minutes: BASELINE_TIME_ESTIMATES.expertReviewMinutes,
    new_total_engagement_minutes: totalEngagementAfterAutomation,
  };
}

function hours(minutes) {
  return `${(minutes / 60).toFixed(1)} hours`;
}

function mapDocuments(documents) {
  const activeDocuments = documents.filter((document) => !isIgnored(document));
  const traceByKey = new Map();
  let docCount = 1;
  let srcCount = 1;

  for (const document of activeDocuments) {
    if (isMissing(document)) continue;
    const trace = {
      docId: `DOC-${padId(docCount)}`,
      sourceId: `SRC-${padId(srcCount)}`,
    };
    traceByKey.set(documentKey(document), trace);
    docCount += 1;
    srcCount += 1;
  }

  return { activeDocuments, traceByKey };
}

function traceFor(document, traceByKey) {
  return traceByKey.get(documentKey(document)) || {
    docId: UNKNOWN,
    sourceId: WORKBENCH_SOURCE_ID,
  };
}

function buildSourceRows({ documents, traceByKey, generatedAt }) {
  const rows = [
    [
      WORKBENCH_SOURCE_ID,
      UNKNOWN,
      "Workbench verified discovery export",
      "Workbench session",
      "Liberty Tree Compliance",
      displayDate(generatedAt),
      displayDate(generatedAt),
      "document-discovery workbench session",
      "All packet sections",
      "Draft",
      "Supports query metadata, document counts, analyst decisions, and generated gaps.",
    ],
    [
      METRIC_SOURCE_ID,
      UNKNOWN,
      "Liberty Tree Engagement Time Study",
      "Internal validation source",
      "Liberty Tree Compliance",
      "July 7, 2026",
      displayDate(generatedAt),
      "docs/validation/engagement-time-study.md",
      "Automation Metrics",
      "Baseline source",
      "Supports baseline analyst assembly and engagement-time estimates.",
    ],
    [
      RULE_SOURCE_ID,
      UNKNOWN,
      "Packet auto-assembly safeguard rules",
      "Generator rule set",
      "tools/document-discovery/packet/packet-assembler.mjs",
      displayDate(generatedAt),
      displayDate(generatedAt),
      "tools/document-discovery/packet/packet-assembler.mjs",
      "Executive Summary; Gap Summary; Automation Metrics",
      "Draft rule set",
      "Limits v1 output to source-indexed metadata, workbench decisions, and explicit unknowns.",
    ],
  ];

  for (const document of documents.filter((document) => !isMissing(document))) {
    const trace = traceFor(document, traceByKey);
    rows.push([
      trace.sourceId,
      trace.docId,
      document.title || UNKNOWN,
      document.document_type || UNKNOWN,
      document.manufacturer || UNKNOWN,
      document.revision_date || UNKNOWN,
      UNKNOWN,
      document.url || UNKNOWN,
      "Document Inventory; Evidence Matrix",
      reviewStatus(document),
      document.confidence_reason || "No additional source note provided by discovery output.",
    ]);
  }

  return rows;
}

function buildDocumentInventoryRows(documents, traceByKey, query) {
  return documents
    .filter((document) => !isMissing(document))
    .map((document) => {
      const trace = traceFor(document, traceByKey);
      return [
        trace.docId,
        trace.sourceId,
        documentCategory(document),
        document.title || UNKNOWN,
        document.manufacturer || query.manufacturer || UNKNOWN,
        document.revision_date || UNKNOWN,
        document.url || UNKNOWN,
        query.product || document.product || UNKNOWN,
        reviewStatus(document),
        confidence(document),
        withRefs(document.confidence_reason || "No discovery rationale was provided.", [trace.sourceId, WORKBENCH_SOURCE_ID]),
      ];
    });
}

function evidenceStatement(document, trace) {
  const base = `Workbench discovery located a ${document.document_type || "document"} record titled "${document.title || UNKNOWN}" with ${confidence(document)} confidence.`;
  const review = isVerified(document)
    ? "An analyst marked this record VERIFIED."
    : isExpertReview(document)
      ? "The analyst flagged this record for expert review."
      : "The record remains pending analyst verification.";

  return withRefs(`${base} ${review}`, [trace.sourceId, WORKBENCH_SOURCE_ID]);
}

function buildEvidenceRows(documents, traceByKey, query) {
  return documents
    .filter((document) => !isMissing(document) && !isDuplicate(document))
    .map((document, index) => {
      const trace = traceFor(document, traceByKey);
      const relatedGap = isExpertReview(document) ? "Expert-review gap" : UNKNOWN;
      return [
        `EVID-${padId(index + 1)}`,
        query.product || document.product || UNKNOWN,
        document.manufacturer || query.manufacturer || UNKNOWN,
        documentCategory(document),
        evidenceStatement(document, trace),
        trace.sourceId,
        trace.docId,
        "N/A - regulatory applicability not automated",
        reviewStatus(document),
        isVerified(document) ? "Analyst" : UNKNOWN,
        confidence(document),
        relatedGap,
      ];
    });
}

function existingMissingGapTitle(document) {
  const category = documentCategory(document);
  if (document.title && !document.title.toLowerCase().startsWith("missing ")) return document.title;
  return `${category} documentation not located`;
}

function buildMissingRows(documents, traceByKey, query) {
  const rows = [];
  const seenTitles = new Set();

  for (const document of documents.filter(isMissing)) {
    const category = documentCategory(document);
    const title = existingMissingGapTitle(document);
    const gapId = `GAP-${padId(rows.length + 1)}`;
    rows.push([
      gapId,
      title,
      query.product || document.product || UNKNOWN,
      document.manufacturer || query.manufacturer || UNKNOWN,
      withRefs(`This gap limits packet completeness for ${category}; it is not a compliance conclusion.`, [RULE_SOURCE_ID]),
      withRefs(document.confidence_reason || "The workbench marked this document class as missing.", [WORKBENCH_SOURCE_ID]),
      UNKNOWN,
      priorityForCategory(category),
      UNKNOWN,
      UNKNOWN,
      "Open",
      UNKNOWN,
    ]);
    seenTitles.add(`${category}:${title}`.toLowerCase());
  }

  for (const category of REQUIRED_VERIFIED_CATEGORIES) {
    const hasVerifiedCategory = documents.some((document) => !isMissing(document) && documentCategory(document) === category && isVerified(document));
    const key = `${category}:No analyst-verified ${category} record is present in the workbench evidence set.`.toLowerCase();
    if (hasVerifiedCategory || seenTitles.has(key)) continue;
    rows.push([
      `GAP-${padId(rows.length + 1)}`,
      `No analyst-verified ${category} record is present in the workbench evidence set.`,
      query.product || UNKNOWN,
      query.manufacturer || UNKNOWN,
      withRefs(`The packet cannot treat ${category} evidence as reviewed until an analyst verifies a source record.`, [RULE_SOURCE_ID]),
      withRefs("Generated from workbench decision state; located but unverified candidates may still exist.", [WORKBENCH_SOURCE_ID]),
      "Analyst",
      priorityForCategory(category),
      UNKNOWN,
      UNKNOWN,
      "Open",
      UNKNOWN,
    ]);
  }

  for (const document of documents.filter(isExpertReview)) {
    const trace = traceFor(document, traceByKey);
    rows.push([
      `GAP-${padId(rows.length + 1)}`,
      `Expert review required for ${document.title || document.document_type || "source record"}`,
      query.product || document.product || UNKNOWN,
      document.manufacturer || query.manufacturer || UNKNOWN,
      withRefs("The engine cannot decide technical sufficiency, PFAS presence or absence, or regulatory effect for this record.", [RULE_SOURCE_ID]),
      withRefs("Analyst marked the source as NEEDS_EXPERT_REVIEW.", [trace.sourceId, WORKBENCH_SOURCE_ID]),
      "Expert reviewer",
      "High",
      UNKNOWN,
      UNKNOWN,
      "Open",
      UNKNOWN,
    ]);
  }

  return rows;
}

function buildGapSummaryRows({ missingRows, documents }) {
  const unverifiedCount = documents.filter((document) => !isMissing(document) && !isDuplicate(document) && !isVerified(document)).length;
  const expertCount = documents.filter(isExpertReview).length;
  const missingCount = missingRows.length;

  return [
    [
      "Missing documentation",
      String(missingCount),
      missingCount > 0
        ? withRefs(`${missingCount} open documentation or verification gap(s) are listed in the missing documentation register.`, [WORKBENCH_SOURCE_ID])
        : withRefs("No missing-documentation gap rows were generated from the current workbench state; this is not a compliance conclusion.", [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID]),
    ],
    [
      "Expert judgment",
      String(expertCount),
      expertCount > 0
        ? withRefs(`${expertCount} source record(s) were flagged for expert review before client-ready use.`, [WORKBENCH_SOURCE_ID])
        : withRefs("No source records are currently marked NEEDS_EXPERT_REVIEW in the workbench state.", [WORKBENCH_SOURCE_ID]),
    ],
    [
      "Analyst verification",
      String(unverifiedCount),
      unverifiedCount > 0
        ? withRefs(`${unverifiedCount} non-duplicate source record(s) remain pending analyst verification.`, [WORKBENCH_SOURCE_ID])
        : withRefs("All non-duplicate source records in the packet evidence matrix are analyst-verified or otherwise resolved.", [WORKBENCH_SOURCE_ID]),
    ],
    [
      "Scope fields",
      "Unknown",
      withRefs("Client legal name, market scope, reviewer names, due dates, and closure evidence remain unknown because discovery output does not contain client intake or engagement-management records.", [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID]),
    ],
  ];
}

function appendixRows(sourceRows, evidenceRows, missingRows) {
  const sourceIds = sourceRows.map((row) => row[0]).join(", ");
  const evidenceIds = evidenceRows.map((row) => row[0]).join(", ") || UNKNOWN;
  const gapIds = missingRows.map((row) => row[0]).join(", ") || UNKNOWN;

  return [
    ["APP-A", "Source Index", sourceIds, "Source Index", "Draft"],
    ["APP-B", "Document Inventory Support", sourceIds, "Document Inventory", "Draft"],
    ["APP-C", "Evidence Matrix Support", evidenceIds, "Evidence Matrix", "Draft"],
    ["APP-D", "Missing Documentation Support", gapIds, "Missing Documentation Register; Gap Summary", "Draft"],
    ["APP-E", "Workbench Export And Safeguards", `${WORKBENCH_SOURCE_ID}, ${RULE_SOURCE_ID}`, "All sections", "Draft"],
  ];
}

function metricRows(metrics) {
  return [
    [
      "Previous estimated analyst packet assembly time",
      hours(metrics.previous_analyst_assembly_minutes),
      withRefs("Baseline includes packet assembly, source index and evidence matrix cleanup, executive summary and gap summary drafting, and final analyst QA.", [METRIC_SOURCE_ID]),
    ],
    [
      "New estimated analyst packet assembly time",
      hours(metrics.new_analyst_assembly_minutes),
      withRefs("V1 auto-assembly leaves analyst review, unknown-field cleanup, source spot checks, and expert-routing preparation.", [METRIC_SOURCE_ID, RULE_SOURCE_ID]),
    ],
    [
      "Estimated analyst assembly reduction",
      `${metrics.assembly_reduction_percent.toFixed(1)}%`,
      withRefs("Reduction is calculated from the baseline and v1 auto-assembly estimates.", [METRIC_SOURCE_ID, RULE_SOURCE_ID]),
    ],
    [
      "Estimated analyst/founder engagement time after automation",
      hours(metrics.new_analyst_engagement_minutes),
      withRefs("Previous analyst/founder delivery time is reduced by the packet assembly minutes eliminated by automation.", [METRIC_SOURCE_ID]),
    ],
    [
      "Estimated total engagement time after automation",
      `${hours(metrics.new_total_engagement_minutes)} including ${hours(metrics.expert_review_minutes)} expert review`,
      withRefs("Expert review time is preserved because v1 does not automate technical or legal judgment.", [METRIC_SOURCE_ID, RULE_SOURCE_ID]),
    ],
  ];
}

function table(headers, rows) {
  return { type: "table", headers, rows };
}

function paragraph(text) {
  return { type: "paragraph", text };
}

function list(items) {
  return { type: "list", items };
}

function buildSections({ packet, query, summary, metrics, sourceRows, documentRows, evidenceRows, missingRows, gapSummaryRows, appendixIndexRows }) {
  const coveredProduct = `${query.product || UNKNOWN}${query.productCode ? ` (${query.productCode})` : ""}`;

  return [
    {
      title: "Cover Page",
      blocks: [
        table(["Field", "Entry"], [
          ["Packet title", withRefs("PFAS Evidence Packet", [RULE_SOURCE_ID])],
          ["Prepared for", withRefs(`Unknown - discovery output identifies manufacturer "${query.manufacturer}" but does not provide client legal name.`, [WORKBENCH_SOURCE_ID])],
          ["Prepared by", withRefs("Liberty Tree Compliance", [WORKBENCH_SOURCE_ID])],
          ["Packet ID", withRefs(packet.id, [WORKBENCH_SOURCE_ID])],
          ["Version status", withRefs("Draft auto-assembled packet; analyst and expert review required before client-ready use.", [RULE_SOURCE_ID])],
          ["Issue date", withRefs(displayDate(packet.generatedAt), [WORKBENCH_SOURCE_ID])],
          ["Covered products", withRefs(coveredProduct, [WORKBENCH_SOURCE_ID])],
          ["Covered market or jurisdiction scope", withRefs("Unknown - not present in verified discovery output.", [WORKBENCH_SOURCE_ID])],
          ["Technical reviewer", withRefs("Unknown - expert review required for PFAS conclusions, regulatory applicability, SDS equivalence, declaration sufficiency, and risk language.", [RULE_SOURCE_ID])],
        ]),
      ],
    },
    {
      title: "Executive Summary",
      blocks: [
        paragraph(withRefs(`This draft packet was auto-assembled from the document-discovery workbench output for ${coveredProduct} and manufacturer ${query.manufacturer}.`, [WORKBENCH_SOURCE_ID])),
        paragraph(withRefs(`The current workbench state includes ${summary.documents_found || 0} found record(s), ${summary.possible_documents || 0} possible record(s), ${summary.documents_verified || 0} analyst-verified record(s), ${summary.missing_documents || 0} missing record(s), and ${summary.needs_expert_review || 0} expert-review flag(s).`, [WORKBENCH_SOURCE_ID])),
        paragraph(withRefs(`Workbench packet readiness is ${summary.estimated_packet_readiness || UNKNOWN}. This readiness value describes evidence-assembly status only and is not a compliance conclusion.`, [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID])),
        paragraph(withRefs("The engine states document-location facts, workbench review status, and explicit gaps only; it does not infer PFAS presence or absence, legal applicability, product-family equivalence, supplier authority, or declaration sufficiency.", [RULE_SOURCE_ID])),
        list([
          missingRows.length > 0
            ? withRefs(`${missingRows.length} gap row(s) require analyst or expert follow-up before client-ready use.`, [WORKBENCH_SOURCE_ID])
            : withRefs("No generated gap rows are present in this draft, but absence of generated gaps is not proof of completeness.", [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID]),
          withRefs(`The document inventory contains ${documentRows.length} indexed source document(s).`, [WORKBENCH_SOURCE_ID]),
          withRefs(`The evidence matrix contains ${evidenceRows.length} source-indexed candidate evidence row(s).`, [WORKBENCH_SOURCE_ID]),
        ]),
      ],
    },
    {
      title: "Document Inventory",
      blocks: [
        paragraph(withRefs("This section lists non-ignored source records from the verified discovery output. Missing records are tracked in the missing documentation register.", [WORKBENCH_SOURCE_ID])),
        table(
          ["Document ID", "Source ID", "Document type", "Title / description", "Issuer / custodian", "Issue date", "Location", "Related product", "Review status", "Confidence", "Notes"],
          documentRows.length > 0 ? documentRows : [["Unknown", WORKBENCH_SOURCE_ID, "Unknown", "No source records available", "Unknown", "Unknown", "Unknown", coveredProduct, "Pending", "Unknown", withRefs("No non-missing document records were available in the workbench output.", [WORKBENCH_SOURCE_ID])]],
        ),
      ],
    },
    {
      title: "Evidence Matrix",
      blocks: [
        paragraph(withRefs("Evidence statements in this v1 packet are limited to source-location and workbench-review facts. Source content conclusions require analyst or expert review.", [RULE_SOURCE_ID])),
        table(
          ["Evidence ID", "Product", "Supplier / issuer", "Evidence type", "Evidence statement", "Source IDs", "Document IDs", "Regulatory placeholder", "Review status", "Reviewer", "Confidence", "Related gap / action"],
          evidenceRows.length > 0 ? evidenceRows : [["Unknown", coveredProduct, query.manufacturer, "Unknown", withRefs("No evidence rows were generated from the current workbench output.", [WORKBENCH_SOURCE_ID]), WORKBENCH_SOURCE_ID, "Unknown", "N/A", "Pending", "Unknown", "Unknown", "Unknown"]],
        ),
      ],
    },
    {
      title: "Source Index",
      blocks: [
        paragraph(withRefs("This source index resolves workbench, metric, safeguard, and document source IDs used by the draft packet.", [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID])),
        table(
          ["Source ID", "Document ID", "Source title", "Source type", "Issuer / custodian", "Date issued", "Date accessed", "Location", "Related sections", "Review status", "Notes"],
          sourceRows,
        ),
      ],
    },
    {
      title: "Missing Documentation Register",
      blocks: [
        paragraph(withRefs("Open rows identify missing, unverified, or expert-dependent evidence limits; they do not state that a product is compliant or non-compliant.", [RULE_SOURCE_ID])),
        table(
          ["Gap ID", "Missing / deficient item", "Affected products", "Affected suppliers", "Why it matters", "Source basis", "Owner", "Priority", "Requested date", "Due date", "Status", "Closure evidence"],
          missingRows.length > 0 ? missingRows : [["None", "No generated gaps", coveredProduct, query.manufacturer, withRefs("No missing-documentation rows were generated from the current workbench state.", [WORKBENCH_SOURCE_ID]), withRefs("Analyst review still required before relying on packet completeness.", [RULE_SOURCE_ID]), "Analyst", "Pending", UNKNOWN, UNKNOWN, "Pending review", UNKNOWN]],
        ),
      ],
    },
    {
      title: "Gap Summary",
      blocks: [
        paragraph(withRefs("The gap summary groups automation-safe observations from the missing documentation register and workbench decision state.", [WORKBENCH_SOURCE_ID, RULE_SOURCE_ID])),
        table(["Gap category", "Count / value", "Summary"], gapSummaryRows),
      ],
    },
    {
      title: "Appendix Index",
      blocks: [
        paragraph(withRefs("Appendix entries are draft packaging targets generated from source IDs, evidence IDs, and gap IDs already present in this packet.", [WORKBENCH_SOURCE_ID])),
        table(["Appendix ID", "Appendix title", "Included IDs", "Related packet sections", "Status"], appendixIndexRows),
      ],
    },
    {
      title: "Automation Metrics",
      blocks: [
        paragraph(withRefs("The metric table estimates assembly-time impact for the packet auto-assembly workflow; it does not reduce expert review time because expert judgment remains outside v1 automation.", [METRIC_SOURCE_ID, RULE_SOURCE_ID])),
        table(["Metric", "Estimate", "Basis"], metricRows(metrics)),
      ],
    },
  ];
}

export function buildPacketModel(input) {
  const query = normalizeQuery(input.query);
  const documents = Array.isArray(input.documents) ? input.documents : [];
  const generatedAt = packetDate(input.generatedAt || input.generated_at);
  const summary = input.summary || computeFallbackSummary(documents);
  const packet = {
    id: packetId(query, generatedAt),
    generatedAt,
  };

  const { activeDocuments, traceByKey } = mapDocuments(documents);
  const sourceRows = buildSourceRows({ documents: activeDocuments, traceByKey, generatedAt });
  const documentRows = buildDocumentInventoryRows(activeDocuments, traceByKey, query);
  const evidenceRows = buildEvidenceRows(activeDocuments, traceByKey, query);
  const missingRows = buildMissingRows(activeDocuments, traceByKey, query);
  const gapSummaryRows = buildGapSummaryRows({ missingRows, documents: activeDocuments });
  const appendixIndexRows = appendixRows(sourceRows, evidenceRows, missingRows);
  const metrics = buildMetrics();

  // Expert judgment remains intentionally unautomated in v1. The engine only
  // assembles cited metadata, analyst decisions, and gap prompts because PFAS
  // presence/absence, regulatory applicability, SDS equivalence, supplier
  // authority, and declaration sufficiency require qualified review.
  const sections = buildSections({
    packet,
    query,
    summary,
    metrics,
    sourceRows,
    documentRows,
    evidenceRows,
    missingRows,
    gapSummaryRows,
    appendixIndexRows,
  });

  return {
    packet,
    query,
    generatedAt: generatedAt.toISOString(),
    summary,
    metrics,
    sections,
  };
}

function markdownCell(value) {
  return String(value ?? UNKNOWN)
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim() || UNKNOWN;
}

function renderMarkdownTable(block) {
  const header = `| ${block.headers.map(markdownCell).join(" | ")} |`;
  const divider = `| ${block.headers.map(() => "---").join(" | ")} |`;
  const rows = block.rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`);
  return [header, divider, ...rows].join("\n");
}

export function renderPacketMarkdown(model) {
  const lines = [
    `# PFAS Evidence Packet`,
    "",
    withRefs(`Packet ID: ${model.packet.id}`, [WORKBENCH_SOURCE_ID]),
    "",
    withRefs("Important limitation: this auto-assembled draft is evidence-organizing support only. It is not legal advice, a regulatory certification, a product certification, or a determination of PFAS presence or absence.", [RULE_SOURCE_ID]),
    "",
  ];

  for (const [index, section] of model.sections.entries()) {
    lines.push(`## ${index + 1}. ${section.title}`, "");
    for (const block of section.blocks) {
      if (block.type === "paragraph") {
        lines.push(block.text, "");
      } else if (block.type === "list") {
        for (const item of block.items) lines.push(`- ${item}`);
        lines.push("");
      } else if (block.type === "table") {
        lines.push(renderMarkdownTable(block), "");
      }
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function htmlEscape(value) {
  return String(value ?? UNKNOWN)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtmlTable(block) {
  const headers = block.headers.map((header) => `<th>${htmlEscape(header)}</th>`).join("");
  const rows = block.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join("")}</tr>`)
    .join("\n");
  return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function htmlStyles({ printLayout }) {
  return `
    :root {
      color: #151515;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.45;
    }
    body {
      margin: 0;
      background: #ffffff;
    }
    main {
      max-width: ${printLayout ? "none" : "1120px"};
      margin: 0 auto;
      padding: ${printLayout ? "0" : "40px 24px 64px"};
    }
    h1, h2 {
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 500;
      color: #102030;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 32px;
    }
    h2 {
      margin: 34px 0 12px;
      font-size: 22px;
      break-after: avoid;
    }
    p {
      margin: 0 0 14px;
    }
    ul {
      margin: 0 0 18px 22px;
      padding: 0;
    }
    li {
      margin: 0 0 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 24px;
      font-size: 12px;
      break-inside: auto;
    }
    th, td {
      border: 1px solid #c9c9c9;
      padding: 7px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f3f4;
      font-weight: 700;
    }
    tr {
      break-inside: avoid;
    }
    .limitation {
      border-left: 4px solid #2f5f8f;
      padding: 10px 12px;
      background: #f6f8fa;
      margin: 0 0 24px;
    }
    ${printLayout ? `
    @page {
      size: Letter;
      margin: 0.65in;
    }
    body {
      font-size: 11px;
    }
    main {
      padding: 0;
    }
    h1 {
      font-size: 26px;
    }
    h2 {
      font-size: 18px;
      margin-top: 26px;
    }
    table {
      font-size: 9px;
    }
    th, td {
      padding: 5px 6px;
    }
    ` : ""}
  `;
}

export function renderPacketHtml(model, { printLayout = false } = {}) {
  const body = [];
  body.push(`<h1>PFAS Evidence Packet</h1>`);
  body.push(`<p>${htmlEscape(withRefs(`Packet ID: ${model.packet.id}`, [WORKBENCH_SOURCE_ID]))}</p>`);
  body.push(`<p class="limitation">${htmlEscape(withRefs("Important limitation: this auto-assembled draft is evidence-organizing support only. It is not legal advice, a regulatory certification, a product certification, or a determination of PFAS presence or absence.", [RULE_SOURCE_ID]))}</p>`);

  for (const [index, section] of model.sections.entries()) {
    body.push(`<section>`);
    body.push(`<h2>${index + 1}. ${htmlEscape(section.title)}</h2>`);
    for (const block of section.blocks) {
      if (block.type === "paragraph") {
        body.push(`<p>${htmlEscape(block.text)}</p>`);
      } else if (block.type === "list") {
        body.push(`<ul>${block.items.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul>`);
      } else if (block.type === "table") {
        body.push(renderHtmlTable(block));
      }
    }
    body.push(`</section>`);
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(model.packet.id)} PFAS Evidence Packet</title>
  <style>${htmlStyles({ printLayout })}</style>
</head>
<body>
  <main>
    ${body.join("\n    ")}
  </main>
</body>
</html>
`;
}

export async function writePacketExports({ documents, summary, query, exportDir, generatedAt }) {
  await mkdir(exportDir, { recursive: true });
  const normalizedQuery = normalizeQuery(query);
  const model = buildPacketModel({ documents, summary, query: normalizedQuery, generatedAt });
  const stem = slugify(`${normalizedQuery.manufacturer}-${normalizedQuery.productCode || normalizedQuery.product || "unknown"}-pfas-evidence-packet`);
  const markdownPath = path.join(exportDir, `${stem}.md`);
  const htmlPath = path.join(exportDir, `${stem}.html`);
  const printHtmlPath = path.join(exportDir, `${stem}-print.html`);

  await writeFile(markdownPath, renderPacketMarkdown(model));
  await writeFile(htmlPath, renderPacketHtml(model));
  await writeFile(printHtmlPath, renderPacketHtml(model, { printLayout: true }));

  return {
    markdownPath,
    htmlPath,
    printHtmlPath,
    metrics: model.metrics,
  };
}
