import Link from 'next/link';
import { BookOpen, CircleHelp, FolderOpen, LayoutDashboard, LogOut, TrendingUp, UserRound } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { signOutAction } from '@/app/(auth)/actions';

const links = [
  ['Tableau de bord', '/dashboard', LayoutDashboard],
  ['Mes cours', '/mes-cours', BookOpen],
  ['Progression', '/progression', TrendingUp],
  ['Ressources', '/ressources', FolderOpen],
  ['Mon profil', '/profil', UserRound],
  ['Aide', '/contact', CircleHelp],
] as const;

export function LearnerShell({ name, children }: { name: string; children: React.ReactNode }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'EV';
  return <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[270px_1fr]">
    <aside className="border-r border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen">
      <BrandLogo />
      <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#071b3a] p-3 text-white"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#d8ad46] font-extrabold text-[#071b3a]">{initials}</span><div className="min-w-0"><p className="truncate font-bold">{name}</p><p className="text-xs text-slate-300">Espace apprenant</p></div></div>
      <nav aria-label="Navigation apprenant" className="mt-6 grid gap-1">{links.map(([label, href, Icon]) => <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-[#071b3a] hover:bg-amber-50"><Icon className="h-5 w-5" />{label}</Link>)}</nav>
      <form action={signOutAction} className="mt-5"><button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50"><LogOut className="h-5 w-5" />Déconnexion</button></form>
    </aside>
    <section className="min-w-0">{children}</section>
  </main>;
}
