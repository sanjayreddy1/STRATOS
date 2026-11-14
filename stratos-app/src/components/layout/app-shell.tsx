"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Map, CheckSquare, BookOpen, Dumbbell, Brain, Settings, NotebookPen, BarChart3, Shield, CalendarDays, Mic, Menu, X, ChevronRight } from "lucide-react";
import { StratosLogo } from "@/components/brand/stratos-logo";
import { loadStore } from "@/lib/local/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/interviewer", label: "AI Interview", icon: Mic },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/tracker", label: "Tracker", icon: CheckSquare },
  { href: "/daily-log", label: "Daily Log", icon: NotebookPen },
  { href: "/workout", label: "Fitness", icon: Dumbbell },
  { href: "/ssb", label: "SSB Lab", icon: Brain },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mobilePrimary = nav.slice(0, 4);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const s = loadStore();
    setName(s.profile?.name || "");
  }, [pathname]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className="min-h-dvh bg-background text-text">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--color-saffron)] via-white/50 to-[var(--color-india-green)] opacity-80" />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <StratosLogo size={28} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-muted flex items-center justify-end gap-1.5 uppercase tracking-wide"><Shield size={12} className="text-accent" /> Indian Army SSB Preparation</div>
              <div className="text-sm text-text font-medium">{name ? `Jai Hind, ${name}` : "Train like an officer"}</div>
            </div>
            <button onClick={() => setMenuOpen(v=>!v)} className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-surface/80 hover:bg-surface-raised transition-colors" aria-label="Menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{name ? `Jai Hind, ${name}` : "STRATOS"}</div>
                <div className="text-xs text-muted">Navigate your preparation</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm border transition-colors", active ? "bg-primary/15 border-accent/40 text-text" : "border-border bg-surface/40 text-muted hover:text-text hover:border-border-hover")}>
                    <Icon size={16} className={active ? "text-accent" : ""} /> <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 pb-28 md:pb-8 md:grid md:grid-cols-[230px_1fr] md:gap-7">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1.5 rounded-2xl border border-border/70 bg-surface/40 p-2">
            <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted">Mission Control</div>
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} className={cn("group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm border transition-all", active ? "bg-primary/15 border-accent/30 text-text shadow-sm" : "border-transparent text-muted hover:text-text hover:bg-surface-raised/70")}>
                  <span className="flex items-center gap-2.5"><Icon size={16} className={cn(active ? "text-accent" : "text-muted group-hover:text-text")} /> {item.label}</span>
                  {active && <ChevronRight size={14} className="text-accent" />}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 max-w-lg mx-auto">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] transition-colors", active ? "text-accent bg-primary/10" : "text-muted")}>
                <Icon size={17} /><span className="truncate w-full text-center px-1">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMenuOpen(v=>!v)} className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] transition-colors", menuOpen ? "text-accent bg-primary/10" : "text-muted")}>
            <Menu size={17} /><span>Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
