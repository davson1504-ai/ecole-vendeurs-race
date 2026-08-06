'use client';

import { useActionState } from 'react';
import { sendContactMessage, type ContactState } from '@/app/contact/actions';

const initialState: ContactState = {};

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initialState);
  const field = (name: string) => state.errors?.[name]?.[0];
  return <form action={action} className="grid gap-5 rounded-3xl border bg-white p-6 shadow-sm md:p-8">
    <div className="absolute -left-[10000px]" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 font-semibold">Nom complet<input name="full_name" required maxLength={120} className="rounded-xl border p-3" />{field('full_name')&&<span className="text-sm text-red-700">{field('full_name')}</span>}</label>
      <label className="grid gap-2 font-semibold">Email<input name="email" type="email" required maxLength={254} className="rounded-xl border p-3" />{field('email')&&<span className="text-sm text-red-700">{field('email')}</span>}</label>
    </div>
    <label className="grid gap-2 font-semibold">Téléphone <span className="text-xs font-normal text-slate-500">Facultatif</span><input name="phone" type="tel" maxLength={40} className="rounded-xl border p-3" /></label>
    <label className="grid gap-2 font-semibold">Sujet<input name="subject" required maxLength={160} className="rounded-xl border p-3" />{field('subject')&&<span className="text-sm text-red-700">{field('subject')}</span>}</label>
    <label className="grid gap-2 font-semibold">Message<textarea name="message" required minLength={10} maxLength={3000} rows={7} className="resize-y rounded-xl border p-3" />{field('message')&&<span className="text-sm text-red-700">{field('message')}</span>}</label>
    <label className="flex items-start gap-3 text-sm text-slate-700"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4" /><span>J’accepte que mes informations soient utilisées uniquement pour répondre à cette demande.</span></label>
    {field('consent')&&<span className="text-sm text-red-700">{field('consent')}</span>}
    {state.message&&<p role="status" className={`rounded-xl p-4 font-semibold ${state.ok?'bg-green-50 text-green-800':'bg-red-50 text-red-700'}`}>{state.message}</p>}
    <button disabled={pending} className="rounded-xl bg-[#071b3a] px-6 py-3 font-bold text-white disabled:opacity-60">{pending?'Envoi en cours…':'Envoyer mon message'}</button>
  </form>;
}
