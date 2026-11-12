import Link from 'next/link';
import { ArrowRight, BookOpen, Laptop2, Palette, Trophy, UserRound, Medal } from 'lucide-react';
import Marquee from '@/components/Marquee';
import NewsCard from '@/components/NewsCard';
import ContactForm from '@/components/ContactForm';
import { safeGet, HomeData, mediaUrl, dateLabel } from '@/lib/api';

export const revalidate = 60;

const directions = [
  { icon: BookOpen, title: 'Chuqurlashtirilgan fanlar', text: 'Aniq fanlar va ona tilidan qo‘shimcha mashg‘ulotlar, olimpiadalarga tayyorgarlik.' },
  { icon: Laptop2, title: 'Raqamli sinfxonalar', text: 'Kompyuter xonasi va interaktiv darsliklar orqali raqamli savodxonlik.' },
  { icon: Trophy, title: 'Sport va sog‘lom turmush', text: 'Sport to‘garaklari va tuman musobaqalarida faol ishtirok.' },
  { icon: Palette, title: 'San’at va to‘garaklar', text: 'Qo‘shiq, raqs va amaliy san’at orqali iste’dodni ochish.' },
];

export default async function HomePage() {
  const data = await safeGet<HomeData>('/home/');
  const school = data?.school;
  const banner = data?.banners?.[0];
  const news = data?.news ?? [];
  const achievements = data?.achievements ?? [];
  const title = banner?.title || school?.welcome_text || school?.tagline || 'Bilim, tarbiya va kelajak — 51-maktabda.';
  const intro = banner?.subtitle || school?.intro_text || school?.description || '';
  const heroImg = mediaUrl(banner?.image);
  const [first, ...rest] = news;

  return (
    <div>
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <section className="banner-blue banner-arc relative overflow-hidden rounded-4xl text-white">
          <div className="relative z-10 grid items-center gap-8 px-6 py-12 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
            <div className="hero-seq space-y-6 lg:py-20">
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">{school?.district || 'Muzrabot tumani, Surxondaryo viloyati'}</span>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">{title}</h1>
              {intro && <p className="line-clamp-4 max-w-lg text-lg leading-relaxed text-white/90">{intro}</p>}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link href={banner?.link_url || '/aloqa'} className="btn-yellow">{banner?.button_text || 'Murojaat yuborish'} <ArrowRight className="h-4 w-4" /></Link>
                {school?.working_hours && <span className="text-sm text-white/80">Qabul: {school.working_hours}</span>}
              </div>
            </div>
            {heroImg && (
              <div className="relative mx-auto w-full max-w-md self-end lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImg} alt={banner?.title || ''} fetchPriority="high" decoding="async" className="h-[22rem] w-full rounded-t-[10rem] object-cover lg:h-[30rem]" />
                {data && data.teachers_count > 0 && (
                  <div className="absolute -left-2 bottom-8 rounded-2xl bg-white px-5 py-3 text-ink shadow-xl">
                    <p className="text-2xl font-extrabold text-brand-700">{data.teachers_count}</p>
                    <p className="text-xs font-semibold text-slate-500">Pedagog xodim</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
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
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={mediaUrl(school?.director_photo)!} alt={school?.director_name || ''} loading="lazy" decoding="async" className="h-80 w-full object-cover" />
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
          <p className="card p-8 text-center text-slate-500">Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        ) : news.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Hozircha yangilik kiritilmagan.</p>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
              <Link href={`/yangiliklar/${first.slug}`} className="card group relative block min-h-[22rem] overflow-hidden">
                {mediaUrl(first.image) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={mediaUrl(first.image)!} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
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
      {achievements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">O‘quvchilar yutuqlari</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.slice(0, 6).map((a) => (
              <div key={a.id} className="card flex gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600"><Medal className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-bold text-brand-700">{a.level_label}{a.place ? ` · ${a.place}-o‘rin` : ''}</p>
                  <h3 className="mt-1 font-extrabold leading-snug">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{a.student_name}{a.grade ? ` · ${a.grade}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
