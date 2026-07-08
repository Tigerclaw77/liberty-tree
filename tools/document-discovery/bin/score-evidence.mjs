#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEvidenceReliabilityModel,
  formatEvidenceReliabilitySummary,
  writeEvidenceReliabilityExports,
} from "../evidence-reliability/evidence-reliability-engine.mjs";

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
  score-evidence --evidence-index "path/to/evidence-index.json"

Options:
  --evidence-index  Verified workbench evidence-index JSON
  --out-dir         Reliability export directory, defaults to tools/document-discovery/workbench/exports
  --summary-only    Print score summary without writing files
`);
}

function normalizeQuery(payload) {
  return {
    manufacturer: payload.query?.manufacturer,
    product: payload.query?.product,
    productCode: payload.query?.productCode || payload.query?.product_code || "",
  };
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
  const input = {
    documents: payload.documents || [],
    query: normalizeQuery(payload),
    generatedAt: payload.generated_at,
  };

  if (args.summaryOnly) {
    console.log(formatEvidenceReliabilitySummary(buildEvidenceReliabilityModel(input)));
    return;
  }

  const exportDir = path.resolve(args.outDir || path.join(TOOL_ROOT, "workbench", "exports"));
  const exports = await writeEvidenceReliabilityExports({ ...input, exportDir });
  console.log(formatEvidenceReliabilitySummary(exports));
  console.log(`JSON:       ${exports.jsonPath}`);
  console.log(`CSV:        ${exports.csvPath}`);
  console.log(`Exceptions: ${exports.exceptionsPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
