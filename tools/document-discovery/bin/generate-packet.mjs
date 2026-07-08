#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writePacketExports } from "../packet/packet-assembler.mjs";

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
  generate-packet --evidence-index "path/to/evidence-index.json" [--out-dir "path/to/output"]

Options:
  --evidence-index  Verified workbench evidence-index JSON
  --out-dir         Packet export directory, defaults to tools/document-discovery/workbench/exports
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
  const exportDir = path.resolve(args.outDir || path.join(TOOL_ROOT, "workbench", "exports"));
  const exports = await writePacketExports({
    documents: payload.documents || [],
    summary: payload.summary,
    query: normalizeQuery(payload),
    exportDir,
    generatedAt: payload.generated_at,
  });

  console.log("Generated PFAS Evidence Packet draft");
  console.log("------------------------------------");
  console.log(`Markdown:       ${exports.markdownPath}`);
  console.log(`HTML:           ${exports.htmlPath}`);
  console.log(`PDF-ready HTML: ${exports.printHtmlPath}`);
  console.log(`Assembly time:  ${(exports.metrics.previous_analyst_assembly_minutes / 60).toFixed(1)}h -> ${(exports.metrics.new_analyst_assembly_minutes / 60).toFixed(1)}h (${exports.metrics.assembly_reduction_percent.toFixed(1)}% reduction)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
