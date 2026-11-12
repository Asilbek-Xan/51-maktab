'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { name: 'Maktab haqida', href: '/biz-haqimizda' },
  { name: 'Rahbariyat', href: '/rahbariyat' },
  { name: 'Yangiliklar', href: '/yangiliklar' },
  { name: 'Aloqa', href: '/aloqa' },
];

export default function NavbarClient({ phone, logo, name, subtitle }: { phone: string; logo: React.ReactNode; name: string; subtitle: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const tel = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '/aloqa';

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {logo}
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold tracking-tight">{name}</span>
            <span className="block text-xs font-medium text-slate-500">{subtitle}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className={`border-b-2 py-1 text-[15px] font-semibold transition ${pathname === '/' ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink hover:text-brand-600'}`}>Bosh sahifa</Link>
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={`border-b-2 py-1 text-[15px] font-semibold transition ${isActive(item.href) ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink hover:text-brand-600'}`}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={tel} className="hidden items-center gap-2 rounded-full border border-ink/25 px-5 py-2.5 text-sm font-bold transition hover:border-ink sm:inline-flex">
            <Phone className="h-4 w-4" /> {phone ? `Qo‘ng‘iroq: ${phone}` : 'Bog‘lanish'}
          </a>
          <button onClick={() => setOpen(!open)} className="rounded-full p-2.5 hover:bg-slate-100 lg:hidden" aria-label="Menyu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-1 border-t border-ink/5 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">
          {[{ name: 'Bosh sahifa', href: '/' }, ...navLinks].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`block rounded-xl px-4 py-3 font-semibold ${isActive(item.href) || pathname === item.href ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-100'}`}>
              {item.name}
            </Link>
          ))}
          <a href={tel} className="btn-outline mt-2 w-full"><Phone className="h-4 w-4" /> {phone || 'Bog‘lanish'}</a>
        </div>
      )}
    </header>
  );
}
