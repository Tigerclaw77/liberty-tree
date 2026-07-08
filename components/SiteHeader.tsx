import Link from "next/link";
import { navigation, primaryCta, siteName } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link className="brand" href="/" aria-label={`${siteName} home`}>
          <span className="brand-mark" aria-hidden="true">
            LT
          </span>
          <span>
            <strong>Liberty Tree</strong>
            <small>Compliance</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="button-primary min-h-10 px-4 text-[0.72rem]" href={primaryCta.href}>
            {primaryCta.label}
          </Link>
        </nav>

        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="border border-navy bg-navy px-3 py-3 text-white" href={primaryCta.href}>
              {primaryCta.label}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
