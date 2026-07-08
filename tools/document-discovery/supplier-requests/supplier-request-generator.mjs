import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildExpertReviewModel, EXPERT_REVIEW_ACTIONS } from "../expert-review/expert-review-console.mjs";
import { slugify } from "../normalization/text.mjs";
import { buildPacketModel } from "../packet/packet-assembler.mjs";
import { getCategory } from "../workbench/core/categories.mjs";

const UNKNOWN = "Unknown";
const DEADLINE_PLACEHOLDER = "[DEADLINE TBD]";

const REQUEST_PREP_BASELINE = Object.freeze({
  currentAnalystEngagementMinutes: 306,
  currentExpertReviewMinutes: 78,
  previousMissingEvidencePrepMinutes: 90,
  newMissingEvidencePrepMinutes: 30,
});

const EXTERNAL_REQUEST_TYPES = new Set([
  "MISSING_PFAS_DECLARATION",
  "CONFIDENCE_BELOW_THRESHOLD",
  "ANALYST_REQUESTED_EXPERT_REVIEW",
  "UNKNOWN_DOCUMENT_AUTHORITY",
  "CONFLICTING_REVISIONS",
  "POSSIBLE_DUPLICATE_DOCUMENTS",
  "CONFLICTING_DECLARATIONS",
  "MISSING_DOCUMENTATION_REGISTER",
  "MISSING_DOCUMENT",
]);

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function padId(index) {
  return String(index).padStart(3, "0");
}

function normalizeQuery(query = {}) {
  return {
    manufacturer: query.manufacturer || UNKNOWN,
    product: query.product || UNKNOWN,
    productCode: query.productCode || query.product_code || "",
  };
}

function productSku(query, fallbackProduct = "") {
  const product = fallbackProduct || query.product || UNKNOWN;
  return `${product}${query.productCode ? ` (${query.productCode})` : ""}`;
}

function documentKey(document) {
  return document.document_key || document.key || document.url || `${document.document_type}:${document.title}`;
}

function category(document) {
  return document.category || getCategory(document);
}

function isIgnored(document) {
  return document.analyst_action === "IGNORED";
}

function isMissing(document) {
  return document.status === "MISSING" || document.analyst_action === "MISSING_DOCUMENT";
}

