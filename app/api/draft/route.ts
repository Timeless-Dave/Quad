import { NextResponse } from "next/server";
import { z } from "zod";
import { isEduEmail } from "@/lib/auth/domain";
import { generateDraft } from "@/lib/ai/draft";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  professorName: z.string().optional(),
  professorEmail: z.string().optional(),
  targetOpportunity: z.string().optional(),
  relationshipContext: z.string().optional(),
  studentAssets: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isEduEmail(user.email)) {
    return NextResponse.json({ error: "Only verified .edu users can use drafts." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const result = await generateDraft({
    ...parsed.data,
    studentName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
    studentEmail: user.email,
  });

  return NextResponse.json(result);
}
