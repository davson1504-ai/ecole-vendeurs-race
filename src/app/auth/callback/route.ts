import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { homeForRole } from '@/lib/auth/authorization';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let destination = '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      destination = homeForRole(profile?.role);
    }
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
