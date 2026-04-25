"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type DraftApiResponse =
  | { status: "needs_info"; question: string; missing: string[] }
  | { status: "ready"; subject: string; body: string }
  | { error: string };

function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

export function DraftClient() {
  const [professorName, setProfessorName] = useState("");
  const [professorEmail, setProfessorEmail] = useState("");
  const [targetOpportunity, setTargetOpportunity] = useState("");
  const [relationshipContext, setRelationshipContext] = useState("");
  const [studentAssets, setStudentAssets] = useState("");

  const [assistantMessage, setAssistantMessage] = useState(
    "Tell me who you need to write to. I will guide you to a polished draft and send it directly."
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasResult = subject.length > 0 && body.length > 0;

  async function onGenerateDraft() {
    setIsLoading(true);
    setSubject("");
    setBody("");
    setCopied(false);
    try {
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorName,
          professorEmail,
          targetOpportunity,
          relationshipContext,
          studentAssets,
        }),
      });
      const data = (await response.json()) as DraftApiResponse;
      if ("error" in data) {
        setAssistantMessage(data.error);
        return;
      }
      if (data.status === "needs_info") {
        setAssistantMessage(data.question);
        return;
      }
      setAssistantMessage("Draft ready. Review it below, then hit send.");
      setSubject(data.subject);
      setBody(data.body);
    } finally {
      setIsLoading(false);
    }
  }

  function onSendDraft() {
    const to = professorEmail.trim();
    if (!to) {
      setAssistantMessage("Please enter the professor's email address before sending.");
      return;
    }
    window.location.href = buildMailtoUrl(to, subject, body);
  }

  function onCopyDraft() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="space-y-3">
        <p className="text-sm text-zinc-400">Who are you writing to?</p>
        <Input
          placeholder="Professor name (e.g., Dr. Evelyn Thomas)"
          value={professorName}
          onChange={(e) => setProfessorName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Professor email (e.g., thomase@uapb.edu)"
          value={professorEmail}
          onChange={(e) => setProfessorEmail(e.target.value)}
        />
        <div className="pt-2">
          <p className="mb-2 text-sm text-zinc-400">Your context</p>
        </div>
        <Input
          placeholder="Target opportunity (e.g., SWE Internship at Google)"
          value={targetOpportunity}
          onChange={(e) => setTargetOpportunity(e.target.value)}
        />
        <Input
          placeholder="Relationship context (class + grade)"
          value={relationshipContext}
          onChange={(e) => setRelationshipContext(e.target.value)}
        />
        <textarea
          className="min-h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          placeholder="Resume highlights, GPA, projects, deadlines..."
          value={studentAssets}
          onChange={(e) => setStudentAssets(e.target.value)}
        />
        <Button onClick={onGenerateDraft} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate draft"}
        </Button>
        <p className="text-sm text-zinc-300">{assistantMessage}</p>
      </Card>

      <Card className="flex flex-col space-y-3">
        <p className="text-sm text-zinc-400">Your email draft</p>
        {hasResult && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5">
            <p className="text-xs text-zinc-500">Subject</p>
            <p className="text-sm font-medium text-zinc-100">{subject}</p>
          </div>
        )}
        <textarea
          readOnly
          value={body}
          className="min-h-[300px] flex-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-100"
          placeholder="Your email draft will appear here..."
        />
        <div className="flex gap-3">
          <button
            onClick={onSendDraft}
            disabled={!hasResult}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send draft
          </button>
          <button
            onClick={onCopyDraft}
            disabled={!hasResult}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {hasResult && (
          <p className="text-center text-xs text-zinc-500">
            &ldquo;Send draft&rdquo; opens your default email app with everything pre-filled.
          </p>
        )}
      </Card>
    </div>
  );
}
