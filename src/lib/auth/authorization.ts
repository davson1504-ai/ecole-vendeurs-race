import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const APP_ROLES = ['apprenant', 'admin', 'super_admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function isAdminRole(role: string | null | undefined): role is 'admin' | 'super_admin' {
  return role === 'admin' || role === 'super_admin';
}

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
    isAdminRole(auth.profile.role);

  if (!isAdmin) redirect('/dashboard?error=acces-refuse');
  return auth;
}

export function homeForRole(role: string | null | undefined) {
  return isAdminRole(role) ? '/admin' : '/dashboard';
}
