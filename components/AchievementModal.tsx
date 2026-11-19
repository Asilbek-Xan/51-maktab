'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Medal, GraduationCap, CalendarDays } from 'lucide-react';

export interface AchievementModalData {
  title: string;
  student_name: string;
  grade?: string | null;
  teacher?: string | null;
  level_label?: string | null;
  place?: number | null;
  date?: string | null;
  image?: string | null;
  description?: string | null;
}

/** "Batafsil" tugmasi: kartochkalarni surmasdan, alohida oynada to'liq ma'lumot ko'rsatadi */
export default function AchievementModal({ data, placeClass }: { data: AchievementModalData; placeClass: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="self-start text-sm font-bold text-brand-700 transition hover:text-brand-900">
        Batafsil →
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="relative aspect-[16/10] bg-brand-50">
              {data.image && <Image src={data.image} alt={`${data.student_name} — ${data.title}`} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />}
              <button type="button" onClick={() => setOpen(false)} aria-label="Yopish" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-6">
              <div className="flex flex-wrap gap-2">
                {data.level_label && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{data.level_label}</span>}
                {data.place ? <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${placeClass}`}><Medal className="h-3.5 w-3.5" /> {data.place}-o‘rin</span> : null}
              </div>
              <h3 className="text-2xl font-extrabold leading-snug">{data.title}</h3>
              <p className="font-bold">{data.student_name}{data.grade ? <span className="font-medium text-slate-500"> · {data.grade} sinf</span> : null}</p>
              {data.teacher && <p className="flex items-center gap-1.5 text-sm text-slate-500"><GraduationCap className="h-4 w-4 shrink-0 text-brand-600" /> Ustoz: {data.teacher}</p>}
              {data.date && <p className="flex items-center gap-1.5 text-sm text-slate-400"><CalendarDays className="h-4 w-4" /> {data.date}</p>}
              {data.description && <p className="whitespace-pre-line border-t border-ink/5 pt-3 leading-relaxed text-slate-600">{data.description}</p>}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
