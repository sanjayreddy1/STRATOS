"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore } from "@/lib/local/store";
import { getDailyLesson } from "@/lib/data/daily-lessons";
import { Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";

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
        if (text) {
          // auto-send captured answer for smoother voice chat
          setTimeout(() => { if (text) sendText(text); }, 150);
        }
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
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">AI Interviewer</h1>
      <p className="text-muted text-sm">Voice-enabled Personal Interview practice based on your completed days, lessons, logs, and profile. Uses browser speech with Microsoft voices when available. Practice guidance only.</p>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        <Card>
          <CardHeader><CardTitle>Progress context</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-text">
            <div><span className="text-muted">Name:</span> {context.profile?.name || "Not set"}</div>
            <div><span className="text-muted">Completed lesson days:</span> {context.completedDays}</div>
            <div><span className="text-muted">Branch:</span> {context.profile?.engineering_branch || "Not set"}</div>
            <div><span className="text-muted">Recent completed lessons:</span>
              <ul className="list-disc pl-5 mt-1 text-muted">
                {context.completedLessons.slice(0,6).map((t:string,i:number)=><li key={i}>{t}</li>)}
                {!context.completedLessons.length && <li>None yet — complete daily lessons to personalize questions</li>}
              </ul>
            </div>
            <button onClick={start} disabled={loading} className="mt-2 h-10 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium disabled:opacity-50">{messages.length ? "Restart interview" : "Start interview"}</button>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="font-medium text-accent">Voice chat</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setVoiceOn(v=>!v); if (voiceOn) stopSpeaking(); }} className="h-9 px-3 rounded-lg border border-border inline-flex items-center gap-2 text-sm">
                  {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />} {voiceOn ? "Voice on" : "Voice off"}
                </button>
                <button type="button" onClick={stopSpeaking} className="h-9 px-3 rounded-lg border border-border inline-flex items-center gap-2 text-sm"><Square size={14} /> Stop</button>
              </div>
              <div>
                <label className="text-xs text-muted">Interviewer voice (Microsoft preferred)</label>
                <select value={voiceName} onChange={e=>setVoiceName(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-border bg-surface-raised px-2 text-sm" disabled={!speechSupported.tts}>
                  <option value="">Auto (prefer Microsoft)</option>
                  {(msVoices.length ? msVoices : voices).slice(0,30).map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
              </div>
              <p className="text-xs text-muted">Mic answers use browser speech recognition; interviewer speech uses browser text-to-speech. For best Microsoft voice support, use Microsoft Edge on Windows.</p>
            </div>

            {error && <p className="text-danger text-xs">{error}</p>}
            <p className="text-xs text-muted">Requires GROQ/Gemini API keys configured on server (.env) and dev server restarted.</p>
          </CardContent>
        </Card>

        <Card className="min-h-[60vh] flex flex-col">
          <CardHeader><CardTitle>Interview session (voice chat)</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {!messages.length && <div className="text-muted text-sm border border-border rounded-lg p-3">Press "Start interview" to begin. The AI IO will speak questions (if voice on) and you can answer by typing or using the microphone.</div>}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "assistant" ? "bg-surface-raised border border-border text-text" : "ml-auto bg-primary/20 border border-primary/30 text-text"}`}>
                  <div className="text-[10px] uppercase tracking-wide text-muted mb-1">{m.role === "assistant" ? "Interviewing Officer" : "You"}</div>
                  <div className="whitespace-pre-wrap leading-6">{m.content}</div>
                </div>
              ))}
              {loading && <div className="text-sm text-muted">Interviewing Officer is thinking...</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="mt-3 flex gap-2">
              <button type="button" onClick={toggleListen} disabled={loading || messages.length===0} className={`h-11 w-11 inline-flex items-center justify-center rounded-xl border ${listening ? "border-danger text-danger bg-danger/10" : "border-border"} disabled:opacity-50`} aria-label="Microphone">
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder={listening ? "Listening..." : "Type or speak your answer..."} className="flex-1 h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" disabled={loading || messages.length===0} />
              <button type="submit" disabled={loading || !input.trim() || messages.length===0} className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium disabled:opacity-50">Send</button>
            </form>
            {listening && <p className="text-xs text-accent mt-2">Listening... speak your answer (auto-sends when you stop).</p>}
            {!speechSupported.stt && <p className="text-xs text-muted mt-2">Microphone speech recognition not supported in this browser; you can still type answers.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
