import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Award, BookOpen, Search, TrendingUp } from 'lucide-react';
import { BrandLogo, MetricCard } from '@/components/brand';
import { courses } from '@/lib/demo-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { signOutAction } from '@/app/(auth)/actions';

// Forcer le rendu dynamique : cette page nécessite la session Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=supabase-non-configure');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.full_name || user.email || 'Apprenant';
  const enrolled = courses.slice(0, 4);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d4c87] via-slate-50 to-[#fff7df] p-4 md:p-8">
      <section className="mx-auto min-h-[90vh] max-w-7xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <BrandLogo />
          <nav className="flex flex-wrap gap-4 font-semibold text-[#071b3a]"><span className="border-b-2 border-[#071b3a] pb-2">Tableau de bord</span><span>Mes formations</span><span>Ressources</span></nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-4 py-2 text-slate-500 md:flex"><Search className="h-4 w-4" />Rechercher</div>
            <form action={signOutAction}><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-[#071b3a]">Déconnexion</button></form>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#1f5d9e]">Compte connecté · {profile?.role ?? 'apprenant'}</p>
          <h1 className="text-4xl font-extrabold text-[#071b3a]">Bonjour, {displayName} !<br />Prêt à exceller en vente aujourd’hui ?</h1>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <MetricCard label="Formations achetées" value="4" tone="gold" icon={<BookOpen />} />
            <MetricCard label="Progression moyenne" value="68%" tone="blue" icon={<TrendingUp />} />
            <MetricCard label="Certificats obtenus" value="1" tone="green" icon={<Award />} />
          </div>

          <h2 className="mt-8 text-3xl font-extrabold text-[#071b3a]">Mes formations</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {enrolled.map((course) => (
              <article key={course.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                <h3 className="text-xl font-extrabold text-[#071b3a]">{course.title}</h3>
                <div className="mt-5 flex items-center gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[10px] border-[#d8ad46] text-2xl font-extrabold text-[#071b3a]">{course.progress}%</div>
                  <div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>
                    <Link href={'/cours/' + course.slug} className="mt-4 inline-flex rounded-xl bg-[#1f5d9e] px-5 py-3 font-bold text-white">Continuer la formation</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
