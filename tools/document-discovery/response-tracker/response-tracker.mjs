import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as defaultInput, stdout as defaultOutput } from "node:process";
import { slugify } from "../normalization/text.mjs";

const UNKNOWN = "Unknown";

export const RESPONSE_STATUSES = Object.freeze({
  NOT_SENT: "NOT_SENT",
  SENT: "SENT",
  RESPONDED: "RESPONDED",
  USABLE: "USABLE",
  UNUSABLE: "UNUSABLE",
  NEEDS_FOLLOW_UP: "NEEDS_FOLLOW_UP",
  CLOSED_NO_RESPONSE: "CLOSED_NO_RESPONSE",
});

const TRACKING_BASELINE = Object.freeze({
  currentAnalystEngagementMinutes: 246,
  currentExpertReviewMinutes: 78,
  previousTrackingMinutes: 60,
  newTrackingMinutes: 24,
});

const FOLLOW_UP_STATUSES = new Set([
  RESPONSE_STATUSES.SENT,
  RESPONSE_STATUSES.RESPONDED,
  RESPONSE_STATUSES.UNUSABLE,
  RESPONSE_STATUSES.NEEDS_FOLLOW_UP,
]);

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function normalizeQuery(query = {}) {
  return {
    manufacturer: query.manufacturer || UNKNOWN,
    product: query.product || UNKNOWN,
    productCode: query.productCode || query.product_code || "",
  };
}

