"use client";

import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  starts_at: string;
  ends_at: string | null;
  source_url: string | null;
};

type Props = {
  events: Event[];
  schoolName: string;
};

const TABS = ["All", "Career", "Academic", "Wellness", "Governance", "Orientation"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_STYLES: Record<string, string> = {
  Career: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Academic: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Wellness: "bg-green-500/15 text-green-400 border-green-500/30",
  Governance: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Orientation: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

function categoryStyle(category: string | null): string {
  if (!category) return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
  return CATEGORY_STYLES[category] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

function formatEventDate(startsAt: string): string {
  const date = new Date(startsAt);
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

function EventCard({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${categoryStyle(event.category)}`}
        >
          {event.category ?? "General"}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-white">{event.title}</h3>

      <p className="text-xs font-medium text-zinc-400">{formatEventDate(event.starts_at)}</p>

      {event.location && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{event.location}</span>
        </div>
      )}

      {event.description && (
        <div>
          <p
            className={`text-sm leading-relaxed text-zinc-400 ${expanded ? "" : "line-clamp-2"}`}
          >
            {event.description}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs text-zinc-600 transition hover:text-zinc-400"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}

      {event.source_url && (
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View details
        </a>
      )}
    </div>
  );
}

export function EventsClient({ events, schoolName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered =
    activeTab === "All" ? events : events.filter((e) => e.category === activeTab);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Campus Events</h1>
        <p className="mt-1 text-sm text-zinc-500">{schoolName}</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              activeTab === tab
                ? "bg-zinc-100 text-zinc-900"
                : "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-500">No events found</p>
          {activeTab !== "All" && (
            <p className="mt-1 text-sm text-zinc-600">
              Try switching to "All" or check back later.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
