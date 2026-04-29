import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return NextResponse.json({ error: "School not found for user." }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "true";

  let query = supabase
    .from("events")
    .select("id, title, description, location, category, starts_at, ends_at, source_url")
    .eq("school_id", profile.school_id)
    .order("starts_at", { ascending: true })
    .limit(20);

  if (!includeAll) {
    query = query.gte("starts_at", new Date().toISOString());
  }

  if (category) {
    query = query.ilike("category", category);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("GET /api/events error:", error.message);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }

  return NextResponse.json(events ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return NextResponse.json({ error: "School not found for user." }, { status: 404 });
  }

  let body: {
    title?: string;
    description?: string;
    location?: string;
    category?: string;
    starts_at?: string;
    ends_at?: string;
    source_url?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.title || !body.starts_at) {
    return NextResponse.json({ error: "title and starts_at are required." }, { status: 400 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const { data: event, error } = await db
    .from("events")
    .insert({
      school_id: profile.school_id,
      posted_by: user.id,
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      category: body.category ?? null,
      starts_at: body.starts_at,
      ends_at: body.ends_at ?? null,
      source_url: body.source_url ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/events error:", error.message);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }

  return NextResponse.json(event, { status: 201 });
}
