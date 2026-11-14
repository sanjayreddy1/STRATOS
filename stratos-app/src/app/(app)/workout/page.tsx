"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";

export default function WorkoutPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ log_date: "", workout_type: "", run_distance_km: "", run_time_sec: "", pushups: "", pullups: "", situps: "", fatigue: "", notes: "" });
  const refresh = () => setLogs((loadStore().workout_logs||[]).slice().sort((a,b)=>b.log_date.localeCompare(a.log_date)).slice(0,20));
  useEffect(() => { setForm(f => ({ ...f, log_date: new Date().toISOString().slice(0,10) })); refresh(); }, []);
  const set = (k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const s = loadStore();
    s.workout_logs.push({ id: uid("wkt"), log_date: form.log_date, workout_type: form.workout_type||"General", run_distance_km: form.run_distance_km?Number(form.run_distance_km):null, run_time_sec: form.run_time_sec?Number(form.run_time_sec):null, pushups: form.pushups?Number(form.pushups):null, pullups: form.pullups?Number(form.pullups):null, situps: form.situps?Number(form.situps):null, fatigue: form.fatigue?Number(form.fatigue):null, notes: form.notes });
    saveStore(s); refresh();
  }
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Fitness & Workout</h1>
      <Card><CardHeader><CardTitle>Safety notice</CardTitle></CardHeader><CardContent><p className="text-sm">Consult a doctor/trainer before intense training. Never push through pain flags. Informational only. Verify standards on <a className="text-accent underline" href="https://joinindianarmy.nic.in" target="_blank" rel="noreferrer">joinindianarmy.nic.in</a>.</p></CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Plan</CardTitle></CardHeader><CardContent className="text-sm space-y-2 text-text"><p><b>Goals:</b> 1.6 km under 6:30, push-ups, pull-ups, sit-ups, stamina, flexibility.</p><ul className="list-disc pl-5 text-muted"><li>Base: aerobic base & form</li><li>Build: intervals & strength</li><li>Peak: sharpen and taper</li></ul><p className="text-muted">5-6 days/week, rest/deload weeks. Log consistently (saved locally).</p></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Log workout (local)</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid grid-cols-2 gap-2 text-text">
              <div className="col-span-2"><label className="text-xs text-muted">Date</label><input value={form.log_date} onChange={e=>set("log_date",e.target.value)} type="date" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div className="col-span-2"><label className="text-xs text-muted">Workout type</label><input value={form.workout_type} onChange={e=>set("workout_type",e.target.value)} className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Run (km)</label><input value={form.run_distance_km} onChange={e=>set("run_distance_km",e.target.value)} type="number" step="0.1" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Run time (sec)</label><input value={form.run_time_sec} onChange={e=>set("run_time_sec",e.target.value)} type="number" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Push-ups</label><input value={form.pushups} onChange={e=>set("pushups",e.target.value)} type="number" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Pull-ups</label><input value={form.pullups} onChange={e=>set("pullups",e.target.value)} type="number" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Sit-ups</label><input value={form.situps} onChange={e=>set("situps",e.target.value)} type="number" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div><label className="text-xs text-muted">Fatigue (1-10)</label><input value={form.fatigue} onChange={e=>set("fatigue",e.target.value)} type="number" min="1" max="10" className="h-10 w-full rounded-lg border border-border bg-surface-raised px-2 text-sm" /></div>
              <div className="col-span-2"><label className="text-xs text-muted">Notes</label><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm" /></div>
              <div className="col-span-2"><button className="h-10 px-4 rounded-lg bg-primary text-[#0B0D0C] font-medium">Save workout</button></div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card><CardHeader><CardTitle>Recent logs</CardTitle></CardHeader><CardContent className="space-y-2">{logs.map(l=>(<div key={l.id} className="border border-border rounded-lg p-3 text-text text-sm"><span className="font-medium">{l.log_date}</span> <span className="text-muted">{l.workout_type}</span> {l.run_distance_km && <span className="font-mono">• {l.run_distance_km}km {l.run_time_sec?`(${l.run_time_sec}s)`:''}</span>} {(l.pushups||l.pullups||l.situps)?<span className="font-mono">• PU {l.pushups||0} Pull {l.pullups||0} SU {l.situps||0}</span>:null}</div>))}{!logs.length && <p className="text-muted">No workouts logged yet.</p>}</CardContent></Card>
    </div>
  );
}
