import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino del redirect de OAuth (Google/Facebook): intercambia el código
 * por una sesión y sigue a /perfil. Patrón oficial de @supabase/ssr.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/perfil";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
