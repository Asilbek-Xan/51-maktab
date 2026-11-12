import Link from 'next/link';
import { ArrowRight, Pin } from 'lucide-react';
import { dateLabel, mediaUrl, NewsItem } from '@/lib/api';

export default function NewsCard({ item }: { item: NewsItem }) {
  const img = mediaUrl(item.thumbnail || item.image);
  return (
    <Link href={`/yangiliklar/${item.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5">
      <div className="aspect-[16/10] overflow-hidden bg-brand-50">
        {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{item.kind_label}</span>
          {item.is_pinned && <span className="flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-gold-700"><Pin className="h-3 w-3" /> Muhim</span>}
        </div>
        <h3 className="text-lg font-extrabold leading-snug">{item.title}</h3>
        {item.summary && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{item.summary}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="text-slate-400">{dateLabel(item.published_at)}</span>
          <span className="flex items-center gap-1 font-bold text-brand-700">Batafsil <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}
