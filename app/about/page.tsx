import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Liberty Tree Compliance is a documentation-first compliance evidence firm offering structured, source-indexed, human-reviewed deliverables.",
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
          <h1>A documentation-first compliance evidence firm.</h1>
          <p>
            Liberty Tree Compliance helps manufacturers prepare organized,
            source-indexed documentation for emerging compliance demands. The
            firm is built around disciplined intake, careful review, and
            deliverables that can be used for internal decision-making and
            response preparation.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell content-grid">
          <div className="content-main rich-text">
            <h2>What guides the work</h2>
            <p>
              Compliance documentation is often evaluated under pressure. A
              customer asks for support, an audit window approaches, or internal
              teams need a clear view of the evidence. Liberty Tree brings order
              to that moment by turning scattered materials into structured
              records.
            </p>
            <p>
              The focus is practical and deliberately bounded: organize the
              record, review documents for readiness, index sources, identify
              gaps, and avoid unsupported claims.
            </p>

            <h2>How Liberty Tree works</h2>
            <p>
              Projects are structured around fixed scopes, defined inputs, and
              clear deliverables. Source materials are handled confidentially,
              packet language is reviewed by humans, and findings are presented
              in a format designed for responsible follow-up.
            </p>
            <p>
              Liberty Tree does not certify compliance, provide legal advice, or
              guarantee regulatory outcomes. The value is in helping teams create
              a better evidence record for the reviewers who need to evaluate it.
            </p>
          </div>

          <aside className="quiet-card self-start">
            <h3>Firm principles</h3>
            <ul className="mt-4 grid gap-3">
              <li>Structured process from intake through delivery</li>
              <li>Source-indexed evidence and clear traceability</li>
              <li>Human-reviewed summaries and matrices</li>
              <li>Confidential handling of sensitive business records</li>
              <li>Fixed-scope projects with restrained deliverables</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Engagement model"
            title="Focused projects for teams that need a clearer evidence record."
          >
            Begin with a review of the request, the available evidence, and the
            packet your team needs to prepare.
          </SectionHeading>
          <div className="shrink-0">
            <ButtonLink href="/contact">Request Consultation</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
