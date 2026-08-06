import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, GraduationCap } from 'lucide-react';
import { PublicHeader, PlaceholderImage, SiteFooter } from '@/components/brand';
import { formatDuration, formatXof, getPublishedCourse } from '@/lib/courses';

export const dynamic = 'force-dynamic';
export default async function FormationDetailPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const course=await getPublishedCourse(slug); if(!course) notFound();
  const modules=(course.modules ?? []).toSorted((a,b)=>a.position-b.position);
  const lessons=modules.flatMap(m=>m.lessons ?? []);
  return <main className="min-h-screen bg-white"><PublicHeader active="formations" />
    <section className="evr-navy-panel text-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2"><PlaceholderImage label={course.level} className="min-h-72"/><div><p className="text-[#f5df99]">Formation professionnelle</p><h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{course.title}</h1><p className="mt-5 text-lg text-slate-200">{course.description}</p><div className="mt-6 flex flex-wrap gap-4 text-sm"><span className="flex gap-2"><GraduationCap/> {course.level}</span><span className="flex gap-2"><Clock/> {formatDuration(course.duration_minutes)}</span><strong className="text-[#f5df99]">{formatXof(course.price_xof)}</strong></div><Link href="/paiement" className="mt-8 inline-flex rounded-full bg-amber-400 px-6 py-3 font-extrabold text-[#071b3a]">Paiement bientôt disponible</Link></div></div></section>
    <section className="mx-auto max-w-5xl px-4 py-12"><h2 className="text-3xl font-extrabold text-[#071b3a]">Programme · {lessons.length} leçons</h2><div className="mt-6 space-y-4">{modules.map(module=><details key={module.id} open={module.position===1} className="rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-bold text-[#071b3a]">{module.position}. {module.title}</summary><p className="mt-2 text-sm text-slate-600">{module.description}</p><div className="mt-4 space-y-2">{module.lessons.toSorted((a,b)=>a.position-b.position).map(lesson=><div key={lesson.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>{lesson.title}</span>{lesson.is_preview ? <Link href={`/cours/${course.slug}?lesson=${lesson.slug}`} className="flex items-center gap-1 font-bold text-blue-700"><Eye className="h-4 w-4"/> Aperçu</Link>:<span className="text-xs text-slate-500">Réservée</span>}</div>)}</div></details>)}</div></section><SiteFooter />
  </main>;
}
