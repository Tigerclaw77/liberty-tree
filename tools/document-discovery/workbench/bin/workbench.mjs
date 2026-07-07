#!/usr/bin/env node
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { discoverDocuments } from "../../crawler/discovery-engine.mjs";
import { groupByCategory, categoryOrder, getCategory } from "../core/categories.mjs";
import {
  ANALYST_ACTIONS,
  addManualMissingDocument,
  applyDecisions,
  clearDecision,
  getManualMissingDocuments,
  loadSession,
  saveSession,
  setDecision,
} from "../core/session-store.mjs";
import { assignTimeline } from "../core/timeline.mjs";
import { buildSummary } from "../core/summary.mjs";
import { exportEvidenceIndex } from "../core/workbench-export.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKBENCH_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    maxPages: 25,
    interactive: process.stdin.isTTY,
    cache: true,
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
    } else if (arg === "--max-pages") {
      args.maxPages = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--session-dir") {
      args.sessionDir = next;
      index += 1;
    } else if (arg === "--export-dir") {
      args.exportDir = next;
      index += 1;
    } else if (arg === "--no-interactive" || arg === "--export-only") {
      args.interactive = false;
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
  workbench --manufacturer "MG Chemicals" --product "842WBU" --code "842WBU"

Options:
  --manufacturer    Manufacturer name
  --product         Product name
  --code            Optional product code
  --max-pages       Discovery crawl limit, default 25
  --session-dir     Local session decision directory
  --export-dir      Evidence index export directory
  --export-only     Run, summarize, export, and exit
  --no-interactive  Same as --export-only
  --no-cache        Disable fetch cache

Interactive commands:
  v <id> [note]      Mark Verified
  d <id> [note]      Mark Duplicate
  i <id> [note]      Ignore
  e <id> [note]      Needs Expert Review
  m <id> [note]      Missing Document
  missing <type> [note]
                    Add a missing-document gap
  c <id>             Clear analyst action
  s                  Show summary
  g                  Show grouped results
  x                  Export evidence-index files
  q                  Save and quit
`);
}

function assignDisplayIds(documents) {
  return documents.map((document, index) => ({
    ...document,
    display_id: index + 1,
  }));
}

function prepareDocuments(sourceDocuments, session) {
  const withDecisions = applyDecisions([...sourceDocuments, ...getManualMissingDocuments(session)], session)
    .map((document) => ({
      ...document,
      category: getCategory(document),
    }))
    .sort((a, b) => {
      const categoryDiff = categoryOrder(a.category) - categoryOrder(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      if (a.status !== b.status) return a.status === "FOUND" ? -1 : 1;
      return (b.confidence_score || 0) - (a.confidence_score || 0);
    });

  return assignDisplayIds(assignTimeline(withDecisions));
}

function printDocumentLine(document) {
  const action = document.analyst_action ? ` action=${document.analyst_action}` : "";
  const date = document.revision_date || "date:unknown";
  console.log(
    `${String(document.display_id).padStart(3, " ")}. ${document.status.padEnd(8)} ${document.confidence.padEnd(7)} ${date.padEnd(14)} ${document.discovery_method}${action}`,
  );
  console.log(`     ${document.title}`);
  console.log(`     ${document.url || "(no URL)"}`);
  if (document.older_revision_count > 0 && document.is_latest_revision) {
    console.log(`     timeline: latest shown, ${document.older_revision_count} older related item(s) collapsed`);
  }
}

function printGroupedResults(documents) {
  console.log("");
  console.log("Discovery Results");
  console.log("-----------------");
  for (const group of groupByCategory(documents)) {
    console.log("");
    console.log(`[${group.category}]`);
    const latest = group.documents.filter((document) => document.is_latest_revision || document.older_revision_count === 0);
    for (const document of latest) {
      printDocumentLine(document);
    }
  }
}

function printSummary(summary) {
  console.log("");
  console.log("Session Summary");
  console.log("---------------");
  console.log(`Documents found:        ${summary.documents_found}`);
  console.log(`Documents verified:     ${summary.documents_verified}`);
  console.log(`Possible documents:     ${summary.possible_documents}`);
  console.log(`Missing documents:      ${summary.missing_documents}`);
  console.log(`Needs expert review:    ${summary.needs_expert_review}`);
  console.log(`Remaining gaps:         ${summary.remaining_gaps}`);
  console.log(`Packet readiness:       ${summary.estimated_packet_readiness}`);
  console.log(`Confidence distribution:${JSON.stringify(summary.confidence_distribution)}`);
}

function findDocument(documents, id) {
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed)) return null;
  return documents.find((document) => document.display_id === parsed) || null;
}

async function promptForMissingArgs(args) {
  if (args.manufacturer && args.product) return args;

  const rl = readline.createInterface({ input, output });
  try {
    if (!args.manufacturer) {
      args.manufacturer = await rl.question("Manufacturer: ");
    }
    if (!args.product) {
      args.product = await rl.question("Product: ");
    }
    if (!args.productCode) {
      args.productCode = await rl.question("Product code (optional): ");
    }
  } finally {
    rl.close();
  }

  return args;
}

async function handleInteractive({ sourceDocuments, documents, session, sessionPath, exportDir, query }) {
  const rl = readline.createInterface({ input, output });

  try {
    printGroupedResults(documents);
    printSummary(buildSummary(documents));

    while (true) {
      const line = (await rl.question("\nworkbench> ")).trim();
      if (!line) continue;

      const [command, id, ...noteParts] = line.split(" ");
      const note = noteParts.join(" ").trim();

      if (command === "q") {
        await saveSession(sessionPath, session);
        break;
      }

      if (command === "s") {
        documents = prepareDocuments(sourceDocuments, session);
        printSummary(buildSummary(documents));
        continue;
      }

      if (command === "g") {
        documents = prepareDocuments(sourceDocuments, session);
        printGroupedResults(documents);
        continue;
      }

      if (command === "x") {
        documents = prepareDocuments(sourceDocuments, session);
        const summary = buildSummary(documents);
        const exports = await exportEvidenceIndex({ documents, summary, query, exportDir });
        console.log(`Exported JSON: ${exports.jsonPath}`);
        console.log(`Exported CSV:  ${exports.csvPath}`);
        continue;
      }

      if (command === "missing") {
        const category = id || "Other";
        addManualMissingDocument(session, { category, note });
        await saveSession(sessionPath, session);
        documents = prepareDocuments(sourceDocuments, session);
        console.log(`Added missing-document gap for ${category}.`);
        continue;
      }

      const document = findDocument(documents, id);
      if (!document) {
        console.log("Unknown document id.");
        continue;
      }

      const actionByCommand = {
        v: ANALYST_ACTIONS.VERIFIED,
        d: ANALYST_ACTIONS.DUPLICATE,
        i: ANALYST_ACTIONS.IGNORED,
        e: ANALYST_ACTIONS.NEEDS_EXPERT_REVIEW,
        m: ANALYST_ACTIONS.MISSING_DOCUMENT,
      };

      if (command === "c") {
        clearDecision(session, document);
        await saveSession(sessionPath, session);
        console.log(`Cleared action for ${id}.`);
      } else if (actionByCommand[command]) {
        setDecision(session, document, actionByCommand[command], note);
        await saveSession(sessionPath, session);
        console.log(`Marked ${id} as ${actionByCommand[command]}.`);
      } else {
        console.log("Unknown command. Use v/d/i/e/m/c/s/g/x/q.");
      }

      documents = prepareDocuments(sourceDocuments, session);
    }
  } finally {
    rl.close();
  }
}

async function main() {
  let args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  args = await promptForMissingArgs(args);
  if (!args.manufacturer || !args.product) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const query = {
    manufacturer: args.manufacturer,
    product: args.product,
    productCode: args.productCode || "",
  };
  const sessionDir = path.resolve(args.sessionDir || path.join(WORKBENCH_ROOT, "sessions"));
  const exportDir = path.resolve(args.exportDir || path.join(WORKBENCH_ROOT, "exports"));

  console.log("Running document discovery...");
  const result = await discoverDocuments({
    manufacturer: query.manufacturer,
    product: query.product,
    productCode: query.productCode,
  }, {
    cache: args.cache,
    maxPages: args.maxPages,
  });

  const { session, sessionPath } = await loadSession(sessionDir, query);
  let documents = prepareDocuments(result.documents, session);
  const summary = buildSummary(documents);
  const exports = await exportEvidenceIndex({ documents, summary, query, exportDir });

  printGroupedResults(documents);
  printSummary(summary);
  console.log("");
  console.log(`Session:     ${sessionPath}`);
  console.log(`JSON export: ${exports.jsonPath}`);
  console.log(`CSV export:  ${exports.csvPath}`);

  if (args.interactive) {
    await handleInteractive({ sourceDocuments: result.documents, documents, session, sessionPath, exportDir, query });
  } else {
    await saveSession(sessionPath, session);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
