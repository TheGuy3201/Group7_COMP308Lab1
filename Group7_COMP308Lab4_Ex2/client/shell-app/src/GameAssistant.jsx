import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Point this at your game-progress microservice GraphQL endpoint
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";

// ─── Hint Category Config ─────────────────────────────────────────────────────
const HINT_CATEGORIES = {
  general:  { label: "General Tip",      color: "#00e676", glow: "#00e67644", icon: "💡" },
  critical: { label: "Critical Warning", color: "#ff1744", glow: "#ff174444", icon: "⚠️" },
  strategy: { label: "Strategy",         color: "#2979ff", glow: "#2979ff44", icon: "🎯" },
  lore:     { label: "Game Lore",        color: "#aa00ff", glow: "#aa00ff44", icon: "📖" },
  system:   { label: "System",           color: "#78909c", glow: "#78909c44", icon: "🤖" },
};

// Derive category from the AI response when backend does not return one explicitly
const inferCategory = (response = "", proactiveSuggestion = null) => {
  if (proactiveSuggestion) return "critical";
  const lower = response.toLowerCase();
  if (/warn|danger|fail|critical|urgent|avoid|don't|do not/.test(lower)) return "critical";
  if (/lore|story|legend|history|world|ancient|secret/.test(lower))       return "lore";
  if (/strategy|combo|burst|cooldown|rotation|tactic|boss/.test(lower))   return "strategy";
  return "general";
};

// ─── GraphQL Queries ──────────────────────────────────────────────────────────
const GAME_AI_QUERY = `
  query GameAIQuery($input: String!) {
    gameAIQuery(input: $input) {
      response
      hints
      alternativeStrategies
      proactiveSuggestion
      failCount
      level
      modelConfidence
      retrievedDocs
      ragEnabled
      category
    }
  }
`;

const PLAYER_PROGRESS_QUERY = `
  query PlayerProgress($userId: ID!) {
    playerProgress(userId: $userId) {
      userId
      username
      level
      experiencePoints
      score
      progress
      achievements {
        id
        name
        unlockedAt
      }
    }
  }
`;

const GAME_HINT_QUERY = `
  query GameHint($level: Int!) {
    gameHint(level: $level)
  }
`;

// ─── GraphQL Fetcher ──────────────────────────────────────────────────────────
const gqlFetch = async (query, variables = {}) => {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
};

// ─── Player Stats Hook — real GraphQL data ────────────────────────────────────
const usePlayerStats = (userId) => {
  const [stats, setStats] = useState({
    level: 1,
    experiencePoints: 0,
    score: 0,
    username: "Player",
    progress: "",
    achievements: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setStatsLoading(false); return; }

    let cancelled = false;

    const fetchStats = async () => {
      try {
        const data = await gqlFetch(PLAYER_PROGRESS_QUERY, { userId });
        if (!cancelled && data?.playerProgress) {
          setStats(data.playerProgress);
        }
      } catch (err) {
        console.warn("[GameAssistant] Could not load player progress:", err.message);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 s so XP / level updates surface automatically
    const interval = setInterval(fetchStats, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return { stats, statsLoading };
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  :root {
    --bg-panel:     rgba(10, 14, 26, 0.94);
    --bg-input:     rgba(255,255,255,0.05);
    --border:       rgba(255,255,255,0.08);
    --text-primary: #e8f4f8;
    --text-muted:   #607d8b;
    --accent:       #00e676;
    --accent2:      #00b0ff;
  }

  .ga-fab {
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #00e676, #00b0ff);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 26px;
    box-shadow: 0 0 24px #00e67688, 0 4px 20px rgba(0,0,0,0.5);
    transition: transform 0.2s, box-shadow 0.2s;
    animation: ga-pulse 3s ease-in-out infinite;
  }
  .ga-fab:hover { transform: scale(1.12); box-shadow: 0 0 40px #00e676aa, 0 4px 30px rgba(0,0,0,.6); }
  @keyframes ga-pulse {
    0%,100% { box-shadow: 0 0 24px #00e67688, 0 4px 20px rgba(0,0,0,.5); }
    50%      { box-shadow: 0 0 44px #00e676cc, 0 4px 30px rgba(0,0,0,.6); }
  }

  .ga-panel {
    position: fixed; bottom: 104px; right: 32px; z-index: 9998;
    width: 420px; max-height: 680px;
    background: var(--bg-panel); border: 1px solid var(--border); border-radius: 20px;
    display: flex; flex-direction: column; overflow: hidden;
    backdrop-filter: blur(28px);
    box-shadow: 0 0 60px rgba(0,0,0,.65), 0 0 1px rgba(0,230,118,.2) inset;
    transform-origin: bottom right;
    animation: ga-open 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  @keyframes ga-open {
    from { opacity:0; transform:scale(0.7) translateY(20px); }
    to   { opacity:1; transform:scale(1)   translateY(0); }
  }

  .ga-header {
    padding: 16px 20px 12px;
    background: linear-gradient(90deg,rgba(0,230,118,.08),rgba(0,176,255,.08));
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }
  .ga-header-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg,#00e676,#00b0ff);
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
  }
  .ga-title   { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; color:var(--accent); letter-spacing:1px; text-transform:uppercase; }
  .ga-subtitle { font-family:'Share Tech Mono',monospace; font-size:10px; color:var(--text-muted); margin-top:1px; }
  .ga-close {
    margin-left: auto; background: none; border: none;
    color: var(--text-muted); font-size: 20px; cursor: pointer;
    padding: 4px; border-radius: 6px; transition: color .15s, background .15s;
  }
  .ga-close:hover { color:#fff; background:rgba(255,255,255,.1); }

  .ga-stats {
    display:flex; gap:10px; padding:10px 16px;
    border-bottom:1px solid var(--border); background:rgba(0,0,0,.2);
  }
  .ga-stat {
    flex:1; background:var(--bg-input); border:1px solid var(--border);
    border-radius:10px; padding:8px 10px; overflow:hidden;
  }
  .ga-stat-label { font-family:'Share Tech Mono',monospace; font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
  .ga-stat-value { font-family:'Orbitron',monospace; font-size:16px; font-weight:700; margin-top:2px; }
  .ga-stat-bar   { height:3px; border-radius:2px; margin-top:6px; background:rgba(255,255,255,.08); overflow:hidden; }
  .ga-stat-fill  { height:100%; border-radius:2px; transition:width 1s cubic-bezier(0.34,1.56,0.64,1); }
  .ga-stat-level .ga-stat-value { color:#ffd740; }
  .ga-stat-level .ga-stat-fill  { background:linear-gradient(90deg,#ff6f00,#ffd740); }
  .ga-stat-xp    .ga-stat-value { color:var(--accent2); }
  .ga-stat-xp    .ga-stat-fill  { background:linear-gradient(90deg,#0091ea,#00b0ff); }
  .ga-stat-score .ga-stat-value { color:#ff6d00; }
  .ga-stat-score .ga-stat-fill  { background:linear-gradient(90deg,#e65100,#ff6d00); }

  .ga-rag-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-family:'Share Tech Mono',monospace; font-size:9px;
    padding:2px 8px; border-radius:20px; margin:0 16px 8px;
    border:1px solid; width:fit-content;
    animation: ga-msg-in 0.4s ease forwards;
  }
  .ga-rag-on  { color:#00e676; border-color:#00e67644; background:#00e67610; }
  .ga-rag-off { color:#607d8b; border-color:#607d8b44; background:transparent; }

  .ga-legend {
    display:flex; flex-wrap:wrap; gap:6px;
    padding:8px 16px; border-bottom:1px solid var(--border);
  }
  .ga-legend-item {
    display:flex; align-items:center; gap:4px;
    font-family:'Share Tech Mono',monospace; font-size:9px;
    color:var(--text-muted); padding:2px 6px; border-radius:4px; border:1px solid;
    transition:transform .15s;
  }
  .ga-legend-item:hover { transform:scale(1.05); }
  .ga-legend-dot { width:6px; height:6px; border-radius:50%; }

  .ga-messages {
    flex:1; overflow-y:auto; padding:14px 16px;
    display:flex; flex-direction:column; gap:10px;
    scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.1) transparent;
  }
  .ga-messages::-webkit-scrollbar { width:4px; }
  .ga-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }

  .ga-msg { display:flex; flex-direction:column; gap:4px; animation:ga-msg-in 0.3s ease forwards; }
  @keyframes ga-msg-in {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ga-msg-user { align-items:flex-end; }
  .ga-msg-ai   { align-items:flex-start; }

  .ga-bubble {
    max-width:90%; padding:10px 14px; border-radius:14px;
    font-family:'Share Tech Mono',monospace; font-size:12px; line-height:1.55;
  }
  .ga-bubble-user {
    background:linear-gradient(135deg,rgba(0,176,255,.25),rgba(0,230,118,.15));
    border:1px solid rgba(0,176,255,.3); color:var(--text-primary);
    border-bottom-right-radius:4px;
  }
  .ga-bubble-ai { border-bottom-left-radius:4px; color:var(--text-primary); }

  .ga-hints { display:flex; flex-wrap:wrap; gap:5px; max-width:90%; margin-top:2px; }
  .ga-hint-pill {
    font-family:'Share Tech Mono',monospace; font-size:10px;
    padding:3px 9px; border-radius:6px; border:1px solid;
    color:var(--text-muted); cursor:default; transition:transform .15s;
  }
  .ga-hint-pill:hover { transform:translateY(-1px); }

  .ga-category-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:9px; font-family:'Orbitron',monospace; font-weight:700;
    padding:2px 7px; border-radius:4px; letter-spacing:.5px;
    text-transform:uppercase; margin-bottom:4px; border:1px solid;
  }

  .ga-confidence { display:flex; align-items:center; gap:6px; max-width:90%; margin-top:2px; }
  .ga-confidence-label { font-family:'Share Tech Mono',monospace; font-size:9px; color:var(--text-muted); white-space:nowrap; }
  .ga-confidence-track { flex:1; height:3px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
  .ga-confidence-fill  { height:100%; border-radius:2px; background:linear-gradient(90deg,#ff6f00,#ffd740,#00e676); transition:width .8s ease; }

  .ga-typing {
    display:flex; align-items:center; gap:5px;
    padding:10px 14px; background:rgba(255,255,255,.04);
    border:1px solid var(--border); border-radius:14px;
    border-bottom-left-radius:4px; width:fit-content;
  }
  .ga-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:ga-blink 1.2s ease-in-out infinite; }
  .ga-dot:nth-child(2) { animation-delay:.2s; background:var(--accent2); }
  .ga-dot:nth-child(3) { animation-delay:.4s; background:#aa00ff; }
  @keyframes ga-blink {
    0%,80%,100% { opacity:.2; transform:scale(.8); }
    40%          { opacity:1;  transform:scale(1.2); }
  }

  .ga-timestamp { font-family:'Share Tech Mono',monospace; font-size:9px; color:var(--text-muted); padding:0 4px; }

  .ga-input-area {
    padding:12px 16px; border-top:1px solid var(--border);
    background:rgba(0,0,0,.2); display:flex; gap:8px; align-items:flex-end;
  }
  .ga-input {
    flex:1; background:var(--bg-input); border:1px solid var(--border);
    border-radius:12px; padding:10px 14px; color:var(--text-primary);
    font-family:'Share Tech Mono',monospace; font-size:12px;
    resize:none; outline:none; max-height:80px; min-height:40px;
    transition:border-color .2s, box-shadow .2s; line-height:1.4;
  }
  .ga-input::placeholder { color:var(--text-muted); }
  .ga-input:focus { border-color:var(--accent); box-shadow:0 0 0 2px rgba(0,230,118,.15); }
  .ga-send {
    width:40px; height:40px; border-radius:10px;
    background:linear-gradient(135deg,#00e676,#00b0ff);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;
    transition:transform .15s, box-shadow .15s; box-shadow:0 0 14px rgba(0,230,118,.4);
  }
  .ga-send:hover:not(:disabled) { transform:scale(1.1); box-shadow:0 0 24px rgba(0,230,118,.6); }
  .ga-send:disabled { opacity:.4; cursor:not-allowed; }
  .ga-clear {
    background:none; border:1px solid var(--border); border-radius:8px;
    padding:6px 10px; color:var(--text-muted);
    font-family:'Share Tech Mono',monospace; font-size:10px; cursor:pointer;
    transition:color .15s, border-color .15s; white-space:nowrap;
  }
  .ga-clear:hover { color:#ff1744; border-color:#ff174466; }

  .ga-suggestions { display:flex; flex-wrap:wrap; gap:6px; padding:0 16px 10px; }
  .ga-suggestion {
    background:rgba(0,230,118,.06); border:1px solid rgba(0,230,118,.2);
    border-radius:8px; padding:4px 10px;
    font-family:'Share Tech Mono',monospace; font-size:10px;
    color:var(--accent); cursor:pointer; transition:background .15s, transform .15s;
  }
  .ga-suggestion:hover { background:rgba(0,230,118,.15); transform:translateY(-1px); }

  @media (max-width:480px) {
    .ga-panel { width:calc(100vw - 24px); right:12px; bottom:88px; }
    .ga-fab   { right:12px; bottom:16px; }
  }
`;

const SUGGESTIONS = [
  "How do I level up faster?",
  "Best strategy for the current boss?",
  "Any hidden secrets nearby?",
  "I keep failing — what should I change?",
];

const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Main Component ───────────────────────────────────────────────────────────
// userId should come from your auth context/store, e.g.:
//   import { useAuth } from "../lib/authContext";
//   const { user } = useAuth();
//   <GameAssistant userId={user?._id} />
export default function GameAssistant({ userId }) {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [ragEnabled, setRagEnabled] = useState(null);

  const { stats, statsLoading } = usePlayerStats(userId);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      category: "system",
      content:
        "ARIA online. I'm your Game Intelligence Assistant. Ask me anything.",
      time: ts(),
    },
  ]);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const levelHintInjected = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Inject a level-specific hint from game-hints.txt once when panel first opens
  useEffect(() => {
    if (!open || levelHintInjected.current || stats.level < 1) return;
    levelHintInjected.current = true;

    let cancelled = false;
    (async () => {
      try {
        const data = await gqlFetch(GAME_HINT_QUERY, { level: stats.level });
        if (cancelled || !data?.gameHint) return;
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            category: "general",
            content: `Level ${stats.level} hint: ${data.gameHint}`,
            hints: [],
            time: ts(),
          },
        ]);
      } catch {
        // Non-critical — silently skip if endpoint not ready
      }
    })();
    return () => { cancelled = true; };
  }, [open, stats.level]);

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: q, time: ts() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await gqlFetch(GAME_AI_QUERY, { input: q });
      const ai   = data?.gameAIQuery;
      if (!ai) throw new Error("Empty response from server.");

      // Prefer explicit category from backend; fall back to heuristic inference
      const category =
        ai.category && HINT_CATEGORIES[ai.category]
          ? ai.category
          : inferCategory(ai.response, ai.proactiveSuggestion);

      setRagEnabled(ai.ragEnabled);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          category,
          content: ai.response,
          hints: ai.hints || [],
          alternativeStrategies: ai.alternativeStrategies || [],
          modelConfidence: ai.modelConfidence,
          time: ts(),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          category: "critical",
          content: `Backend error: ${err.message}. Ensure your game-progress microservice is running at ${GRAPHQL_ENDPOINT}.`,
          hints: [],
          time: ts(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const xpPct    = stats.experiencePoints > 0 ? Math.min(100, Math.round((stats.experiencePoints % 1000) / 10)) : 0;
  const scorePct = stats.score > 0 ? Math.min(100, Math.round((stats.score / 10000) * 100)) : 0;

  return (
    <>
      <style>{styles}</style>

      {/* ── Floating Action Button ── */}
      <button className="ga-fab" onClick={() => setOpen(o => !o)} title="Open Game Assistant">
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="ga-panel">

          {/* Header */}
          <div className="ga-header">
            <div className="ga-header-icon">🤖</div>
            <div>
              <div className="ga-title">ARIA · Game Assistant</div>
              <div className="ga-subtitle">
                {stats.username ? `${stats.username} · ` : ""}GraphQL + LangChain RAG
              </div>
            </div>
            <button className="ga-close" onClick={() => setOpen(false)}>×</button>
          </div>

          {/* Stats — sourced from playerProgress(userId) */}
          <div className="ga-stats">
            <div className="ga-stat ga-stat-level">
              <div className="ga-stat-label">Level</div>
              <div className="ga-stat-value">{statsLoading ? "…" : stats.level}</div>
              <div className="ga-stat-bar">
                <div className="ga-stat-fill" style={{ width: `${(stats.level / 50) * 100}%` }} />
              </div>
            </div>
            <div className="ga-stat ga-stat-xp">
              <div className="ga-stat-label">XP · {xpPct}%</div>
              <div className="ga-stat-value">{statsLoading ? "…" : stats.experiencePoints.toLocaleString()}</div>
              <div className="ga-stat-bar">
                <div className="ga-stat-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div className="ga-stat ga-stat-score">
              <div className="ga-stat-label">Score</div>
              <div className="ga-stat-value">{statsLoading ? "…" : stats.score.toLocaleString()}</div>
              <div className="ga-stat-bar">
                <div className="ga-stat-fill" style={{ width: `${scorePct}%` }} />
              </div>
            </div>
          </div>

          {/* RAG status — shown after first AI response */}
          {ragEnabled !== null && (
            <div className={`ga-rag-badge ${ragEnabled ? "ga-rag-on" : "ga-rag-off"}`}>
              {ragEnabled
                ? "⚡ RAG active — LangChain vector search enabled"
                : "📄 Template mode — RAG unavailable"}
            </div>
          )}

          {/* Legend */}
          <div className="ga-legend">
            {Object.entries(HINT_CATEGORIES)
              .filter(([k]) => k !== "system")
              .map(([key, cfg]) => (
                <div
                  key={key}
                  className="ga-legend-item"
                  style={{ borderColor: cfg.color + "55", color: cfg.color }}
                >
                  <div className="ga-legend-dot" style={{ background: cfg.color }} />
                  {cfg.label}
                </div>
              ))}
          </div>

          {/* Messages */}
          <div className="ga-messages">
            {messages.map((msg) => {
              const cat = HINT_CATEGORIES[msg.category] || HINT_CATEGORIES.general;
              return (
                <div key={msg.id} className={`ga-msg ga-msg-${msg.role}`}>

                  {/* Category badge */}
                  {msg.role === "assistant" && msg.category && msg.category !== "system" && (
                    <div
                      className="ga-category-badge"
                      style={{ color: cat.color, borderColor: cat.color + "55", background: cat.glow }}
                    >
                      {cat.icon} {cat.label}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`ga-bubble ga-bubble-${msg.role}`}
                    style={
                      msg.role === "assistant"
                        ? {
                            border: `1px solid ${cat.color}44`,
                            background: `linear-gradient(135deg, ${cat.glow}, rgba(10,14,26,0.85))`,
                            boxShadow: `0 0 18px ${cat.glow}`,
                          }
                        : {}
                    }
                  >
                    {msg.content}
                  </div>

                  {/* Retrieved hint pills from LangChain RAG */}
                  {msg.hints?.length > 0 && (
                    <div className="ga-hints">
                      {msg.hints.map((h, i) => (
                        <div
                          key={i}
                          className="ga-hint-pill"
                          title={h}
                          style={{ borderColor: cat.color + "33", background: cat.glow }}
                        >
                          {h.length > 52 ? h.slice(0, 52) + "…" : h}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TensorFlow model confidence bar */}
                  {msg.role === "assistant" && typeof msg.modelConfidence === "number" && (
                    <div className="ga-confidence">
                      <span className="ga-confidence-label">
                        Confidence {Math.round(msg.modelConfidence * 100)}%
                      </span>
                      <div className="ga-confidence-track">
                        <div
                          className="ga-confidence-fill"
                          style={{ width: `${msg.modelConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="ga-timestamp">{msg.time}</div>
                </div>
              );
            })}

            {loading && (
              <div className="ga-msg ga-msg-ai">
                <div className="ga-typing">
                  <div className="ga-dot" /><div className="ga-dot" /><div className="ga-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick-start suggestions — visible until conversation picks up */}
          {!loading && messages.length <= 3 && (
            <div className="ga-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="ga-suggestion" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ga-input-area">
            <textarea
              ref={textareaRef}
              className="ga-input"
              placeholder="Ask ARIA anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className="ga-clear"
              onClick={() => setMessages(prev => [prev[0]])}
              title="Clear history"
            >
              Clear
            </button>
            <button
              className="ga-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}