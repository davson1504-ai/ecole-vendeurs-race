import Link from 'next/link';
import { PublicHeader, PlaceholderImage, SiteFooter } from '@/components/brand';
import { formatDuration, formatXof, listPublishedCourses } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export default async function FormationsPage() {
  const courses = await listPublishedCourses();
  return <main className="min-h-screen bg-slate-50">
    <PublicHeader active="formations" />
    <section className="mx-auto max-w-7xl px-4 py-14">
      <p className="font-bold uppercase tracking-[.2em] text-[#b98722]">Catalogue</p>
      <h1 className="mt-2 text-4xl font-extrabold text-[#071b3a] md:text-5xl">Formations publiées</h1>
      {courses.length === 0 ? <div className="mt-10 rounded-3xl border bg-white p-10 text-center text-slate-600">Aucune formation publiée pour le moment.</div> :
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map(course => <article key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <PlaceholderImage label={course.level} className="rounded-none" />
        <div className="p-6"><h2 className="text-xl font-extrabold text-[#071b3a]">{course.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{course.short_description}</p>
        <div className="mt-4 flex justify-between text-sm font-semibold"><span>{formatDuration(course.duration_minutes)}</span><span>{formatXof(course.price_xof)}</span></div>
        <Link className="mt-5 inline-flex rounded-full bg-[#d8ad46] px-5 py-2.5 font-bold text-[#071b3a]" href={`/formations/${course.slug}`}>Découvrir</Link></div>
      </article>)}</div>}
    </section><SiteFooter />
  </main>;
}
