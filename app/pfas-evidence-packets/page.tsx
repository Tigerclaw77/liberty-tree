import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "PFAS Evidence Packet Deliverables",
  description:
    "See what manufacturers receive in a Liberty Tree PFAS Evidence Packet: executive summary, evidence matrix, source index, gap register, and supplier requests.",
  alternates: {
    canonical: "/pfas-evidence-packets",
  },
};

const inputs = [
  "Customer PFAS requests, questionnaires, and response templates",
  "Safety Data Sheets, technical data sheets, and product data sheets",
  "Supplier declarations, manufacturer declarations, and material statements",
  "Product lists, SKUs, part numbers, bills of material, or product families",
  "Prior compliance files, correspondence, and evidence already collected",
];

const outputs = [
  "Executive Summary",
  "Document Inventory",
  "Evidence Matrix",
  "Source Index",
  "Missing Documentation Register",
  "Gap Summary",
  "Supplier Request Package",
  "Human-Reviewed Final Evidence Package",
];

const packetQualities = [
  {
    title: "Traceable",
    body: "Every packet statement is tied to a source document so reviewers can see the support behind it.",
  },
  {
    title: "Product-aware",
    body: "Generic declarations are separated from product-specific evidence, and SKU gaps remain visible.",
  },
  {
    title: "Bounded",
    body: "Unknown facts stay marked as unknown. Expert judgment is highlighted instead of guessed.",
  },
];

export default function PfasEvidencePacketsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">PFAS Evidence Packet Deliverables</p>
          <h1>
            Know what PFAS evidence you have for each product, and what still
            needs follow-up.
          </h1>
          <p>
            Liberty Tree assembles source-indexed PFAS evidence packages for
            manufacturers responding to customer documentation requests. The
            packet is built from your files, supplier records, and usable public
            evidence.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell content-grid">
          <div className="content-main rich-text">
            <h2>What a PFAS Evidence Packet is</h2>
            <p>
              A PFAS Evidence Packet is an organized documentation package for a
              defined product scope. It shows which documents exist, which
              products they support, which statements are source-backed, and
              which gaps still require supplier, manufacturer, or customer
              follow-up.
            </p>
            <p>
              The packet is not a certification, legal opinion, or laboratory
              result. It is a documented record that helps your team respond
              carefully when a customer asks for PFAS evidence.
            </p>

            <h2>Who it is for</h2>
            <p>
              PFAS Evidence Packets are built for manufacturing compliance
              managers, quality leaders, operations teams, sales teams handling
              customer documentation requests, and counsel reviewing the final
              response.
            </p>

            <h2>Typical uploads</h2>
            <ul>
              {inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>What you receive</h2>
            <ul>
              {outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>Pricing</h2>
            <p>
              Fixed-price engagements start at $7,500. Final scope depends
              primarily on documentation complexity: product count, supplier
              count, document quality, missing evidence, and response deadline.
            </p>
          </div>

          <aside className="quiet-card self-start">
            <h3>Clear limits</h3>
            <p>
              Liberty Tree organizes, validates, and documents evidence. We do
              not perform laboratory testing, certify compliance, provide legal
              opinions, or guarantee acceptance by a customer, auditor, agency,
              or other reviewer.
            </p>
            <div className="mt-6">
              <ButtonLink href="/start-pfas-engagement">
                Start a PFAS Evidence Engagement
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Packet structure"
            title="Built to support review without overstating the record."
          >
            The goal is a clearer record: what is known, what is supported, what
            conflicts, and what remains unresolved.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {packetQualities.map((item) => (
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
