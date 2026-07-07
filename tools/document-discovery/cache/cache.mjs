import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24;

function keyFor(url) {
  return createHash("sha256").update(url).digest("hex");
}

export class FetchCache {
  constructor(cacheDir, { ttlMs = DEFAULT_TTL_MS, enabled = true } = {}) {
    this.cacheDir = cacheDir;
    this.ttlMs = ttlMs;
    this.enabled = enabled;
  }

  async get(url) {
    if (!this.enabled) return null;

    try {
      const file = path.join(this.cacheDir, `${keyFor(url)}.json`);
      const raw = await readFile(file, "utf8");
      const cached = JSON.parse(raw);
      if (Date.now() - cached.fetchedAt > this.ttlMs) return null;
      return cached;
    } catch {
      return null;
    }
  }

  async set(url, payload) {
    if (!this.enabled) return;

    await mkdir(this.cacheDir, { recursive: true });
    const file = path.join(this.cacheDir, `${keyFor(url)}.json`);
    await writeFile(file, JSON.stringify({ ...payload, fetchedAt: Date.now() }, null, 2));
  }
}
