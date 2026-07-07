import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../../normalization/text.mjs";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function exportEvidenceIndex({ documents, summary, query, exportDir }) {
  await mkdir(exportDir, { recursive: true });
  const stem = slugify(`${query.manufacturer}-${query.product}-${query.productCode || "no-code"}`);
  const jsonPath = path.join(exportDir, `${stem}-evidence-index.json`);
  const csvPath = path.join(exportDir, `${stem}-evidence-index.csv`);

  const payload = {
    query: {
      manufacturer: query.manufacturer,
      product: query.product,
      product_code: query.productCode || null,
    },
    generated_at: new Date().toISOString(),
    summary,
    documents,
  };

  await writeFile(jsonPath, JSON.stringify(payload, null, 2));
  await writeFile(csvPath, toCsv(documents));

  return { jsonPath, csvPath };
}

function toCsv(documents) {
  const headers = [
    "category",
    "title",
    "url",
    "document_type",
    "status",
    "confidence",
    "confidence_score",
    "confidence_reason",
    "discovery_method",
    "revision_date",
    "manufacturer",
    "product",
    "product_code",
    "analyst_action",
    "analyst_note",
    "timeline_group",
    "is_latest_revision",
    "older_revision_count",
  ];

  const rows = documents.map((document) => headers.map((header) => csvEscape(document[header])).join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}
