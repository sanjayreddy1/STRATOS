"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore } from "@/lib/local/store";
import { getCurrentLesson, SSB_DAILY_LESSONS } from "@/lib/data/daily-lessons";
import { Mic, MicOff, Volume2, VolumeX, Square, Send, RotateCcw, Sparkles, UserCircle2, Award, CheckCircle2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

function cleanInterviewText(text: string) {
  return String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickMicrosoftRaviVoice(voices: SpeechSynthesisVoice[]) {
  const ms = voices.filter(v => /microsoft/i.test(v.name));
  return (
    ms.find(v => /ravi/i.test(v.name) && /en[-_]?in/i.test(`${v.lang} ${v.name}`)) ||
    ms.find(v => /ravi/i.test(v.name)) ||
    voices.find(v => /ravi/i.test(v.name))
  );
}

export default function InterviewerPage() {
  const [store, setStore] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState({ tts: false, stt: false });
  const [voiceReady, setVoiceReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastSpokenRef = useRef<number>(-1);

  function refreshLesson(s: any) {
    let param: string | null = null;
    if (typeof window !== "undefined") {
      param = new URLSearchParams(window.location.search).get("lesson");
    }
    const day = param ? Number(param) : null;
    let l = null;
    if (day && !Number.isNaN(day)) l = SSB_DAILY_LESSONS.find(x => x.day === day) || null;
    if (!l) l = getCurrentLesson(s);
    const lessonKey = String(l.day);
    setLesson({ ...l, lessonKey });
    setEvaluation(s?.lesson_interview_results?.[lessonKey] || null);
  }

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    refreshLesson(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, evaluation]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tts = "speechSynthesis" in window;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported({ tts, stt: !!SR });
    if (tts) {
      const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices();
        setVoices(vs);
        setVoiceReady(!!pickMicrosoftRaviVoice(vs));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  const context = useMemo(() => {
    const s = store || {};
    const progress = s.lesson_progress || {};
    const completedKeys = Object.keys(progress).filter(k => progress[k]).sort();
    const completedLessons = completedKeys.map(k => {
      const n = Number(k);
      if (!Number.isNaN(n)) {
        const found = SSB_DAILY_LESSONS.find(x => x.day === n);
        return found ? `Day ${found.day}: ${found.topic}` : k;
      }
      return k;
    });
    return {
      profile: s.profile || {},
      completedDays: completedKeys.length,
      completedLessons,
      recentTopics: (s.topics || []).filter((t: any) => t.status !== "not_started").map((t: any) => `${t.name} (${t.status})`),
      dailyLogs: (s.daily_logs || []).slice().sort((a:any,b:any)=>b.log_date.localeCompare(a.log_date)).slice(0, 7),
      workoutLogs: (s.workout_logs || []).slice().sort((a:any,b:any)=>b.log_date.localeCompare(a.log_date)).slice(0, 7),
      lesson: lesson ? { day: lesson.day, topic: lesson.topic, focus: lesson.focus, ssbLink: lesson.ssbLink, objectives: lesson.objectives, keyPoints: lesson.keyPoints, practice: lesson.practice, reflection: lesson.reflection } : null,
    };
  }, [store, lesson]);

  function speak(text: string) {
    if (!voiceOn || !speechSupported.tts || !text) return;
    try {
      const v = pickMicrosoftRaviVoice(voices);
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (v) { u.voice = v; u.lang = v.lang || "en-IN"; }
      else { u.lang = "en-IN"; }
      u.rate = 1; u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  useEffect(() => {
    const idx = messages.length - 1;
    if (idx >= 0 && messages[idx].role === "assistant" && idx !== lastSpokenRef.current) {
      lastSpokenRef.current = idx;
      speak(messages[idx].content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceOn, voices]);

  async function ask(nextMessages: Msg[]) {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to get interviewer response");
      setMessages(prev => [...prev, { role: "assistant", content: cleanInterviewText(data.question) }]);
    } catch (e: any) {
      setError(e?.message || "Failed to reach AI interviewer");
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    stopSpeaking();
    lastSpokenRef.current = -1;
    setMessages([]);
    setEvaluation(null);
    await ask([]);
  }

  async function sendText(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    await ask(next);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await sendText(input);
  }

  function toggleListen() {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch {}
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported in this browser. Try Microsoft Edge/Chrome."); return; }
    try {
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = "en-IN";
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = "";
      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += t;
          else interim += t;
        }
        setInput((finalText + " " + interim).trim());
      };
      rec.onerror = () => { setListening(false); };
      rec.onend = () => {
        setListening(false);
        const text = (finalText || input).trim();
        if (text) setTimeout(() => sendText(text), 150);
      };
      setListening(true);
      rec.start();
    } catch (e: any) {
      setListening(false);
      setError(e?.message || "Could not start microphone");
    }
  }

  async function submitForEvaluation() {
    if (!lesson || evaluating) return;
    const userAnswers = messages.filter(m => m.role === "user").length;
    if (userAnswers < 2) { setError("Answer at least 2 interview questions before submitting for evaluation."); return; }
    setEvaluating(true); setError(null);
    try {
      const res = await fetch("/api/ai/interview-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson, messages }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to evaluate interview");
      const ev = { ...data.evaluation, completed: true, lessonDay: lesson.day, lessonTopic: lesson.topic };
      const s = loadStore();
      s.lesson_interview_results = s.lesson_interview_results || {};
      s.lesson_interview_results[String(lesson.day)] = ev;
      saveStore(s);
      setStore(s);
      setEvaluation(ev);
      // refresh lesson selection in case module now complete and user wants next
      const current = getCurrentLesson(s);
      if (current.day !== lesson.day) {
        // keep showing evaluated lesson results; dashboard will show next
      }
    } catch (e: any) {
      setError(e?.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  }

  const userAnswerCount = messages.filter(m => m.role === "user").length;
  const lessonKey = lesson ? String(lesson.day) : "";
  const studied = !!(store?.lesson_progress?.[lessonKey]);
  const interviewDone = !!evaluation?.completed;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Sparkles className="text-accent" size={24}/> AI Interviewer</h1>
        <p className="page-subtitle mt-1">Lesson-based SSB interview practice with strict evaluation out of 100. Complete study + interview evaluation to unlock the next lesson.</p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader><div><CardTitle>Current lesson interview</CardTitle><div className="text-xs text-muted mt-1">Interview is conducted for this lesson</div></div></CardHeader>
            <CardContent className="text-sm space-y-3 text-text">
              {lesson ? (
                <>
                  <div className="rounded-xl border border-border bg-background/30 p-3">
                    <div className="text-xs text-muted">Lesson Day {lesson.day}</div>
                    <div className="font-medium mt-0.5">{lesson.topic}</div>
                    <div className="text-xs text-muted mt-1">{lesson.focus}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border p-2.5 bg-background/20"><div className="text-[11px] text-muted">Study status</div><div className={`font-medium ${studied ? "text-success" : "text-accent"}`}>{studied ? "Completed" : "Pending"}</div></div>
                    <div className="rounded-xl border border-border p-2.5 bg-background/20"><div className="text-[11px] text-muted">Interview status</div><div className={`font-medium ${interviewDone ? "text-success" : "text-accent"}`}>{interviewDone ? "Evaluated" : "Pending"}</div></div>
                  </div>
                  {interviewDone && <div className="rounded-xl border border-accent/30 bg-accent/10 p-3"><div className="text-xs text-muted">Last score</div><div className="font-mono text-2xl text-accent">{evaluation.score}/100</div></div>}
                  <button onClick={start} disabled={loading || evaluating} className="w-full h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    <RotateCcw size={16}/> {messages.length ? "Restart lesson interview" : "Start lesson interview"}
                  </button>
                  <button onClick={submitForEvaluation} disabled={evaluating || loading || userAnswerCount < 2} className="w-full h-11 px-4 rounded-xl border border-accent/40 text-accent bg-accent/10 hover:bg-accent/15 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    <Award size={16}/> {evaluating ? "Evaluating..." : interviewDone ? "Re-evaluate interview" : "Submit for evaluation (out of 100)"}
                  </button>
                  <p className="text-xs text-muted">Answer at least 2 questions, then submit for strict senior-evaluator scoring. Irrelevant answers will be penalized and called out.</p>
                </>
              ) : <p className="text-muted">Loading lesson...</p>}
              {error && <p className="text-danger text-xs rounded-lg border border-danger/30 bg-danger/10 p-2">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Voice settings</CardTitle><div className="text-xs text-muted mt-1">Fixed interviewer voice</div></div></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setVoiceOn(v=>!v); if (voiceOn) stopSpeaking(); }} className="h-10 px-3 rounded-xl border border-border hover:bg-surface-raised inline-flex items-center gap-2 text-sm flex-1 justify-center">
                  {voiceOn ? <Volume2 size={16} className="text-accent"/> : <VolumeX size={16} />} {voiceOn ? "Voice on" : "Voice off"}
                </button>
                <button type="button" onClick={stopSpeaking} className="h-10 px-3 rounded-xl border border-border hover:bg-surface-raised inline-flex items-center gap-2 text-sm"><Square size={14} /> Stop</button>
              </div>
              <div className="rounded-xl border border-border bg-background/30 p-3">
                <div className="text-xs text-muted">Interviewer voice</div>
                <div className="font-medium text-text mt-0.5">Microsoft Ravi (Male, en-IN)</div>
                <div className={`text-xs mt-1 ${voiceReady ? "text-success" : "text-muted"}`}>{speechSupported.tts ? (voiceReady ? "Voice available on this device/browser." : "Ravi voice not detected yet; browser will try to use it if installed (best in Microsoft Edge on Windows).") : "Text-to-speech not supported in this browser."}</div>
              </div>
            </CardContent>
          </Card>

          {evaluation && (
            <Card>
              <CardHeader><div><CardTitle className="flex items-center gap-2"><Award size={18} className="text-accent"/> Evaluation result</CardTitle><div className="text-xs text-muted mt-1">Strict senior evaluator assessment</div></div></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-end justify-between"><div><div className="text-xs text-muted">Score</div><div className="font-mono text-3xl text-accent">{evaluation.score}/100</div></div><div className={`text-xs px-2 py-1 rounded-full border ${evaluation.score >= 60 ? "text-success border-success/40" : "text-danger border-danger/40"}`}>{evaluation.score >= 60 ? "Satisfactory" : "Needs serious improvement"}</div></div>
                {evaluation.verdict && <div><span className="text-accent font-medium">Verdict:</span> <span className="text-text/90">{evaluation.verdict}</span></div>}
                {evaluation.relevance && <div><span className="text-accent font-medium">Relevance:</span> <span className="text-text/90">{evaluation.relevance}</span></div>}
                {evaluation.scolding && <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-danger"><span className="font-medium">Senior evaluator remarks (strict):</span> {evaluation.scolding}</div>}
                {Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0 && <div><div className="text-accent font-medium mb-1">Strengths</div><ul className="list-disc pl-5 space-y-1 text-text/90">{evaluation.strengths.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div>}
                {Array.isArray(evaluation.weaknesses) && evaluation.weaknesses.length > 0 && <div><div className="text-accent font-medium mb-1">Weaknesses</div><ul className="list-disc pl-5 space-y-1 text-text/90">{evaluation.weaknesses.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div>}
                {Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0 && <div><div className="text-accent font-medium mb-1">Improvements</div><ul className="list-disc pl-5 space-y-1 text-text/90">{evaluation.improvements.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div>}
                {studied && interviewDone && <div className="rounded-lg border border-success/30 bg-success/10 p-2.5 text-success flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0"/> Lesson module completed (study + interview). Go to Dashboard to continue with the next showcased lesson.</div>}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="min-h-[70vh] flex flex-col">
          <CardHeader className="border-b border-border/60 pb-3 mb-0">
            <div>
              <CardTitle>Interview session {lesson ? `(Day ${lesson.day})` : ""}</CardTitle>
              <div className="text-xs text-muted mt-1">{messages.length ? "Answer clearly and relevantly. Use mic or type." : "Start the lesson interview to receive your first question."}</div>
            </div>
            {listening && <span className="text-xs px-2.5 py-1 rounded-full border border-accent/40 text-accent bg-accent/10">Listening</span>}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-4">
            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {!messages.length && (
                <div className="h-full min-h-[240px] flex items-center justify-center">
                  <div className="text-center max-w-md rounded-2xl border border-dashed border-border p-6 bg-background/20">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 border border-accent/30 flex items-center justify-center text-accent mb-3"><Mic size={20}/></div>
                    <p className="text-sm text-text font-medium">Lesson interview: {lesson?.topic || "SSB"}</p>
                    <p className="text-sm text-muted mt-1">Press <span className="text-text">Start lesson interview</span>. The IO will ask questions related to this lesson. After answering, submit for strict evaluation.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "assistant" ? "bg-surface-raised/90 border border-border text-text" : "ml-auto bg-primary/20 border border-primary/40 text-text"}`}>
                  <div className="text-[10px] uppercase tracking-wide text-muted mb-1.5">{m.role === "assistant" ? "Interviewing Officer" : "You"}</div>
                  <div className="whitespace-pre-wrap leading-6 text-text/95">{m.content}</div>
                </div>
              ))}
              {(loading || evaluating) && <div className="inline-flex items-center gap-2 text-sm text-muted rounded-xl border border-border bg-surface/50 px-3 py-2"><span className="h-2 w-2 rounded-full bg-accent animate-pulse"/> {evaluating ? "Senior evaluator is assessing your interview..." : "Interviewing Officer is thinking..."}</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="mt-4 flex gap-2 items-end border-t border-border/60 pt-3">
              <button type="button" onClick={toggleListen} disabled={loading || evaluating || messages.length===0} className={`h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border transition-colors ${listening ? "border-danger text-danger bg-danger/10" : "border-border hover:bg-surface-raised"} disabled:opacity-40`} aria-label="Microphone">
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={listening ? "Listening... speak your answer" : "Type or speak your answer..."} className="flex-1 min-h-[44px] max-h-32 rounded-xl border border-border bg-surface-raised/80 px-3.5 py-2.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 resize-y" disabled={loading || evaluating || messages.length===0} rows={1} />
              <button type="submit" disabled={loading || evaluating || !input.trim() || messages.length===0} className="h-11 px-4 shrink-0 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover disabled:opacity-40 inline-flex items-center gap-2"><Send size={16}/> Send</button>
            </form>
            {listening && <p className="text-xs text-accent mt-2">Listening... your answer will auto-send when you stop speaking.</p>}
            {!speechSupported.stt && <p className="text-xs text-muted mt-2">Speech recognition not supported in this browser; type your answers instead.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
