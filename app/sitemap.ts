import type { MetadataRoute } from "next";
import { safeGet, type NewsItem, type Paginated } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
const staticRoutes = ["", "/biz-haqimizda", "/rahbariyat", "/yutuqlar", "/yangiliklar", "/aloqa"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_URL) return [];
  const school = await safeGet<{ updated_at?: string; modified_at?: string }>("/school/");
  const staticLastModified = school?.updated_at || school?.modified_at;
  const newsItems: NewsItem[] = [];
  let pageNumber = 1;
  while (true) {
    const page = await safeGet<Paginated<NewsItem>>(`/news/?page=${pageNumber}&page_size=100`);
    if (!page) break;
    newsItems.push(...page.results);
    if (!page.next) break;
    pageNumber += 1;
  }

  const pages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    ...(staticLastModified ? { lastModified: new Date(staticLastModified) } : {}),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
  const newsPages = newsItems.map((item) => ({
    url: `${SITE_URL}/yangiliklar/${item.slug}`,
    ...(item.published_at ? { lastModified: new Date(item.published_at) } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...newsPages];
}
