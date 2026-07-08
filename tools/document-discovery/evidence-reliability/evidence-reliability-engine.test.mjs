import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildEvidenceReliabilityModel,
  writeEvidenceReliabilityExports,
} from "./evidence-reliability-engine.mjs";

const query = {
  manufacturer: "MG Chemicals",
  product: "422B Silicone Modified Conformal Coating",
  productCode: "422B",
};

const documents = [
  {
    title: "MG 422B PFAS Free Declaration",
    url: "https://example.test/MG-422B-PFAS-Free-Declaration.pdf",
    document_type: "PFAS declaration",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-03-10",
    confidence: "High",
    confidence_score: 90,
    confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: 422B",
    discovery_method: "HTML_DROPDOWN_OPTION",
    status: "FOUND",
    timeline_group: "PFAS|example.test|mg 422b pfas declaration",
    is_latest_revision: true,
    older_revision_count: 1,
  },
  {
    title: "MG 422B PFAS Declaration with PTFE",
    url: "https://example.test/MG-422B-PFAS-Declaration-PTFE.pdf",
    document_type: "PFAS declaration",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2022-01-15",
    confidence: "Medium",
    confidence_score: 74,
    confidence_reason: "classified as PFAS declaration; title references PTFE; matched product terms: 422B",
    discovery_method: "HTML_DROPDOWN_OPTION",
    status: "FOUND",
    timeline_group: "PFAS|example.test|mg 422b pfas declaration",
    is_latest_revision: false,
    older_revision_count: 1,
  },
  {
    title: "Generic PFAS Declaration All Products",
    url: "https://example.test/Generic-PFAS-Declaration.pdf",
    document_type: "PFAS declaration",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-01-01",
    confidence: "High",
    confidence_score: 88,
    confidence_reason: "generic declaration; no product code",
    discovery_method: "SITEMAP",
    status: "FOUND",
  },
  {
    title: "OtherCo 9999 SDS",
    url: "https://example.test/sds-9999.pdf",
    document_type: "SDS",
    manufacturer: "OtherCo",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-02-20",
    confidence: "Medium",
    confidence_score: 70,
    confidence_reason: "mismatched product code 9999",
    discovery_method: "PATTERN_PROBE",
    status: "POSSIBLE",
  },
  {
    title: "MG 422B TDS",
    url: "https://example.test/tds-422b.pdf",
    document_type: "TDS",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-02-20",
    confidence: "Low",
    confidence_score: 45,
    confidence_reason: "classified as TDS; matched product terms: 422B",
    discovery_method: "PATTERN_PROBE",
    status: "FOUND",
    is_latest_revision: true,
  },
];

const model = buildEvidenceReliabilityModel({
  documents,
  query,
  generatedAt: "2026-07-08T12:00:00.000Z",
});

assert.equal(model.document_count, 5);
assert.ok(model.documents.every((document) => Number.isInteger(document.reliability_score)));
assert.ok(model.documents.every((document) => document.dimensions.authenticity !== undefined));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("CONFLICTING_STATEMENTS")));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("OBSOLETE_REVISION")));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("PRODUCT_CODE_MISMATCH")));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("SUPPLIER_MANUFACTURER_MISMATCH")));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("MISSING_SIGNATURE_OR_AUTHORITY")));
assert.ok(model.exceptions.some((item) => item.issue_types.includes("GENERIC_DECLARATION_APPLIED_TO_PRODUCT_REQUEST")));
assert.ok(model.metrics.expert_review_reduction_percent >= 25);
assert.equal(model.metrics.success_criterion_met, true);

const readyTds = model.documents.find((document) => document.title === "MG 422B TDS");
assert.equal(readyTds.ready_for_reliance, true);

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lt-reliability-"));
try {
  const exports = await writeEvidenceReliabilityExports({
    documents,
    query,
    exportDir: tempDir,
    generatedAt: "2026-07-08T12:00:00.000Z",
  });
  const json = JSON.parse(await readFile(exports.jsonPath, "utf8"));
  const csv = await readFile(exports.csvPath, "utf8");
  const exceptions = await readFile(exports.exceptionsPath, "utf8");

  assert.equal(json.metrics.success_criterion_met, true);
  assert.ok(csv.includes("document_key,title,url,category"));
  assert.ok(exceptions.includes("# Evidence Reliability Exceptions"));
  assert.ok(exceptions.includes("GENERIC_DECLARATION_APPLIED_TO_PRODUCT_REQUEST"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
