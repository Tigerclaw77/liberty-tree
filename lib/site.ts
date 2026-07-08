export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://libertytreecompliance.com";

export const siteName = "Liberty Tree Compliance";

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/pfas-evidence-packets", label: "PFAS Evidence Packets" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const primaryCta = {
  href: "/start-pfas-engagement",
  label: "Start a PFAS Evidence Engagement",
} as const;
