export const STATUS = Object.freeze({
  FOUND: "FOUND",
  POSSIBLE: "POSSIBLE",
  MISSING: "MISSING",
});

export const CONFIDENCE = Object.freeze({
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  UNKNOWN: "Unknown",
});

export const DOCUMENT_TYPES = Object.freeze({
  PFAS: "PFAS declaration",
  SDS: "SDS",
  TDS: "TDS",
  ROHS: "RoHS declaration",
  REACH: "REACH/SVHC declaration",
  TSCA: "TSCA declaration",
  PROP65: "Prop 65 declaration",
  ENVIRONMENTAL: "Environmental compliance",
  TECHNICAL: "Technical document",
  PRODUCT_PAGE: "Product page",
  SITEMAP: "Sitemap",
  ROBOTS: "Robots.txt",
  UNKNOWN: "Unknown",
});

export function createDocumentRecord({
  title,
  url,
  documentType,
  manufacturer,
  product,
  productCode,
  revisionDate = null,
  confidence = CONFIDENCE.UNKNOWN,
  confidenceScore = 0,
  confidenceReason = "",
  discoveryMethod,
  status = STATUS.POSSIBLE,
  sourcePage = null,
  matchedTerms = [],
  notes = [],
}) {
  return {
    title,
    url,
    document_type: documentType,
    manufacturer,
    product,
    product_code: productCode || null,
    revision_date: revisionDate,
    confidence,
    confidence_score: confidenceScore,
    confidence_reason: confidenceReason,
    discovery_method: discoveryMethod,
    status,
    source_page: sourcePage,
    matched_terms: matchedTerms,
    notes,
  };
}
