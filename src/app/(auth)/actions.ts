'use server';

import type { Provider } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { homeForRole } from '@/lib/auth/authorization';

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

function safeNext(value: FormDataEntryValue | null) {
  const next = cleanText(value) || '/dashboard';
  if (!next.startsWith('/') || next.startsWith('//')) return '/dashboard';
  return next;
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
  const headersList = await headers();
  return headersList.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function signUpAction(formData: FormData) {
  const fullName = cleanText(formData.get('full_name'));
  const email = cleanText(formData.get('email')).toLowerCase();
  const phone = cleanText(formData.get('phone'));
  const password = cleanText(formData.get('password'));
  const affiliateCode = cleanText(formData.get('affiliate_code')).toUpperCase();

  if (!fullName || !email || !password) {
    redirect(withMessage('/inscription', 'error', 'Nom, email et mot de passe sont obligatoires.'));
  }

  if (password.length < 6) {
    redirect(withMessage('/inscription', 'error', 'Le mot de passe doit contenir au moins 6 caractères.'));
  }

  const origin = await appOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        full_name: fullName,
        phone,
        affiliate_code: affiliateCode,
      },
    },
  });

  if (error) {
    redirect(withMessage('/inscription', 'error', authErrorInFrench(error.message)));
  }

  if (data.session) {
    redirect('/dashboard');
  }

  redirect(withMessage('/connexion', 'message', 'Compte créé. Connectez-vous ou confirmez votre email si Supabase le demande.'));
}

export async function signInAction(formData: FormData) {
  const email = cleanText(formData.get('email')).toLowerCase();
  const password = cleanText(formData.get('password'));
  if (!email || !password) {
    redirect(withMessage('/connexion', 'error', 'Email et mot de passe sont obligatoires.'));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withMessage('/connexion', 'error', authErrorInFrench(error.message)));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  redirect(homeForRole(profile?.role));
}

async function signInWithOAuth(provider: Provider, formData: FormData) {
  const origin = await appOrigin();
  const next = safeNext(formData.get('next'));
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
