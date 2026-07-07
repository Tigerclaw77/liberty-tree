export function safeUrl(value, baseUrl = null) {
  if (!value) return null;

  const cleaned = String(value)
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\\//g, "/");

  if (!cleaned || cleaned.startsWith("#") || cleaned.startsWith("mailto:") || cleaned.startsWith("tel:")) {
    return null;
  }

  try {
    if (baseUrl) {
      return new URL(cleaned, baseUrl).toString();
    }
    return new URL(cleaned).toString();
  } catch {
    try {
      return new URL(encodeURI(cleaned), baseUrl || undefined).toString();
    } catch {
      return null;
    }
  }
}

export function sameHost(urlA, urlB) {
  try {
    return new URL(urlA).hostname.replace(/^www\./, "") === new URL(urlB).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

export function isPdfUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

export function isLikelyDocumentUrl(url) {
  const text = String(url || "").toLowerCase();
  return (
    isPdfUrl(url) ||
    text.includes("/downloads/") ||
    text.includes("/compliance/") ||
    text.includes("/msds/") ||
    text.includes("/sds/") ||
    text.includes("/tds/") ||
    text.includes("declaration") ||
    text.includes("reach") ||
    text.includes("svhc") ||
    text.includes("rohs") ||
    text.includes("pfas") ||
    text.includes("prop65") ||
    text.includes("prop-65")
  );
}

export function withoutFragment(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}
