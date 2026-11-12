import PageBanner from '@/components/PageBanner';
import NewsCard from '@/components/NewsCard';
import { safeGet, NewsItem, Paginated } from '@/lib/api';

export const revalidate = 60;

export default async function NewsPage() {
  const res = await safeGet<Paginated<NewsItem>>('/news/?page_size=100');
  const news = [...(res?.results ?? [])].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  return (
    <div>
      <PageBanner crumb="Yangiliklar" title="Yangiliklar va e’lonlar" text="Maktab hayotidagi voqealar, yutuqlar va rasmiy e’lonlar." />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {!res ? (
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : news.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Hozircha yangilik yoki e’lon kiritilmagan.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} item={n} />)}</div>
        )}
      </div>
    </div>
  );
}
