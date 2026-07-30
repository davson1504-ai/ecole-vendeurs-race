import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Download, Lock, Play, Search } from 'lucide-react';
import { BrandLogo, PlaceholderImage } from '@/components/brand';
import { getCourseBySlug } from '@/lib/demo-data';

type PageProps = { params: Promise<{ slug: string }> };

export default async function CoursePlayerPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  const firstModule = course.modules[0];

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[300px_1fr]">
      <aside className="bg-[#071b3a] p-5 text-white">
        <BrandLogo light />
        <div className="mt-8 grid gap-6">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.title}>
              <h2 className="font-extrabold">{module.title}</h2>
              <div className="mt-3 grid gap-2">
                {module.lessons.map((lesson, index) => {
                  const active = moduleIndex === 0 && index === 0;
                  return (
                    <div key={lesson} className={active ? 'flex items-center gap-3 rounded-2xl bg-blue-100 p-3 text-[#071b3a]' : 'flex items-center gap-3 rounded-2xl p-3 text-slate-300'}>
                      {active ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span className="text-sm">Leçon {moduleIndex + 1}.{index + 1} : {lesson}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-2xl font-extrabold text-[#071b3a]">Lecteur de cours</h1>
          <div className="hidden items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2 text-slate-500 md:flex"><Search className="h-4 w-4" />Rechercher</div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <PlaceholderImage label="Vidéo de cours" className="min-h-[360px] rounded-none" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-12 w-12" /></span>
            </div>
          </div>
          <h2 className="mt-8 text-3xl font-extrabold text-[#071b3a]">Leçon 1.1 : {firstModule.lessons[0]}</h2>
          <p className="mt-3 text-lg leading-8 text-slate-700">Cette leçon explore les attitudes mentales essentielles pour réussir dans la vente : écoute, discipline, empathie, résilience et clarté dans l’argumentaire.</p>
          <div className="mt-6 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2">
            <div>
              <button className="rounded-2xl bg-[#1f5d9e] px-5 py-3 font-bold text-white"><Check className="mr-2 inline h-4 w-4" />Marquer comme terminé</button>
            </div>
            <div>
              <h3 className="font-extrabold text-[#071b3a]">Ressources téléchargeables</h3>
              <p className="mt-2 flex items-center gap-2 text-slate-700">Guide PDF : état d’esprit du vendeur.pdf <Download className="h-4 w-4" /></p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <Link href="/dashboard" className="flex-1 rounded-2xl bg-slate-300 px-5 py-4 text-center font-bold text-slate-700">Leçon précédente</Link>
            <Link href="/dashboard" className="flex-1 rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white">Leçon suivante</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
