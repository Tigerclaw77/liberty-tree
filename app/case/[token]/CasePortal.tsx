"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildPlaceholderCase,
  caseStatuses,
  caseStorageKey,
  type CaseSnapshot,
} from "@/lib/case-portal";

type CasePortalProps = {
  token: string;
};

function formatDate(value: string) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value: string) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function CasePortal({ token }: CasePortalProps) {
  const [caseSnapshot, setCaseSnapshot] = useState<CaseSnapshot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(caseStorageKey(token));
      if (stored) {
        try {
          setCaseSnapshot(JSON.parse(stored) as CaseSnapshot);
          return;
        } catch {
          setCaseSnapshot(buildPlaceholderCase(token));
          return;
        }
      }

      setCaseSnapshot(buildPlaceholderCase(token));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token]);

  const activeStatusIndex = useMemo(() => {
    if (!caseSnapshot) return 0;
    return Math.max(0, caseStatuses.indexOf(caseSnapshot.status));
  }, [caseSnapshot]);

  async function copyPortalLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!caseSnapshot) {
    return (
      <section className="section-band">
        <div className="site-shell">
          <div className="quiet-card">
            <h1 className="font-serif text-3xl font-normal text-navy">
              Loading case portal
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">Case portal</p>
          <h1>{caseSnapshot.caseId}</h1>
          <p>
            Secure token workspace for the PFAS evidence engagement. No
            production engine output is connected to this v1 portal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="button-primary" type="button" onClick={copyPortalLink}>
              Copy Portal Link
            </button>
            <span className="inline-flex min-h-12 items-center border border-[#d8c9ad] bg-white px-4 text-sm font-semibold text-navy">
              {copied ? "Link copied" : `Status: ${caseSnapshot.status}`}
            </span>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="quiet-card self-start">
            <h2 className="font-serif text-2xl font-normal text-navy">
              Case status
            </h2>
            <dl className="mt-5 grid gap-4 text-sm leading-7 text-muted">
              <div>
                <dt className="font-semibold text-navy">Company</dt>
                <dd>{caseSnapshot.intake.company}</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Contact</dt>
                <dd>{caseSnapshot.intake.contact}</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Submitted</dt>
                <dd>{formatDateTime(caseSnapshot.submittedAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Last update</dt>
                <dd>{formatDateTime(caseSnapshot.lastUpdate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Desired completion</dt>
                <dd>{formatDate(caseSnapshot.intake.desiredCompletionDate)}</dd>
              </div>
            </dl>
            <p className="mt-6 border-l border-[#d8c9ad] pl-4 text-xs leading-6 text-muted">
              When your engagement is complete, this portal will remain
              available for download for a limited period before being archived.
            </p>
          </aside>

          <div className="grid gap-8">
            <section className="quiet-card">
              <h2 className="font-serif text-2xl font-normal text-navy">
                Progress timeline
              </h2>
              <ol className="mt-6 grid gap-3 md:grid-cols-3">
                {caseStatuses.map((status, index) => {
                  const state =
                    index < activeStatusIndex
                      ? "Complete"
                      : index === activeStatusIndex
                        ? "Current"
                        : "Pending";
                  return (
                    <li
                      className={`border px-4 py-4 ${
                        index <= activeStatusIndex
                          ? "border-navy bg-buff-soft"
                          : "border-[#d8c9ad] bg-bone"
                      }`}
                      key={status}
                    >
                      <p className="text-xs font-semibold uppercase text-brass">
                        {state}
                      </p>
                      <p className="mt-2 font-serif text-lg text-navy">{status}</p>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="quiet-card">
              <h2 className="font-serif text-2xl font-normal text-navy">
                Documents received
              </h2>
              <div className="mt-5 grid gap-3">
                {caseSnapshot.documentsReceived.length > 0 ? (
                  caseSnapshot.documentsReceived.map((document) => (
                    <div
                      className="grid gap-1 border border-[#d8c9ad] bg-bone p-4 sm:grid-cols-[1fr_auto]"
                      key={document.id}
                    >
                      <div>
                        <p className="font-semibold text-navy">{document.title}</p>
                        <p className="text-sm leading-6 text-muted">{document.group}</p>
                      </div>
                      <p className="text-sm font-semibold text-sage">
                        {document.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-muted">
                    No documents are registered in this temporary portal yet.
                  </p>
                )}
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-2">
              <div className="quiet-card">
                <h2 className="font-serif text-2xl font-normal text-navy">
                  Outstanding requested documents
                </h2>
                <div className="mt-5 grid gap-3">
                  {caseSnapshot.outstandingDocuments.length > 0 ? (
                    caseSnapshot.outstandingDocuments.map((request) => (
                      <div className="border-t border-[#d8c9ad] pt-4" key={request.id}>
                        <p className="font-semibold text-navy">{request.item}</p>
                        <p className="text-sm leading-6 text-muted">
                          {request.owner} - {request.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-muted">
                      No client document requests are outstanding from intake.
                    </p>
                  )}
                </div>
              </div>

              <div className="quiet-card">
                <h2 className="font-serif text-2xl font-normal text-navy">
                  Outstanding supplier requests
                </h2>
                <div className="mt-5 grid gap-3">
                  {caseSnapshot.outstandingSupplierRequests.map((request) => (
                    <div className="border-t border-[#d8c9ad] pt-4" key={request.id}>
                      <p className="font-semibold text-navy">{request.item}</p>
                      <p className="text-sm leading-6 text-muted">
                        {request.owner} - {request.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-2">
              <div className="quiet-card">
                <h2 className="font-serif text-2xl font-normal text-navy">
                  Downloads
                </h2>
                <div className="mt-5 grid gap-3">
                  {caseSnapshot.downloads.map((download) => (
                    <div className="border-t border-[#d8c9ad] pt-4" key={download.id}>
                      <p className="font-semibold text-navy">{download.item}</p>
                      <p className="text-sm leading-6 text-muted">
                        {download.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quiet-card">
                <h2 className="font-serif text-2xl font-normal text-navy">
                  Messages
                </h2>
                <div className="mt-5 grid gap-3">
                  {caseSnapshot.messages.map((message) => (
                    <div className="border-t border-[#d8c9ad] pt-4" key={message.id}>
                      <p className="font-semibold text-navy">{message.author}</p>
                      <p className="text-sm leading-7 text-muted">{message.body}</p>
                      <p className="mt-2 text-xs text-muted">
                        {formatDateTime(message.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
