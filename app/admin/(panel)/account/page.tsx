'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

type Status = { kind: 'ok' | 'error'; text: string } | null;

function PasswordInput({ value, onChange, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input required type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="field w-full pr-11" />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Parolni yashirish' : 'Parolni ko‘rsatish'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function Message({ status }: { status: Status }) {
  if (!status) return null;
  return status.kind === 'ok'
    ? <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" /> {status.text}</p>
    : <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{status.text}</p>;
}

export default function AccountPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passStatus, setPassStatus] = useState<Status>(null);
  const [passBusy, setPassBusy] = useState(false);

  useEffect(() => {
    fetch('/api/panel/account', { cache: 'no-store' }).then((r) => r.json()).then((d) => setUsername(d?.username || '')).catch(() => {});
  }, []);

  async function send(payload: Record<string, string>) {
    const r = await fetch('/api/panel/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.status === 401 && d?.error?.includes('Sessiya')) { router.replace('/admin/login'); return null; }
    return { ok: !!r?.ok, data: d ?? {} };
  }

  async function relogin() {
    await fetch('/api/panel/auth', { method: 'DELETE' });
    setTimeout(() => { router.replace('/admin/login'); router.refresh(); }, 1500);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPassStatus(null);
    if (newPass.length < 8) { setPassStatus({ kind: 'error', text: 'Yangi parol kamida 8 belgi bo‘lsin' }); return; }
    if (newPass !== newPass2) { setPassStatus({ kind: 'error', text: 'Yangi parollar bir-biriga mos emas' }); return; }
    if (newPass === curPass) { setPassStatus({ kind: 'error', text: 'Yangi parol eskisidan farq qilishi kerak' }); return; }
    setPassBusy(true);
    const res = await send({ current_password: curPass, new_password: newPass });
    setPassBusy(false);
    if (!res) return;
    if (!res.ok) { setPassStatus({ kind: 'error', text: res.data.error || 'Xatolik yuz berdi' }); return; }
    setCurPass(''); setNewPass(''); setNewPass2('');
    if (res.data.relogin) { setPassStatus({ kind: 'ok', text: 'Parol o‘zgartirildi. Yangi parol bilan qayta kiring…' }); relogin(); }
    else setPassStatus({ kind: 'ok', text: 'Parol o‘zgartirildi.' });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Hisob sozlamalari</h1>
        <p className="mt-1 text-sm text-slate-500">{username ? <>Hozirgi login: <span className="font-bold text-ink">{username}</span></> : 'Parolni o‘zgartirish'}</p>
      </div>

        <form onSubmit={changePassword} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><KeyRound className="h-5 w-5" /></div>
            <h2 className="font-extrabold">Parolni o‘zgartirish</h2>
          </div>
          <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-600">Joriy parol</span>
            <PasswordInput value={curPass} onChange={setCurPass} placeholder="Joriy parol" autoComplete="current-password" />
          </label>
          <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-600">Yangi parol</span>
            <PasswordInput value={newPass} onChange={setNewPass} placeholder="Kamida 8 belgi" autoComplete="new-password" />
          </label>
          <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-600">Yangi parolni takrorlang</span>
            <PasswordInput value={newPass2} onChange={setNewPass2} placeholder="Yangi parol" autoComplete="new-password" />
          </label>
          <Message status={passStatus} />
          <button disabled={passBusy} className="btn-primary w-full rounded-xl disabled:opacity-60">{passBusy ? 'Saqlanmoqda…' : 'Parolni saqlash'}</button>
        </form>
    </div>
  );
}
