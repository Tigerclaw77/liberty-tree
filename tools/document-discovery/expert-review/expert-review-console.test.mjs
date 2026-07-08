import assert from "node:assert/strict";
import {
  EXPERT_REVIEW_ACTIONS,
  buildExpertReviewModel,
  setExpertReviewDecision,
} from "./expert-review-console.mjs";

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
    revision_date: "2025-01-15",
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
    title: "MG 422B SDS",
    url: "https://example.test/sds-422b.pdf",
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
    analyst_action: "NEEDS_EXPERT_REVIEW",
    analyst_note: "Confirm SDS/product-form relationship.",
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
  possible_documents: 1,
  missing_documents: 1,
  documents_verified: 0,
  needs_expert_review: 1,
  remaining_gaps: 2,
  estimated_packet_readiness: "CONDITIONAL",
};

const session = {};
const model = buildExpertReviewModel({ documents, summary, query, session, generatedAt: "2026-07-08T12:00:00.000Z" });

assert.ok(model.open_exception_items > 0);
assert.ok(model.metrics.expert_review_reduction_percent >= 40);
assert.ok(model.metrics.success_criterion_met);
assert.ok(model.items.some((item) => item.issue_type === "MISSING_PFAS_DECLARATION"));
assert.ok(model.items.some((item) => item.issue_type === "CONFIDENCE_BELOW_THRESHOLD"));
assert.ok(model.items.some((item) => item.issue_type === "ANALYST_REQUESTED_EXPERT_REVIEW"));
assert.ok(model.items.some((item) => item.issue_type === "EVIDENCE_RELIABILITY_EXCEPTION"));
assert.ok(model.reliability.exception_count > 0);
assert.ok(model.reliability.false_positive_reduction_percent >= 0);

const firstOpenItem = model.openItems[0];
setExpertReviewDecision(session, firstOpenItem, EXPERT_REVIEW_ACTIONS.APPROVED, "Reviewed source exception.");

const updatedModel = buildExpertReviewModel({ documents, summary, query, session, generatedAt: "2026-07-08T12:00:00.000Z" });
const decidedItem = updatedModel.items.find((item) => item.key === firstOpenItem.key);

assert.equal(decidedItem.status, EXPERT_REVIEW_ACTIONS.APPROVED);
assert.equal(decidedItem.requires_expert_attention, false);
assert.equal(updatedModel.open_exception_items, model.open_exception_items - 1);
