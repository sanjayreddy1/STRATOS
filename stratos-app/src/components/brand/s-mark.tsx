"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SMarkProps {
  size?: number;
  className?: string;
}

export function SMark({ size = 40, className }: SMarkProps) {
  const gradientId = `s-mark-gradient-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Stratos mark"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8923A" />
          <stop offset="100%" stopColor="#7A8B4A" />
        </linearGradient>
      </defs>
      {/* Greek sigma / shield-inspired S mark */}
      <path
        d={[
          "M 48 12",
          "L 16 12",
          "L 32 32",
          "L 16 52",
          "L 48 52",
          "L 48 44",
          "L 28 44",
          "L 38 32",
          "L 28 20",
          "L 48 20",
          "Z",
        ].join(" ")}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
