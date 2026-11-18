'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import type { Resource, Field } from '@/lib/panel';
import { mediaUrl } from '@/lib/api';

type Row = Record<string, any>;
const api = (path: string) => `/api/panel/${path}`;

/**
 * Vercel bitta so'rovda 4.5 MB dan ko'p qabul qilmaydi (localhost'da bunday cheklov yo'q).
 * Shuning uchun katta rasmni brauzerning o'zida kichraytiramiz: eng uzun tomoni 1920px, JPEG 85%.
 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  const keepPng = file.type === 'image/png';
  if (file.size <= (keepPng ? 2 : 1.5) * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d')!;
    if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = keepPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = keepPng ? file.name : file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type });
  } catch { return file; }
}

/** DRF xatosini o'qiladigan matnga aylantiradi: {"title": ["..."]} → "Sarlavha: ..." */
function errorText(d: unknown, resource: Resource): string {
  if (!d || typeof d !== 'object') return '';
  return Object.entries(d as Record<string, unknown>).map(([k, v]) => {
    const label = k === 'detail' || k === 'error' || k === 'non_field_errors' ? '' : (resource.fields.find((f) => f.name === k)?.label ?? k);
    const text = Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return label ? `${label}: ${text}` : text;
  }).join(' · ');
}

function cell(row: Row, c: Resource['columns'][number]) {
  const v = row[c.name];
  if (c.kind === 'image') { const u = mediaUrl(row.thumbnail || v); return u ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={u} alt="" loading="lazy" className="h-10 w-10 rounded-xl object-cover" /> : <span className="block h-10 w-10 rounded-xl bg-slate-100" />; }
  if (c.kind === 'bool') return v ? <Check className="h-4 w-4 text-emerald-600" /> : <span className="text-slate-300">—</span>;
  if (c.kind === 'date') return v ? new Date(v).toLocaleDateString('uz-UZ') : '—';
  const s = v == null || v === '' ? '—' : typeof v === 'object' ? String(v.full_name ?? v.name ?? v.title ?? v.id) : String(v);
  return <span className="line-clamp-2">{s}</span>;
}

/**
 * Django modelidagi "saytda ko'rsatish" belgisi (nomi loyihaga qarab farq qiladi).
 * Panel API qaytargan yozuvlardan avtomatik aniqlanadi va formaga qo'shiladi.
 */
const VISIBILITY_KEYS = ['is_published', 'is_active', 'is_visible', 'is_public', 'published', 'active', 'visible', 'show_on_site'];
const tracksSite = (resource: Resource) => !resource.singleton && !resource.readOnly;

function hiddenReason(row: Row, visKeys: string[]): string {
  const off = visKeys.find((k) => row[k] === false);
  if (off) return 'Saytda ko‘rsatish o‘chirilgan';
  if (row.published_at && new Date(row.published_at) > new Date()) return `E’lon vaqti: ${new Date(row.published_at).toLocaleString('uz-UZ')}`;
  return 'Backend saytga bermayapti';
}

