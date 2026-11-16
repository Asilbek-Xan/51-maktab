import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PageBanner from '@/components/PageBanner';
import ContactForm from '@/components/ContactForm';
import { safeGet, SchoolProfile } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import { absoluteSiteUrl, SITE_URL } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Aloqa',
  description: '51-sonli maktabning manzili va aloqa ma’lumotlari. Maktab ma’muriyatiga murojaat yuboring.',
  ...(SITE_URL ? { alternates: { canonical: absoluteSiteUrl('/aloqa') }, openGraph: { title: 'Aloqa | 51-sonli maktab', description: 'Maktab manzili, aloqa ma’lumotlari va murojaat formasi.', url: absoluteSiteUrl('/aloqa'), type: 'website' as const, siteName: '51-sonli maktab', locale: 'uz_UZ', images: [absoluteSiteUrl('/og-image.png')!] }, twitter: { card: 'summary_large_image' as const, title: 'Aloqa | 51-sonli maktab', description: 'Maktab manzili va aloqa ma’lumotlari.', images: [absoluteSiteUrl('/og-image.svg')!] } } : {}),
};

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
      {absoluteSiteUrl('/aloqa') && <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') }, { "@type": "ListItem", position: 2, name: 'Aloqa', item: absoluteSiteUrl('/aloqa') } ] }} />}
      <PageBanner crumb="Aloqa" title="Aloqa" text="Keling, qo‘ng‘iroq qiling yoki yozing — doim aloqadamiz." />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6">
        {info.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {info.map(({ label, value, Icon }) => (
              <div key={label} className="card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-1 font-bold leading-snug">{label === 'Telefon' ? <a href={`tel:${value?.replace(/[^+\d]/g, '')}`}>{value}</a> : label === 'Elektron pochta' ? <a href={`mailto:${value}`}>{value}</a> : label === 'Manzil' && school?.latitude && school?.longitude ? <a href={`https://www.google.com/maps/search/?api=1&query=${school.latitude},${school.longitude}`} target="_blank" rel="noreferrer">{value}</a> : value}</p>
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
