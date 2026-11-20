import { NextResponse } from 'next/server';
import { normalizeUzPhone } from '@/lib/phone';

const API_BASE_URL = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://maktab51.pythonanywhere.com').replace(/\/$/, '');

// Yangi murojaat haqida Telegram xabari (ixtiyoriy). Ikkalasi ham .env da bo'lsa ishlaydi.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type ContactInput = { name: string; phone: string; email: string; message: string };

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function validate(body: unknown): { data: ContactInput } | { error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const name = str(b.name);
  const email = str(b.email);
  const message = str(b.message);
  const phone = normalizeUzPhone(str(b.phone));

  if (name.length < 2 || name.length > 120) return { error: 'Ism-familiyani to‘g‘ri kiriting.' };
  if (!phone) return { error: 'Telefon raqami +998 XX XXX XX XX ko‘rinishida bo‘lishi kerak.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email manzili noto‘g‘ri.' };
  if (message.length < 3 || message.length > 3000) return { error: 'Murojaat matnini kiriting (3000 belgigacha).' };
  return { data: { name, phone, email, message } };
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function notifyTelegram({ name, phone, email, message }: ContactInput) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const text = [
    '📩 <b>Yangi murojaat — 51-maktab sayti</b>',
    '',
    `👤 <b>Ism:</b> ${escapeHtml(name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(phone)}`,
    ...(email ? [`✉️ <b>Email:</b> ${escapeHtml(email)}`] : []),
    '',
    `📝 ${escapeHtml(message)}`,
  ].join('\n');
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('Telegram notify error:', res.status, await res.text());
  } catch (error) {
    // Telegram ishlamasa ham murojaat saqlangan — foydalanuvchiga xato ko'rsatmaymiz.
    console.error('Telegram notify error:', error instanceof Error ? error.message : error);
  }
}

// ---- Spamdan himoya ----
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 daqiqa
const RATE_MAX = 3;                    // bir IP'dan shu oraliqda ko'pi bilan 3 ta murojaat
const MIN_FILL_MS = 3000;              // 3 soniyadan tez to'ldirilgan forma — bot
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

/** true — limitdan oshdi. Xotira funksiya nusxasi bo'yicha (Vercel'da qayta ishlatiladi), oddiy botlarga yetarli. */
function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.forEach((v, k) => { if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k); });
  return false;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON so‘rovi noto‘g‘ri' }, { status: 400 });
  }

  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  // Yashirin maydon to'ldirilgan — bot. Unga "muvaffaqiyat" deymiz, lekin hech qayerga yubormaymiz.
  if (str(raw.website)) return NextResponse.json({ ok: true }, { status: 201 });
  if (typeof raw.elapsed === 'number' && raw.elapsed < MIN_FILL_MS) {
    return NextResponse.json({ error: 'Forma juda tez yuborildi. Bir necha soniyadan so‘ng qayta urinib ko‘ring.' }, { status: 400 });
  }
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Juda ko‘p murojaat yuborildi. 10 daqiqadan so‘ng qayta urinib ko‘ring.' }, { status: 429 });
  }

  const checked = validate(body);
  if ('error' in checked) return NextResponse.json({ error: checked.error }, { status: 400 });

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/v1/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checked.data),
      cache: 'no-store',
    });
    const contentType = upstream.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await upstream.json()
      : { error: await upstream.text() };
    if (upstream.ok) await notifyTelegram(checked.data);
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend API bilan bog‘lanib bo‘lmadi';
    console.error('Contact API proxy error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
