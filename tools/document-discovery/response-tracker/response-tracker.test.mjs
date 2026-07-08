import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  RESPONSE_STATUSES,
  buildResponseTrackerModel,
  recordResponse,
  setResponseStatus,
  writeResponseTrackerExports,
} from "./response-tracker.mjs";

const supplierRequests = {
  query: {
    manufacturer: "MG Chemicals",
    product: "422B Silicone Modified Conformal Coating",
    productCode: "422B",
  },
  requests: [
    {
      request_id: "REQ-001",
      recipient_type: "Manufacturer or authorized supplier",
      product_sku: "422B Silicone Modified Conformal Coating (422B)",
      missing_document: "Product-specific PFAS declaration",
      why_needed: "Needed to close the unresolved documentation gap for Product-specific PFAS declaration.",
      supporting_context: "Missing PFAS declaration from workbench gap.",
      exact_requested_evidence: "Signed product-specific PFAS declaration for 422B.",
      deadline_placeholder: "[DEADLINE TBD]",
      email_subject: "Documentation request for 422B",
      email_draft: "Hello, please provide PFAS declaration.",
      short_internal_note: "Generated from unresolved missing-document gap.",
      source_inputs: ["supplier-requests.json", "missing documentation register"],
      originating_gaps: ["GAP-001"],
    },
    {
      request_id: "REQ-002",
      recipient_type: "Manufacturer technical documentation contact",
      product_sku: "422B Silicone Modified Conformal Coating (422B)",
      missing_document: "Current Safety Data Sheet",
      why_needed: "Needed to close unresolved SDS applicability uncertainty.",
      supporting_context: "Expert review marked Needs More Evidence.",
      exact_requested_evidence: "Current Safety Data Sheet for 422B with product/SKU confirmation.",
      deadline_placeholder: "[DEADLINE TBD]",
      email_subject: "Documentation request for SDS",
      email_draft: "Hello, please provide SDS confirmation.",
      short_internal_note: "Generated from unresolved expert exception.",
      source_inputs: ["expert review exceptions"],
      originating_gaps: ["XR-002"],
    },
  ],
};

const emailDraftsText = `# Supplier Request Email Drafts

## REQ-001: Product-specific PFAS declaration

## REQ-002: Current Safety Data Sheet
`;

const session = {};
setResponseStatus(session, "REQ-001", RESPONSE_STATUSES.SENT, "Sent to supplier contact.");
recordResponse(session, "REQ-002", {
  received_date: "2026-07-08",
  source_contact: "tech@example.test",
  attachment_document_title: "MG 422B SDS 2026",
  resolves_gap: "yes",
  remaining_uncertainty: "",
  follow_up_needed: "no",
  notes: "Response confirms product/SKU scope.",
});

const model = buildResponseTrackerModel({
  supplierRequests,
  emailDraftsText,
  session,
  expertReviewModel: {
    open_exception_items: 1,
    total_exception_items: 2,
  },
  missingDocumentationRegister: ["GAP-001"],
});

assert.equal(model.request_count, 2);
assert.equal(model.status_counts.SENT, 1);
assert.equal(model.status_counts.USABLE, 1);
assert.equal(model.source_inputs.email_drafts_md.loaded, true);
assert.equal(model.source_inputs.email_drafts_md.draft_count_hint, 2);
assert.equal(model.metrics.response_tracking_reduction_percent, 60);
assert.equal(model.metrics.success_criterion_met, true);
assert.equal(model.follow_up_emails.length, 1);
assert.ok(model.follow_up_emails[0].email_draft.includes("documentation-completeness follow-up only"));
assert.ok(model.gap_status_summary.some((row) => row.gap_id === "GAP-001" && row.gap_status === "AWAITING_RESPONSE"));
assert.ok(model.gap_status_summary.some((row) => row.gap_id === "XR-002" && row.gap_status === "RESOLVED_BY_RESPONSE"));

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lt-responses-"));
try {
  const exports = await writeResponseTrackerExports({
    supplierRequests,
    emailDraftsText,
    session,
    exportDir: tempDir,
    expertReviewModel: {
      open_exception_items: 1,
      total_exception_items: 2,
    },
    missingDocumentationRegister: ["GAP-001"],
  });
  const json = JSON.parse(await readFile(exports.jsonPath, "utf8"));
  const csv = await readFile(exports.csvPath, "utf8");
  const followUps = await readFile(exports.followUpEmailsPath, "utf8");
  const gapSummary = await readFile(exports.gapStatusSummaryPath, "utf8");

  assert.equal(json.metrics.success_criterion_met, true);
  assert.ok(csv.includes("request_id,status,recipient_type"));
  assert.ok(followUps.includes("# Follow-Up Email Drafts"));
  assert.ok(followUps.includes("REQ-001"));
  assert.ok(gapSummary.includes("# Updated Gap Status Summary"));
  assert.ok(gapSummary.includes("RESOLVED_BY_RESPONSE"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
