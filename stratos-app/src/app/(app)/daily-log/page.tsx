"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";

export default function DailyLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ log_date: "", hours_studied: "", planned_tasks: "", completed_tasks: "", mood: "", energy: "", notes: "" });
  const refresh = () => setLogs((loadStore().daily_logs||[]).slice().sort((a,b)=>b.log_date.localeCompare(a.log_date)).slice(0,14));
  useEffect(() => { setForm(f => ({ ...f, log_date: new Date().toISOString().slice(0,10) })); refresh(); }, []);
  const set = (k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const s = loadStore();
    const idx = s.daily_logs.findIndex(l=>l.log_date===form.log_date);
    const row = { id: idx>=0 ? s.daily_logs[idx].id : uid("log"), log_date: form.log_date, hours_studied: Number(form.hours_studied||0), planned_tasks: Number(form.planned_tasks||0), completed_tasks: Number(form.completed_tasks||0), mood: form.mood, energy: form.energy, notes: form.notes };
    if (idx>=0) s.daily_logs[idx]=row; else s.daily_logs.push(row);
    saveStore(s); refresh();
  }
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Daily Log</h1>
      <Card>
        <CardHeader><CardTitle>Log day</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-3 text-text">
            <div><label className="text-xs text-muted">Date</label><input value={form.log_date} onChange={e=>set("log_date",e.target.value)} type="date" className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div><label className="text-xs text-muted">Hours studied</label><input value={form.hours_studied} onChange={e=>set("hours_studied",e.target.value)} type="number" step="0.25" className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div><label className="text-xs text-muted">Planned tasks</label><input value={form.planned_tasks} onChange={e=>set("planned_tasks",e.target.value)} type="number" className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div><label className="text-xs text-muted">Completed tasks</label><input value={form.completed_tasks} onChange={e=>set("completed_tasks",e.target.value)} type="number" className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div><label className="text-xs text-muted">Mood</label><input value={form.mood} onChange={e=>set("mood",e.target.value)} className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div><label className="text-xs text-muted">Energy</label><input value={form.energy} onChange={e=>set("energy",e.target.value)} className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-muted">Notes</label><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm" /></div>
            <div className="sm:col-span-2"><button className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium">Save log (local)</button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent logs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {logs.map(l => (<div key={l.id} className="border border-border rounded-lg p-3 text-text"><div className="flex justify-between"><span className="font-medium">{l.log_date}</span><span className="font-mono text-sm text-accent">{l.hours_studied}h</span></div><div className="text-sm text-muted">Tasks {l.completed_tasks}/{l.planned_tasks} • Mood: {l.mood||"—"} • Energy: {l.energy||"—"}</div>{l.notes && <p className="text-sm mt-1">{l.notes}</p>}</div>))}
          {!logs.length && <p className="text-muted">No logs yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
