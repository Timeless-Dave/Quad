"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/refar/navbar";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  edu: "Only .edu email addresses can access Quad. Please sign in with your university email.",
  domain: "Your email domain is not supported yet.",
  auth: "Something went wrong during sign-in. Please try again.",
  no_code: "The sign-in link was invalid. Please try again.",
  config: "The app is not configured yet. Please contact the administrator.",
};

function SignInContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : null;

  function signInWith(provider: "google" | "azure") {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        ...(provider === "azure" && { scopes: "openid email profile" }),
      },
    });
  }

  return (
    <div className="theme-dark min-h-dvh bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 py-20">
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h1 className="font-serif text-2xl">Sign in to Quad</h1>
          <p className="text-sm text-zinc-400">
            Sign in with your university{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">.edu</code>{" "}
            account to access your school&apos;s directory and draft tools.
          </p>
          {errorMessage && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => signInWith("azure")}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Continue with Microsoft
            </button>
            <button
              onClick={() => signInWith("google")}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500">
            Only .edu accounts are accepted. Your provider depends on your university.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
