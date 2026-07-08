const CATEGORY_ORDER = [
  "SDS",
  "TDS",
  "PFAS",
  "REACH",
  "RoHS",
  "SVHC",
  "TSCA",
  "Prop 65",
  "Other",
];

export function getCategory(document) {
  const type = String(document.document_type || "").toLowerCase();
  const text = [
    document.category,
    document.title,
    document.url,
    document.confidence_reason,
    document.extracted_text,
    document.text_sample,
    ...(Array.isArray(document.notes) ? document.notes : []),
    ...(Array.isArray(document.matched_terms) ? document.matched_terms : []),
  ].filter(Boolean).join(" ").toLowerCase();

  if (type.includes("sds") || text.includes("/sds/") || text.includes("/msds/") || text.includes("sds-")) return "SDS";
  if (text.includes("safety data sheet") || text.includes("material safety data sheet")) return "SDS";
  if (type.includes("tds") || text.includes("/tds/") || text.includes("tds-")) return "TDS";
  if (text.includes("technical data sheet")) return "TDS";
  if (type.includes("pfas") || text.includes("pfas")) return "PFAS";
  if (type.includes("rohs") || text.includes("rohs")) return "RoHS";
  if (type.includes("tsca") || text.includes("tsca")) return "TSCA";
  if (type.includes("prop 65") || text.includes("prop65") || text.includes("prop 65") || text.includes("calprop")) return "Prop 65";
  if (text.includes("svhc")) return "SVHC";
  if (text.includes("reach")) return "REACH";
  if (type.includes("svhc")) return "SVHC";
  if (type.includes("reach")) return "REACH";

  return "Other";
}

export function groupByCategory(documents) {
  const groups = new Map(CATEGORY_ORDER.map((category) => [category, []]));

  for (const document of documents) {
    const category = getCategory(document);
    groups.get(category).push({ ...document, category });
  }

  return CATEGORY_ORDER.map((category) => ({
    category,
    documents: groups.get(category),
  })).filter((group) => group.documents.length > 0);
}

export function categoryOrder(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}
