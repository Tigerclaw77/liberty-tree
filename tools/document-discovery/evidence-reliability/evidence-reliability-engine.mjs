import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../normalization/text.mjs";
import { getCategory } from "../workbench/core/categories.mjs";

const UNKNOWN = "Unknown";
const RELIABILITY_THRESHOLD = 78;

const DECLARATION_CATEGORIES = new Set(["PFAS", "REACH", "RoHS", "TSCA", "Prop 65", "Environmental"]);
const PRODUCT_SPECIFIC_CATEGORIES = new Set(["PFAS", "SDS", "TDS", "REACH", "RoHS", "TSCA", "Prop 65", "Environmental"]);

const RELIABILITY_BASELINE = Object.freeze({
  currentAnalystEngagementMinutes: 210,
  previousExpertReviewMinutes: 78,
  newExpertReviewMinutes: 58,
});

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

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function textFor(document) {
  return lower([
    document.title,
    document.url,
    document.document_type,
    document.confidence_reason,
    document.extracted_text,
    document.text_sample,
    ...(Array.isArray(document.notes) ? document.notes : []),
    ...(Array.isArray(document.matched_terms) ? document.matched_terms : []),
  ].filter(Boolean).join(" "));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termPattern(term) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(String(term).toLowerCase())}([^a-z0-9]|$)`, "i");
}

function productTerms(query) {
  return [
    query.productCode,
    query.product,
    ...String(query.product || "").split(/\s+/).filter((term) => term.length >= 4),
  ].filter(Boolean);
}

function containsTerm(text, term) {
  return Boolean(term) && termPattern(term).test(text);
}

function hasNonPositiveTermContext(text, term) {
  if (!term || !containsTerm(text, term)) return false;
  const escaped = escapeRegExp(String(term).toLowerCase());
  const token = `${escaped}(?=$|[^a-z0-9])`;
  const prefix = "(?:does\\s+not|do\\s+not|did\\s+not|not|no|without|lacks?|missing|omits?|excludes?)";
  const scopeVerb = "(?:\\s+(?:list|include|identify|reference|cover|apply\\s+to|match|show|state|name))?";
  const uncertainty = "(?:may\\s+be|might\\s+be|could\\s+be|possibly|appears\\s+to\\s+be|ambiguous)";
  const patterns = [
    new RegExp(`${prefix}${scopeVerb}\\s+(?:the\\s+)?${token}`, "i"),
    new RegExp(`(?:rather\\s+than|instead\\s+of|not\\s+for)\\s+(?:the\\s+)?${token}`, "i"),
    new RegExp(`${uncertainty}\\s+(?:the\\s+)?${token}`, "i"),
    new RegExp(`(?:^|[^a-z0-9])${escaped}[^a-z0-9]+(?:is\\s+)?(?:not\\s+listed|not\\s+included|missing|omitted|excluded)`, "i"),
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function containsPositiveTerm(text, term) {
  return containsTerm(text, term) && !hasNonPositiveTermContext(text, term);
}

function productMatch(document, query) {
  const text = textFor(document);
  const terms = productTerms(query);
  const matched = terms.filter((term) => containsPositiveTerm(text, term));
  return {
    matched,
    hasCode: Boolean(query.productCode && containsPositiveTerm(text, query.productCode)),
    hasProduct: containsPositiveTerm(text, query.product),
  };
}

function extractedTextLength(document) {
  const explicit = [
    document.extracted_text_length,
    document.extractable_text_length,
    document.text_length,
    document.ocr_text_length,
  ];
  for (const value of explicit) {
    if (value !== undefined && value !== null && value !== "") return Number(value);
  }
  const text = `${document.extracted_text || ""}${document.text_sample || ""}`;
  return text ? text.length : null;
}

function isImageOnlyOrUnreadable(document) {
  const text = textFor(document);
  const textLength = extractedTextLength(document);
  if (Number.isFinite(textLength) && textLength <= 0) return true;
  return (
    /\b(image[-\s]?only|bitmap pages only|embedded images|camera[-\s]?scanned|no text layer|no extractable text|text length is zero|no parsed (?:section )?text)\b/.test(text) ||
    /\bscanned\b/.test(text) && /\b(no ocr|without ocr|ocr required|extracted text length is zero)\b/.test(text)
  );
}

function hasBrokenSource(document) {
  const text = textFor(document);
  const status = Number(document.http_status || document.status_code || document.fetch_status_code || 0);
  if (status >= 400) return true;
  if (["BROKEN", "DEAD", "FAILED", "UNAVAILABLE", "NOT_FOUND"].includes(String(document.link_status || document.fetch_status || "").toUpperCase())) return true;
  return /\b(404|410|dead link|broken link|source unavailable|not found|fetch failed)\b/.test(text);
}

function hasIncompletePageRange(document) {
  const text = textFor(document);
  const range = text.match(/\bpages?\s+(\d+)\s*[-–]\s*(\d+)\s+of\s+(\d+)\b/);
  if (range && Number(range[2]) < Number(range[3])) return true;
  const count = text.match(/\b(\d+)\s+of\s+(\d+)\s+pages?\b/);
  return Boolean(count && Number(count[1]) < Number(count[2]));
}

function manufacturerMismatch(document, query) {
  const expected = lower(query.manufacturer);
  const actual = lower(document.manufacturer);
  if (!expected || expected === UNKNOWN.toLowerCase() || !actual) return false;
  return actual !== expected;
}

function authorityKnown(document) {
  return [
    document.issuer,
    document.custodian,
    document.authority,
    document.authority_confirmed,
    document.signed_by,
    document.signatory,
    document.reviewer,
  ].some((field) => normalize(field));
}

function parseDate(value) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function yearsOld(value, generatedAt = new Date()) {
  const parsed = parseDate(value);
  if (!parsed) return null;
  return (generatedAt.getTime() - parsed.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function declarationSignal(document) {
  const text = textFor(document);
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

function issue(type, severity, message, why, action, evidence = {}) {
  return {
    type,
    severity,
    message,
    why_flagged: why,
    recommended_action: action,
    evidence,
  };
}

function scoreAuthenticity(document) {
  if (isMissing(document)) return 0;
  let score = 45;
  const url = String(document.url || "");
  if (/^https?:\/\//i.test(url)) score += 20;
  if (/\.pdf(?:$|\?)/i.test(url)) score += 10;
  if (document.status === "FOUND") score += 10;
  if (document.confidence === "High") score += 12;
  else if (document.confidence === "Medium") score += 6;
  else if (document.confidence === "Low") score -= 8;
  else score -= 15;
  if (["HTML_DROPDOWN_OPTION", "PATTERN_PROBE", "SITEMAP"].includes(document.discovery_method)) score += 8;
  if (document.source_page) score += 5;
  if (textFor(document).includes("scanned")) score -= 5;
  if (isImageOnlyOrUnreadable(document)) score -= 45;
  if (hasBrokenSource(document)) score -= 40;
  return clamp(score);
}

function scoreAuthority(document, query) {
  if (isMissing(document)) return 0;
  let score = 55;
  const docCategory = category(document);
  if (document.manufacturer && !manufacturerMismatch(document, query)) score += 15;
  if (manufacturerMismatch(document, query)) score -= 35;
  if (authorityKnown(document)) score += 25;
  if (DECLARATION_CATEGORIES.has(docCategory) && !authorityKnown(document)) score -= 25;
  if (!document.manufacturer) score -= 8;
  return clamp(score);
}

function scoreProductSpecificity(document, query) {
  if (isMissing(document)) return 0;
  const match = productMatch(document, query);
  let score = 40;
  if (match.hasCode) score += 35;
  if (match.hasProduct) score += 20;
  score += Math.min(15, match.matched.length * 5);
  const text = textFor(document);
  if (/\b(general|global|all products|product family|category|catalog)\b/.test(text) && !match.hasCode) score -= 25;
  if (PRODUCT_SPECIFIC_CATEGORIES.has(category(document)) && !match.hasCode && !match.hasProduct) score -= 25;
  return clamp(score);
}

function scoreRevisionFreshness(document, generatedAt) {
  if (isMissing(document)) return 0;
  let score = 60;
  const age = yearsOld(document.revision_date, generatedAt);
  if (age === null) score -= 12;
  else if (age <= 3) score += 25;
  else if (age <= 5) score += 10;
  else score -= 20;
  if (document.is_latest_revision) score += 10;
  if (Number(document.older_revision_count || 0) > 0 && !document.is_latest_revision) score -= 35;
  return clamp(score);
}

function scoreCompleteness(document) {
  if (isMissing(document)) return 0;
  let score = 62;
  if (document.title) score += 8;
  if (document.url) score += 8;
  if (document.revision_date) score += 8;
  if (document.confidence_reason) score += 6;
  if (DECLARATION_CATEGORIES.has(category(document)) && authorityKnown(document)) score += 8;
  if (DECLARATION_CATEGORIES.has(category(document)) && !authorityKnown(document)) score -= 12;
  const text = textFor(document);
  if (/\b(incomplete|missing page|page missing|truncated|partial|illegible)\b/.test(text)) score -= 35;
  if (hasIncompletePageRange(document)) score -= 35;
  if (isImageOnlyOrUnreadable(document)) score -= 45;
  if (text.includes("scanned") && !text.includes("ocr")) score -= 10;
  return clamp(score);
}

function scoreInternalConsistency(document, query) {
  if (isMissing(document)) return 0;
  let score = 76;
  const signal = declarationSignal(document);
  const match = productMatch(document, query);
  if (signal === "mixed") score -= 35;
  if (PRODUCT_SPECIFIC_CATEGORIES.has(category(document)) && query.productCode && !match.hasCode && textFor(document).includes("product-specific")) score -= 20;
  if (manufacturerMismatch(document, query)) score -= 20;
  return clamp(score);
}

function baseAssessment(document, query, generatedAt) {
  const dimensions = {
    authenticity: scoreAuthenticity(document),
    authority: scoreAuthority(document, query),
    product_specificity: scoreProductSpecificity(document, query),
    revision_freshness: scoreRevisionFreshness(document, generatedAt),
    completeness: scoreCompleteness(document),
    internal_consistency: scoreInternalConsistency(document, query),
    cross_document_consistency: isMissing(document) ? 0 : 76,
  };

  return {
    document,
    document_key: documentKey(document),
    category: category(document),
    signal: declarationSignal(document),
    dimensions,
    issues: [],
  };
}

function addDocumentLevelIssues(assessment, query) {
  const { document } = assessment;
  const docCategory = assessment.category;
  const match = productMatch(document, query);
  const text = textFor(document);

  if (isMissing(document)) {
    assessment.issues.push(issue(
      "MISSING_EVIDENCE_RECORD",
      "High",
      `${docCategory} evidence is missing.`,
      "The discovery or workbench state contains a missing-document record.",
      "Keep as an open gap until source evidence is received and indexed.",
    ));
    return;
  }

  if (isImageOnlyOrUnreadable(document)) {
    const issueType = docCategory === "SDS" ? "IMAGE_ONLY_SDS_WITHOUT_TEXT" : "IMAGE_ONLY_PDF_WITHOUT_TEXT";
    assessment.issues.push(issue(
      issueType,
      "Critical",
      `${docCategory} source appears image-only or lacks extractable text.`,
      "Source metadata or analyst notes indicate scanned/image pages without validated extractable text.",
      "Require OCR completion or human readback verification before relying on this document.",
    ));
  }

  if (hasBrokenSource(document)) {
    assessment.issues.push(issue(
      "BROKEN_SOURCE_LINK_NOT_VALIDATED",
      "High",
      "Source URL appears unavailable or was not retrievable.",
      "Source metadata includes a failed HTTP status, broken-link cue, or unavailable-source marker.",
      "Re-fetch the source, attach a stable copy, or replace the document before relying on it.",
    ));
  }

  if (PRODUCT_SPECIFIC_CATEGORIES.has(docCategory) && query.productCode && !match.hasCode && /\b(sds|tds|declaration|pfas|reach|rohs|tsca|prop)\b/.test(text)) {
    assessment.issues.push(issue(
      "PRODUCT_CODE_MISMATCH",
      "High",
      `${docCategory} evidence does not clearly match product code ${query.productCode}.`,
      "Product-specific packet evidence should identify the requested product/SKU or provide a reliable mapping.",
      "Request product/SKU applicability confirmation before relying on this source.",
    ));
  }

  if (manufacturerMismatch(document, query)) {
    assessment.issues.push(issue(
      "SUPPLIER_MANUFACTURER_MISMATCH",
      "High",
      "Document manufacturer metadata does not match the engagement manufacturer.",
      `Expected ${query.manufacturer}; document metadata identifies ${document.manufacturer || UNKNOWN}.`,
      "Confirm supplier/manufacturer relationship or reject the source for this packet.",
    ));
  }

  if (DECLARATION_CATEGORIES.has(docCategory) && !authorityKnown(document)) {
    assessment.issues.push(issue(
      "MISSING_SIGNATURE_OR_AUTHORITY",
      docCategory === "PFAS" ? "High" : "Medium",
      `${docCategory} declaration lacks signer, approver, or issuer-authority metadata.`,
      "Declaration documents normally require issuer authority before expert reliance.",
      "Confirm issuer authority, signature, approval status, issue date, and product scope.",
    ));
  }

  if (DECLARATION_CATEGORIES.has(docCategory) && /\b(general|global|all products|product family|category)\b/.test(text) && !match.hasCode) {
    assessment.issues.push(issue(
      "GENERIC_DECLARATION_APPLIED_TO_PRODUCT_REQUEST",
      "High",
      `${docCategory} declaration appears generic rather than product-specific.`,
      "The packet request is product-specific, but the source does not clearly identify the requested product/SKU.",
      "Request a product-specific declaration or written mapping before relying on the generic declaration.",
    ));
  }

  if (hasIncompletePageRange(document)) {
    assessment.issues.push(issue(
      "INCOMPLETE_PAGE_RANGE_NOT_PARSED",
      "High",
      "Document page range indicates an incomplete file.",
      "The source metadata or title identifies fewer delivered pages than the total page count.",
      "Obtain the complete document before relying on this source.",
    ));
  }

  if (/\b(incomplete|missing page|page missing|truncated|partial|illegible)\b/.test(text)) {
    assessment.issues.push(issue(
      "INCOMPLETE_DOCUMENT",
      "High",
      "Document appears incomplete or not fully readable.",
      "Completeness terms were found in source metadata or analyst notes.",
      "Obtain a complete legible source before relying on the document.",
    ));
  }

  if (assessment.signal === "mixed") {
    assessment.issues.push(issue(
      "INTERNAL_CONFLICTING_STATEMENT",
      "High",
      "Document contains mixed positive and negative PFAS/compliance language cues.",
      "The same source context contains cues such as PFAS-free language and PFAS/fluoropolymer presence language.",
      "Route to expert review and compare exact source text before packet reliance.",
    ));
  }
}

function applyCrossDocumentIssues(assessments) {
  const declarationGroups = groupBy(
    assessments.filter((assessment) => !isMissing(assessment.document) && DECLARATION_CATEGORIES.has(assessment.category)),
    (assessment) => assessment.category,
  );

  for (const [docCategory, group] of declarationGroups.entries()) {
    const hasPositive = group.some((assessment) => assessment.signal === "positive" || assessment.signal === "mixed");
    const hasNegative = group.some((assessment) => assessment.signal === "negative" || assessment.signal === "mixed");
    if (hasPositive && hasNegative) {
      for (const assessment of group) {
        assessment.dimensions.cross_document_consistency = clamp(assessment.dimensions.cross_document_consistency - 35);
        assessment.issues.push(issue(
          "CONFLICTING_STATEMENTS",
          "High",
          `Potentially conflicting ${docCategory} statements exist across sources.`,
          "Reliability scan found both positive and negative PFAS/compliance language cues across related declaration records.",
          "Compare exact declaration text, revision dates, definitions, and product scope before relying on either source.",
          { related_document_keys: group.map((item) => item.document_key) },
        ));
      }
    }
  }

  const revisionGroups = groupBy(
    assessments.filter((assessment) => !isMissing(assessment.document)),
    (assessment) => assessment.document.timeline_group || `${assessment.category}:${normalizedTitle(assessment.document)}`,
  );

  for (const [groupKey, group] of revisionGroups.entries()) {
    if (group.length < 2) continue;
    const revisionValues = new Set(group.map((assessment) => assessment.document.revision_date || UNKNOWN));
    const hasRevisionConflict = revisionValues.size > 1 || group.some((assessment) => Number(assessment.document.older_revision_count || 0) > 0);
    const hasDuplicateDeclarations = group.some((assessment) => DECLARATION_CATEGORIES.has(assessment.category));
    if (!hasRevisionConflict && !hasDuplicateDeclarations) continue;

    for (const assessment of group) {
      if (hasRevisionConflict && Number(assessment.document.older_revision_count || 0) > 0 && !assessment.document.is_latest_revision) {
        assessment.dimensions.revision_freshness = clamp(assessment.dimensions.revision_freshness - 35);
        assessment.issues.push(issue(
          "OBSOLETE_REVISION",
          "High",
          "Document appears to be an older or superseded revision.",
          "Workbench timeline grouping found newer related records or older-revision indicators.",
          "Confirm the current applicable revision and mark older records as duplicate or superseded.",
          { timeline_group: groupKey },
        ));
      }

      if (hasDuplicateDeclarations && group.length > 1) {
        assessment.dimensions.cross_document_consistency = clamp(assessment.dimensions.cross_document_consistency - 8);
        assessment.issues.push(issue(
          "DUPLICATE_DECLARATION",
          "Low",
          "Possible duplicate declaration records exist.",
          "Related declaration records share a normalized title or timeline group.",
          "Confirm whether the sources are duplicates, regional variants, or distinct revisions.",
          { related_document_keys: group.map((item) => item.document_key) },
        ));
      }
    }
  }
}

function overallScore(dimensions) {
  return clamp(
    dimensions.authenticity * 0.16 +
    dimensions.authority * 0.16 +
    dimensions.product_specificity * 0.18 +
    dimensions.revision_freshness * 0.12 +
    dimensions.completeness * 0.14 +
    dimensions.internal_consistency * 0.12 +
    dimensions.cross_document_consistency * 0.12,
  );
}

function exceptionSeverity(issues, score) {
  if (issues.some((item) => item.severity === "Critical")) return "Critical";
  if (issues.some((item) => item.severity === "High") || score < 60) return "High";
  if (issues.some((item) => item.severity === "Medium") || score < RELIABILITY_THRESHOLD) return "Medium";
  return "Low";
}

function buildDocumentRecord(assessment) {
  const score = overallScore(assessment.dimensions);
  const highValueIssues = assessment.issues.filter((item) => item.severity !== "Low");
  const exception = score < RELIABILITY_THRESHOLD || highValueIssues.length > 0;
  return {
    document_key: assessment.document_key,
    title: assessment.document.title || UNKNOWN,
    url: assessment.document.url || UNKNOWN,
    category: assessment.category,
    status: assessment.document.status || UNKNOWN,
    analyst_action: assessment.document.analyst_action || "",
    reliability_score: score,
    ready_for_reliance: !exception,
    dimensions: assessment.dimensions,
    issues: assessment.issues,
  };
}

function buildExceptions(records) {
  return records
    .filter((record) => !record.ready_for_reliance)
    .map((record, index) => ({
      exception_id: `REL-${padId(index + 1)}`,
      document_key: record.document_key,
      title: record.title,
      category: record.category,
      reliability_score: record.reliability_score,
      severity: exceptionSeverity(record.issues, record.reliability_score),
      issue_types: [...new Set(record.issues.map((item) => item.type))],
      issue: record.issues.map((item) => item.message).join(" "),
      why_flagged: record.issues.map((item) => item.why_flagged).join(" "),
      recommended_action: record.issues.map((item) => item.recommended_action).join(" "),
      supporting_evidence: [{
        document_key: record.document_key,
        title: record.title,
        url: record.url,
        reliability_score: record.reliability_score,
        dimensions: record.dimensions,
      }],
    }));
}

function legacyExpertFlagCount(records) {
  return records.filter((record) => (
    record.category === "PFAS" ||
    record.category === "SDS" ||
    record.issues.some((issueItem) => ["MISSING_SIGNATURE_OR_AUTHORITY", "DUPLICATE_DECLARATION"].includes(issueItem.type)) ||
    record.dimensions.product_specificity < RELIABILITY_THRESHOLD ||
    record.dimensions.authority < RELIABILITY_THRESHOLD
  )).length;
}

function buildMetrics(records, exceptions) {
  const legacyCount = legacyExpertFlagCount(records);
  const filteredCount = records.filter((record) => (
    record.ready_for_reliance &&
    (record.category === "PFAS" || record.category === "SDS" || record.dimensions.authority < RELIABILITY_THRESHOLD)
  )).length;
  const measuredReduction = legacyCount === 0 ? 0 : (filteredCount / legacyCount) * 100;
  const previousExpert = RELIABILITY_BASELINE.previousExpertReviewMinutes;
  const newExpert = RELIABILITY_BASELINE.newExpertReviewMinutes;
  const expertReduction = ((previousExpert - newExpert) / previousExpert) * 100;
  const total = RELIABILITY_BASELINE.currentAnalystEngagementMinutes + newExpert;

  return {
    legacy_expert_flag_count: legacyCount,
    reliability_exception_count: exceptions.length,
    false_positive_candidates_removed: filteredCount,
    false_positive_reduction_percent: Number(measuredReduction.toFixed(1)),
    previous_expert_review_minutes: previousExpert,
    new_expert_review_minutes: newExpert,
    expert_review_reduction_percent: Number(expertReduction.toFixed(1)),
    analyst_engagement_minutes: RELIABILITY_BASELINE.currentAnalystEngagementMinutes,
    new_total_engagement_minutes: total,
    success_criterion_met: expertReduction >= 25,
  };
}

export function buildEvidenceReliabilityModel({ documents, query, generatedAt } = {}) {
  const normalizedQuery = normalizeQuery(query);
  const generatedDate = generatedAt ? new Date(generatedAt) : new Date();
  const assessments = activeDocuments(documents).map((document) => baseAssessment(document, normalizedQuery, generatedDate));

  for (const assessment of assessments) {
    addDocumentLevelIssues(assessment, normalizedQuery);
  }
  applyCrossDocumentIssues(assessments);

  const records = assessments.map(buildDocumentRecord);
  const exceptions = buildExceptions(records);

  return {
    query: normalizedQuery,
    generated_at: new Date().toISOString(),
    threshold: RELIABILITY_THRESHOLD,
    document_count: records.length,
    exception_count: exceptions.length,
    ready_document_count: records.filter((record) => record.ready_for_reliance).length,
    metrics: buildMetrics(records, exceptions),
    documents: records,
    exceptions,
  };
}

function reliabilityCsv(model) {
  const headers = [
    "document_key",
    "title",
    "url",
    "category",
    "status",
    "analyst_action",
    "reliability_score",
    "ready_for_reliance",
    "authenticity",
    "authority",
    "product_specificity",
    "revision_freshness",
    "completeness",
    "internal_consistency",
    "cross_document_consistency",
    "issues",
  ];
  const rows = model.documents.map((record) => headers.map((header) => {
    if (record.dimensions?.[header] !== undefined) return csvEscape(record.dimensions[header]);
    if (header === "issues") return csvEscape(record.issues.map((item) => item.type).join("; "));
    return csvEscape(record[header]);
  }).join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}

function renderExceptions(model) {
  const lines = [
    "# Evidence Reliability Exceptions",
    "",
    `Threshold: ${model.threshold}`,
    `Document count: ${model.document_count}`,
    `Exception count: ${model.exception_count}`,
    "",
  ];

  if (model.exceptions.length === 0) {
    lines.push("No reliability exceptions were generated. This does not create a legal conclusion; it only means the reliability heuristics did not identify an exception.", "");
    return `${lines.join("\n").trim()}\n`;
  }

  for (const item of model.exceptions) {
    lines.push(`## ${item.exception_id}: ${item.title}`);
    lines.push("");
    lines.push(`Category: ${item.category}`);
    lines.push(`Reliability score: ${item.reliability_score}`);
    lines.push(`Severity: ${item.severity}`);
    lines.push(`Issue types: ${item.issue_types.join(", ")}`);
    lines.push(`Issue: ${item.issue}`);
    lines.push(`Why flagged: ${item.why_flagged}`);
    lines.push(`Recommended action: ${item.recommended_action}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export async function writeEvidenceReliabilityExports({ documents, query, exportDir, generatedAt }) {
  await mkdir(exportDir, { recursive: true });
  const model = buildEvidenceReliabilityModel({ documents, query, generatedAt });
  const stem = slugify(`${model.query.manufacturer}-${model.query.productCode || model.query.product || "unknown"}-evidence-reliability`);
  const jsonPath = path.join(exportDir, "evidence-reliability.json");
  const csvPath = path.join(exportDir, "evidence-reliability.csv");
  const exceptionsPath = path.join(exportDir, "evidence-reliability-exceptions.md");
  const scopedJsonPath = path.join(exportDir, `${stem}.json`);
  const scopedCsvPath = path.join(exportDir, `${stem}.csv`);
  const scopedExceptionsPath = path.join(exportDir, `${stem}-exceptions.md`);
  const json = JSON.stringify(model, null, 2);
  const csv = reliabilityCsv(model);
  const exceptions = renderExceptions(model);

  await writeFile(jsonPath, json);
  await writeFile(csvPath, csv);
  await writeFile(exceptionsPath, exceptions);
  await writeFile(scopedJsonPath, json);
  await writeFile(scopedCsvPath, csv);
  await writeFile(scopedExceptionsPath, exceptions);

  return {
    jsonPath,
    csvPath,
    exceptionsPath,
    scopedJsonPath,
    scopedCsvPath,
    scopedExceptionsPath,
    metrics: model.metrics,
    documentCount: model.document_count,
    exceptionCount: model.exception_count,
  };
}

export function formatEvidenceReliabilitySummary(modelOrExports) {
  const metrics = modelOrExports.metrics;
  const documentCount = modelOrExports.document_count ?? modelOrExports.documentCount;
  const exceptionCount = modelOrExports.exception_count ?? modelOrExports.exceptionCount;
  return [
    "Evidence Reliability Engine",
    "---------------------------",
    `Documents scored:         ${documentCount}`,
    `Reliability exceptions:   ${exceptionCount}`,
    `False-positive reduction: ${metrics.false_positive_reduction_percent.toFixed(1)}%`,
    `Expert review reduction:  ${metrics.expert_review_reduction_percent.toFixed(1)}%`,
    `Estimated expert time:    ${(metrics.new_expert_review_minutes / 60).toFixed(1)}h`,
    `Estimated total time:     ${(metrics.new_total_engagement_minutes / 60).toFixed(1)}h`,
    `Success criterion met:    ${metrics.success_criterion_met ? "yes" : "no"}`,
  ].join("\n");
}
