import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
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

  // Explicit ownership check — RLS enforces the same but this returns a clear 403.
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    return new Response("Forbidden.", { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, tool_calls, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response("Database error.", { status: 500 });
  }

  return Response.json(data ?? []);
}
