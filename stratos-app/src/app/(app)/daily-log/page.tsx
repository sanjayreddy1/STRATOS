"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";
import { NotebookPen, Save, History } from "lucide-react";

export default function DailyLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ log_date: "", hours_studied: "", planned_tasks: "", completed_tasks: "", mood: "", energy: "", notes: "" });
  const refresh = () => setLogs((loadStore().daily_logs||[]).slice().sort((a,b)=>b.log_date.localeCompare(a.log_date)).slice(0,14));
  useEffect(() => { setForm(f => ({ ...f, log_date: new Date().toISOString().slice(0,10) })); refresh(); }, []);
  const set = (k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const s = loadStore();
    const idx = s.daily_logs.findIndex((l:any)=>l.log_date===form.log_date);
    const row = { id: idx>=0 ? s.daily_logs[idx].id : uid("log"), log_date: form.log_date, hours_studied: Number(form.hours_studied||0), planned_tasks: Number(form.planned_tasks||0), completed_tasks: Number(form.completed_tasks||0), mood: form.mood, energy: form.energy, notes: form.notes };
    if (idx>=0) s.daily_logs[idx]=row; else s.daily_logs.push(row);
    saveStore(s); refresh();
  }
  const inputCls = "mt-1 h-11 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15";
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><NotebookPen className="text-accent" size={24}/> Daily Log</h1>
        <p className="page-subtitle mt-1">Record your study effort, task completion, and reflections to build consistency.</p>
      </div>
      <Card>
        <CardHeader><div><CardTitle>Log your day</CardTitle><div className="text-xs text-muted mt-1">Saved locally in this browser (one entry per date, updates if re-saved).</div></div></CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4 text-text">
            <div><label className="text-xs text-muted">Date</label><input value={form.log_date} onChange={e=>set("log_date",e.target.value)} type="date" className={inputCls} /></div>
            <div><label className="text-xs text-muted">Hours studied</label><input value={form.hours_studied} onChange={e=>set("hours_studied",e.target.value)} type="number" step="0.25" min="0" className={inputCls} placeholder="e.g. 2.5" /></div>
            <div><label className="text-xs text-muted">Planned tasks</label><input value={form.planned_tasks} onChange={e=>set("planned_tasks",e.target.value)} type="number" min="0" className={inputCls} /></div>
            <div><label className="text-xs text-muted">Completed tasks</label><input value={form.completed_tasks} onChange={e=>set("completed_tasks",e.target.value)} type="number" min="0" className={inputCls} /></div>
            <div><label className="text-xs text-muted">Mood</label><input value={form.mood} onChange={e=>set("mood",e.target.value)} className={inputCls} placeholder="Focused, motivated..." /></div>
            <div><label className="text-xs text-muted">Energy</label><input value={form.energy} onChange={e=>set("energy",e.target.value)} className={inputCls} placeholder="High / Medium / Low" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-muted">Notes & reflection</label><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-surface-raised/80 px-3.5 py-2.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15" placeholder="What went well? What to improve tomorrow?" /></div>
            <div className="sm:col-span-2"><button className="h-11 px-5 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover inline-flex items-center gap-2"><Save size={16}/> Save daily log</button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle className="flex items-center gap-2"><History size={18} className="text-accent"/> Recent logs</CardTitle><div className="text-xs text-muted mt-1">Last 14 entries</div></div></CardHeader>
        <CardContent className="space-y-2.5">
          {logs.map(l => (
            <div key={l.id} className="border border-border/80 rounded-xl p-4 text-text bg-background/20">
              <div className="flex items-center justify-between gap-3"><span className="font-medium">{l.log_date}</span><span className="font-mono text-sm text-accent bg-accent/10 px-2 py-0.5 rounded-md">{Number(l.hours_studied||0).toFixed(1)}h</span></div>
              <div className="text-sm text-muted mt-1">Tasks {l.completed_tasks||0}/{l.planned_tasks||0} • Mood: {l.mood||"—"} • Energy: {l.energy||"—"}</div>
              {l.notes && <p className="text-sm mt-2 text-text/90 leading-6">{l.notes}</p>}
            </div>
          ))}
          {!logs.length && <p className="text-muted text-sm rounded-xl border border-dashed border-border p-4">No logs yet. Start by saving today's study and reflection.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
