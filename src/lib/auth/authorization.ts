import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'apprenant' | 'admin' | 'super_admin';

export async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) return null;
  return { supabase, user, profile };
}

export async function requireUser(nextPath: string) {
  const auth = await getAuthenticatedProfile();
  if (!auth) redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  return auth;
}

export async function requireAdmin(nextPath: string) {
  const auth = await requireUser(nextPath);
  const isAdmin =
    auth.profile.status === 'active' &&
    (auth.profile.role === 'admin' || auth.profile.role === 'super_admin');

  if (!isAdmin) redirect('/dashboard?error=acces-refuse');
  return auth;
}

export function homeForRole(role: string | null | undefined) {
  return role === 'admin' || role === 'super_admin' ? '/admin' : '/dashboard';
}
