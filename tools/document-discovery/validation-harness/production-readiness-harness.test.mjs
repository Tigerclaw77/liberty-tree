import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildProductionReadinessReport,
  buildValidationScenarios,
  renderProductionReadinessCsv,
  renderProductionReadinessMarkdown,
  writeProductionReadinessExports,
} from "./production-readiness-harness.mjs";

const scenarios = buildValidationScenarios();
const report = buildProductionReadinessReport({ scenarios });

assert.equal(report.validation_scope.scenario_count, scenarios.length);
assert.ok(report.validation_scope.scenario_count >= 14);
assert.ok(report.production_readiness_score >= 0);
assert.ok(report.production_readiness_score <= 100);
assert.ok(report.production_readiness_score < 85);
assert.equal(report.top_failure_modes.length, 10);
assert.ok(report.total_additional_analyst_minutes > 0);
assert.ok(report.scenario_results.some((result) => result.false_confidence.length > 0));
assert.ok(report.scenario_results.some((result) => result.incorrect_classifications.length > 0));
assert.ok(report.scenario_results.some((result) => result.unnecessary_expert_escalation.length > 0));

const scannedScenario = report.scenario_results.find((result) => result.scenario_id === "scanned-pdf-no-text-layer");
assert.ok(scannedScenario);
assert.ok(scannedScenario.missed_evidence.some((record) => record.issue_code === "IMAGE_ONLY_PDF_WITHOUT_TEXT"));
assert.ok(scannedScenario.false_confidence.some((record) => record.issue_code === "FALSE_CONFIDENCE_IMAGE_ONLY_PDF_WITHOUT_TEXT"));

const brokenLinkScenario = report.scenario_results.find((result) => result.scenario_id === "broken-hyperlinks");
assert.ok(brokenLinkScenario);
assert.ok(brokenLinkScenario.missed_evidence.some((record) => record.issue_code === "BROKEN_SOURCE_LINK_NOT_VALIDATED"));

const renamedScenario = report.scenario_results.find((result) => result.scenario_id === "renamed-file-lost-classification");
assert.ok(renamedScenario);
assert.ok(renamedScenario.incorrect_classifications.some((record) => record.issue_code === "DOCUMENT_CATEGORY_MISCLASSIFIED"));

const markdown = renderProductionReadinessMarkdown(report);
const csv = renderProductionReadinessCsv(report);
assert.ok(markdown.includes("Production Readiness Score"));
assert.ok(markdown.includes("Greatest Commercial Risk"));
assert.ok(csv.includes("record_type,scenario_id,scenario_title"));

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lt-production-readiness-"));
try {
  const exports = await writeProductionReadinessExports({ exportDir: tempDir, scenarios });
  const json = JSON.parse(await readFile(exports.reportJsonPath, "utf8"));
  const markdownExport = await readFile(exports.reportMarkdownPath, "utf8");
  const csvExport = await readFile(exports.failuresCsvPath, "utf8");
  const samples = JSON.parse(await readFile(exports.samplesJsonPath, "utf8"));

  assert.equal(json.production_readiness_score, report.production_readiness_score);
  assert.ok(markdownExport.includes("Top Failure Modes"));
  assert.ok(csvExport.includes("false_confidence"));
  assert.equal(samples.length, scenarios.length);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
