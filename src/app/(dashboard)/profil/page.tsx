import Link from 'next/link';
import { LearnerShell } from '@/components/learner-shell';
import { requireUser } from '@/lib/auth/authorization';
import { signOutAction } from '@/app/(auth)/actions';
import { updateProfileAction } from './actions';

export const dynamic='force-dynamic';

export default async function ProfilePage({searchParams}:{searchParams:Promise<{message?:string;error?:string}>}){
  const params=await searchParams;
  const{supabase,user,profile}=await requireUser('/profil');
  const[{data:details},{data:history}]=await Promise.all([
    supabase.from('profiles').select('full_name,phone,city_country,avatar_url,terms_accepted_at,preferred_learning_pace,weekly_lesson_goal').eq('id',user.id).single(),
    supabase.from('enrollments').select('id,enrolled_at,active,course:courses(title)').eq('user_id',user.id).order('enrolled_at',{ascending:false}),
  ]);
  const name=details?.full_name||profile.full_name||user.email||'Apprenant';
  const complete=Boolean(details?.full_name&&details.phone&&details.city_country&&details.terms_accepted_at);
  return <LearnerShell name={name}><section className="mx-auto max-w-5xl px-5 py-8 md:px-10">
    <p className="font-bold text-[#b98722]">Mon compte</p><h1 className="mt-1 text-4xl font-extrabold">Mon profil</h1>
    {params.message&&<p role="status" className="mt-5 rounded-xl bg-green-50 p-4 font-bold text-green-800">Profil mis à jour.</p>}{params.error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-700">Vérifiez les informations saisies.</p>}
    <div className="mt-8 grid gap-7 lg:grid-cols-[1.2fr_.8fr]"><form action={updateProfileAction} className="grid gap-5 rounded-3xl border bg-white p-7">
      <label className="grid gap-2 font-semibold">Nom complet<input name="full_name" defaultValue={details?.full_name??''} required className="rounded-xl border p-3"/></label>
      <label className="grid gap-2 font-semibold">Email<input value={user.email??''} disabled className="rounded-xl border bg-slate-100 p-3"/><span className="text-xs font-normal text-slate-500">L’adresse email est gérée par l’authentification sécurisée.</span></label>
      <label className="grid gap-2 font-semibold">Téléphone<input name="phone" defaultValue={details?.phone??''} required className="rounded-xl border p-3"/></label>
      <label className="grid gap-2 font-semibold">Ville ou pays<input name="city_country" defaultValue={details?.city_country??''} required className="rounded-xl border p-3"/></label>
      <label className="grid gap-2 font-semibold">Photo de profil <span className="text-xs font-normal text-slate-500">URL facultative</span><input name="avatar_url" type="url" defaultValue={details?.avatar_url??''} className="rounded-xl border p-3"/></label>
      <fieldset className="grid gap-4 rounded-2xl bg-slate-50 p-5"><legend className="px-2 font-extrabold">Préférences d’apprentissage</legend><label className="grid gap-2 font-semibold">Rythme préféré<select name="preferred_learning_pace" defaultValue={details?.preferred_learning_pace??'regular'} className="rounded-xl border bg-white p-3"><option value="flexible">Flexible</option><option value="regular">Régulier</option><option value="intensive">Intensif</option></select></label><label className="grid gap-2 font-semibold">Objectif de leçons par semaine<input name="weekly_lesson_goal" type="number" min="1" max="20" defaultValue={details?.weekly_lesson_goal??3} className="rounded-xl border bg-white p-3"/></label></fieldset>
      <button className="rounded-xl bg-[#071b3a] px-5 py-3 font-bold text-white">Enregistrer mes informations</button>
    </form><aside className="space-y-5"><div className="rounded-3xl bg-[#071b3a] p-6 text-white"><p className="text-sm text-slate-300">État du compte</p><p className="mt-2 text-xl font-extrabold">{complete?'Profil complet':'Profil à compléter'}</p><p className="mt-3 text-sm text-slate-300">Onboarding : {complete?'profil renseigné':'étape profil incomplète'}</p>{!complete&&<Link href="/onboarding" className="mt-5 inline-flex rounded-xl bg-[#d8ad46] px-4 py-2 font-bold text-[#071b3a]">Finaliser</Link>}</div>
      <div className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-extrabold">Historique des formations</h2><div className="mt-4 grid gap-3">{(history??[]).map(item=>{const course=Array.isArray(item.course)?item.course[0]:item.course;return <p key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{course?.title}</strong><span className="block text-slate-500">{item.active?'Inscription active':'Inscription inactive'} · {new Date(item.enrolled_at).toLocaleDateString('fr-FR')}</span></p>})}{!history?.length&&<p className="text-sm text-slate-500">Aucune inscription enregistrée.</p>}</div></div>
      <Link href="/mot-de-passe-oublie" className="block rounded-xl border bg-white px-5 py-3 text-center font-bold">Modifier mon mot de passe</Link><form action={signOutAction}><button className="w-full rounded-xl border border-red-200 px-5 py-3 font-bold text-red-700">Déconnexion</button></form>
    </aside></div>
  </section></LearnerShell>;
}
