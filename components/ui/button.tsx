import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
          : "border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:border-zinc-600 active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
