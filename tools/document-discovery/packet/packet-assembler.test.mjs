import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildPacketModel, writePacketExports } from "./packet-assembler.mjs";

const query = {
  manufacturer: "MG Chemicals",
  product: "422B Silicone Modified Conformal Coating",
  productCode: "422B",
};

const documents = [
  {
    title: "MG 422B PFAS Declaration",
    url: "https://example.test/MG-422B-PFAS-Declaration.pdf",
    document_type: "PFAS declaration",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-01-15",
    confidence: "High",
    confidence_score: 96,
    confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: 422B",
    discovery_method: "HTML_DROPDOWN_OPTION",
    status: "FOUND",
    analyst_action: "VERIFIED",
  },
  {
    title: "MG 422B SDS",
    url: "https://example.test/sds-422b.pdf",
    document_type: "SDS",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-02-20",
    confidence: "Medium",
    confidence_score: 78,
    confidence_reason: "classified as SDS; matched product terms: 422B",
    discovery_method: "PATTERN_PROBE",
    status: "FOUND",
    analyst_action: "NEEDS_EXPERT_REVIEW",
  },
  {
    title: "Missing PFAS analytical test report",
    url: null,
    document_type: "Analytical test report",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    confidence: "Unknown",
    confidence_score: 0,
    confidence_reason: "No PFAS analytical test report was discovered after v1 public-source search targets completed.",
    discovery_method: "NEGATIVE_DISCOVERY",
    status: "MISSING",
  },
];

const summary = {
  documents_found: 2,
  possible_documents: 0,
  missing_documents: 1,
  documents_verified: 1,
  needs_expert_review: 1,
  remaining_gaps: 2,
  estimated_packet_readiness: "CONDITIONAL",
};

const generatedAt = "2026-07-08T12:00:00.000Z";
const model = buildPacketModel({ documents, summary, query, generatedAt });

assert.equal(model.packet.id, "PFAS-PKT-mg-chemicals-422b-20260708-DRAFT");
assert.ok(model.metrics.assembly_reduction_percent >= 75);
assert.ok(JSON.stringify(model.sections).includes("Unknown - discovery output identifies manufacturer"));
assert.ok(JSON.stringify(model.sections).includes("[SRC-001; SRC-WB-001]"));
assert.ok(JSON.stringify(model.sections).includes("Expert review required for MG 422B SDS"));
assert.ok(JSON.stringify(model.sections).includes("No analyst-verified SDS record is present"));

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lt-packet-"));
try {
  const exports = await writePacketExports({ documents, summary, query, exportDir: tempDir, generatedAt });
  const markdown = await readFile(exports.markdownPath, "utf8");
  const html = await readFile(exports.htmlPath, "utf8");
  const printHtml = await readFile(exports.printHtmlPath, "utf8");

  assert.ok(markdown.includes("## 1. Cover Page"));
  assert.ok(markdown.includes("## 4. Evidence Matrix"));
  assert.ok(markdown.includes("## 9. Automation Metrics"));
  assert.ok(markdown.includes("78.1%"));
  assert.ok(html.includes("<table>"));
  assert.ok(printHtml.includes("@page"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
