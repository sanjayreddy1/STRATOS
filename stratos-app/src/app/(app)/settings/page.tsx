"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore } from "@/lib/local/store";
import { TestEmailButton } from "@/components/settings/test-email-button";
import { User, KeyRound, Mail, Trash2, Save } from "lucide-react";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<any>({ paused_all: false });
  const [profile, setProfile] = useState<any>({ name: "", target_date: "", engineering_branch: "", daily_hours: 2 });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const s = loadStore();
    setPrefs(s.email_preferences || { paused_all: false });
    setProfile({ name: s.profile?.name || "", target_date: s.profile?.target_date || "", engineering_branch: s.profile?.engineering_branch || "", daily_hours: s.profile?.daily_hours ?? 2 });
  }, []);
  function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const s = loadStore(); s.email_preferences = next; saveStore(s);
  }
  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const s = loadStore();
    s.profile = { ...(s.profile || {}), name: profile.name, target_date: profile.target_date, engineering_branch: profile.engineering_branch, daily_hours: Number(profile.daily_hours || 0), onboarding_completed: true };
    saveStore(s);
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }
  function resetAll() {
    if (!confirm("Clear all local Stratos data in this browser?")) return;
    localStorage.removeItem("stratos_store_v1");
    location.href = "/onboarding";
  }
  const row = (key: string, label: string, desc?: string) => (
    <label className="flex items-center justify-between gap-4 border border-border rounded-xl p-3.5 text-sm text-text hover:bg-surface-raised/40 transition-colors cursor-pointer">
      <span>
        <span className="block font-medium text-text/95">{label}</span>
        {desc && <span className="block text-xs text-muted mt-0.5">{desc}</span>}
      </span>
      <input type="checkbox" checked={!!prefs[key]} onChange={()=>toggle(key)} className="h-4 w-4 accent-[var(--color-accent)]" />
    </label>
  );
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle mt-1">Manage your profile, local data, and app preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><User size={18} className="text-accent" /> Profile</CardTitle>
            <div className="text-xs text-muted mt-1">Stored locally in this browser and used to personalize your preparation.</div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4 text-text">
            <div><label className="text-xs text-muted">Name</label><input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm focus:border-accent/60 focus:ring-2 focus:ring-accent/15 outline-none" placeholder="Your name" /></div>
            <div><label className="text-xs text-muted">Target SSB date</label><input type="date" value={profile.target_date||""} onChange={e=>setProfile({...profile,target_date:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm focus:border-accent/60 focus:ring-2 focus:ring-accent/15 outline-none" /></div>
            <div><label className="text-xs text-muted">Engineering branch</label><input value={profile.engineering_branch||""} onChange={e=>setProfile({...profile,engineering_branch:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm focus:border-accent/60 focus:ring-2 focus:ring-accent/15 outline-none" placeholder="e.g. Computer Science" /></div>
            <div><label className="text-xs text-muted">Daily study hours</label><input type="number" step="0.5" min="0" value={profile.daily_hours??""} onChange={e=>setProfile({...profile,daily_hours:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm focus:border-accent/60 focus:ring-2 focus:ring-accent/15 outline-none" /></div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <button className="h-11 px-5 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2"><Save size={16}/> Save profile</button>
              {saved && <span className="text-sm text-success">Saved locally</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><KeyRound size={18} className="text-accent" /> API keys & storage</CardTitle>
            <div className="text-xs text-muted mt-1">Server keys power news and AI features; your prep data stays on this device.</div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-text/90 space-y-3">
          <div className="rounded-xl border border-border bg-background/30 p-3">
            <p><span className="font-medium text-text">Server API keys (<code className="font-mono text-accent">.env</code>):</span> Tavily, Groq, and Gemini enable <code className="font-mono">/api/news</code>, <code className="font-mono">/api/ai/interview</code>, <code className="font-mono">/api/ai/evaluate</code>, and detailed lesson generation. Restart <code className="font-mono">pnpm dev</code> after changes.</p>
          </div>
          <div className="rounded-xl border border-border bg-background/30 p-3">
            <p><span className="font-medium text-text">Local storage mode:</span> profile, roadmap, tasks, logs, workouts, lessons, and saved content are stored in browser <code className="font-mono">localStorage</code>. Data is device/browser-specific (no Supabase sync).</p>
          </div>
          <button onClick={resetAll} className="h-10 px-4 rounded-xl border border-danger/50 text-danger hover:bg-danger/10 transition-colors inline-flex items-center gap-2"><Trash2 size={16}/> Reset local data</button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Mail size={18} className="text-accent" /> Notification preferences</CardTitle>
            <div className="text-xs text-muted mt-1">Saved locally for UI state. Automated server emails require a backend scheduler/database (disabled in local-only mode).</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {row("daily_brief","Daily morning brief","Start-of-day focus and priorities")}
          {row("evening_nudge","Evening nudge","Reminder to log progress")}
          {row("weekly_report","Weekly report","Summary of study and fitness")}
          {row("revision_reminders","Revision reminders","Spaced revision prompts")}
          {row("milestone_countdown","Milestone countdown","Target date and roadmap milestones")}
          {row("inactivity_alert","Inactivity alert","Nudge after missed days")}
          {row("recruitment_alert","Recruitment alerts","Notifications/news reminders")}
          {row("custom_reminders","Custom reminders","User-defined reminders")}
          {row("paused_all","Pause all", "Disable all notification preferences")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>SMTP test (server)</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted">If SMTP environment variables are configured on the server, you can send a test email.</p>
          <TestEmailButton />
        </CardContent>
      </Card>
    </div>
  );
}
