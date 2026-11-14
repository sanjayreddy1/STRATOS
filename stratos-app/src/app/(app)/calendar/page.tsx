"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight, BookOpen, Dumbbell, CheckSquare, NotebookPen } from "lucide-react";
import { loadStore } from "@/lib/local/store";

function pad(n: number) { return String(n).padStart(2, "0"); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

export default function CalendarPage() {
  const [store, setStore] = useState<any>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [selected, setSelected] = useState("");
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    const now = new Date();
    const s = loadStore();
    setStore(s);
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(ymd(now));
    setTodayKey(ymd(now));
  }, []);

  const days = useMemo(() => {
    if (!month) return [] as (Date | null)[];
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = start.getDay();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= end.getDate(); d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [month]);

  const byDate = useMemo(() => {
    const s = store || {};
    const map: Record<string, { workouts: any[]; lessons: boolean; logs: any[]; tasksDone: number; tasksTotal: number }> = {};
    const ensure = (k: string) => (map[k] ||= { workouts: [], lessons: false, logs: [], tasksDone: 0, tasksTotal: 0 });
    (s.workout_logs || []).forEach((w: any) => { if (w.log_date) ensure(w.log_date).workouts.push(w); });
    (s.daily_logs || []).forEach((l: any) => { if (l.log_date) ensure(l.log_date).logs.push(l); });
    (s.tasks || []).forEach((t: any) => { if (t.due_date) { const e = ensure(t.due_date); e.tasksTotal++; if (t.completed || t.status === "done") e.tasksDone++; } });
    Object.entries(s.lesson_progress || {}).forEach(([k, v]) => { if (v) ensure(k).lessons = true; });
    return map;
  }, [store]);

  const sel = selected ? byDate[selected] : null;
  const monthLabel = month ? month.toLocaleString(undefined, { month: "long", year: "numeric" }) : "Loading...";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="page-title flex items-center gap-2"><CalendarDays className="text-accent" size={24} /> Training Calendar</h1>
          <p className="page-subtitle mt-1">Review daily lessons, workouts, study logs, and scheduled tasks at a glance.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        <Card>
          <CardHeader className="items-center">
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border hover:bg-surface-raised disabled:opacity-40" disabled={!month} onClick={() => month && setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
            <div className="text-center">
              <CardTitle className="text-lg">{monthLabel}</CardTitle>
              <div className="text-xs text-muted">Tap a date to view details</div>
            </div>
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border hover:bg-surface-raised disabled:opacity-40" disabled={!month} onClick={() => month && setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5 text-xs text-muted mb-2">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="text-center py-1 font-medium">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d, i) => {
                if (!d) return <div key={i} className="h-20 sm:h-24 rounded-xl" />;
                const k = ymd(d);
                const info = byDate[k];
                const active = k === selected;
                const isToday = k === todayKey;
                return (
                  <button key={k} onClick={() => setSelected(k)} className={`h-20 sm:h-24 rounded-xl border p-1.5 text-left transition-all ${active ? "border-accent/60 bg-primary/15 shadow-sm" : "border-border/70 hover:bg-surface-raised/70 hover:border-border-hover"} ${isToday ? "ring-1 ring-accent/30" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isToday ? "text-accent" : "text-text"}`}>{d.getDate()}</span>
                      {isToday && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {info?.lessons && <div className="text-[10px] text-success flex items-center gap-1"><BookOpen size={10}/> Lesson</div>}
                      {info?.workouts?.length ? <div className="text-[10px] text-accent flex items-center gap-1"><Dumbbell size={10}/> {info.workouts.length}</div> : null}
                      {info?.logs?.length ? <div className="text-[10px] text-muted flex items-center gap-1"><NotebookPen size={10}/> Study</div> : null}
                      {info?.tasksTotal ? <div className="text-[10px] text-muted flex items-center gap-1"><CheckSquare size={10}/> {info.tasksDone}/{info.tasksTotal}</div> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{selected || "Select a date"}</CardTitle>
              <div className="text-xs text-muted mt-1">Daily activity summary</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-text">
            {!sel && <p className="text-muted text-sm">No activity recorded for this date.</p>}

            <div className="rounded-xl border border-border bg-background/30 p-3">
              <div className="font-medium text-accent mb-1 flex items-center gap-2"><BookOpen size={15}/> Daily lesson</div>
              {sel?.lessons ? <p className="text-success text-sm">Completed (marked as studied)</p> : <p className="text-muted text-sm">Not marked completed on this date.</p>}
            </div>

            <div className="rounded-xl border border-border bg-background/30 p-3">
              <div className="font-medium text-accent mb-1 flex items-center gap-2"><Dumbbell size={15}/> Exercise / workouts</div>
              {sel?.workouts?.length ? sel.workouts.map((w:any, i:number)=>(<div key={i} className="text-sm mb-1.5 text-text/90">{w.workout_type || "Workout"} {w.run_distance_km ? `• ${w.run_distance_km}km` : ""} {(w.pushups||w.pullups||w.situps) ? `• PU ${w.pushups||0} Pull ${w.pullups||0} SU ${w.situps||0}` : ""}</div>)) : <p className="text-muted text-sm">No workout logged.</p>}
            </div>

            <div className="rounded-xl border border-border bg-background/30 p-3">
              <div className="font-medium text-accent mb-1 flex items-center gap-2"><NotebookPen size={15}/> Study log</div>
              {sel?.logs?.length ? sel.logs.map((l:any,i:number)=>(<div key={i} className="text-sm space-y-1"><div className="text-text/90">{l.hours_studied || 0}h studied • Tasks {l.completed_tasks||0}/{l.planned_tasks||0}</div>{l.notes && <div className="text-muted">{l.notes}</div>}</div>)) : <p className="text-muted text-sm">No daily log.</p>}
            </div>

            <div className="rounded-xl border border-border bg-background/30 p-3">
              <div className="font-medium text-accent mb-1 flex items-center gap-2"><CheckSquare size={15}/> Tasks</div>
              {sel?.tasksTotal ? <p className="text-sm text-text/90">{sel.tasksDone}/{sel.tasksTotal} completed</p> : <p className="text-muted text-sm">No tasks scheduled.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
