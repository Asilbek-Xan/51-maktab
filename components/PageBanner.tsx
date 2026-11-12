import Link from 'next/link';

export default function PageBanner({ title, text, crumb }: { title: string; text?: string; crumb: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <section className="banner-blue banner-arc relative overflow-hidden rounded-4xl px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="relative z-10">
          <p className="text-sm text-white/80"><Link href="/" className="hover:underline">Bosh sahifa</Link> / {crumb}</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          {text && <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90">{text}</p>}
        </div>
      </section>
    </div>
  );
}
