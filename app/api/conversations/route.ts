import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return new Response("Server configuration error.", { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response("Database error.", { status: 500 });
  }

  return Response.json(data ?? []);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return new Response("Server configuration error.", { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return new Response("School not configured.", { status: 400 });
  }

  let title = "New conversation";
  try {
    const body = await req.json();
    if (typeof body.title === "string" && body.title.trim()) {
      title = body.title.trim();
    }
  } catch {
    // Use default title
  }

  const db = createServiceRoleClient();
  if (!db) {
    return new Response("Server configuration error.", { status: 500 });
  }

  const { data, error } = await db
    .from("conversations")
    .insert({ user_id: user.id, school_id: profile.school_id, title })
    .select("id, title, created_at, updated_at")
    .single();

  if (error) {
    return new Response("Database error.", { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
