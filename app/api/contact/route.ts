import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://maktab51.pythonanywhere.com').replace(/\/$/, '');

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON so‘rovi noto‘g‘ri' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/v1/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const contentType = upstream.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await upstream.json()
      : { error: await upstream.text() };
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend API bilan bog‘lanib bo‘lmadi';
    console.error('Contact API proxy error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
