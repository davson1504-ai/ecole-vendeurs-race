import Link from 'next/link';
import { Award, FileVideo, Smartphone, ShieldCheck } from 'lucide-react';
import { PublicHeader, SiteFooter, PlaceholderImage } from '@/components/brand';
import { featuredCourses, formatFcfa } from '@/lib/demo-data';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader active="home" />

      <section className="evr-navy-panel text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#d8ad46]/40 px-4 py-2 text-sm font-semibold text-[#f5df99]">MVP e-learning, vente et affiliation</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
              Devenez un vendeur de race grâce à une formation pratique et certifiante
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Apprenez les techniques de vente, développez vos compétences commerciales et accédez à des parcours adaptés au marché africain francophone.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/formations" className="rounded-full bg-[#d8ad46] px-6 py-3 font-bold text-[#071b3a] shadow-lg">Voir les formations</Link>
              <Link href="/inscription" className="rounded-full border border-white/30 px-6 py-3 font-bold text-white">Commencer maintenant</Link>
            </div>
          </div>
          <PlaceholderImage label="Formation commerciale" className="min-h-[380px] border border-white/15 shadow-2xl" />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#071b3a] text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-4">
          {[
            ['Paiement Mobile Money', <Smartphone key="1" />],
            ['Accès vidéo et PDF', <FileVideo key="2" />],
            ['Certificat de formation', <Award key="3" />],
            ['Paiement sécurisé', <ShieldCheck key="4" />],
          ].map(([label, icon]) => (
            <div key={String(label)} className="flex items-center justify-center gap-3 rounded-2xl bg-white/5 p-4 text-center">
              <span className="text-[#d8ad46]">{icon}</span>
              <span className="font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="evr-soft-bg px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="font-bold uppercase tracking-[.25em] text-[#b98722]">Formations populaires</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#071b3a] md:text-4xl">Des parcours pour vendre mieux</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredCourses.map((course) => (
              <article key={course.slug} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
                <PlaceholderImage label={course.category} />
                <div className="p-3">
                  <h3 className="text-xl font-extrabold text-[#071b3a]">{course.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-extrabold text-[#071b3a]">{formatFcfa(course.priceXof)}</p>
                    <Link href={'/formations/' + course.slug} className="rounded-full bg-[#d8ad46] px-4 py-2 text-sm font-bold text-[#071b3a]">Voir</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {[
            ['Jean K.', 'Cette plateforme m’a aidé à structurer mon discours de vente et à mieux conclure mes prospects.'],
            ['Fatou S.', 'Les parcours sont simples, concrets et adaptés à notre réalité commerciale.'],
          ].map(([name, text]) => (
            <div key={name} className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <p className="text-lg leading-8 text-slate-700">“{text}”</p>
              <p className="mt-6 font-extrabold text-[#071b3a]">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="evr-navy-panel px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-extrabold">Prêt à transformer votre carrière ?</h2>
        <p className="mt-3 text-slate-200">Inscrivez-vous, achetez votre formation et commencez votre parcours.</p>
        <Link href="/inscription" className="mt-8 inline-flex rounded-full bg-[#d8ad46] px-6 py-3 font-bold text-[#071b3a]">Inscrivez-vous</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
