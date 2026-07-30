import Link from 'next/link';
import { Clock, Search, UserRound } from 'lucide-react';
import { PublicHeader, SiteFooter, PlaceholderImage } from '@/components/brand';
import { courses, formatFcfa } from '@/lib/demo-data';

const categories = ['Tout', 'Vente', 'Prospection', 'Négociation', 'Closing', 'Management'];

export default function FormationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader active="formations" />
      <section className="evr-navy-panel px-4 py-12 text-center text-white">
        <p className="font-bold uppercase tracking-[.25em] text-[#d8ad46]">Catalogue</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Nos formations</h1>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-md flex-1 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-[#b98722]" />
            <span className="text-slate-500">Rechercher une formation...</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span key={category} className={index === 0 ? 'rounded-full bg-[#d8ad46] px-4 py-2 font-bold text-[#071b3a]' : 'rounded-full bg-[#071b3a] px-4 py-2 font-bold text-white'}>{category}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article key={course.slug} className="overflow-hidden rounded-3xl border-2 border-[#d8ad46] bg-[#071b3a] p-3 text-white shadow-xl">
              <PlaceholderImage label={course.category} className="min-h-44" />
              <div className="p-4">
                <h2 className="text-2xl font-extrabold text-[#f5df99]">{course.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-200">{course.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#d8ad46]" />{course.level}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#d8ad46]" />{course.duration}</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xl font-extrabold">{formatFcfa(course.priceXof)}</p>
                  <Link href={'/formations/' + course.slug} className="rounded-full bg-[#d8ad46] px-4 py-2 text-sm font-bold text-[#071b3a]">Voir la formation</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
