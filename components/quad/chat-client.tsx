"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MapPin, Clock, Loader2, Navigation, Mic, Plus, Menu, X } from "lucide-react";

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

// ── Domain types ──────────────────────────────────────────────────────────────

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type DbMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string | null;
  tool_calls: unknown;
  created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content:
    "Hello, I'm your Quad Assistant. Ask me anything about your campus — faculty, buildings, resources, or anything else.",
};

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

      {loading ? (
        <div className="px-4 py-4 text-xs text-zinc-500">Calculating route…</div>
      ) : (
        <ol className="px-4 py-3">
          {args.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                  {i + 1}
                </div>
                {i < args.steps.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-zinc-800" />
                )}
              </div>
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
          ↳ Searched directory{query ? ` for "${query}"` : ""}
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
        if (part.type === "step-start") return null;

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
  // ── Conversation sidebar state ────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch {
      // Non-fatal — sidebar just won't populate
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Chat hook ─────────────────────────────────────────────────────────────
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [WELCOME_MESSAGE],
    onResponse: (response) => {
      // Read the conversation id the server just created (new conversations only)
      const newConvId = response.headers.get("x-conversation-id");
      if (newConvId) {
        setCurrentConversationId(newConvId);
        // Refresh sidebar so the new conversation appears immediately
        fetchConversations();
      }
    },
  });

  // ── Refs ──────────────────────────────────────────────────────────────────
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

  // ── Conversation actions ──────────────────────────────────────────────────
  function startNewChat() {
    setCurrentConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setSidebarOpen(false);
    // Small delay lets the sidebar close animation finish on mobile
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function selectConversation(convId: string) {
    setSidebarOpen(false);
    if (convId === currentConversationId) return;

    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (!res.ok) return;
      const dbMsgs: DbMessage[] = await res.json();
      const chatMsgs = dbMsgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content ?? "",
        }));
      setMessages(chatMsgs);
      setCurrentConversationId(convId);
    } catch {
      // Non-fatal — keep current state
    }
  }

  // ── Submit: inject current conversationId into request body ──────────────
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    handleSubmit(e, { body: { conversationId: currentConversationId } });
  }

  // ── Voice input ───────────────────────────────────────────────────────────
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

  // ── Derived display state ─────────────────────────────────────────────────
  const visible = messages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const showTyping =
    isLoading &&
    visible.length > 0 &&
    visible[visible.length - 1].role === "user";

  const showStarters =
    !isLoading && visible.length === 1 && visible[0].role === "assistant";

  const STARTERS = [
    "Help me draft an email to Dean Branch asking for an internship referral.",
    "I'm a new student. How do I find the Computer Science building?",
    "What campus resources are available for mental health support?",
    "What clubs or organizations can I join as a freshman?",
  ];

  function submitStarter(text: string) {
    flushSync(() => setInput(text));
    formRef.current?.requestSubmit();
  }

  const activeConvTitle =
    conversations.find((c) => c.id === currentConversationId)?.title ?? null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        className={`
          absolute inset-y-0 left-0 z-30 flex w-[260px] shrink-0 flex-col
          border-r border-zinc-800 bg-zinc-950
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4">
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Conversations
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              title="New conversation"
              className="flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <nav className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-600">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === currentConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`
                    w-full px-4 py-3 text-left transition
                    hover:bg-zinc-900
                    ${isActive ? "border-l-2 border-zinc-400 bg-zinc-900 pl-[14px]" : "border-l-2 border-transparent"}
                  `}
                >
                  <p className="truncate text-sm text-zinc-200">{conv.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    {relativeTime(conv.updated_at)}
                  </p>
                </button>
              );
            })
          )}
        </nav>
      </aside>

      {/* ── Mobile backdrop overlay ── */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Chat area ── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mobile top bar — hidden on desktop */}
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversations"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="truncate text-sm text-zinc-400">
            {activeConvTitle ?? "New conversation"}
          </span>
        </div>

        {/* Scrollable message history */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
            {visible.map((msg) => {
              const isUser = msg.role === "user";
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
                    {parts?.some(
                      (p) =>
                        (p.type === "text" && !!(p as TextPart).text) ||
                        p.type === "tool-invocation"
                    ) ? (
                      <MessageParts parts={parts} />
                    ) : msg.content ? (
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

        {/* Starter prompts */}
        {showStarters && (
          <div className="shrink-0 px-4 pb-3">
            <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
              {STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submitStarter(prompt)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-300 transition-all duration-200 ease-in-out hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="shrink-0 border-t border-zinc-800 bg-[hsl(0_0%_2%)] px-4 pb-6 pt-4">
          <form
            ref={formRef}
            onSubmit={onSubmit}
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
    </div>
  );
}
