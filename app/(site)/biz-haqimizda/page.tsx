import { Building2, Mail, MapPin, Phone, Clock } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import { safeGet, SchoolProfile } from '@/lib/api';

export const revalidate = 60;

export default async function AboutPage() {
  const school = await safeGet<SchoolProfile>('/school/');
  const facts = [
    { label: 'Tuman', value: school?.district, Icon: Building2 },
    { label: 'Manzil', value: school?.address, Icon: MapPin },
    { label: 'Telefon', value: school?.phone, Icon: Phone },
    { label: 'Elektron pochta', value: school?.email, Icon: Mail },
    { label: 'Ish vaqti', value: school?.working_hours, Icon: Clock },
  ].filter((f) => f.value);

  return (
    <div>
      <PageBanner crumb="Maktab haqida" title="Maktab haqida" text={school?.tagline || school?.name} />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
        {!school ? (
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : (
          <>
            {(school.history || school.description) && (
              <section className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{school.history ? 'Maktab tarixi' : school.name}</h2>
                <div className="space-y-4 whitespace-pre-line leading-relaxed text-slate-600">
                  {school.description && <p>{school.description}</p>}
                  {school.history && <p>{school.history}</p>}
                </div>
              </section>
            )}
            {facts.length > 0 && (
              <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map(({ label, value, Icon }) => (
                  <div key={label} className="card flex items-start gap-4 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
                    <div><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-bold leading-snug">{value}</p></div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
