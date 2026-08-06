import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, ShieldCheck, TrendingUp, UserPlus } from 'lucide-react';
import { PublicHeader, SiteFooter } from '@/components/brand';
import { CourseImage } from '@/components/course-image';
import { formatDuration, listPublishedCourses } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const courses = (await listPublishedCourses()).slice(0, 3);
  const benefits = [[BookOpen, 'Formations structurées'], [TrendingUp, 'Apprentissage progressif'], [ShieldCheck, 'Accès à son rythme'], [CheckCircle2, 'Suivi de progression'], [ClipboardCheck, 'Exercices pratiques'], [UserPlus, 'Parcours adaptés au terrain']] as const;
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader active="home" />
      <section className="evr-navy-panel text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-[.22em] text-[#f5df99]">École des Vendeurs de Race</p>
            <h1 className="mt-5 text-5xl font-black leading-tight md:text-6xl">Développez une performance commerciale durable.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">Des parcours progressifs, concrets et connectés à votre réalité terrain.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Link href="/formations" className="rounded-full bg-[#d8ad46] px-6 py-3 font-bold text-[#071b3a]">Voir les formations</Link><Link href="/inscription" className="rounded-full border border-white/30 px-6 py-3 font-bold">Créer mon espace</Link></div>
          </div>
          <div className="relative min-h-96 overflow-hidden rounded-3xl border border-white/10"><Image src="/images/formations/excellence-commerciale.webp" alt="Atelier de pilotage de la performance commerciale" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#071b3a]/55 to-transparent" /></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center"><p className="font-bold text-[#b98722]">Pourquoi nous choisir ?</p><h2 className="mt-2 text-3xl font-extrabold text-[#071b3a]">Un apprentissage conçu pour passer à l’action</h2></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{benefits.map(([Icon, label]) => <div key={label} className="rounded-3xl bg-slate-50 p-6"><Icon className="h-8 w-8 text-[#b98722]" /><h3 className="mt-4 text-xl font-extrabold text-[#071b3a]">{label}</h3></div>)}</div>
        <div className="mt-16 rounded-3xl bg-[#071b3a] p-7 text-white md:p-10"><p className="font-bold text-[#d8ad46]">Comment ça fonctionne</p><h2 className="mt-2 text-3xl font-extrabold">Votre parcours en quatre étapes</h2><div className="mt-8 grid gap-5 md:grid-cols-4">{['Créer son compte','Choisir une formation','Finaliser son inscription','Apprendre et progresser'].map((label,index)=><div key={label} className="rounded-2xl bg-white/10 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#d8ad46] font-black text-[#071b3a]">{index+1}</span><h3 className="mt-4 font-bold">{label}</h3></div>)}</div></div>
        <div className="mt-16 flex items-end justify-between gap-4"><div><p className="font-bold text-[#b98722]">À découvrir</p><h2 className="text-3xl font-extrabold text-[#071b3a]">Nos formations</h2></div><Link href="/formations" className="font-bold text-[#071b3a]">Tout voir <ArrowRight className="inline h-4 w-4" /></Link></div>
        {courses.length === 0 ? <p className="mt-8 rounded-2xl border p-8 text-center text-slate-600">Le catalogue sera bientôt disponible.</p> : <div className="mt-8 grid gap-6 md:grid-cols-3">{courses.map(course => <article key={course.id} className="overflow-hidden rounded-3xl border bg-white"><CourseImage slug={course.slug} title={course.title} imageUrl={course.image_url} className="aspect-video" /><div className="p-5"><p className="text-sm font-bold text-[#b98722]">{course.level}</p><h3 className="mt-2 text-xl font-extrabold text-[#071b3a]">{course.title}</h3><p className="mt-2 text-sm text-slate-600">{course.short_description}</p><p className="mt-3 text-sm font-bold">{formatDuration(course.duration_minutes)}</p><Link className="mt-5 inline-flex font-bold text-blue-700" href={`/formations/${course.slug}`}>Découvrir <ArrowRight className="ml-2 h-4 w-4" /></Link></div></article>)}</div>}
        <div className="mt-16 grid gap-8 rounded-3xl bg-amber-50 p-8 lg:grid-cols-2"><div><p className="font-bold text-[#b98722]">Notre méthode pédagogique</p><h2 className="mt-2 text-3xl font-extrabold">Comprendre, pratiquer et mesurer ses progrès</h2><p className="mt-4 leading-7 text-slate-600">Chaque parcours associe des objectifs explicites, des leçons organisées, des exercices pratiques et une progression enregistrée pour reprendre au bon endroit.</p></div><div className="grid gap-3 sm:grid-cols-2">{['Objectifs clairs','Leçons progressives','Exercices terrain','Progression sauvegardée'].map(item=><p key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-bold"><CheckCircle2 className="h-5 w-5 text-green-700"/>{item}</p>)}</div></div>
      </section>
      <section className="evr-navy-panel px-4 py-16 text-center text-white"><h2 className="text-3xl font-black md:text-4xl">Prêt à développer vos compétences commerciales ?</h2><p className="mx-auto mt-4 max-w-2xl text-slate-200">Créez votre espace ou échangez avec l’équipe pour choisir le parcours adapté.</p><div className="mt-7 flex flex-wrap justify-center gap-4"><Link href="/inscription" className="rounded-full bg-[#d8ad46] px-6 py-3 font-bold text-[#071b3a]">Commencer maintenant</Link><Link href="/contact" className="rounded-full border border-white/30 px-6 py-3 font-bold">Nous contacter</Link></div></section>
      <SiteFooter />
    </main>
  );
}
