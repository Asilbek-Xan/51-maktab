import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL, API_V1_PREFIX } from '@/lib/api';
import { COOKIE } from '@/lib/panel';

const PANEL_PREFIX = (process.env.PANEL_API_PREFIX || `${API_V1_PREFIX}/panel`).replace(/\/$/, '');
const PUBLIC_PREFIX = API_V1_PREFIX;

/** Brauzer → Next (token httpOnly cookie'da) → Django panel API. Token hech qachon brauzer JS'iga chiqmaydi. */
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });

  const [endpoint, ...resourcePath] = params.path;
  const readOnlyMethod = req.method === 'GET' || req.method === 'HEAD';
  const prefix = readOnlyMethod && endpoint !== 'messages' ? PUBLIC_PREFIX : PANEL_PREFIX;
  const suffix = [endpoint, ...resourcePath].filter(Boolean).join('/');
  const url = `${API_BASE_URL}${prefix}/${suffix}/${req.nextUrl.search}`;
  const headers: Record<string, string> = { Authorization: `Token ${token}` };
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);

  try {
    const r = await fetch(url, { method: req.method, headers, body: hasBody ? await req.arrayBuffer() : undefined, cache: 'no-store' });
    if (req.method !== 'GET') revalidatePath('/', 'layout'); // sayt keshini darhol yangilash
    if (r.status === 204) return new NextResponse(null, { status: 204 });
    return new NextResponse(await r.arrayBuffer(), { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' } });
  } catch {
    return NextResponse.json({ error: 'Serverga ulanib bo‘lmadi' }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
