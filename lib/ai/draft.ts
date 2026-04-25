export type DraftInput = {
  targetOpportunity?: string;
  relationshipContext?: string;
  studentAssets?: string;
  professorName?: string;
  professorEmail?: string;
  studentName?: string;
  studentEmail?: string;
};

export type DraftResult =
  | { status: "needs_info"; missing: string[]; question: string }
  | { status: "ready"; subject: string; body: string };

const REQUIRED_FIELDS: Array<keyof DraftInput> = [
  "targetOpportunity",
  "relationshipContext",
  "studentAssets",
];

const SYSTEM_PROMPT = `You are Refar, an email drafting assistant for university students requesting letters of recommendation from professors.

Given the student's context, write a professional, warm, and concise recommendation request email. The email should:
- Have a clear subject line starting with "Request for Recommendation"
- Open with a respectful greeting
- State the opportunity clearly
- Reference the student's relationship with the professor (class, grade, interactions)
- Mention the student's key qualifications briefly
- Ask politely for the recommendation
- Offer to provide additional materials
- Close professionally

Output ONLY the email. No commentary, no markdown, no extra text. First line must be the subject line prefixed with "Subject: ". Then a blank line, then the email body.`;

function buildPrompt(input: DraftInput): string {
  const lines = [
    `Professor: ${input.professorName || "Professor"}`,
    `Opportunity: ${input.targetOpportunity}`,
    `Relationship: ${input.relationshipContext}`,
    `Student qualifications: ${input.studentAssets}`,
  ];
  if (input.studentName) lines.push(`Student name: ${input.studentName}`);
  if (input.studentEmail) lines.push(`Student email: ${input.studentEmail}`);
  return lines.join("\n");
}

function parseAiResponse(text: string): { subject: string; body: string } {
  const trimmed = text.trim();
  const subjectMatch = trimmed.match(/^Subject:\s*(.+)/i);
  if (subjectMatch) {
    const afterSubject = trimmed.slice(subjectMatch[0].length).trim();
    return { subject: subjectMatch[1].trim(), body: afterSubject };
  }
  return {
    subject: `Request for Recommendation`,
    body: trimmed,
  };
}

async function callGemini(userPrompt: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function buildFallbackDraft(input: DraftInput): { subject: string; body: string } {
  const prof = input.professorName?.trim() || "Professor";
  const subject = `Request for Recommendation — ${input.targetOpportunity}`;
  const body = `Dear ${prof},

I hope you are doing well. I am applying for ${input.targetOpportunity} and would be grateful if you could write me a letter of recommendation.

To provide context, ${input.relationshipContext}. I have also included key details that may help: ${input.studentAssets}.

If you are comfortable supporting my application, I would truly appreciate your recommendation. I can also share my resume and any additional materials you need.

Thank you for your time and support.

Sincerely,
${input.studentName || "[Your Name]"}
${input.studentEmail || "[University Email]"}`;

  return { subject, body };
}

export async function generateDraft(input: DraftInput): Promise<DraftResult> {
  const missing = REQUIRED_FIELDS.filter((f) => !input[f]?.trim());
  if (missing.length > 0) {
    return {
      status: "needs_info",
      missing,
      question:
        "Before I draft the email, please share your target opportunity, your relationship with the professor (course + grade), and key assets (resume highlights, GPA, projects).",
    };
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackDraft(input);
    return { status: "ready", ...fallback };
  }

  try {
    const prompt = buildPrompt(input);
    const raw = await callGemini(prompt);
    const parsed = parseAiResponse(raw);
    return { status: "ready", ...parsed };
  } catch {
    const fallback = buildFallbackDraft(input);
    return { status: "ready", ...fallback };
  }
}
