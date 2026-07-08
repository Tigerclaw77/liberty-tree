export const caseStatuses = [
  "Submitted",
  "Discovery",
  "Waiting on Third Parties",
  "Expert Review",
  "Complete",
  "Archived",
] as const;

export type CaseStatus = (typeof caseStatuses)[number];

export type UploadGroup =
  | "customerRequest"
  | "productList"
  | "sdsTds"
  | "declarations";

export type UploadSummary = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type IntakeCaseInput = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  productsInScope: string;
  skuCount: string;
  supplierCount: string;
  desiredCompletionDate: string;
  notes: string;
  uploads: Record<UploadGroup, UploadSummary[]>;
};

export type PortalDocument = {
  id: string;
  title: string;
  group: string;
  status: "Received" | "Pending secure transfer";
};

export type PortalRequest = {
  id: string;
  item: string;
  owner: string;
  status: "Outstanding" | "Pending review" | "Not generated";
};

export type PortalMessage = {
  id: string;
  author: string;
  body: string;
  timestamp: string;
};

export type CaseSnapshot = {
  caseId: string;
  token: string;
  status: CaseStatus;
  submittedAt: string;
  lastUpdate: string;
  intake: IntakeCaseInput;
  documentsReceived: PortalDocument[];
  outstandingDocuments: PortalRequest[];
  outstandingSupplierRequests: PortalRequest[];
  downloads: PortalRequest[];
  messages: PortalMessage[];
};

export const caseStoragePrefix = "lt-case:";

export function caseStorageKey(token: string) {
  return `${caseStoragePrefix}${token}`;
}

function fileSizeLabel(size: number) {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
  if (size >= 1_000) return `${Math.ceil(size / 1_000)} KB`;
  return `${size} bytes`;
}

function uploadDocuments(input: IntakeCaseInput): PortalDocument[] {
  const groups: Array<[UploadGroup, string]> = [
    ["customerRequest", "Customer documentation request"],
    ["productList", "Product list"],
    ["sdsTds", "Existing SDS/TDS"],
    ["declarations", "Existing declarations"],
  ];

  return groups.flatMap(([key, label]) =>
    input.uploads[key].map((file, index) => ({
      id: `${key}-${index + 1}`,
      title: `${file.name} (${fileSizeLabel(file.size)})`,
      group: label,
      status: "Received" as const,
    })),
  );
}

function outstandingDocuments(input: IntakeCaseInput): PortalRequest[] {
  const requests: PortalRequest[] = [];
  if (input.uploads.productList.length === 0) {
    requests.push({
      id: "DOC-001",
      item: "Product list with SKU identifiers",
      owner: input.company || "Client",
      status: "Outstanding",
    });
  }
  if (input.uploads.sdsTds.length === 0) {
    requests.push({
      id: "DOC-002",
      item: "Current SDS/TDS files for products in scope",
      owner: input.company || "Client",
      status: "Outstanding",
    });
  }
  if (input.uploads.declarations.length === 0) {
    requests.push({
      id: "DOC-003",
      item: "Existing supplier or manufacturer declarations",
      owner: input.company || "Client",
      status: "Outstanding",
    });
  }

  return requests;
}

export function buildCaseSnapshot({
  caseId,
  token,
  intake,
  submittedAt,
}: {
  caseId: string;
  token: string;
  intake: IntakeCaseInput;
  submittedAt: string;
}): CaseSnapshot {
  const documentsReceived = uploadDocuments(intake);

  return {
    caseId,
    token,
    status: "Submitted",
    submittedAt,
    lastUpdate: submittedAt,
    intake,
    documentsReceived,
    outstandingDocuments: outstandingDocuments(intake),
    outstandingSupplierRequests: [
      {
        id: "SUP-001",
        item: "Supplier requests will appear after initial document review",
        owner: "Liberty Tree",
        status: "Not generated",
      },
    ],
    downloads: [
      {
        id: "DL-001",
        item: "Evidence packet downloads",
        owner: "Liberty Tree",
        status: "Pending review",
      },
    ],
    messages: [
      {
        id: "MSG-001",
        author: "Liberty Tree",
        body: "Intake received. Liberty Tree will review the scope and confirm next steps.",
        timestamp: submittedAt,
      },
    ],
  };
}

export function buildPlaceholderCase(token: string): CaseSnapshot {
  const now = new Date().toISOString();
  return buildCaseSnapshot({
    caseId: "LT-2026-PENDING",
    token,
    submittedAt: now,
    intake: {
      company: "Pending intake record",
      contact: "Pending",
      email: "Pending",
      phone: "",
      productsInScope: "Products in scope will appear after intake submission.",
      skuCount: "",
      supplierCount: "",
      desiredCompletionDate: "",
      notes: "",
      uploads: {
        customerRequest: [],
        productList: [],
        sdsTds: [],
        declarations: [],
      },
    },
  });
}
