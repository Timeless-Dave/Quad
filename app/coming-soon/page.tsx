import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractDomain } from "@/lib/auth/domain";

export default async function ComingSoonPage() {
  let domain = "";

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      domain = extractDomain(user.email);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6 text-black">
      <div className="max-w-lg text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-600">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          Coming soon
        </div>
        <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          We&apos;re launching at
          <br />
          <em>{domain || "your school"}</em> soon
        </h1>
        <p className="mx-auto mt-6 max-w-md text-neutral-500">
          Quad is expanding to more campuses. We&apos;re working to bring the full campus assistant experience to your school.
        </p>
        <p className="mt-4 text-sm text-neutral-400">
          We&apos;ll notify you when your campus is ready.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Back to home
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-medium transition hover:border-neutral-400"
          >
            Try another account
          </Link>
        </div>
      </div>
    </div>
  );
}
