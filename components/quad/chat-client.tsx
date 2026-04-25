"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MapPin, Clock, Loader2, Navigation, Mic } from "lucide-react";

// ── Minimal SpeechRecognition interface (not in TS 5.x DOM lib by default) ────

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

// ── Types mirroring the SDK's UIMessage parts ─────────────────────────────────

type TextPart = { type: "text"; text: string };
type StepStartPart = { type: "step-start" };
type ToolInvocationPart = {
  type: "tool-invocation";
  toolInvocation: {
    state: "partial-call" | "call" | "result";
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  };
};
type UIPart = TextPart | StepStartPart | ToolInvocationPart | { type: string };

// ── Navigation card ───────────────────────────────────────────────────────────

type NavArgs = {
  destination: string;
  estimatedMinutes: number;
  steps: string[];
};

function NavigationCard({
  args,
  state,
}: {
  args: NavArgs;
  state: "partial-call" | "call" | "result";
}) {
  const loading = state !== "result";

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <Navigation className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Live Navigation
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {args.destination}
          </p>
        </div>
        {!loading && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span className="text-xs text-zinc-300">
              {args.estimatedMinutes} min
            </span>
          </div>
        )}
      </div>

      {/* Steps timeline */}
      {loading ? (
        <div className="px-4 py-4 text-xs text-zinc-500">
          Calculating route…
        </div>
      ) : (
        <ol className="px-4 py-3">
          {args.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              {/* Connector */}
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                  {i + 1}
                </div>
                {i < args.steps.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-zinc-800" />
                )}
              </div>
              {/* Step text */}
              <p
                className={`pb-3 pt-0.5 text-sm leading-snug ${
                  i === args.steps.length - 1
                    ? "font-medium text-blue-400"
                    : "text-zinc-300"
                }`}
              >
                {step}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Footer */}
      {!loading && (
        <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-2.5">
          <MapPin className="h-3 w-3 text-zinc-600" />
          <span className="text-xs text-zinc-600">
            Directions are approximate — follow campus signage
          </span>
        </div>
      )}
    </div>
  );
}

// ── Directory search status pill ─────────────────────────────────────────────

function SearchPill({ state, query }: { state: string; query?: string }) {
  const done = state === "result";
  return (
    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
      {done ? (
        <span className="text-zinc-600">
          ↳ Searched directory
          {query ? ` for "${query}"` : ""}
        </span>
      ) : (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Searching directory…</span>
        </>
      )}
    </div>
  );
}

// ── Part renderer ─────────────────────────────────────────────────────────────

function MessageParts({ parts }: { parts: UIPart[] }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "step-start") {
          // Step separator — invisible, no UI needed
          return null;
        }

        if (part.type === "text") {
          const text = (part as TextPart).text;
          if (!text) return null;
          return (
            <span key={i} className="whitespace-pre-wrap">
              {text}
            </span>
          );
        }

        if (part.type === "tool-invocation") {
          const { toolInvocation } = part as ToolInvocationPart;
          const { toolName, state, args } = toolInvocation;

          if (toolName === "startNavigation") {
            return (
              <NavigationCard
                key={toolInvocation.toolCallId}
                args={args as NavArgs}
                state={state}
              />
            );
          }

          if (toolName === "searchDirectory") {
            return (
              <SearchPill
                key={toolInvocation.toolCallId}
                state={state}
                query={args.query as string | undefined}
              />
            );
          }

          return null;
        }

        return null;
      })}
    </>
  );
}

// ── Main chat component ───────────────────────────────────────────────────────

export function ChatClient() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello, I'm your Quad Assistant. Ask me anything about your campus — faculty, buildings, resources, or anything else.",
        },
      ],
    });

  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) formRef.current?.requestSubmit();
    }
  }

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as Record<string, unknown>;
    const RecognitionCtor = (win["SpeechRecognition"] ?? win["webkitSpeechRecognition"]) as
      | (new () => ISpeechRecognition)
      | undefined;

    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // flushSync forces React to apply setInput synchronously so the form
      // value is up-to-date before requestSubmit() reads it.
      flushSync(() => setInput(transcript));
      setIsListening(false);
      formRef.current?.requestSubmit();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  const visible = messages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  // Show typing dots only before the very first response token arrives
  const showTyping =
    isLoading &&
    visible.length > 0 &&
    visible[visible.length - 1].role === "user";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ── Scrollable history ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
          {visible.map((msg) => {
            const isUser = msg.role === "user";

            // The SDK attaches `parts` on UIMessage — access via unknown cast
            // because useChat types messages as Message[], not UIMessage[].
            const parts = (msg as unknown as { parts?: UIPart[] }).parts;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                {/* Quad avatar */}
                {!isUser && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                    Q
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "rounded-tr-sm bg-zinc-700 text-zinc-100"
                      : "rounded-tl-sm border border-zinc-800 bg-zinc-900 text-zinc-200"
                  }`}
                >
                  {parts && parts.length > 0 ? (
                    // ✅ Primary: use parts (the authoritative SDK data model)
                    <MessageParts parts={parts} />
                  ) : msg.content ? (
                    // Fallback for the static welcome message (no parts)
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Typing dots */}
          {showTyping && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                Q
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t border-zinc-800 bg-[hsl(0_0%_2%)] px-4 pb-6 pt-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-2xl items-end gap-3 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 transition-all duration-200 ease-in-out focus-within:border-zinc-500"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your campus…"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[16px] sm:text-sm leading-relaxed text-white placeholder-zinc-500 outline-none disabled:opacity-50"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          />
          {/* Mic button */}
          <button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-30 ${
              isListening
                ? "animate-pulse text-red-500 hover:text-red-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-zinc-700">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
