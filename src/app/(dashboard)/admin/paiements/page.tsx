import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, Filter, Search } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { formatFcfa, payments } from '@/lib/demo-data';
import { isAdminRole } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function Status({ value }: { value: string }) {
  const cls = value === 'Payé' ? 'bg-green-100 text-green-700' : value === 'Échoué' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';
  return <span className={'rounded-full px-3 py-1 text-sm font-bold ' + cls}>{value}</span>;
}

export default async function AdminPaiementsPage() {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=supabase-non-configure');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?next=/admin/paiements');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!isAdminRole(profile?.role)) {
    redirect('/dashboard?error=acces-refuse');
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[230px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-5">
        <BrandLogo />
        <nav className="mt-10 grid gap-2 text-[#071b3a]">
          <Link href="/admin" className="rounded-xl px-4 py-3 font-semibold">Tableau de bord</Link>
          <Link href="/admin/formations" className="rounded-xl px-4 py-3 font-semibold">Formations</Link>
          <Link href="/admin/paiements" className="rounded-xl bg-blue-50 px-4 py-3 font-bold text-blue-700">Paiements</Link>
        </nav>
      </aside>
      <section>
        <header className="flex justify-end gap-4 border-b border-slate-200 bg-white px-6 py-4"><Search /><Bell /><span className="font-bold">Admin</span></header>
        <div className="p-6 md:p-10">
          <h1 className="text-4xl font-extrabold text-[#071b3a]">Gestion des paiements</h1>
          <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[260px_1fr_120px]">
            <select className="rounded-xl border border-slate-300 px-4 py-3"><option>Payé</option><option>En attente</option><option>Échoué</option></select>
            <input className="rounded-xl border border-slate-300 px-4 py-3" value="Du 01/07/2026 au 31/07/2026" readOnly />
            <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"><Filter className="mr-2 inline h-4 w-4" />Filtrer</button>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-100"><tr>{['Référence', 'Utilisateur', 'Cours', 'Montant', 'Méthode', 'Statut', 'Date', 'Actions'].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead>
              <tbody>{payments.map((payment) => <tr key={payment.ref} className="border-t border-slate-200"><td className="px-5 py-4">{payment.ref}</td><td className="px-5 py-4">{payment.user}</td><td className="px-5 py-4">{payment.course}</td><td className="px-5 py-4">{formatFcfa(payment.amount)}</td><td className="px-5 py-4">{payment.method}</td><td className="px-5 py-4"><Status value={payment.status} /></td><td className="px-5 py-4">{payment.date}</td><td className="px-5 py-4"><button className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white">Voir détails</button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
