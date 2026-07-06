type LanternMarkProps = {
  className?: string;
};

export function LanternMark({ className }: LanternMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 46"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 1.5v7" stroke="currentColor" strokeLinecap="round" />
      <path
        d="M11.5 9.5c.7-2.2 2.3-3.4 4.5-3.4s3.8 1.2 4.5 3.4"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M9.5 12.5h13l2.5 5.2v21.8H7V17.7l2.5-5.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path d="M10 18h12M10 34h12" stroke="currentColor" />
      <path d="M13 18v16M19 18v16" stroke="currentColor" />
      <path
        d="M14.1 31c.1-3.1 1.9-4.3 1.9-7.2 0 2.9 1.9 4.1 1.9 7.2"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path d="M11.5 39.5h9" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}
