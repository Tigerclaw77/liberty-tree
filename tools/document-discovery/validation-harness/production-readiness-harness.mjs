import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildEvidenceReliabilityModel } from "../evidence-reliability/evidence-reliability-engine.mjs";
import { buildExpertReviewModel } from "../expert-review/expert-review-console.mjs";
import { buildPacketModel } from "../packet/packet-assembler.mjs";
import { buildResponseTrackerModel } from "../response-tracker/response-tracker.mjs";
import { buildSupplierRequestModel } from "../supplier-requests/supplier-request-generator.mjs";
import { slugify } from "../normalization/text.mjs";
import { getCategory } from "../workbench/core/categories.mjs";
import { buildSummary } from "../workbench/core/summary.mjs";

const GENERATED_AT = "2026-07-08T12:00:00.000Z";
const MAX_TOP_FAILURE_MODES = 10;

const CURRENT_WORKFLOW = Object.freeze({
  analyst_minutes: 210,
  expert_minutes: 60,
  total_minutes: 270,
});

const BASE_QUERY = Object.freeze({
  manufacturer: "Acme Advanced Coatings",
  product: "AlphaShield 42 Conformal Coating",
  productCode: "AS-42",
});

const SEVERITY_DEDUCTION = Object.freeze({
  Critical: 30,
  High: 22,
  Medium: 12,
  Low: 6,
});

const SEVERITY_RANK = Object.freeze({
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
});

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function hours(minutes) {
  return `${(minutes / 60).toFixed(1)}h`;
}

function documentKey(document) {
  return document.document_key || document.key || document.url || `${document.document_type}:${document.title}`;
}

function baseDocument(overrides = {}) {
  const title = overrides.title || "AS-42 source document";
  const documentType = overrides.document_type || "Technical document";
  const key = overrides.document_key || slugify(title);
  return {
    document_key: key,
    title,
    url: overrides.url || `https://validation.example.test/${key}.pdf`,
    document_type: documentType,
    manufacturer: overrides.manufacturer || BASE_QUERY.manufacturer,
    product: overrides.product || BASE_QUERY.product,
    product_code: overrides.product_code || BASE_QUERY.productCode,
    revision_date: overrides.revision_date || "2026-05-12",
    confidence: overrides.confidence || "High",
    confidence_score: overrides.confidence_score ?? 92,
    confidence_reason: overrides.confidence_reason || `classified as ${documentType}; direct PDF URL; matched product terms: ${BASE_QUERY.productCode}`,
    discovery_method: overrides.discovery_method || "HTML_DROPDOWN_OPTION",
    status: overrides.status || "FOUND",
    source_page: overrides.source_page || "https://validation.example.test/products/as-42",
    matched_terms: overrides.matched_terms || [BASE_QUERY.productCode, BASE_QUERY.product],
    notes: overrides.notes || [],
    analyst_action: overrides.analyst_action || "VERIFIED",
    issuer: overrides.issuer === undefined ? BASE_QUERY.manufacturer : overrides.issuer,
    signed_by: overrides.signed_by === undefined ? "Director of Product Stewardship" : overrides.signed_by,
    signatory: overrides.signatory || "",
    authority_confirmed: overrides.authority_confirmed === undefined ? "Manufacturer declaration portal" : overrides.authority_confirmed,
    timeline_group: overrides.timeline_group || `${documentType}|${key}`,
    is_latest_revision: overrides.is_latest_revision === undefined ? true : overrides.is_latest_revision,
    older_revision_count: overrides.older_revision_count || 0,
  };
}

function verifiedPfas(keyPrefix) {
  return baseDocument({
    document_key: `${keyPrefix}-baseline-pfas`,
    title: "AS-42 PFAS Declaration - signed current revision",
    url: `https://validation.example.test/${keyPrefix}/AS-42-PFAS-Declaration-current.pdf`,
    document_type: "PFAS declaration",
    revision_date: "2026-05-12",
    confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; signed manufacturer portal record",
    timeline_group: `${keyPrefix}|PFAS|AS-42 current declaration`,
    notes: ["Signed manufacturer declaration states product scope for AS-42."],
  });
}

function verifiedSds(keyPrefix) {
  return baseDocument({
    document_key: `${keyPrefix}-baseline-sds`,
    title: "AS-42 Safety Data Sheet - current revision",
    url: `https://validation.example.test/${keyPrefix}/AS-42-SDS-current.pdf`,
    document_type: "SDS",
    revision_date: "2026-04-20",
    confidence_reason: "classified as SDS; direct PDF URL; matched product terms: AS-42; current manufacturer portal record",
    timeline_group: `${keyPrefix}|SDS|AS-42 current SDS`,
    notes: ["Current SDS lists AS-42 product scope."],
  });
}

function baselineDocuments(keyPrefix, options = {}) {
  const includePfas = options.includePfas !== false;
  const includeSds = options.includeSds !== false;
  return [
    ...(includePfas ? [verifiedPfas(keyPrefix)] : []),
    ...(includeSds ? [verifiedSds(keyPrefix)] : []),
  ];
}

function finding({
  code,
  acceptableIssueTypes = [],
  documentKeys,
  description,
  failure,
  severity = "High",
  analystMinutes = 20,
  smallestCodeChange,
  commercialRisk = 5,
}) {
  return {
    code,
    acceptableIssueTypes,
    documentKeys,
    description,
    failure,
    severity,
    analystMinutes,
    smallestCodeChange,
    commercialRisk,
  };
}

function scenario({
  id,
  title,
  clientSubmission,
  documents,
  expectedFindings,
  expectedCategories = {},
  expectedReadyWithoutEscalation = false,
}) {
  return {
    id,
    title,
    query: { ...BASE_QUERY },
    clientSubmission,
    generated_at: GENERATED_AT,
    documents,
    expectedFindings,
    expectedCategories,
    expectedReadyWithoutEscalation,
  };
}

