"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/refar/navbar";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  edu: "A .edu email address is required.",
  domain: "Your school isn't supported yet.",
  auth: "Sign-in failed. Please try again.",
  no_code: "Invalid link. Please try again.",
  config: "App not configured. Contact support.",
};

function SignInContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const urlError = errorCode ? ERROR_MESSAGES[errorCode] : null;

  // ── Normal flow state ──────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [otpStatus, setOtpStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [otpError, setOtpError] = useState<string | null>(null);

  // ── Judge bypass state ─────────────────────────────────────────────────────
  const [judgeMode, setJudgeMode] = useState(false);
  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgePassword, setJudgePassword] = useState("");
  const [judgeStatus, setJudgeStatus] = useState<"idle" | "loading">("idle");
  const [judgeError, setJudgeError] = useState<string | null>(null);

  function signInWithGoogle() {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);

    if (!email.toLowerCase().endsWith(".edu")) {
      setOtpError("A .edu email address is required.");
      return;
    }

    setOtpStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setOtpError(error.message);
      setOtpStatus("idle");
    } else {
      setOtpStatus("sent");
    }
  }

  async function signInAsJudge(e: React.FormEvent) {
    e.preventDefault();
    setJudgeError(null);
    setJudgeStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: judgeEmail,
      password: judgePassword,
    });

    if (error) {
      setJudgeError("Invalid credentials. Please try again.");
      setJudgeStatus("idle");
    } else {
      // Hard navigate so middleware re-reads fresh session cookies
      window.location.href = "/assistant";
    }
  }

  const displayError = urlError ?? otpError;

  return (
    <div className="theme-dark min-h-dvh bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-20">
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          {otpStatus === "sent" ? (
            /* ── Success state ── */
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-xl">Check your inbox</h2>
                <p className="text-sm text-zinc-400">
                  We sent a sign-in link to{" "}
                  <span className="text-zinc-200">{email}</span>
                </p>
              </div>
              <p className="text-xs text-zinc-600">
                The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => { setOtpStatus("idle"); setEmail(""); }}
                className="text-xs text-zinc-500 underline underline-offset-2 transition-colors duration-200 hover:text-zinc-300"
              >
                Use a different email
              </button>
            </div>

          ) : judgeMode ? (
            /* ── Judge bypass form ── */
            <>
              <div className="space-y-1">
                <h1 className="font-serif text-2xl">Judge Login</h1>
                <p className="text-sm text-zinc-500">
                  Use the credentials provided in the submission notes.
                </p>
              </div>

              {judgeError && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {judgeError}
                </div>
              )}

              <form onSubmit={signInAsJudge} className="space-y-3">
                <input
                  type="email"
                  value={judgeEmail}
                  onChange={(e) => setJudgeEmail(e.target.value)}
                  placeholder="judge@example.com"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[16px] text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 sm:text-sm"
                />
                <input
                  type="password"
                  value={judgePassword}
                  onChange={(e) => setJudgePassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[16px] text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={judgeStatus === "loading" || !judgeEmail.trim() || !judgePassword.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-200 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {judgeStatus === "loading" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Login as Judge"
                  )}
                </button>
              </form>

              <button
                onClick={() => { setJudgeMode(false); setJudgeError(null); }}
                className="w-full text-center text-xs text-zinc-600 underline underline-offset-2 transition-colors duration-200 hover:text-zinc-400"
              >
                ← Back to sign in
              </button>
            </>

          ) : (
            /* ── Normal sign-in form ── */
            <>
              <div className="space-y-1">
                <h1 className="font-serif text-2xl">Sign in to Quad</h1>
                <p className="text-sm text-zinc-400">
                  Use your university{" "}
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">.edu</code>{" "}
                  account to access your campus assistant.
                </p>
              </div>

              {displayError && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {displayError}
                </div>
              )}

              {/* Google OAuth */}
              <div className="space-y-1.5">
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-200 hover:bg-zinc-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
                <p className="text-center text-xs text-zinc-600">Use your .edu Google account</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-600">or continue with email</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Magic link form */}
              <form onSubmit={sendMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[16px] text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={otpStatus === "loading" || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-100 transition-all duration-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {otpStatus === "loading" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-zinc-600">
                Only .edu accounts are accepted.
              </p>

              {/* Judge bypass — subtle, at the very bottom */}
              <div className="border-t border-zinc-900 pt-4 text-center">
                <button
                  onClick={() => setJudgeMode(true)}
                  className="text-[11px] text-zinc-700 transition-colors duration-200 hover:text-zinc-500"
                >
                  Hackathon Judge? Click here.
                </button>
              </div>
            </>
          )}
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