export default function ResourceManager({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [single, setSingle] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [toast, setToast] = useState('');
  const [publicIds, setPublicIds] = useState<Set<number> | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [r, pub] = await Promise.all([
        fetch(api(`${resource.endpoint}/${resource.singleton ? '' : '?page_size=200'}`), { cache: 'no-store' }),
        tracksSite(resource) ? fetch(`/api/panel-public-ids/${resource.endpoint}`, { cache: 'no-store' }).then((x) => x.json()).catch(() => null) : null,
      ]);
      if (r.status === 401) { window.location.href = '/admin/login'; return; }
      if (!r.ok) throw new Error(`Server javobi: HTTP ${r.status}`);
      const d = await r.json();
      if (resource.singleton) setSingle(d); else setRows(Array.isArray(d) ? d : d.results ?? []);
      setPublicIds(Array.isArray(pub?.ids) ? new Set(pub.ids) : null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Yuklab bo‘lmadi'); }
    setLoading(false);
  }, [resource]);

  // Panel API qaytargan, lekin formada yo'q "ko'rsatish" belgilarini topamiz
  const visKeys = useMemo(() => {
    if (!tracksSite(resource)) return [];
    const names = new Set(resource.fields.map((f) => f.name));
    return VISIBILITY_KEYS.filter((k) => !names.has(k) && rows.some((row) => typeof row[k] === 'boolean'));
  }, [rows, resource]);
  const formResource = useMemo<Resource>(() => ({
    ...resource,
    fields: [...resource.fields, ...visKeys.map((k) => ({ name: k, label: 'Saytda ko‘rsatish', type: 'checkbox' as const, hint: `Backend maydoni: ${k}` }))],
  }), [resource, visKeys]);
  const hiddenCount = publicIds ? rows.filter((row) => !publicIds.has(row.id)).length : 0;

  async function publish(row: Row) {
    const key = visKeys.find((k) => row[k] === false);
    if (!key) return;
    const fd = new FormData(); fd.append(key, 'true');
    const r = await fetch(api(`${resource.endpoint}/${row.id}/`), { method: 'PATCH', body: fd });
    if (r.ok) { flash('Saytga chiqarildi'); load(); }
    else { const d = await r.json().catch(() => ({})); flash(`Bo‘lmadi: ${errorText(d, resource) || `HTTP ${r.status}`}`); }
  }

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (resource.key !== 'messages') return;
    window.addEventListener('panel:new-messages', load);
    return () => window.removeEventListener('panel:new-messages', load);
  }, [resource.key, load]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  // Ro'yxatda ba'zi maydonlar bo'lmasligi mumkin — tahrirlashdan oldin to'liq yozuvni olamiz.
  const [opening, setOpening] = useState<number | null>(null);
  async function openEdit(row: Row) {
    setOpening(row.id);
    try {
      const r = await fetch(api(`${resource.endpoint}/${row.id}/`), { cache: 'no-store' });
      if (r.status === 401) { window.location.href = '/admin/login'; return; }
      setEditing(r.ok ? { ...row, ...(await r.json()) } : row);
    } catch { setEditing(row); }
    setOpening(null);
  }

  async function remove(row: Row) {
    if (!confirm(`“${row[resource.titleField] ?? row.id}” o‘chirilsinmi?`)) return;
    try {
      const r = await fetch(api(`${resource.endpoint}/${row.id}/`), { method: 'DELETE' });
      if (r.status === 401) { window.location.href = '/admin/login'; return; }
      if (r.ok || r.status === 204) { setRows((p) => p.filter((x) => x.id !== row.id)); flash('O‘chirildi'); load(); }
      else { const d = await r.json().catch(() => ({})); flash(`O‘chirib bo‘lmadi: ${errorText(d, resource) || `HTTP ${r.status}`}`); }
    } catch { flash('Serverga ulanib bo‘lmadi'); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{resource.title}</h1>
        {!resource.readOnly && !resource.singleton && <button onClick={() => setEditing('new')} className="btn-primary"><Plus className="h-4 w-4" /> Qo‘shish</button>}
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {!loading && hiddenCount > 0 && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {hiddenCount} ta yozuv saytda ko‘rinmayapti.{' '}
          {visKeys.length ? 'Ularni “Saytga chiqarish” tugmasi bilan yoki tahrirlashda “Saytda ko‘rsatish” belgisini yoqib chiqaring.' : 'Backend ularni ommaviy API’ga bermayapti — Django’dagi filtrni tekshirish kerak.'}
        </p>
      )}
      {loading ? (
        <div className="flex justify-center p-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : resource.singleton ? (
        single && <RecordForm resource={resource} initial={single} inline onSaved={(d) => { setSingle(d); flash('Saqlandi'); }} />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {resource.columns.map((c) => <th key={c.name} className="px-5 py-3.5 font-bold">{c.label}</th>)}{publicIds && <th className="px-5 py-3.5 font-bold">Saytda</th>}<th className="w-28 px-5 py-3.5" />
            </tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={resource.columns.length + 2} className="p-10 text-center text-slate-400">Hozircha yozuv yo‘q</td></tr>}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  {resource.columns.map((c) => <td key={c.name} className="max-w-xs px-5 py-3">{cell(row, c)}</td>)}
                  {publicIds && <td className="px-5 py-3">
                    {publicIds.has(row.id)
                      ? <Check className="h-4 w-4 text-emerald-600" aria-label="Saytda ko‘rinadi" />
                      : <div className="space-y-1">
                          <span className="inline-block whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800" title={hiddenReason(row, visKeys)}>Ko‘rinmaydi</span>
                          {visKeys.some((k) => row[k] === false)
                            ? <button onClick={() => publish(row)} className="block whitespace-nowrap text-xs font-bold text-brand-700 hover:underline">Saytga chiqarish</button>
                            : <span className="block max-w-[10rem] text-xs text-slate-400">{hiddenReason(row, visKeys)}</span>}
                        </div>}
                  </td>}
                  <td className="px-5 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(row)} disabled={opening === row.id} aria-label="Ochish" className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700">{opening === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}</button>
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
            <RecordForm resource={formResource} initial={editing === 'new' ? null : editing} onSaved={() => { setEditing(null); flash('Saqlandi'); load(); }} />
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function RecordForm({ resource, initial, inline, onSaved }: { resource: Resource; initial: Row | null; inline?: boolean; onSaved: (d: Row) => void }) {
  // Bog'langan yozuv {id, full_name} ko'rinishida keladi — formada faqat id saqlanadi
  const norm = (v: any) => (v && typeof v === 'object' && 'id' in v ? String(v.id) : typeof v === 'number' ? String(v) : v);
  const [values, setValues] = useState<Row>(() => Object.fromEntries(resource.fields.map((f) => [f.name, norm(initial?.[f.name]) ?? (f.type === 'checkbox' ? VISIBILITY_KEYS.includes(f.name) : '')])));
  const [files, setFiles] = useState<Record<string, File>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (n: string, v: any) => setValues((p) => ({ ...p, [n]: v }));

  // relation maydonlari uchun variantlarni yuklash (masalan, ustozlar)
  const [relOptions, setRelOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  useEffect(() => {
    resource.fields.filter((f) => f.relation).forEach(async (f) => {
      try {
        const r = await fetch(api(`${f.relation!.endpoint}/?page_size=200`), { cache: 'no-store' });
        const d = await r.json();
        const list: Row[] = Array.isArray(d) ? d : d.results ?? [];
        setRelOptions((p) => ({ ...p, [f.name]: list.map((x) => ({ value: String(x.id), label: String(x[f.relation!.labelField] ?? x.id) })) }));
      } catch { /* ro'yxat yuklanmasa — select bo'sh qoladi */ }
    });
  }, [resource]);
  const withOptions = (f: Field): Field => (f.relation ? { ...f, options: relOptions[f.name] ?? [] } : f);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const isNew = !initial?.id && !resource.singleton;
    const fd = new FormData();
    resource.fields.forEach((f) => {
      if (f.type === 'image') { if (files[f.name]) fd.append(f.name, files[f.name]); return; }
      const v = values[f.name];
      const empty = v === '' || v == null;
      const hadValue = initial?.[f.name] !== '' && initial?.[f.name] != null;
      if (f.type === 'checkbox') fd.append(f.name, v ? 'true' : 'false');
      else if (!empty) fd.append(f.name, String(v).trim());
      // Tahrirlashda maydon tozalansa — bo'sh qiymat yuboramiz, aks holda eski matn qolib ketardi.
      else if (!isNew && hadValue) fd.append(f.name, '');
    });
    const url = resource.singleton ? `${resource.endpoint}/` : isNew ? `${resource.endpoint}/` : `${resource.endpoint}/${initial!.id}/`;
    const totalSize = Object.values(files).reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_UPLOAD_BYTES) { setError(`Rasm juda katta (${(totalSize / 1024 / 1024).toFixed(1)} MB). 4 MB gacha rasm tanlang.`); setBusy(false); return; }
    try {
      const r = await fetch(api(url), { method: isNew ? 'POST' : 'PATCH', body: fd });
      if (r.status === 401) { window.location.href = '/admin/login'; return; }
      if (r.status === 413) { setError('Rasm juda katta — kichikroq rasm tanlang.'); setBusy(false); return; }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(errorText(d, resource) || `Xatolik (HTTP ${r.status})`); setBusy(false); return; }
      onSaved(d);
    } catch { setError('Serverga ulanib bo‘lmadi'); }
    setBusy(false);
  }

  const ro = resource.readOnly;
  return (
    <form onSubmit={submit} className={`space-y-4 ${inline ? 'rounded-3xl bg-white p-6 shadow-sm sm:p-8' : ''}`}>
      <div className={inline ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
        {resource.fields.map((f) => <FieldInput key={f.name} f={withOptions(f)} value={values[f.name]} current={initial?.[f.name]} file={files[f.name]} disabled={ro} onChange={(v) => set(f.name, v)} onFile={async (file) => { const small = await shrinkImage(file); setFiles((p) => ({ ...p, [f.name]: small })); }} wide={inline && (f.type === 'textarea')} />)}
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
  if (f.type === 'select') {
    // Backend'dan ro'yxatda yo'q eski qiymat kelsa ham yo'qolib ketmasin
    const known = !value || f.options?.some((o) => o.value === value);
    return wrap(<select value={value ?? ''} disabled={disabled} required={f.required} onChange={(e) => onChange(e.target.value)} className="field">
      <option value="" disabled={f.required}>— Tanlang —</option>
      {!known && <option value={value}>{String(value)}</option>}
      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>);
  }
  if (f.type === 'number') {
    // Faqat raqam: harf, minus, nuqta, "e" kiritilmaydi
    return wrap(<input type="text" inputMode="numeric" pattern="\d*" value={value ?? ''} disabled={disabled} required={f.required}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (!digits) return onChange('');
        const n = Number(digits);
        onChange(String(f.max != null ? Math.min(n, f.max) : n));
      }}
      onBlur={() => { if (value !== '' && value != null && f.min != null && Number(value) < f.min) onChange(String(f.min)); }}
      placeholder={f.min != null && f.max != null ? `${f.min}–${f.max}` : undefined}
      className="field" />);
  }
  if (f.type === 'image') {
    const preview = file ? URL.createObjectURL(file) : mediaUrl(current);
    return wrap(<div className="flex items-center gap-4">
      {preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <span className="h-16 w-16 rounded-2xl bg-slate-100" />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-bold file:text-brand-700 hover:file:bg-brand-100" />
    </div>);
  }
  return wrap(<input type={f.type} value={value ?? ''} disabled={disabled} required={f.required} onChange={(e) => onChange(e.target.value)} className="field" />);
}
