import path from "node:path";
import { fileURLToPath } from "node:url";
import { FetchCache } from "../cache/cache.mjs";
import { fetchText, probeUrl } from "./fetcher.mjs";
import { extractHtmlCandidates, extractRobotsUrls, extractSitemapUrls, dedupeCandidates } from "../extractors/html-extractor.mjs";
import { classifyDocument, detectRevisionDate } from "../extractors/document-classifier.mjs";
import { createDocumentRecord, DOCUMENT_TYPES, STATUS, CONFIDENCE } from "../models/document-record.mjs";
import { normalizeWhitespace, unique } from "../normalization/text.mjs";
import { isLikelyDocumentUrl, sameHost } from "../normalization/urls.mjs";
import { buildInitialTargets, buildKnownPatternTargets } from "../search/search-planner.mjs";
import { scoreCandidate } from "../scoring/scorer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, "..");

const EXPECTED_TYPES = [
  DOCUMENT_TYPES.PFAS,
  DOCUMENT_TYPES.SDS,
  DOCUMENT_TYPES.TDS,
  DOCUMENT_TYPES.ROHS,
  DOCUMENT_TYPES.REACH,
  DOCUMENT_TYPES.TSCA,
  DOCUMENT_TYPES.PROP65,
  DOCUMENT_TYPES.ENVIRONMENTAL,
];

function containsAnyTerm(candidate, terms) {
  const haystack = normalizeWhitespace(`${candidate.url || ""} ${candidate.title || ""} ${candidate.context || ""}`).toLowerCase();
  return terms.some((term) => term && haystack.includes(String(term).toLowerCase()));
}

function isCrawlablePage(candidate, baseUrl, productTerms) {
  if (!candidate.url || !sameHost(candidate.url, baseUrl)) return false;
  if (candidate.url.toLowerCase().endsWith(".pdf")) return false;
  if (candidate.url.includes("/wp-content/") || candidate.url.includes("/wp-json/")) return false;
  if (candidate.url.includes("/cart") || candidate.url.includes("/checkout")) return false;
  if (candidate.url.includes("/feed/")) return false;

  const text = `${candidate.url} ${candidate.title || ""}`.toLowerCase();
  return (
    containsAnyTerm(candidate, productTerms) ||
    text.includes("sitemap") ||
    (text.includes("/downloads/") && containsAnyTerm(candidate, productTerms))
  );
}

function shouldKeepDocumentCandidate(candidate, productTerms) {
  const docType = candidate.documentType || classifyDocument(candidate);
  if (candidate.discoveryMethod === "HTML_DROPDOWN_OPTION" && isLikelyDocumentUrl(candidate.url)) {
    return candidate.sourcePageRelevant || containsAnyTerm(candidate, productTerms);
  }
  if (containsAnyTerm(candidate, productTerms) && (isLikelyDocumentUrl(candidate.url) || docType === DOCUMENT_TYPES.PRODUCT_PAGE)) return true;
  if (docType === DOCUMENT_TYPES.TSCA || docType === DOCUMENT_TYPES.ENVIRONMENTAL) {
    return (candidate.discoveryMethod === "HTML_DROPDOWN_OPTION" && candidate.sourcePageRelevant) || containsAnyTerm(candidate, productTerms);
  }
  return false;
}

function candidateToRecord(candidate, query) {
  const documentType = candidate.documentType || classifyDocument(candidate);
  const scored = scoreCandidate({ ...candidate, documentType }, query);
  const revisionDate = detectRevisionDate(`${candidate.title || ""} ${candidate.url || ""} ${candidate.context || ""}`);

  return createDocumentRecord({
    title: candidate.title || inferTitle(candidate.url, documentType),
    url: candidate.url,
    documentType,
    manufacturer: query.manufacturer,
    product: query.product,
    productCode: query.productCode,
    revisionDate,
    confidence: scored.confidence,
    confidenceScore: scored.confidenceScore,
    confidenceReason: scored.confidenceReason,
    discoveryMethod: candidate.discoveryMethod,
    status: scored.status,
    sourcePage: candidate.sourcePage,
    matchedTerms: scored.matchedTerms,
    notes: candidate.context ? [candidate.context] : [],
  });
}

