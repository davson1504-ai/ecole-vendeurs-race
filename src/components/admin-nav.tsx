import Link from 'next/link';
import { BrandLogo } from '@/components/brand';
export function AdminNav(){return <aside className="border-r border-slate-200 bg-white p-5"><BrandLogo/><nav className="mt-8 grid gap-2 font-semibold text-[#071b3a]">{[['Tableau de bord','/admin'],['Formations','/admin/formations'],['Utilisateurs','/admin/utilisateurs'],['Inscriptions','/admin/inscriptions']].map(([label,href])=><Link key={href} href={href} className="rounded-xl px-4 py-3 hover:bg-amber-50">{label}</Link>)}</nav></aside>}
export function AdminShell({children}:{children:React.ReactNode}){return <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[250px_1fr]"><AdminNav/><section className="min-w-0 p-5 md:p-10">{children}</section></main>}
