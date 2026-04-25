import { Navbar } from "@/components/refar/navbar";
import { DraftClient } from "@/components/refar/draft-client";

export default function DraftPage() {
  return (
    <div className="theme-dark min-h-dvh bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-6">
          <h1 className="font-serif text-3xl">Recommendation Draft Assistant</h1>
          <p className="text-zinc-400">
            Fill in your context, generate a polished recommendation request, and send it directly from here.
          </p>
          <DraftClient />
        </div>
      </main>
    </div>
  );
}