function inferTitle(url, documentType) {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const leaf = pathname.split("/").filter(Boolean).at(-1) || documentType;
    return leaf.replace(/[-_]+/g, " ").replace(/\.pdf$/i, "");
  } catch {
    return documentType;
  }
}

function addMissingRecords(records, query, searchNotes) {
  const presentTypes = new Set(
    records
      .filter((record) => record.status !== STATUS.MISSING)
      .map((record) => record.document_type),
  );

  const missing = [];
  for (const type of EXPECTED_TYPES) {
    if (presentTypes.has(type)) continue;
    missing.push(createDocumentRecord({
      title: `Missing ${type}`,
      url: null,
      documentType: type,
      manufacturer: query.manufacturer,
      product: query.product,
      productCode: query.productCode,
      confidence: CONFIDENCE.UNKNOWN,
      confidenceScore: 0,
      confidenceReason: `No ${type} was discovered after v1 public-source search targets completed.`,
      discoveryMethod: "NEGATIVE_DISCOVERY",
      status: STATUS.MISSING,
      notes: searchNotes,
    }));
  }

  return [...records, ...missing];
}

function summarize(records, timings, missedChecks) {
  const byStatus = {};
  const byType = {};
  for (const record of records) {
    byStatus[record.status] = (byStatus[record.status] || 0) + 1;
    byType[record.document_type] = (byType[record.document_type] || 0) + 1;
  }

  return {
    total_documents: records.length,
    by_status: byStatus,
    by_type: byType,
    elapsed_ms: timings.elapsedMs,
    pages_fetched: timings.pagesFetched,
    hidden_dropdown_documents: records.filter((record) => record.discovery_method === "HTML_DROPDOWN_OPTION").length,
    missed_checks: missedChecks,
  };
}

