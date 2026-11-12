import { mediaUrl } from '@/lib/api';

/** Logo faqat API (school.logo) dan olinadi. Yo'q bo'lsa — neytral bo'sh doira (sun'iy "51" yo'q). */
export default function SchoolLogo({ src, alt, size = 48 }: { src: string | null | undefined; alt: string; size?: number }) {
  const url = mediaUrl(src);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} width={size} height={size} decoding="async" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="shrink-0 rounded-full bg-slate-200" style={{ width: size, height: size }} aria-hidden />
  );
}
