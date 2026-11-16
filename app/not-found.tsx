import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <section className="max-w-xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Sahifa topilmadi</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Noto‘g‘ri sahifaga kirdingiz
          </h1>
          <p className="mt-4 leading-relaxed text-slate-500">
            Bu manzilda sahifa mavjud emas yoki sahifa boshqa manzilga ko‘chirilgan.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex">
            Bosh sahifaga qaytish
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
