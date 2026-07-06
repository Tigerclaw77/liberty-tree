import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "PFAS Evidence Packets",
  description:
    "Fixed-scope PFAS Evidence Packets for manufacturers that need organized, source-indexed documentation and clear gap identification.",
  alternates: {
    canonical: "/pfas-evidence-packets",
  },
};

const inputs = [
  "Safety Data Sheets and technical data sheets",
  "Supplier declarations and material statements",
  "Product lists, SKUs, bills of material, or part families",
  "Customer requests, questionnaires, and response templates",
  "Prior compliance documentation and related correspondence",
];

const outputs = [
  "Executive summary",
  "Product and document inventory",
  "Supplier evidence matrix",
  "Missing documentation list",
  "Risk and gap summary",
  "Source-indexed evidence binder",
];

export default function PfasEvidencePacketsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">PFAS Evidence Packets</p>
          <h1>Organized documentation for PFAS-related requests.</h1>
          <p>
            Liberty Tree assembles fixed-scope evidence packets for
            manufacturers that need a clearer, traceable view of available PFAS
            documentation before responding to customers, auditors, counsel, or
            internal leadership.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell content-grid">
          <div className="content-main rich-text">
            <h2>What a PFAS Evidence Packet is</h2>
            <p>
              A PFAS Evidence Packet is an organized documentation package that
              brings together product, supplier, and customer-request materials
              into a source-indexed record. It is intended to help your team
              understand what documentation exists, where it came from, what it
              supports, and what may still require follow-up.
            </p>
            <p>
              The packet is not a certification. It does not replace legal
              review, laboratory testing, or regulatory analysis. It is a
              readiness deliverable built around the documents your organization
              can provide.
            </p>

            <h2>Who it is for</h2>
            <p>
              PFAS Evidence Packets are designed for manufacturers facing
              customer documentation requests, supplier evidence collection,
              product portfolio reviews, acquisition diligence, or internal
              preparation for emerging PFAS obligations.
            </p>
            <p>
              The work is especially useful when evidence exists but is
              scattered across teams, inconsistent in format, or difficult to
              connect back to specific products and suppliers.
            </p>

            <h2>Typical inputs</h2>
            <ul>
              {inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>Typical outputs</h2>
            <ul>
              {outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className="quiet-card self-start">
            <h3>Clear scope, careful language</h3>
            <p>
              Liberty Tree organizes and reviews documentation for readiness
              purposes. We do not provide legal determinations, regulatory
              certification, or guarantees that a customer, auditor, regulator,
              or counterparty will accept a submission.
            </p>
            <div className="mt-6">
              <ButtonLink href="/contact">Request Consultation</ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Packet structure"
            title="Built to support internal review and disciplined follow-up."
          >
            The objective is not to create a louder claim. It is to create a
            cleaner record that shows what is known, what is supported, and what
            remains unresolved.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Traceable",
                body: "Each key summary and matrix entry is tied to source documentation so reviewers can verify the basis for the packet.",
              },
              {
                title: "Practical",
                body: "Deliverables are organized for compliance teams, operations leaders, customer response owners, and counsel.",
              },
              {
                title: "Bounded",
                body: "The engagement stays focused on evidence organization, documentation review, and gap identification.",
              },
            ].map((item) => (
              <article className="quiet-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