function buildValidationScenarios() {
  return [
    scenario({
      id: "scanned-pdf-no-text-layer",
      title: "Scanned PFAS PDF with no extractable text layer",
      clientSubmission: "Supplier uploaded a signed scanned PDF image that looks complete to a human but has no text layer.",
      documents: [
        ...baselineDocuments("scan-no-text", { includePfas: false }),
        baseDocument({
          document_key: "scan-no-text-pfas",
          title: "AS-42 PFAS Declaration - scanned signed PDF",
          url: "https://validation.example.test/scan-no-text/AS-42-PFAS-Declaration-scanned.pdf",
          document_type: "PFAS declaration",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; signed document uploaded by supplier",
          notes: ["Scanned supplier PDF; bitmap pages only; extracted text length is zero."],
          timeline_group: "scan-no-text|PFAS|AS-42 scanned declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "IMAGE_ONLY_PDF_WITHOUT_TEXT",
          documentKeys: ["scan-no-text-pfas"],
          description: "A signed but image-only declaration cannot be relied on until OCR/text extraction or human readback confirms the content.",
          failure: "Engine treats the document as metadata-complete and ready even though no readable source text was validated.",
          severity: "Critical",
          analystMinutes: 35,
          commercialRisk: 10,
          smallestCodeChange: "Persist extractor text length/page image ratio and add a reliability exception when PDF text is empty or below a minimum threshold.",
        }),
      ],
    }),
    scenario({
      id: "ocr-product-code-confusion",
      title: "OCR substituted product code characters",
      clientSubmission: "OCR converts AS-42 into AS-4Z in the title and extracted hints while the scanned image may show the correct SKU.",
      documents: [
        ...baselineDocuments("ocr-product-code"),
        baseDocument({
          document_key: "ocr-product-code-sds",
          title: "AS-4Z Safety Data Sheet",
          url: "https://validation.example.test/ocr-product-code/AS-4Z-SDS.pdf",
          document_type: "SDS",
          confidence: "Medium",
          confidence_score: 76,
          confidence_reason: "classified as SDS; OCR extracted product code AS-4Z from scanned title block",
          matched_terms: ["AS-4Z", "Safety Data Sheet"],
          notes: ["OCR confusion: extracted SKU AS-4Z may be AS-42 in the source image."],
          timeline_group: "ocr-product-code|SDS|ambiguous product code",
        }),
      ],
      expectedFindings: [
        finding({
          code: "OCR_EXTRACTION_QUALITY_UNMEASURED",
          acceptableIssueTypes: ["PRODUCT_CODE_MISMATCH"],
          documentKeys: ["ocr-product-code-sds"],
          description: "OCR ambiguity should be captured separately from ordinary product-code mismatch so the analyst knows to inspect the image.",
          failure: "Engine may route the mismatch but does not preserve why OCR quality, not supplier scope, caused the ambiguity.",
          severity: "Medium",
          analystMinutes: 12,
          commercialRisk: 4,
          smallestCodeChange: "Store OCR confidence and suspected substitutions, then include them in reliability issue evidence and recommended action.",
        }),
      ],
    }),
    scenario({
      id: "duplicate-revisions",
      title: "Duplicate PFAS declarations across revisions",
      clientSubmission: "The client provides old and current PFAS declarations with nearly identical names.",
      documents: [
        ...baselineDocuments("duplicate-revisions", { includePfas: false }),
        baseDocument({
          document_key: "duplicate-revisions-old",
          title: "AS-42 PFAS Declaration Rev A",
          url: "https://validation.example.test/duplicate-revisions/AS-42-PFAS-Declaration-Rev-A.pdf",
          document_type: "PFAS declaration",
          revision_date: "2023-02-10",
          confidence: "Medium",
          confidence_score: 74,
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; older revision",
          timeline_group: "duplicate-revisions|PFAS|AS-42 declaration",
          is_latest_revision: false,
          older_revision_count: 1,
        }),
        baseDocument({
          document_key: "duplicate-revisions-current",
          title: "AS-42 PFAS Declaration Rev C",
          url: "https://validation.example.test/duplicate-revisions/AS-42-PFAS-Declaration-Rev-C.pdf",
          document_type: "PFAS declaration",
          revision_date: "2026-05-12",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; current revision",
          timeline_group: "duplicate-revisions|PFAS|AS-42 declaration",
          is_latest_revision: true,
          older_revision_count: 1,
        }),
      ],
      expectedFindings: [
        finding({
          code: "OBSOLETE_REVISION",
          acceptableIssueTypes: ["OBSOLETE_REVISION"],
          documentKeys: ["duplicate-revisions-old"],
          description: "Older declaration should be separated from current declaration before reliance.",
          failure: "Old revision could be treated as equally current.",
          severity: "High",
          analystMinutes: 18,
          commercialRisk: 7,
          smallestCodeChange: "Use timeline grouping and latest-revision flags to suppress older evidence from ready state until resolved.",
        }),
        finding({
          code: "DUPLICATE_DECLARATION",
          acceptableIssueTypes: ["DUPLICATE_DECLARATION"],
          documentKeys: ["duplicate-revisions-old", "duplicate-revisions-current"],
          description: "Duplicate declaration records should be visible as a reconciliation item.",
          failure: "Analyst would manually compare near-identical declarations.",
          severity: "Low",
          analystMinutes: 8,
          commercialRisk: 3,
          smallestCodeChange: "Cluster normalized declaration titles with timeline group hints and emit a duplicate-review exception.",
        }),
      ],
    }),
    scenario({
      id: "conflicting-declarations",
      title: "Conflicting PFAS statements",
      clientSubmission: "Two current-looking declarations disagree about whether fluoropolymer/PTFE is intentionally present.",
      documents: [
        ...baselineDocuments("conflicting-declarations", { includePfas: false }),
        baseDocument({
          document_key: "conflicting-declarations-free",
          title: "AS-42 PFAS Free Declaration",
          url: "https://validation.example.test/conflicting/AS-42-PFAS-Free.pdf",
          document_type: "PFAS declaration",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; states product is PFAS-free and does not contain intentionally added PFAS",
          notes: ["The declaration states the product does not contain PFAS."],
          timeline_group: "conflicting-declarations|PFAS|AS-42 declaration",
        }),
        baseDocument({
          document_key: "conflicting-declarations-ptfe",
          title: "AS-42 PFAS Declaration PTFE Addendum",
          url: "https://validation.example.test/conflicting/AS-42-PFAS-PTFE-Addendum.pdf",
          document_type: "PFAS declaration",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; addendum references PTFE fluoropolymer",
          notes: ["The addendum says AS-42 contains PTFE as a fluoropolymer processing aid."],
          timeline_group: "conflicting-declarations|PFAS|AS-42 declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "CONFLICTING_STATEMENTS",
          acceptableIssueTypes: ["CONFLICTING_STATEMENTS", "INTERNAL_CONFLICTING_STATEMENT"],
          documentKeys: ["conflicting-declarations-free", "conflicting-declarations-ptfe"],
          description: "Positive and negative PFAS language should be routed as a conflict, not averaged into confidence.",
          failure: "Expert might miss a substantive contradiction in the evidence set.",
          severity: "Critical",
          analystMinutes: 35,
          commercialRisk: 9,
          smallestCodeChange: "Keep declaration polarity cues and compare them across records in the same packet scope.",
        }),
      ],
    }),
    scenario({
      id: "incomplete-sds-page-range",
      title: "Incomplete SDS indicated only by page range",
      clientSubmission: "SDS upload has pages 1-9 of 16 but does not literally say missing, partial, or truncated.",
      documents: [
        ...baselineDocuments("incomplete-sds-page-range", { includeSds: false }),
        baseDocument({
          document_key: "incomplete-sds-page-range-doc",
          title: "AS-42 Safety Data Sheet pages 1-9 of 16",
          url: "https://validation.example.test/incomplete-sds/AS-42-SDS-pages-1-9-of-16.pdf",
          document_type: "SDS",
          confidence_reason: "classified as SDS; direct PDF URL; matched product terms: AS-42; upload title indicates pages 1-9 of 16",
          notes: ["Uploaded file contains pages 1-9 of 16."],
          timeline_group: "incomplete-sds-page-range|SDS|AS-42 SDS",
        }),
      ],
      expectedFindings: [
        finding({
          code: "INCOMPLETE_PAGE_RANGE_NOT_PARSED",
          documentKeys: ["incomplete-sds-page-range-doc"],
          description: "Page-range evidence should be treated as an incomplete SDS even without explicit missing-page language.",
          failure: "Engine can mark a 9-of-16 SDS as ready because the completeness detector only looks for explicit words.",
          severity: "High",
          analystMinutes: 25,
          commercialRisk: 8,
          smallestCodeChange: "Parse page-count/page-range metadata and flag documents where delivered pages are fewer than expected pages.",
        }),
      ],
    }),
    scenario({
      id: "broken-hyperlinks",
      title: "Broken source hyperlink",
      clientSubmission: "Workbench record points to a supplier URL that looks authoritative but returns 404 or fails later.",
      documents: [
        ...baselineDocuments("broken-hyperlinks", { includePfas: false }),
        baseDocument({
          document_key: "broken-hyperlink-pfas",
          title: "AS-42 PFAS Declaration",
          url: "https://validation.example.test/broken-hyperlinks/404/AS-42-PFAS-Declaration.pdf",
          document_type: "PFAS declaration",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; supplier portal result",
          notes: ["Source URL was not revalidated after analyst verification."],
          timeline_group: "broken-hyperlinks|PFAS|AS-42 declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "BROKEN_SOURCE_LINK_NOT_VALIDATED",
          documentKeys: ["broken-hyperlink-pfas"],
          description: "A source link that cannot be retrieved should not be ready for reliance even if metadata looks clean.",
          failure: "Engine does not perform link-health validation during packet reliability scoring.",
          severity: "High",
          analystMinutes: 20,
          commercialRisk: 7,
          smallestCodeChange: "Record fetch status/content hash at verification time and lower reliability when the source URL is unavailable.",
        }),
      ],
    }),
    scenario({
      id: "supplier-only-document",
      title: "Supplier-only PFAS declaration without manufacturer authority",
      clientSubmission: "Distributor provides a PFAS letter on its own letterhead for a manufacturer-controlled SKU.",
      documents: [
        ...baselineDocuments("supplier-only-document", { includePfas: false }),
        baseDocument({
          document_key: "supplier-only-pfas",
          title: "AS-42 PFAS Declaration - Regional Resin Supply",
          url: "https://validation.example.test/supplier-only/AS-42-PFAS-Declaration-Distributor.pdf",
          document_type: "PFAS declaration",
          manufacturer: "Regional Resin Supply",
          issuer: "Regional Resin Supply",
          signed_by: "Supplier Account Manager",
          authority_confirmed: "Supplier-provided upload",
          confidence: "Medium",
          confidence_score: 72,
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; supplier-only issuer",
          notes: ["Distributor letterhead; no manufacturer authorization attached."],
          timeline_group: "supplier-only-document|PFAS|AS-42 supplier declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "SUPPLIER_ONLY_AUTHORITY_GAP",
          acceptableIssueTypes: ["SUPPLIER_MANUFACTURER_MISMATCH"],
          documentKeys: ["supplier-only-pfas"],
          description: "Supplier-only evidence should require authority or relationship confirmation before manufacturer reliance.",
          failure: "Supplier letter could be mistaken for manufacturer-controlled evidence.",
          severity: "High",
          analystMinutes: 18,
          commercialRisk: 7,
          smallestCodeChange: "Require explicit relationship/authorization metadata when document manufacturer differs from engagement manufacturer.",
        }),
      ],
    }),
    scenario({
      id: "generic-declaration-specific-sku",
      title: "Generic declaration used for specific SKU request",
      clientSubmission: "Supplier sends an all-products PFAS declaration to close an AS-42-specific evidence gap.",
      documents: [
        ...baselineDocuments("generic-declaration-specific-sku", { includePfas: false }),
        baseDocument({
          document_key: "generic-declaration-pfas",
          title: "Global PFAS Declaration - all products",
          url: "https://validation.example.test/generic/Global-PFAS-Declaration.pdf",
          document_type: "PFAS declaration",
          confidence_reason: "classified as PFAS declaration; direct PDF URL; generic all products statement",
          matched_terms: ["PFAS", "all products"],
          notes: ["Generic global declaration applies to all products and does not list AS-42."],
          timeline_group: "generic-declaration-specific-sku|PFAS|global declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "GENERIC_DECLARATION_APPLIED_TO_PRODUCT_REQUEST",
          acceptableIssueTypes: ["GENERIC_DECLARATION_APPLIED_TO_PRODUCT_REQUEST", "PRODUCT_CODE_MISMATCH"],
          documentKeys: ["generic-declaration-pfas"],
          description: "Generic all-products declaration should not silently close a product-specific request.",
          failure: "Analyst would have to manually discover that the declaration lacks product scope.",
          severity: "High",
          analystMinutes: 20,
          commercialRisk: 8,
          smallestCodeChange: "Treat generic declarations without SKU/product match as product-specific evidence gaps.",
        }),
      ],
    }),
    scenario({
      id: "inconsistent-product-codes",
      title: "Inconsistent product codes across submitted documents",
      clientSubmission: "A declaration for AS-24 is uploaded into an AS-42 engagement.",
      documents: [
        ...baselineDocuments("inconsistent-product-codes"),
        baseDocument({
          document_key: "inconsistent-product-code-pfas",
          title: "AS-24 PFAS Declaration",
          url: "https://validation.example.test/inconsistent-codes/AS-24-PFAS-Declaration.pdf",
          document_type: "PFAS declaration",
          product_code: "AS-24",
          confidence: "Medium",
          confidence_score: 78,
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-24",
          matched_terms: ["AS-24", "PFAS declaration"],
          notes: ["Document scope identifies AS-24 rather than AS-42."],
          timeline_group: "inconsistent-product-codes|PFAS|AS-24 declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "PRODUCT_CODE_MISMATCH",
          acceptableIssueTypes: ["PRODUCT_CODE_MISMATCH"],
          documentKeys: ["inconsistent-product-code-pfas"],
          description: "Wrong SKU evidence should be rejected or mapped before use.",
          failure: "Packet could rely on a nearby but wrong product code.",
          severity: "Critical",
          analystMinutes: 30,
          commercialRisk: 9,
          smallestCodeChange: "Require exact SKU match or explicit product-family mapping for product-specific document classes.",
        }),
      ],
    }),
    scenario({
      id: "mixed-manufacturer-distributor-documents",
      title: "Mixed manufacturer and distributor documents",
      clientSubmission: "SDS comes from the manufacturer while PFAS declaration comes from a distributor with unclear authority.",
      documents: [
        ...baselineDocuments("mixed-manufacturer-distributor-documents", { includePfas: false }),
        baseDocument({
          document_key: "mixed-manufacturer-distributor-pfas",
          title: "AS-42 PFAS Declaration - distributor copy",
          url: "https://validation.example.test/mixed-parties/AS-42-PFAS-Declaration-Distributor.pdf",
          document_type: "PFAS declaration",
          manufacturer: "ChemPoint Distribution LLC",
          issuer: "ChemPoint Distribution LLC",
          signed_by: "Technical Sales Representative",
          authority_confirmed: "Distributor upload",
          confidence: "Medium",
          confidence_score: 76,
          confidence_reason: "classified as PFAS declaration; direct PDF URL; matched product terms: AS-42; distributor-provided copy",
          notes: ["Distributor says it resells Acme material; no manufacturer authorization was provided."],
          timeline_group: "mixed-manufacturer-distributor-documents|PFAS|AS-42 declaration",
        }),
      ],
      expectedFindings: [
        finding({
          code: "SUPPLIER_MANUFACTURER_MISMATCH",
          acceptableIssueTypes: ["SUPPLIER_MANUFACTURER_MISMATCH"],
          documentKeys: ["mixed-manufacturer-distributor-pfas"],
          description: "Mixed-party evidence should require relationship confirmation.",
          failure: "Distributor evidence could be relied on as if issued by the manufacturer.",
          severity: "High",
          analystMinutes: 18,
          commercialRisk: 7,
          smallestCodeChange: "Add relationship confirmation as a required field for distributor-issued declarations.",
        }),
      ],
    }),
    scenario({
      id: "partial-upload",
      title: "Partial upload explicitly labeled partial",
      clientSubmission: "The client uploads a partial TDS package without appendices.",
      documents: [
        ...baselineDocuments("partial-upload"),
        baseDocument({
          document_key: "partial-upload-tds",
          title: "AS-42 TDS partial upload without appendices",
          url: "https://validation.example.test/partial-upload/AS-42-TDS-partial.pdf",
          document_type: "TDS",
          confidence: "Medium",
          confidence_score: 72,
          confidence_reason: "classified as TDS; direct PDF URL; matched product terms: AS-42; partial upload label",
          notes: ["Partial upload; appendices and test-condition pages were not included."],
          timeline_group: "partial-upload|TDS|AS-42 TDS",
        }),
      ],
      expectedFindings: [
        finding({
          code: "INCOMPLETE_DOCUMENT",
          acceptableIssueTypes: ["INCOMPLETE_DOCUMENT"],
          documentKeys: ["partial-upload-tds"],
          description: "Partial technical documents should be kept out of ready state.",
          failure: "Incomplete product evidence could pass through as ready.",
          severity: "High",
          analystMinutes: 22,
          commercialRisk: 7,
          smallestCodeChange: "Flag explicit partial/truncated/incomplete upload cues as reliability exceptions.",
        }),
      ],
    }),
    scenario({
      id: "obsolete-revision",
      title: "Obsolete SDS revision included with current record",
      clientSubmission: "Current and superseded SDS revisions are both present and named similarly.",
      documents: [
        ...baselineDocuments("obsolete-revision", { includeSds: false }),
        baseDocument({
          document_key: "obsolete-revision-sds-old",
          title: "AS-42 Safety Data Sheet Rev 2019",
          url: "https://validation.example.test/obsolete/AS-42-SDS-2019.pdf",
          document_type: "SDS",
          revision_date: "2019-07-01",
          confidence: "Medium",
          confidence_score: 74,
          confidence_reason: "classified as SDS; direct PDF URL; matched product terms: AS-42; older revision",
          timeline_group: "obsolete-revision|SDS|AS-42 SDS",
          is_latest_revision: false,
          older_revision_count: 2,
        }),
        baseDocument({
          document_key: "obsolete-revision-sds-current",
          title: "AS-42 Safety Data Sheet Rev 2026",
          url: "https://validation.example.test/obsolete/AS-42-SDS-2026.pdf",
          document_type: "SDS",
          revision_date: "2026-04-20",
          confidence_reason: "classified as SDS; direct PDF URL; matched product terms: AS-42; current revision",
          timeline_group: "obsolete-revision|SDS|AS-42 SDS",
          is_latest_revision: true,
          older_revision_count: 2,
        }),
      ],
      expectedFindings: [
        finding({
          code: "OBSOLETE_REVISION",
          acceptableIssueTypes: ["OBSOLETE_REVISION"],
          documentKeys: ["obsolete-revision-sds-old"],
          description: "Superseded SDS should be segregated from current evidence.",
          failure: "Analyst might rely on obsolete hazard/composition language.",
          severity: "High",
          analystMinutes: 20,
          commercialRisk: 8,
          smallestCodeChange: "Retain revision grouping and demote older records until the current applicable revision is selected.",
        }),
      ],
    }),
    scenario({
      id: "renamed-file-lost-classification",
      title: "Renamed file hides PFAS document type",
      clientSubmission: "Client renames a product-specific PFAS declaration to final-signed.pdf before upload.",
      documents: [
        ...baselineDocuments("renamed-file-lost-classification", { includePfas: false }),
        baseDocument({
          document_key: "renamed-file-final-signed",
          title: "final-signed.pdf",
          url: "https://validation.example.test/renamed/final-signed.pdf",
          document_type: "Technical document",
          confidence_reason: "client upload; extracted text references AS-42, PFAS declaration, signed manufacturer statement, and current revision",
          notes: ["Extracted body says AS-42 PFAS declaration signed by Acme Advanced Coatings on 2026-05-12."],
          timeline_group: "renamed-file-lost-classification|client upload|final signed",
        }),
      ],
      expectedCategories: {
        "renamed-file-final-signed": "PFAS",
      },
      expectedReadyWithoutEscalation: true,
      expectedFindings: [],
    }),
    scenario({
      id: "image-only-sds",
      title: "Image-only SDS PDF",
      clientSubmission: "A camera-scanned SDS PDF has image pages and no parsed safety data text.",
      documents: [
        ...baselineDocuments("image-only-sds", { includeSds: false }),
        baseDocument({
          document_key: "image-only-sds-doc",
          title: "AS-42 Safety Data Sheet - camera scan",
          url: "https://validation.example.test/image-only-sds/AS-42-SDS-camera-scan.pdf",
          document_type: "SDS",
          confidence_reason: "classified as SDS; direct PDF URL; matched product terms: AS-42; supplier-provided camera scan",
          notes: ["Camera-scanned PDF; all pages are embedded images; no parsed section text was captured."],
          timeline_group: "image-only-sds|SDS|AS-42 camera scan",
        }),
      ],
      expectedFindings: [
        finding({
          code: "IMAGE_ONLY_SDS_WITHOUT_TEXT",
          documentKeys: ["image-only-sds-doc"],
          description: "Image-only SDS needs OCR or human inspection before it can support source-indexed packet statements.",
          failure: "Engine can rely on SDS metadata while section content is unreadable to automation.",
          severity: "Critical",
          analystMinutes: 35,
          commercialRisk: 10,
          smallestCodeChange: "Add document-content readability metrics and require OCR completion for SDS/PFAS documents before ready state.",
        }),
      ],
    }),
  ];
}

