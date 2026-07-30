import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Crée le client Supabase serveur.
 * Throw si les variables d'environnement sont manquantes.
 * Utiliser dans les API routes et pages qui EXIGENT Supabase.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Peut arriver dans certains Server Components.
          // Le middleware rafraîchit aussi la session.
        }
      },
    },
  });
}

/**
 * Vérifie si Supabase est configuré (variables présentes).
 * Utiliser dans les pages protégées pour rediriger proprement
 * quand les variables ne sont pas encore renseignées.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
