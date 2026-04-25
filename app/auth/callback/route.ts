import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isEduEmail, extractDomain } from "@/lib/auth/domain";
import { lookupSchool } from "@/lib/data/supported-schools";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/directory";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=no_code", origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/sign-in?error=config", origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", origin));
  }

  if (!isEduEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/sign-in?error=edu", origin));
  }

  const domain = extractDomain(user.email);
  const school = lookupSchool(domain);

  if (!school || school.status !== "active") {
    return NextResponse.redirect(new URL("/coming-soon", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
