"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore } from "@/lib/local/store";
import { BookOpen, RefreshCw, ExternalLink, Bookmark, Sparkles } from "lucide-react";

export default function KnowledgePage() {
  const [news, setNews] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = () => { const s = loadStore(); setNews(s.news_cache||[]); setSaved(s.saved_articles||[]); };
  useEffect(()=>{ refresh(); },[]);

  async function fetchNews() {
    setMsg(null); setLoading(true);
    try {
      const res = await fetch("/api/news?refresh=1");
      const data = await res.json();
      if (data?.items) {
        const s = loadStore(); s.news_cache = data.items; saveStore(s); refresh();
        if (data.items.length) setMsg(data.warning || `Fetched ${data.items.length} items and saved locally.`);
        else setMsg(data.warning || data.error || "No news items returned.");
      } else {
        setMsg(data?.warning || data?.error || "Could not fetch news.");
      }
    } catch (e:any) { setMsg(e?.message || "Failed to fetch news."); }
    finally { setLoading(false); }
  }

  function saveArticle(n:any) {
    const s = loadStore();
    if (!s.saved_articles.find((a:any)=>a.url===n.url)) s.saved_articles.unshift({ id: n.url, url: n.url, title: n.title });
    saveStore(s); refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><BookOpen className="text-accent" size={24}/> Knowledge Base & Current Affairs</h1>
          <p className="page-subtitle mt-1">Defence and SSB-relevant updates fetched via Tavily, with AI summaries and interview angles.</p>
        </div>
        <button onClick={fetchNews} disabled={loading} className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-2 self-start">
          <RefreshCw size={16} className={loading?"animate-spin":""}/> {loading ? "Refreshing..." : "Refresh news"}
        </button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Sparkles size={18} className="text-accent"/> Latest updates</CardTitle>
            <div className="text-xs text-muted mt-1">Requires server <code className="font-mono">TAVILY_API_KEY</code> (and AI keys for summaries). Results cached in browser storage. Always verify on official sources.</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {msg && <div className="rounded-xl border border-border bg-background/30 p-3 text-sm text-text/90">{msg}</div>}
          {news.map((n:any, i:number)=>(
            <div key={n.id||n.url||i} className="border border-border/80 rounded-xl p-4 text-text space-y-2 bg-background/20 hover:border-border-hover transition-colors">
              <div className="flex items-start justify-between gap-3">
                <a href={n.url} target="_blank" rel="noreferrer" className="font-medium hover:text-accent leading-6">{n.title}</a>
                <a href={n.url} target="_blank" rel="noreferrer" className="shrink-0 text-muted hover:text-accent" aria-label="Open source"><ExternalLink size={16}/></a>
              </div>
              <div className="text-xs text-muted">{n.source||"Source"}{n.published_at ? ` • ${String(n.published_at).slice(0,10)}` : ""}</div>
              {n.summary && <p className="text-sm text-text/90"><span className="text-accent font-medium">AI summary:</span> {n.summary}</p>}
              {Array.isArray(n.interview_angles) && n.interview_angles.length>0 && (
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <div className="text-xs font-medium text-accent mb-1">SSB interview angles</div>
                  <ul className="list-disc pl-5 text-sm text-text/90 space-y-1">{n.interview_angles.slice(0,2).map((q:string,qi:number)=><li key={qi}>{q}</li>)}</ul>
                </div>
              )}
              <button onClick={()=>saveArticle(n)} className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"><Bookmark size={13}/> Save to notebook</button>
            </div>
          ))}
          {!news.length && <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted">No news cached yet. Click <span className="text-text">Refresh news</span> to fetch current affairs (server API keys required).</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved articles</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-text">
          {saved.map((s:any)=>(<div key={s.id||s.url} className="border border-border rounded-xl p-3 flex items-center justify-between gap-3 bg-background/20"><a href={s.url} target="_blank" rel="noreferrer" className="text-text hover:text-accent underline-offset-2 hover:underline truncate">{s.title||s.url}</a><ExternalLink size={14} className="text-muted shrink-0"/></div>))}
          {!saved.length && <p className="text-muted">No saved articles yet. Save useful updates for quick revision and interview prep.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
