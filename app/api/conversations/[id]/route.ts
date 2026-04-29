import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  // Verify ownership before mutating
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return new Response("Not found.", { status: 404 });
  }

  let title: string;
  try {
    const body = await req.json();
    if (typeof body.title !== "string" || !body.title.trim()) {
      return new Response("title is required.", { status: 400 });
    }
    title = body.title.trim();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return new Response("Server configuration error.", { status: 500 });
  }

  const { data, error } = await db
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, title, created_at, updated_at")
    .single();

  if (error) {
    return new Response("Database error.", { status: 500 });
  }

  return Response.json(data);
}
