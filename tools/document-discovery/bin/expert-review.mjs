#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildExpertReviewModel,
  formatExpertReviewSummary,
  runExpertReviewConsole,
} from "../expert-review/expert-review-console.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    interactive: process.stdin.isTTY,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--evidence-index") {
      args.evidenceIndex = next;
      index += 1;
    } else if (arg === "--state") {
      args.statePath = next;
      index += 1;
    } else if (arg === "--out-dir") {
      args.outDir = next;
      index += 1;
    } else if (arg === "--confidence-threshold") {
      args.confidenceThreshold = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--no-interactive" || arg === "--summary-only") {
      args.interactive = false;
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
  expert-review --evidence-index "path/to/evidence-index.json" [--state "path/to/review-state.json"]

Options:
  --evidence-index        Verified workbench evidence-index JSON
  --state                 Expert review decision state file
  --out-dir               State directory when --state is omitted
  --confidence-threshold  Review threshold, default 80
  --summary-only          Print exception summary and exit
  --no-interactive        Same as --summary-only
`);
}

function normalizeQuery(payload) {
  return {
    manufacturer: payload.query?.manufacturer,
    product: payload.query?.product,
    productCode: payload.query?.productCode || payload.query?.product_code || "",
  };
}

function defaultStatePath({ evidenceIndexPath, outDir }) {
  const baseName = path.basename(evidenceIndexPath, path.extname(evidenceIndexPath));
  return path.join(outDir, `${baseName}-expert-review-state.json`);
}

async function loadState(statePath) {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return {
      created_at: new Date().toISOString(),
      expert_reviews: {},
    };
  }
}

async function saveState(statePath, session) {
  session.updated_at = new Date().toISOString();
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(session, null, 2));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.evidenceIndex) {
    printHelp();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const evidenceIndexPath = path.resolve(args.evidenceIndex);
  const outDir = path.resolve(args.outDir || path.join(TOOL_ROOT, "workbench", "exports"));
  const statePath = path.resolve(args.statePath || defaultStatePath({ evidenceIndexPath, outDir }));
  const payload = JSON.parse(await readFile(evidenceIndexPath, "utf8"));
  const session = await loadState(statePath);
  const query = normalizeQuery(payload);
  const model = buildExpertReviewModel({
    documents: payload.documents || [],
    summary: payload.summary,
    query,
    session,
    confidenceThreshold: args.confidenceThreshold,
    generatedAt: payload.generated_at,
  });

  console.log(formatExpertReviewSummary(model));
  console.log(`State file:              ${statePath}`);

  if (args.interactive) {
    await runExpertReviewConsole({
      documents: payload.documents || [],
      summary: payload.summary,
      query,
      session,
      confidenceThreshold: args.confidenceThreshold,
      generatedAt: payload.generated_at,
      save: () => saveState(statePath, session),
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