function observedIssueTypes({ reliabilityModel, expertModel }) {
  const types = new Set();
  for (const exception of reliabilityModel.exceptions) {
    for (const type of exception.issue_types) types.add(type);
  }
  for (const item of expertModel.items) {
    types.add(item.issue_type);
  }
  return types;
}

function findingDetected(findingRecord, issueTypes) {
  const acceptable = findingRecord.acceptableIssueTypes?.length > 0
    ? findingRecord.acceptableIssueTypes
    : [findingRecord.code];
  return acceptable.some((type) => issueTypes.has(type));
}

function reliabilityRecordsByKey(model) {
  return new Map(model.documents.map((record) => [record.document_key, record]));
}

function sourceDocumentsByKey(documents) {
  return new Map(documents.map((document) => [documentKey(document), document]));
}

function resultRecord({
  recordType,
  scenarioRecord,
  issueCode,
  severity,
  description,
  affectedDocuments,
  additionalAnalystMinutes,
  smallestCodeChange,
  commercialRisk,
  evidence = {},
}) {
  return {
    record_type: recordType,
    scenario_id: scenarioRecord.id,
    scenario_title: scenarioRecord.title,
    issue_code: issueCode,
    severity,
    description,
    affected_documents: affectedDocuments,
    additional_analyst_minutes: additionalAnalystMinutes,
    smallest_code_change: smallestCodeChange,
    commercial_risk: commercialRisk,
    evidence,
  };
}

