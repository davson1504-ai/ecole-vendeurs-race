import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { BrandLogo, PlaceholderImage } from '@/components/brand';
import { courses, formatFcfa } from '@/lib/demo-data';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminFormationsPage() {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=supabase-non-configure');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?next=/admin/formations');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect('/dashboard?error=acces-refuse');
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5"><BrandLogo /><Link href="/admin" className="font-bold text-[#071b3a]">Retour admin</Link></header>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-4xl font-extrabold text-[#071b3a]">Gestion des formations</h1>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#071b3a] p-6">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-xl bg-white px-4 py-3"><Search className="h-4 w-4 text-slate-500" /><span className="text-slate-500">Rechercher...</span></div>
          <button className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white"><Plus className="mr-2 inline h-5 w-5" />Ajouter une formation</button>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#d8ad46]/60">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#fff7df]"><tr>{['Miniature', 'Titre de la formation', 'Catégorie', 'Prix', 'Étudiants', 'Statut', 'Actions'].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead>
            <tbody>
              {courses.slice(0, 4).map((course, index) => (
                <tr key={course.slug} className="border-t border-slate-200">
                  <td className="px-5 py-4"><PlaceholderImage label="" className="min-h-20 w-24" /></td>
                  <td className="px-5 py-4 font-bold text-[#071b3a]">{course.title}</td>
                  <td className="px-5 py-4">{course.category}</td>
                  <td className="px-5 py-4">{formatFcfa(course.priceXof)}</td>
                  <td className="px-5 py-4">{450 - index * 80}</td>
                  <td className="px-5 py-4"><span className={index === 1 ? 'rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-700' : 'rounded-full bg-green-100 px-3 py-1 font-bold text-green-700'}>{index === 1 ? 'Brouillon' : 'Publié'}</span></td>
                  <td className="px-5 py-4"><span className="rounded-xl bg-blue-700 px-3 py-2 text-white">Modifier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
