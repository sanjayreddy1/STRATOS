"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TestEmailButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function send() {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/email/test", { method: "POST" });
      const data = await res.json();
      setMsg(data.ok ? "Test email sent. Check your inbox." : `Failed: ${data.error || "Unknown error"}`);
    } catch (e: any) {
      setMsg(`Failed: ${e?.message || e}`);
    } finally { setLoading(false); }
  }
  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send test email"}</Button>
      {msg && <p className="text-xs text-accent">{msg}</p>}
    </div>
  );
}