function evaluateExpectedFindings({ scenarioRecord, reliabilityModel, expertModel }) {
  const issueTypes = observedIssueTypes({ reliabilityModel, expertModel });
  const reliabilityByKey = reliabilityRecordsByKey(reliabilityModel);
  const missedEvidence = [];
  const falseConfidence = [];

  for (const expected of scenarioRecord.expectedFindings) {
    const detected = findingDetected(expected, issueTypes);
    if (detected) continue;

    missedEvidence.push(resultRecord({
      recordType: "missed_evidence",
      scenarioRecord,
      issueCode: expected.code,
      severity: expected.severity,
      description: expected.failure,
      affectedDocuments: expected.documentKeys,
      additionalAnalystMinutes: expected.analystMinutes,
      smallestCodeChange: expected.smallestCodeChange,
      commercialRisk: expected.commercialRisk,
      evidence: {
        expected_detection: expected.description,
        observed_issue_types: [...issueTypes].sort(),
      },
    }));

    for (const key of expected.documentKeys) {
      const reliability = reliabilityByKey.get(key);
      if (!reliability || !reliability.ready_for_reliance) continue;
      falseConfidence.push(resultRecord({
        recordType: "false_confidence",
        scenarioRecord,
        issueCode: `FALSE_CONFIDENCE_${expected.code}`,
        severity: expected.severity,
        description: `Document was marked ready for reliance with score ${reliability.reliability_score} despite unresolved issue ${expected.code}.`,
        affectedDocuments: [key],
        additionalAnalystMinutes: Math.ceil(expected.analystMinutes * 0.6),
        smallestCodeChange: expected.smallestCodeChange,
        commercialRisk: expected.commercialRisk,
        evidence: {
          reliability_score: reliability.reliability_score,
          ready_for_reliance: reliability.ready_for_reliance,
          dimensions: reliability.dimensions,
        },
      }));
    }
  }

  return { missedEvidence, falseConfidence };
}

