import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const routes = [
  "",
  "/pfas-evidence-packets",
  "/start-pfas-engagement",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
