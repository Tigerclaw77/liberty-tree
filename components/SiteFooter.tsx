import Link from "next/link";
import { navigation } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <p className="footer-brand">Liberty Tree Compliance</p>
          <p>
            Boutique compliance evidence services for manufacturers responding
            to emerging documentation requirements.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="footer-note">
          Liberty Tree organizes and reviews documentation for readiness
          purposes. It does not provide legal advice, regulatory certification,
          or guarantees of agency, customer, or audit outcomes.
        </p>
      </div>
    </footer>
  );
}