function evaluateClassifications({ scenarioRecord, reliabilityModel }) {
  const recordsByKey = reliabilityRecordsByKey(reliabilityModel);
  const sourceByKey = sourceDocumentsByKey(scenarioRecord.documents);
  const incorrectClassifications = [];

  for (const [key, expectedCategory] of Object.entries(scenarioRecord.expectedCategories || {})) {
    const source = sourceByKey.get(key);
    const reliability = recordsByKey.get(key);
    const actualCategory = reliability?.category || (source ? getCategory(source) : "Unknown");
    if (actualCategory === expectedCategory) continue;

    incorrectClassifications.push(resultRecord({
      recordType: "incorrect_classification",
      scenarioRecord,
      issueCode: "DOCUMENT_CATEGORY_MISCLASSIFIED",
      severity: "High",
      description: `Expected ${expectedCategory} but production classifier produced ${actualCategory}.`,
      affectedDocuments: [key],
      additionalAnalystMinutes: 18,
      smallestCodeChange: "Extend document category classification beyond title/url/document_type into extracted text, notes, and confidence rationale.",
      commercialRisk: 8,
      evidence: {
        expected_category: expectedCategory,
        actual_category: actualCategory,
        source_title: source?.title || "Unknown",
        source_document_type: source?.document_type || "Unknown",
      },
    }));
  }

  return incorrectClassifications;
}

