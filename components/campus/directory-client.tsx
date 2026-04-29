"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import type { Professor } from "@/lib/data/professors";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";

export function DirectoryClient({ professors }: { professors: Professor[] }) {
  const [query, setQuery] = useState("");
  const [activeProfessor, setActiveProfessor] = useState<Professor | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return professors;
    const value = query.toLowerCase();
    return professors.filter((professor) =>
      [professor.fullName, professor.title, professor.email, professor.officeRoom, professor.building]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [professors, query]);

  return (
    <div className="space-y-5">
      <Input
        placeholder="Search by name, title, office, building..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-12 text-center text-sm text-zinc-500">
          No faculty match &ldquo;{query}&rdquo;.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((professor) => (
          <Card key={professor.id} className="space-y-2 cursor-default">
            <p className="text-lg font-semibold">{professor.fullName}</p>
            <p className="text-sm text-zinc-400">
              {professor.title} · {professor.department}
            </p>
            <p className="text-sm text-zinc-200">{professor.email}</p>
            <p className="text-sm text-zinc-300">
              {professor.building}, {professor.officeRoom}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  toast("Calendar integration coming in Phase 2!", {
                    icon: <CalendarDays className="h-4 w-4" />,
                  })
                }
              >
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Book Meeting
              </Button>
              <Modal
              open={activeProfessor?.id === professor.id}
              onOpenChange={(open) => setActiveProfessor(open ? professor : null)}
              title={`${professor.building} route`}
              trigger={<Button variant="ghost">View map route</Button>}
            >
              <Image
                src={professor.mapImage}
                alt={`${professor.building} map`}
                width={720}
                height={420}
                className="h-auto w-full rounded-lg border border-zinc-800"
              />
            </Modal>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
