import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.trim()
    .replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Variables Supabase manquantes dans .env.local",
      },
      { status: 503 },
    );
  }

  try {
    // Ne pas tester /rest/v1/ : depuis 2026, Supabase réserve la
    // spécification OpenAPI aux clés serveur. Une requête sur une table
    // publique vérifie réellement la clé publishable et la Data API.
    const response = await fetch(
      `${supabaseUrl}/rest/v1/courses?select=id&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const details = await response.text();

      return NextResponse.json(
        {
          ok: false,
          error: `Supabase a répondu ${response.status} ${response.statusText}`,
          details: details || undefined,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      service: "supabase",
      message: "Connexion Supabase opérationnelle",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de contacter Supabase",
      },
      { status: 502 },
    );
  }
}