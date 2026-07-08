import type { Metadata } from "next";

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
  "The request source, such as customer, auditor, counsel, or internal review",
  "Relevant deadlines or response windows",
  "Known document types already available",
  "Any supplier evidence collection already in progress",
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-shell">
          <p className="eyebrow">Contact</p>
          <h1>Talk through a PFAS documentation request.</h1>
          <p>
            Share the products, customer request, deadline, and document types
            already available. Liberty Tree will respond with the likely packet
            scope and next intake step.
          </p>
        </div>
      </section>

      <section className="section-band">
        <div className="site-shell grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <form className="contact-form">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="name">
                Name
              </label>
              <input
                className="field-control"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-navy"
                htmlFor="company"
              >
                Company
              </label>
              <input
                className="field-control"
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="email">
                Email
              </label>
              <input
                className="field-control"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-navy" htmlFor="area">
                Area of concern
              </label>
              <select
                className="field-control"
                id="area"
                name="area"
                defaultValue=""
              >
                <option value="" disabled>
                  Select an area
                </option>
                <option value="pfas">PFAS documentation</option>
                <option value="supplier">Supplier evidence collection</option>
                <option value="customer">Customer documentation request</option>
                <option value="internal">Internal evidence review</option>
                <option value="other">Other compliance evidence matter</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-navy"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                className="field-control min-h-40 resize-y"
                id="message"
                name="message"
              />
            </div>
            <button className="button-primary justify-self-start" type="button">
              Request Consultation
            </button>
          </form>

          <aside className="quiet-card self-start">
            <h2 className="font-serif text-3xl font-normal text-navy">
              What to include
            </h2>
            <ul className="mt-5 grid gap-3">
              {includeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-6 text-muted">
              Please avoid sending highly sensitive documents through an
              unconfirmed intake path. A secure document process can be
              established after initial scoping.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
