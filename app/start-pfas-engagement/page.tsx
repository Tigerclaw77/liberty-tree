import type { Metadata } from "next";
import { IntakeFlow } from "./IntakeFlow";

export const metadata: Metadata = {
  title: "Start a PFAS Evidence Engagement",
  description:
    "Submit product lists, SDS, TDS, supplier declarations, and customer PFAS documentation requests for a Liberty Tree evidence engagement.",
  alternates: {
    canonical: "/start-pfas-engagement",
  },
};

export default function StartPfasEngagementPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">Client intake</p>
          <h1>Start a PFAS Evidence Engagement.</h1>
          <p>
            Share the product scope, deadline, customer request, and documents
            Liberty Tree should organize before opening the temporary case
            portal.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell">
          <IntakeFlow />
        </div>
      </section>
    </>
  );
}
