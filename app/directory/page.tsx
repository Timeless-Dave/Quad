import { Navbar } from "@/components/refar/navbar";
import { DirectoryClient } from "@/components/refar/directory-client";
import { getProfessorsByUserEmail } from "@/lib/data/professors";
import { getSchoolForUser } from "@/lib/data/schools";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DirectoryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase!.auth.getUser();
  const email = user?.email ?? "";

  const [professors, school] = await Promise.all([
    getProfessorsByUserEmail(email),
    getSchoolForUser(email),
  ]);

  const schoolName = school?.shortName ?? "Faculty";

  return (
    <div className="theme-dark min-h-dvh bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-6">
          <h1 className="font-serif text-3xl">{schoolName} Faculty Directory</h1>
          <p className="text-zinc-400">Find official office locations, positions, and faculty email addresses.</p>
          <DirectoryClient professors={professors} />
        </div>
      </main>
    </div>
  );
}
