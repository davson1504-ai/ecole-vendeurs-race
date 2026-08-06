import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand';
import { RegistrationForm } from '@/components/auth/registration-form';

export default function InscriptionPage() {
  return <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
    <section className="relative hidden min-h-screen lg:block">
      <Image src="/images/auth/auth-hero.webp" alt="Professionnel suivant une formation commerciale en ligne" fill priority sizes="50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071b3a]/85 via-[#071b3a]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-10 text-white"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#f5df99]">Apprendre · Maîtriser · Performer</p><h2 className="mt-3 max-w-xl text-4xl font-extrabold">Développez les réflexes des meilleurs vendeurs.</h2></div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:py-12">
      <div className="w-full max-w-md pb-14 lg:pb-0">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <h1 className="text-center text-3xl font-extrabold text-[#071b3a]">Créer votre compte</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Quatre informations suffisent. Vous compléterez votre profil ensuite.</p>
        <div className="mt-6"><RegistrationForm /></div>
        <p className="mt-5 text-center text-sm">Vous avez déjà un compte ? <Link href="/connexion" className="font-bold text-[#071b3a] underline">Connectez-vous</Link></p>
      </div>
    </section>
  </main>;
}