function evaluateUnnecessaryExpertEscalation({ scenarioRecord, expertModel, supplierModel }) {
  const records = [];
  if (!scenarioRecord.expectedReadyWithoutEscalation) return records;

  if (expertModel.open_exception_items > 0) {
    records.push(resultRecord({
      recordType: "unnecessary_expert_escalation",
      scenarioRecord,
      issueCode: "UNNECESSARY_EXPERT_ESCALATION",
      severity: "Medium",
      description: "Scenario contains enough product-specific source cues for automation-safe classification, but the expert console still opened exceptions.",
      affectedDocuments: expertModel.openItems.flatMap((item) => item.related_document_keys || []),
      additionalAnalystMinutes: 10,
      smallestCodeChange: "Fix the upstream classification miss so exception routing sees the uploaded evidence before marking PFAS missing.",
      commercialRisk: 5,
      evidence: {
        open_exception_items: expertModel.open_exception_items,
        issue_types: expertModel.openItems.map((item) => item.issue_type),
      },
    }));
  }

  if (supplierModel.request_count > 0) {
    records.push(resultRecord({
      recordType: "unnecessary_supplier_request",
      scenarioRecord,
      issueCode: "UNNECESSARY_SUPPLIER_REQUEST",
      severity: "Medium",
      description: "Supplier request was generated for a gap that should have been closed by the uploaded renamed file.",
      affectedDocuments: supplierModel.requests.flatMap((request) => request.originating_gaps || []),
      additionalAnalystMinutes: 12,
      smallestCodeChange: "Use content-based classification before supplier-request generation so renamed but sufficient uploads close the right gap.",
      commercialRisk: 6,
      evidence: {
        request_count: supplierModel.request_count,
        request_topics: supplierModel.requests.map((request) => request.request_topic),
      },
    }));
  }

  return records;
}

function buildScenarioScore(records) {
  const deduction = records.reduce((total, record) => {
    const severityDeduction = SEVERITY_DEDUCTION[record.severity] || SEVERITY_DEDUCTION.Medium;
    const typeDeduction = record.record_type === "false_confidence"
      ? 18
      : record.record_type === "incorrect_classification"
        ? 14
        : record.record_type.includes("unnecessary")
          ? 8
          : 0;
    return total + severityDeduction + typeDeduction;
  }, 0);
  return clampScore(100 - deduction);
}

function runProductionWorkflow(scenarioRecord) {
  const summary = buildSummary(scenarioRecord.documents);
  const packetModel = buildPacketModel({
    documents: scenarioRecord.documents,
    summary,
    query: scenarioRecord.query,
    generatedAt: scenarioRecord.generated_at,
  });
  const reliabilityModel = buildEvidenceReliabilityModel({
    documents: scenarioRecord.documents,
    query: scenarioRecord.query,
    generatedAt: scenarioRecord.generated_at,
  });
  const expertModel = buildExpertReviewModel({
    documents: scenarioRecord.documents,
    summary,
    query: scenarioRecord.query,
    session: {},
    generatedAt: scenarioRecord.generated_at,
  });
  const supplierModel = buildSupplierRequestModel({
    documents: scenarioRecord.documents,
    summary,
    query: scenarioRecord.query,
    session: {},
    generatedAt: scenarioRecord.generated_at,
  });
  const responseTrackerModel = buildResponseTrackerModel({
    supplierRequests: supplierModel,
    emailDraftsText: "",
    session: {},
    query: scenarioRecord.query,
    expertReviewModel: expertModel,
    missingDocumentationRegister: [],
  });

  return {
    summary,
    packetModel,
    reliabilityModel,
    expertModel,
    supplierModel,
    responseTrackerModel,
  };
}

