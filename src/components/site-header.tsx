import Link from 'next/link';
import { APP_NAME, ROUTES } from '@/lib/constants';
export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href={ROUTES.home} className="font-semibold text-slate-950">{APP_NAME}</Link>
        <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
          <Link href={ROUTES.formations}>Formations</Link>
          <Link href={ROUTES.affiliate}>Affiliation</Link>
          <Link href={ROUTES.admin}>Admin</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href={ROUTES.login}>Connexion</Link>
          <Link href={ROUTES.register} className="rounded-full bg-orange-700 px-4 py-2 font-medium text-white">S’inscrire</Link>
        </div>
      </div>
    </header>
  );
}
