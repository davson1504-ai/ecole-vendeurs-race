import Link from 'next/link';
import { CreditCard, LockKeyhole, Smartphone } from 'lucide-react';
import { PublicHeader } from '@/components/brand';
import { formatFcfa, courses } from '@/lib/demo-data';

const course = courses[0];

export default function PaiementPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicHeader />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_520px]">
        <div>
          <h1 className="text-4xl font-extrabold text-[#071b3a] md:text-5xl">Paiement sécurisé</h1>
          <div className="mt-8 grid gap-4">
            {[
              ['Mobile Money', <Smartphone key="1" className="h-8 w-8" />, 'orange'],
              ['Carte bancaire', <CreditCard key="2" className="h-8 w-8" />, 'blue'],
              ['CinetPay', <LockKeyhole key="3" className="h-8 w-8" />, 'green'],
            ].map(([label, icon, tone]) => (
              <label key={String(label)} className="flex cursor-pointer items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="h-5 w-5 rounded-full border border-slate-400" />
                <span className={tone === 'green' ? 'flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white' : tone === 'blue' ? 'flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white' : 'flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white'}>{icon}</span>
                <span className="text-xl font-bold text-[#071b3a]">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-8">
            <label className="text-lg font-semibold text-[#071b3a]">Code promo / affilié</label>
            <div className="mt-3 flex max-w-xl gap-3">
              <input className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d8ad46]" placeholder="Ex: EVR-12345" />
              <button className="rounded-2xl border border-slate-300 px-5 font-semibold">Appliquer</button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-extrabold text-[#071b3a]">Résumé de votre commande</h2>
          <div className="mt-8 grid gap-4 text-lg">
            <div className="flex justify-between gap-6"><span>{course.title}</span><strong>{formatFcfa(course.priceXof)}</strong></div>
            <div className="border-t border-slate-200 pt-4 flex justify-between"><span>Sous-total</span><strong>{formatFcfa(course.priceXof)}</strong></div>
            <div className="flex justify-between text-2xl font-extrabold text-[#071b3a]"><span>Total à payer</span><span>{formatFcfa(course.priceXof)}</span></div>
          </div>
          <Link href="/paiement/retour?status=success" className="mt-8 flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg">
            Payer maintenant
          </Link>
          <p className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-center font-semibold text-slate-700">🔒 Paiement sécurisé via CinetPay</p>
        </aside>
      </section>
    </main>
  );
}
