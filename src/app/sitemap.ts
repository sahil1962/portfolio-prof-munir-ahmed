import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://munirahmedtuition.com";

const routes = [
  { url: "/",                             priority: 1.0, changeFrequency: "monthly" },
  { url: "/about",                        priority: 0.8, changeFrequency: "monthly" },
  { url: "/subjects/maths",               priority: 0.9, changeFrequency: "monthly" },
  { url: "/subjects/science",             priority: 0.9, changeFrequency: "monthly" },
  { url: "/subjects/a-level-physics",     priority: 0.9, changeFrequency: "monthly" },
  { url: "/subjects/research-methods",    priority: 0.9, changeFrequency: "monthly" },
  { url: "/packages",                     priority: 0.8, changeFrequency: "monthly" },
  { url: "/testimonials",                 priority: 0.7, changeFrequency: "monthly" },
  { url: "/schedule",                     priority: 0.7, changeFrequency: "weekly" },
  { url: "/group-tuition",                priority: 0.7, changeFrequency: "monthly" },
  { url: "/book",                         priority: 0.9, changeFrequency: "monthly" },
  { url: "/contact",                      priority: 0.6, changeFrequency: "yearly" },
  { url: "/privacy",                      priority: 0.3, changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
