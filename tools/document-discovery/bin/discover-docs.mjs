#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocuments } from "../crawler/discovery-engine.mjs";
import { writeExports } from "../exporters/exporters.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    cache: true,
    maxPages: 35,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--manufacturer") {
      args.manufacturer = next;
      index += 1;
    } else if (arg === "--product") {
      args.product = next;
      index += 1;
    } else if (arg === "--code" || arg === "--product-code") {
      args.productCode = next;
      index += 1;
    } else if (arg === "--out-dir") {
      args.outDir = next;
      index += 1;
    } else if (arg === "--max-pages") {
      args.maxPages = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--no-cache") {
      args.cache = false;
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
  discover-docs --manufacturer "MG Chemicals" --product "422B" [--code "422B"]

Options:
  --manufacturer  Manufacturer name
  --product       Product name or product code
  --code          Optional product code
  --product-code  Optional product code alias
  --out-dir       Export directory, defaults to tools/document-discovery/output
  --max-pages     Crawl page limit, defaults to 35
  --no-cache      Disable local fetch cache
`);
}

function printSummary(result, exports) {
  const found = result.documents.filter((doc) => doc.status === "FOUND");
  const possible = result.documents.filter((doc) => doc.status === "POSSIBLE");
  const missing = result.documents.filter((doc) => doc.status === "MISSING");
  const hidden = result.documents.filter((doc) => doc.discovery_method === "HTML_DROPDOWN_OPTION");

  console.log("");
  console.log("Liberty Tree Document Discovery v1");
  console.log("----------------------------------");
  console.log(`Manufacturer: ${result.query.manufacturer}`);
  console.log(`Product:      ${result.query.product}`);
  console.log(`Product code: ${result.query.product_code || "(none)"}`);
  console.log(`Base URL:     ${result.query.base_url}`);
  console.log("");
  console.log(`Found:        ${found.length}`);
  console.log(`Possible:     ${possible.length}`);
  console.log(`Missing:      ${missing.length}`);
  console.log(`Hidden docs:  ${hidden.length}`);
  console.log(`Pages fetched:${result.summary.pages_fetched}`);
  console.log(`Elapsed:      ${(result.summary.elapsed_ms / 1000).toFixed(1)}s`);

  if (hidden.length > 0) {
    console.log("");
    console.log("Hidden dropdown documents:");
    for (const doc of hidden.slice(0, 12)) {
      console.log(`  - [${doc.confidence}] ${doc.document_type}: ${doc.title}`);
      console.log(`    ${doc.url}`);
    }
  }

  console.log("");
  console.log("Top evidence:");
  for (const doc of found.slice(0, 12)) {
    console.log(`  - [${doc.confidence} ${doc.confidence_score}] ${doc.document_type}: ${doc.title}`);
    console.log(`    ${doc.url}`);
    console.log(`    why: ${doc.confidence_reason}`);
  }

  if (possible.length > 0) {
    console.log("");
    console.log("Possible evidence requiring analyst review:");
    for (const doc of possible.slice(0, 8)) {
      console.log(`  - [${doc.confidence} ${doc.confidence_score}] ${doc.document_type}: ${doc.title}`);
      console.log(`    ${doc.url}`);
    }
  }

  if (missing.length > 0) {
    console.log("");
    console.log("Missing evidence classes:");
    for (const doc of missing) {
      console.log(`  - ${doc.document_type}: ${doc.confidence_reason}`);
    }
  }

  if (result.summary.missed_checks.length > 0) {
    console.log("");
    console.log("V1 limitations:");
    for (const note of result.summary.missed_checks) {
      console.log(`  - ${note}`);
    }
  }

  console.log("");
  console.log(`JSON export: ${exports.jsonPath}`);
  console.log(`CSV export:  ${exports.csvPath}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.manufacturer || !args.product) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const outDir = args.outDir ? path.resolve(args.outDir) : path.join(TOOL_ROOT, "output");
  const result = await discoverDocuments(args, {
    cache: args.cache,
    maxPages: args.maxPages,
    cacheDir: path.join(TOOL_ROOT, ".runtime-cache"),
  });
  const exports = await writeExports(result, outDir);
  printSummary(result, exports);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
