type TrustIconProps = {
  name: "documentation" | "source" | "review" | "confidential";
};

export function TrustIcon({ name }: TrustIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="trust-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.35"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      {name === "documentation" ? (
        <>
          <path d="M15 8.5h14l7 7V39.5H15z" />
          <path d="M29 8.5V16h7" />
          <path d="M20 23h11M20 28h11M20 33h7" />
        </>
      ) : null}
      {name === "source" ? (
        <>
          <path d="M11 14.5h12v10H11zM25 23.5h12v10H25z" />
          <path d="M23 19.5h7M18 24.5v4.5h7" />
          <path d="M14.5 19.5h5M28.5 28.5h5" />
        </>
      ) : null}
      {name === "review" ? (
        <>
          <path d="M24 40.5c8.8 0 16-7.2 16-16s-7.2-16-16-16-16 7.2-16 16 7.2 16 16 16Z" />
          <path d="m17.5 24.5 4.4 4.4 8.8-10" />
        </>
      ) : null}
      {name === "confidential" ? (
        <>
          <path d="M14 21h20v18H14z" />
          <path d="M18.5 21v-4.5a5.5 5.5 0 0 1 11 0V21" />
          <path d="M24 29v4" />
          <path d="M24 28.5h.01" />
        </>
      ) : null}
    </svg>
  );
}
