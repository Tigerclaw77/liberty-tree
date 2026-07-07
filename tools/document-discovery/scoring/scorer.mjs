import { CONFIDENCE, DOCUMENT_TYPES, STATUS } from "../models/document-record.mjs";
import { isPdfUrl, isLikelyDocumentUrl } from "../normalization/urls.mjs";
import { normalizeWhitespace } from "../normalization/text.mjs";

const HIGH_VALUE_TYPES = new Set([
  DOCUMENT_TYPES.PFAS,
  DOCUMENT_TYPES.SDS,
  DOCUMENT_TYPES.TDS,
  DOCUMENT_TYPES.ROHS,
  DOCUMENT_TYPES.REACH,
  DOCUMENT_TYPES.TSCA,
  DOCUMENT_TYPES.PROP65,
  DOCUMENT_TYPES.ENVIRONMENTAL,
]);

export function scoreCandidate(candidate, { manufacturer, product, productCode }) {
  const haystack = normalizeWhitespace(`${candidate.title || ""} ${candidate.url || ""} ${candidate.context || ""}`).toLowerCase();
  const productTerms = [
    productCode,
    product,
    ...String(product || "").split(/\s+/).filter((term) => term.length > 3),
  ].filter(Boolean);
  const matchedTerms = productTerms.filter((term) => haystack.includes(String(term).toLowerCase()));

  let score = 10;
  const reasons = [];

  if (candidate.documentType && HIGH_VALUE_TYPES.has(candidate.documentType)) {
    score += 25;
    reasons.push(`classified as ${candidate.documentType}`);
  }

  if (isPdfUrl(candidate.url)) {
    score += 15;
    reasons.push("direct PDF URL");
  } else if (isLikelyDocumentUrl(candidate.url)) {
    score += 10;
    reasons.push("document-like URL");
  }

  if (candidate.discoveryMethod === "HTML_DROPDOWN_OPTION") {
    score += 20;
    reasons.push("found in dropdown option value");
  } else if (candidate.discoveryMethod === "PATTERN_PROBE") {
    score += 12;
    reasons.push("matched known naming pattern and URL responded");
  } else if (candidate.discoveryMethod === "SITEMAP") {
    score += 8;
    reasons.push("found in sitemap");
  } else if (candidate.discoveryMethod === "ROBOTS_TXT") {
    score += 5;
    reasons.push("found from robots.txt path");
  }

  if (matchedTerms.length > 0) {
    score += Math.min(20, matchedTerms.length * 8);
    reasons.push(`matched product terms: ${matchedTerms.join(", ")}`);
  }

  if (haystack.includes(String(manufacturer || "").toLowerCase().split(/\s+/)[0])) {
    score += 5;
    reasons.push("manufacturer term present");
  }

  if (!HIGH_VALUE_TYPES.has(candidate.documentType) && candidate.documentType !== DOCUMENT_TYPES.PRODUCT_PAGE) {
    score -= 10;
    reasons.push("document type is weak or unknown");
  }

  score = Math.max(0, Math.min(100, score));

  let confidence = CONFIDENCE.UNKNOWN;
  if (score >= 80) confidence = CONFIDENCE.HIGH;
  else if (score >= 60) confidence = CONFIDENCE.MEDIUM;
  else if (score >= 35) confidence = CONFIDENCE.LOW;

  let status = STATUS.POSSIBLE;
  if (confidence === CONFIDENCE.HIGH || (confidence === CONFIDENCE.MEDIUM && HIGH_VALUE_TYPES.has(candidate.documentType))) {
    status = STATUS.FOUND;
  }

  return {
    confidence,
    confidenceScore: score,
    confidenceReason: reasons.join("; ") || "insufficient product-specific evidence",
    status,
    matchedTerms,
  };
}
