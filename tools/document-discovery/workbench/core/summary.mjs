import { ANALYST_ACTIONS } from "./session-store.mjs";

export function buildSummary(documents) {
  const found = documents.filter((document) => document.status === "FOUND").length;
  const possible = documents.filter((document) => document.status === "POSSIBLE").length;
  const missing = documents.filter((document) => document.status === "MISSING").length;
  const verified = documents.filter((document) => document.analyst_action === ANALYST_ACTIONS.VERIFIED).length;
  const needsExpert = documents.filter((document) => document.analyst_action === ANALYST_ACTIONS.NEEDS_EXPERT_REVIEW).length;
  const ignored = documents.filter((document) => document.analyst_action === ANALYST_ACTIONS.IGNORED).length;
  const duplicate = documents.filter((document) => document.analyst_action === ANALYST_ACTIONS.DUPLICATE).length;
  const markedMissing = documents.filter((document) => document.analyst_action === ANALYST_ACTIONS.MISSING_DOCUMENT).length;

  const confidenceDistribution = {};
  for (const document of documents) {
    confidenceDistribution[document.confidence] = (confidenceDistribution[document.confidence] || 0) + 1;
  }

  const actionableDocuments = documents.filter((document) => document.status !== "MISSING" && document.analyst_action !== ANALYST_ACTIONS.IGNORED);
  const verifiedRatio = actionableDocuments.length === 0 ? 0 : verified / actionableDocuments.length;
  const remainingGaps = missing + markedMissing + needsExpert;

  let packetReadiness = "NOT_READY";
  if (remainingGaps === 0 && verifiedRatio >= 0.6 && found > 0) {
    packetReadiness = "READY";
  } else if (found > 0 && remainingGaps <= 3) {
    packetReadiness = "CONDITIONAL";
  }

  return {
    documents_found: found,
    possible_documents: possible,
    missing_documents: missing,
    documents_verified: verified,
    documents_ignored: ignored,
    documents_duplicate: duplicate,
    needs_expert_review: needsExpert,
    analyst_marked_missing: markedMissing,
    confidence_distribution: confidenceDistribution,
    remaining_gaps: remainingGaps,
    estimated_packet_readiness: packetReadiness,
  };
}
