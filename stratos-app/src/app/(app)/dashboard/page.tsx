"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore } from "@/lib/local/store";
import { ARMY_QUOTES, ARMY_IMAGES } from "@/lib/data/motivation";
import { getDailyLesson } from "@/lib/data/daily-lessons";

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  return Math.ceil((t - Date.now()) / 86400000);
}

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null);
  const [today, setToday] = useState("");
  const [weekAgo, setWeekAgo] = useState("");
  const [nowTick, setNowTick] = useState<number | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    const now = new Date();
    const dk = now.toISOString().slice(0,10);
    setToday(dk);
    setWeekAgo(new Date(now.getTime()-6*86400000).toISOString().slice(0,10));
    setNowTick(now.getTime());
    const l = getDailyLesson(now);
    setLesson(l);
    setLessonDone(!!s.lesson_progress?.[dk]);
    setLessonDetail(s.lesson_details?.[dk] || null);
    setQuoteIndex(now.getDate() % ARMY_QUOTES.length);
    setImageIndex(Math.floor(now.getTime() / 5000) % ARMY_IMAGES.length);
  }, []);

  async function fetchDetailedLesson(force = false) {
    if (!lesson) return;
    const dk = lesson.dateKey;
    const s = loadStore();
    if (!force && s.lesson_details?.[dk]) { setLessonDetail(s.lesson_details[dk]); return; }
    setDetailLoading(true); setDetailError(null);
    try {
      const res = await fetch("/api/ai/lesson-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: lesson.topic, focus: lesson.focus, ssbLink: lesson.ssbLink }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to fetch detailed lesson");
      const storeNow = loadStore();
      storeNow.lesson_details = storeNow.lesson_details || {};
      storeNow.lesson_details[dk] = data.detail;
      saveStore(storeNow);
      setStore(storeNow);
      setLessonDetail(data.detail);
    } catch (e: any) {
      setDetailError(e?.message || "Could not fetch detailed learning material");
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleLessonDone() {
    if (!lesson) return;
    const s = loadStore();
    s.lesson_progress = s.lesson_progress || {};
    s.lesson_progress[lesson.dateKey] = !s.lesson_progress[lesson.dateKey];
    saveStore(s);
    setStore(s);
    setLessonDone(!!s.lesson_progress[lesson.dateKey]);
  }

  useEffect(() => {
    const t = setInterval(() => {
      setImageIndex(i => (i + 1) % ARMY_IMAGES.length);
      setQuoteIndex(i => (i + 1) % ARMY_QUOTES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const computed = useMemo(() => {
    const s = store || { tasks: [], daily_logs: [], topics: [], news_cache: [], reminders: [] };
    if (!today || !weekAgo) return { todaysTasks: [], doneToday: 0, completion: 0, hoursWeek: 0 };
    const tasks = s.tasks || [];
    const todaysTasks = tasks.filter((t: any) => t.due_date === today || !t.due_date);
    const doneToday = todaysTasks.filter((t: any) => t.completed).length;
    const completion = todaysTasks.length ? Math.round((doneToday/todaysTasks.length)*100) : 0;
    const hoursWeek = (s.daily_logs||[]).filter((l: any) => l.log_date >= weekAgo).reduce((sum: number,l: any)=>sum+Number(l.hours_studied||0),0);
    return { todaysTasks, doneToday, completion, hoursWeek };
  }, [store, today, weekAgo]);

  if (!lesson) return <div className="text-muted">Loading...</div>;
  const profile = store?.profile || null;
  const countdown = profile?.target_date && nowTick ? Math.ceil((new Date(profile.target_date).getTime() - nowTick) / 86400000) : null;
  const streak = 0;
  const topics = (store?.topics||[]).slice(0,20);
  const news = (store?.news_cache||[]).slice(0,6);
  const reminders = (store?.reminders||[]).slice(0,5);
  const quote = ARMY_QUOTES[quoteIndex % ARMY_QUOTES.length];
  const image = ARMY_IMAGES[imageIndex % ARMY_IMAGES.length];
  const taskOfDay = computed.todaysTasks.find((t: any) => !t.completed) || computed.todaysTasks[0] || { title: lesson.practice, suggested: true };

  return (
    <div className="space-y-4">
      <section className="relative min-h-[calc(100svh-8rem)] rounded-2xl overflow-hidden border border-border">
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          onError={() => setImageIndex(i => (i + 1) % ARMY_IMAGES.length)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        <div className="relative z-10 min-h-[calc(100svh-8rem)] flex flex-col justify-between p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-accent">Indian Army • SSB Preparation</p>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold mt-2 text-white">Jai Hind{profile?.name ? `, ${profile.name}` : ""}</h1>
              <p className="text-white/80 text-sm sm:text-base mt-3 max-w-xl">Service Before Self. {profile?.onboarding_completed ? "Your profile is saved locally in this browser." : "Save your profile in Settings/Onboarding — data stays in this browser."}</p>
            </div>
            <div className="w-full md:w-[320px] rounded-xl border border-white/20 bg-black/35 backdrop-blur-sm p-4 text-white">
              <div className="text-accent font-medium text-sm">Task of the Day</div>
              <div className="mt-2 text-sm sm:text-base">{taskOfDay.title}</div>
              {taskOfDay.suggested && <div className="text-xs text-white/70 mt-2">Suggested from today's lesson</div>}
              <div className="mt-4 text-accent font-medium text-sm">Lesson of the Day</div>
              <div className="mt-1 text-sm">{lesson.topic}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/calendar" className="text-xs px-3 py-1.5 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20">Calendar</Link>
                <Link href="/interviewer" className="text-xs px-3 py-1.5 rounded-lg border border-accent/50 bg-accent/20 hover:bg-accent/30">AI Interviewer</Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-4 items-end">
            <div className="rounded-xl border border-white/20 bg-black/35 backdrop-blur-sm p-4 sm:p-5">
              <div className="text-accent text-xs uppercase tracking-wide mb-2">Indian Army Quote</div>
              <blockquote className="text-white">
                <p className="text-lg sm:text-xl md:text-2xl italic leading-relaxed">"{quote.quote}"</p>
                <footer className="text-sm text-white/80 mt-3">— {quote.by}</footer>
              </blockquote>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ARMY_QUOTES.map((q, i) => (
                  <button key={i} onClick={() => setQuoteIndex(i)} className={`h-2 w-2 rounded-full ${i===quoteIndex?"bg-accent":"bg-white/40 hover:bg-white/70"}`} aria-label={`Show quote ${i+1}`} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/35 backdrop-blur-sm p-4 text-white">
              <div className="text-sm font-medium">{image.alt}</div>
              <div className="text-xs text-white/70 mt-1">{image.credit}</div>
              <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
                {ARMY_IMAGES.map((img, i) => (
                  <button key={img.src} onClick={() => setImageIndex(i)} className={`h-2.5 w-2.5 rounded-full shrink-0 ${i===imageIndex?"bg-accent":"bg-white/40 hover:bg-white/70"}`} aria-label={`Show image ${i+1}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Daily SSB Learning Material</CardTitle>
              <div className="text-xs text-muted mt-1">{lesson.dateKey} • Conducted daily • {lesson.ssbLink}</div>
            </div>
            <button onClick={toggleLessonDone} className={`h-9 px-3 rounded-lg text-sm font-medium border ${lessonDone ? "bg-primary text-[#0B0D0C] border-primary" : "border-border text-text hover:bg-surface-raised"}`}>
              {lessonDone ? "Completed today" : "Mark as studied"}
            </button>
          </CardHeader>
          <CardContent className="text-text space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-accent mb-1">Topic</div>
              <h3 className="font-heading text-lg font-semibold">{lesson.topic}</h3>
              <p className="text-sm text-muted mt-1">{lesson.focus}</p>
            </div>
            <div>
              <div className="text-sm font-medium text-accent mb-1">Learning objectives</div>
              <ul className="list-disc pl-5 text-sm space-y-1">{lesson.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}</ul>
            </div>
            <div>
              <div className="text-sm font-medium text-accent mb-1">Learning material</div>
              <div className="space-y-2 text-sm text-muted leading-6">
                {lesson.learn.map((p: string, i: number) => <p key={i} className="text-text/90">{p}</p>)}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border border-border rounded-lg p-3">
                <div className="text-sm font-medium text-accent mb-1">Key points</div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-text/90">{lesson.keyPoints.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="text-sm font-medium text-accent mb-1">Example</div>
                <p className="text-sm text-text/90">{lesson.example}</p>
              </div>
            </div>
            {lesson.doDont && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border border-border rounded-lg p-3">
                  <div className="text-sm font-medium text-success mb-1">Do</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">{lesson.doDont.do.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="text-sm font-medium text-danger mb-1">Don't</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">{lesson.doDont.dont.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
                </div>
              </div>
            )}
            <div className="border border-accent/30 bg-primary/10 rounded-lg p-3 space-y-2">
              <div><span className="text-sm font-medium text-accent">Today's practice:</span> <span className="text-sm">{lesson.practice}</span></div>
              <div><span className="text-sm font-medium text-accent">Reflection:</span> <span className="text-sm">{lesson.reflection}</span></div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-accent">Detailed web-based learning (Tavily)</div>
                  <div className="text-xs text-muted">Fetch comprehensive, in-depth material from web sources for today's topic.</div>
                </div>
                <button onClick={() => fetchDetailedLesson(!!lessonDetail)} disabled={detailLoading} className="h-9 px-3 rounded-lg bg-primary text-[#0B0D0C] text-sm font-medium disabled:opacity-50">
                  {detailLoading ? "Fetching..." : lessonDetail ? "Refresh detailed learning" : "Fetch detailed learning"}
                </button>
              </div>
              {detailError && <p className="text-xs text-danger">{detailError}</p>}
              {lessonDetail && (
                <div className="space-y-3 text-sm">
                  {lessonDetail.overview && <p className="text-text/90 leading-6">{lessonDetail.overview}</p>}
                  {Array.isArray(lessonDetail.detailed_material) && (
                    <div>
                      <div className="font-medium text-accent mb-1">Detailed material</div>
                      <div className="space-y-2">{lessonDetail.detailed_material.map((p: string, i: number) => <p key={i} className="text-text/90 leading-6">{p}</p>)}</div>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.key_concepts) && (
                    <div>
                      <div className="font-medium text-accent mb-1">Key concepts</div>
                      <ul className="list-disc pl-5 space-y-1">{lessonDetail.key_concepts.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.ssb_application) && (
                    <div>
                      <div className="font-medium text-accent mb-1">SSB application</div>
                      <ul className="list-disc pl-5 space-y-1">{lessonDetail.ssb_application.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.examples) && (
                    <div>
                      <div className="font-medium text-accent mb-1">Examples</div>
                      <ul className="list-disc pl-5 space-y-1">{lessonDetail.examples.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.practice_questions) && (
                    <div>
                      <div className="font-medium text-accent mb-1">Practice questions</div>
                      <ol className="list-decimal pl-5 space-y-1">{lessonDetail.practice_questions.map((k: string, i: number) => <li key={i}>{k}</li>)}</ol>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.daily_plan) && (
                    <div>
                      <div className="font-medium text-accent mb-1">Today's detailed plan</div>
                      <ol className="list-decimal pl-5 space-y-1">{lessonDetail.daily_plan.map((k: string, i: number) => <li key={i}>{k}</li>)}</ol>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.sources) && lessonDetail.sources.length > 0 && (
                    <div>
                      <div className="font-medium text-accent mb-1">Web sources (Tavily)</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {lessonDetail.sources.map((s: any, i: number) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer" className="text-accent underline">{s.title || s.url}</a></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Analytics & Progress</CardTitle><Link href="/analytics" className="text-xs text-accent">Open analytics</Link></CardHeader>
          <CardContent className="space-y-3 text-text">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border border-border rounded-lg p-2"><div className="text-xs text-muted">Countdown</div><div className="font-mono text-lg text-accent">{countdown ?? "—"}</div></div>
              <div className="border border-border rounded-lg p-2"><div className="text-xs text-muted">Today completion</div><div className="font-mono text-lg text-accent">{computed.completion}%</div></div>
              <div className="border border-border rounded-lg p-2"><div className="text-xs text-muted">Tasks today</div><div className="font-mono text-lg">{computed.doneToday}/{computed.todaysTasks.length}</div></div>
              <div className="border border-border rounded-lg p-2"><div className="text-xs text-muted">Hours this week</div><div className="font-mono text-lg">{computed.hoursWeek.toFixed(1)}h</div></div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs text-muted mb-1">Lesson status</div>
              <div className={`text-sm font-medium ${lessonDone ? "text-success" : "text-accent"}`}>{lessonDone ? "Today's lesson marked as studied" : "Today's lesson pending — study and mark complete"}</div>
            </div>
            <div className="text-sm"><div className="text-accent font-medium mb-1">Task of the Day</div><div className="border border-border rounded-lg p-2">{taskOfDay.title}</div></div>
            <div className="text-xs text-muted">Lesson rotates daily from a structured SSB curriculum (psychology, GTO, interview, OIR, fitness, current affairs).</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardHeader><CardTitle>Countdown</CardTitle></CardHeader><CardContent className="text-text"><div className="font-mono text-2xl text-accent">{countdown ?? "—"}</div><div className="text-xs">days to target</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Streak</CardTitle></CardHeader><CardContent className="text-text"><div className="font-mono text-2xl text-accent">{streak} 🔥</div><div className="text-xs">consistency builds officers</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Today</CardTitle></CardHeader><CardContent className="text-text"><div className="font-mono text-2xl">{computed.completion}%</div><div className="text-xs">{computed.doneToday}/{computed.todaysTasks.length} tasks completed</div></CardContent></Card>
        <Card><CardHeader><CardTitle>This week</CardTitle></CardHeader><CardContent className="text-text"><div className="font-mono text-2xl">{computed.hoursWeek.toFixed(1)}h</div><div className="text-xs">hours studied</div></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Today's tasks</CardTitle><Link href="/tracker" className="text-xs text-accent">Open tracker</Link></CardHeader>
          <CardContent>
            {computed?.todaysTasks.length ? <ul className="space-y-2 text-text">{computed.todaysTasks.map((t:any)=>(<li key={t.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2"><span className={t.completed?"line-through text-muted":""}>{t.title}</span><span className="text-xs text-muted">{t.completed?"Done":"Pending"}</span></li>))}</ul> : <p>No tasks due today. <Link href="/tracker" className="text-accent">Add tasks</Link>.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Topic progress</CardTitle><Link href="/tracker" className="text-xs text-accent">View all</Link></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-text">{topics.slice(0,6).map((t:any)=>(<li key={t.id} className="flex items-center justify-between"><span>{t.name}</span><span className="text-xs text-muted">{t.status} • {t.confidence}/5</span></li>))}</ul>
            {!topics.length && <p>No topics yet. Complete onboarding.</p>}
          </CardContent>
        </Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>News & current affairs</CardTitle><Link href="/knowledge" className="text-xs text-accent">More</Link></CardHeader>
          <CardContent className="space-y-2">
            {news.length ? news.map((n:any)=>(<div key={n.id||n.url} className="border border-border rounded-lg p-3 text-text"><a href={n.url} target="_blank" rel="noreferrer" className="font-medium hover:text-accent">{n.title}</a>{n.summary && <p className="text-sm mt-1"><span className="text-accent">AI summary:</span> {n.summary}</p>}</div>)) : <p className="text-muted text-sm">No cached news in local storage. Use Knowledge page to fetch via API (requires server keys) and save items locally.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming reminders</CardTitle><Link href="/settings" className="text-xs text-accent">Manage</Link></CardHeader>
          <CardContent>{reminders.length ? reminders.map((r:any)=>(<div key={r.id} className="border border-border rounded-lg p-2 text-text"><div className="font-medium">{r.title}</div></div>)) : <p className="text-muted text-sm">No reminders stored locally. Browser-only mode cannot run server cron emails.</p>}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>OLQ & analytics</CardTitle><Link href="/analytics" className="text-xs text-accent">Open</Link></CardHeader>
        <CardContent><p className="text-sm text-muted">Practice guidance only, never selection predictions. Local mode stores practice/OLQ data in this browser.</p></CardContent>
      </Card>
    </div>
  );
}
