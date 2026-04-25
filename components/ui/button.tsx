import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-white text-black hover:bg-zinc-200"
          : "border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900",
        className
      )}
      {...props}
    />
  );
}
