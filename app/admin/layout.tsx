import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Boshqaruv paneli | 51-maktab', robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
