import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEduEmail, extractDomain } from "@/lib/auth/domain";
import { lookupActiveSchool } from "@/lib/data/supported-schools";

const PROTECTED_PATHS = ["/directory", "/draft", "/assistant", "/profile", "/events"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!isEduEmail(user.email)) {
    return NextResponse.redirect(new URL("/sign-in?error=edu", request.url));
  }

  const domain = extractDomain(user.email);
  const school = await lookupActiveSchool(supabase, domain);

  if (!school) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  response.headers.set("x-school-domain", domain);
  return response;
}

export const config = {
  matcher: ["/directory/:path*", "/draft/:path*", "/assistant/:path*", "/profile/:path*", "/events/:path*"],
};
