import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
export default function PaiementRetourPage() {
  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-2xl px-4 py-16"><div className="rounded-3xl border bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">Retour paiement</h1><p className="mt-3 text-slate-600">Page de retour utilisateur. Elle lira bientôt l’état réel du paiement côté serveur.</p><div className="mt-8 flex justify-center gap-3"><Link href="/dashboard" className="rounded-full bg-orange-700 px-6 py-3 font-semibold text-white">Dashboard</Link><Link href="/formations" className="rounded-full border px-6 py-3 font-semibold">Formations</Link></div></div></section></main>;
}