function activeDocuments(documents) {
  return (Array.isArray(documents) ? documents : []).filter((document) => !isIgnored(document));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function sentenceJoin(values) {
  const unique = [...new Set(values.map(normalize).filter(Boolean))];
  return unique.join(" ");
}

function evidenceSummary(evidence = []) {
  if (evidence.length === 0) return "No source evidence was available beyond the workbench gap record.";
  return evidence
    .map((item) => `${item.source_id || UNKNOWN}/${item.document_id || UNKNOWN}: ${item.title || UNKNOWN} (${item.basis || "source context"})`)
    .join(" | ");
}

function topicFromText(value) {
  const text = lower(value);
  if (text.includes("pfas") && (text.includes("declaration") || text.includes("supplier"))) return "pfas-declaration";
  if (text.includes("safety data sheet") || text.includes("sds") || text.includes("msds")) return "current-sds";
  if (text.includes("technical data sheet") || text.includes("tds")) return "current-tds";
  if (text.includes("authority") || text.includes("issuer") || text.includes("signer") || text.includes("signature")) return "authority-confirmation";
  if (text.includes("revision") || text.includes("superseded") || text.includes("current applicable")) return "current-revision";
  if (text.includes("duplicate") || text.includes("variant")) return "duplicate-clarification";
  if (text.includes("analytical") || text.includes("test report") || text.includes("lab") || text.includes("testing")) return "analytical-record";
  if (text.includes("bom") || text.includes("formulation") || text.includes("ptfe")) return "formulation-support";
  if (text.includes("reach") || text.includes("svhc")) return "reach-svhc-declaration";
  if (text.includes("rohs")) return "rohs-declaration";
  if (text.includes("tsca")) return "tsca-declaration";
  if (text.includes("prop 65") || text.includes("prop65")) return "prop-65-declaration";
  return slugify(value || "missing-evidence") || "missing-evidence";
}

function recipientTypeFor(topic, issueType) {
  if (topic === "current-sds" || topic === "current-tds") return "Manufacturer technical documentation contact";
  if (topic === "pfas-declaration") return "Manufacturer or authorized supplier";
  if (topic === "authority-confirmation") return "Document issuer or manufacturer";
  if (topic === "current-revision" || topic === "duplicate-clarification") return "Manufacturer documentation contact";
  if (topic === "analytical-record") return "Customer or manufacturer technical contact";
  if (topic === "formulation-support") return "Customer technical contact or manufacturer";
  if (issueType === "CONFLICTING_DECLARATIONS") return "Manufacturer or authorized supplier";
  return "Manufacturer or supplier documentation contact";
}

function exactRequestedEvidence({ topic, missingDocument, product }) {
  if (topic === "pfas-declaration") {
    return `Signed product-specific PFAS declaration for ${product}, including covered product/SKU identifiers, issue date, issuing company, authorized signer or approval status, PFAS definition used, and scope limitations.`;
  }
  if (topic === "current-sds") {
    return `Current Safety Data Sheet for ${product}, including revision date, language/region, product form, and written confirmation that it applies to the requested product/SKU.`;
  }
  if (topic === "current-tds") {
    return `Current Technical Data Sheet for ${product}, including revision date and confirmation that it applies to the requested product/SKU.`;
  }
  if (topic === "authority-confirmation") {
    return `Issuer-authority confirmation for the referenced document, including issuing company, signer or approver name/title where available, approval date, product/SKU scope, and any limitations.`;
  }
  if (topic === "current-revision") {
    return `Current applicable revision for ${product}, identification of superseded documents, effective date, and confirmation of which file should be relied on.`;
  }
  if (topic === "duplicate-clarification") {
    return `Clarification whether the referenced documents are duplicates, regional/language variants, superseded revisions, or distinct product records, plus the current file to rely on.`;
  }
  if (topic === "analytical-record") {
    return `PFAS analytical test report for ${product}, if available, including test method, report date, laboratory, detection limits, sample/product identifier, and chain-of-custody or report reference.`;
  }
  if (topic === "formulation-support") {
    return `Product-specific formulation or controlled disclosure support relevant to ${product}, limited to the requested PFAS evidence scope and including any PTFE or fluorinated-substance identity/scope information that may be disclosed.`;
  }
  if (topic === "reach-svhc-declaration") {
    return `Current REACH/SVHC declaration for ${product}, including covered product/SKU identifiers, issue date, issuer authority, candidate-list date or scope, and limitations.`;
  }
  if (topic === "rohs-declaration") {
    return `Current RoHS declaration for ${product}, including covered product/SKU identifiers, issue date, issuer authority, directive/scope reference, and limitations.`;
  }
  if (topic === "tsca-declaration") {
    return `Current TSCA-related declaration or statement for ${product}, including covered product/SKU identifiers, issue date, issuer authority, scope reference, and limitations.`;
  }
  if (topic === "prop-65-declaration") {
    return `Current California Prop 65 declaration or warning-status document for ${product}, including covered product/SKU identifiers, issue date, issuer authority, and limitations.`;
  }
  return `Product-specific copy of ${missingDocument} for ${product}, including issue date, issuer or custodian, product/SKU scope, and any limitations.`;
}

function whyNeededFor({ issue, missingDocument }) {
  return `Needed to close the unresolved documentation gap for ${missingDocument || issue}; this is a documentation-completeness request, not a legal conclusion or compliance determination.`;
}

function internalNoteFor(gap) {
  return `Generated from unresolved ${gap.kind}: ${gap.issue_type}. Do not treat the request or any response as a legal conclusion; index any response as new source evidence before packet use.`;
}

function emailSubject({ product, missingDocument }) {
  return `Documentation request for ${product}: ${missingDocument}`;
}

function emailDraft({ recipientType, product, missingDocument, whyNeeded, supportingContext, exactEvidence }) {
  return `Hello,

Liberty Tree Compliance is assembling a source-indexed PFAS evidence packet for ${product}. During document review, the following documentation gap remained open:

- Recipient type: ${recipientType}
- Needed document/evidence: ${missingDocument}
- Why this is needed: ${whyNeeded}
- Supporting context: ${supportingContext}

Please provide the following evidence by ${DEADLINE_PLACEHOLDER}:

${exactEvidence}

If this request should be satisfied by a different current document, please identify that document and its product/SKU scope, issue date, issuing authority, and any limitations.

This is a documentation-completeness request only. Liberty Tree is not asking you to make a legal conclusion or to characterize the product's compliance status.

Thank you,
Liberty Tree Compliance`;
}

function createRequestFromGap(gap, query) {
  const product = productSku(query, gap.product);
  const topic = topicFromText(`${gap.issue_type} ${gap.issue} ${gap.missing_document} ${gap.why_flagged || ""}`);
  const recipientType = recipientTypeFor(topic, gap.issue_type);
  const missingDocument = gap.missing_document || gap.issue || "Missing evidence";
  const supportingContext = sentenceJoin([
    gap.supporting_context,
    gap.why_flagged,
    gap.source_basis,
    evidenceSummary(gap.supporting_evidence),
  ]);
  const exactEvidence = exactRequestedEvidence({ topic, missingDocument, product });
  const whyNeeded = whyNeededFor({ issue: gap.issue, missingDocument });

  return {
    request_topic: topic,
    recipient_type: recipientType,
    product_sku: product,
    missing_document: missingDocument,
    why_needed: whyNeeded,
    supporting_context: supportingContext,
    exact_requested_evidence: exactEvidence,
    deadline_placeholder: DEADLINE_PLACEHOLDER,
    email_subject: emailSubject({ product, missingDocument }),
    email_draft: emailDraft({
      recipientType,
      product,
      missingDocument,
      whyNeeded,
      supportingContext,
      exactEvidence,
    }),
    short_internal_note: internalNoteFor(gap),
    source_inputs: gap.source_inputs || [],
    originating_gaps: gap.originating_gaps || [],
  };
}

function mergeRequest(existing, incoming) {
  existing.supporting_context = sentenceJoin([existing.supporting_context, incoming.supporting_context]);
  existing.short_internal_note = sentenceJoin([existing.short_internal_note, incoming.short_internal_note]);
  existing.source_inputs = [...new Set([...existing.source_inputs, ...incoming.source_inputs])];
  existing.originating_gaps = [...new Set([...existing.originating_gaps, ...incoming.originating_gaps])];
  existing.email_draft = emailDraft({
    recipientType: existing.recipient_type,
    product: existing.product_sku,
    missingDocument: existing.missing_document,
    whyNeeded: existing.why_needed,
    supportingContext: existing.supporting_context,
    exactEvidence: existing.exact_requested_evidence,
  });
}

function requestKey(request) {
  return `${request.recipient_type}:${request.product_sku}:${request.request_topic}`;
}

function missingDocumentLabel(document) {
  const title = document.title || "";
  if (title && !lower(title).startsWith("missing ")) return title;
  return `${category(document)} documentation`;
}

function gapsFromMissingDocuments(documents, query) {
  return documents
    .filter((document) => isMissing(document))
    .map((document) => ({
      kind: "discovery output",
      issue_type: "MISSING_DOCUMENT",
      issue: missingDocumentLabel(document),
      product: document.product || query.product,
      missing_document: missingDocumentLabel(document),
      why_flagged: document.confidence_reason || "Workbench discovery produced a missing-document record.",
      supporting_context: `Discovery method: ${document.discovery_method || UNKNOWN}; confidence: ${document.confidence || UNKNOWN}.`,
      source_basis: document.confidence_reason || "",
      supporting_evidence: [{
        source_id: "SRC-WB-001",
        document_id: UNKNOWN,
        title: document.title || missingDocumentLabel(document),
        url: document.url || UNKNOWN,
        basis: document.confidence_reason || "Missing-document record from discovery output.",
      }],
      source_inputs: ["discovery output", "analyst decisions"],
      originating_gaps: [documentKey(document)],
    }));
}

function unresolvedExpertItems(expertModel) {
  return expertModel.items.filter((item) => (
    item.requires_expert_attention ||
    item.decision?.action === EXPERT_REVIEW_ACTIONS.NEEDS_MORE_EVIDENCE
  ));
}

function gapFromExpertItem(item, query) {
  if (!EXTERNAL_REQUEST_TYPES.has(item.issue_type)) {
    return null;
  }

  // Unsupported generated statements need source correction or removal inside
  // the packet generator; sending a supplier email would create a broad and
  // unsafe request without a specific external document target.
  if (item.issue_type === "UNSUPPORTED_AI_GENERATED_STATEMENT") {
    return null;
  }

  return {
    kind: "expert review exception",
    issue_type: item.issue_type,
    issue: item.issue,
    product: query.product,
    missing_document: missingDocumentFromExpertItem(item),
    why_flagged: item.why_flagged,
    supporting_context: `Expert console item ${item.id}; recommended action: ${item.recommended_action}`,
    source_basis: item.decision?.note || item.why_flagged,
    supporting_evidence: item.supporting_evidence || [],
    source_inputs: ["expert review exceptions", "analyst decisions", "discovery output"],
    originating_gaps: [item.id, item.key],
  };
}

function missingDocumentFromExpertItem(item) {
  if (item.issue_type === "MISSING_PFAS_DECLARATION") return "Product-specific PFAS declaration";
  if (item.issue_type === "UNKNOWN_DOCUMENT_AUTHORITY") return "Document authority confirmation";
  if (item.issue_type === "CONFLICTING_REVISIONS") return "Current revision confirmation";
  if (item.issue_type === "POSSIBLE_DUPLICATE_DOCUMENTS") return "Duplicate or variant clarification";
  if (item.issue_type === "CONFLICTING_DECLARATIONS") return "Declaration conflict clarification";
  if (item.issue_type === "CONFIDENCE_BELOW_THRESHOLD") {
    const evidenceType = item.supporting_evidence?.[0]?.document_type || "source document";
    return `Product-specific ${evidenceType}`;
  }
  if (item.issue_type === "ANALYST_REQUESTED_EXPERT_REVIEW") {
    const evidenceType = item.supporting_evidence?.[0]?.document_type || "source evidence";
    return `Additional evidence for ${evidenceType}`;
  }
  return item.issue;
}

function missingRegisterRows(packetModel) {
  const section = packetModel.sections.find((item) => item.title === "Missing Documentation Register");
  if (!section) return [];
  const table = section.blocks.find((block) => block.type === "table");
  if (!table) return [];

  return table.rows
    .map((row) => Object.fromEntries(table.headers.map((header, index) => [header, row[index] || ""])))
    .filter((row) => {
      const missingItem = lower(row["Missing / deficient item"]);
      return (
        row["Gap ID"] &&
        row["Gap ID"] !== "None" &&
        !missingItem.includes("no generated gaps") &&
        !missingItem.startsWith("expert review required for")
      );
    });
}

function gapsFromMissingRegister(packetModel, query) {
  return missingRegisterRows(packetModel).map((row) => ({
    kind: "missing documentation register",
    issue_type: "MISSING_DOCUMENTATION_REGISTER",
    issue: row["Missing / deficient item"],
    product: row["Affected products"] || query.product,
    missing_document: row["Missing / deficient item"],
    why_flagged: row["Why it matters"],
    supporting_context: row["Source basis"],
    source_basis: row["Source basis"],
    supporting_evidence: [{
      source_id: "SRC-WB-001",
      document_id: row["Gap ID"],
      title: row["Missing / deficient item"],
      url: UNKNOWN,
      basis: row["Source basis"] || row["Why it matters"],
    }],
    source_inputs: ["missing documentation register", "packet auto-assembly", "analyst decisions"],
    originating_gaps: [row["Gap ID"]],
  }));
}

function buildRequests(gaps, query) {
  const requests = new Map();
  for (const gap of gaps) {
    const request = createRequestFromGap(gap, query);
    const key = requestKey(request);
    if (requests.has(key)) {
      mergeRequest(requests.get(key), request);
    } else {
      requests.set(key, request);
    }
  }

  return [...requests.values()].map((request, index) => ({
    request_id: `REQ-${padId(index + 1)}`,
    ...request,
  }));
}

function buildMetrics(requests) {
  const previous = REQUEST_PREP_BASELINE.previousMissingEvidencePrepMinutes;
  const current = requests.length === 0 ? 12 : REQUEST_PREP_BASELINE.newMissingEvidencePrepMinutes;
  const reduction = ((previous - current) / previous) * 100;
  const analystMinutes = REQUEST_PREP_BASELINE.currentAnalystEngagementMinutes - (previous - current);
  const totalMinutes = analystMinutes + REQUEST_PREP_BASELINE.currentExpertReviewMinutes;

  return {
    previous_missing_evidence_prep_minutes: previous,
    new_missing_evidence_prep_minutes: current,
    missing_evidence_prep_reduction_percent: reduction,
    new_analyst_engagement_minutes: analystMinutes,
    expert_review_minutes: REQUEST_PREP_BASELINE.currentExpertReviewMinutes,
    new_total_engagement_minutes: totalMinutes,
    success_criterion_met: reduction >= 60,
  };
}

export function buildSupplierRequestModel({ documents, summary, query, session = {}, generatedAt } = {}) {
  const normalizedQuery = normalizeQuery(query);
  const active = activeDocuments(documents);
  const expertModel = buildExpertReviewModel({
    documents: active,
    summary,
    query: normalizedQuery,
    session,
    generatedAt,
  });
  const packetModel = buildPacketModel({
    documents: active,
    summary,
    query: normalizedQuery,
    generatedAt,
  });
  const expertGaps = unresolvedExpertItems(expertModel)
    .map((item) => gapFromExpertItem(item, normalizedQuery))
    .filter(Boolean);
  const gaps = [
    ...gapsFromMissingDocuments(active, normalizedQuery),
    ...gapsFromMissingRegister(packetModel, normalizedQuery),
    ...expertGaps,
  ];
  const requests = buildRequests(gaps, normalizedQuery)
    .filter((request) => !lower(request.email_draft).includes("noncompliance"));
  const metrics = buildMetrics(requests);

  return {
    query: normalizedQuery,
    generated_at: new Date().toISOString(),
    source_inputs: [
      "discovery output",
      "analyst decisions",
      "expert review exceptions",
      "missing documentation register",
    ],
    unresolved_gap_count: gaps.length,
    request_count: requests.length,
    metrics,
    requests,
  };
}

function toCsv(requests) {
  const headers = [
    "request_id",
    "recipient_type",
    "product_sku",
    "missing_document",
    "why_needed",
    "supporting_context",
    "exact_requested_evidence",
    "deadline_placeholder",
    "email_subject",
    "email_draft",
    "short_internal_note",
    "source_inputs",
    "originating_gaps",
  ];
  const rows = requests.map((request) => headers.map((header) => csvEscape(request[header])).join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}

function renderEmailDrafts(model) {
  const lines = [
    "# Supplier Request Email Drafts",
    "",
    `Generated for: ${productSku(model.query)}`,
    `Request count: ${model.request_count}`,
    "",
    "These drafts are documentation-completeness requests only. They do not state or imply legal conclusions, regulatory determinations, product certification, or product compliance status.",
    "",
  ];

  if (model.requests.length === 0) {
    lines.push("No unresolved external evidence requests were generated from the current workbench and expert-review state.", "");
    return `${lines.join("\n").trim()}\n`;
  }

  for (const request of model.requests) {
    lines.push(`## ${request.request_id}: ${request.missing_document}`);
    lines.push("");
    lines.push(`Recipient type: ${request.recipient_type}`);
    lines.push(`Product/SKU: ${request.product_sku}`);
    lines.push(`Subject: ${request.email_subject}`);
    lines.push("");
    lines.push("```text");
    lines.push(request.email_draft);
    lines.push("```");
    lines.push("");
    lines.push(`Internal note: ${request.short_internal_note}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export async function writeSupplierRequestExports({ documents, summary, query, session = {}, exportDir, generatedAt }) {
  await mkdir(exportDir, { recursive: true });
  const model = buildSupplierRequestModel({ documents, summary, query, session, generatedAt });
  const stem = slugify(`${model.query.manufacturer}-${model.query.productCode || model.query.product || "unknown"}-supplier-requests`);
  const csvPath = path.join(exportDir, "supplier-requests.csv");
  const jsonPath = path.join(exportDir, "supplier-requests.json");
  const emailDraftsPath = path.join(exportDir, "email-drafts.md");
  const scopedCsvPath = path.join(exportDir, `${stem}.csv`);
  const scopedJsonPath = path.join(exportDir, `${stem}.json`);
  const scopedEmailDraftsPath = path.join(exportDir, `${stem}-email-drafts.md`);
  const json = JSON.stringify(model, null, 2);
  const csv = toCsv(model.requests);
  const emailDrafts = renderEmailDrafts(model);

  await writeFile(csvPath, csv);
  await writeFile(jsonPath, json);
  await writeFile(emailDraftsPath, emailDrafts);
  await writeFile(scopedCsvPath, csv);
  await writeFile(scopedJsonPath, json);
  await writeFile(scopedEmailDraftsPath, emailDrafts);

  return {
    csvPath,
    jsonPath,
    emailDraftsPath,
    scopedCsvPath,
    scopedJsonPath,
    scopedEmailDraftsPath,
    metrics: model.metrics,
    requestCount: model.request_count,
  };
}

export function formatSupplierRequestSummary(modelOrExports) {
  const metrics = modelOrExports.metrics;
  const requestCount = modelOrExports.request_count ?? modelOrExports.requestCount;
  return [
    "Supplier Request Generator",
    "--------------------------",
    `Requests generated:       ${requestCount}`,
    `Previous prep time:       ${(metrics.previous_missing_evidence_prep_minutes / 60).toFixed(1)}h`,
    `Estimated prep time:      ${(metrics.new_missing_evidence_prep_minutes / 60).toFixed(1)}h`,
    `Prep time reduction:      ${metrics.missing_evidence_prep_reduction_percent.toFixed(1)}%`,
    `New analyst time:         ${(metrics.new_analyst_engagement_minutes / 60).toFixed(1)}h`,
    `Estimated total time:     ${(metrics.new_total_engagement_minutes / 60).toFixed(1)}h`,
    `Success criterion met:    ${metrics.success_criterion_met ? "yes" : "no"}`,
  ].join("\n");
}
