import type { Metadata } from "next";
import { IntakeFlow } from "./IntakeFlow";

export const metadata: Metadata = {
  title: "Start a PFAS Evidence Engagement",
  description:
    "Begin a Liberty Tree PFAS evidence engagement with a guided intake for company, product scope, supplier count, deadlines, and existing documentation.",
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
            Share the scope, deadlines, product list, and available documents
            Liberty Tree should review before opening the engagement workspace.
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
