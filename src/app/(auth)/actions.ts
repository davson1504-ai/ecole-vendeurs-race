'use server';

import type { Provider } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { homeForRole } from '@/lib/auth/authorization';
import { z } from 'zod';
import { safeNextPath } from '@/lib/auth/redirects';

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

function withMessage(path: string, key: 'message' | 'error', value: string) {
  return `${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(value)}`;
}

function authErrorInFrench(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirmez votre adresse email avant de vous connecter.';
  }
  if (normalized.includes('user already registered')) {
    return 'Un compte existe déjà avec cette adresse email.';
  }
  if (normalized.includes('password')) {
    return 'Le mot de passe ne respecte pas les règles de sécurité.';
  }
  return 'Une erreur d’authentification est survenue. Réessayez.';
}

async function appOrigin() {
  await headers();
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return new URL(configured).origin;
  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;
  return 'http://localhost:3000';
}

export type SignUpState = { errors?: Record<string, string[]>; message?: string };

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, 'Saisissez votre nom complet.'),
  email: z.string().trim().email('Saisissez une adresse email valide.'),
  password: z.string().min(8, 'Utilisez au moins 8 caractères.'),
  password_confirmation: z.string(),
}).refine((values) => values.password === values.password_confirmation, {
  path: ['password_confirmation'], message: 'Les mots de passe ne correspondent pas.',
});

export async function signUpAction(_state: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    full_name: cleanText(formData.get('full_name')),
    email: cleanText(formData.get('email')).toLowerCase(),
    password: cleanText(formData.get('password')),
    password_confirmation: cleanText(formData.get('password_confirmation')),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { full_name: fullName, email, password } = parsed.data;

  const origin = await appOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { message: authErrorInFrench(error.message) };
  }

  if (data.session) {
    redirect('/onboarding');
  }

  redirect(withMessage('/connexion', 'message', 'Compte créé. Connectez-vous ou confirmez votre email si Supabase le demande.'));
}

export async function signInAction(formData: FormData) {
  const email = cleanText(formData.get('email')).toLowerCase();
  const password = cleanText(formData.get('password'));
  if (!z.string().email().safeParse(email).success || !password) {
    redirect(withMessage('/connexion', 'error', 'Email et mot de passe sont obligatoires.'));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withMessage('/connexion', 'error', authErrorInFrench(error.message)));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,status')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.status !== 'active') {
    await supabase.auth.signOut();
    redirect(withMessage('/connexion', 'error', 'Compte indisponible. Contactez un administrateur.'));
  }
  redirect(homeForRole(profile?.role));
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().parse(cleanText(formData.get('email')).toLowerCase());
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await appOrigin()}/auth/callback?next=/nouveau-mot-de-passe` });
  redirect(withMessage('/mot-de-passe-oublie', 'message', 'Si ce compte existe, un email de récupération a été envoyé.'));
}

export async function updatePassword(formData: FormData) {
  const password = z.string().min(8).max(128).parse(cleanText(formData.get('password')));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(withMessage('/nouveau-mot-de-passe', 'error', 'Impossible de mettre à jour le mot de passe.'));
  redirect(withMessage('/connexion', 'message', 'Mot de passe mis à jour.'));
}

async function signInWithOAuth(provider: Provider, formData: FormData) {
  const origin = await appOrigin();
  const next = safeNextPath(formData.get('next'));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(withMessage('/connexion', 'error', error?.message ?? 'Connexion OAuth impossible.'));
  }

  redirect(data.url);
}

export async function signInWithGoogle(formData: FormData) {
  await signInWithOAuth('google', formData);
}

export async function signInWithApple(formData: FormData) {
  await signInWithOAuth('apple', formData);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}
