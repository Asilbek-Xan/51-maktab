import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import ContactForm from '@/components/ContactForm';
import { safeGet, SchoolProfile } from '@/lib/api';

export const revalidate = 60;

export default async function ContactPage() {
  const school = await safeGet<SchoolProfile>('/school/');
  const info = [
    { label: 'Manzil', value: school?.address, Icon: MapPin },
    { label: 'Telefon', value: school?.phone, Icon: Phone },
    { label: 'Elektron pochta', value: school?.email, Icon: Mail },
    { label: 'Qabul vaqti', value: school?.working_hours, Icon: Clock },
  ].filter((i) => i.value);
  const hasMap = school?.latitude && school?.longitude;

  return (
    <div>
      <PageBanner crumb="Aloqa" title="Aloqa" text="Keling, qo‘ng‘iroq qiling yoki yozing — doim aloqadamiz." />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6">
        {info.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {info.map(({ label, value, Icon }) => (
              <div key={label} className="card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-1 font-bold leading-snug">{value}</p>
              </div>
            ))}
          </div>
        )}
        {hasMap && (
          <div className="card overflow-hidden">
            <iframe title="Xarita" loading="lazy" className="h-80 w-full border-0" src={`https://maps.google.com/maps?q=${school!.latitude},${school!.longitude}&z=15&output=embed`} />
          </div>
        )}
        <div>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Direktorga murojaat</h2>
            <p className="mt-3 text-slate-500">Formani to‘ldiring — maktab ma’muriyati siz bilan bog‘lanadi.</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
