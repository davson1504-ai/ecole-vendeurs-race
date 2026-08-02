import { NextResponse } from 'next/server';
import { getAuthenticatedProfile, isAdminRole } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthenticatedProfile();
  if (!auth) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  const isAdmin =
    auth.profile.status === 'active' &&
    isAdminRole(auth.profile.role);

  if (!isAdmin) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { error } = await auth.supabase.from('admin_logs').select('id').limit(1);
  if (error) {
    return NextResponse.json(
      { error: 'Vérification administrative impossible.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    userId: auth.user.id,
    role: auth.profile.role,
  });
}
