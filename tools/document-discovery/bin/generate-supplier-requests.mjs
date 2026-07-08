#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSupplierRequestModel,
  formatSupplierRequestSummary,
  writeSupplierRequestExports,
} from "../supplier-requests/supplier-request-generator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--evidence-index") {
      args.evidenceIndex = next;
      index += 1;
    } else if (arg === "--session" || arg === "--state") {
      args.sessionPath = next;
      index += 1;
    } else if (arg === "--out-dir") {
      args.outDir = next;
      index += 1;
    } else if (arg === "--summary-only" || arg === "--no-write") {
      args.summaryOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  generate-supplier-requests --evidence-index "path/to/evidence-index.json" [--session "path/to/session.json"]

Options:
  --evidence-index  Verified workbench evidence-index JSON
  --session         Optional workbench or expert-review state JSON
  --out-dir         Request export directory, defaults to tools/document-discovery/workbench/exports
  --summary-only    Print timing and request summary without writing files
`);
}

function normalizeQuery(payload) {
  return {
    manufacturer: payload.query?.manufacturer,
    product: payload.query?.product,
    productCode: payload.query?.productCode || payload.query?.product_code || "",
  };
}

async function loadSession(sessionPath) {
  if (!sessionPath) return {};
  return JSON.parse(await readFile(path.resolve(sessionPath), "utf8"));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.evidenceIndex) {
    printHelp();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const evidenceIndexPath = path.resolve(args.evidenceIndex);
  const payload = JSON.parse(await readFile(evidenceIndexPath, "utf8"));
  const session = await loadSession(args.sessionPath);
  const exportDir = path.resolve(args.outDir || path.join(TOOL_ROOT, "workbench", "exports"));
  const input = {
    documents: payload.documents || [],
    summary: payload.summary,
    query: normalizeQuery(payload),
    session,
    generatedAt: payload.generated_at,
  };

  if (args.summaryOnly) {
    console.log(formatSupplierRequestSummary(buildSupplierRequestModel(input)));
    return;
  }

  const exports = await writeSupplierRequestExports({ ...input, exportDir });
  console.log(formatSupplierRequestSummary(exports));
  console.log(`CSV:          ${exports.csvPath}`);
  console.log(`JSON:         ${exports.jsonPath}`);
  console.log(`Email drafts: ${exports.emailDraftsPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
