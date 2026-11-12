import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE } from '@/lib/panel';
import Sidebar from '@/components/admin/Sidebar';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!cookies().get(COOKIE)?.value) redirect('/admin/login');
  return (
    <div className="lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
