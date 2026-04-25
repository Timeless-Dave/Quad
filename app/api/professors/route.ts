import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfessorsByUserEmail } from "@/lib/data/professors";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ data: [] });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const professors = await getProfessorsByUserEmail(user.email);

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  const data = q
    ? professors.filter((p) =>
        [p.fullName, p.title, p.officeRoom, p.building, p.email]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : professors;

  return NextResponse.json({ data });
}
