import Link from 'next/link';
import { BrandLogo, PlaceholderImage } from '@/components/brand';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { signUpAction } from '../actions';
import { SubmitButton } from '@/components/auth/submit-button';

type PageProps = {
  searchParams?: Promise<{
    message?: string;
    error?: string;
    ref?: string;
    next?: string;
  }>;
};

export default async function InscriptionPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const next = params.next ?? '/dashboard';

  return (
    <main className="grid h-screen overflow-hidden bg-white lg:grid-cols-2">
      <section className="hidden h-screen p-6 lg:block">
        <PlaceholderImage label="Communauté de vendeurs" className="h-full rounded-none" />
      </section>
      <section className="flex h-screen items-center justify-center overflow-hidden px-4 py-4">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-center"><BrandLogo /></div>
          <h1 className="text-center text-3xl font-extrabold text-[#071b3a]">Créer votre compte</h1>

          {params.message ? <p className="mt-4 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{params.message}</p> : null}
          {params.error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{params.error}</p> : null}

          <div className="mt-5">
            <SocialAuthButtons next={next} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ou
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={signUpAction} className="grid gap-3">
            <input type="hidden" name="next" value={next} />
            <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">
              Nom complet
              <input name="full_name" className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-[#d8ad46]" required />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">
              Email
              <input name="email" type="email" className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-[#d8ad46]" required />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">
              Numéro de téléphone
              <input name="phone" className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-[#d8ad46]" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">
              Mot de passe
              <input name="password" type="password" minLength={6} className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-[#d8ad46]" required />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">
              Code affilié
              <input name="affiliate_code" defaultValue={params.ref ?? ''} className="rounded-xl border border-slate-300 px-4 py-2.5 uppercase outline-none focus:border-[#d8ad46]" />
            </label>
            <SubmitButton
              idleLabel="Créer mon compte"
              pendingLabel="Création en cours…"
              className="mt-1 rounded-xl bg-[#d8ad46] px-5 py-3 font-extrabold text-[#071b3a] disabled:cursor-wait disabled:opacity-70"
            />
          </form>
          <p className="mt-4 text-center text-sm">Vous avez déjà un compte ? <Link href="/connexion" className="font-bold text-[#071b3a] underline">Connectez-vous</Link></p>
        </div>
      </section>
    </main>
  );
}