function productSku(query) {
  return `${query.product || UNKNOWN}${query.productCode ? ` (${query.productCode})` : ""}`;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function boolValue(value) {
  if (typeof value === "boolean") return value;
  const text = lower(value);
  if (["yes", "y", "true", "1"].includes(text)) return true;
  if (["no", "n", "false", "0"].includes(text)) return false;
  return null;
}

function ensureResponseStore(session) {
  if (!session.response_tracker || typeof session.response_tracker !== "object") {
    session.response_tracker = {};
  }
  return session.response_tracker;
}

function defaultResponseRecord() {
  return {
    status: RESPONSE_STATUSES.NOT_SENT,
    received_date: "",
    source_contact: "",
    attachment_document_title: "",
    resolves_gap: null,
    remaining_uncertainty: "",
    follow_up_needed: null,
    notes: "",
    updated_at: "",
  };
}

function responseRecordFor(session, requestId) {
  const store = session?.response_tracker || {};
  return {
    ...defaultResponseRecord(),
    ...(store[requestId] || {}),
  };
}

export function setResponseStatus(session, requestId, status, note = "") {
  if (!Object.values(RESPONSE_STATUSES).includes(status)) {
    throw new Error(`Unknown response status: ${status}`);
  }

  const store = ensureResponseStore(session);
  const existing = responseRecordFor(session, requestId);
  store[requestId] = {
    ...existing,
    status,
    notes: note || existing.notes,
    updated_at: new Date().toISOString(),
  };
  return store[requestId];
}

export function recordResponse(session, requestId, response = {}) {
  const store = ensureResponseStore(session);
  const existing = responseRecordFor(session, requestId);
  const resolvesGap = response.resolves_gap ?? response.resolvesGap;
  const followUpNeeded = response.follow_up_needed ?? response.followUpNeeded;
  const parsedResolves = boolValue(resolvesGap);
  const parsedFollowUp = boolValue(followUpNeeded);
  let status = response.status || existing.status;

  if (!response.status) {
    if (parsedResolves === true) status = RESPONSE_STATUSES.USABLE;
    else if (parsedFollowUp === true) status = RESPONSE_STATUSES.NEEDS_FOLLOW_UP;
    else status = RESPONSE_STATUSES.RESPONDED;
  }

  store[requestId] = {
    ...existing,
    status,
    received_date: response.received_date || response.receivedDate || existing.received_date,
    source_contact: response.source_contact || response.sourceContact || existing.source_contact,
    attachment_document_title: response.attachment_document_title || response.attachmentDocumentTitle || existing.attachment_document_title,
    resolves_gap: parsedResolves ?? existing.resolves_gap,
    remaining_uncertainty: response.remaining_uncertainty || response.remainingUncertainty || existing.remaining_uncertainty,
    follow_up_needed: parsedFollowUp ?? existing.follow_up_needed,
    notes: response.notes || existing.notes,
    updated_at: new Date().toISOString(),
  };
  return store[requestId];
}

export function clearResponseRecord(session, requestId) {
  const store = ensureResponseStore(session);
  delete store[requestId];
}

function requestRows(supplierRequests) {
  if (Array.isArray(supplierRequests)) return supplierRequests;
  if (Array.isArray(supplierRequests?.requests)) return supplierRequests.requests;
  return [];
}

function emailDraftSignal(emailDraftsText) {
  const raw = String(emailDraftsText || "");
  const text = normalize(raw);
  return {
    loaded: text.length > 0,
    draft_count_hint: (raw.match(/^##\s+REQ-/gm) || []).length,
  };
}

function trackerRow(request, response) {
  return {
    request_id: request.request_id,
    status: response.status || RESPONSE_STATUSES.NOT_SENT,
    recipient_type: request.recipient_type || UNKNOWN,
    product_sku: request.product_sku || UNKNOWN,
    missing_document: request.missing_document || UNKNOWN,
    exact_requested_evidence: request.exact_requested_evidence || UNKNOWN,
    deadline_placeholder: request.deadline_placeholder || "[DEADLINE TBD]",
    received_date: response.received_date || "",
    source_contact: response.source_contact || "",
    attachment_document_title: response.attachment_document_title || "",
    resolves_gap: response.resolves_gap === null ? "" : String(response.resolves_gap),
    remaining_uncertainty: response.remaining_uncertainty || "",
    follow_up_needed: response.follow_up_needed === null ? "" : String(response.follow_up_needed),
    notes: response.notes || "",
    originating_gaps: request.originating_gaps || [],
    short_internal_note: request.short_internal_note || "",
  };
}

function statusCounts(rows) {
  const counts = Object.fromEntries(Object.values(RESPONSE_STATUSES).map((status) => [status, 0]));
  for (const row of rows) {
    counts[row.status] = (counts[row.status] || 0) + 1;
  }
  return counts;
}

function gapStatusRows(rows) {
  const byGap = new Map();
  for (const row of rows) {
    const gaps = row.originating_gaps.length > 0 ? row.originating_gaps : [row.request_id];
    for (const gap of gaps) {
      if (!byGap.has(gap)) byGap.set(gap, []);
      byGap.get(gap).push(row);
    }
  }

  return [...byGap.entries()].map(([gapId, gapRows]) => {
    const requestIds = gapRows.map((row) => row.request_id);
    const statuses = [...new Set(gapRows.map((row) => row.status))];
    const hasUsable = gapRows.some((row) => row.status === RESPONSE_STATUSES.USABLE && row.resolves_gap === "true");
    const hasFollowUp = gapRows.some((row) => row.status === RESPONSE_STATUSES.NEEDS_FOLLOW_UP || row.follow_up_needed === "true");
    const allClosedNoResponse = gapRows.every((row) => row.status === RESPONSE_STATUSES.CLOSED_NO_RESPONSE);
    const allUnsent = gapRows.every((row) => row.status === RESPONSE_STATUSES.NOT_SENT);
    let gapStatus = "OPEN";
    let nextStep = "Send request or record response.";

    if (hasUsable) {
      gapStatus = "RESOLVED_BY_RESPONSE";
      nextStep = "Index the usable response as source evidence before packet reliance.";
    } else if (hasFollowUp) {
      gapStatus = "FOLLOW_UP_REQUIRED";
      nextStep = "Send targeted follow-up email and track response.";
    } else if (allClosedNoResponse) {
      gapStatus = "CLOSED_NO_RESPONSE";
      nextStep = "Keep gap open in packet limitations unless client directs otherwise.";
    } else if (allUnsent) {
      gapStatus = "NOT_SENT";
      nextStep = "Send the drafted request.";
    } else if (statuses.includes(RESPONSE_STATUSES.UNUSABLE)) {
      gapStatus = "UNUSABLE_RESPONSE";
      nextStep = "Request corrected or product-specific evidence.";
    } else if (statuses.includes(RESPONSE_STATUSES.RESPONDED)) {
      gapStatus = "RESPONSE_REVIEW_NEEDED";
      nextStep = "Decide whether the response is usable and whether uncertainty remains.";
    } else if (statuses.includes(RESPONSE_STATUSES.SENT)) {
      gapStatus = "AWAITING_RESPONSE";
      nextStep = "Monitor deadline and send follow-up if needed.";
    }

    return {
      gap_id: gapId,
      request_ids: requestIds,
      request_statuses: statuses,
      gap_status: gapStatus,
      remaining_uncertainty: gapRows.map((row) => row.remaining_uncertainty).filter(Boolean).join(" | "),
      next_step: nextStep,
    };
  });
}

function followUpReason(row) {
  if (row.status === RESPONSE_STATUSES.SENT) return "No usable response is recorded yet.";
  if (row.status === RESPONSE_STATUSES.RESPONDED) return "A response was recorded but has not been marked usable.";
  if (row.status === RESPONSE_STATUSES.UNUSABLE) return "The response was marked unusable for closing the evidence gap.";
  if (row.status === RESPONSE_STATUSES.NEEDS_FOLLOW_UP) return "The analyst marked follow-up as needed.";
  return "Follow-up may be needed.";
}

function followUpEmail(row) {
  return `Hello,

I am following up on Liberty Tree Compliance's documentation request for ${row.product_sku}.

Open item: ${row.missing_document}
Requested evidence: ${row.exact_requested_evidence}
Current status: ${row.status}
Reason for follow-up: ${followUpReason(row)}
Remaining uncertainty: ${row.remaining_uncertainty || "Please confirm the requested product/SKU scope, issue date, issuer authority, and any limitations."}

Please provide the requested evidence or clarification by [FOLLOW-UP DEADLINE TBD].

This is a documentation-completeness follow-up only. Liberty Tree is not asking for a legal conclusion or a statement about product compliance status.

Thank you,
Liberty Tree Compliance`;
}

function buildFollowUps(rows) {
  return rows
    .filter((row) => FOLLOW_UP_STATUSES.has(row.status) || row.follow_up_needed === "true")
    .filter((row) => row.status !== RESPONSE_STATUSES.USABLE)
    .map((row) => ({
      request_id: row.request_id,
      recipient_type: row.recipient_type,
      product_sku: row.product_sku,
      missing_document: row.missing_document,
      current_status: row.status,
      reason: followUpReason(row),
      email_draft: followUpEmail(row),
    }));
}

function buildMetrics() {
  const previous = TRACKING_BASELINE.previousTrackingMinutes;
  const current = TRACKING_BASELINE.newTrackingMinutes;
  const reduction = ((previous - current) / previous) * 100;
  const analystMinutes = TRACKING_BASELINE.currentAnalystEngagementMinutes - (previous - current);
  const totalMinutes = analystMinutes + TRACKING_BASELINE.currentExpertReviewMinutes;

  return {
    previous_response_tracking_minutes: previous,
    new_response_tracking_minutes: current,
    response_tracking_reduction_percent: reduction,
    new_analyst_engagement_minutes: analystMinutes,
    expert_review_minutes: TRACKING_BASELINE.currentExpertReviewMinutes,
    new_total_engagement_minutes: totalMinutes,
    success_criterion_met: reduction >= 50,
  };
}

export function buildResponseTrackerModel({
  supplierRequests,
  emailDraftsText = "",
  session = {},
  query,
  expertReviewModel = null,
  missingDocumentationRegister = [],
} = {}) {
  const requestSource = supplierRequests || {};
  const normalizedQuery = normalizeQuery(query || requestSource.query || {});
  const rows = requestRows(requestSource).map((request) => trackerRow(request, responseRecordFor(session, request.request_id)));
  const gapRows = gapStatusRows(rows);
  const followUps = buildFollowUps(rows);

  return {
    query: normalizedQuery,
    generated_at: new Date().toISOString(),
    source_inputs: {
      supplier_requests_json: true,
      email_drafts_md: emailDraftSignal(emailDraftsText),
      expert_review_exceptions: {
        open_count: expertReviewModel?.open_exception_items ?? 0,
        total_count: expertReviewModel?.total_exception_items ?? 0,
      },
      missing_documentation_register: {
        row_count: Array.isArray(missingDocumentationRegister) ? missingDocumentationRegister.length : 0,
      },
    },
    request_count: rows.length,
    status_counts: statusCounts(rows),
    metrics: buildMetrics(),
    requests: rows,
    follow_up_emails: followUps,
    gap_status_summary: gapRows,
  };
}

function trackerCsv(model) {
  const headers = [
    "request_id",
    "status",
    "recipient_type",
    "product_sku",
    "missing_document",
    "exact_requested_evidence",
    "deadline_placeholder",
    "received_date",
    "source_contact",
    "attachment_document_title",
    "resolves_gap",
    "remaining_uncertainty",
    "follow_up_needed",
    "notes",
    "originating_gaps",
    "short_internal_note",
  ];
  const rows = model.requests.map((row) => headers.map((header) => csvEscape(row[header])).join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}

function markdownTable(headers, rows) {
  const escape = (value) => String(value ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
  const header = `| ${headers.map(escape).join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((headerName) => escape(row[headerName])).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function renderFollowUpEmails(model) {
  const lines = [
    "# Follow-Up Email Drafts",
    "",
    `Generated for: ${productSku(model.query)}`,
    `Follow-up count: ${model.follow_up_emails.length}`,
    "",
    "These drafts are documentation-completeness follow-ups only. They do not state legal conclusions, regulatory determinations, product certification, or product compliance status.",
    "",
  ];

  if (model.follow_up_emails.length === 0) {
    lines.push("No follow-up email drafts are currently required from the recorded response statuses.", "");
    return `${lines.join("\n").trim()}\n`;
  }

  for (const followUp of model.follow_up_emails) {
    lines.push(`## ${followUp.request_id}: ${followUp.missing_document}`);
    lines.push("");
    lines.push(`Recipient type: ${followUp.recipient_type}`);
    lines.push(`Current status: ${followUp.current_status}`);
    lines.push(`Reason: ${followUp.reason}`);
    lines.push("");
    lines.push("```text");
    lines.push(followUp.email_draft);
    lines.push("```");
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function renderGapStatusSummary(model) {
  const rows = model.gap_status_summary.map((row) => ({
    "Gap ID": row.gap_id,
    "Request IDs": row.request_ids.join("; "),
    "Request statuses": row.request_statuses.join("; "),
    "Gap status": row.gap_status,
    "Remaining uncertainty": row.remaining_uncertainty || "",
    "Next step": row.next_step,
  }));

  const lines = [
    "# Updated Gap Status Summary",
    "",
    `Generated for: ${productSku(model.query)}`,
    `Tracked requests: ${model.request_count}`,
    "",
    markdownTable(["Gap ID", "Request IDs", "Request statuses", "Gap status", "Remaining uncertainty", "Next step"], rows),
    "",
  ];

  return lines.join("\n");
}

export async function writeResponseTrackerExports({ supplierRequests, emailDraftsText = "", session = {}, query, exportDir, expertReviewModel, missingDocumentationRegister }) {
  await mkdir(exportDir, { recursive: true });
  const model = buildResponseTrackerModel({
    supplierRequests,
    emailDraftsText,
    session,
    query,
    expertReviewModel,
    missingDocumentationRegister,
  });
  const stem = slugify(`${model.query.manufacturer}-${model.query.productCode || model.query.product || "unknown"}-response-tracker`);
  const jsonPath = path.join(exportDir, "response-tracker.json");
  const csvPath = path.join(exportDir, "response-tracker.csv");
  const followUpEmailsPath = path.join(exportDir, "follow-up-emails.md");
  const gapStatusSummaryPath = path.join(exportDir, "gap-status-summary.md");
  const scopedJsonPath = path.join(exportDir, `${stem}.json`);
  const scopedCsvPath = path.join(exportDir, `${stem}.csv`);
  const scopedFollowUpEmailsPath = path.join(exportDir, `${stem}-follow-up-emails.md`);
  const scopedGapStatusSummaryPath = path.join(exportDir, `${stem}-gap-status-summary.md`);

  const json = JSON.stringify(model, null, 2);
  const csv = trackerCsv(model);
  const followUps = renderFollowUpEmails(model);
  const gapSummary = renderGapStatusSummary(model);

  await writeFile(jsonPath, json);
  await writeFile(csvPath, csv);
  await writeFile(followUpEmailsPath, followUps);
  await writeFile(gapStatusSummaryPath, gapSummary);
  await writeFile(scopedJsonPath, json);
  await writeFile(scopedCsvPath, csv);
  await writeFile(scopedFollowUpEmailsPath, followUps);
  await writeFile(scopedGapStatusSummaryPath, gapSummary);

  return {
    jsonPath,
    csvPath,
    followUpEmailsPath,
    gapStatusSummaryPath,
    scopedJsonPath,
    scopedCsvPath,
    scopedFollowUpEmailsPath,
    scopedGapStatusSummaryPath,
    metrics: model.metrics,
    requestCount: model.request_count,
    followUpCount: model.follow_up_emails.length,
  };
}

export function formatResponseTrackerSummary(modelOrExports) {
  const metrics = modelOrExports.metrics;
  const requestCount = modelOrExports.request_count ?? modelOrExports.requestCount;
  const followUpCount = modelOrExports.follow_up_emails?.length ?? modelOrExports.followUpCount;
  return [
    "External Response Tracker",
    "-------------------------",
    `Tracked requests:         ${requestCount}`,
    `Follow-up drafts:         ${followUpCount}`,
    `Previous tracking time:   ${(metrics.previous_response_tracking_minutes / 60).toFixed(1)}h`,
    `Estimated tracking time:  ${(metrics.new_response_tracking_minutes / 60).toFixed(1)}h`,
    `Tracking reduction:       ${metrics.response_tracking_reduction_percent.toFixed(1)}%`,
    `New analyst time:         ${(metrics.new_analyst_engagement_minutes / 60).toFixed(1)}h`,
    `Estimated total time:     ${(metrics.new_total_engagement_minutes / 60).toFixed(1)}h`,
    `Success criterion met:    ${metrics.success_criterion_met ? "yes" : "no"}`,
  ].join("\n");
}

function printTrackerList(model) {
  console.log("");
  console.log(formatResponseTrackerSummary(model));
  console.log("");
  for (const row of model.requests) {
    console.log(`${row.request_id} ${row.status} ${row.missing_document}`);
    console.log(`  ${row.recipient_type} | ${row.product_sku}`);
  }
}

function printTrackerDetail(row) {
  console.log("");
  console.log(`${row.request_id} ${row.status}`);
  console.log("-".repeat(`${row.request_id} ${row.status}`.length));
  console.log(`Recipient type: ${row.recipient_type}`);
  console.log(`Product/SKU: ${row.product_sku}`);
  console.log(`Missing document: ${row.missing_document}`);
  console.log(`Requested evidence: ${row.exact_requested_evidence}`);
  console.log(`Received date: ${row.received_date || UNKNOWN}`);
  console.log(`Source/contact: ${row.source_contact || UNKNOWN}`);
  console.log(`Attachment/document title: ${row.attachment_document_title || UNKNOWN}`);
  console.log(`Resolves gap: ${row.resolves_gap || UNKNOWN}`);
  console.log(`Remaining uncertainty: ${row.remaining_uncertainty || UNKNOWN}`);
  console.log(`Follow-up needed: ${row.follow_up_needed || UNKNOWN}`);
  console.log(`Notes: ${row.notes || UNKNOWN}`);
}

function findRow(model, id) {
  const wanted = lower(id);
  return model.requests.find((row) => lower(row.request_id) === wanted) || null;
}

function parseStatus(value) {
  const status = normalize(value).toUpperCase();
  return Object.values(RESPONSE_STATUSES).includes(status) ? status : null;
}

function printTrackerHelp() {
  console.log(`Commands:
  list                         Show tracked requests
  open <request-id>             Show request and response detail
  status <id> <status> [note]   Set NOT_SENT/SENT/RESPONDED/USABLE/UNUSABLE/NEEDS_FOLLOW_UP/CLOSED_NO_RESPONSE
  record <request-id>           Enter response details interactively
  clear <request-id>            Clear response record
  export                       Write tracker, CSV, follow-up emails, and gap summary
  summary                      Show timing and status summary
  q                            Save and quit`);
}

async function ask(rl, label, current = "") {
  const suffix = current ? ` [${current}]` : "";
  const answer = normalize(await rl.question(`${label}${suffix}: `));
  return answer || current;
}

async function promptRecordResponse(rl, session, row) {
  const receivedDate = await ask(rl, "Received date", row.received_date);
  const sourceContact = await ask(rl, "Source/contact", row.source_contact);
  const attachmentTitle = await ask(rl, "Attachment/document title", row.attachment_document_title);
  const resolvesGap = await ask(rl, "Resolves gap? yes/no", row.resolves_gap);
  const remainingUncertainty = await ask(rl, "Remaining uncertainty", row.remaining_uncertainty);
  const followUpNeeded = await ask(rl, "Follow-up needed? yes/no", row.follow_up_needed);
  const notes = await ask(rl, "Notes", row.notes);
  return recordResponse(session, row.request_id, {
    received_date: receivedDate,
    source_contact: sourceContact,
    attachment_document_title: attachmentTitle,
    resolves_gap: resolvesGap,
    remaining_uncertainty: remainingUncertainty,
    follow_up_needed: followUpNeeded,
    notes,
  });
}

export async function runResponseTrackerConsole({
  supplierRequests,
  emailDraftsText = "",
  session,
  query,
  expertReviewModel,
  missingDocumentationRegister,
  exportDir,
  save,
  input = defaultInput,
  output = defaultOutput,
}) {
  const rl = readline.createInterface({ input, output });
  let model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });

  async function saveAndExport() {
    if (save) await save();
    if (exportDir) {
      const exports = await writeResponseTrackerExports({ supplierRequests, emailDraftsText, session, query, exportDir, expertReviewModel, missingDocumentationRegister });
      console.log(`Response tracker JSON: ${exports.jsonPath}`);
      console.log(`Response tracker CSV:  ${exports.csvPath}`);
      console.log(`Follow-up emails:      ${exports.followUpEmailsPath}`);
      console.log(`Gap status summary:    ${exports.gapStatusSummaryPath}`);
    }
  }

  try {
    printTrackerList(model);
    printTrackerHelp();

    while (true) {
      const line = normalize(await rl.question("\ntracker> "));
      if (!line) continue;
      const [command, id, statusValue, ...noteParts] = line.split(" ");
      const note = noteParts.join(" ").trim();

      if (command === "q" || command === "quit") {
        await saveAndExport();
        break;
      }

      if (command === "help" || command === "?") {
        printTrackerHelp();
        continue;
      }

      if (command === "list" || command === "l") {
        model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });
        printTrackerList(model);
        continue;
      }

      if (command === "summary" || command === "s") {
        model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });
        console.log(formatResponseTrackerSummary(model));
        continue;
      }

      if (command === "export" || command === "x") {
        await saveAndExport();
        continue;
      }

      const row = findRow(model, id);
      if (!row) {
        console.log("Unknown request id.");
        continue;
      }

      if (command === "open" || command === "o") {
        printTrackerDetail(row);
        continue;
      }

      if (command === "clear") {
        clearResponseRecord(session, row.request_id);
        await saveAndExport();
        model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });
        console.log(`Cleared response record for ${row.request_id}.`);
        continue;
      }

      if (command === "record") {
        await promptRecordResponse(rl, session, row);
        await saveAndExport();
        model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });
        console.log(`Recorded response for ${row.request_id}.`);
        continue;
      }

      if (command === "status") {
        const status = parseStatus(statusValue);
        if (!status) {
          console.log("Unknown status.");
          continue;
        }
        setResponseStatus(session, row.request_id, status, note);
        await saveAndExport();
        model = buildResponseTrackerModel({ supplierRequests, emailDraftsText, session, query, expertReviewModel, missingDocumentationRegister });
        console.log(`Marked ${row.request_id} as ${status}.`);
        continue;
      }

      console.log("Unknown command. Use help for tracker commands.");
    }
  } finally {
    rl.close();
  }

  return model;
}
