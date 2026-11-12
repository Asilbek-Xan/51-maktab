import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { safeGet, apiGet, mediaUrl, dateLabel, NewsItem, Paginated } from '@/lib/api';

export const revalidate = 60;

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  // Avval alohida endpoint, bo'lmasa ro'yxatdan topamiz (keshlangan).
  let item: NewsItem | null = null;
  try { item = await apiGet<NewsItem>(`/news/${params.slug}/`); } catch { /* ro'yxatdan qidiramiz */ }
  if (!item || !item.title) {
    const list = await safeGet<Paginated<NewsItem>>('/news/?page_size=100');
    item = list?.results.find((n) => n.slug === params.slug) ?? null;
  }
  if (!item) notFound();
  const img = mediaUrl(item.image);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/yangiliklar" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" /> Barcha yangiliklar</Link>
      <div className="card overflow-hidden">
        {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" decoding="async" className="max-h-[26rem] w-full object-cover" />}
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
