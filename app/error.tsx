'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

/** Sayt bo'limidan tashqaridagi (masalan, admin panel) kutilmagan xatolar uchun */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <section className="max-w-xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Xatolik</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Nimadir noto‘g‘ri ketdi</h1>
        <p className="mt-4 leading-relaxed text-slate-500">Sahifani yuklashda xatolik yuz berdi. Qayta urinib ko‘ring.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary"><RotateCcw className="h-4 w-4" /> Qayta urinish</button>
          <Link href="/" className="btn-outline">Bosh sahifa</Link>
        </div>
        {error.digest && <p className="mt-6 text-xs text-slate-400">Xato kodi: {error.digest}</p>}
      </section>
    </main>
  );
}
