import Link from 'next/link';
import { MapPin, Phone, Mail, Send, Instagram, Facebook, Youtube } from 'lucide-react';
import { safeGet, SchoolProfile } from '@/lib/api';
import SchoolLogo from './SchoolLogo';

const sections = [
  { name: 'Maktab haqida', href: '/biz-haqimizda' },
  { name: 'Rahbariyat va jamoa', href: '/rahbariyat' },
  { name: 'Yangiliklar', href: '/yangiliklar' },
  { name: 'Aloqa', href: '/aloqa' },
];
const resources = [
  { name: 'Elektron kundalik — eMaktab', href: 'https://emaktab.uz' },
  { name: 'Video darsliklar — maktab.uz', href: 'https://maktab.uz' },
  { name: 'Elektron kutubxona — kitob.uz', href: 'https://kitob.uz' },
  { name: 'Xalq ta’limi vazirligi', href: 'https://uzedu.uz' },
];

export default async function Footer() {
  const school = await safeGet<SchoolProfile>('/school/');
  const socials = [
    { href: school?.telegram, Icon: Send, label: 'Telegram' },
    { href: school?.instagram, Icon: Instagram, label: 'Instagram' },
    { href: school?.facebook, Icon: Facebook, label: 'Facebook' },
    { href: school?.youtube, Icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-ink/5 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SchoolLogo src={school?.logo} alt={school?.name || '51-maktab'} size={48} />
            <span className="font-extrabold">{school?.short_name || '51-sonli maktab'}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            {school?.tagline || 'Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o‘rta ta’lim maktabi.'}
          </p>
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-brand-600 hover:text-white"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold">Maktab</h3>
          <ul className="space-y-2.5 text-sm text-slate-500">
            {sections.map((i) => <li key={i.href}><Link href={i.href} className="transition hover:text-brand-600">{i.name}</Link></li>)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold">Foydali</h3>
          <ul className="space-y-2.5 text-sm text-slate-500">
            {resources.map((i) => <li key={i.href}><a href={i.href} target="_blank" rel="noreferrer" className="transition hover:text-brand-600">{i.name}</a></li>)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold">Aloqa</h3>
          <ul className="space-y-3 text-sm text-slate-500">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{school?.address || 'Surxondaryo viloyati, Muzrabot tumani'}</li>
            {school?.phone && <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{school.phone}</li>}
            {school?.email && <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{school.email}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/5 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {school?.name || '51-sonli maktab'}. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}
