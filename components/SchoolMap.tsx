import { MapPin, ArrowRight } from 'lucide-react';
import type { SchoolProfile } from '@/lib/api';
import { schoolGeo, SCHOOL_LOCATION } from '@/lib/site';

export default function SchoolMap({ school, title = 'Maktab joylashuvi' }: { school?: SchoolProfile | null; title?: string }) {
  const geo = schoolGeo(school);
  const address = school?.address || SCHOOL_LOCATION.address;
  return (
    <section aria-labelledby="school-map-title" className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><MapPin className="h-5 w-5" /></div>
          <div>
            <h2 id="school-map-title" className="font-extrabold">{title}</h2>
            <p className="text-sm text-slate-500">{address}</p>
          </div>
        </div>
        <a href={geo.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">
          Google Maps’da ochish <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        title={`${address} — xaritada`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full border-0"
        src={geo.embedUrl}
      />
    </section>
  );
}