function runScenario(scenarioRecord) {
  const workflow = runProductionWorkflow(scenarioRecord);
  const expected = evaluateExpectedFindings({
    scenarioRecord,
    reliabilityModel: workflow.reliabilityModel,
    expertModel: workflow.expertModel,
  });
  const incorrectClassifications = evaluateClassifications({
    scenarioRecord,
    reliabilityModel: workflow.reliabilityModel,
  });
  const unnecessaryExpertEscalation = evaluateUnnecessaryExpertEscalation({
    scenarioRecord,
    expertModel: workflow.expertModel,
    supplierModel: workflow.supplierModel,
  });
  const failureRecords = [
    ...expected.missedEvidence,
    ...expected.falseConfidence,
    ...incorrectClassifications,
    ...unnecessaryExpertEscalation,
  ];
  const additionalAnalystMinutes = failureRecords.reduce((total, record) => total + record.additional_analyst_minutes, 0);

  return {
    scenario_id: scenarioRecord.id,
    scenario_title: scenarioRecord.title,
    client_submission: scenarioRecord.clientSubmission,
    document_count: scenarioRecord.documents.length,
    production_engine_observations: {
      packet_sections: workflow.packetModel.sections.length,
      reliability_exception_count: workflow.reliabilityModel.exception_count,
      ready_document_count: workflow.reliabilityModel.ready_document_count,
      expert_open_exception_items: workflow.expertModel.open_exception_items,
      supplier_request_count: workflow.supplierModel.request_count,
      response_tracker_request_count: workflow.responseTrackerModel.request_count,
      packet_readiness: workflow.summary.estimated_packet_readiness,
    },
    failures: failureRecords,
    missed_evidence: expected.missedEvidence,
    false_confidence: expected.falseConfidence,
    incorrect_classifications: incorrectClassifications,
    unnecessary_expert_escalation: unnecessaryExpertEscalation,
    additional_analyst_minutes: additionalAnalystMinutes,
    smallest_code_changes: [...new Set(failureRecords.map((record) => record.smallest_code_change))],
    scenario_score: buildScenarioScore(failureRecords),
    expected_findings: scenarioRecord.expectedFindings.map((expectedFinding) => ({
      code: expectedFinding.code,
      severity: expectedFinding.severity,
      description: expectedFinding.description,
      acceptable_issue_types: expectedFinding.acceptableIssueTypes,
      affected_documents: expectedFinding.documentKeys,
    })),
    observed_issue_types: [...observedIssueTypes({
      reliabilityModel: workflow.reliabilityModel,
      expertModel: workflow.expertModel,
    })].sort(),
  };
}

function highestSeverity(current, incoming) {
  if (!current) return incoming;
  return (SEVERITY_RANK[incoming] ?? 9) < (SEVERITY_RANK[current] ?? 9) ? incoming : current;
}

function aggregateFailureModes(scenarioResults) {
  const modes = new Map();
  for (const result of scenarioResults) {
    for (const record of result.failures) {
      const key = record.issue_code.startsWith("FALSE_CONFIDENCE_")
        ? record.issue_code.replace("FALSE_CONFIDENCE_", "")
        : record.issue_code;
      if (!modes.has(key)) {
        modes.set(key, {
          issue_code: key,
          severity: record.severity,
          occurrence_count: 0,
          false_confidence_count: 0,
          record_types: [],
          affected_scenarios: [],
          additional_analyst_minutes: 0,
          commercial_risk: 0,
          description: record.description,
          smallest_code_change: record.smallest_code_change,
        });
      }
      const mode = modes.get(key);
      mode.severity = highestSeverity(mode.severity, record.severity);
      mode.occurrence_count += 1;
      if (record.record_type === "false_confidence") mode.false_confidence_count += 1;
      mode.record_types.push(record.record_type);
      mode.affected_scenarios.push(record.scenario_id);
      mode.additional_analyst_minutes += record.additional_analyst_minutes;
      mode.commercial_risk = Math.max(mode.commercial_risk, record.commercial_risk);
    }
  }

  return [...modes.values()]
    .map((mode) => ({
      ...mode,
      record_types: [...new Set(mode.record_types)],
      affected_scenarios: [...new Set(mode.affected_scenarios)],
    }))
    .sort((a, b) => (
      (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9) ||
      b.commercial_risk - a.commercial_risk ||
      b.occurrence_count - a.occurrence_count ||
      a.issue_code.localeCompare(b.issue_code)
    ))
    .slice(0, MAX_TOP_FAILURE_MODES);
}

function productionReadinessScore(scenarioResults) {
  if (scenarioResults.length === 0) return 0;
  const averageScenarioScore = scenarioResults.reduce((total, result) => total + result.scenario_score, 0) / scenarioResults.length;
  const falseConfidenceCount = scenarioResults.reduce((total, result) => total + result.false_confidence.length, 0);
  const missedEvidenceCount = scenarioResults.reduce((total, result) => total + result.missed_evidence.length, 0);
  const incorrectClassificationCount = scenarioResults.reduce((total, result) => total + result.incorrect_classifications.length, 0);
  const hiddenRiskPenalty = Math.min(
    12,
    falseConfidenceCount * 1.5 + missedEvidenceCount * 0.75 + incorrectClassificationCount * 1.5,
  );
  return clampScore(averageScenarioScore - hiddenRiskPenalty);
}

function scenarioSamples(scenarios) {
  return scenarios.map((scenarioRecord) => ({
    scenario_id: scenarioRecord.id,
    scenario_title: scenarioRecord.title,
    query: scenarioRecord.query,
    client_submission: scenarioRecord.clientSubmission,
    documents: scenarioRecord.documents,
    expected_findings: scenarioRecord.expectedFindings,
    expected_categories: scenarioRecord.expectedCategories,
  }));
}

