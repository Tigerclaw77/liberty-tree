import { getCategory } from "./categories.mjs";

function parseDate(value) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeTimelineTitle(document) {
  let urlLeaf = "";
  try {
    urlLeaf = document.url ? decodeURIComponent(new URL(document.url).pathname.split("/").filter(Boolean).at(-1) || "") : "";
  } catch {
    urlLeaf = "";
  }

  const title = urlLeaf || document.title || document.document_type || "document";
  return title
    .toLowerCase()
    .replace(/\.(pdf|html?|xml|txt)$/g, "")
    .replace(/\b(19|20)\d{2}[-_/ ]?\d{0,2}[-_/ ]?\d{0,2}\b/g, "")
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},\s+\d{4}\b/g, "")
    .replace(/\b(v|rev|revision)[-_ ]?[a-z0-9.]+\b/g, "")
    .replace(/[-_\s]+/g, " ")
    .trim();
}

export function assignTimeline(documents) {
  const buckets = new Map();

  for (const document of documents) {
    let urlHost = "missing";
    try {
      urlHost = document.url ? new URL(document.url).hostname : "missing";
    } catch {
      urlHost = "unknown";
    }

    const key = `${getCategory(document)}|${urlHost}|${normalizeTimelineTitle(document)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(document);
  }

  const latestByKey = new Map();
  const countByKey = new Map();

  for (const [key, items] of buckets.entries()) {
    const sorted = [...items].sort((a, b) => {
      const dateDiff = (parseDate(b.revision_date) || 0) - (parseDate(a.revision_date) || 0);
      if (dateDiff !== 0) return dateDiff;
      return (b.confidence_score || 0) - (a.confidence_score || 0);
    });
    latestByKey.set(key, sorted[0]?.document_key || sorted[0]?.url || sorted[0]?.title);
    countByKey.set(key, sorted.length);
  }

  return documents.map((document) => {
    let urlHost = "missing";
    try {
      urlHost = document.url ? new URL(document.url).hostname : "missing";
    } catch {
      urlHost = "unknown";
    }

    const key = `${getCategory(document)}|${urlHost}|${normalizeTimelineTitle(document)}`;
    const documentId = document.document_key || document.url || document.title;
    const groupCount = countByKey.get(key) || 1;
    return {
      ...document,
      timeline_group: key,
      is_latest_revision: latestByKey.get(key) === documentId,
      older_revision_count: Math.max(0, groupCount - 1),
    };
  });
}
