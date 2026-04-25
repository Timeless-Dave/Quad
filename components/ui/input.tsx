import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-[16px] sm:text-sm text-zinc-100",
        "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500",
        "transition-all duration-200 ease-in-out",
        className
      )}
      {...props}
    />
  );
}
