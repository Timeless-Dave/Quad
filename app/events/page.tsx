import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/campus/navbar";
import { EventsClient } from "@/components/campus/events-client";

export const dynamic = "force-dynamic";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  starts_at: string;
  ends_at: string | null;
  source_url: string | null;
};

export default async function EventsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/sign-in");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const db = createServiceRoleClient();
  if (!db) redirect("/sign-in");

  const { data: profile } = await db
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) redirect("/sign-in");

  const { data: school } = await db
    .from("schools")
    .select("name, domain")
    .eq("id", profile.school_id)
    .single();

  const schoolName = school?.name ?? school?.domain ?? "Your School";

  const { data: events } = await db
    .from("events")
    .select("id, title, description, location, category, starts_at, ends_at, source_url")
    .eq("school_id", profile.school_id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(50);

  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <Navbar />
      <EventsClient events={(events ?? []) as Event[]} schoolName={schoolName} />
    </div>
  );
}
