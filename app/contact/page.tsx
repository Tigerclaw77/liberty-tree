import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "PFAS Documentation Request Contact",
  description:
    "Contact Liberty Tree about PFAS evidence packages for customer documentation requests, supplier records, product lists, SDS, TDS, and declarations.",
  alternates: {
    canonical: "/contact",
  },
};

const includeItems = [
  "Products, product families, or divisions involved",
  "The customer request, questionnaire, or deadline",
  "Approximate number of SKUs and suppliers",
  "Known SDS, TDS, declaration, or source-document gaps",
  "Any supplier evidence collection already in progress",
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">Contact</p>
          <h1>Need to answer a PFAS documentation request?</h1>
          <p>
            The fastest path is the engagement intake. It captures the scope,
            deadline, products, suppliers, and available documents so Liberty
            Tree can review the request and confirm next steps.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div className="contact-form">
            <div>
              <h2 className="font-serif text-3xl font-normal text-navy">
                Start with intake, not a sales call.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted">
                Submit the customer request, product scope, deadline, and file
                types you already have. The intake creates a temporary case
                portal and gives Liberty Tree the information needed to scope a
                fixed-price evidence engagement.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/start-pfas-engagement">
                Start a PFAS Evidence Engagement
              </ButtonLink>
              <ButtonLink href="/pfas-evidence-packets" variant="secondary">
                View Packet Deliverables
              </ButtonLink>
            </div>
            <p className="text-xs leading-6 text-muted">
              Liberty Tree organizes, validates, and documents evidence. We do
              not perform laboratory testing, certify compliance, or provide
              legal opinions.
            </p>
          </div>

          <aside className="quiet-card self-start">
            <h2 className="font-serif text-3xl font-normal text-navy">
              What to have ready
            </h2>
            <ul className="mt-5 grid gap-3">
              {includeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-6 text-muted">
              If sensitive files are involved, Liberty Tree will confirm the
              secure transfer process before relying on those documents.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
