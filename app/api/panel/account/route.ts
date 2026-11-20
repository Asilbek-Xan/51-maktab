import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, API_V1_PREFIX } from '@/lib/api';
import { COOKIE } from '@/lib/panel';

const PANEL_PREFIX = (process.env.PANEL_API_PREFIX || `${API_V1_PREFIX}/panel`).replace(/\/$/, '');

function setToken(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
}

/** DRF xato javobidan o'qiladigan matn */
function errorText(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback;
  const d = data as Record<string, unknown>;
  if (typeof d.detail === 'string') return d.detail;
  if (typeof d.error === 'string') return d.error;
  const parts = Object.values(d).flat().filter((v): v is string => typeof v === 'string');
  return parts.join(' ') || fallback;
}

/** Joriy foydalanuvchi logini */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });
  try {
    const me = await fetch(`${API_BASE_URL}${PANEL_PREFIX}/me/`, { headers: { Authorization: `Token ${token}` }, cache: 'no-store' });
    if (me.status === 401) return NextResponse.json({ error: 'Sessiya tugagan, qayta kiring' }, { status: 401 });
    const data = await me.json().catch(() => ({}));
    return NextResponse.json({ username: data?.username ?? '' });
  } catch {
    return NextResponse.json({ error: 'Serverga ulanib bo‘lmadi' }, { status: 502 });
  }
}

/**
 * Body: { current_password, new_password }
 * Django POST {PANEL}/change-password/ {old_password, new_password} → {detail, token}
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const current = String(body?.current_password ?? '');
  const newPassword = String(body?.new_password ?? '');

  if (!current) return NextResponse.json({ error: 'Joriy parolni kiriting' }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: 'Yangi parol kamida 8 belgi bo‘lsin' }, { status: 400 });

  try {
    const r = await fetch(`${API_BASE_URL}${PANEL_PREFIX}/change-password/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: current, new_password: newPassword }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) return NextResponse.json({ error: 'Sessiya tugagan, qayta kiring' }, { status: 401 });
    if (!r.ok) {
      console.error(`[account] change-password -> HTTP ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
      return NextResponse.json({ error: errorText(data, 'Saqlab bo‘lmadi') }, { status: r.status });
    }
    // Django eski tokenni bekor qiladi va yangisini qaytaradi
    if (data?.token) setToken(data.token);
    return NextResponse.json({ ok: true, relogin: !data?.token });
  } catch {
    return NextResponse.json({ error: 'Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring.' }, { status: 502 });
  }
}
