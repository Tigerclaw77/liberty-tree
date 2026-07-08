import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildSupplierRequestModel,
  writeSupplierRequestExports,
} from "./supplier-request-generator.mjs";

const query = {
  manufacturer: "MG Chemicals",
  product: "422B Silicone Modified Conformal Coating",
  productCode: "422B",
};

const sdsUrl = "https://example.test/sds-422b.pdf";
const documents = [
  {
    title: "Missing PFAS declaration",
    url: null,
    document_type: "PFAS declaration",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    confidence: "Unknown",
    confidence_score: 0,
    confidence_reason: "No PFAS declaration was discovered after v1 public-source search targets completed.",
    discovery_method: "NEGATIVE_DISCOVERY",
    status: "MISSING",
  },
  {
    title: "MG 422B SDS candidate",
    url: sdsUrl,
    document_type: "SDS",
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    product_code: "422B",
    revision_date: "2026-02-20",
    confidence: "Low",
    confidence_score: 48,
    confidence_reason: "classified as SDS; product form match is unclear",
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
    confidence: "High",
    confidence_score: 91,
    confidence_reason: "classified as TDS; matched product terms: 422B",
    discovery_method: "PATTERN_PROBE",
    status: "FOUND",
    analyst_action: "VERIFIED",
  },
];

const summary = {
  documents_found: 1,
  possible_documents: 1,
  missing_documents: 1,
  documents_verified: 1,
  needs_expert_review: 0,
  remaining_gaps: 1,
  estimated_packet_readiness: "CONDITIONAL",
};

const session = {
  expert_reviews: {
    [`low-confidence:${sdsUrl}`]: {
      action: "NEEDS_MORE_EVIDENCE",
      note: "Ask supplier to confirm current SDS and product-form applicability.",
      updated_at: "2026-07-08T12:00:00.000Z",
    },
  },
};

const model = buildSupplierRequestModel({
  documents,
  summary,
  query,
  session,
  generatedAt: "2026-07-08T12:00:00.000Z",
});

assert.ok(model.request_count >= 2);
assert.ok(model.metrics.missing_evidence_prep_reduction_percent >= 60);
assert.ok(model.metrics.success_criterion_met);
assert.ok(model.source_inputs.includes("expert review exceptions"));
assert.ok(model.source_inputs.includes("missing documentation register"));
assert.ok(model.requests.some((request) => request.missing_document.includes("PFAS")));
assert.ok(model.requests.some((request) => request.exact_requested_evidence.includes("Current Safety Data Sheet")));
assert.ok(model.requests.every((request) => request.deadline_placeholder === "[DEADLINE TBD]"));
assert.ok(model.requests.every((request) => request.email_draft.includes("documentation-completeness request only")));
assert.ok(model.requests.every((request) => !request.email_draft.toLowerCase().includes("noncompliance")));
assert.ok(model.requests.every((request) => !request.email_draft.toLowerCase().includes("non-compliance")));
assert.ok(model.requests.every((request) => !request.email_draft.toLowerCase().includes("non-compliant")));

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lt-requests-"));
try {
  const exports = await writeSupplierRequestExports({
    documents,
    summary,
    query,
    session,
    exportDir: tempDir,
    generatedAt: "2026-07-08T12:00:00.000Z",
  });
  const csv = await readFile(exports.csvPath, "utf8");
  const json = JSON.parse(await readFile(exports.jsonPath, "utf8"));
  const emailDrafts = await readFile(exports.emailDraftsPath, "utf8");

  assert.ok(csv.includes("request_id,recipient_type,product_sku"));
  assert.ok(csv.includes("REQ-001"));
  assert.equal(json.metrics.success_criterion_met, true);
  assert.ok(emailDrafts.includes("# Supplier Request Email Drafts"));
  assert.ok(emailDrafts.includes("```text"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
