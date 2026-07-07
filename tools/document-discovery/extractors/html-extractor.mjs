import { decodeHtmlEntities, normalizeWhitespace, stripHtml } from "../normalization/text.mjs";
import { safeUrl, withoutFragment } from "../normalization/urls.mjs";

function makeCandidate({ url, title, discoveryMethod, sourcePage, context = "" }) {
  return {
    url: withoutFragment(url),
    title: normalizeWhitespace(decodeHtmlEntities(title || "")) || null,
    discoveryMethod,
    sourcePage,
    context: normalizeWhitespace(stripHtml(decodeHtmlEntities(context || ""))).slice(0, 500),
  };
}

function isUrlLikeOptionValue(value) {
  const cleaned = String(value || "").trim();
  return (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("/") ||
    cleaned.includes(".pdf") ||
    cleaned.includes(".xml") ||
    cleaned.includes(".txt") ||
    cleaned.includes(".html")
  );
}

export function extractHtmlCandidates(html, sourcePage) {
  const candidates = [];

  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = safeUrl(decodeHtmlEntities(match[1]), sourcePage);
    if (!url) continue;
    candidates.push(makeCandidate({
      url,
      title: match[2],
      discoveryMethod: "HTML_ANCHOR",
      sourcePage,
      context: match[0],
    }));
  }

  for (const match of html.matchAll(/<option\b[^>]*value\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)) {
    if (!isUrlLikeOptionValue(match[1])) continue;
    const url = safeUrl(decodeHtmlEntities(match[1]), sourcePage);
    if (!url) continue;
    candidates.push(makeCandidate({
      url,
      title: match[2],
      discoveryMethod: "HTML_DROPDOWN_OPTION",
      sourcePage,
      context: match[0],
    }));
  }

  const attrPattern = /\b(?:data-[a-z0-9_-]+|src|action)\s*=\s*["']([^"']+\.(?:pdf|html?|xml|txt)(?:\?[^"']*)?)["']/gi;
  for (const match of html.matchAll(attrPattern)) {
    const url = safeUrl(decodeHtmlEntities(match[1]), sourcePage);
    if (!url) continue;
    candidates.push(makeCandidate({
      url,
      title: null,
      discoveryMethod: "HTML_EMBEDDED_ATTRIBUTE",
      sourcePage,
      context: match[0],
    }));
  }

  const rawPathPattern = /(?:https?:\/\/[^\s"'<>]+|\/[A-Za-z0-9_./%()+ -]+?\.(?:pdf|xml|txt|html?))(?:\?[^"'<> ]*)?/gi;
  for (const match of html.matchAll(rawPathPattern)) {
    const url = safeUrl(decodeHtmlEntities(match[0]), sourcePage);
    if (!url) continue;
    candidates.push(makeCandidate({
      url,
      title: null,
      discoveryMethod: "HTML_EMBEDDED_URL",
      sourcePage,
      context: match[0],
    }));
  }

  return dedupeCandidates(candidates);
}

export function extractSitemapUrls(xml, sourcePage) {
  const urls = [];

  for (const block of xml.matchAll(/<url\b[\s\S]*?<\/url>/gi)) {
    const loc = block[0].match(/<loc>\s*([^<]+)\s*<\/loc>/i);
    if (!loc) continue;
    const url = safeUrl(decodeHtmlEntities(loc[1]), sourcePage);
    if (!url) continue;
    urls.push(makeCandidate({
      url,
      title: "Sitemap URL",
      discoveryMethod: "SITEMAP",
      sourcePage,
      context: block[0],
    }));
  }

  if (urls.length > 0) {
    return dedupeCandidates(urls);
  }

  for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
    const url = safeUrl(decodeHtmlEntities(match[1]), sourcePage);
    if (url) {
      urls.push(makeCandidate({
        url,
        title: "Sitemap URL",
        discoveryMethod: "SITEMAP",
        sourcePage,
      }));
    }
  }

  return dedupeCandidates(urls);
}

export function extractRobotsUrls(text, sourcePage) {
  const urls = [];

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(sitemap|allow|disallow)\s*:\s*(.+)$/i);
    if (!match) continue;
    const url = safeUrl(decodeHtmlEntities(match[2]), sourcePage);
    if (!url) continue;
    urls.push(makeCandidate({
      url,
      title: `${match[1]} entry`,
      discoveryMethod: "ROBOTS_TXT",
      sourcePage,
      context: line,
    }));
  }

  return dedupeCandidates(urls);
}

export function dedupeCandidates(candidates) {
  const seen = new Map();
  for (const candidate of candidates) {
    if (!candidate.url) continue;
    const existing = seen.get(candidate.url);
    if (!existing) {
      seen.set(candidate.url, candidate);
      continue;
    }

    if (candidate.discoveryMethod === "HTML_DROPDOWN_OPTION") {
      seen.set(candidate.url, { ...existing, ...candidate, title: candidate.title || existing.title });
    }
  }
  return [...seen.values()];
}
