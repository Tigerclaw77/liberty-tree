import type { Metadata } from "next";
import { CasePortal } from "./CasePortal";

export const metadata: Metadata = {
  title: "Case Portal",
  description:
    "Temporary Liberty Tree Compliance engagement portal for PFAS evidence case status, documents, requests, downloads, and messages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CasePortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <CasePortal token={token} />;
}
