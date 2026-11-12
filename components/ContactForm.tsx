'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm({ id }: { id?: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => null);
      if (res.ok) { setStatus('success'); setForm({ name: '', phone: '', email: '', message: '' }); }
      else { setError(data?.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : `Xatolik (HTTP ${res.status})`); setStatus('error'); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server bilan aloqa uzildi'); setStatus('error');
    }
  }

  return (
    <form id={id} onSubmit={submit} className="card mx-auto w-full max-w-2xl space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold">Ism-familiya
          <input required value={form.name} onChange={set('name')} placeholder="Ismingiz" className="field mt-1.5 font-normal" />
        </label>
        <label className="block text-sm font-bold">Telefon
          <input required value={form.phone} onChange={set('phone')} placeholder="+998" className="field mt-1.5 font-normal" />
        </label>
      </div>
      <label className="block text-sm font-bold">Email (ixtiyoriy)
        <input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" className="field mt-1.5 font-normal" />
      </label>
      <label className="block text-sm font-bold">Murojaat matni
        <textarea required rows={5} value={form.message} onChange={set('message')} placeholder="Murojaatingizni yozing" className="field mt-1.5 resize-y font-normal" />
      </label>
      <button disabled={status === 'loading'} className="btn-primary w-full rounded-xl disabled:opacity-60">
        <Send className="h-4 w-4" /> {status === 'loading' ? 'Yuborilmoqda…' : 'Murojaatni yuborish'}
      </button>
      {status === 'success' && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Murojaatingiz qabul qilindi. Rahmat!</p>}
      {status === 'error' && <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertCircle className="h-4 w-4" /> {error}</p>}
    </form>
  );
}