export async function discoverDocuments(input, options = {}) {
  const startedAt = Date.now();
  const query = {
    manufacturer: normalizeWhitespace(input.manufacturer),
    product: normalizeWhitespace(input.product),
    productCode: normalizeWhitespace(input.productCode || input.code || ""),
  };

  const { baseUrl, targets } = buildInitialTargets(query);
  const cache = new FetchCache(options.cacheDir || path.join(TOOL_ROOT, ".runtime-cache"), {
    enabled: options.cache !== false,
  });
  const maxPages = options.maxPages || 35;
  const maxSitemapUrls = options.maxSitemapUrls || 250;
  const terms = unique([
    query.productCode,
    query.product,
    ...query.product.split(/\s+/).filter((term) => term.length >= 3),
  ]);

  const queue = [...targets];
  const visited = new Set();
  const allCandidates = [];
  const searchNotes = [];
  let pagesFetched = 0;

  while (queue.length > 0 && pagesFetched < maxPages) {
    const target = queue.shift();
    if (!target?.url || visited.has(target.url)) continue;
    visited.add(target.url);

    const page = await fetchText(target.url, { cache });
    pagesFetched += 1;

    if (!page.ok) {
      searchNotes.push(`${target.method} failed for ${target.url}: ${page.error || page.status}`);
      continue;
    }

    if (target.method === "ROBOTS_TXT" || page.url.endsWith("/robots.txt")) {
      const robotsCandidates = extractRobotsUrls(page.text, page.url);
      allCandidates.push(...robotsCandidates);
      for (const candidate of robotsCandidates.filter((candidate) => candidate.url.includes("sitemap"))) {
        queue.push({ url: candidate.url, method: "SITEMAP_FROM_ROBOTS" });
      }
      continue;
    }

    if (target.method.includes("SITEMAP") || page.contentType.includes("xml") || page.url.includes("sitemap")) {
      const sitemapCandidates = extractSitemapUrls(page.text, page.url).slice(0, maxSitemapUrls);
      allCandidates.push(...sitemapCandidates);
      for (const candidate of sitemapCandidates) {
        if (candidate.url.includes("sitemap") && !visited.has(candidate.url)) {
          queue.push({ url: candidate.url, method: "SITEMAP_NESTED" });
        } else if (isCrawlablePage(candidate, baseUrl, terms)) {
          const nextTarget = { url: candidate.url, method: "SITEMAP_CANDIDATE" };
          if (containsAnyTerm(candidate, terms)) {
            queue.unshift(nextTarget);
          } else {
            queue.push(nextTarget);
          }
        }
      }
      continue;
    }

    const pageRelevant = containsAnyTerm({
      url: page.url,
      title: target.method,
      context: page.text.slice(0, 25000),
    }, terms);
    const htmlCandidates = extractHtmlCandidates(page.text, page.url).map((candidate) => ({
      ...candidate,
      sourcePageRelevant: pageRelevant,
    }));
    allCandidates.push(...htmlCandidates);

    for (const candidate of htmlCandidates) {
      if (isCrawlablePage(candidate, baseUrl, terms) && !visited.has(candidate.url)) {
        const nextTarget = { url: candidate.url, method: candidate.discoveryMethod };
        if (containsAnyTerm(candidate, terms)) {
          queue.unshift(nextTarget);
        } else {
          queue.push(nextTarget);
        }
      }
    }
  }

  const productPageCandidates = dedupeCandidates(allCandidates)
    .map((candidate) => ({ ...candidate, documentType: classifyDocument(candidate) }))
    .filter((candidate) => (
      candidate.documentType === DOCUMENT_TYPES.PRODUCT_PAGE &&
      sameHost(candidate.url, baseUrl) &&
      containsAnyTerm(candidate, terms)
    ))
    .slice(0, options.maxProductPages || 8);

  for (const candidate of productPageCandidates) {
    const page = await fetchText(candidate.url, { cache, timeoutMs: 30000 });
    pagesFetched += 1;
    visited.add(candidate.url);

    if (!page.ok) {
      searchNotes.push(`PRODUCT_PAGE_CANDIDATE failed for ${candidate.url}: ${page.error || page.status}`);
      continue;
    }

    const pageRelevant = containsAnyTerm({
      url: page.url,
      title: candidate.title,
      context: `${candidate.context || ""} ${page.text.slice(0, 25000)}`,
    }, terms);
    const htmlCandidates = extractHtmlCandidates(page.text, page.url).map((htmlCandidate) => ({
      ...htmlCandidate,
      sourcePageRelevant: pageRelevant,
    }));
    allCandidates.push(...htmlCandidates);
  }

  const patternTargets = buildKnownPatternTargets({ baseUrl, productCode: query.productCode });
  for (const target of patternTargets) {
    if (visited.has(target.url)) continue;
    const probe = await probeUrl(target.url, { cache });
    if (probe.ok) {
      allCandidates.push({
        url: probe.url,
        title: inferTitle(probe.url, DOCUMENT_TYPES.UNKNOWN),
        discoveryMethod: "PATTERN_PROBE",
        sourcePage: baseUrl,
        context: `Known naming pattern responded with status ${probe.status}`,
      });
    }
  }

  const classifiedCandidates = dedupeCandidates(allCandidates)
    .map((candidate) => ({
      ...candidate,
      documentType: classifyDocument(candidate),
    }))
    .filter((candidate) => shouldKeepDocumentCandidate(candidate, terms));

  const records = classifiedCandidates
    .map((candidate) => candidateToRecord(candidate, query))
    .sort((a, b) => b.confidence_score - a.confidence_score || a.document_type.localeCompare(b.document_type));

  const missedChecks = [];
  if (records.filter((record) => record.discovery_method === "HTML_DROPDOWN_OPTION").length === 0) {
    missedChecks.push("No dropdown option documents found. If product pages use dynamic JavaScript, v1 may miss them.");
  }
  if (pagesFetched >= maxPages) {
    missedChecks.push(`Reached max page limit (${maxPages}); some public paths may remain unvisited.`);
  }

  const documents = addMissingRecords(records, query, searchNotes);
  const timings = {
    elapsedMs: Date.now() - startedAt,
    pagesFetched,
  };

  return {
    query: {
      manufacturer: query.manufacturer,
      product: query.product,
      product_code: query.productCode || null,
      base_url: baseUrl,
    },
    generated_at: new Date().toISOString(),
    summary: summarize(documents, timings, missedChecks),
    documents,
  };
}
