'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export type ContactState = { ok?: boolean; message?: string; errors?: Record<string, string[]> };

const schema = z.object({
  full_name: z.string().trim().min(2, 'Indiquez votre nom complet.').max(120),
  email: z.string().trim().email('Indiquez une adresse email valide.').max(254),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(3, 'Précisez le sujet.').max(160),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.').max(3000),
  consent: z.literal('on', { error: 'Votre consentement est nécessaire.' }),
  website: z.string().max(0),
});

export async function sendContactMessage(_state: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const payload = {
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
  };
  const supabase = await createClient();

  const { error } = await supabase.from('contact_messages').insert({
    ...payload,
    email: payload.email.toLowerCase(),
    phone: payload.phone || null,
  });
  if (error) return { message: 'Votre demande ne peut pas être enregistrée pour le moment. Réessayez plus tard.' };
  return { ok: true, message: 'Merci. Votre message a bien été enregistré et sera traité par notre équipe.' };
}
