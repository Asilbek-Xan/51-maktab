import type { Metadata } from 'next';
import PageBanner from '@/components/PageBanner';
import NewsCard from '@/components/NewsCard';
import { safeGet, NewsItem, Paginated } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import { absoluteSiteUrl, SITE_URL } from '@/lib/site';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import { Search } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Yangiliklar va e’lonlar',
  description: 'Muzrabot tumani 51-sonli maktabining yangiliklari, yutuqlari va rasmiy e’lonlari.',
  ...(SITE_URL ? { alternates: { canonical: absoluteSiteUrl('/yangiliklar') }, openGraph: { title: 'Yangiliklar va e’lonlar | 51-sonli maktab', description: 'Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar.', url: absoluteSiteUrl('/yangiliklar'), type: 'website' as const, siteName: '51-sonli maktab', locale: 'uz_UZ', images: [absoluteSiteUrl('/og-image.png')!] }, twitter: { card: 'summary_large_image' as const, title: 'Yangiliklar va e’lonlar | 51-sonli maktab', description: 'Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar.', images: [absoluteSiteUrl('/og-image.png')!] } } : {}),
};

export default async function NewsPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const currentPage = Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1);
  const q = (searchParams.q || '').trim().slice(0, 80);
  const qs = q ? `&search=${encodeURIComponent(q)}` : '';
  const pageHref = (p: number) => `/yangiliklar?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  const res = await safeGet<Paginated<NewsItem>>(`/news/?page=${currentPage}&page_size=12${qs}`);
  const news = [...(res?.results ?? [])].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  return (
    <div>
      {absoluteSiteUrl() && <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') },
        { "@type": "ListItem", position: 2, name: 'Yangiliklar', item: absoluteSiteUrl('/yangiliklar') },
      ] }} />}
      <PageBanner crumb="Yangiliklar" title="Yangiliklar va e’lonlar" text="Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar." />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <form action="/yangiliklar" method="get" role="search" className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="search" name="q" defaultValue={q} maxLength={80} placeholder="Yangilik yoki e’lonni qidiring…" aria-label="Yangiliklardan qidirish" className="field w-full pl-12" />
          </div>
          <button type="submit" className="btn-primary shrink-0">Qidirish</button>
        </form>
        {q && res && <p className="mb-6 text-sm text-slate-500">“<span className="font-bold text-ink">{q}</span>” bo‘yicha {res.count ?? news.length} ta natija · <Link href="/yangiliklar" className="font-bold text-brand-700 hover:underline">Tozalash</Link></p>}
        {!q && <div className="mb-6" />}
        {!res ? (
          <EmptyState kind="error" />
        ) : news.length === 0 ? (
          (q ? <EmptyState kind="search" text={`“${q}” bo‘yicha yangilik topilmadi. Boshqa so‘z bilan qidirib ko‘ring.`} /> : <EmptyState title="Yangiliklar yo‘q" text="Hozircha yangilik yoki e’lon kiritilmagan." />)
        ) : (
          <>
            {absoluteSiteUrl() && <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: news.map((item, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteSiteUrl(`/yangiliklar/${item.slug}`), name: item.title })) }} />}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} item={n} />)}</div>
            {(res.next || currentPage > 1) && <nav aria-label="Yangiliklar sahifalari" className="mt-8 flex justify-center gap-4">
              {currentPage > 1 && <a className="btn-outline" href={pageHref(currentPage - 1)}>Oldingi</a>}
              {res.next && <a className="btn-primary" href={pageHref(currentPage + 1)}>Keyingi</a>}
            </nav>}
          </>
        )}
      </div>
    </div>
  );
}
