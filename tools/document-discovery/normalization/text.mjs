export function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function stripHtml(value) {
  return normalizeWhitespace(
    String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function buildSearchTerms({ manufacturer, product, productCode }) {
  const terms = [
    manufacturer,
    product,
    productCode,
    `${productCode || ""} PFAS`,
    `${productCode || ""} SDS`,
    `${productCode || ""} TDS`,
    `${productCode || ""} RoHS`,
    `${productCode || ""} REACH`,
    `${productCode || ""} SVHC`,
    `${productCode || ""} TSCA`,
    `${productCode || ""} Prop 65`,
  ];

  return unique(terms.map(normalizeWhitespace));
}
