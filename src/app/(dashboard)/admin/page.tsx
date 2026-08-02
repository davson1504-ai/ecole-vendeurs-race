import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Calendar, LayoutDashboard, Search, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { BrandLogo, MetricCard } from '@/components/brand';
import { payments, formatFcfa } from '@/lib/demo-data';
import { isAdminRole } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';

// Rendu dynamique obligatoire : vérification de session et rôle admin
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=supabase-non-configure');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/admin');

  // Vérification du rôle admin côté serveur
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = isAdminRole(profile?.role);
  if (!isAdmin) {
    redirect('/dashboard?error=acces-refuse');
  }

  return (
    <main className="grid min-h-screen bg-[#101827] text-white lg:grid-cols-[270px_1fr]">
      <aside className="border-r border-white/10 bg-[#111d2e] p-5">
        <BrandLogo light />
        <nav className="mt-10 grid gap-2">
          {[
            ['Tableau de bord', '/admin', <LayoutDashboard key="1" />],
            ['Utilisateurs', '#', <Users key="2" />],
            ['Formations', '/admin/formations', <BookOpen key="3" />],
            ['Paiements', '/admin/paiements', <ShoppingCart key="4" />],
            ['Affiliés', '/affiliation', <Users key="5" />],
          ].map(([label, href, icon], index) => (
            <Link key={String(label)} href={String(href)} className={index === 0 ? 'flex items-center gap-3 rounded-xl bg-[#d8ad46] px-4 py-3 font-bold text-[#071b3a]' : 'flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5'}>
              <span className="h-5 w-5">{icon}</span>{label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="p-5 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-extrabold">Tableau de bord Administrateur</h1>
          <div className="flex gap-3">
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Calendar className="h-4 w-4" />Juillet 2026</span>
            <span className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400 md:flex"><Search className="h-4 w-4" />Recherche</span>
          </div>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Utilisateurs totaux" value="12 450" icon={<Users />} />
          <MetricCard label="Apprenants actifs" value="9 800" icon={<BookOpen />} />
          <MetricCard label="Ventes totales" value="3 200" icon={<ShoppingCart />} />
          <MetricCard label="Revenu total" value="1,25 M" tone="green" icon={<TrendingUp />} />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h2 className="text-xl font-extrabold">Tendance des revenus</h2>
          <div className="mt-6 flex h-56 items-end gap-3 border-b border-white/10 px-2">
            {[20, 35, 28, 62, 40, 48, 68, 43, 84, 25, 72, 65].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col justify-end">
                <div className="rounded-t-xl bg-gradient-to-t from-[#9a6b2f] to-[#f5df99]" style={{ height: height + '%' }} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-400">Revenus mensuels de démonstration.</p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <h2 className="bg-white/5 px-5 py-4 text-xl font-extrabold">Dernières transactions</h2>
            <table className="w-full text-left text-sm">
              <tbody>{payments.slice(0, 4).map((payment) => <tr key={payment.ref} className="border-t border-white/10"><td className="px-5 py-3">{payment.ref}</td><td className="px-5 py-3">{payment.user}</td><td className="px-5 py-3">{formatFcfa(payment.amount)}</td><td className="px-5 py-3"><span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold">{payment.status}</span></td></tr>)}</tbody>
            </table>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-extrabold">Nouveaux utilisateurs</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {['Kofi Annan', 'Amina Koné', 'Jean Kouassi', 'Fatou Ndiaye'].map((name) => <p key={name} className="flex justify-between rounded-xl bg-white/5 px-4 py-3"><span>{name}</span><span>Apprenant</span></p>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
