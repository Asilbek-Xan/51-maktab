import type { LucideIcon } from 'lucide-react';
import { Inbox, WifiOff, SearchX } from 'lucide-react';

type Kind = 'empty' | 'error' | 'search';

const DEFAULTS: Record<Kind, { Icon: LucideIcon; title: string; text: string }> = {
  empty: { Icon: Inbox, title: 'Ma’lumot yo‘q', text: 'Bu bo‘limga hozircha ma’lumot kiritilmagan.' },
  error: { Icon: WifiOff, title: 'Ma’lumotlarni yuklab bo‘lmadi', text: 'Birozdan so‘ng sahifani yangilab ko‘ring.' },
  search: { Icon: SearchX, title: 'Hech narsa topilmadi', text: 'Boshqa so‘z bilan qidirib ko‘ring.' },
};

/** Barcha sahifalarda bir xil ko'rinishdagi "ma'lumot yo'q" bloki */
export default function EmptyState({ kind = 'empty', title, text, icon, compact, children }: {
  kind?: Kind; title?: string; text?: string; icon?: LucideIcon; compact?: boolean; children?: React.ReactNode;
}) {
  const d = DEFAULTS[kind];
  const Icon = icon ?? d.Icon;
  return (
    <div role="status" className={`card flex flex-col items-center text-center ${compact ? 'gap-2 p-6' : 'gap-3 p-10'}`}>
      <div className={`flex items-center justify-center rounded-2xl ${kind === 'error' ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'} ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}>
        <Icon className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
      </div>
      <p className={`font-extrabold text-ink ${compact ? '' : 'text-lg'}`}>{title ?? d.title}</p>
      {(text ?? d.text) && <p className="max-w-md text-sm leading-relaxed text-slate-500">{text ?? d.text}</p>}
      {children}
    </div>
  );
}
