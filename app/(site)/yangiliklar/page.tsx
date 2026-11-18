import type { Metadata } from 'next';
import PageBanner from '@/components/PageBanner';
import NewsCard from '@/components/NewsCard';
import { safeGet, NewsItem, Paginated } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import { absoluteSiteUrl, SITE_URL } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Yangiliklar va e’lonlar',
  description: 'Muzrabot tumani 51-sonli maktabining yangiliklari, yutuqlari va rasmiy e’lonlari.',
  ...(SITE_URL ? { alternates: { canonical: absoluteSiteUrl('/yangiliklar') }, openGraph: { title: 'Yangiliklar va e’lonlar | 51-sonli maktab', description: 'Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar.', url: absoluteSiteUrl('/yangiliklar'), type: 'website' as const, siteName: '51-sonli maktab', locale: 'uz_UZ', images: [absoluteSiteUrl('/og-image.png')!] }, twitter: { card: 'summary_large_image' as const, title: 'Yangiliklar va e’lonlar | 51-sonli maktab', description: 'Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar.', images: [absoluteSiteUrl('/og-image.png')!] } } : {}),
};

export default async function NewsPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1);
  const res = await safeGet<Paginated<NewsItem>>(`/news/?page=${currentPage}&page_size=12`);
  const news = [...(res?.results ?? [])].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  return (
    <div>
      {absoluteSiteUrl() && <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') },
        { "@type": "ListItem", position: 2, name: 'Yangiliklar', item: absoluteSiteUrl('/yangiliklar') },
      ] }} />}
      <PageBanner crumb="Yangiliklar" title="Yangiliklar va e’lonlar" text="Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar." />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {!res ? (
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : news.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Hozircha yangilik yoki e’lon kiritilmagan.</p>
        ) : (
          <>
            {absoluteSiteUrl() && <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: news.map((item, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteSiteUrl(`/yangiliklar/${item.slug}`), name: item.title })) }} />}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} item={n} />)}</div>
            {(res.next || currentPage > 1) && <nav aria-label="Yangiliklar sahifalari" className="mt-8 flex justify-center gap-4">
              {currentPage > 1 && <a className="btn-outline" href={`/yangiliklar?page=${currentPage - 1}`}>Oldingi</a>}
              {res.next && <a className="btn-primary" href={`/yangiliklar?page=${currentPage + 1}`}>Keyingi</a>}
            </nav>}
          </>
        )}
      </div>
    </div>
  );
}
