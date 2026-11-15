"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore } from "@/lib/local/store";
import { ARMY_QUOTES, ARMY_IMAGES } from "@/lib/data/motivation";
import { getCurrentLesson } from "@/lib/data/daily-lessons";
import { CheckCircle2, CalendarDays, Mic, BookOpen, Target, Clock, TrendingUp, ExternalLink, Sparkles, Award } from "lucide-react";

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
    const l = getCurrentLesson(s);
    const lessonKey = String(l.day);
    setLesson(l);
    setLessonDone(!!s.lesson_progress?.[lessonKey]);
    setLessonDetail(s.lesson_details?.[lessonKey] || s.lesson_details?.[dk] || null);
    setQuoteIndex(now.getDate() % ARMY_QUOTES.length);
    setImageIndex(Math.floor(now.getTime() / 5000) % ARMY_IMAGES.length);
  }, []);

  async function fetchDetailedLesson(force = false) {
    if (!lesson) return;
    const lessonKey = String(lesson.day);
    const s = loadStore();
    if (!force && s.lesson_details?.[lessonKey]) { setLessonDetail(s.lesson_details[lessonKey]); return; }
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
      storeNow.lesson_details[lessonKey] = data.detail;
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
    const lessonKey = String(lesson.day);
    const s = loadStore();
    s.lesson_progress = s.lesson_progress || {};
    s.lesson_progress[lessonKey] = !s.lesson_progress[lessonKey];
    saveStore(s);
    const nextLesson = getCurrentLesson(s);
    setStore(s);
    setLesson(nextLesson);
    const nk = String(nextLesson.day);
    setLessonDone(!!s.lesson_progress?.[nk]);
    setLessonDetail(s.lesson_details?.[nk] || null);
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
    const doneToday = todaysTasks.filter((t: any) => t.completed || t.status === "done").length;
    const completion = todaysTasks.length ? Math.round((doneToday/todaysTasks.length)*100) : 0;
    const hoursWeek = (s.daily_logs||[]).filter((l: any) => l.log_date >= weekAgo).reduce((sum: number,l: any)=>sum+Number(l.hours_studied||0),0);
    return { todaysTasks, doneToday, completion, hoursWeek };
  }, [store, today, weekAgo]);

  if (!lesson) return <div className="text-muted">Loading mission dashboard...</div>;
  const profile = store?.profile || null;
  const countdown = profile?.target_date && nowTick ? Math.ceil((new Date(profile.target_date).getTime() - nowTick) / 86400000) : null;
  const topics = (store?.topics||[]).slice(0,20);
  const news = (store?.news_cache||[]).slice(0,5);
  const reminders = (store?.reminders||[]).slice(0,5);
  const quote = ARMY_QUOTES[quoteIndex % ARMY_QUOTES.length];
  const image = ARMY_IMAGES[imageIndex % ARMY_IMAGES.length];
  const taskOfDay = computed.todaysTasks.find((t: any) => !(t.completed || t.status === "done")) || computed.todaysTasks[0] || { title: lesson.practice, suggested: true };
  const lessonKey = String(lesson.day);
  const interviewResult = store?.lesson_interview_results?.[lessonKey] || null;
  const interviewDone = !!interviewResult?.completed;
  const moduleComplete = lessonDone && interviewDone;
  const completedLessonsCount = (Array.isArray(store?.__unused) ? 0 : 0) || Object.keys(store?.lesson_interview_results || {}).filter(k => store.lesson_interview_results[k]?.completed && store.lesson_progress?.[k]).length;

  return (
    <div className="space-y-5">
      <section className="relative rounded-3xl overflow-hidden border border-border/80 shadow-xl shadow-black/20 lg:min-h-[78svh]">
        {/* Desktop: background hero image */}
        <img
          src={image.src}
          alt={image.alt}
          className="hidden lg:block absolute inset-0 h-full w-full object-cover scale-[1.01]"
          loading="eager"
          onError={() => setImageIndex(i => (i + 1) % ARMY_IMAGES.length)}
        />
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-background/95" />
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/25" />

        {/* Mobile: image as regular element */}
        <div className="lg:hidden relative">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-56 sm:h-72 md:h-80 object-cover"
            loading="eager"
            onError={() => setImageIndex(i => (i + 1) % ARMY_IMAGES.length)}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
            <div className="text-xs text-white/90 bg-black/40 backdrop-blur rounded-lg px-2.5 py-1.5 border border-white/15 line-clamp-1">{image.alt}</div>
            <div className="flex gap-1.5 shrink-0">
              {ARMY_IMAGES.map((img, i) => (
                <button key={img.src} onClick={() => setImageIndex(i)} className={`h-2.5 rounded-full transition-all ${i===imageIndex?"bg-accent w-6":"bg-white/60 w-2.5 hover:bg-white/80"}`} aria-label={`Show image ${i+1}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 lg:min-h-[78svh] flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-surface lg:bg-transparent">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 lg:border-white/20 bg-primary/10 lg:bg-black/25 lg:backdrop-blur px-3 py-1 text-xs text-accent uppercase tracking-wider">
                <Sparkles size={12}/> Indian Army SSB Preparation
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold mt-3 text-text lg:text-white leading-tight">Jai Hind{profile?.name ? `, ${profile.name}` : ""}</h1>
              <p className="text-muted lg:text-white/85 text-sm sm:text-base mt-3 max-w-xl leading-7">Service Before Self. {profile?.onboarding_completed ? "Your preparation profile is saved locally and ready." : "Complete your profile in Settings/Onboarding to personalize your mission plan."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/calendar" className="inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl border border-border lg:border-white/25 bg-surface-raised lg:bg-white/10 hover:bg-surface-raised/80 lg:hover:bg-white/20 text-text lg:text-white lg:backdrop-blur"><CalendarDays size={15}/> Calendar</Link>
                <Link href="/interviewer" className="inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl border border-accent/40 bg-accent/15 lg:bg-accent/20 hover:bg-accent/25 lg:hover:bg-accent/30 text-accent lg:text-white lg:backdrop-blur"><Mic size={15}/> AI Interviewer</Link>
                <Link href="/analytics" className="inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl border border-border lg:border-white/25 bg-surface-raised lg:bg-black/20 hover:bg-surface-raised/80 lg:hover:bg-black/30 text-text lg:text-white lg:backdrop-blur"><TrendingUp size={15}/> Analytics</Link>
              </div>
            </div>

            <div className="w-full lg:w-[360px] rounded-2xl border border-border lg:border-white/20 bg-background/30 lg:bg-black/35 lg:backdrop-blur-md p-4 sm:p-5 text-text lg:text-white space-y-4">
              <div>
                <div className="text-accent font-medium text-sm flex items-center gap-2"><Target size={15}/> Task of the Day</div>
                <div className="mt-1.5 text-sm sm:text-base leading-6">{taskOfDay.title}</div>
                {taskOfDay.suggested && <div className="text-xs text-muted lg:text-white/70 mt-1">Suggested from today's SSB lesson</div>}
              </div>
              <div className="border-t border-border lg:border-white/15 pt-3">
                <div className="text-accent font-medium text-sm flex items-center gap-2"><BookOpen size={15}/> Current Lesson (Day {lesson.day})</div>
                <div className="mt-1.5 text-sm leading-6">{lesson.topic}</div>
                <div className="text-xs text-muted lg:text-white/70 mt-1">{lesson.focus}</div>
                <div className="mt-2 text-xs flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-full border ${lessonDone ? "text-success border-success/40" : "text-muted border-border lg:border-white/20"}`}>{lessonDone ? "Studied" : "Study pending"}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${interviewDone ? "text-success border-success/40" : "text-muted border-border lg:border-white/20"}`}>{interviewDone ? `Interview ${interviewResult?.score ?? ""}/100` : "Interview pending"}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border lg:border-white/15 bg-surface/60 lg:bg-white/5 p-2"><div className="text-[10px] text-muted lg:text-white/70">Countdown</div><div className="font-mono text-lg text-accent">{countdown ?? "—"}</div></div>
                <div className="rounded-xl border border-border lg:border-white/15 bg-surface/60 lg:bg-white/5 p-2"><div className="text-[10px] text-muted lg:text-white/70">Lessons</div><div className="font-mono text-lg text-accent">{completedLessonsCount}</div></div>
                <div className="rounded-xl border border-border lg:border-white/15 bg-surface/60 lg:bg-white/5 p-2"><div className="text-[10px] text-muted lg:text-white/70">Today</div><div className="font-mono text-lg text-accent">{computed.completion}%</div></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1.3fr_1fr] gap-4 items-end mt-4">
            <div className="rounded-2xl border border-border lg:border-white/20 bg-background/30 lg:bg-black/35 lg:backdrop-blur-md p-4 sm:p-5">
              <div className="text-accent text-xs uppercase tracking-wide mb-2">Indian Army Quote</div>
              <blockquote className="text-text lg:text-white">
                <p className="text-lg sm:text-xl md:text-2xl italic leading-relaxed">"{quote.quote}"</p>
                <footer className="text-sm text-muted lg:text-white/80 mt-3">— {quote.by}</footer>
              </blockquote>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ARMY_QUOTES.map((_, i) => (
                  <button key={i} onClick={() => setQuoteIndex(i)} className={`h-2 w-2 rounded-full transition-all ${i===quoteIndex?"bg-accent w-5":"bg-muted/50 lg:bg-white/40 hover:bg-accent/60 lg:hover:bg-white/70"}`} aria-label={`Show quote ${i+1}`} />
                ))}
              </div>
            </div>
            <div className="hidden lg:block rounded-2xl border border-white/20 bg-black/35 backdrop-blur-md p-4 text-white">
              <div className="text-sm font-medium">{image.alt}</div>
              <div className="text-xs text-white/70 mt-1">{image.credit}</div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                {ARMY_IMAGES.map((img, i) => (
                  <button key={img.src} onClick={() => setImageIndex(i)} className={`h-2.5 rounded-full shrink-0 transition-all ${i===imageIndex?"bg-accent w-6":"bg-white/40 w-2.5 hover:bg-white/70"}`} aria-label={`Show image ${i+1}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.45fr_1fr] gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Current SSB Lesson (Progressive)</CardTitle>
              <div className="text-xs text-muted mt-1">Day {lesson.day} • {lesson.ssbLink} • Next lesson unlocks after study + interview evaluation</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={toggleLessonDone} className={`h-10 px-3.5 rounded-xl text-sm font-medium border inline-flex items-center gap-2 transition-colors ${lessonDone ? "bg-primary/20 text-success border-success/40" : "border-border text-text hover:bg-surface-raised"}`}>
                <CheckCircle2 size={16}/> {lessonDone ? "Studied" : "Mark as studied"}
              </button>
              <Link href={`/interviewer?lesson=${lesson.day}`} className="h-10 px-3.5 rounded-xl text-sm font-medium border border-accent/40 text-accent bg-accent/10 hover:bg-accent/15 inline-flex items-center gap-2"><Mic size={16}/> {interviewDone ? "Reattempt interview" : "Start lesson interview"}</Link>
            </div>
          </CardHeader>
          <CardContent className="text-text space-y-4">
            <div className="rounded-xl border border-border bg-background/30 p-4">
              <div className="text-xs uppercase tracking-wide text-accent mb-1">Topic</div>
              <h3 className="font-heading text-lg sm:text-xl font-semibold">{lesson.topic}</h3>
              <p className="text-sm text-muted mt-1">{lesson.focus}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-accent mb-2">Learning objectives</div>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-text/90">{lesson.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}</ul>
            </div>

            <div>
              <div className="text-sm font-medium text-accent mb-2">Learning material</div>
              <div className="space-y-2.5 text-sm leading-7">
                {lesson.learn.map((p: string, i: number) => <p key={i} className="text-text/90">{p}</p>)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border border-border rounded-xl p-3.5 bg-background/20">
                <div className="text-sm font-medium text-accent mb-1.5">Key points</div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-text/90">{lesson.keyPoints.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
              </div>
              <div className="border border-border rounded-xl p-3.5 bg-background/20">
                <div className="text-sm font-medium text-accent mb-1.5">Example</div>
                <p className="text-sm text-text/90 leading-6">{lesson.example}</p>
              </div>
            </div>

            {lesson.doDont && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border border-success/30 rounded-xl p-3.5 bg-success/5">
                  <div className="text-sm font-medium text-success mb-1.5">Do</div>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-text/90">{lesson.doDont.do.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
                </div>
                <div className="border border-danger/30 rounded-xl p-3.5 bg-danger/5">
                  <div className="text-sm font-medium text-danger mb-1.5">Avoid</div>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-text/90">{lesson.doDont.dont.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
                </div>
              </div>
            )}

            <div className="border border-accent/30 bg-primary/10 rounded-xl p-4 space-y-2.5">
              <div><span className="text-sm font-medium text-accent">Today's practice:</span> <span className="text-sm text-text/95">{lesson.practice}</span></div>
              <div><span className="text-sm font-medium text-accent">Reflection:</span> <span className="text-sm text-text/95">{lesson.reflection}</span></div>
            </div>

            <div className="border border-border rounded-xl p-4 bg-background/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-accent flex items-center gap-2"><Award size={16}/> Lesson interview evaluation</div>
                  <div className="text-xs text-muted mt-0.5">Complete this lesson's interview and submit for strict evaluation (out of 100) to unlock the next lesson.</div>
                </div>
                <Link href={`/interviewer?lesson=${lesson.day}`} className="h-10 px-4 rounded-xl bg-primary text-[#0B0D0C] text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-2"><Mic size={15}/> {interviewDone ? "View / reattempt" : "Take interview"}</Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-border p-2.5"><div className="text-xs text-muted">Study</div><div className={lessonDone ? "text-success font-medium" : "text-text"}>{lessonDone ? "Completed" : "Pending"}</div></div>
                <div className="rounded-lg border border-border p-2.5"><div className="text-xs text-muted">Interview</div><div className={interviewDone ? "text-success font-medium" : "text-text"}>{interviewDone ? "Evaluated" : "Pending"}</div></div>
                <div className="rounded-lg border border-border p-2.5"><div className="text-xs text-muted">Score</div><div className="font-mono text-accent">{interviewDone ? `${interviewResult.score}/100` : "—"}</div></div>
              </div>
              {interviewDone && (
                <div className="space-y-2 text-sm">
                  <div><span className="text-accent font-medium">Verdict:</span> {interviewResult.verdict || "—"}</div>
                  {interviewResult.scolding && <div className="rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-danger"><span className="font-medium">Strict feedback:</span> {interviewResult.scolding}</div>}
                  {Array.isArray(interviewResult.improvements) && interviewResult.improvements.length > 0 && (
                    <div><div className="text-accent font-medium mb-1">Improvements</div><ul className="list-disc pl-5 space-y-1 text-text/90">{interviewResult.improvements.slice(0,4).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div>
                  )}
                </div>
              )}
              {moduleComplete && <div className="rounded-lg border border-success/30 bg-success/10 p-2.5 text-sm text-success">Lesson module completed (study + interview). The next lesson will be showcased as your current lesson.</div>}
            </div>

            <div className="border border-border rounded-xl p-4 space-y-3 bg-background/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-accent">Detailed web-based learning (Tavily)</div>
                  <div className="text-xs text-muted mt-0.5">Fetch comprehensive, in-depth material and practice guidance for today's topic from web sources.</div>
                </div>
                <button onClick={() => fetchDetailedLesson(!!lessonDetail)} disabled={detailLoading} className="h-10 px-4 rounded-xl bg-primary text-[#0B0D0C] text-sm font-medium hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-2">
                  <Sparkles size={15}/> {detailLoading ? "Fetching..." : lessonDetail ? "Refresh detailed learning" : "Fetch detailed learning"}
                </button>
              </div>
              {detailError && <p className="text-sm text-danger rounded-lg border border-danger/30 bg-danger/10 p-2.5">{detailError}</p>}
              {lessonDetail && (
                <div className="space-y-4 text-sm pt-1">
                  {lessonDetail.overview && <p className="text-text/90 leading-7">{lessonDetail.overview}</p>}
                  {Array.isArray(lessonDetail.detailed_material) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Detailed material</div>
                      <div className="space-y-2.5">{lessonDetail.detailed_material.map((p: string, i: number) => <p key={i} className="text-text/90 leading-7">{p}</p>)}</div>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.key_concepts) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Key concepts</div>
                      <ul className="list-disc pl-5 space-y-1 text-text/90">{lessonDetail.key_concepts.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.ssb_application) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">SSB application</div>
                      <ul className="list-disc pl-5 space-y-1 text-text/90">{lessonDetail.ssb_application.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.examples) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Examples</div>
                      <ul className="list-disc pl-5 space-y-1 text-text/90">{lessonDetail.examples.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.practice_questions) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Practice questions</div>
                      <ol className="list-decimal pl-5 space-y-1 text-text/90">{lessonDetail.practice_questions.map((k: string, i: number) => <li key={i}>{k}</li>)}</ol>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.daily_plan) && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Today's detailed plan</div>
                      <ol className="list-decimal pl-5 space-y-1 text-text/90">{lessonDetail.daily_plan.map((k: string, i: number) => <li key={i}>{k}</li>)}</ol>
                    </div>
                  )}
                  {Array.isArray(lessonDetail.sources) && lessonDetail.sources.length > 0 && (
                    <div>
                      <div className="font-medium text-accent mb-1.5">Web sources</div>
                      <ul className="space-y-1.5">
                        {lessonDetail.sources.map((s: any, i: number) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-start gap-1.5"><ExternalLink size={13} className="mt-1 shrink-0"/><span>{s.title || s.url}</span></a></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><div><CardTitle>Progress snapshot</CardTitle><div className="text-xs text-muted mt-1">At-a-glance readiness indicators</div></div><Link href="/analytics" className="text-xs text-accent hover:underline">Open analytics</Link></CardHeader>
            <CardContent className="space-y-3 text-text">
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="border border-border rounded-xl p-3 bg-background/20"><div className="text-xs text-muted flex items-center gap-1.5"><Target size={13}/> Countdown</div><div className="font-mono text-xl text-accent mt-1">{countdown ?? "—"}</div><div className="text-[11px] text-muted">days to target</div></div>
                <div className="border border-border rounded-xl p-3 bg-background/20"><div className="text-xs text-muted flex items-center gap-1.5"><CheckCircle2 size={13}/> Today</div><div className="font-mono text-xl text-accent mt-1">{computed.completion}%</div><div className="text-[11px] text-muted">{computed.doneToday}/{computed.todaysTasks.length} tasks</div></div>
                <div className="border border-border rounded-xl p-3 bg-background/20"><div className="text-xs text-muted flex items-center gap-1.5"><BookOpen size={13}/> Lessons</div><div className="font-mono text-xl text-accent mt-1">{completedLessonsCount}</div><div className="text-[11px] text-muted">studied total</div></div>
                <div className="border border-border rounded-xl p-3 bg-background/20"><div className="text-xs text-muted flex items-center gap-1.5"><Clock size={13}/> This week</div><div className="font-mono text-xl text-accent mt-1">{computed.hoursWeek.toFixed(1)}h</div><div className="text-[11px] text-muted">study hours</div></div>
              </div>
              <div className="border border-border rounded-xl p-3 bg-background/20">
                <div className="text-xs text-muted mb-1">Current lesson status</div>
                <div className={`text-sm font-medium ${moduleComplete ? "text-success" : "text-accent"}`}>{moduleComplete ? "Module completed (study + interview)" : lessonDone ? (interviewDone ? "Completed" : "Studied — interview pending for next lesson unlock") : "Study pending — complete study and interview to unlock next lesson"}</div>
              </div>
              <div className="text-sm"><div className="text-accent font-medium mb-1">Focus now</div><div className="border border-border rounded-xl p-3 bg-background/20 leading-6">{taskOfDay.title}</div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Today's tasks</CardTitle><Link href="/tracker" className="text-xs text-accent hover:underline">Open tracker</Link></CardHeader>
            <CardContent>
              {computed?.todaysTasks.length ? <ul className="space-y-2 text-text">{computed.todaysTasks.slice(0,6).map((t:any)=>(<li key={t.id} className="flex items-center justify-between gap-3 border border-border rounded-xl px-3 py-2.5 bg-background/20"><span className={`text-sm ${(t.completed||t.status==="done")?"line-through text-muted":""}`}>{t.title}</span><span className={`text-xs px-2 py-0.5 rounded-full ${(t.completed||t.status==="done")?"text-success bg-success/10":"text-muted bg-surface-raised"}`}>{(t.completed||t.status==="done")?"Done":"Pending"}</span></li>))}</ul> : <p className="text-sm text-muted">No tasks due today. <Link href="/tracker" className="text-accent underline">Add tasks</Link> to build momentum.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Topic progress</CardTitle><Link href="/tracker" className="text-xs text-accent hover:underline">View all</Link></CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-text">{topics.slice(0,6).map((t:any)=>(<li key={t.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0"><span className="text-sm">{t.name}</span><span className="text-xs text-muted capitalize">{t.status?.replace("_"," ")} • {t.confidence}/5</span></li>))}</ul>
            {!topics.length && <p className="text-sm text-muted">No topics yet. Complete onboarding to initialize your tracker.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>News & current affairs</CardTitle><Link href="/knowledge" className="text-xs text-accent hover:underline">More</Link></CardHeader>
          <CardContent className="space-y-2.5">
            {news.length ? news.map((n:any)=>(<div key={n.id||n.url} className="border border-border rounded-xl p-3 text-text bg-background/20"><a href={n.url} target="_blank" rel="noreferrer" className="font-medium hover:text-accent text-sm leading-6">{n.title}</a>{n.summary && <p className="text-sm mt-1 text-muted"><span className="text-accent">AI summary:</span> {n.summary}</p>}</div>)) : <p className="text-muted text-sm">No cached news yet. Open Knowledge to fetch current affairs (server API keys required).</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Upcoming reminders</CardTitle><Link href="/settings" className="text-xs text-accent hover:underline">Manage</Link></CardHeader>
          <CardContent>{reminders.length ? reminders.map((r:any)=>(<div key={r.id} className="border border-border rounded-xl p-3 text-text bg-background/20"><div className="font-medium text-sm">{r.title}</div></div>)) : <p className="text-muted text-sm">No reminders stored locally. Browser-only mode does not run server cron emails.</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Practice guidance</CardTitle><Link href="/analytics" className="text-xs text-accent hover:underline">Open analytics</Link></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted leading-6">AI feedback and analytics are for <span className="text-text font-medium">practice guidance only</span>, never selection predictions. Consistent daily lessons, honest reflection, and disciplined fitness build real readiness.</p>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-text/90">Tip: complete today’s lesson, log your study/workout, and review progress in Analytics to maintain your streak.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
