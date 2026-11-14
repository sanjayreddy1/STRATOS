import { cn } from "@/lib/utils";

type Props = { className?: string; size?: number; withTagline?: boolean };

export function StratosLogo({ className, size = 32, withTagline = false }: Props) {
  const id = "stratos-grad";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Stratos mark" role="img">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8923A" />
            <stop offset="100%" stopColor="#7A8B4A" />
          </linearGradient>
        </defs>
        <path d="M48 12 L16 12 L32 32 L16 52 L48 52 L48 44 L28 44 L38 32 L28 20 L48 20 Z" fill={`url(#${id})`} />
      </svg>
      <div className="leading-none">
        <div className="font-brand font-bold tracking-[0.18em] text-[18px] sm:text-[20px] gradient-text">STRATOS</div>
        {withTagline && <div className="text-[10px] tracking-wide text-muted mt-1">Train like an officer.</div>}
      </div>
    </div>
  );
}
