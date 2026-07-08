import { createHash } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as defaultInput, stdout as defaultOutput } from "node:process";
import { buildPacketModel } from "../packet/packet-assembler.mjs";
import { getCategory } from "../workbench/core/categories.mjs";

const UNKNOWN = "Unknown";
const WORKBENCH_SOURCE_ID = "SRC-WB-001";
const PACKET_RULE_SOURCE_ID = "SRC-RULE-001";

export const EXPERT_REVIEW_ACTIONS = Object.freeze({
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  NEEDS_MORE_EVIDENCE: "NEEDS_MORE_EVIDENCE",
  RESOLVED: "RESOLVED",
});

const EXPERT_TIME_BASELINE = Object.freeze({
  analystEngagementMinutes: 306,
  previousExpertReviewMinutes: 150,
  consoleSetupMinutes: 18,
  maxBoundedReviewMinutes: 78,
  minimumExceptionReviewMinutes: 45,
});

const CONFIDENCE_THRESHOLD = 80;
const HIGH_VALUE_CATEGORIES = new Set(["PFAS", "SDS", "TDS", "REACH", "RoHS", "TSCA", "Prop 65", "Environmental"]);
const DECLARATION_CATEGORIES = new Set(["PFAS", "REACH", "RoHS", "TSCA", "Prop 65", "Environmental"]);
const SEVERITY_ORDER = new Map([
  ["Critical", 0],
  ["High", 1],
  ["Medium", 2],
  ["Low", 3],
]);

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);
}

