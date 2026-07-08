"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildCaseSnapshot,
  caseStorageKey,
  type IntakeCaseInput,
  type UploadGroup,
  type UploadSummary,
} from "@/lib/case-portal";

const steps = [
  "Company",
  "Scope",
  "Documents",
  "Review",
] as const;

const uploadLabels: Array<{
  key: UploadGroup;
  label: string;
  helper: string;
  multiple?: boolean;
}> = [
  {
    key: "customerRequest",
    label: "Customer documentation request",
    helper: "Optional upload: questionnaires, email requests, portals exports, or response templates.",
    multiple: true,
  },
  {
    key: "productList",
    label: "Product list upload",
    helper: "Product list, SKU export, part family list, or scoped customer item list.",
  },
  {
    key: "sdsTds",
    label: "Existing SDS/TDS upload",
    helper: "Current safety data sheets, technical data sheets, or known alternates.",
    multiple: true,
  },
  {
    key: "declarations",
    label: "Existing declarations upload",
    helper: "PFAS, RoHS, REACH, TSCA, Prop 65, or supplier/manufacturer statements.",
    multiple: true,
  },
];

const emptyInput: IntakeCaseInput = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  productsInScope: "",
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
};

function randomHex(length: number) {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function generateCaseId() {
  return `LT-${new Date().getFullYear()}-${randomHex(6).toUpperCase()}`;
}

function generateToken() {
  return randomHex(48);
}

function summarizeFiles(files: FileList | null): UploadSummary[] {
  return Array.from(files ?? []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }));
}

