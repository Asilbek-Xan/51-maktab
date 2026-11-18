import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_V1_PREFIX } from '@/lib/api';
import { COOKIE } from '@/lib/panel';

/** Panel uchun: ommaviy (saytdagi) API qaysi yozuvlarni ko'rsatayotganini aniqlash — faqat id'lar. */
const ALLOWED = new Set(['news', 'teachers', 'achievements', 'banners']);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { resource: string } }) {
  if (!req.cookies.get(COOKIE)?.value) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });
  if (!ALLOWED.has(params.resource)) return NextResponse.json({ ids: null });
  const ids: number[] = [];
  try {
    let url: string | null = `${API_BASE_URL}${API_V1_PREFIX}/${params.resource}/?page_size=200`;
    for (let i = 0; url && i < 20; i++) {
      // Django javobi 30 soniya keshlanadi — kesh chetlab o'tilsin
      const r: Response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      if (!r.ok) return NextResponse.json({ ids: null });
      const d = await r.json();
      const list: { id: number }[] = Array.isArray(d) ? d : d.results ?? [];
      ids.push(...list.map((x) => x.id));
      url = Array.isArray(d) ? null : d.next;
    }
    return NextResponse.json({ ids });
  } catch {
    return NextResponse.json({ ids: null });
  }
}