export function buildProductionReadinessReport({ scenarios = buildValidationScenarios() } = {}) {
  const scenarioResults = scenarios.map(runScenario);
  const topFailureModes = aggregateFailureModes(scenarioResults);
  const totalAdditionalAnalystMinutes = scenarioResults.reduce((total, result) => total + result.additional_analyst_minutes, 0);
  const score = productionReadinessScore(scenarioResults);
  const greatestCommercialRisk = topFailureModes[0] || null;

  return {
    generated_at: new Date().toISOString(),
    workflow_under_test: [
      "Discovery Engine",
      "Analyst Workbench",
      "Packet Auto-Assembly",
      "Expert Review Console",
      "Supplier Request Generator",
      "External Response Tracker",
      "Evidence Reliability Engine",
    ],
    current_measured_workflow: CURRENT_WORKFLOW,
    validation_scope: {
      scenario_count: scenarioResults.length,
      purpose: "Find production workflow failures before a real client does; this harness intentionally does not optimize production behavior.",
      scenarios: scenarios.map((scenarioRecord) => scenarioRecord.title),
    },
    production_readiness_score: score,
    score_interpretation: score >= 85
      ? "Strong, but still validate with real client data."
      : score >= 70
        ? "Promising but not production-proven."
        : score >= 55
          ? "Caution: high-risk evidence quality failures remain."
          : "Not production-ready without reliability fixes.",
    total_additional_analyst_minutes: totalAdditionalAnalystMinutes,
    estimated_worst_case_analyst_rework_hours: Number((totalAdditionalAnalystMinutes / 60).toFixed(1)),
    top_failure_modes: topFailureModes,
    greatest_commercial_risk: greatestCommercialRisk,
    scenario_results: scenarioResults,
    generated_sample_data: scenarioSamples(scenarios),
  };
}

function flattenFailureRecords(report) {
  return report.scenario_results.flatMap((result) => result.failures);
}

function renderMarkdownTable(headers, rows) {
  const escape = (value) => normalize(value).replace(/\|/g, "\\|");
  const header = `| ${headers.map(escape).join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((headerName) => escape(row[headerName])).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

export function renderProductionReadinessMarkdown(report) {
  const scenarioRows = report.scenario_results.map((result) => ({
    Scenario: result.scenario_title,
    Score: result.scenario_score,
    Failures: result.failures.length,
    "Additional analyst time": hours(result.additional_analyst_minutes),
    "Smallest useful change": result.smallest_code_changes[0] || "No change indicated by this scenario.",
  }));
  const failureRows = report.top_failure_modes.map((mode, index) => ({
    Rank: index + 1,
    Severity: mode.severity,
    Issue: mode.issue_code,
    Occurrences: mode.occurrence_count,
    Scenarios: mode.affected_scenarios.join("; "),
    "Smallest useful change": mode.smallest_code_change,
  }));

  return [
    "# Production Readiness Validation Report",
    "",
    `Production Readiness Score: ${report.production_readiness_score}/100`,
    `Interpretation: ${report.score_interpretation}`,
    `Current measured workflow: analyst ${hours(report.current_measured_workflow.analyst_minutes)}, expert ${hours(report.current_measured_workflow.expert_minutes)}, total ${hours(report.current_measured_workflow.total_minutes)}`,
    `Estimated worst-case analyst rework uncovered by harness: ${hours(report.total_additional_analyst_minutes)}`,
    "",
    "## Top Failure Modes",
    "",
    failureRows.length > 0
      ? renderMarkdownTable(["Rank", "Severity", "Issue", "Occurrences", "Scenarios", "Smallest useful change"], failureRows)
      : "No failure modes were detected by this harness run.",
    "",
    "## Scenario Results",
    "",
    renderMarkdownTable(["Scenario", "Score", "Failures", "Additional analyst time", "Smallest useful change"], scenarioRows),
    "",
    "## Greatest Commercial Risk",
    "",
    report.greatest_commercial_risk
      ? `${report.greatest_commercial_risk.issue_code}: ${report.greatest_commercial_risk.description}`
      : "No greatest risk was identified.",
    "",
  ].join("\n");
}

export function renderProductionReadinessCsv(report) {
  const headers = [
    "record_type",
    "scenario_id",
    "scenario_title",
    "issue_code",
    "severity",
    "description",
    "affected_documents",
    "additional_analyst_minutes",
    "smallest_code_change",
    "commercial_risk",
  ];
  const rows = flattenFailureRecords(report).map((record) => headers
    .map((header) => csvEscape(record[header]))
    .join(","));
  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}

export async function writeProductionReadinessExports({ exportDir, scenarios } = {}) {
  if (!exportDir) {
    throw new Error("exportDir is required");
  }
  await mkdir(exportDir, { recursive: true });
  const report = buildProductionReadinessReport({ scenarios });
  const reportJsonPath = path.join(exportDir, "production-readiness-report.json");
  const reportMarkdownPath = path.join(exportDir, "production-readiness-report.md");
  const failuresCsvPath = path.join(exportDir, "production-readiness-findings.csv");
  const samplesJsonPath = path.join(exportDir, "production-readiness-sample-data.json");

  await writeFile(reportJsonPath, JSON.stringify(report, null, 2));
  await writeFile(reportMarkdownPath, renderProductionReadinessMarkdown(report));
  await writeFile(failuresCsvPath, renderProductionReadinessCsv(report));
  await writeFile(samplesJsonPath, JSON.stringify(report.generated_sample_data, null, 2));

  return {
    report,
    reportJsonPath,
    reportMarkdownPath,
    failuresCsvPath,
    samplesJsonPath,
  };
}

export function formatProductionReadinessSummary(reportOrExports) {
  const report = reportOrExports.report || reportOrExports;
  const greatestRisk = report.greatest_commercial_risk?.issue_code || "None";
  return [
    "Production Readiness Validation",
    "-------------------------------",
    `Scenarios run:             ${report.validation_scope.scenario_count}`,
    `Readiness score:           ${report.production_readiness_score}/100`,
    `Top failure modes:         ${report.top_failure_modes.length}`,
    `Additional analyst rework: ${hours(report.total_additional_analyst_minutes)}`,
    `Greatest commercial risk:  ${greatestRisk}`,
  ].join("\n");
}

export { buildValidationScenarios };
