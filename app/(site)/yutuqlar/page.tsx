import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Medal, Trophy, Globe2, GraduationCap, CalendarDays } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import JsonLd from '@/components/JsonLd';
import AchievementModal from '@/components/AchievementModal';
import { safeGet, mediaUrl, dateLabel, AchievementItem, Paginated } from '@/lib/api';
import { absoluteSiteUrl, SITE_URL, OG_IMAGE } from '@/lib/site';

export const revalidate = 60;

const title = 'O‘quvchilar yutuqlari';
const description = 'Muzrabot tumani 51-sonli maktab o‘quvchilarining tuman, viloyat, respublika va xalqaro olimpiada hamda tanlovlardagi yutuqlari.';

export const metadata: Metadata = {
  title,
  description,
  ...(SITE_URL ? {
    alternates: { canonical: absoluteSiteUrl('/yutuqlar') },
    openGraph: { title: `${title} | 51-sonli maktab`, description, url: absoluteSiteUrl('/yutuqlar'), type: 'website' as const, siteName: '51-sonli maktab', locale: 'uz_UZ', images: [absoluteSiteUrl(OG_IMAGE)!] },
    twitter: { card: 'summary_large_image' as const, title: `${title} | 51-sonli maktab`, description, images: [absoluteSiteUrl(OG_IMAGE)!] },
  } : {}),
};

const LEVELS = [
  { value: 'xalqaro', label: 'Xalqaro' },
  { value: 'respublika', label: 'Respublika' },
  { value: 'viloyat', label: 'Viloyat' },
  { value: 'tuman', label: 'Tuman' },
  { value: 'maktab', label: 'Maktab' },
];
const LEVEL_RANK: Record<string, number> = { xalqaro: 0, respublika: 1, viloyat: 2, tuman: 3, maktab: 4 };

/** 1–3-o'rinlar uchun medal rangi */
function placeStyle(place: number | null) {
  if (place === 1) return 'bg-yellow-400 text-yellow-950';
  if (place === 2) return 'bg-slate-200 text-slate-800';
  if (place === 3) return 'bg-amber-600 text-white';
  return 'bg-white/90 text-ink';
}

async function getAll(): Promise<AchievementItem[] | null> {
  const items: AchievementItem[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await safeGet<Paginated<AchievementItem> | AchievementItem[]>(`/achievements/?page=${page}&page_size=100`);
    if (!res) return page === 1 ? null : items;
    if (Array.isArray(res)) return res;
    items.push(...res.results);
    if (!res.next) break;
  }
  return items;
}

export default async function AchievementsPage({ searchParams }: { searchParams: { daraja?: string } }) {
  const all = await getAll();
  const active = LEVELS.some((l) => l.value === searchParams.daraja) ? searchParams.daraja! : '';
  const sorted = [...(all ?? [])].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (LEVEL_RANK[a.level] ?? 9) - (LEVEL_RANK[b.level] ?? 9));
  const list = active ? sorted.filter((a) => a.level === active) : sorted;
  const counts = Object.fromEntries(LEVELS.map((l) => [l.value, (all ?? []).filter((a) => a.level === l.value).length]));
  const stats = [
    { label: 'Jami yutuqlar', value: all?.length ?? 0, Icon: Trophy },
    { label: '1-o‘rinlar', value: (all ?? []).filter((a) => a.place === 1).length, Icon: Medal },
    { label: 'Respublika va xalqaro', value: (counts.respublika ?? 0) + (counts.xalqaro ?? 0), Icon: Globe2 },
  ];

  return (
    <div>
      {absoluteSiteUrl('/yutuqlar') && <JsonLd data={[
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') },
          { "@type": "ListItem", position: 2, name: 'Yutuqlar', item: absoluteSiteUrl('/yutuqlar') },
        ] },
        ...(list.length ? [{ "@context": "https://schema.org", "@type": "ItemList", name: title, itemListElement: list.slice(0, 50).map((a, i) => ({
          "@type": "ListItem", position: i + 1, name: `${a.title} — ${a.student_name}`,
        })) }] : []),
      ]} />}
      <PageBanner crumb="Yutuqlar" title={title} text="Olimpiada, tanlov va musobaqalarda o‘quvchilarimiz qo‘lga kiritgan natijalar." />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6">
        {!all ? (
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : all.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Hozircha yutuqlar kiritilmagan.</p>
        ) : (
          <>
            {/* Statistika */}
            <div className="grid gap-5 sm:grid-cols-3">
              {stats.map(({ label, value, Icon }) => (
                <div key={label} className="card flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600"><Icon className="h-6 w-6" /></div>
                  <div><p className="text-3xl font-extrabold text-brand-700">{value}</p><p className="text-sm font-semibold text-slate-500">{label}</p></div>
                </div>
              ))}
            </div>

            {/* Daraja bo'yicha filtr */}
            <nav aria-label="Daraja bo‘yicha saralash" className="flex flex-wrap gap-2">
              <Link href="/yutuqlar" scroll={false} className={`rounded-full px-4 py-2 text-sm font-bold transition ${!active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 shadow-sm hover:text-brand-700'}`}>Barchasi <span className="opacity-70">{all.length}</span></Link>
              {LEVELS.filter((l) => counts[l.value]).map((l) => (
                <Link key={l.value} href={`/yutuqlar?daraja=${l.value}`} scroll={false} className={`rounded-full px-4 py-2 text-sm font-bold transition ${active === l.value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 shadow-sm hover:text-brand-700'}`}>{l.label} <span className="opacity-70">{counts[l.value]}</span></Link>
              ))}
            </nav>

            {list.length === 0 ? (
              <p className="card p-8 text-center text-slate-500">Bu daraja bo‘yicha yutuq yo‘q.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => {
                  const img = mediaUrl(a.image);
                  return (
                    <article key={a.id} className="card flex flex-col overflow-hidden">
                      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                        {img
                          ? <Image src={img} alt={`${a.student_name} — ${a.title}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                          : <div className="flex h-full items-center justify-center text-yellow-500"><Trophy className="h-16 w-16" /></div>}
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-700 backdrop-blur">{a.level_label}</span>
                        {a.place ? <span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold shadow ${placeStyle(a.place)}`}><Medal className="h-3.5 w-3.5" /> {a.place}-o‘rin</span> : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h2 className="text-lg font-extrabold leading-snug">{a.title}</h2>
                        <p className="font-bold text-ink">{a.student_name}{a.grade ? <span className="font-medium text-slate-500"> · {a.grade} sinf</span> : null}</p>
                        {a.teacher?.full_name && <p className="flex items-center gap-1.5 text-sm text-slate-500"><GraduationCap className="h-4 w-4 shrink-0 text-brand-600" /> Ustoz: {a.teacher.full_name}</p>}
                        {a.description && <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{a.description}</p>}
                        <AchievementModal placeClass={placeStyle(a.place)} data={{
                          title: a.title, student_name: a.student_name, grade: a.grade, teacher: a.teacher?.full_name,
                          level_label: a.level_label, place: a.place, date: a.date ? dateLabel(a.date) : null, image: img, description: a.description,
                        }} />
                        {a.date && <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-slate-400"><CalendarDays className="h-4 w-4" /> {dateLabel(a.date)}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
