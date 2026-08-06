import Link from 'next/link';
import { ExternalLink, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { signOutAction } from '@/app/(auth)/actions';

const items=[['Tableau de bord','/admin'],['Formations','/admin/formations'],['Utilisateurs','/admin/utilisateurs'],['Inscriptions','/admin/inscriptions'],['Paiements','/admin/paiements'],['Messages','/admin/messages'],['Paramètres','/admin/parametres']] as const;
export function AdminNav(){return <aside className="border-r border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen"><BrandLogo/><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#b98722]">Administration</p><nav aria-label="Navigation administrateur" className="mt-3 grid gap-1 font-semibold text-[#071b3a] sm:grid-cols-2 lg:grid-cols-1">{items.map(([label,href])=><Link key={href} href={href} className="rounded-xl px-4 py-3 hover:bg-amber-50">{label}</Link>)}<Link href="/" className="flex items-center gap-2 rounded-xl px-4 py-3 hover:bg-amber-50">Voir le site <ExternalLink className="h-4 w-4"/></Link></nav><form action={signOutAction} className="mt-5"><button className="flex w-full items-center gap-2 rounded-xl border px-4 py-3 font-bold text-red-700"><LogOut className="h-4 w-4"/>Déconnexion</button></form></aside>}
export function AdminShell({children}:{children:React.ReactNode}){return <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]"><AdminNav/><section className="min-w-0 p-5 md:p-10">{children}</section></main>}
