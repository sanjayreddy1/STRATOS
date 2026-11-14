"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore } from "@/lib/local/store";
import { SSB_DAILY_LESSONS } from "@/lib/data/daily-lessons";
import { BookOpen, Flame, Target, Clock, Dumbbell, Brain, TrendingUp, CheckCircle2, Calendar } from "lucide-react";

function calcStreak(dateKeys: string[]) {
  if (!dateKeys.length) return { current: 0, best: 0 };
  const set = new Set(dateKeys);
  const sorted = [...set].sort();
  // best streak
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const cur = new Date(sorted[i] + "T00:00:00");
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) run++; else run = 1;
    if (run > best) best = run;
  }
  // current streak ending today or yesterday
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const y = new Date(today.getTime() - 86400000);
  const yKey = y.toISOString().slice(0, 10);
  let anchor = set.has(todayKey) ? todayKey : set.has(yKey) ? yKey : null;
  let current = 0;
  if (anchor) {
    let d = new Date(anchor + "T00:00:00");
    while (set.has(d.toISOString().slice(0, 10))) {
      current++;
      d = new Date(d.getTime() - 86400000);
    }
  }
  return { current, best: Math.max(best, current) };
}

function Bar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-xs text-muted"><span>{label}</span><span>{value}/{max}</span></div>}
      <div className="h-2.5 rounded-full bg-border/60 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { setS(loadStore()); }, []);

  const data = useMemo(() => {
    if (!s) return null;
    const logs = (s.daily_logs || []).slice().sort((a: any, b: any) => b.log_date.localeCompare(a.log_date));
    const logs30 = logs.filter((l: any) => {
      const d = new Date(l.log_date + "T00:00:00").getTime();
      return Date.now() - d <= 30 * 86400000;
    });
    const logs7 = logs.filter((l: any) => {
      const d = new Date(l.log_date + "T00:00:00").getTime();
      return Date.now() - d <= 7 * 86400000;
    });
    const workouts = (s.workout_logs || []).slice().sort((a: any, b: any) => (b.log_date || "").localeCompare(a.log_date || ""));
    const workouts30 = workouts.filter((w: any) => w.log_date && Date.now() - new Date(w.log_date + "T00:00:00").getTime() <= 30 * 86400000);
    const olq = s.olq_scores || [];
    const progress = s.lesson_progress || {};
    const completedDates = Object.keys(progress).filter(k => progress[k]).sort();
    const completedCount = completedDates.length;
    const streak = calcStreak(completedDates);
    const detailedCount = Object.keys(s.lesson_details || {}).length;
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayDone = !!progress[todayKey];
    const totalHours30 = logs30.reduce((sum: number, l: any) => sum + Number(l.hours_studied || 0), 0);
    const totalHours7 = logs7.reduce((sum: number, l: any) => sum + Number(l.hours_studied || 0), 0);
    const doneTasks = logs30.reduce((sum: number, l: any) => sum + Number(l.completed_tasks || 0), 0);
    const plannedTasks = logs30.reduce((sum: number, l: any) => sum + Number(l.planned_tasks || 0), 0) || 0;
    const completion = plannedTasks ? Math.round((doneTasks / plannedTasks) * 100) : 0;
    const avgHours7 = logs7.length ? (totalHours7 / 7) : 0;
    const studyDays30 = logs30.length;
    const topicsTracked = (s.topics || []).length;
    const tasks = s.tasks || [];
    const tasksDone = tasks.filter((t: any) => t.status === "done" || t.completed).length;

    // recent completed lessons mapped to topics
    const lessonByDay = new Map(SSB_DAILY_LESSONS.map(l => [l.day, l]));
    const recentCompleted = completedDates.slice(-7).reverse().map(dk => {
      // infer lesson by date same as getDailyLesson logic
      const date = new Date(dk + "T12:00:00");
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / 86400000);
      const idx = (dayOfYear - 1 + SSB_DAILY_LESSONS.length) % SSB_DAILY_LESSONS.length;
      const lesson = SSB_DAILY_LESSONS[idx];
      return { date: dk, topic: lesson?.topic || "SSB Lesson", day: lesson?.day, hasDetail: !!s.lesson_details?.[dk] };
    });

    // weekly study bars (last 7 days including today)
    const weekBars: { label: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const l = logs.find((x: any) => x.log_date === key);
      weekBars.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), hours: Number(l?.hours_studied || 0) });
    }
    const maxWeekHours = Math.max(1, ...weekBars.map(b => b.hours), Number(s.profile?.daily_hours || 2));

    return { logs, logs30, workouts, workouts30, olq, completedCount, completedDates, streak, detailedCount, todayDone, totalHours30, totalHours7, doneTasks, plannedTasks, completion, avgHours7, studyDays30, topicsTracked, tasks, tasksDone, recentCompleted, weekBars, maxWeekHours };
  }, [s]);

  if (!s || !data) return <div className="text-muted">Loading analytics...</div>;

  const cycleSize = SSB_DAILY_LESSONS.length;
  const cycleProgress = data.completedCount % cycleSize || (data.completedCount > 0 ? cycleSize : 0);
  const cyclePct = Math.round((cycleProgress / cycleSize) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold">Learning Analytics</h1>
          <p className="text-sm text-muted mt-1">Track your SSB preparation, daily learning, study consistency, and fitness — all stored locally on this device.</p>
        </div>
        <div className="text-xs text-muted border border-border rounded-lg px-3 py-2 bg-surface/60">
          Practice guidance only • Not a selection prediction
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="mb-1"><CardTitle className="text-sm flex items-center gap-2"><BookOpen size={16} className="text-accent"/>Lessons studied</CardTitle></CardHeader>
          <CardContent>
            <div className="font-mono text-3xl text-accent">{data.completedCount}</div>
            <div className="text-xs text-muted mt-1">{data.todayDone ? "Today's lesson completed" : "Today's lesson pending"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="mb-1"><CardTitle className="text-sm flex items-center gap-2"><Flame size={16} className="text-accent"/>Learning streak</CardTitle></CardHeader>
          <CardContent>
            <div className="font-mono text-3xl text-accent">{data.streak.current}<span className="text-base text-muted ml-1">days</span></div>
            <div className="text-xs text-muted mt-1">Best: {data.streak.best} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="mb-1"><CardTitle className="text-sm flex items-center gap-2"><Clock size={16} className="text-accent"/>Study hours (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="font-mono text-3xl text-accent">{data.totalHours30.toFixed(1)}</div>
            <div className="text-xs text-muted mt-1">Avg {data.avgHours7.toFixed(1)} h/day (7d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="mb-1"><CardTitle className="text-sm flex items-center gap-2"><Target size={16} className="text-accent"/>Task completion</CardTitle></CardHeader>
          <CardContent>
            <div className="font-mono text-3xl text-accent">{data.completion}%</div>
            <div className="text-xs text-muted mt-1">{data.doneTasks}/{data.plannedTasks || 0} tasks (30d logs)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Learning progress */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-accent"/>Learning progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="text-xs text-muted">SSB lesson cycle</div>
                <div className="text-lg font-semibold text-text">{cycleProgress}/{cycleSize} topics</div>
                <div className="mt-2"><Bar value={cycleProgress} max={cycleSize} /></div>
                <div className="text-xs text-muted mt-1">{cyclePct}% of current {cycleSize}-day curriculum cycle</div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="text-xs text-muted">Detailed lessons fetched</div>
                <div className="text-lg font-semibold text-text">{data.detailedCount}</div>
                <div className="text-xs text-muted mt-1">Web-based (Tavily + AI) deep dives saved locally</div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="text-xs text-muted">Study consistency</div>
                <div className="text-lg font-semibold text-text">{data.studyDays30} / 30 days</div>
                <div className="text-xs text-muted mt-1">Days with study logs in last 30 days</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar size={15} className="text-accent"/>Study hours (last 7 days)</div>
              <div className="grid grid-cols-7 gap-2 items-end h-28">
                {data.weekBars.map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div className="text-[10px] text-muted font-mono">{b.hours ? b.hours.toFixed(1) : ""}</div>
                    <div className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-primary to-accent/80" style={{ height: `${Math.max(6, Math.round((b.hours / data.maxWeekHours) * 100))}%`, opacity: b.hours ? 1 : 0.25 }} />
                    <div className="text-[10px] text-muted">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Recently completed lessons</div>
              {data.recentCompleted.length ? (
                <div className="space-y-2">
                  {data.recentCompleted.map((l, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={16} className="text-success shrink-0" />
                        <span className="text-muted shrink-0">{l.date}</span>
                        <span className="truncate text-text">Day {l.day}: {l.topic}</span>
                      </div>
                      {l.hasDetail && <span className="text-[10px] px-2 py-0.5 rounded-full border border-accent/40 text-accent shrink-0">Detailed</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No lessons marked as studied yet. Complete today's lesson on the Dashboard to start tracking learning progress.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Readiness snapshot */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain size={18} className="text-accent"/>Preparation snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Bar value={data.completedCount} max={Math.max(cycleSize, data.completedCount)} label="Lessons completed" />
            <Bar value={data.studyDays30} max={30} label="Study days (30d)" />
            <Bar value={data.workouts30.length} max={30} label="Workout days (30d)" />
            <Bar value={data.tasksDone} max={Math.max(1, data.tasks.length)} label="Tasks done" />
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex justify-between"><span className="text-muted">Topics tracked</span><span className="font-mono text-text">{data.topicsTracked}</span></div>
              <div className="flex justify-between"><span className="text-muted">Workout logs</span><span className="font-mono text-text">{data.workouts.length}</span></div>
              <div className="flex justify-between"><span className="text-muted">OLQ records</span><span className="font-mono text-text">{data.olq.length}</span></div>
              <div className="flex justify-between"><span className="text-muted">Detailed lessons saved</span><span className="font-mono text-text">{data.detailedCount}</span></div>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-muted">
              <span className="text-accent font-medium">Tip:</span> Mark each day's lesson as studied and fetch detailed web learning on the Dashboard to build a strong, consistent preparation streak.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Recent study logs</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {data.logs.slice(0, 8).map((l: any) => (
              <div key={l.id || l.log_date} className="flex items-center justify-between border-b border-border/40 py-1.5">
                <span className="text-muted">{l.log_date}</span>
                <span className="font-mono text-text">{Number(l.hours_studied || 0).toFixed(1)}h • {l.completed_tasks || 0}/{l.planned_tasks || 0} tasks</span>
              </div>
            ))}
            {!data.logs.length && <p className="text-muted">No study logs yet. Add entries in Daily Log to see trends here.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell size={18} className="text-accent"/>Recent fitness activity</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {data.workouts.slice(0, 8).map((f: any, i: number) => (
              <div key={f.id || i} className="flex items-center justify-between border-b border-border/40 py-1.5">
                <span className="text-muted">{f.log_date}</span>
                <span className="font-mono text-text">{[f.run_distance_km ? `${f.run_distance_km}km` : null, f.pushups ? `PU ${f.pushups}` : null, f.workout_type || null].filter(Boolean).join(" • ") || "Logged"}</span>
              </div>
            ))}
            {!data.workouts.length && <p className="text-muted">No workout logs yet. Log fitness sessions to track stamina and consistency.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>OLQ & practice guidance</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted space-y-2">
          <p>OLQ records stored: <span className="font-mono text-text">{data.olq.length}</span>. AI-evaluated practice feedback (when available) helps identify strengths and improvement areas across Officer Like Qualities.</p>
          <p>Scores and insights are <b className="text-text">practice guidance only</b>, never selection predictions. Consistent daily learning, reflection, and honest self-review matter most.</p>
          {data.olq.length > 0 && (
            <div className="pt-2 space-y-1">
              {data.olq.slice(-5).reverse().map((o: any, i: number) => (
                <div key={o.id || i} className="flex justify-between border-b border-border/40 py-1">
                  <span>{o.date || o.created_at?.slice(0,10) || "Record"} • {o.test_type || "Practice"}</span>
                  <span className="text-text">{o.overall ? `Score ${o.overall}` : "Saved"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
