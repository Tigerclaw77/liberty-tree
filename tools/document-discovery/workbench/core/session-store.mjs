import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../../normalization/text.mjs";

export const ANALYST_ACTIONS = Object.freeze({
  VERIFIED: "VERIFIED",
  DUPLICATE: "DUPLICATE",
  IGNORED: "IGNORED",
  NEEDS_EXPERT_REVIEW: "NEEDS_EXPERT_REVIEW",
  MISSING_DOCUMENT: "MISSING_DOCUMENT",
});

export function makeSessionId({ manufacturer, product, productCode }) {
  return slugify(`${manufacturer}-${product}-${productCode || "no-code"}`);
}

export async function loadSession(sessionDir, query) {
  await mkdir(sessionDir, { recursive: true });
  const sessionId = makeSessionId(query);
  const sessionPath = path.join(sessionDir, `${sessionId}.json`);

  try {
    const raw = await readFile(sessionPath, "utf8");
    return {
      sessionPath,
      session: JSON.parse(raw),
    };
  } catch {
    return {
      sessionPath,
      session: {
        session_id: sessionId,
        query,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        decisions: {},
        manual_missing_documents: [],
      },
    };
  }
}

export async function saveSession(sessionPath, session) {
  session.updated_at = new Date().toISOString();
  await writeFile(sessionPath, JSON.stringify(session, null, 2));
}

export function documentKey(document) {
  return document.key || document.url || `${document.document_type}:${document.title}`;
}

export function applyDecisions(documents, session) {
  return documents.map((document) => {
    const key = documentKey(document);
    const decision = session.decisions[key] || null;
    return {
      ...document,
      document_key: key,
      analyst_action: decision?.action || null,
      analyst_note: decision?.note || null,
      analyst_updated_at: decision?.updated_at || null,
    };
  });
}

export function setDecision(session, document, action, note = "") {
  session.decisions[documentKey(document)] = {
    action,
    note,
    updated_at: new Date().toISOString(),
  };
}

export function clearDecision(session, document) {
  delete session.decisions[documentKey(document)];
}

export function addManualMissingDocument(session, { category, note = "" }) {
  if (!Array.isArray(session.manual_missing_documents)) {
    session.manual_missing_documents = [];
  }

  const title = note || `${category} documentation not located`;
  const entry = {
    key: `manual-missing:${Date.now()}:${slugify(`${category}-${title}`)}`,
    title,
    url: null,
    document_type: category,
    manufacturer: session.query.manufacturer,
    product: session.query.product,
    product_code: session.query.productCode || null,
    revision_date: null,
    confidence: "Unknown",
    confidence_score: 0,
    confidence_reason: "Analyst marked this documentation gap during workbench review.",
    discovery_method: "ANALYST_MARKED_MISSING",
    status: "MISSING",
    source_page: null,
    matched_terms: [],
    notes: note ? [note] : [],
  };

  session.manual_missing_documents.push(entry);
  return entry;
}

export function getManualMissingDocuments(session) {
  return Array.isArray(session.manual_missing_documents) ? session.manual_missing_documents : [];
}
