import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About Liberty Tree PFAS Evidence Engagements",
  description:
    "Liberty Tree helps manufacturers organize, validate, and document PFAS evidence for customer documentation requests.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">About Liberty Tree</p>
          <h1>PFAS documentation requests need a clear evidence record.</h1>
          <p>
            Liberty Tree helps manufacturers turn customer PFAS requests,
            product lists, SDS/TDS files, supplier declarations, and public
            records into human-reviewed evidence packages.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell content-grid">
          <div className="content-main rich-text">
            <h2>What guides the work</h2>
            <p>
              A customer request usually arrives before the documentation is
              ready. Files may sit with quality, sales, suppliers, distributors,
              shared drives, and old customer submissions. Liberty Tree brings
              those materials into one source-indexed record.
            </p>
            <p>
              The focus is deliberately bounded: organize the record, validate
              sources, identify missing evidence, prepare supplier requests, and
              avoid unsupported claims.
            </p>

            <h2>How Liberty Tree works</h2>
            <p>
              Engagements are structured around fixed scopes, defined inputs,
              and clear deliverables. Every packet statement is tied to a
              source, unknowns remain visible, and exceptions receive human
              review before delivery.
            </p>
            <p>
              Liberty Tree does not perform laboratory testing, certify
              compliance, or provide legal opinions. The value is in helping
              teams create a better evidence record for the reviewers who need
              to evaluate it.
            </p>
          </div>

          <aside className="quiet-card self-start">
            <h3>Firm principles</h3>
            <ul className="mt-4 grid gap-3">
              <li>Source-indexed evidence and clear traceability</li>
              <li>Human-reviewed packets and exception handling</li>
              <li>Missing documentation called out plainly</li>
              <li>Fixed-price engagements starting at $7,500</li>
              <li>Careful boundaries around testing, certification, and law</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Engagement model"
            title="Fixed-price PFAS evidence engagements for manufacturers."
          >
            Begin with the customer request, product list, supplier count,
            deadline, and documents already available.
          </SectionHeading>
          <div className="shrink-0">
            <ButtonLink href="/start-pfas-engagement">
              Start a PFAS Evidence Engagement
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
