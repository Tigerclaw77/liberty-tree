import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustIcon } from "@/components/TrustIcon";

export const metadata: Metadata = {
  title: "Boutique Compliance Evidence Services",
  description:
    "Liberty Tree Compliance helps manufacturers assemble audit-ready documentation for emerging regulatory requirements, beginning with PFAS evidence packages.",
  alternates: {
    canonical: "/",
  },
};

const deliveryItems = [
  {
    title: "Document intake structure",
    body: "A defined request list, clean source handling, and a practical framework for collecting supplier, product, and customer-request materials.",
  },
  {
    title: "Source-indexed evidence",
    body: "Documentation organized so each summary, matrix entry, and noted gap can be traced back to the underlying source material.",
  },
  {
    title: "Gap identification",
    body: "A concise view of missing, stale, inconsistent, or unclear documentation that may require follow-up before a customer or audit response.",
  },
  {
    title: "Human-reviewed deliverables",
    body: "Fixed-scope packets assembled with careful review, restrained language, and a focus on defensible documentation rather than unsupported conclusions.",
  },
];

const trustPillars = [
  {
    icon: "documentation",
    title: "DOCUMENTATION FIRST",
    body: "We organize the documentation auditors and customers request.",
  },
  {
    icon: "source",
    title: "SOURCE-INDEXED",
    body: "Every conclusion is traceable to supporting documentation.",
  },
  {
    icon: "review",
    title: "HUMAN REVIEWED",
    body: "Each deliverable receives expert review before delivery.",
  },
  {
    icon: "confidential",
    title: "CONFIDENTIAL",
    body: "Projects are handled discreetly and with strict confidentiality.",
  },
] as const;

const processSteps = [
  {
    title: "Scope the request",
    body: "We clarify the products, customer demands, documentation period, and deliverable format before collection begins.",
  },
  {
    title: "Collect the record",
    body: "Your team provides SDS sheets, supplier declarations, product lists, prior compliance files, and related request materials.",
  },
  {
    title: "Organize and review",
    body: "We build inventories, matrices, and evidence indexes while flagging missing or ambiguous documentation.",
  },
  {
    title: "Deliver the packet",
    body: "You receive a structured evidence package designed for internal review, customer response preparation, and audit readiness.",
  },
];

export default function Home() {
  return (
    <>
      <section className="site-shell home-hero grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="eyebrow">Evidence-first compliance documentation</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-normal leading-tight text-navy sm:text-6xl">
            Compliance evidence. Organized. Defensible. Delivered.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Liberty Tree Compliance helps manufacturers assemble audit-ready
            documentation for emerging regulatory requirements, beginning with
            PFAS evidence packages. We structure document collection, evidence
            organization, and gap identification so your team can respond from a
            clear record.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start-pfas-engagement">
              Start a PFAS Evidence Engagement
            </ButtonLink>
            <ButtonLink href="/pfas-evidence-packets" variant="secondary">
              View PFAS Packets
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
            eyebrow="The documentation burden"
            title="Regulatory responses increasingly depend on the quality of the record."
          >
            Manufacturers are often asked to respond quickly with evidence that
            lives across suppliers, product teams, shared drives, emails, and
            prior customer submissions.
          </SectionHeading>
          <div className="grid gap-5 text-base leading-8 text-muted">
            <p>
              PFAS and other emerging requirements create a practical problem
              before they create a legal one: teams must locate the right source
              documents, understand what each document says, identify what is
              missing, and prepare a response that does not overstate the record.
            </p>
            <p>
              Liberty Tree focuses on that evidence layer. We help teams move
              from scattered documentation to a disciplined packet that can be
              reviewed, updated, and used as the basis for careful next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell">
          <SectionHeading
            eyebrow="What Liberty Tree delivers"
            title="A structured record for high-stakes documentation requests."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {deliveryItems.map((item) => (
              <article className="quiet-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Initial offer"
              title="PFAS Evidence Packets for manufacturers."
            >
              A fixed-scope documentation package for teams that need a clearer
              view of PFAS-related product evidence, supplier support, and
              unresolved gaps.
            </SectionHeading>
            <div className="mt-8">
              <ButtonLink href="/start-pfas-engagement" variant="secondary">
                Start a PFAS Evidence Engagement
              </ButtonLink>
            </div>
          </div>
          <div className="quiet-card">
            <h3>Built for careful review</h3>
            <p>
              Each packet is designed to help your compliance team, counsel, and
              operations reviewers evaluate the available record. Liberty Tree
              does not certify compliance, provide legal advice, or guarantee
              regulatory outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Process"
            title="A clear path from scattered materials to organized evidence."
          />
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <article className="numbered-step" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Why Liberty Tree"
            title="Serious compliance work starts with disciplined evidence."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {[
              "Documentation-first process",
              "Source-indexed deliverables",
              "Confidential project handling",
              "Fixed-scope engagements",
              "Human-reviewed summaries",
              "Careful, non-certifying language",
            ].map((item) => (
              <div className="border-t border-[#d6cebf] pt-4" key={item}>
                <p className="font-serif text-xl text-navy">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Next step"
            title="Prepare the record before the request becomes urgent."
          >
            Start with a focused review of your products, documentation sources,
            and current PFAS evidence needs.
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
