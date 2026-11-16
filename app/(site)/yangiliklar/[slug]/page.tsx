import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { safeGet, apiGet, mediaUrl, dateLabel, NewsItem, Paginated } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import { absoluteSiteUrl, SITE_URL } from '@/lib/site';

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let item: NewsItem | null = null;
  try { item = await apiGet<NewsItem>(`/news/${params.slug}/`); } catch { /* ro'yxatdan qidiramiz */ }
  if (!item?.title) {
    let pageNumber = 1;
    while (!item?.title) {
      const list = await safeGet<Paginated<NewsItem>>(`/news/?page=${pageNumber}&page_size=100`);
      item = list?.results.find((news) => news.slug === params.slug) ?? item;
      if (!list?.next) break;
      pageNumber += 1;
    }
  }
  if (!item) return { title: 'Yangilik topilmadi', robots: { index: false, follow: true } };

  const description = (item.summary || item.content || item.title).replace(/\s+/g, ' ').trim().slice(0, 160);
  const url = `/yangiliklar/${item.slug}`;
  const image = mediaUrl(item.image);
  return {
    title: item.title,
    description,
    ...(SITE_URL ? { alternates: { canonical: absoluteSiteUrl(url) } } : {}),
    openGraph: {
      type: 'article',
      ...(absoluteSiteUrl(url) ? { url: absoluteSiteUrl(url) } : {}),
      ...(SITE_URL ? { siteName: '51-sonli maktab', locale: 'uz_UZ' } : {}),
      title: item.title,
      description,
      ...(image ? { images: [{ url: image }] } : SITE_URL ? { images: [{ url: absoluteSiteUrl('/og-image.png')! }] } : {}),
      ...(item.published_at ? { publishedTime: item.published_at } : {}),
    },
    twitter: { card: image || SITE_URL ? 'summary_large_image' : 'summary', title: item.title, description, ...(image ? { images: [image] } : SITE_URL ? { images: [absoluteSiteUrl('/og-image.svg')!] } : {}) },
  };
}

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  // Avval alohida endpoint, bo'lmasa ro'yxatdan topamiz (keshlangan).
  let item: NewsItem | null = null;
  try { item = await apiGet<NewsItem>(`/news/${params.slug}/`); } catch { /* ro'yxatdan qidiramiz */ }
  if (!item || !item.title) {
    let pageNumber = 1;
    while (!item?.title) {
      const list = await safeGet<Paginated<NewsItem>>(`/news/?page=${pageNumber}&page_size=100`);
      item = list?.results.find((n) => n.slug === params.slug) ?? item;
      if (!list?.next) break;
      pageNumber += 1;
    }
  }
  if (!item) notFound();
  const img = mediaUrl(item.image);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/yangiliklar" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" /> Barcha yangiliklar</Link>
      {absoluteSiteUrl(`/yangiliklar/${item.slug}`) && <JsonLd data={[
        { "@context": "https://schema.org", "@type": "NewsArticle", headline: item.title, description: (item.summary || item.content || item.title).replace(/\s+/g, ' ').trim().slice(0, 300), ...(item.published_at ? { datePublished: item.published_at } : {}), ...(img ? { image: img } : SITE_URL ? { image: absoluteSiteUrl('/og-image.svg') } : {}), mainEntityOfPage: absoluteSiteUrl(`/yangiliklar/${item.slug}`), author: { "@type": "Organization", name: '51-sonli maktab' }, publisher: { "@type": "Organization", name: '51-sonli maktab', url: absoluteSiteUrl('/') } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') }, { "@type": "ListItem", position: 2, name: 'Yangiliklar', item: absoluteSiteUrl('/yangiliklar') }, { "@type": "ListItem", position: 3, name: item.title, item: absoluteSiteUrl(`/yangiliklar/${item.slug}`) } ] },
      ]} />}
      <div className="card overflow-hidden">
        {img && <Image src={img} alt={item.title} width={1200} height={675} sizes="(max-width: 768px) 100vw, 768px" className="max-h-[26rem] w-full object-cover" />}
        <div className="space-y-4 p-6 sm:p-10">
          <p className="text-sm font-bold text-brand-700">{item.kind_label}{item.published_at ? ` · ${dateLabel(item.published_at)}` : ''}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{item.title}</h1>
          {item.summary && <p className="text-lg leading-relaxed text-slate-600">{item.summary}</p>}
          {item.content && <div className="whitespace-pre-line leading-relaxed text-slate-700">{item.content}</div>}
        </div>
      </div>
    </article>
  );
}
