import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link
      className={variant === "primary" ? "button-primary" : "button-secondary"}
      href={href}
    >
      {children}
    </Link>
  );
}
