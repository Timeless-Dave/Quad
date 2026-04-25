import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-float", className)}>
      {children}
    </div>
  );
}