function fileLabel(file: UploadSummary) {
  if (file.size >= 1_000_000) return `${file.name} - ${(file.size / 1_000_000).toFixed(1)} MB`;
  if (file.size >= 1_000) return `${file.name} - ${Math.ceil(file.size / 1_000)} KB`;
  return `${file.name} - ${file.size} bytes`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function IntakeFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<IntakeCaseInput>(emptyInput);
  const [attempted, setAttempted] = useState(false);

  const receivedFileCount = useMemo(
    () => Object.values(input.uploads).reduce((total, files) => total + files.length, 0),
    [input.uploads],
  );

  function updateField(field: keyof Omit<IntakeCaseInput, "uploads">, value: string) {
    setInput((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateUpload(group: UploadGroup, files: FileList | null) {
    setInput((current) => ({
      ...current,
      uploads: {
        ...current.uploads,
        [group]: summarizeFiles(files),
      },
    }));
  }

  function validStep(index: number) {
    if (index === 0) {
      return Boolean(input.company.trim() && input.contact.trim() && isValidEmail(input.email));
    }
    if (index === 1) {
      return Boolean(
        input.productsInScope.trim() &&
          input.skuCount.trim() &&
          input.supplierCount.trim() &&
          input.desiredCompletionDate.trim(),
      );
    }
    return true;
  }

  function advance() {
    setAttempted(true);
    if (!validStep(step)) return;
    setAttempted(false);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setAttempted(false);
    setStep((current) => Math.max(current - 1, 0));
  }

  function submit() {
    setAttempted(true);
    const firstInvalid = steps.findIndex((_, index) => !validStep(index));
    if (firstInvalid !== -1) {
      setStep(firstInvalid);
      return;
    }

    const token = generateToken();
    const snapshot = buildCaseSnapshot({
      caseId: generateCaseId(),
      token,
      intake: input,
      submittedAt: new Date().toISOString(),
    });

    window.localStorage.setItem(caseStorageKey(token), JSON.stringify(snapshot));
    window.localStorage.setItem("lt:last-case-token", token);
    router.push(`/case/${token}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="quiet-card self-start">
        <h2 className="font-serif text-2xl font-normal text-navy">
          Engagement intake
        </h2>
        <p>
          We organize and review documentation. We do not perform laboratory
          testing or provide legal determinations.
        </p>
        <ol className="mt-7 grid gap-3">
          {steps.map((label, index) => (
            <li
              className={`flex items-center gap-3 border px-4 py-3 text-sm ${
                step === index
                  ? "border-navy bg-buff-soft text-navy"
                  : "border-[#d8c9ad] bg-bone text-muted"
              }`}
              key={label}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center border border-buff bg-white font-serif text-xs text-brass">
                {index + 1}
              </span>
              <span aria-current={step === index ? "step" : undefined}>
                {label}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-6 text-muted">
          This intake records the scope and selected file names, then creates a
          temporary portal. Liberty Tree will confirm secure transfer before
          document review begins.
        </p>
      </aside>

      <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
        {step === 0 ? (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="company">
                Company
              </label>
              <input
                className="field-control"
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                value={input.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="contact">
                Contact
              </label>
              <input
                className="field-control"
                id="contact"
                name="contact"
                type="text"
                autoComplete="name"
                value={input.contact}
                onChange={(event) => updateField("contact", event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-navy" htmlFor="email">
                  Email
                </label>
                <input
                  className="field-control"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={input.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-navy" htmlFor="phone">
                  Phone optional
                </label>
                <input
                  className="field-control"
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={input.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="products">
                Products in scope
              </label>
              <textarea
                className="field-control min-h-36 resize-y"
                id="products"
                name="products"
                value={input.productsInScope}
                onChange={(event) =>
                  updateField("productsInScope", event.target.value)
                }
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-navy" htmlFor="skus">
                  Number of SKUs
                </label>
                <input
                  className="field-control"
                  id="skus"
                  name="skus"
                  min="1"
                  type="number"
                  value={input.skuCount}
                  onChange={(event) => updateField("skuCount", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-navy"
                  htmlFor="suppliers"
                >
                  Number of suppliers
                </label>
                <input
                  className="field-control"
                  id="suppliers"
                  name="suppliers"
                  min="0"
                  type="number"
                  value={input.supplierCount}
                  onChange={(event) =>
                    updateField("supplierCount", event.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-navy" htmlFor="due">
                  Desired completion date
                </label>
                <input
                  className="field-control"
                  id="due"
                  name="due"
                  type="date"
                  value={input.desiredCompletionDate}
                  onChange={(event) =>
                    updateField("desiredCompletionDate", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5">
            {uploadLabels.map((upload) => (
              <div className="grid gap-2 border border-[#d8c9ad] bg-bone p-4" key={upload.key}>
                <label
                  className="text-sm font-semibold text-navy"
                  htmlFor={upload.key}
                >
                  {upload.label}
                </label>
                <p className="text-xs leading-6 text-muted">{upload.helper}</p>
                <input
                  className="field-control bg-white"
                  id={upload.key}
                  name={upload.key}
                  type="file"
                  multiple={upload.multiple}
                  onChange={(event) => updateUpload(upload.key, event.target.files)}
                />
                {input.uploads[upload.key].length > 0 ? (
                  <ul className="grid gap-1 text-xs leading-6 text-muted">
                    {input.uploads[upload.key].map((file) => (
                      <li key={`${upload.key}-${file.name}`}>{fileLabel(file)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="notes">
                Notes
              </label>
              <textarea
                className="field-control min-h-36 resize-y"
                id="notes"
                name="notes"
                value={input.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
            <div className="quiet-card bg-bone shadow-none">
              <h3>Review before submission</h3>
              <dl className="mt-4 grid gap-3 text-sm leading-7 text-muted sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-navy">Company</dt>
                  <dd>{input.company || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">Contact</dt>
                  <dd>{input.contact || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">SKUs</dt>
                  <dd>{input.skuCount || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">Suppliers</dt>
                  <dd>{input.supplierCount || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">Desired date</dt>
                  <dd>{input.desiredCompletionDate || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">Files selected</dt>
                  <dd>{receivedFileCount}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}

        {attempted && !validStep(step) ? (
          <p className="border border-[#d8c9ad] bg-buff-soft px-4 py-3 text-sm text-navy">
            Please complete the required fields on this step before continuing.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[#d8c9ad] pt-6 sm:flex-row sm:justify-between">
          <button
            className="button-secondary"
            disabled={step === 0}
            type="button"
            onClick={back}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button className="button-primary" type="button" onClick={advance}>
              Continue
            </button>
          ) : (
            <button className="button-primary" type="button" onClick={submit}>
              Submit Intake
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
