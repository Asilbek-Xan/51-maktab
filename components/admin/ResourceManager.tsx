'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import type { Resource, Field } from '@/lib/panel';
import { mediaUrl } from '@/lib/api';

type Row = Record<string, any>;
const api = (path: string) => `/api/panel/${path}`;

function cell(row: Row, c: Resource['columns'][number]) {
  const v = row[c.name];
  if (c.kind === 'image') { const u = mediaUrl(row.thumbnail || v); return u ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={u} alt="" loading="lazy" className="h-10 w-10 rounded-xl object-cover" /> : <span className="block h-10 w-10 rounded-xl bg-slate-100" />; }
  if (c.kind === 'bool') return v ? <Check className="h-4 w-4 text-emerald-600" /> : <span className="text-slate-300">—</span>;
  if (c.kind === 'date') return v ? new Date(v).toLocaleDateString('uz-UZ') : '—';
  const s = v == null || v === '' ? '—' : String(v);
  return <span className="line-clamp-2">{s}</span>;
}

export default function ResourceManager({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [single, setSingle] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(api(`${resource.endpoint}/${resource.singleton ? '' : '?page_size=200'}`), { cache: 'no-store' });
      if (r.status === 401) { window.location.href = '/admin/login'; return; }
      if (!r.ok) throw new Error(`Server javobi: HTTP ${r.status}`);
      const d = await r.json();
      if (resource.singleton) setSingle(d); else setRows(Array.isArray(d) ? d : d.results ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Yuklab bo‘lmadi'); }
    setLoading(false);
  }, [resource]);

  useEffect(() => { load(); }, [load]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  async function remove(row: Row) {
    if (!confirm(`“${row[resource.titleField] ?? row.id}” o‘chirilsinmi?`)) return;
    const r = await fetch(api(`${resource.endpoint}/${row.id}/`), { method: 'DELETE' });
    if (r.ok || r.status === 204) { setRows((p) => p.filter((x) => x.id !== row.id)); flash('O‘chirildi'); } else flash('O‘chirib bo‘lmadi');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{resource.title}</h1>
        {!resource.readOnly && !resource.singleton && <button onClick={() => setEditing('new')} className="btn-primary"><Plus className="h-4 w-4" /> Qo‘shish</button>}
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? (
        <div className="flex justify-center p-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : resource.singleton ? (
        single && <RecordForm resource={resource} initial={single} inline onSaved={(d) => { setSingle(d); flash('Saqlandi'); }} />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {resource.columns.map((c) => <th key={c.name} className="px-5 py-3.5 font-bold">{c.label}</th>)}<th className="w-28 px-5 py-3.5" />
            </tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={resource.columns.length + 1} className="p-10 text-center text-slate-400">Hozircha yozuv yo‘q</td></tr>}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  {resource.columns.map((c) => <td key={c.name} className="max-w-xs px-5 py-3">{cell(row, c)}</td>)}
                  <td className="px-5 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(row)} aria-label="Ochish" className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(row)} aria-label="O‘chirish" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:p-10" onClick={() => setEditing(null)}>
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{editing === 'new' ? `Yangi ${resource.single}` : resource.readOnly ? 'Murojaat' : `Tahrirlash`}</h2>
              <button onClick={() => setEditing(null)} aria-label="Yopish" className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <RecordForm resource={resource} initial={editing === 'new' ? null : editing} onSaved={() => { setEditing(null); flash('Saqlandi'); load(); }} />
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function RecordForm({ resource, initial, inline, onSaved }: { resource: Resource; initial: Row | null; inline?: boolean; onSaved: (d: Row) => void }) {
  const [values, setValues] = useState<Row>(() => Object.fromEntries(resource.fields.map((f) => [f.name, initial?.[f.name] ?? (f.type === 'checkbox' ? false : '')])));
  const [files, setFiles] = useState<Record<string, File>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (n: string, v: any) => setValues((p) => ({ ...p, [n]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const fd = new FormData();
    resource.fields.forEach((f) => {
      if (f.type === 'image') { if (files[f.name]) fd.append(f.name, files[f.name]); return; }
      const v = values[f.name];
      if (f.type === 'checkbox') fd.append(f.name, v ? 'true' : 'false');
      else if (v !== '' && v != null) fd.append(f.name, String(v));
    });
    const isNew = !initial?.id && !resource.singleton;
    const url = resource.singleton ? `${resource.endpoint}/` : isNew ? `${resource.endpoint}/` : `${resource.endpoint}/${initial!.id}/`;
    try {
      const r = await fetch(api(url), { method: isNew ? 'POST' : 'PATCH', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ') || `Xatolik (HTTP ${r.status})`); setBusy(false); return; }
      onSaved(d);
    } catch { setError('Serverga ulanib bo‘lmadi'); }
    setBusy(false);
  }

  const ro = resource.readOnly;
  return (
    <form onSubmit={submit} className={`space-y-4 ${inline ? 'rounded-3xl bg-white p-6 shadow-sm sm:p-8' : ''}`}>
      <div className={inline ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
        {resource.fields.map((f) => <FieldInput key={f.name} f={f} value={values[f.name]} current={initial?.[f.name]} file={files[f.name]} disabled={ro} onChange={(v) => set(f.name, v)} onFile={(file) => setFiles((p) => ({ ...p, [f.name]: file }))} wide={inline && (f.type === 'textarea')} />)}
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {!ro && <button disabled={busy} className="btn-primary rounded-xl disabled:opacity-60">{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>}
    </form>
  );
}

function FieldInput({ f, value, current, file, disabled, onChange, onFile, wide }: { f: Field; value: any; current: any; file?: File; disabled?: boolean; onChange: (v: any) => void; onFile: (f: File) => void; wide?: boolean }) {
  const label = <span className="mb-1.5 block text-sm font-bold">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>;
  const wrap = (child: React.ReactNode) => <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>{label}{child}{f.hint && <span className="mt-1 block text-xs text-slate-400">{f.hint}</span>}</label>;
  if (f.type === 'checkbox') return <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!value} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 rounded accent-brand-600" /> {f.label}</label>;
  if (f.type === 'textarea') return wrap(<textarea rows={4} value={value ?? ''} disabled={disabled} required={f.required} onChange={(e) => onChange(e.target.value)} className="field resize-y" />);
  if (f.type === 'select') return wrap(<select value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="field">{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>);
  if (f.type === 'image') {
    const preview = file ? URL.createObjectURL(file) : mediaUrl(current);
    return wrap(<div className="flex items-center gap-4">
      {preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <span className="h-16 w-16 rounded-2xl bg-slate-100" />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-bold file:text-brand-700 hover:file:bg-brand-100" />
    </div>);
  }
  return wrap(<input type={f.type} value={value ?? ''} disabled={disabled} required={f.required} onChange={(e) => onChange(e.target.value)} className="field" />);
}
