export async function fetchText(url, { timeoutMs = 25000, cache = null } = {}) {
  const cached = await cache?.get(url);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "LibertyTreeDocumentDiscovery/1.0 (+internal evidence discovery)",
        accept: "text/html,application/xhtml+xml,application/xml,text/plain,application/pdf,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    const payload = {
      url: response.url || url,
      requestedUrl: url,
      ok: response.ok,
      status: response.status,
      contentType,
      text,
    };

    if (response.ok) {
      await cache?.set(url, payload);
    }

    return { ...payload, fromCache: false };
  } catch (error) {
    return {
      url,
      requestedUrl: url,
      ok: false,
      status: 0,
      contentType: "",
      text: "",
      error: error instanceof Error ? error.message : String(error),
      fromCache: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeUrl(url, options = {}) {
  const result = await fetchText(url, options);
  return {
    url: result.url || url,
    requestedUrl: url,
    ok: result.ok,
    status: result.status,
    contentType: result.contentType,
  };
}
