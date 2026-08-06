import Link from 'next/link';
import { BookOpen, CheckCircle2, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { requireUser } from '@/lib/auth/authorization';
import { signOutAction } from '@/app/(auth)/actions';

export const dynamic='force-dynamic';
export default async function DashboardPage(){
  const {supabase,user,profile}=await requireUser('/dashboard');
  const {data:enrollments,error}=await supabase.from('enrollments').select('id,active,enrolled_at,course:courses(id,slug,title,short_description,modules(id,lessons(id)))').eq('user_id',user.id).eq('active',true).order('enrolled_at',{ascending:false});
  if(error) throw new Error('Impossible de charger vos inscriptions.');
  const normalized=(enrollments??[]).map(e=>({...e,course:Array.isArray(e.course)?e.course[0]:e.course}));
  const courseIds=normalized.map(e=>e.course).filter(Boolean).map(c=>c!.id);
  const lessonIds=normalized.flatMap(e=>e.course?.modules??[]).flatMap(m=>m.lessons??[]).map(l=>l.id);
  const {data:progress}=lessonIds.length?await supabase.from('lesson_progress').select('lesson_id,completed,last_viewed_at').eq('profile_id',user.id).in('lesson_id',lessonIds):{data:[]};
  const progressMap=new Map((progress??[]).map(p=>[p.lesson_id,p]));
  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><BrandLogo/><form action={signOutAction}><button className="flex gap-2 rounded-xl border px-4 py-2 font-bold"><LogOut className="h-5 w-5"/>Déconnexion</button></form></div></header><section className="mx-auto max-w-6xl px-4 py-10"><p className="font-bold text-[#b98722]">Espace apprenant</p><h1 className="mt-2 text-4xl font-extrabold text-[#071b3a]">Bonjour, {profile.full_name||user.email}</h1>{courseIds.length===0?<div className="mt-10 rounded-3xl border bg-white p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-400"/><h2 className="mt-4 text-xl font-bold">Aucune inscription active</h2><p className="mt-2 text-slate-600">Un administrateur peut vous inscrire à une formation pendant la démonstration.</p><Link href="/formations" className="mt-5 inline-flex rounded-full bg-[#d8ad46] px-5 py-3 font-bold">Voir le catalogue</Link></div>:<div className="mt-8 grid gap-6 md:grid-cols-2">{normalized.map(enrollment=>{const course=enrollment.course!;const ids=course.modules.flatMap(m=>m.lessons).map(l=>l.id);const completed=ids.filter(id=>progressMap.get(id)?.completed).length;const percent=ids.length?Math.round(completed/ids.length*100):0;return <article key={enrollment.id} className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-extrabold text-[#071b3a]">{course.title}</h2><p className="mt-2 text-slate-600">{course.short_description}</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-green-600" style={{width:`${percent}%`}}/></div><div className="mt-2 flex justify-between text-sm font-bold"><span>{completed}/{ids.length} leçons</span><span>{percent}%</span></div><Link href={`/cours/${course.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"><CheckCircle2 className="h-5 w-5"/>Continuer</Link></article>})}</div>}</section></main>;
}
