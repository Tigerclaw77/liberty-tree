import { DOCUMENT_TYPES } from "../models/document-record.mjs";
import { normalizeWhitespace } from "../normalization/text.mjs";

export function classifyDocument(candidate) {
  const haystack = normalizeWhitespace(`${candidate.title || ""} ${candidate.url || ""} ${candidate.context || ""}`).toLowerCase();

  if (haystack.includes("pfas") || haystack.includes("polyfluoro")) return DOCUMENT_TYPES.PFAS;
  if (haystack.includes("msds") || haystack.includes("/sds/") || haystack.includes("sds-") || haystack.includes("safety data sheet")) return DOCUMENT_TYPES.SDS;
  if (haystack.includes("/tds/") || haystack.includes("tds-") || haystack.includes("technical data sheet")) return DOCUMENT_TYPES.TDS;
  if (haystack.includes("rohs")) return DOCUMENT_TYPES.ROHS;
  if (haystack.includes("svhc") || haystack.includes("reach")) return DOCUMENT_TYPES.REACH;
  if (haystack.includes("tsca")) return DOCUMENT_TYPES.TSCA;
  if (haystack.includes("prop65") || haystack.includes("prop 65") || haystack.includes("calprop")) return DOCUMENT_TYPES.PROP65;
  if (haystack.includes("environment") || haystack.includes("eupop") || haystack.includes("eu_pop") || haystack.includes("pops")) return DOCUMENT_TYPES.ENVIRONMENTAL;
  if (haystack.includes("application guide") || haystack.includes("category-data-sheets") || haystack.includes("technical")) return DOCUMENT_TYPES.TECHNICAL;
  if (haystack.includes("/products/") || haystack.includes("/product/")) return DOCUMENT_TYPES.PRODUCT_PAGE;
  if (haystack.includes("sitemap")) return DOCUMENT_TYPES.SITEMAP;
  if (haystack.includes("robots.txt")) return DOCUMENT_TYPES.ROBOTS;

  return DOCUMENT_TYPES.UNKNOWN;
}

export function detectRevisionDate(text) {
  const value = normalizeWhitespace(text);
  const patterns = [
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i,
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[0];
  }

  return null;
}
