"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";
import { CheckSquare, ListTodo, Plus, Target } from "lucide-react";

export default function TrackerPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [name, setName] = useState(""); const [category, setCategory] = useState("Custom");
  const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [mins, setMins] = useState("");
  const refresh = () => { const s = loadStore(); setTopics(s.topics||[]); setTasks((s.tasks||[]).slice().sort((a,b)=>(a.due_date||"").localeCompare(b.due_date||""))); };
  useEffect(() => { setDue(new Date().toISOString().slice(0,10)); refresh(); }, []);
  const statuses = ["not_started","learning","revising","strong"];

  function addTopic(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    const s = loadStore(); s.topics.push({ id: uid("topic"), name: name.trim(), category: category.trim()||"Custom", status: "not_started", confidence: 1 }); saveStore(s);
    setName(""); refresh();
  }
  function updateTopic(id: string, status: string, confidence: number) {
    const s = loadStore(); const t = s.topics.find((x:any)=>x.id===id); if (t){ t.status=status; t.confidence=confidence; saveStore(s); refresh(); }
  }
  function addTask(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim()) return;
    const s = loadStore(); s.tasks.push({ id: uid("task"), title: title.trim(), due_date: due, planned_minutes: mins?Number(mins):null, completed: false, source: "manual" }); saveStore(s);
    setTitle(""); setMins(""); refresh();
  }
  function toggleTask(id: string) {
    const s = loadStore(); const t = s.tasks.find((x:any)=>x.id===id); if (t){ t.completed=!t.completed; t.completed_at=t.completed?new Date().toISOString():null; saveStore(s); refresh(); }
  }

  const inputCls = "h-11 rounded-xl border border-border bg-surface-raised/80 px-3.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><CheckSquare className="text-accent" size={24}/> Preparation Tracker</h1>
        <p className="page-subtitle mt-1">Plan daily tasks and track topic mastery with confidence levels.</p>
      </div>

      <Card>
        <CardHeader><div><CardTitle className="flex items-center gap-2"><ListTodo size={18} className="text-accent"/> Daily/weekly tasks</CardTitle><div className="text-xs text-muted mt-1">Add focused tasks and mark them done as you execute.</div></div></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addTask} className="grid sm:grid-cols-[1fr_160px_130px_auto] gap-2.5 text-text">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task (e.g. 60 WAT words, 30 min OIR)" className={inputCls} required />
            <input value={due} onChange={e=>setDue(e.target.value)} type="date" className={inputCls} />
            <input value={mins} onChange={e=>setMins(e.target.value)} type="number" placeholder="Minutes" className={inputCls} />
            <button className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover inline-flex items-center justify-center gap-2"><Plus size={16}/> Add</button>
          </form>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-3 border border-border/80 rounded-xl p-3.5 text-text bg-background/20">
                <div className="min-w-0">
                  <div className={`font-medium ${t.completed?"line-through text-muted":""}`}>{t.title}</div>
                  <div className="text-xs text-muted mt-0.5">Due {t.due_date || "—"} {t.planned_minutes ? `• ${t.planned_minutes} min` : ""}</div>
                </div>
                <button onClick={()=>toggleTask(t.id)} className={`h-9 px-3.5 rounded-lg border text-sm font-medium transition-colors ${t.completed ? "border-border text-muted hover:bg-surface-raised" : "border-accent/40 text-accent bg-accent/5 hover:bg-accent/10"}`}>{t.completed?"Undo":"Done"}</button>
              </div>
            ))}
            {!tasks.length && <p className="text-muted text-sm rounded-xl border border-dashed border-border p-4">No tasks yet. Add tasks to plan your day and build consistency.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div><CardTitle className="flex items-center gap-2"><Target size={18} className="text-accent"/> Topics & mastery</CardTitle><div className="text-xs text-muted mt-1">Track status and confidence across SSB/academic areas.</div></div></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addTopic} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2.5 text-text">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Topic name" className={inputCls} required />
            <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className={inputCls} />
            <button className="h-11 px-4 rounded-xl bg-surface-raised border border-border font-medium hover:bg-surface-raised/70 inline-flex items-center justify-center gap-2"><Plus size={16}/> Add topic</button>
          </form>
          <div className="space-y-2">
            {topics.map(t => (
              <div key={t.id} className="grid md:grid-cols-[1fr_180px_160px] gap-2.5 items-center border border-border/80 rounded-xl p-3.5 text-text bg-background/20">
                <div className="min-w-0"><div className="font-medium truncate">{t.name}</div><div className="text-xs text-muted">{t.category}</div></div>
                <select value={t.status} onChange={e=>updateTopic(t.id,e.target.value,t.confidence)} className="h-10 rounded-lg border border-border bg-surface-raised px-2.5 text-sm outline-none focus:border-accent/60">
                  {statuses.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
                <select value={String(t.confidence)} onChange={e=>updateTopic(t.id,t.status,Number(e.target.value))} className="h-10 rounded-lg border border-border bg-surface-raised px-2.5 text-sm outline-none focus:border-accent/60">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Confidence {n}/5</option>)}
                </select>
              </div>
            ))}
            {!topics.length && <p className="text-muted text-sm rounded-xl border border-dashed border-border p-4">No topics yet. Complete onboarding or add topics manually.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
