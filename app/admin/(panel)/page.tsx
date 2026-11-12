import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, API_V1_PREFIX } from '@/lib/api';
import { COOKIE, RESOURCES } from '@/lib/panel';

export const dynamic = 'force-dynamic';
const PANEL_PREFIX = (process.env.PANEL_API_PREFIX || `${API_V1_PREFIX}/panel`).replace(/\/$/, '');

async function count(endpoint: string, token: string): Promise<number | null> {
  try {
    const prefix = endpoint === 'messages' ? PANEL_PREFIX : API_V1_PREFIX;
    const r = await fetch(`${API_BASE_URL}${prefix}/${endpoint}/?page_size=1`, { headers: { Authorization: `Token ${token}` }, cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d) ? d.length : (d.count ?? null);
  } catch { return null; }
}

export default async function Dashboard() {
  const token = cookies().get(COOKIE)!.value;
  const list = RESOURCES.filter((r) => !r.singleton);
  const counts = await Promise.all(list.map((r) => count(r.endpoint, token)));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div><h1 className="text-3xl font-extrabold tracking-tight">Bosh panel</h1><p className="mt-1 text-slate-500">Sayt kontentini shu yerdan boshqaring.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r, i) => (
          <Link key={r.key} href={`/admin/${r.key}`} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">{r.title}</p>
            <p className="mt-2 text-4xl font-extrabold text-brand-700">{counts[i] ?? '—'}</p>
          </Link>
        ))}
        <Link href="/admin/school" className="rounded-3xl bg-brand-600 p-6 text-white shadow-sm transition hover:bg-brand-700">
          <p className="text-sm font-semibold text-white/80">Sozlamalar</p>
          <p className="mt-2 text-xl font-extrabold">Maktab ma’lumotlari va logotip</p>
        </Link>
      </div>
    </div>
  );
}
