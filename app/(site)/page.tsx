import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Laptop2, Palette, Trophy, UserRound, Medal } from 'lucide-react';
import Marquee from '@/components/Marquee';
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import NewsCard from '@/components/NewsCard';
import ContactForm from '@/components/ContactForm';
import { safeGet, HomeData, mediaUrl, dateLabel } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import { absoluteSiteUrl, SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/site';
import EmptyState from '@/components/EmptyState';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  ...(SITE_URL ? {
    alternates: { canonical: absoluteSiteUrl('/') },
    openGraph: {
      type: 'website', locale: 'uz_UZ', siteName: SITE_NAME, url: absoluteSiteUrl('/'),
      title: '51-sonli maktab | Muzrabot tumani, Surxondaryo viloyati',
      description: "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabining rasmiy axborot portali.",
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
  } : {}),
};

const directions = [
  { icon: BookOpen, title: 'Chuqurlashtirilgan fanlar', text: 'Aniq fanlar va ona tilidan qo‘shimcha mashg‘ulotlar, olimpiadalarga tayyorgarlik.' },
  { icon: Laptop2, title: 'Raqamli sinfxonalar', text: 'Kompyuter xonasi va interaktiv darsliklar orqali raqamli savodxonlik.' },
  { icon: Trophy, title: 'Sport va sog‘lom turmush', text: 'Sport to‘garaklari va tuman musobaqalarida faol ishtirok.' },
  { icon: Palette, title: 'San’at va to‘garaklar', text: 'Qo‘shiq, raqs va amaliy san’at orqali iste’dodni ochish.' },
];

export default async function HomePage() {
  const data = await safeGet<HomeData>('/home/');
  const school = data?.school;
  const news = data?.news ?? [];
  const achievements = data?.achievements ?? [];
  const fallbackText = school?.intro_text || school?.description || '';
  const banners = data?.banners ?? [];
  const slides: HeroSlide[] = (banners.length ? banners : [null]).map((b) => ({
    title: b?.title || undefined,
    text: b?.subtitle || fallbackText,
    image: mediaUrl(b?.image),
    href: b?.link_url || '/aloqa',
    button: b?.button_text || 'Murojaat yuborish',
  }));
  const [first, ...rest] = news;

  return (
    <div>
      {absoluteSiteUrl('/') && <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: 'Bosh sahifa', item: absoluteSiteUrl('/') }] }} />}
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <HeroSlider slides={slides} heading={school?.welcome_text?.trim() || undefined} district={school?.district || 'Muzrabot tumani, Surxondaryo viloyati'} workingHours={school?.working_hours || undefined} teachersCount={data?.teachers_count} />
      </div>

      <Marquee />

      {/* Directions */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ta’lim yo‘nalishlari</h2>
          <p className="mt-3 text-slate-500">1-sinfdan 11-sinfgacha mustahkam umumta’lim bazasi va har tomonlama rivojlanish.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {directions.map((d) => (
            <div key={d.title} className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><d.icon className="h-6 w-6" /></div>
              <h3 className="font-extrabold">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About + director */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl bg-brand-50">
            {mediaUrl(school?.director_photo)
              ? <Image src={mediaUrl(school?.director_photo)!} alt={school?.director_name ? `Maktab direktori ${school.director_name}` : '51-sonli maktab direktori'} loading="lazy" width={800} height={800} sizes="(max-width: 1024px) 100vw, 40vw" className="h-80 w-full object-cover" />
              : <div className="flex h-80 items-center justify-center text-brand-300"><UserRound className="h-24 w-24" /></div>}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ishonch va bilimga qurilgan maktab</h2>
            <p className="line-clamp-5 leading-relaxed text-slate-600">{school?.director_message || school?.description || 'Bizning maqsadimiz — har bir o‘quvchi qobiliyatini to‘liq namoyon eta oladigan zamonaviy muhit yaratish.'}</p>
            <p className="font-extrabold">{school?.director_name || 'Maktab direktori'} <span className="font-medium text-slate-400">· direktor</span></p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/biz-haqimizda" className="btn-primary">Maktab haqida <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/rahbariyat" className="btn-outline">Rahbariyat</Link>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Maktab hayoti yangiliklari</h2>
          <p className="mt-3 text-slate-500">Voqealar, yutuqlar va e’lonlar — bir joyda.</p>
        </div>
        {!data ? (
          <EmptyState kind="error" />
        ) : news.length === 0 ? (
          <EmptyState title="Yangiliklar yo‘q" text="Hozircha yangilik yoki e’lon kiritilmagan." />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
              <Link href={`/yangiliklar/${first.slug}`} className="card group relative block min-h-[22rem] overflow-hidden">
                {mediaUrl(first.image) && <Image src={mediaUrl(first.image)!} alt={first.title} loading="lazy" width={1200} height={800} sizes="(max-width: 1024px) 100vw, 60vw" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 text-white">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{first.kind_label}</span>
                  <h3 className="text-2xl font-extrabold leading-snug">{first.title}</h3>
                  <p className="text-sm text-white/70">{dateLabel(first.published_at)}</p>
                </div>
              </Link>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">{rest.slice(0, 2).map((n) => <NewsCard key={n.id} item={n} />)}</div>
            </div>
            {rest.length > 2 && <div className="mt-5 grid gap-5 md:grid-cols-3">{rest.slice(2, 5).map((n) => <NewsCard key={n.id} item={n} />)}</div>}
          </>
        )}
        <div className="mt-8 text-center"><Link href="/yangiliklar" className="btn-primary">Barcha yangiliklar <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">O‘quvchilar yutuqlari</h2>
          {!data ? <EmptyState kind="error" /> : achievements.length === 0 ? <EmptyState icon={Trophy} title="Yutuqlar yo‘q" text="Hozircha o‘quvchilar yutuqlari kiritilmagan." /> : (<>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.slice(0, 6).map((a) => (
              <Link key={a.id} href="/yutuqlar" className="card group flex gap-4 p-4 transition hover:-translate-y-0.5">
                {mediaUrl(a.image)
                  ? <Image src={mediaUrl(a.image)!} alt={`${a.student_name} — ${a.title}`} loading="lazy" width={80} height={80} sizes="80px" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600"><Medal className="h-7 w-7" /></div>}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-700">{a.level_label}{a.place ? ` · ${a.place}-o‘rin` : ''}</p>
                  <h3 className="mt-1 line-clamp-2 font-extrabold leading-snug">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{a.student_name}{a.grade ? ` · ${a.grade}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center"><Link href="/yutuqlar" className="btn-primary">Barcha yutuqlar <ArrowRight className="h-4 w-4" /></Link></div>
          </>)}
        </section>

      {/* Appeal */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Direktorga murojaat</h2>
          <p className="mt-3 text-slate-500">Formani to‘ldiring — maktab ma’muriyati siz bilan bog‘lanadi.</p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
