import { slugify } from "../normalization/text.mjs";
import { safeUrl } from "../normalization/urls.mjs";

const KNOWN_MANUFACTURERS = new Map([
  ["mg chemicals", "https://mgchemicals.com/"],
  ["m.g. chemicals", "https://mgchemicals.com/"],
]);

export function resolveManufacturerBase(manufacturer) {
  const key = String(manufacturer || "").trim().toLowerCase();
  if (KNOWN_MANUFACTURERS.has(key)) {
    return KNOWN_MANUFACTURERS.get(key);
  }

  const slug = slugify(manufacturer).replace(/-/g, "");
  return `https://${slug}.com/`;
}

export function buildInitialTargets({ manufacturer, product, productCode }) {
  const baseUrl = resolveManufacturerBase(manufacturer);
  const queryTerms = [productCode, product].filter(Boolean);
  const query = encodeURIComponent(queryTerms.join(" "));
  const targets = [
    { url: baseUrl, method: "MANUFACTURER_HOME" },
    { url: safeUrl("/product-sitemap.xml", baseUrl), method: "SITEMAP_INDEX" },
    { url: safeUrl("/page-sitemap.xml", baseUrl), method: "SITEMAP_INDEX" },
  ];

  if (query) {
    targets.push({ url: safeUrl(`/?s=${query}`, baseUrl), method: "MANUFACTURER_SEARCH" });
    targets.push({ url: safeUrl(`/search/${query}/`, baseUrl), method: "MANUFACTURER_SEARCH" });
  }

  targets.push(
    { url: safeUrl("/robots.txt", baseUrl), method: "ROBOTS_TXT" },
    { url: safeUrl("/sitemap.xml", baseUrl), method: "SITEMAP_INDEX" },
    { url: safeUrl("/sitemap_index.xml", baseUrl), method: "SITEMAP_INDEX" },
  );

  return { baseUrl, targets: targets.filter((target) => target.url) };
}

export function buildKnownPatternTargets({ baseUrl, productCode }) {
  if (!productCode) return [];

  const rawCode = String(productCode).trim();
  const lower = rawCode.toLowerCase();
  const encodedCode = encodeURIComponent(rawCode).replace(/%20/g, "%20");
  const patterns = [
    `/downloads/compliance/pfas/MG ${rawCode} PFAS Declaration.pdf`,
    `/downloads/compliance/rohs/MG ${rawCode} RoHS Declaration.pdf`,
    `/downloads/compliance/prop65/MG ${rawCode} CalProp Free Declaration.pdf`,
    `/downloads/compliance/prop65/${rawCode} Prop 65 Notice.pdf`,
    `/downloads/compliance/SVHC/MG ${rawCode} reach-letter.pdf`,
    `/downloads/tds/tds-${lower}-l.pdf`,
    `/downloads/tds/tds-${rawCode}-l.pdf`,
    `/downloads/msds/01 English Can-USA SDS/sds-${lower}-l.pdf`,
    `/downloads/msds/01 English Can-USA SDS/sds-${lower}-p.pdf`,
    `/downloads/msds/01 English Can-USA SDS/sds-${lower}-a.pdf`,
  ];

  return patterns
    .map((pattern) => safeUrl(encodeURI(pattern).replace(encodedCode, rawCode), baseUrl) || safeUrl(pattern, baseUrl))
    .filter(Boolean)
    .map((url) => ({ url, method: "PATTERN_PROBE" }));
}
