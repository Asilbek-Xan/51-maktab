'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Newspaper, Users, Trophy, Image as ImageIcon, MessageSquare, School, KeyRound, LogOut, ExternalLink, Menu, X, Bell } from 'lucide-react';
import { useNewMessages } from './useNewMessages';

const items = [
  { href: '/admin', label: 'Bosh panel', Icon: LayoutDashboard },
  { href: '/admin/news', label: 'Yangiliklar', Icon: Newspaper },
  { href: '/admin/messages', label: 'Murojaatlar', Icon: MessageSquare },
  { href: '/admin/teachers', label: 'Xodimlar', Icon: Users },
  { href: '/admin/achievements', label: 'Yutuqlar', Icon: Trophy },
  { href: '/admin/banners', label: 'Bannerlar', Icon: ImageIcon },
  { href: '/admin/school', label: 'Maktab ma’lumoti', Icon: School },
  { href: '/admin/account', label: 'Hisob (parol)', Icon: KeyRound },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { unread, permission, enableNotifications } = useNewMessages(path.startsWith('/admin/messages'));

  async function logout() {
    await fetch('/api/panel/auth', { method: 'DELETE' });
    router.replace('/admin/login'); router.refresh();
  }

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <p className="px-3 pb-4 pt-2 text-lg font-extrabold text-brand-700">51-maktab <span className="font-medium text-slate-400">panel</span></p>
      {items.map(({ href, label, Icon }) => {
        const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon className="h-[18px] w-[18px]" /> {label}
            {href === '/admin/messages' && unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-slate-100 pt-3">
        {permission === 'default' && <button onClick={enableNotifications} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"><Bell className="h-[18px] w-[18px]" /> Bildirishnomani yoqish</button>}
        {permission === 'denied' && <p className="px-3 py-2 text-xs text-slate-400">Bildirishnoma brauzerda bloklangan — sayt sozlamalaridan ruxsat bering.</p>}
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><ExternalLink className="h-[18px] w-[18px]" /> Saytni ko‘rish</a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-[18px] w-[18px]" /> Chiqish</button>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-extrabold text-brand-700">51-maktab panel{unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>}</span>
        <button onClick={() => setOpen(!open)} aria-label="Menyu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="fixed inset-x-0 bottom-0 top-[53px] z-20 bg-white lg:hidden">{nav}</div>}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{nav}</aside>
    </>
  );
}
