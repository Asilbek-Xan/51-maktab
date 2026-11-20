'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide { title?: string; text: string; image: string | null; href: string; button: string }

const INTERVAL = 7000;

/** Bosh sahifa bannerlari: bir nechta bo'lsa navbat bilan almashadi */
export default function HeroSlider({ slides, heading, district, workingHours, teachersCount }: { slides: HeroSlide[]; heading?: string; district: string; workingHours?: string; teachersCount?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(t);
  }, [n, paused, go]);

  const s = slides[i] ?? slides[0];
  const withImage = slides.some((x) => x.image);

  return (
    <section
      className="banner-blue banner-arc relative overflow-hidden rounded-4xl text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      aria-roledescription={n > 1 ? 'karusel' : undefined}
    >
      <div className={`relative z-10 grid items-center gap-8 px-6 py-12 sm:px-12 lg:py-0 ${withImage ? 'lg:grid-cols-[1.1fr_0.9fr]' : ''}`}>
        <div className="hero-seq space-y-6 lg:py-20">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">{district}</span>
          <div className="space-y-3">
            {heading && <p className="text-base font-bold text-white/85 sm:text-lg">{heading}</p>}
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">51-sonli maktab — Muzrabot tumani</h1>
          </div>
          <div key={i} className="animate-[fade-up_.5s_ease] space-y-2" aria-live={paused ? 'polite' : 'off'}>
            {n > 1 && s.title && <p className="text-lg font-extrabold text-yellow-300">{s.title}</p>}
            {s.text && <p className="line-clamp-4 max-w-lg text-lg leading-relaxed text-white/90">{s.text}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link href={s.href} className="btn-yellow">{s.button} <ArrowRight className="h-4 w-4" /></Link>
            {workingHours && <span className="text-sm text-white/80">Qabul: {workingHours}</span>}
          </div>
          {n > 1 && (
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => go(-1)} aria-label="Oldingi banner" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"><ChevronLeft className="h-5 w-5" /></button>
              <div className="flex gap-2">
                {slides.map((_, k) => (
                  <button key={k} type="button" onClick={() => setI(k)} aria-label={`${k + 1}-banner`} aria-current={k === i || undefined}
                    className={`h-2.5 rounded-full transition-all ${k === i ? 'w-7 bg-yellow-300' : 'w-2.5 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Keyingi banner" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"><ChevronRight className="h-5 w-5" /></button>
            </div>
          )}
        </div>
        {withImage && (
          <div className="relative mx-auto h-[22rem] w-full max-w-md self-end lg:h-[30rem] lg:max-w-none">
            {slides.map((x, k) => x.image && (
              <Image key={k} src={x.image} alt={x.title || 'Muzrabot tumani 51-sonli maktabi'} priority={k === 0} fetchPriority={k === 0 ? 'high' : 'low'} loading={k === 0 ? undefined : 'lazy'}
                width={900} height={960} sizes="(max-width: 1024px) 100vw, 50vw"
                className={`absolute inset-0 h-full w-full rounded-t-[10rem] object-cover transition-opacity duration-700 ${k === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden={k !== i} />
            ))}
            {!!teachersCount && teachersCount > 0 && (
              <div className="absolute -left-2 bottom-8 rounded-2xl bg-white px-5 py-3 text-ink shadow-xl">
                <p className="text-2xl font-extrabold text-brand-700">{teachersCount}</p>
                <p className="text-xs font-semibold text-slate-500">Pedagog xodim</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
