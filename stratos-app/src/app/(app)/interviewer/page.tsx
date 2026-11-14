"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore } from "@/lib/local/store";
import { getDailyLesson } from "@/lib/data/daily-lessons";
import { Mic, MicOff, Volume2, VolumeX, Square, Send, RotateCcw, Sparkles, UserCircle2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

function pickMicrosoftVoice(voices: SpeechSynthesisVoice[], selected?: string) {
  if (selected) {
    const v = voices.find(x => x.name === selected);
    if (v) return v;
  }
  const ms = voices.filter(v => /microsoft/i.test(v.name));
  return ms.find(v => /en-IN|india/i.test(`${v.lang} ${v.name}`)) || ms.find(v => /en/i.test(v.lang)) || ms[0] || voices.find(v => /en/i.test(v.lang)) || voices[0];
}

export default function InterviewerPage() {
  const [store, setStore] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState({ tts: false, stt: false });
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastSpokenRef = useRef<number>(-1);

  useEffect(() => { setStore(loadStore()); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tts = "speechSynthesis" in window;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported({ tts, stt: !!SR });
    if (tts) {
      const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices();
        setVoices(vs);
        setVoiceName(prev => prev || pickMicrosoftVoice(vs)?.name || "");
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
      const [y,m,d] = k.split("-").map(Number);
      if (!y || !m || !d) return k;
      return getDailyLesson(new Date(y, m-1, d)).topic;
    });
    return {
      profile: s.profile || {},
      completedDays: completedKeys.length,
      completedLessons,
      recentTopics: (s.topics || []).filter((t: any) => t.status !== "not_started").map((t: any) => `${t.name} (${t.status})`),
      dailyLogs: (s.daily_logs || []).slice().sort((a:any,b:any)=>b.log_date.localeCompare(a.log_date)).slice(0, 7),
      workoutLogs: (s.workout_logs || []).slice().sort((a:any,b:any)=>b.log_date.localeCompare(a.log_date)).slice(0, 7),
    };
  }, [store]);

  function speak(text: string) {
    if (!voiceOn || !speechSupported.tts || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickMicrosoftVoice(voices, voiceName);
      if (v) { u.voice = v; u.lang = v.lang; }
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
  }, [messages, voiceOn, voiceName, voices]);

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
      setMessages(prev => [...prev, { role: "assistant", content: data.question }]);
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

  const msVoices = voices.filter(v => /microsoft/i.test(v.name));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Sparkles className="text-accent" size={24}/> AI Interviewer</h1>
        <p className="page-subtitle mt-1">Voice-enabled Personal Interview practice tailored to your completed lessons, logs, and profile. Practice guidance only, never a selection prediction.</p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader><div><CardTitle>Candidate context</CardTitle><div className="text-xs text-muted mt-1">Used to personalize questions</div></div></CardHeader>
            <CardContent className="text-sm space-y-3 text-text">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/30 p-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-accent/30 flex items-center justify-center text-accent"><UserCircle2 size={20}/></div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{context.profile?.name || "Candidate profile not set"}</div>
                  <div className="text-xs text-muted truncate">{context.profile?.engineering_branch || "Branch not set"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border p-2.5 bg-background/20"><div className="text-[11px] text-muted">Lessons completed</div><div className="font-mono text-lg text-accent">{context.completedDays}</div></div>
                <div className="rounded-xl border border-border p-2.5 bg-background/20"><div className="text-[11px] text-muted">Topics tracked</div><div className="font-mono text-lg text-accent">{context.recentTopics.length}</div></div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1.5">Recent completed lessons</div>
                <div className="space-y-1.5">
                  {context.completedLessons.slice(0,5).map((t:string,i:number)=><div key={i} className="text-xs rounded-lg border border-border/70 px-2.5 py-1.5 bg-surface-raised/40 text-text/90">{t}</div>)}
                  {!context.completedLessons.length && <div className="text-xs text-muted rounded-lg border border-dashed border-border p-2.5">Complete daily lessons to personalize interview questions.</div>}
                </div>
              </div>
              <button onClick={start} disabled={loading} className="w-full h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <RotateCcw size={16}/> {messages.length ? "Restart interview" : "Start interview"}
              </button>
              {error && <p className="text-danger text-xs rounded-lg border border-danger/30 bg-danger/10 p-2">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Voice settings</CardTitle><div className="text-xs text-muted mt-1">Best experience in Microsoft Edge (Windows)</div></div></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setVoiceOn(v=>!v); if (voiceOn) stopSpeaking(); }} className="h-10 px-3 rounded-xl border border-border hover:bg-surface-raised inline-flex items-center gap-2 text-sm flex-1 justify-center">
                  {voiceOn ? <Volume2 size={16} className="text-accent"/> : <VolumeX size={16} />} {voiceOn ? "Voice on" : "Voice off"}
                </button>
                <button type="button" onClick={stopSpeaking} className="h-10 px-3 rounded-xl border border-border hover:bg-surface-raised inline-flex items-center gap-2 text-sm"><Square size={14} /> Stop</button>
              </div>
              <div>
                <label className="text-xs text-muted">Interviewer voice (Microsoft preferred)</label>
                <select value={voiceName} onChange={e=>setVoiceName(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-border bg-surface-raised/80 px-3 text-sm outline-none focus:border-accent/60" disabled={!speechSupported.tts}>
                  <option value="">Auto (prefer Microsoft)</option>
                  {(msVoices.length ? msVoices : voices).slice(0,30).map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
              </div>
              <p className="text-xs text-muted">Microphone uses browser speech recognition; interviewer replies use text-to-speech. Requires server AI keys and dev server restart.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-[70vh] flex flex-col">
          <CardHeader className="border-b border-border/60 pb-3 mb-0">
            <div>
              <CardTitle>Interview session</CardTitle>
              <div className="text-xs text-muted mt-1">{messages.length ? "Answer clearly and honestly. Use mic or type." : "Start the session to receive your first question."}</div>
            </div>
            {listening && <span className="text-xs px-2.5 py-1 rounded-full border border-accent/40 text-accent bg-accent/10">Listening</span>}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-4">
            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {!messages.length && (
                <div className="h-full min-h-[240px] flex items-center justify-center">
                  <div className="text-center max-w-md rounded-2xl border border-dashed border-border p-6 bg-background/20">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 border border-accent/30 flex items-center justify-center text-accent mb-3"><Mic size={20}/></div>
                    <p className="text-sm text-text font-medium">Ready for mock interview</p>
                    <p className="text-sm text-muted mt-1">Press <span className="text-text">Start interview</span>. The IO will ask questions based on your progress, and you can respond by voice or text.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "assistant" ? "bg-surface-raised/90 border border-border text-text" : "ml-auto bg-primary/20 border border-primary/40 text-text"}`}>
                  <div className="text-[10px] uppercase tracking-wide text-muted mb-1.5">{m.role === "assistant" ? "Interviewing Officer" : "You"}</div>
                  <div className="whitespace-pre-wrap leading-6 text-text/95">{m.content}</div>
                </div>
              ))}
              {loading && <div className="inline-flex items-center gap-2 text-sm text-muted rounded-xl border border-border bg-surface/50 px-3 py-2"><span className="h-2 w-2 rounded-full bg-accent animate-pulse"/> Interviewing Officer is thinking...</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="mt-4 flex gap-2 items-end border-t border-border/60 pt-3">
              <button type="button" onClick={toggleListen} disabled={loading || messages.length===0} className={`h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border transition-colors ${listening ? "border-danger text-danger bg-danger/10" : "border-border hover:bg-surface-raised"} disabled:opacity-40`} aria-label="Microphone">
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={listening ? "Listening... speak your answer" : "Type or speak your answer..."} className="flex-1 min-h-[44px] max-h-32 rounded-xl border border-border bg-surface-raised/80 px-3.5 py-2.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 resize-y" disabled={loading || messages.length===0} rows={1} />
              <button type="submit" disabled={loading || !input.trim() || messages.length===0} className="h-11 px-4 shrink-0 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover disabled:opacity-40 inline-flex items-center gap-2"><Send size={16}/> Send</button>
            </form>
            {listening && <p className="text-xs text-accent mt-2">Listening... your answer will auto-send when you stop speaking.</p>}
            {!speechSupported.stt && <p className="text-xs text-muted mt-2">Speech recognition not supported in this browser; type your answers instead.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
