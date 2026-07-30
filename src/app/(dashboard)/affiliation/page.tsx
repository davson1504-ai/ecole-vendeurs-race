import Link from "next/link";
import { redirect } from "next/navigation";
import { Copy, MousePointer2, UserRound, ShoppingCart, WalletCards, BadgeDollarSign, ShieldCheck } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Rendu dynamique : lecture de session et profil affilié
export const dynamic = 'force-dynamic';

const stats = [
  { label: "Clics", value: "1 245", icon: MousePointer2 },
  { label: "Inscriptions", value: "350", icon: UserRound },
  { label: "Ventes", value: "85", icon: ShoppingCart },
  { label: "Commissions gagnées", value: "850 000", icon: WalletCards },
  { label: "Commissions payées", value: "500 000", icon: BadgeDollarSign },
];

const sales = [
  {
    date: "15/07/2026",
    student: "Jean Dupont",
    product: "Devenir vendeur professionnel",
    amount: "150 000 FCFA",
    commission: "30 000 FCFA",
    status: "Payé",
  },
  {
    date: "16/07/2026",
    student: "Amina Koné",
    product: "Négociation commerciale avancée",
    amount: "120 000 FCFA",
    commission: "24 000 FCFA",
    status: "Validé",
  },
  {
    date: "17/07/2026",
    student: "Oumar Diop",
    product: "Prospection B2B efficace",
    amount: "90 000 FCFA",
    commission: "18 000 FCFA",
    status: "En attente",
  },
  {
    date: "18/07/2026",
    student: "Fatou Ndiaye",
    product: "Techniques de closing",
    amount: "75 000 FCFA",
    commission: "15 000 FCFA",
    status: "Validé",
  },
];

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edbe43] text-[#061b3d] shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="text-xl font-black leading-tight text-[#061b3d]">
            École des
            <br />
            Vendeurs de Race
          </span>
        </Link>

        <nav className="hidden items-center gap-7 font-semibold text-[#061b3d] lg:flex">
          <Link href="/">Accueil</Link>
          <Link href="/formations">Formations</Link>
          <Link href="/affiliation" className="rounded-full bg-[#edbe43] px-6 py-3 font-black">
            Affiliation
          </Link>
          <Link href="/dashboard">Mon espace</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/connexion" className="rounded-full border border-[#061b3d] px-5 py-3 font-black text-[#061b3d]">
            Se connecter
          </Link>
          <Link href="/inscription" className="rounded-full bg-[#061b3d] px-5 py-3 font-black text-white">
            S’inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "Payé"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Validé"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-flex min-w-[98px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-black leading-none ${style}`}
    >
      {status}
    </span>
  );
}

export default async function AffiliationPage() {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=supabase-non-configure');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/affiliation');

  // Lecture du profil affilié depuis Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, affiliate_code, is_affiliate')
    .eq('id', user.id)
    .maybeSingle();

  const affiliateCode = profile?.affiliate_code ?? 'EDVR-000';
  const affiliateLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}?ref=${affiliateCode}`;

  return (
    <main className="min-h-screen bg-slate-50 text-[#001b44]">
      <Header />
      <div className="h-16 bg-gradient-to-r from-[#a87225] via-[#edbe43] to-[#ffe8a6]" />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="font-black uppercase tracking-[0.2em] text-[#b8872f]">Espace affilié</p>
              <h1 className="mt-2 text-3xl font-black lg:text-4xl">Suivi de vos ventes et commissions</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Partagez votre lien unique. Chaque vente validée génère automatiquement une commission.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Votre lien d’affiliation</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#061b3d] shadow-sm">
                  {affiliateLink}
                </code>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#061b3d] text-white">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[22px] bg-[#092653] p-6 text-white shadow-xl shadow-slate-200">
                <div className="flex items-center gap-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{item.label}</p>
                    <p className="mt-1 text-3xl font-black tracking-wide">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_430px]">
          <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-200">
            <div className="bg-[#061b3d] px-6 py-5">
              <h2 className="text-2xl font-black text-white">Mes ventes référées</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-[#fff5d8] text-[#061b3d]">
                  <tr>
                    <th className="px-6 py-5 font-black">Date</th>
                    <th className="px-6 py-5 font-black">Nom de l’étudiant</th>
                    <th className="px-6 py-5 font-black">Produit</th>
                    <th className="px-6 py-5 font-black">Montant</th>
                    <th className="px-6 py-5 font-black">Commission</th>
                    <th className="w-[140px] px-6 py-5 font-black">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={`${sale.date}-${sale.student}`} className="border-t border-slate-100">
                      <td className="px-6 py-5 font-semibold">{sale.date}</td>
                      <td className="px-6 py-5 font-semibold">{sale.student}</td>
                      <td className="px-6 py-5 font-semibold">{sale.product}</td>
                      <td className="px-6 py-5 font-semibold">{sale.amount}</td>
                      <td className="px-6 py-5 font-semibold">{sale.commission}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={sale.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#f2dfaa] bg-[#fff6dc] p-8 shadow-sm">
            <h2 className="text-3xl font-black leading-tight">Comment gagner des commissions</h2>

            <div className="mt-7 space-y-7 text-[#061b3d]">
              <div>
                <h3 className="font-black">1. Partagez votre lien unique.</h3>
                <p className="mt-1 text-slate-700">Chaque visite est suivie avec votre code affilié.</p>
              </div>
              <div>
                <h3 className="font-black">2. L’apprenant s’inscrit et achète.</h3>
                <p className="mt-1 text-slate-700">La vente est rattachée à votre compte.</p>
              </div>
              <div>
                <h3 className="font-black">3. Recevez 20 % de chaque vente validée.</h3>
                <p className="mt-1 text-slate-700">Les commissions sont validées par l’administrateur.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
