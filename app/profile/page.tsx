import { redirect } from "next/navigation";
import { Navbar } from "@/components/campus/navbar";
import { ProfileForm } from "@/components/quad/profile-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ActionState = { error?: string; success?: boolean } | null;

async function updateProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Server configuration error." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const major = formData.get("major") as string;
  const gpaRaw = formData.get("gpa") as string;
  const gradYearRaw = formData.get("grad_year") as string;
  const resumeText = formData.get("resume_text") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      major: major || null,
      gpa: gpaRaw ? parseFloat(gpaRaw) : null,
      grad_year: gradYearRaw ? parseInt(gradYearRaw, 10) : null,
      resume_text: resumeText || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, major, gpa, grad_year, resume_text")
    .eq("id", user.id)
    .single();

  return (
    <div className="theme-dark min-h-dvh bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="font-serif text-3xl">Profile</h1>
          <p className="text-zinc-400">
            Your academic context — Quad uses this to personalize every response.
          </p>
        </div>
        <ProfileForm profile={profile} action={updateProfile} />
      </main>
    </div>
  );
}
