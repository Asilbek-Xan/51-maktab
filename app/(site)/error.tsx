'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

/** Sayt sahifalarida kutilmagan xato bo'lsa — menyu va footer joyida qoladi */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Xatolik</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Sahifani ochib bo‘lmadi</h1>
      <p className="mt-4 leading-relaxed text-slate-500">Kutilmagan xatolik yuz berdi. Bir ozdan so‘ng qayta urinib ko‘ring yoki bosh sahifaga qayting.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary"><RotateCcw className="h-4 w-4" /> Qayta urinish</button>
        <Link href="/" className="btn-outline">Bosh sahifa</Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-slate-400">Xato kodi: {error.digest}</p>}
    </section>
  );
}
