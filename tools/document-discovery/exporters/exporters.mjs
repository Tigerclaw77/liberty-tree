import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../normalization/text.mjs";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function writeExports(result, outDir) {
  await mkdir(outDir, { recursive: true });
  const stem = slugify(`${result.query.manufacturer}-${result.query.product}-${result.query.product_code || "no-code"}`);
  const jsonPath = path.join(outDir, `${stem}.json`);
  const csvPath = path.join(outDir, `${stem}.csv`);

  await writeFile(jsonPath, JSON.stringify(result, null, 2));
  await writeFile(csvPath, toCsv(result.documents));

  return { jsonPath, csvPath };
}

export function toCsv(documents) {
  const headers = [
    "title",
    "url",
    "document_type",
    "manufacturer",
    "product",
    "product_code",
    "revision_date",
    "confidence",
    "confidence_score",
    "confidence_reason",
    "discovery_method",
    "status",
    "source_page",
    "matched_terms",
    "notes",
  ];

  const rows = documents.map((doc) => headers.map((header) => csvEscape(doc[header])).join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}
