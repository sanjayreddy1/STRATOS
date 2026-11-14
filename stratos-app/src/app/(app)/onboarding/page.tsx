"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loadStore, saveStore, uid } from "@/lib/local/store";
import { Shield, Target, Activity, Compass } from "lucide-react";

function addMonths(date: Date, months: number) { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
function fmt(d: Date) { return d.toISOString().slice(0,10); }

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", timezone: "Asia/Kolkata",
    age: "", branch: "", graduation_year: "", target_date: "",
    height_cm: "", weight_kg: "", run_1600_sec: "", pushups: "", pullups: "", situps: "",
    weak_areas: "", daily_hours: "2", preferred_reminder_time: "06:30",
  });
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const defaultTarget = fmt(addMonths(new Date(), 18));
    const s = loadStore();
    if (s.profile) {
      setForm(f => ({
        ...f,
        name: s.profile.name || f.name,
        timezone: s.profile.timezone || tz,
        age: s.profile.age != null ? String(s.profile.age) : f.age,
        branch: s.profile.engineering_branch || f.branch,
        graduation_year: s.profile.graduation_year != null ? String(s.profile.graduation_year) : f.graduation_year,
        target_date: s.profile.target_date || defaultTarget,
        daily_hours: s.profile.daily_hours != null ? String(s.profile.daily_hours) : f.daily_hours,
        preferred_reminder_time: s.profile.preferred_reminder_time || f.preferred_reminder_time,
      }));
    } else {
      setForm(f => ({ ...f, timezone: tz, target_date: defaultTarget }));
    }
    setReady(true);
  }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const store = loadStore();
    store.profile = {
      id: "local",
      name: form.name, timezone: form.timezone,
      age: form.age ? Number(form.age) : null,
      engineering_branch: form.branch, graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
      target_date: form.target_date,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      fitness_baseline: { run_1600_sec: Number(form.run_1600_sec||0), pushups: Number(form.pushups||0), pullups: Number(form.pullups||0), situps: Number(form.situps||0) },
      weak_areas: form.weak_areas.split(",").map(s=>s.trim()).filter(Boolean),
      daily_hours: Number(form.daily_hours||2),
      preferred_reminder_time: form.preferred_reminder_time,
      onboarding_completed: true,
    };
    const phases = [
      { phase: 1, months: [0,1,2,3], title: "Foundation", items: ["Fitness base & routine", "English & communication", "GK/current affairs habit", "Psychology basics & self-awareness"] },
      { phase: 2, months: [4,5,6,7,8,9], title: "Skill Build", items: ["OIR practice", "PPDT/TAT/WAT/SRT/SD daily", "Timed practice & feedback", "Strengthen weak areas"] },
      { phase: 3, months: [10,11,12,13,14], title: "GTO & Interview", items: ["GTO tasks & lecturette", "Personal interview practice", "Mock SSBs", "Personality refinement"] },
      { phase: 4, months: [15,16,17], title: "Revision & Polish", items: ["Full revision & mocks", "Medical readiness checks", "Final polish & confidence", "Peak fitness & consistency"] },
    ];
    store.roadmap_tasks = [];
    for (const ph of phases) {
      for (const m of ph.months) {
        const due = addMonths(new Date(), m + 1);
        store.roadmap_tasks.push({ id: uid("road"), phase: ph.phase, month_index: m + 1, title: `Month ${m+1}: ${ph.title}`, description: ph.items.join(" • "), due_date: fmt(due), original_due_date: fmt(due), status: "pending", rescheduled_count: 0 });
      }
    }
    if (!store.topics.length) {
      store.topics = ["OIR","PPDT","TAT","WAT","SRT","SD","GTO Tasks","Lecturette","Personal Interview","Current Affairs","Army/Defence GK","Core Engineering","English","Fitness","Medical Readiness"]
        .map(name => ({ id: uid("topic"), category: name === "Core Engineering" ? "Engineering" : "SSB/Prep", name, status: "not_started", confidence: 1 }));
    }
    store.email_preferences = { ...(store.email_preferences||{}), daily_brief_time: form.preferred_reminder_time, paused_all: false };
    saveStore(store);
    router.push("/dashboard");
  }

  if (!ready) return null;
  const field = (label: string, key: keyof typeof form, type="text", props: any={}) => (
    <div><label className="text-xs text-muted">{label}</label><Input type={type} value={(form as any)[key]} onChange={e=>set(key, e.target.value)} className="mt-1" {...props} /></div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-surface to-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent"><Shield size={20} /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-accent">STRATOS Setup</p>
            <h1 className="page-title mt-1">Build your SSB preparation profile</h1>
            <p className="page-subtitle mt-1">Local-storage mode: your data stays in this browser. We’ll generate an 18-month roadmap tailored to your target and routine.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Target size={18} className="text-accent"/> Profile & target</CardTitle><div className="text-xs text-muted mt-1">Basic details to personalize your plan and AI practice context.</div></div></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-text">
            {field("Name","name","text",{required:true, placeholder:"Your name"})}
            {field("Timezone","timezone")}
            {field("Age","age","number",{min:0})}
            {field("Engineering branch","branch","text",{placeholder:"e.g. Mechanical Engineering"})}
            {field("Graduation year","graduation_year","number")}
            {field("Target SSB date","target_date","date",{required:true})}
            {field("Daily study hours","daily_hours","number",{step:"0.5", min:0})}
            {field("Preferred reminder time","preferred_reminder_time","time")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-accent"/> Fitness baseline</CardTitle><div className="text-xs text-muted mt-1">Optional starting point to track progress over time.</div></div></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 text-text">
            {field("Height (cm)","height_cm","number")}
            {field("Weight (kg)","weight_kg","number")}
            {field("1.6 km time (sec)","run_1600_sec","number")}
            {field("Push-ups","pushups","number")}
            {field("Pull-ups","pullups","number")}
            {field("Sit-ups","situps","number")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Compass size={18} className="text-accent"/> Focus areas</CardTitle><div className="text-xs text-muted mt-1">Help prioritize practice where you need it most.</div></div></CardHeader>
          <CardContent className="text-text">
            {field("Weak areas (comma separated)","weak_areas","text",{placeholder:"WAT, running stamina, current affairs"})}
            <p className="text-xs text-muted mt-2">Tip: be specific (e.g. PPDT narration, lecturette structure, 1.6km timing).</p>
          </CardContent>
        </Card>

        {msg && <p className="text-sm text-danger">{msg}</p>}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button type="submit" className="w-full sm:w-auto">Complete setup & generate roadmap</Button>
          <span className="text-xs text-muted">You can update your profile anytime in Settings.</span>
        </div>
      </form>
    </div>
  );
}
