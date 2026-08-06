import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { PublicHeader, SiteFooter } from '@/components/brand';

export const metadata = { title: 'Contactez-nous | École des Vendeurs de Race' };

export default function ContactPage() {
  return <main className="min-h-screen bg-slate-50"><PublicHeader active="contact" />
    <section className="evr-navy-panel text-white"><div className="mx-auto max-w-6xl px-4 py-16"><p className="font-bold uppercase tracking-[.2em] text-[#f5df99]">Contactez-nous</p><h1 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">Parlons de votre projet de formation commerciale.</h1><p className="mt-5 max-w-2xl text-lg text-slate-200">Une question sur les parcours, l’inscription ou l’accès à votre espace ? Écrivez-nous.</p></div></section>
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[.75fr_1.25fr]"><aside className="space-y-5"><div className="rounded-3xl bg-[#071b3a] p-7 text-white"><MessageCircle className="h-8 w-8 text-[#d8ad46]"/><h2 className="mt-4 text-2xl font-extrabold">Une réponse humaine</h2><p className="mt-3 text-slate-300">Votre message est enregistré de manière sécurisée puis consulté par l’administration.</p></div><div className="rounded-3xl border bg-white p-6"><Mail className="h-6 w-6 text-[#b98722]"/><p className="mt-3 font-bold">Support plateforme</p><p className="mt-1 text-sm text-slate-600">Utilisez le formulaire pour conserver un suivi clair de votre demande.</p></div><div className="flex gap-3 rounded-3xl border bg-white p-6"><ShieldCheck className="h-6 w-6 shrink-0 text-green-700"/><p className="text-sm text-slate-600">Aucune donnée n’est utilisée pour un envoi commercial automatique.</p></div></aside><ContactForm /></section><SiteFooter />
  </main>;
}
