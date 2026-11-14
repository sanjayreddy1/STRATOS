import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" };

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    primary: "bg-primary text-[#0B0D0C] hover:bg-primary-hover shadow-sm shadow-black/20",
    secondary: "bg-surface-raised border border-border text-text hover:border-border-hover hover:bg-surface-raised/80",
    ghost: "text-text hover:bg-surface-raised",
    danger: "bg-danger/90 text-white hover:bg-danger",
  } as const;
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-sm" } as const;
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
