import Link from 'next/link';
import { BrandLogo } from '@/components/brand';
import { signInAction } from '../actions';
import { SubmitButton } from '@/components/auth/submit-button';

type PageProps = {
  searchParams?: Promise<{
    message?: string;
    error?: string;
    next?: string;
  }>;
};

export default async function ConnexionPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const next = params.next ?? '/dashboard';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <h1 className="text-center text-4xl font-extrabold text-[#071b3a]">Connexion</h1>

        {params.message ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{params.message}</p> : null}
        {params.error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{params.error}</p> : null}

        <form action={signInAction} className="mt-7 grid gap-4">
          <input type="hidden" name="next" value={next} />
          <input name="email" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46]" placeholder="Email" type="email" required />
          <input name="password" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46]" placeholder="Mot de passe" type="password" required />
          <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-[#071b3a] underline">Mot de passe oublié</Link>
          <SubmitButton
            idleLabel="Se connecter"
            pendingLabel="Connexion en cours…"
            className="rounded-xl bg-[#071b3a] px-5 py-4 font-extrabold text-[#f5df99] disabled:cursor-wait disabled:opacity-70"
          />
        </form>
        <p className="mt-6 text-center">Vous n’avez pas de compte ? <Link href="/inscription" className="font-bold underline">Créer un compte</Link></p>
      </section>
    </main>
  );
}
