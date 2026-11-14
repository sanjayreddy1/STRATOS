"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";
import { Dumbbell, ShieldAlert, Save, Activity } from "lucide-react";

export default function WorkoutPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ log_date: "", workout_type: "", run_distance_km: "", run_time_sec: "", pushups: "", pullups: "", situps: "", fatigue: "", notes: "" });
  const refresh = () => setLogs((loadStore().workout_logs||[]).slice().sort((a:any,b:any)=>b.log_date.localeCompare(a.log_date)).slice(0,20));
  useEffect(() => { setForm(f => ({ ...f, log_date: new Date().toISOString().slice(0,10) })); refresh(); }, []);
  const set = (k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const s = loadStore();
    s.workout_logs.push({ id: uid("wkt"), log_date: form.log_date, workout_type: form.workout_type||"General", run_distance_km: form.run_distance_km?Number(form.run_distance_km):null, run_time_sec: form.run_time_sec?Number(form.run_time_sec):null, pushups: form.pushups?Number(form.pushups):null, pullups: form.pullups?Number(form.pullups):null, situps: form.situps?Number(form.situps):null, fatigue: form.fatigue?Number(form.fatigue):null, notes: form.notes });
    saveStore(s); refresh();
  }
  const inputCls = "mt-1 h-10 w-full rounded-lg border border-border bg-surface-raised/80 px-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Dumbbell className="text-accent" size={24}/> Fitness & Workout</h1>
        <p className="page-subtitle mt-1">Build stamina, strength, and consistency for SSB and officer training readiness.</p>
      </div>

      <Card className="border-accent/20 bg-accent/5">
        <CardHeader><CardTitle className="flex items-center gap-2 text-accent"><ShieldAlert size={18}/> Safety first</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-text/90">Consult a doctor/trainer before intense training. Warm up, progress gradually, and never push through pain. Informational guidance only. Verify standards on <a className="text-accent underline" href="https://joinindianarmy.nic.in" target="_blank" rel="noreferrer">joinindianarmy.nic.in</a>.</p></CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
        <Card>
          <CardHeader><div><CardTitle>Training plan (guidance)</CardTitle><div className="text-xs text-muted mt-1">Adapt to your baseline and recovery.</div></div></CardHeader>
          <CardContent className="text-sm space-y-3 text-text/90">
            <div className="rounded-xl border border-border bg-background/20 p-3"><div className="font-medium text-accent mb-1">Targets</div><p>1.6 km timing improvement, push-ups, pull-ups, sit-ups, stamina, flexibility, and recovery habits.</p></div>
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-3"><div className="font-medium">Base</div><p className="text-xs text-muted mt-1">Aerobic base, form, mobility</p></div>
              <div className="rounded-xl border border-border p-3"><div className="font-medium">Build</div><p className="text-xs text-muted mt-1">Intervals, strength, volume</p></div>
              <div className="rounded-xl border border-border p-3"><div className="font-medium">Peak</div><p className="text-xs text-muted mt-1">Sharpen, test, taper</p></div>
            </div>
            <p className="text-muted">Aim for 5–6 training days/week with rest/deload weeks. Log sessions consistently (saved locally).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-accent"/> Log workout</CardTitle><div className="text-xs text-muted mt-1">Track performance and fatigue over time.</div></div></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid grid-cols-2 gap-3 text-text">
              <div><label className="text-xs text-muted">Date</label><input value={form.log_date} onChange={e=>set("log_date",e.target.value)} type="date" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Workout type</label><input value={form.workout_type} onChange={e=>set("workout_type",e.target.value)} className={inputCls} placeholder="Run, strength, PT..." /></div>
              <div><label className="text-xs text-muted">Run (km)</label><input value={form.run_distance_km} onChange={e=>set("run_distance_km",e.target.value)} type="number" step="0.1" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Run time (sec)</label><input value={form.run_time_sec} onChange={e=>set("run_time_sec",e.target.value)} type="number" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Push-ups</label><input value={form.pushups} onChange={e=>set("pushups",e.target.value)} type="number" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Pull-ups</label><input value={form.pullups} onChange={e=>set("pullups",e.target.value)} type="number" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Sit-ups</label><input value={form.situps} onChange={e=>set("situps",e.target.value)} type="number" className={inputCls} /></div>
              <div><label className="text-xs text-muted">Fatigue (1-10)</label><input value={form.fatigue} onChange={e=>set("fatigue",e.target.value)} type="number" min="1" max="10" className={inputCls} /></div>
              <div className="col-span-2"><label className="text-xs text-muted">Notes</label><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border bg-surface-raised/80 px-3 py-2 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15" placeholder="How it felt, intervals, recovery..." /></div>
              <div className="col-span-2"><button className="h-11 px-5 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover inline-flex items-center gap-2"><Save size={16}/> Save workout</button></div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent logs</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {logs.map((l:any)=>(<div key={l.id} className="border border-border/80 rounded-xl p-3.5 text-text text-sm bg-background/20"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{l.log_date}</span><span className="text-xs text-muted">{l.workout_type || "Workout"}</span></div><div className="text-muted mt-1">{l.run_distance_km ? `${l.run_distance_km}km ${l.run_time_sec?`(${l.run_time_sec}s)`:''}` : ""}{(l.pushups||l.pullups||l.situps)?` • PU ${l.pushups||0} Pull ${l.pullups||0} SU ${l.situps||0}`:""}{l.fatigue ? ` • Fatigue ${l.fatigue}/10` : ""}</div>{l.notes && <div className="mt-1 text-text/90">{l.notes}</div>}</div>))}
          {!logs.length && <p className="text-muted text-sm rounded-xl border border-dashed border-border p-4">No workouts logged yet. Record your first session to start tracking progress.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
