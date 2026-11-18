'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatUzPhone, uzPhoneDigits, UZ_PHONE_DIGITS } from '@/lib/phone';

const empty = { name: '', phone: '', email: '', message: '' };

export default function ContactForm({ id }: { id?: string }) {
  // phone — faqat +998 dan keyingi 9 ta raqam (masalan "901234567")
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: uzPhoneDigits(e.target.value) });
  const phoneIncomplete = form.phone.length > 0 && form.phone.length < UZ_PHONE_DIGITS;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.phone.length !== UZ_PHONE_DIGITS) {
      setError('Telefon raqamini to‘liq kiriting: +998 XX XXX XX XX'); setStatus('error');
      return;
    }
    setStatus('loading'); setError('');
    try {
      const payload = { ...form, phone: `+998 ${formatUzPhone(form.phone)}` };
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => null);
      if (res.ok) { setStatus('success'); setForm(empty); }
      else { setError(data?.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : `Xatolik (HTTP ${res.status})`); setStatus('error'); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server bilan aloqa uzildi'); setStatus('error');
    }
  }

  return (
    <form id={id} onSubmit={submit} className="card mx-auto w-full max-w-2xl space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold">Ism-familiya
          <input required maxLength={120} value={form.name} onChange={set('name')} placeholder="Ismingiz" className="field mt-1.5 font-normal" />
        </label>
        <label className="block text-sm font-bold">Telefon
          <span className="relative mt-1.5 block">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] font-normal text-ink">+998</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={formatUzPhone(form.phone)}
              onChange={setPhone}
              placeholder="90 123 45 67"
              pattern="\d{2} \d{3} \d{2} \d{2}"
              title="9 ta raqam: operator kodi va raqam, masalan 90 123 45 67"
              aria-invalid={phoneIncomplete || undefined}
              className="field pl-[3.75rem] font-normal"
            />
          </span>
        </label>
      </div>
      <label className="block text-sm font-bold">Email (ixtiyoriy)
        <input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" className="field mt-1.5 font-normal" />
      </label>
      <label className="block text-sm font-bold">Murojaat matni
        <textarea required rows={5} maxLength={3000} value={form.message} onChange={set('message')} placeholder="Murojaatingizni yozing" className="field mt-1.5 resize-y font-normal" />
      </label>
      <button disabled={status === 'loading'} className="btn-primary w-full rounded-xl disabled:opacity-60">
        <Send className="h-4 w-4" /> {status === 'loading' ? 'Yuborilmoqda…' : 'Murojaatni yuborish'}
      </button>
      {status === 'success' && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Murojaatingiz qabul qilindi. Rahmat!</p>}
      {status === 'error' && <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertCircle className="h-4 w-4" /> {error}</p>}
    </form>
  );
}
