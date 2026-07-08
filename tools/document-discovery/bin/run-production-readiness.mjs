#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildProductionReadinessReport,
  formatProductionReadinessSummary,
  writeProductionReadinessExports,
} from "../validation-harness/production-readiness-harness.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--out-dir") {
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
  run-production-readiness [--out-dir "path/to/output"]

Options:
  --out-dir       Validation export directory, defaults to tools/document-discovery/workbench/exports/production-readiness-validation
  --summary-only  Run scenarios and print summary without writing files
`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  if (args.summaryOnly) {
    const report = buildProductionReadinessReport();
    console.log(formatProductionReadinessSummary(report));
    return;
  }

  const exportDir = path.resolve(args.outDir || path.join(TOOL_ROOT, "workbench", "exports", "production-readiness-validation"));
  const exports = await writeProductionReadinessExports({ exportDir });
  console.log(formatProductionReadinessSummary(exports));
  console.log(`JSON report:   ${exports.reportJsonPath}`);
  console.log(`Markdown:      ${exports.reportMarkdownPath}`);
  console.log(`Findings CSV:  ${exports.failuresCsvPath}`);
  console.log(`Sample data:   ${exports.samplesJsonPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
