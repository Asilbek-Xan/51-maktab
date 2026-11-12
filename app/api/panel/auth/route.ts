import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/api';
import { COOKIE } from '@/lib/panel';

const PREFIX = (process.env.PANEL_API_PREFIX || '/api/v1/panel').replace(/\/$/, '');

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) return NextResponse.json({ error: 'Login va parolni kiriting' }, { status: 400 });
  try {
    const r = await fetch(`${API_BASE_URL}${PREFIX}/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.token) return NextResponse.json({ error: 'Login yoki parol noto‘g‘ri' }, { status: 401 });
    cookies().set(COOKIE, data.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Serverga ulanib bo‘lmadi' }, { status: 502 });
  }
}

export async function DELETE() {
  cookies().delete(COOKIE);
  return NextResponse.json({ ok: true });
}
