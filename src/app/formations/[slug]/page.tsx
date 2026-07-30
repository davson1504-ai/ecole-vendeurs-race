import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { PublicHeader, SiteFooter, PlaceholderImage } from '@/components/brand';
import { formatFcfa, getCourseBySlug } from '@/lib/demo-data';

type PageProps = { params: Promise<{ slug: string }> };

export default async function FormationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <main className="min-h-screen bg-white">
      <PublicHeader active="formations" />
      <section className="evr-navy-panel text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[.9fr_1.1fr]">
          <PlaceholderImage label="Vidéo de présentation" className="min-h-[320px] border border-white/15" />
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#f5df99]">{course.category}</p>
            <h1 className="text-4xl font-extrabold md:text-5xl">{course.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <p className="text-3xl font-extrabold text-[#f5df99]">{formatFcfa(course.priceXof)}</p>
              <Link href="/paiement" className="rounded-full bg-green-600 px-6 py-3 font-bold text-white shadow-lg">Acheter la formation</Link>
            </div>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{course.description}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-2xl font-extrabold text-[#071b3a]">Description</h2>
          <p className="mt-3 leading-8 text-slate-700">{course.longDescription}</p>

          <h2 className="mt-8 text-2xl font-extrabold text-[#071b3a]">Objectifs de la formation</h2>
          <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
            {['Développer une stratégie de vente efficace', 'Négocier avec confiance', 'Gérer les objections clients', 'Fidéliser la clientèle'].map((item) => (
              <li key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" />{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-extrabold text-[#071b3a]">Curriculum du programme</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            {course.modules.map((module) => (
              <details key={module.title} className="group border-b border-slate-200 bg-white p-4 last:border-b-0" open={module.title.includes('Module 1')}>
                <summary className="cursor-pointer list-none font-bold text-[#071b3a]">{module.title} <span className="text-sm font-normal text-slate-500">({module.lessons.length} leçons)</span></summary>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  {module.lessons.map((lesson) => <p key={lesson}>• {lesson}</p>)}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[#d8ad46]/50 bg-[#fff7df] p-6">
            <h3 className="text-xl font-extrabold text-[#071b3a]">Bloc de confiance</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />Paiement sécurisé via CinetPay</span>
              <span className="flex items-center gap-2"><Lock className="h-5 w-5 text-green-600" />Accès débloqué après paiement validé</span>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <PlaceholderImage label="Formateur" className="min-h-56" />
          <h3 className="mt-5 text-xl font-extrabold text-[#071b3a]">Instructeur : Jean-Marc Kaboré</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Expert en vente et développement commercial.</p>
          <div className="mt-6 grid gap-3 text-sm">
            <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Clock className="h-4 w-4" />Durée</span><strong>{course.duration}</strong></p>
            <p className="flex items-center justify-between"><span className="flex items-center gap-2"><UserRound className="h-4 w-4" />Niveau</span><strong>{course.level}</strong></p>
            <p className="flex items-center justify-between"><span>Certificat</span><strong>Inclus à la fin</strong></p>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
