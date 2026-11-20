import type { Metadata } from 'next';
import Image from 'next/image';
import { Quote, UserRound } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import { safeGet, mediaUrl, teacherPhotoUrl, Paginated, SchoolProfile, TeacherItem } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import EmptyState from '@/components/EmptyState';
import { absoluteSiteUrl, SITE_URL } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Rahbariyat va pedagoglar',
  description: '51-sonli maktab rahbariyati va pedagog jamoasi bilan tanishing.',
  ...(SITE_URL ? { alternates: { canonical: absoluteSiteUrl('/rahbariyat') }, openGraph: { title: 'Rahbariyat va pedagoglar | 51-sonli maktab', description: 'Maktab rahbariyati va pedagog jamoasi.', url: absoluteSiteUrl('/rahbariyat'), type: 'website' as const, siteName: '51-sonli maktab', locale: 'uz_UZ', images: [absoluteSiteUrl('/og-image.png')!] }, twitter: { card: 'summary_large_image' as const, title: 'Rahbariyat va pedagoglar | 51-sonli maktab', description: 'Maktab rahbariyati va pedagog jamoasi.', images: [absoluteSiteUrl('/og-image.png')!] } } : {}),
};

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

/** Taqqoslash uchun: kichik harf, apostrof va ortiqcha bo'shliqlarsiz */
const norm = (s?: string | null) => (s || '').toLowerCase().replace(/['‘’ʻʼ`]/g, '').replace(/\s+/g, ' ').trim();

/** Rahbariyat tartibi: direktor (0) → o'rinbosarlar (1); rahbar bo'lmasa -1 */
function leaderRank(position?: string | null) {
  const p = norm(position);
  if (!p.includes('direktor')) return -1;
  return p.includes('orinbosar') ? 1 : 0;
}

/** Dars bermaydigan xodimlar uchun "fan" saytda ko'rsatilmaydi */
const NO_SUBJECT = new Set(['dars bermaydi', 'boshqaruv']);

function PersonCard({ t, lead }: { t: TeacherItem; lead?: boolean }) {
  const photo = teacherPhotoUrl(t.photo);
  const subject = t.subject && !NO_SUBJECT.has(norm(t.subject)) ? t.subject : '';
  const size = lead ? 'h-[72px] w-[72px]' : 'h-14 w-14';
  const main = t.position || subject;
  const extra = [t.position && subject ? subject : '', t.experience_years ? `${t.experience_years} yil tajriba` : ''].filter(Boolean).join(' · ');
  return (
    <div className="card flex items-start gap-4 p-4">
      {photo
        ? <Image src={photo} alt={`${t.full_name} — ${main || 'maktab xodimi'}`} loading="lazy" width={lead ? 72 : 56} height={lead ? 72 : 56} sizes={lead ? '72px' : '56px'} className={`${size} shrink-0 rounded-full object-cover`} />
        : <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-600`}>{initials(t.full_name)}</span>}
      <div className="min-w-0">
        <p className="font-extrabold leading-snug">{t.full_name}</p>
        {main && <p className={`text-sm ${lead ? 'font-semibold text-brand-700' : 'text-slate-500'}`}>{main}</p>}
        {extra && <p className="text-xs text-slate-400">{extra}</p>}
        {t.bio?.trim() && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600" title={t.bio.trim()}>{t.bio.trim()}</p>}
      </div>
    </div>
  );
}

export default async function LeadershipPage() {
  const [teachers, school] = await Promise.all([
    safeGet<Paginated<TeacherItem>>('/teachers/?page_size=100'),
    safeGet<SchoolProfile>('/school/'),
  ]);
  const all = teachers?.results ?? [];
  const directorName = norm(school?.director_name);
  // Direktor yuqorida alohida kartochkada ko'rsatiladi — ro'yxatda takrorlanmasin
  const isDirectorCard = (t: TeacherItem) => !!directorName && norm(t.full_name) === directorName;
  const leaders = all.filter((t) => leaderRank(t.position) >= 0 && !isDirectorCard(t))
    .sort((a, b) => leaderRank(a.position) - leaderRank(b.position));
  const groups = new Map<string, TeacherItem[]>();
  all.filter((t) => leaderRank(t.position) < 0 && !isDirectorCard(t)).forEach((t) => {
    const key = t.category_label || 'Pedagoglar';
    groups.set(key, [...(groups.get(key) ?? []), t]);
  });
  const dirPhoto = mediaUrl(school?.director_photo);

  return (
    <div>
      {absoluteSiteUrl('/rahbariyat') && <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') }, { "@type": "ListItem", position: 2, name: 'Rahbariyat', item: absoluteSiteUrl('/rahbariyat') } ] }} />}
      <PageBanner crumb="Rahbariyat" title="Rahbariyat va jamoa" text="Maktab ma’muriyati va pedagog jamoamiz bilan tanishing." />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
        {school?.director_name && (
          <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
            {dirPhoto
              ? <Image src={dirPhoto} alt={`Maktab direktori ${school.director_name}`} loading="lazy" width={160} height={160} sizes="160px" className="h-40 w-40 shrink-0 rounded-3xl object-cover" />
              : <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-3xl bg-brand-50 text-brand-500"><UserRound className="h-16 w-16" /></div>}
            <div>
              <p className="text-sm font-bold text-brand-700">Maktab direktori</p>
              <h2 className="mt-1 text-2xl font-extrabold">{school.director_name}</h2>
              {school.director_message && <p className="mt-4 flex gap-3 leading-relaxed text-slate-600"><Quote className="mt-1 h-5 w-5 shrink-0 text-yellow-500" /><span>{school.director_message}</span></p>}
            </div>
          </section>
        )}

        {!teachers ? (
          <EmptyState kind="error" />
        ) : all.length === 0 ? (
          <EmptyState icon={UserRound} title="Xodimlar yo‘q" text="Hozircha rahbariyat va pedagoglar haqida ma’lumot kiritilmagan." />
        ) : (
          <>
            {leaders.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Rahbariyat</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{leaders.map((t) => <PersonCard key={t.id} t={t} lead />)}</div>
              </section>
            )}
            {Array.from(groups.entries()).map(([label, list]) => (
              <section key={label}>
                <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{label} <span className="text-base font-bold text-slate-400">· {list.length}</span></h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((t) => <PersonCard key={t.id} t={t} />)}</div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
