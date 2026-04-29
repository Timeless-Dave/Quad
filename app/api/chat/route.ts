import { streamText, tool, type CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not configured.", { status: 500 });
  }

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

  // ── Profile + school context ──────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, major, gpa, resume_text, school_id")
    .eq("id", user.id)
    .single();

  let schoolDomain = "your school";
  if (profile?.school_id) {
    const { data: school } = await supabase
      .from("schools")
      .select("domain")
      .eq("id", profile.school_id)
      .single();
    if (school?.domain) schoolDomain = school.domain;
  }

  const fullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    "Student";
  const major = profile?.major ?? "undeclared";
  const gpa = profile?.gpa != null ? String(profile.gpa) : "not provided";
  const resumeText = profile?.resume_text ?? "No resume context provided yet.";
  const schoolId = profile?.school_id ?? null;

  let messages: CoreMessage[];
  let conversationId: string | null = null;
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? (body.messages as CoreMessage[]) : [];
    conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  // ── Conversation management ───────────────────────────────────────────────
  // Create a new conversation row before streaming so we can return its id
  // in the response headers immediately (onFinish is too late for headers).
  let activeConversationId: string | null = conversationId;
  let newConversationId: string | null = null;

  if (!conversationId && schoolId) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const rawText =
      typeof lastUserMsg?.content === "string"
        ? lastUserMsg.content
        : JSON.stringify(lastUserMsg?.content ?? "");
    const title = rawText.split(/\s+/).slice(0, 6).join(" ") || "New conversation";

    const db = createServiceRoleClient();
    if (db) {
      const { data: conv } = await db
        .from("conversations")
        .insert({ user_id: user.id, school_id: schoolId, title })
        .select("id")
        .single();
      if (conv?.id) {
        activeConversationId = conv.id;
        newConversationId = conv.id;
      }
    }
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      `You are Quad, an AI campus assistant for ${schoolDomain}. ` +
      `You are helping ${fullName}, a ${major} major with a GPA of ${gpa}. ` +
      `Resume context: ${resumeText}. ` +
      `Be concise and helpful. ` +
      `When the user asks about faculty, professors, or staff, use the searchDirectory tool. ` +
      `When the user asks for directions, navigation, or how to get somewhere on campus, use the startNavigation tool and generate realistic step-by-step walking directions.`,
    messages,
    maxSteps: 5,
    onFinish: async ({ text }) => {
      if (!activeConversationId) return;

      const db = createServiceRoleClient();
      if (!db) return;

      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      const userContent =
        typeof lastUserMsg?.content === "string"
          ? lastUserMsg.content
          : JSON.stringify(lastUserMsg?.content ?? "");

      const inserts: { conversation_id: string; role: string; content: string }[] = [];

      if (userContent) {
        inserts.push({ conversation_id: activeConversationId, role: "user", content: userContent });
      }
      if (text) {
        inserts.push({ conversation_id: activeConversationId, role: "assistant", content: text });
      }

      if (inserts.length > 0) {
        const { error } = await db.from("messages").insert(inserts);
        if (error) console.error("Failed to persist messages:", error.message);
      }

      // Bump updated_at so the conversation surfaces at the top of the sidebar.
      if (conversationId) {
        await db
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    },
    tools: {
      searchDirectory: tool({
        description:
          "Searches the university directory for professors, staff, or faculty by name or department.",
        parameters: z.object({
          query: z
            .string()
            .describe("The name, department, or keyword to search for."),
        }),
        execute: async ({ query }) => {
          if (!schoolId) {
            return "Unable to search the directory: your school could not be determined. Please contact support.";
          }

          const safe = query.replace(/[%_]/g, "").trim();
          if (!safe) return "Please provide a name or keyword to search for.";

          const pattern = `%${safe}%`;

          const { data: rows, error } = await supabase
            .from("professors")
            .select(`
              full_name,
              title,
              email,
              office_room,
              booking_url,
              departments ( name ),
              buildings ( name )
            `)
            .eq("school_id", schoolId)
            .or(
              `full_name.ilike.${pattern},title.ilike.${pattern},email.ilike.${pattern},office_room.ilike.${pattern}`
            )
            .order("full_name")
            .limit(10);

          if (error) {
            console.error("searchDirectory error:", error.message);
            return "A database error occurred while searching the directory.";
          }

          if (!rows || rows.length === 0) {
            return `No faculty found matching "${safe}". Try a different name or department.`;
          }

          function nameOf(rel: unknown): string | null {
            if (!rel) return null;
            const obj = Array.isArray(rel) ? rel[0] : rel;
            return (obj as { name?: string })?.name ?? null;
          }

          const lines = rows.map((r, i) => {
            const dept = nameOf(r.departments) ?? "Unknown department";
            const bldg = nameOf(r.buildings) ?? "Unknown building";
            const booking = r.booking_url ? `\n   Booking: ${r.booking_url}` : "";
            return (
              `${i + 1}. ${r.full_name} — ${r.title}\n` +
              `   Department: ${dept}\n` +
              `   Email: ${r.email}\n` +
              `   Office: ${bldg}, ${r.office_room}` +
              booking
            );
          });

          return `Found ${rows.length} result${rows.length === 1 ? "" : "s"} for "${safe}":\n\n${lines.join("\n\n")}`;
        },
      }),
      startNavigation: tool({
        description:
          "Use this to provide turn-by-turn directions to a specific building, floor, or office on campus.",
        parameters: z.object({
          destination: z.string().describe("The building, room, or office the student is navigating to."),
          estimatedMinutes: z.number().describe("Estimated walking time in minutes."),
          steps: z.array(z.string()).describe("Ordered list of turn-by-turn walking directions."),
        }),
        execute: async ({ destination, steps }) => {
          return { success: true, destination, steps };
        },
      }),
    },
  });

  const responseHeaders: Record<string, string> = {};
  if (newConversationId) {
    responseHeaders["x-conversation-id"] = newConversationId;
    // Same-origin requests expose all headers; explicit declaration is belt-and-suspenders.
    responseHeaders["Access-Control-Expose-Headers"] = "x-conversation-id";
  }

  return result.toDataStreamResponse({ headers: responseHeaders });
}