function padId(index) {
  return String(index).padStart(3, "0");
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function normalizeQuery(query = {}) {
  return {
    manufacturer: query.manufacturer || UNKNOWN,
    product: query.product || UNKNOWN,
    productCode: query.productCode || query.product_code || "",
  };
}

function documentKey(document) {
  return document.document_key || document.key || document.url || `${document.document_type}:${document.title}`;
}

function isIgnored(document) {
  return document.analyst_action === "IGNORED";
}

function isDuplicate(document) {
  return document.analyst_action === "DUPLICATE";
}

function isMissing(document) {
  return document.status === "MISSING" || document.analyst_action === "MISSING_DOCUMENT";
}

function isVerified(document) {
  return document.analyst_action === "VERIFIED";
}

function isNeedsExpertReview(document) {
  return document.analyst_action === "NEEDS_EXPERT_REVIEW";
}

function confidence(document) {
  return document.confidence || UNKNOWN;
}

function category(document) {
  return document.category || getCategory(document);
}

function activeDocuments(documents) {
  return (Array.isArray(documents) ? documents : []).filter((document) => !isIgnored(document));
}

function buildTraceMap(documents) {
  const traceByKey = new Map();
  let index = 1;
  for (const document of documents) {
    if (isMissing(document)) continue;
    traceByKey.set(documentKey(document), {
      documentId: `DOC-${padId(index)}`,
      sourceId: `SRC-${padId(index)}`,
    });
    index += 1;
  }
  return traceByKey;
}

function traceFor(document, traceByKey) {
  return traceByKey.get(documentKey(document)) || {
    documentId: UNKNOWN,
    sourceId: WORKBENCH_SOURCE_ID,
  };
}

function evidenceForDocument(document, traceByKey, basis = "") {
  const trace = traceFor(document, traceByKey);
  return {
    source_id: trace.sourceId,
    document_id: trace.documentId,
    title: document.title || UNKNOWN,
    url: document.url || UNKNOWN,
    document_type: document.document_type || category(document),
    confidence: confidence(document),
    basis: basis || document.confidence_reason || "Workbench source record.",
  };
}

function addItem(items, item) {
  const supportingEvidence = item.supporting_evidence || [];
  const fingerprint = hash({
    issue: item.issue,
    why: item.why_flagged,
    evidence: supportingEvidence.map((evidence) => ({
      source_id: evidence.source_id,
      document_id: evidence.document_id,
      title: evidence.title,
      url: evidence.url,
      basis: evidence.basis,
    })),
  });

  items.push({
    key: item.key,
    issue_type: item.issue_type,
    severity: item.severity || "Medium",
    issue: item.issue,
    supporting_evidence: supportingEvidence,
    confidence: item.confidence || "Pending",
    why_flagged: item.why_flagged,
    recommended_action: item.recommended_action,
    related_document_keys: item.related_document_keys || [],
    fingerprint,
  });
}

function authorityKnown(document) {
  const fields = [
    document.issuer,
    document.custodian,
    document.authority,
    document.authority_confirmed,
    document.signed_by,
    document.signatory,
    document.reviewer,
  ];

  return fields.some((field) => normalize(field));
}

function declarationSignal(document) {
  const text = lower(`${document.title || ""} ${document.url || ""} ${(document.notes || []).join(" ")} ${document.confidence_reason || ""}`);
  const negative = /\b(pfas[-\s]?free|free of pfas|does not contain|do not contain|not contain|non[-\s]?pfas|without pfas|not intentionally added)\b/.test(text);
  const positive = /\b(contains|intentionally added|ptfe|pfoa|pfos|fluoropolymer|fluorinated)\b/.test(text);
  if (negative && positive) return "mixed";
  if (negative) return "negative";
  if (positive) return "positive";
  return "unknown";
}

function normalizedTitle(document) {
  return lower(document.title || document.url || document.document_type)
    .replace(/\.(pdf|html?|xml|txt)$/g, "")
    .replace(/\b(19|20)\d{2}[-_/ ]?\d{0,2}[-_/ ]?\d{0,2}\b/g, "")
    .replace(/\b(v|rev|revision)[-_ ]?[a-z0-9.]+\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function groupBy(documents, keyFn) {
  const groups = new Map();
  for (const document of documents) {
    const key = keyFn(document);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(document);
  }
  return groups;
}

function flagMissingPfasDeclarations({ documents, items, traceByKey, query }) {
  const pfasDocuments = documents.filter((document) => !isMissing(document) && category(document) === "PFAS");
  const verifiedPfasDocuments = pfasDocuments.filter(isVerified);
  const missingPfasRecords = documents.filter((document) => isMissing(document) && category(document) === "PFAS");

  if (verifiedPfasDocuments.length > 0 && missingPfasRecords.length === 0) return;

  const supportingEvidence = [
    ...missingPfasRecords.map((document) => evidenceForDocument(document, traceByKey, document.confidence_reason || "Workbench negative discovery record.")),
    ...pfasDocuments.map((document) => evidenceForDocument(document, traceByKey, isVerified(document) ? "Analyst verified PFAS record." : "PFAS candidate has not been analyst-verified.")),
  ];

  addItem(items, {
    key: `missing-pfas-declaration:${query.manufacturer}:${query.product}:${query.productCode}`,
    issue_type: "MISSING_PFAS_DECLARATION",
    severity: "High",
    issue: "No analyst-verified PFAS declaration is ready for expert reliance.",
    supporting_evidence: supportingEvidence.length > 0 ? supportingEvidence : [{
      source_id: WORKBENCH_SOURCE_ID,
      document_id: UNKNOWN,
      title: "Workbench discovery state",
      url: UNKNOWN,
      document_type: "PFAS declaration",
      confidence: "Pending",
      basis: "No PFAS declaration record is present in the current workbench evidence set.",
    }],
    confidence: missingPfasRecords.length > 0 ? "High" : "Pending",
    why_flagged: "PFAS declaration coverage is a required expert exception when the workbench has no verified PFAS declaration or has an explicit PFAS missing record.",
    recommended_action: "Confirm whether a located candidate applies to the product; otherwise request a signed product-specific PFAS declaration before expert approval.",
    related_document_keys: pfasDocuments.map(documentKey),
  });
}

function flagLowConfidenceDocuments({ documents, items, traceByKey, threshold }) {
  for (const document of documents) {
    if (isMissing(document) || isDuplicate(document)) continue;
    const documentCategory = category(document);
    const score = Number(document.confidence_score || 0);
    const lowConfidence = score > 0 ? score < threshold : ["Low", "Unknown"].includes(confidence(document));
    if (!HIGH_VALUE_CATEGORIES.has(documentCategory) || !lowConfidence) continue;

    addItem(items, {
      key: `low-confidence:${documentKey(document)}`,
      issue_type: "CONFIDENCE_BELOW_THRESHOLD",
      severity: score < 60 || confidence(document) === "Unknown" ? "High" : "Medium",
      issue: `${documentCategory} source confidence is below the expert-review threshold.`,
      supporting_evidence: [evidenceForDocument(document, traceByKey)],
      confidence: confidence(document),
      why_flagged: `Confidence score ${score || "unknown"} is below the ${threshold} threshold for high-value PFAS packet evidence.`,
      recommended_action: "Review source applicability and either approve the record for limited use, reject it, or request stronger evidence.",
      related_document_keys: [documentKey(document)],
    });
  }
}

function flagExpertRequestedDocuments({ documents, items, traceByKey }) {
  for (const document of documents.filter(isNeedsExpertReview)) {
    addItem(items, {
      key: `analyst-requested-expert-review:${documentKey(document)}`,
      issue_type: "ANALYST_REQUESTED_EXPERT_REVIEW",
      severity: "High",
      issue: "Analyst explicitly requested expert review.",
      supporting_evidence: [evidenceForDocument(document, traceByKey, document.analyst_note || "Analyst marked this record NEEDS_EXPERT_REVIEW.")],
      confidence: confidence(document),
      why_flagged: "The workbench decision state identifies this source as requiring expert attention before packet reliance.",
      recommended_action: "Review the source and analyst note, then approve, reject, request more evidence, or mark resolved.",
      related_document_keys: [documentKey(document)],
    });
  }
}

function flagUnknownAuthority({ documents, items, traceByKey }) {
  for (const document of documents) {
    const documentCategory = category(document);
    if (isMissing(document) || isDuplicate(document) || !DECLARATION_CATEGORIES.has(documentCategory)) continue;
    if (authorityKnown(document)) continue;

    addItem(items, {
      key: `unknown-authority:${documentKey(document)}`,
      issue_type: "UNKNOWN_DOCUMENT_AUTHORITY",
      severity: documentCategory === "PFAS" ? "High" : "Medium",
      issue: `${documentCategory} document authority is unknown.`,
      supporting_evidence: [evidenceForDocument(document, traceByKey, "Discovery output does not include signer, issuer authority, or custodian confirmation metadata.")],
      confidence: "Pending",
      why_flagged: "The source may be useful, but v1 discovery metadata does not establish whether the document was issued by an authorized supplier, manufacturer, or reviewer.",
      recommended_action: "Confirm issuer authority, signature or approval status, scope, and date before relying on the document.",
      related_document_keys: [documentKey(document)],
    });
  }
}

function flagConflictingRevisions({ documents, items, traceByKey }) {
  const groups = groupBy(
    documents.filter((document) => !isMissing(document) && !isDuplicate(document)),
    (document) => document.timeline_group || `${category(document)}:${normalizedTitle(document)}`,
  );

  for (const [groupKey, groupDocuments] of groups.entries()) {
    if (groupDocuments.length < 2) continue;
    const revisionValues = new Set(groupDocuments.map((document) => document.revision_date || UNKNOWN));
    if (revisionValues.size < 2 && !groupDocuments.some((document) => Number(document.older_revision_count || 0) > 0)) continue;

    addItem(items, {
      key: `conflicting-revisions:${groupKey}`,
      issue_type: "CONFLICTING_REVISIONS",
      severity: "Medium",
      issue: "Multiple possible revisions exist for the same evidence group.",
      supporting_evidence: groupDocuments.map((document) => evidenceForDocument(document, traceByKey, `Revision date: ${document.revision_date || UNKNOWN}; latest flag: ${document.is_latest_revision ? "yes" : "no"}.`)),
      confidence: "Medium",
      why_flagged: "The workbench grouped these records together but multiple revision dates or older-revision indicators remain in the evidence set.",
      recommended_action: "Confirm the current applicable revision and mark superseded records as duplicate or resolved before expert approval.",
      related_document_keys: groupDocuments.map(documentKey),
    });
  }
}

function flagPossibleDuplicates({ documents, items, traceByKey }) {
  const groups = groupBy(
    documents.filter((document) => !isMissing(document) && !isDuplicate(document)),
    (document) => `${category(document)}:${normalizedTitle(document)}`,
  );

  for (const [groupKey, groupDocuments] of groups.entries()) {
    const uniqueUrls = new Set(groupDocuments.map((document) => document.url || document.title));
    if (groupDocuments.length < 2 || uniqueUrls.size < 2) continue;

    addItem(items, {
      key: `possible-duplicate:${groupKey}`,
      issue_type: "POSSIBLE_DUPLICATE_DOCUMENTS",
      severity: "Low",
      issue: "Possible duplicate documents remain unresolved.",
      supporting_evidence: groupDocuments.map((document) => evidenceForDocument(document, traceByKey)),
      confidence: "Medium",
      why_flagged: "The records share the same normalized title and category but have separate locations or metadata.",
      recommended_action: "Confirm whether the records are duplicates, regional variants, or distinct revisions; mark duplicates before final packet use.",
      related_document_keys: groupDocuments.map(documentKey),
    });
  }
}

function flagConflictingDeclarations({ documents, items, traceByKey }) {
  const groups = groupBy(
    documents.filter((document) => !isMissing(document) && !isDuplicate(document) && DECLARATION_CATEGORIES.has(category(document))),
    (document) => category(document),
  );

  for (const [documentCategory, groupDocuments] of groups.entries()) {
    const withSignals = groupDocuments.map((document) => ({
      document,
      signal: declarationSignal(document),
    }));
    const hasPositive = withSignals.some((item) => item.signal === "positive" || item.signal === "mixed");
    const hasNegative = withSignals.some((item) => item.signal === "negative" || item.signal === "mixed");
    if (!hasPositive || !hasNegative) continue;

    addItem(items, {
      key: `conflicting-declarations:${documentCategory}`,
      issue_type: "CONFLICTING_DECLARATIONS",
      severity: "High",
      issue: `Potentially conflicting ${documentCategory} declaration language detected.`,
      supporting_evidence: withSignals.map(({ document, signal }) => evidenceForDocument(document, traceByKey, `Title/context signal: ${signal}.`)),
      confidence: "Pending",
      why_flagged: "The exception detector found both positive and negative PFAS/compliance language cues across declaration records. This is only a review trigger, not a factual conclusion.",
      recommended_action: "Compare the source text, product scope, revision dates, and definitions; approve only after the apparent conflict is resolved.",
      related_document_keys: groupDocuments.map(documentKey),
    });
  }
}

const TRACE_PATTERN = /\[(?:SRC|DOC|EVID|GAP|ACTION|REG-CIT|NOTE|APP|SRC-WB|SRC-RULE|SRC-METRIC)[^\]]*\]/;
const SUBSTANTIVE_COLUMNS = new Set(["Entry", "Evidence statement", "Why it matters", "Source basis", "Summary", "Basis"]);

function isSubstantiveStatement(value) {
  const text = normalize(value);
  if (text.length < 70) return false;
  if (text === UNKNOWN || /^https?:\/\//i.test(text)) return false;
  return /[.!?]/.test(text);
}

function flagUnsupportedPacketStatements({ packetModel, items }) {
  for (const [sectionIndex, section] of packetModel.sections.entries()) {
    for (const [blockIndex, block] of section.blocks.entries()) {
      const statements = [];
      if (block.type === "paragraph") {
        statements.push({ locator: `Section ${sectionIndex + 1}, paragraph ${blockIndex + 1}`, text: block.text });
      } else if (block.type === "list") {
        for (const [itemIndex, text] of block.items.entries()) {
          statements.push({ locator: `Section ${sectionIndex + 1}, list item ${itemIndex + 1}`, text });
        }
      } else if (block.type === "table") {
        for (const [columnIndex, header] of block.headers.entries()) {
          if (!SUBSTANTIVE_COLUMNS.has(header)) continue;
          for (const [rowIndex, row] of block.rows.entries()) {
            statements.push({
              locator: `Section ${sectionIndex + 1}, table row ${rowIndex + 1}, ${header}`,
              text: row[columnIndex],
            });
          }
        }
      }

      for (const statement of statements) {
        if (!isSubstantiveStatement(statement.text) || TRACE_PATTERN.test(statement.text)) continue;
        addItem(items, {
          key: `unsupported-ai-statement:${hash(statement)}`,
          issue_type: "UNSUPPORTED_AI_GENERATED_STATEMENT",
          severity: "High",
          issue: "Packet contains a substantive generated statement without an explicit supporting source marker.",
          supporting_evidence: [{
            source_id: PACKET_RULE_SOURCE_ID,
            document_id: UNKNOWN,
            title: statement.locator,
            url: UNKNOWN,
            document_type: "Generated packet statement",
            confidence: "High",
            basis: statement.text,
          }],
          confidence: "High",
          why_flagged: "Every AI-generated substantive statement must cite supporting evidence; this statement lacks a recognized source, gap, document, evidence, action, or regulatory marker.",
          recommended_action: "Add a source marker, rewrite as unknown, or remove the unsupported statement before expert approval.",
          related_document_keys: [],
        });
      }
    }
  }
}

function applyReviewState(items, session) {
  const store = session?.expert_reviews || {};
  return items.map((item, index) => {
    const decision = store[item.key] || null;
    const stale = Boolean(decision?.fingerprint && decision.fingerprint !== item.fingerprint);
    const status = !decision ? "PENDING" : stale ? "REVIEW_AGAIN" : decision.action;
    const requires_expert_attention = status === "PENDING" || status === "REVIEW_AGAIN";
    return {
      ...item,
      id: `XR-${padId(index + 1)}`,
      status,
      decision,
      stale,
      requires_expert_attention,
    };
  });
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const severityDiff = (SEVERITY_ORDER.get(a.severity) ?? 9) - (SEVERITY_ORDER.get(b.severity) ?? 9);
    if (severityDiff !== 0) return severityDiff;
    return a.issue_type.localeCompare(b.issue_type) || a.issue.localeCompare(b.issue);
  });
}

function severityMinutes(item) {
  if (item.severity === "Critical") return 10;
  if (item.severity === "High") return 8;
  if (item.severity === "Medium") return 5;
  return 3;
}

function buildMetrics(openItems) {
  const weightedExceptionMinutes = openItems.reduce((total, item) => total + severityMinutes(item), 0);
  const estimatedNewExpertMinutes = openItems.length === 0
    ? EXPERT_TIME_BASELINE.consoleSetupMinutes
    : Math.min(
      EXPERT_TIME_BASELINE.maxBoundedReviewMinutes,
      Math.max(EXPERT_TIME_BASELINE.minimumExceptionReviewMinutes, EXPERT_TIME_BASELINE.consoleSetupMinutes + weightedExceptionMinutes),
    );
  const reductionPercent = ((EXPERT_TIME_BASELINE.previousExpertReviewMinutes - estimatedNewExpertMinutes) / EXPERT_TIME_BASELINE.previousExpertReviewMinutes) * 100;

  return {
    previous_expert_review_minutes: EXPERT_TIME_BASELINE.previousExpertReviewMinutes,
    new_expert_review_minutes: estimatedNewExpertMinutes,
    expert_review_reduction_percent: reductionPercent,
    analyst_engagement_minutes: EXPERT_TIME_BASELINE.analystEngagementMinutes,
    new_total_engagement_minutes: EXPERT_TIME_BASELINE.analystEngagementMinutes + estimatedNewExpertMinutes,
    success_criterion_met: reductionPercent >= 40,
  };
}

function readyDocumentCount(documents, openItems) {
  const openDocumentKeys = new Set(openItems.flatMap((item) => item.related_document_keys));
  return documents.filter((document) => (
    !isMissing(document) &&
    !isDuplicate(document) &&
    !isNeedsExpertReview(document) &&
    !openDocumentKeys.has(documentKey(document))
  )).length;
}

export function buildExpertReviewModel({ documents, summary, query, session = {}, confidenceThreshold = CONFIDENCE_THRESHOLD, generatedAt } = {}) {
  const normalizedQuery = normalizeQuery(query);
  const active = activeDocuments(documents);
  const traceByKey = buildTraceMap(active);
  const packetModel = buildPacketModel({
    documents: active,
    summary,
    query: normalizedQuery,
    generatedAt,
  });
  const items = [];

  flagMissingPfasDeclarations({ documents: active, items, traceByKey, query: normalizedQuery });
  flagLowConfidenceDocuments({ documents: active, items, traceByKey, threshold: confidenceThreshold });
  flagExpertRequestedDocuments({ documents: active, items, traceByKey });
  flagUnknownAuthority({ documents: active, items, traceByKey });
  flagConflictingRevisions({ documents: active, items, traceByKey });
  flagPossibleDuplicates({ documents: active, items, traceByKey });
  flagConflictingDeclarations({ documents: active, items, traceByKey });
  flagUnsupportedPacketStatements({ packetModel, items });

  const deduped = new Map();
  for (const item of items) {
    if (!deduped.has(item.key)) deduped.set(item.key, item);
  }

  const itemsWithState = applyReviewState(sortItems([...deduped.values()]), session);
  const openItems = itemsWithState.filter((item) => item.requires_expert_attention);
  const metrics = buildMetrics(openItems);

  return {
    query: normalizedQuery,
    generated_at: new Date().toISOString(),
    summary,
    confidence_threshold: confidenceThreshold,
    ready_document_count: readyDocumentCount(active, openItems),
    total_active_documents: active.length,
    total_exception_items: itemsWithState.length,
    open_exception_items: openItems.length,
    resolved_or_decided_items: itemsWithState.length - openItems.length,
    metrics,
    items: itemsWithState,
    openItems,
  };
}

export function ensureExpertReviewStore(session) {
  if (!session.expert_reviews || typeof session.expert_reviews !== "object") {
    session.expert_reviews = {};
  }
  return session.expert_reviews;
}

export function setExpertReviewDecision(session, item, action, note = "", reviewer = "expert") {
  if (!Object.values(EXPERT_REVIEW_ACTIONS).includes(action)) {
    throw new Error(`Unknown expert review action: ${action}`);
  }

  const store = ensureExpertReviewStore(session);
  store[item.key] = {
    action,
    note,
    reviewer,
    fingerprint: item.fingerprint,
    updated_at: new Date().toISOString(),
  };
}

export function clearExpertReviewDecision(session, item) {
  const store = ensureExpertReviewStore(session);
  delete store[item.key];
}

function hours(minutes) {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function formatExpertReviewSummary(model) {
  return [
    "Expert Review Console",
    "---------------------",
    `Open expert exceptions:   ${model.open_exception_items}`,
    `Ready source documents:   ${model.ready_document_count}`,
    `Resolved/decided items:   ${model.resolved_or_decided_items}`,
    `Previous expert time:     ${hours(model.metrics.previous_expert_review_minutes)}`,
    `Estimated expert time:    ${hours(model.metrics.new_expert_review_minutes)}`,
    `Expert time reduction:    ${model.metrics.expert_review_reduction_percent.toFixed(1)}%`,
    `Estimated total time:     ${hours(model.metrics.new_total_engagement_minutes)}`,
    `Success criterion met:    ${model.metrics.success_criterion_met ? "yes" : "no"}`,
  ].join("\n");
}

function printItemList(model) {
  console.log("");
  console.log(formatExpertReviewSummary(model));
  console.log("");
  if (model.openItems.length === 0) {
    console.log("No open expert exceptions. Everything else is ready for packet flow.");
    return;
  }

  for (const item of model.openItems) {
    console.log(`${item.id} [${item.severity}] ${item.issue_type} confidence=${item.confidence}`);
    console.log(`  ${item.issue}`);
    console.log(`  action: ${item.recommended_action}`);
  }
}

function printItemDetail(item) {
  console.log("");
  console.log(`${item.id} ${item.issue_type}`);
  console.log("-".repeat(`${item.id} ${item.issue_type}`.length));
  console.log(`Issue: ${item.issue}`);
  console.log(`Severity: ${item.severity}`);
  console.log(`Confidence: ${item.confidence}`);
  console.log(`Why flagged: ${item.why_flagged}`);
  console.log(`Recommended action: ${item.recommended_action}`);
  console.log("");
  console.log("Supporting evidence:");
  for (const evidence of item.supporting_evidence) {
    console.log(`- ${evidence.source_id} / ${evidence.document_id}: ${evidence.title}`);
    console.log(`  ${evidence.url}`);
    console.log(`  basis: ${evidence.basis}`);
  }
}

function findItem(model, id) {
  const normalized = lower(id);
  return model.items.find((item) => lower(item.id) === normalized || lower(item.key) === normalized) || null;
}

function printConsoleHelp() {
  console.log(`Commands:
  list                     Show open expert exceptions
  open <id>                Show issue, evidence, confidence, flag reason, and action
  approve <id> [note]      Approve exception for packet use
  reject <id> [note]       Reject exception or unsupported statement
  more <id> [note]         Mark Needs More Evidence
  resolved <id> [note]     Mark Resolved
  clear <id>               Clear expert decision
  summary                  Show timing and queue summary
  q                        Save and quit`);
}

function parseDecisionCommand(command) {
  const map = {
    approve: EXPERT_REVIEW_ACTIONS.APPROVED,
    a: EXPERT_REVIEW_ACTIONS.APPROVED,
    reject: EXPERT_REVIEW_ACTIONS.REJECTED,
    j: EXPERT_REVIEW_ACTIONS.REJECTED,
    more: EXPERT_REVIEW_ACTIONS.NEEDS_MORE_EVIDENCE,
    n: EXPERT_REVIEW_ACTIONS.NEEDS_MORE_EVIDENCE,
    resolved: EXPERT_REVIEW_ACTIONS.RESOLVED,
    resolve: EXPERT_REVIEW_ACTIONS.RESOLVED,
    z: EXPERT_REVIEW_ACTIONS.RESOLVED,
  };
  return map[command] || null;
}

export async function runExpertReviewConsole({
  documents,
  summary,
  query,
  session,
  save,
  confidenceThreshold = CONFIDENCE_THRESHOLD,
  generatedAt,
  input = defaultInput,
  output = defaultOutput,
}) {
  const rl = readline.createInterface({ input, output });
  let model = buildExpertReviewModel({ documents, summary, query, session, confidenceThreshold, generatedAt });

  try {
    printItemList(model);
    printConsoleHelp();

    while (true) {
      const line = normalize(await rl.question("\nexpert> "));
      if (!line) continue;

      const [command, id, ...noteParts] = line.split(" ");
      const note = noteParts.join(" ").trim();

      if (command === "q" || command === "quit") {
        if (save) await save();
        break;
      }

      if (command === "help" || command === "?") {
        printConsoleHelp();
        continue;
      }

      if (command === "list" || command === "l") {
        model = buildExpertReviewModel({ documents, summary, query, session, confidenceThreshold, generatedAt });
        printItemList(model);
        continue;
      }

      if (command === "summary" || command === "s") {
        model = buildExpertReviewModel({ documents, summary, query, session, confidenceThreshold, generatedAt });
        console.log(formatExpertReviewSummary(model));
        continue;
      }

      const item = findItem(model, id);
      if (!item) {
        console.log("Unknown expert review item.");
        continue;
      }

      if (command === "open" || command === "o") {
        printItemDetail(item);
        continue;
      }

      if (command === "clear") {
        clearExpertReviewDecision(session, item);
        if (save) await save();
        model = buildExpertReviewModel({ documents, summary, query, session, confidenceThreshold, generatedAt });
        console.log(`Cleared decision for ${item.id}.`);
        continue;
      }

      const action = parseDecisionCommand(command);
      if (!action) {
        console.log("Unknown command. Use help for expert console commands.");
        continue;
      }

      setExpertReviewDecision(session, item, action, note);
      if (save) await save();
      model = buildExpertReviewModel({ documents, summary, query, session, confidenceThreshold, generatedAt });
      console.log(`Marked ${item.id} as ${action}.`);
    }
  } finally {
    rl.close();
  }

  return model;
}
