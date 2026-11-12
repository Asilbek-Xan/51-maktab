import { Quote, UserRound } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import { safeGet, mediaUrl, Paginated, SchoolProfile, TeacherItem } from '@/lib/api';

export const revalidate = 60;

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default async function LeadershipPage() {
  const [teachers, school] = await Promise.all([
    safeGet<Paginated<TeacherItem>>('/teachers/?page_size=100'),
    safeGet<SchoolProfile>('/school/'),
  ]);
  const groups = new Map<string, TeacherItem[]>();
  (teachers?.results ?? []).forEach((t) => {
    const key = t.category_label || 'Pedagoglar';
    groups.set(key, [...(groups.get(key) ?? []), t]);
  });
  const dirPhoto = mediaUrl(school?.director_photo);

  return (
    <div>
      <PageBanner crumb="Rahbariyat" title="Rahbariyat va jamoa" text="Maktab ma’muriyati va pedagog jamoamiz bilan tanishing." />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
        {school?.director_name && (
          <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
            {dirPhoto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={dirPhoto} alt={school.director_name} loading="lazy" decoding="async" className="h-40 w-40 shrink-0 rounded-3xl object-cover" />
              : <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-3xl bg-brand-50 text-brand-500"><UserRound className="h-16 w-16" /></div>}
            <div>
              <p className="text-sm font-bold text-brand-700">Maktab direktori</p>
              <h2 className="mt-1 text-2xl font-extrabold">{school.director_name}</h2>
              {school.director_message && <p className="mt-4 flex gap-3 leading-relaxed text-slate-600"><Quote className="mt-1 h-5 w-5 shrink-0 text-yellow-500" /><span>{school.director_message}</span></p>}
            </div>
          </section>
        )}

        {!teachers ? (
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : groups.size === 0 ? (
          <p className="card p-8 text-center text-slate-500">Hozircha xodimlar kiritilmagan.</p>
        ) : (
          Array.from(groups.entries()).map(([label, list]) => (
            <section key={label}>
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{label}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((t: TeacherItem) => {
                  const photo = mediaUrl(t.photo);
                  return (
                    <div key={t.id} className="card flex items-center gap-4 p-4">
                      {photo
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={photo} alt="" loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                        : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-600">{initials(t.full_name)}</span>}
                      <div className="min-w-0">
                        <p className="font-extrabold leading-snug">{t.full_name}</p>
                        <p className="text-sm text-slate-500">{t.position || t.subject}{t.experience_years ? ` · ${t.experience_years} yil tajriba` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
