"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStore } from "@/lib/local/store";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const s = loadStore();
    if (!s.profile?.onboarding_completed) router.replace("/onboarding");
    else router.replace("/dashboard");
  }, [router]);
  return <div className="min-h-dvh flex items-center justify-center text-muted">Loading STRATOS...</div>;
}
