'use client';

import { useActionState } from 'react';
import { signUpAction, type SignUpState } from '@/app/(auth)/actions';

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <span className="text-xs font-semibold text-red-700">{errors[0]}</span> : null;
}

export function RegistrationForm() {
  const [state, action, pending] = useActionState(signUpAction, {} as SignUpState);
  return <form action={action} className="grid gap-4" noValidate>
    {state.message ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" aria-live="polite">{state.message}</p> : null}
    <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">Nom complet<input name="full_name" autoComplete="name" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46] focus:ring-2 focus:ring-amber-100" required /><FieldError errors={state.errors?.full_name} /></label>
    <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">Email<input name="email" type="email" autoComplete="email" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46] focus:ring-2 focus:ring-amber-100" required /><FieldError errors={state.errors?.email} /></label>
    <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">Mot de passe<input name="password" type="password" autoComplete="new-password" minLength={8} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46] focus:ring-2 focus:ring-amber-100" required /><FieldError errors={state.errors?.password} /></label>
    <label className="grid gap-1 text-sm font-semibold text-[#071b3a]">Confirmer le mot de passe<input name="password_confirmation" type="password" autoComplete="new-password" minLength={8} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d8ad46] focus:ring-2 focus:ring-amber-100" required /><FieldError errors={state.errors?.password_confirmation} /></label>
    <p className="text-xs leading-5 text-slate-500">En créant votre compte, vous acceptez les conditions d’utilisation et la politique de confidentialité.</p>
    <button disabled={pending} className="rounded-xl bg-[#d8ad46] px-5 py-3 font-extrabold text-[#071b3a] disabled:cursor-wait disabled:opacity-60">{pending ? 'Création en cours…' : 'Créer mon compte'}</button>
  </form>;
}
