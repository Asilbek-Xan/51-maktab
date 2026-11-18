import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { API_BASE_URL, API_V1_PREFIX, clearApiMemoryCache } from '@/lib/api';
import { COOKIE } from '@/lib/panel';

const PANEL_PREFIX = (process.env.PANEL_API_PREFIX || `${API_V1_PREFIX}/panel`).replace(/\/$/, '');

/** Brauzer → Next (token httpOnly cookie'da) → Django panel API. Token hech qachon brauzer JS'iga chiqmaydi. */
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });

  // Hamma so'rov (o'qish ham) panel API'ga boradi: ommaviy API 30 soniya keshlanadi,
  // faqat e'lon qilingan yozuvlarni va qisqartirilgan maydonlarni (masalan, yangilik matnisiz) qaytaradi.
  const suffix = params.path.filter(Boolean).join('/');
  const url = `${API_BASE_URL}${PANEL_PREFIX}/${suffix}/${req.nextUrl.search}`;
  const headers: Record<string, string> = { Authorization: `Token ${token}` };
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);

  try {
    const r = await fetch(url, { method: req.method, headers, body: hasBody ? await req.arrayBuffer() : undefined, cache: 'no-store', signal: AbortSignal.timeout(45_000) });
    if (!r.ok) {
      // Vercel loglarida sababni ko'rish uchun (vercel logs)
      const snippet = await r.clone().text().then((t) => t.slice(0, 300)).catch(() => '');
      console.error(`[panel] ${req.method} /${suffix}/ -> HTTP ${r.status}: ${snippet}`);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD' && r.ok) {
      // sayt keshini darhol yangilash
      clearApiMemoryCache();
      revalidateTag('api');
      revalidatePath('/', 'layout');
    }
    if (r.status === 401) return NextResponse.json({ error: 'Sessiya tugagan, qayta kiring' }, { status: 401 });
    if (r.status === 204) return new NextResponse(null, { status: 204 });
    return new NextResponse(await r.arrayBuffer(), { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' } });
  } catch (error) {
    const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    console.error(`[panel] ${req.method} /${suffix}/ -> ${timeout ? 'timeout' : 'fetch failed'}:`, error instanceof Error ? (error.cause ?? error.message) : error);
    return NextResponse.json({ error: timeout ? 'Server javob bermadi (45 soniya). Qayta urinib ko‘ring.' : 'Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring.' }, { status: timeout ? 504 : 502 });
  }
}

// Rasm yuklash sekin bo'lishi mumkin — Vercel funksiyasiga ko'proq vaqt
export const maxDuration = 60;

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
