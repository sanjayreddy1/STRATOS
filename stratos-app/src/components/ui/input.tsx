import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm text-text placeholder:text-muted/80 outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15", className)} {...props} />;
});
