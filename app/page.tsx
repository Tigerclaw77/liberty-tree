import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustIcon } from "@/components/TrustIcon";

export const metadata: Metadata = {
  title: "PFAS Evidence Packages for Customer Documentation Requests",
  description:
    "Liberty Tree helps manufacturers turn SDS, TDS, supplier declarations, product lists, and public records into source-indexed PFAS evidence packages.",
  alternates: {
    canonical: "/",
  },
};

const trustPillars = [
  {
    icon: "documentation",
    title: "FOR MANUFACTURERS",
    body: "Built for teams responding to customer PFAS documentation requests.",
  },
  {
    icon: "source",
    title: "SOURCE-INDEXED",
    body: "Every statement is tied to the document that supports it.",
  },
  {
    icon: "review",
    title: "HUMAN REVIEWED",
    body: "Exceptions and final packets receive expert review before delivery.",
  },
  {
    icon: "confidential",
    title: "NO ACCOUNT REQUIRED",
    body: "Each engagement uses a temporary case portal for status and files.",
  },
] as const;

const uploadItems = [
  "Customer PFAS request, questionnaire, or response template",
  "Product list, SKUs, part numbers, or product families in scope",
  "Existing SDS, TDS, test reports, and supplier declarations",
  "Supplier, manufacturer, and distributor names",
  "Notes about deadlines, known gaps, or prior customer responses",
];

const deliverables = [
  {
    title: "Executive Summary",
    body: "A plain-language summary of what the available evidence supports, what remains unknown, and what needs follow-up.",
  },
  {
    title: "Evidence Matrix",
    body: "A product-by-product view of documents, declarations, confidence, gaps, and exceptions requiring review.",
  },
  {
    title: "Source Index",
    body: "A traceable list of source documents, issuers, dates, links, document status, and review notes.",
  },
  {
    title: "Missing Documentation Register",
    body: "A focused list of unresolved gaps so unknowns stay visible instead of being buried in narrative text.",
  },
  {
    title: "Supplier Request Package",
    body: "Targeted request lists and email drafts for supplier, manufacturer, or customer evidence that is still missing.",
  },
  {
    title: "Human-Reviewed Final Evidence Package",
    body: "A final package reviewed for support, consistency, and careful non-certifying language before delivery.",
  },
];

const howItWorks = [
  "Upload what you already have.",
  "Liberty Tree discovers additional public evidence.",
  "Missing documentation is identified.",
  "Supplier requests are prepared.",
  "Experts review only exceptions.",
  "You receive a complete evidence package.",
];

const portalItems = [
  "Engagement status and progress timeline",
  "Documents received and still outstanding",
  "Supplier responses that still need follow-up",
  "Download area for final deliverables",
];

const boundaries = [
  "Laboratory testing",
  "Compliance certification",
  "Legal opinions",
];

const guarantees = [
  "Every statement is source-indexed.",
  "Every packet receives human review.",
  "Missing evidence is clearly identified.",
  "Unknowns remain unknown.",
];

export default function Home() {
  return (
    <>
      <section className="site-shell home-hero grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="eyebrow">PFAS evidence packages for manufacturers</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-normal leading-tight text-navy sm:text-6xl">
            Turn scattered PFAS documentation into an organized evidence
            package.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            When a customer asks for PFAS documentation, Liberty Tree organizes
            the records you already have, finds additional public evidence,
            identifies missing documents, prepares supplier requests, and
            delivers a source-indexed package your team can review and use.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start-pfas-engagement">
              Start a PFAS Evidence Engagement
            </ButtonLink>
            <ButtonLink href="/pfas-evidence-packets" variant="secondary">
              View Packet Deliverables
            </ButtonLink>
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/liberty-tree-five-lanterns-v2.png"
            alt="Engraved Liberty Tree illustration with five small hanging lanterns"
            width={1624}
            height={969}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="trust-band">
        <div className="site-shell grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar) => (
            <article className="trust-card" key={pillar.title}>
              <TrustIcon name={pillar.icon} />
              <h2>{pillar.title}</h2>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="What you send"
            title="Start with the documents and product list already on your desk."
          >
            The engagement is built for compliance, quality, operations, and
            sales teams that need a reliable answer to a customer PFAS
            documentation request.
          </SectionHeading>
          <div className="grid gap-4">
            {uploadItems.map((item) => (
              <div className="border-t border-[#d6cebf] pt-4" key={item}>
                <p className="font-serif text-xl text-navy">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell">
          <SectionHeading
            eyebrow="What you receive"
            title="Concrete deliverables, not a vague advisory memo."
          >
            The packet shows what is supported, where the support came from,
            what is missing, and which supplier requests should go out next.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map((item) => (
              <article className="quiet-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="How it works"
            title="A clear path from customer request to evidence package."
          />
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, index) => (
              <article className="numbered-step" key={step}>
                <span>{index + 1}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <SectionHeading
            eyebrow="Pricing"
            title="Fixed-price engagements starting at $7,500."
          >
            Final scope depends primarily on documentation complexity: number of
            SKUs, supplier count, document quality, missing evidence, and
            customer deadline pressure. Company size is not the main driver.
          </SectionHeading>
          <div className="quiet-card">
            <h3>What drives scope</h3>
            <ul className="mt-5 grid gap-3">
              <li>How many products, SKUs, or product families are in scope.</li>
              <li>Whether documents are product-specific or generic.</li>
              <li>How much supplier evidence is missing or conflicting.</li>
              <li>Whether public documents are available, current, and usable.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Case Portal"
            title="A temporary engagement workspace with no customer account required."
          >
            After intake, your team receives a secure case link for the current
            engagement. The portal is built for status visibility and file
            handoff, not a permanent software account.
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {portalItems.map((item) => (
              <article className="quiet-card" key={item}>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Boundaries"
              title="We organize, validate, and document evidence."
            >
              Liberty Tree does not make unsupported claims or replace the
              reviewers who must make business, technical, or legal decisions.
            </SectionHeading>
            <div className="mt-8 grid gap-4">
              {boundaries.map((item) => (
                <div className="border-t border-[#d6cebf] pt-4" key={item}>
                  <p className="font-serif text-xl text-navy">
                    We do not provide {item.toLowerCase()}.
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="What we guarantee"
              title="Clear evidence, clear limits, clear next steps."
            />
            <div className="mt-8 grid gap-4">
              {guarantees.map((item) => (
                <div className="border-t border-[#d6cebf] pt-4" key={item}>
                  <p className="font-serif text-xl text-navy">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Next step"
            title="Answer the PFAS request from a documented record."
          >
            Start with the customer request, the product list, and whatever
            SDS, TDS, supplier declarations, or prior responses you already
            have.
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
