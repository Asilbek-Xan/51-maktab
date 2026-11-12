'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await fetch('/api/panel/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok) { router.replace('/admin'); router.refresh(); }
    else { setError(d?.error || 'Xatolik yuz berdi'); setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-[0_20px_50px_-20px_rgba(37,99,235,.25)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><LockKeyhole className="h-6 w-6" /></div>
        <div><h1 className="text-2xl font-extrabold">Boshqaruv paneli</h1><p className="mt-1 text-sm text-slate-500">Maktab xodimlari uchun kirish</p></div>
        <input required autoFocus value={username} onChange={(e) => setU(e.target.value)} placeholder="Login" className="field" autoComplete="username" />
        <input required type="password" value={password} onChange={(e) => setP(e.target.value)} placeholder="Parol" className="field" autoComplete="current-password" />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={busy} className="btn-primary w-full rounded-xl disabled:opacity-60">{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button>
      </form>
    </main>
  );
}
