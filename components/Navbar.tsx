import { safeGet, SchoolProfile } from '@/lib/api';
import SchoolLogo from './SchoolLogo';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const school = await safeGet<SchoolProfile>('/school/');
  const name = school?.name || school?.short_name || '51-sonli maktab';
  return (
    <>
      <div className="bg-ink px-4 py-2 text-[13px] text-slate-300 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <span className="font-semibold text-white">O‘zbekiston Respublikasi</span>
          <span className="hidden text-slate-400 sm:inline">Xalq ta’limi vazirligi</span>
        </div>
      </div>
      <NavbarClient
        phone={school?.phone || ''}
        name={school?.short_name || name}
        subtitle={school?.district || 'Muzrabot tumani, Surxondaryo viloyati'}
        logo={<SchoolLogo src={school?.logo} alt={name} size={48} />}
      />
    </>
  );
}
