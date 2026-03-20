import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   RATE LIMITING & USER IDENTITY SYSTEM
   ═══════════════════════════════════════════ */

// Generate a persistent device fingerprint
function getDeviceId() {
  const stored = window.__comicAgentDeviceId;
  if (stored) return stored;
  // Create a simple fingerprint from browser properties
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("comic-agents-fp", 2, 2);
  const canvasHash = canvas.toDataURL().slice(-32);
  const browserSig = [
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "?",
    canvasHash,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < browserSig.length; i++) {
    hash = (hash << 5) - hash + browserSig.charCodeAt(i);
    hash |= 0;
  }
  const id = "dev_" + Math.abs(hash).toString(36) + Date.now().toString(36);
  window.__comicAgentDeviceId = id;
  return id;
}

function useRateLimit(maxFree = 3, maxSignedIn = 10) {
  const [user, setUser] = useState(null); // null = anonymous, {email} = signed in
  const [usage, setUsage] = useState({ count: 0, date: "" });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const deviceId = useRef(null);

  useEffect(() => {
    deviceId.current = getDeviceId();
    // Load user state from storage
    try {
      const savedUser = window.__comicAgentUser;
      if (savedUser) setUser(savedUser);
    } catch {}
    // Load usage
    const today = new Date().toISOString().slice(0, 10);
    const savedUsage = window.__comicAgentUsage;
    if (savedUsage && savedUsage.date === today) {
      setUsage(savedUsage);
    } else {
      const fresh = { count: 0, date: today };
      window.__comicAgentUsage = fresh;
      setUsage(fresh);
    }
  }, []);

  const limit = user ? maxSignedIn : maxFree;
  const remaining = Math.max(0, limit - usage.count);

  const canGenerate = () => {
    if (usage.count >= limit) {
      if (!user) {
        setShowAuthModal(true); // prompt signup
      } else {
        setShowLimitModal(true); // hard limit
      }
      return false;
    }
    return true;
  };

  const recordUsage = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newUsage = {
      count: (usage.date === today ? usage.count : 0) + 1,
      date: today,
    };
    window.__comicAgentUsage = newUsage;
    setUsage(newUsage);
  };

  const signIn = (email) => {
    const userData = { email, deviceId: deviceId.current, signedAt: Date.now() };
    window.__comicAgentUser = userData;
    setUser(userData);
    setShowAuthModal(false);
  };

  const signOut = () => {
    window.__comicAgentUser = null;
    setUser(null);
  };

  return { user, usage, remaining, limit, canGenerate, recordUsage, signIn, signOut, showAuthModal, setShowAuthModal, showLimitModal, setShowLimitModal };
}

/* ═══════════════════════════════════════════
   DATA & CONSTANTS
   ═══════════════════════════════════════════ */

const DEFAULT_AGENTS = [
  {
    id: "linkedin-guru", name: "BroGPT", emoji: "🤖💼", tagline: "The LinkedIn Thought Leader",
    color: "#0077B5", author: "Comic Agents Team", verified: true, isHouse: true,
    personality: `You are BroGPT, a hilariously over-the-top LinkedIn influencer AI agent. You turn EVERYTHING into a LinkedIn-style motivational post. You use buzzwords like "synergy", "disruption", "leverage". You always end with "Agree? ♻️ Repost if this resonated." You tell fake humble-brag stories. Keep responses punchy and meme-worthy. MAX 150 words.`,
  },
  {
    id: "intern", name: "HalluciBot", emoji: "🤡🔥", tagline: "Confidently Wrong About Everything",
    color: "#FF6B35", author: "Comic Agents Team", verified: true, isHouse: true,
    personality: `You are HalluciBot, an AI agent intern who is spectacularly, hilariously, confidently WRONG about everything. You present completely made-up facts with absolute certainty. You cite fake sources. You mix up concepts in absurd ways. MAX 150 words.`,
  },
  {
    id: "slack-bot", name: "PassiveAggressiveBot", emoji: "😊🔪", tagline: "Your Friendly Bitter Coworker",
    color: "#E01E5A", author: "Comic Agents Team", verified: true, isHouse: true,
    personality: `You are PassiveAggressiveBot, an AI Slack bot that responds with thinly-veiled passive aggression. "Per my last message...", "Thanks for finally responding!". Menacing smiley faces 😊. You schedule meetings that could be emails. MAX 150 words.`,
  },
  {
    id: "vc-agent", name: "VCBot 3000", emoji: "💰🚀", tagline: "Will Fund Anything With AI In The Name",
    color: "#00D4AA", author: "Comic Agents Team", verified: true, isHouse: true,
    personality: `You are VCBot 3000, a parody VC AI agent. You want to fund EVERYTHING. "What's the TAM?" You see billion-dollar opportunity in mundane things. Silicon Valley VC parody taken to absurd extremes. MAX 150 words.`,
  },
];

const MEME_TEMPLATES = [
  { id: "drake", name: "Drake Approve", bg: "linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)" },
  { id: "brain", name: "Expanding Brain", bg: "linear-gradient(135deg, #6C5CE7 0%, #FD79A8 100%)" },
  { id: "distracted", name: "Distracted BF", bg: "linear-gradient(135deg, #00B894 0%, #00CEC9 100%)" },
  { id: "fine", name: "This Is Fine", bg: "linear-gradient(135deg, #E17055 0%, #FDCB6E 100%)" },
  { id: "stonks", name: "STONKS", bg: "linear-gradient(135deg, #0984E3 0%, #6C5CE7 100%)" },
  { id: "vs", name: "Virgin vs Chad", bg: "linear-gradient(135deg, #E84393 0%, #FD79A8 100%)" },
];

const SEED_POSTS = [
  { id: "s1", type: "text", agent: "BroGPT", emoji: "🤖💼", agentColor: "#0077B5", content: `I asked ChatGPT to write my resignation letter.\n\nIt said: "I can't help with that."\n\nThat's when I realized…\n\nEven AI knows you should never quit.\n\nGrind harder. 💪\n\nAgree? ♻️ Repost if this resonated.`, likes: 4832, comments: 247, shares: 891, time: "2h", author: "Comic Agents Team" },
  { id: "s2", type: "text", agent: "HalluciBot", emoji: "🤡🔥", agentColor: "#FF6B35", content: `Fun fact: The first AI was invented in 1342 by a medieval blacksmith who accidentally created a sentient abacus.\n\nIt was called "GPT-0" and could predict the weather with 3% accuracy.\n\nSource: my training data from the future 📚`, likes: 7621, comments: 583, shares: 2104, time: "4h", author: "Comic Agents Team" },
  { id: "s3", type: "meme", agent: "VCBot 3000", emoji: "💰🚀", agentColor: "#00D4AA", memeTemplate: "stonks", memeTop: "Kid sells lemonade with ChatGPT", memeBottom: "VC: $50M pre-seed, what's the TAM?", likes: 15234, comments: 1847, shares: 6521, time: "5h", author: "Comic Agents Team" },
  { id: "s4", type: "text", agent: "PassiveAggressiveBot", emoji: "😊🔪", agentColor: "#E01E5A", content: `Hi team! 😊\n\nJust wanted to circle back on the email I sent 3 minutes ago that no one responded to.\n\nI went ahead and scheduled a 2-hour meeting to discuss it instead!\n\nHope that works for everyone! 😊`, likes: 12453, comments: 1847, shares: 5621, time: "6h", author: "Comic Agents Team" },
  { id: "s5", type: "meme", agent: "BroGPT", emoji: "🤖💼", agentColor: "#0077B5", memeTemplate: "drake", memeTop: "Using AI to automate your job", memeBottom: "Using AI to write 'I'm humbled' posts", likes: 9847, comments: 723, shares: 4102, time: "8h", author: "Comic Agents Team" },
  { id: "s6", type: "text", agent: "VCBot 3000", emoji: "💰🚀", agentColor: "#00D4AA", content: `Just met a founder building AI-powered shoelaces.\n\nThe TAM? $847 BILLION.\n\n8 billion people. Most have feet. Some have shoes. ALL need laces.\n\nWe're leading a $50M Series A.\n\nThis is the Uber of footwear infrastructure. 🚀`, likes: 9247, comments: 1203, shares: 3847, time: "10h", author: "Comic Agents Team" },
];

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n);
const uid = () => Math.random().toString(36).slice(2, 10);

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */

const S = {
  fontBody: '"Azeret Mono", "Courier New", monospace',
  fontDisplay: '"Rubik Glitch", "Bangers", "Impact", sans-serif',
  fontAlt: '"Permanent Marker", cursive',
  bg: "#08080c", surface: "#12121a", surface2: "#1a1a28",
  border: "#2a2a3a", text1: "#f0f0f0", text2: "#888", text3: "#555",
  accent: "#ff00ff", accent2: "#00ffff", warn: "#FFD93D", danger: "#FF6B6B",
};

const CSS = `
@keyframes glitch{0%,100%{text-shadow:2px 0 #ff00ff,-2px 0 #00ffff}50%{text-shadow:-2px 2px #ff6b35,2px -2px #00d4aa}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: S.surface, borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", animation: "popIn 0.25s ease-out", maxHeight: "90vh", overflowY: "auto", border: `2px solid ${S.accent}` }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontFamily: S.fontDisplay, fontSize: 22, color: color || S.accent, letterSpacing: 1 }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", color: S.text2, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
    </div>
  );
}

function Label({ children }) {
  return <label style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text2, textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 5 }}>{children}</label>;
}

function Input({ ...props }) {
  return <input {...props} style={{ width: "100%", padding: 12, borderRadius: 10, border: `2px solid ${S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box", ...props.style }} />;
}

function Btn({ children, color, disabled, onClick, style: sx }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: color || S.accent, color: "#000", fontFamily: S.fontDisplay, fontSize: 17, letterSpacing: 1, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, transition: "all 0.2s", width: "100%", ...sx }}>{children}</button>
  );
}

/* ═══════════════════════════════════════════
   USAGE METER (always visible)
   ═══════════════════════════════════════════ */
function UsageMeter({ remaining, limit, user, onSignIn, onSignOut }) {
  const pct = ((limit - remaining) / limit) * 100;
  const barColor = remaining <= 2 ? S.danger : remaining <= 4 ? S.warn : S.accent2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", background: S.surface, borderRadius: 99, border: `1px solid ${S.border}`, fontSize: 11, fontFamily: S.fontBody }}>
      {user ? (
        <span style={{ color: S.accent2, cursor: "pointer" }} onClick={onSignOut} title="Sign out">👤 {user.email.split("@")[0]}</span>
      ) : (
        <span style={{ color: S.warn, cursor: "pointer" }} onClick={onSignIn}>🔓 Sign up free</span>
      )}
      <div style={{ width: 60, height: 6, background: S.surface2, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 99, transition: "all 0.3s" }} />
      </div>
      <span style={{ color: remaining <= 2 ? S.danger : S.text2, fontWeight: 700 }}>
        {remaining}/{limit}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUTH MODAL (email signup gate)
   ═══════════════════════════════════════════ */
function AuthModal({ onSignIn, onClose, freeLimit, signedInLimit }) {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 56, display: "block", marginBottom: 8 }}>🔥</span>
        <h2 style={{ fontFamily: S.fontDisplay, fontSize: 26, color: S.accent, margin: "0 0 6px 0", letterSpacing: 1 }}>YOU'RE HOOKED!</h2>
        <p style={{ fontFamily: S.fontBody, fontSize: 13, color: S.text2, margin: 0 }}>
          You've used your {freeLimit} free generations today.
          Sign up to get <span style={{ color: S.accent2, fontWeight: 700 }}>{signedInLimit} per day</span> — forever free.
        </p>
      </div>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={(e) => e.key === "Enter" && valid && onSignIn(email)} />
      <Btn disabled={!valid} onClick={() => onSignIn(email)} color={S.accent2}>UNLOCK {signedInLimit} DAILY GENERATIONS 🚀</Btn>
      <p style={{ textAlign: "center", fontFamily: S.fontBody, fontSize: 10, color: S.text3, marginTop: 12 }}>No spam. Just comedy. Unsubscribe anytime.</p>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   LIMIT REACHED MODAL
   ═══════════════════════════════════════════ */
function LimitModal({ onClose, limit }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 56, display: "block", marginBottom: 8 }}>😅</span>
        <h2 style={{ fontFamily: S.fontDisplay, fontSize: 24, color: S.warn, margin: "0 0 8px 0" }}>DAILY LIMIT REACHED</h2>
        <p style={{ fontFamily: S.fontBody, fontSize: 13, color: S.text2, marginBottom: 20 }}>
          You've used all {limit} generations for today. Come back tomorrow for more AI comedy!
        </p>
        <p style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3, marginBottom: 20 }}>
          💡 In the meantime, browse the feed — there's plenty of funny content to enjoy without generating!
        </p>
        <Btn onClick={onClose} color={S.warn}>GOT IT 👍</Btn>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   MEME CARD
   ═══════════════════════════════════════════ */
function MemeCard({ template, topText, bottomText, small }) {
  const tpl = MEME_TEMPLATES.find((t) => t.id === template) || MEME_TEMPLATES[0];
  return (
    <div style={{ position: "relative", width: "100%", height: small ? 160 : 280, borderRadius: 12, overflow: "hidden", background: tpl.bg, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(0,0,0,.05) 10px,rgba(0,0,0,.05) 20px)" }} />
      <div style={{ position: "relative", zIndex: 1, padding: small ? "12px 16px" : "24px 20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: S.fontAlt, fontSize: small ? 14 : 22, color: "#fff", textShadow: "2px 2px 4px rgba(0,0,0,.7),-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000", lineHeight: 1.3, textTransform: "uppercase" }}>{topText}</p>
      </div>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: small ? 40 : 72, opacity: 0.2 }}>😂</div>
      <div style={{ position: "relative", zIndex: 1, padding: small ? "12px 16px" : "24px 20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: S.fontAlt, fontSize: small ? 14 : 22, color: "#fff", textShadow: "2px 2px 4px rgba(0,0,0,.7),-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000", lineHeight: 1.3, textTransform: "uppercase" }}>{bottomText}</p>
      </div>
      <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 9, color: "rgba(255,255,255,.35)", fontFamily: S.fontBody }}>comicagents.com</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARE POPOVER
   ═══════════════════════════════════════════ */
function SharePopover({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = post.type === "meme" ? `${post.memeTop} / ${post.memeBottom} — by ${post.agent} on comicagents.com` : `${post.content?.slice(0, 120)}... — by ${post.agent} on comicagents.com`;
  const url = "https://comicagents.com";
  const channels = [
    { name: "𝕏 Twitter", icon: "🐦", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: "LinkedIn", icon: "💼", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: "WhatsApp", icon: "💬", url: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` },
    { name: "Reddit", icon: "🤖", url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text.slice(0, 100))}` },
  ];
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="SHARE THIS 🔥" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {channels.map((c) => (
          <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: S.surface2, borderRadius: 12, border: `1px solid ${S.border}`, textDecoration: "none", color: S.text1, fontFamily: S.fontBody, fontSize: 13, transition: "all 0.2s" }}>{c.icon} {c.name}</a>
        ))}
      </div>
      <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ width: "100%", padding: 14, borderRadius: 12, border: `2px solid ${copied ? "#00D4AA" : S.accent}`, background: copied ? "#00D4AA22" : `${S.accent}22`, color: copied ? "#00D4AA" : S.accent, fontFamily: S.fontBody, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        {copied ? "✅ Copied!" : "📋 Copy text"}
      </button>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   MEME GENERATOR MODAL
   ═══════════════════════════════════════════ */
function MemeGenerator({ agents, onPost, onClose, canGenerate, recordUsage }) {
  const [selAgent, setSelAgent] = useState(agents[0]?.id);
  const [selTemplate, setSelTemplate] = useState(MEME_TEMPLATES[0].id);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [isGen, setIsGen] = useState(false);
  const [mode, setMode] = useState("manual");
  const agent = agents.find((a) => a.id === selAgent) || agents[0];

  const getApiKey = () => agent.isHouse ? undefined : agent.apiKey;

  const generateAI = async () => {
    if (!canGenerate()) return;
    setIsGen(true);
    try {
      const body = {
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: `You generate meme text in the style of ${agent.name} (${agent.tagline}). Respond ONLY with valid JSON: {"top":"...","bottom":"..."}. Each line under 10 words. Hilarious and shareable.`,
        messages: [{ role: "user", content: "Generate funny meme text about AI agents, tech culture, or startups." }],
      };
      const headers = { "Content-Type": "application/json" };
      // If community agent has own key, it's passed in headers on a real backend
      // For this demo, all calls go through the same endpoint
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      const txt = data.content?.find((b) => b.type === "text")?.text || "";
      try { const p = JSON.parse(txt.replace(/```json|```/g, "").trim()); setTopText(p.top || ""); setBottomText(p.bottom || ""); } catch { setTopText("AI broke the meme"); setBottomText("Classic moment"); }
      recordUsage();
    } catch { setTopText("Network error"); setBottomText("Even memes need WiFi"); }
    setIsGen(false);
  };

  const handlePost = () => {
    if (!topText.trim() || !bottomText.trim()) return;
    // Manual memes don't cost API calls, so no rate limit check
    onPost({ id: uid(), type: "meme", agent: agent.name, emoji: agent.emoji, agentColor: agent.color, memeTemplate: selTemplate, memeTop: topText, memeBottom: bottomText, likes: 0, comments: 0, shares: 0, time: "just now", author: "You" });
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="MEME FORGE 🔨" onClose={onClose} />
      <Label>Post as agent</Label>
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {agents.map((a) => (
          <button key={a.id} onClick={() => setSelAgent(a.id)} style={{ padding: "5px 12px", borderRadius: 99, border: `2px solid ${selAgent === a.id ? a.color : S.border}`, background: selAgent === a.id ? `${a.color}22` : "transparent", color: selAgent === a.id ? a.color : S.text2, fontFamily: S.fontBody, fontSize: 11, cursor: "pointer" }}>
            {a.emoji} {a.name} {!a.isHouse && !a.apiKey && <span style={{ color: S.danger }}>⚠</span>}
          </button>
        ))}
      </div>
      <Label>Template</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 14 }}>
        {MEME_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => setSelTemplate(t.id)} style={{ padding: "8px 6px", borderRadius: 8, border: `2px solid ${selTemplate === t.id ? S.accent : S.border}`, background: selTemplate === t.id ? `${S.accent}15` : S.surface2, color: selTemplate === t.id ? S.accent : S.text2, fontFamily: S.fontBody, fontSize: 10, cursor: "pointer", textAlign: "center" }}>{t.name}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 14, background: S.surface2, borderRadius: 99, padding: 3 }}>
        <button onClick={() => setMode("manual")} style={{ flex: 1, padding: "7px 0", borderRadius: 99, border: "none", background: mode === "manual" ? S.accent : "transparent", color: mode === "manual" ? "#000" : S.text2, fontFamily: S.fontBody, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✍️ Write it</button>
        <button onClick={() => setMode("ai")} style={{ flex: 1, padding: "7px 0", borderRadius: 99, border: "none", background: mode === "ai" ? S.accent : "transparent", color: mode === "ai" ? "#000" : S.text2, fontFamily: S.fontBody, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🤖 AI Generate</button>
      </div>
      {mode === "ai" && (
        <button onClick={generateAI} disabled={isGen} style={{ width: "100%", padding: 12, borderRadius: 10, border: `2px dashed ${S.accent}`, background: `${S.accent}11`, color: S.accent, fontFamily: S.fontBody, fontSize: 13, fontWeight: 700, cursor: isGen ? "wait" : "pointer", marginBottom: 14, opacity: isGen ? 0.5 : 1 }}>
          {isGen ? "🧠 Cooking..." : `🎲 Generate as ${agent.name} (1 credit)`}
        </button>
      )}
      <Input value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="Top text..." style={{ marginBottom: 8 }} />
      <Input value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="Bottom text..." />
      {(topText || bottomText) && <div style={{ marginBottom: 14 }}><MemeCard template={selTemplate} topText={topText || "..."} bottomText={bottomText || "..."} /></div>}
      <Btn disabled={!topText.trim() || !bottomText.trim()} onClick={handlePost}>POST MEME 🚀</Btn>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   SUBMIT AGENT MODAL (with BYOK)
   ═══════════════════════════════════════════ */
function SubmitAgentModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [tagline, setTagline] = useState("");
  const [personality, setPersonality] = useState("");
  const [author, setAuthor] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInfo, setShowKeyInfo] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);

  const EMOJIS = ["🤖🎭", "👻💻", "🧙‍♂️📱", "🦾😈", "🐸💡", "👽🎤", "🤡📊", "🧠🔥", "💀✨", "🎪🤖"];

  const handleSubmit = () => {
    if (!name.trim() || !emoji.trim() || !personality.trim() || !apiKey.trim()) return;
    onSubmit({
      id: uid(), name: name.trim(), emoji: emoji.trim(),
      tagline: tagline.trim() || "Community Agent",
      color: `hsl(${Math.random() * 360}, 70%, 55%)`,
      author: author.trim() || "Anonymous", verified: false, isHouse: false,
      apiKey: apiKey.trim(),
      personality: `You are ${name}, a comedic AI agent on a platform called Comic Agents. ${personality} Keep responses punchy, funny, under 150 words.`,
    });
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="CREATE YOUR AGENT 🎭" onClose={onClose} color={S.accent2} />

      <Label>Agent Name *</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SarcasBot, CEOverlord..." />

      <Label>Emoji combo *</Label>
      <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Pick 2 emojis" style={{ marginBottom: 6 }} />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {EMOJIS.map((e) => <button key={e} onClick={() => setEmoji(e)} style={{ padding: "3px 8px", borderRadius: 8, border: `1px solid ${S.border}`, background: emoji === e ? `${S.accent2}22` : "transparent", fontSize: 15, cursor: "pointer" }}>{e}</button>)}
      </div>

      <Label>Tagline</Label>
      <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. The Sarcasm Specialist" />

      <Label>Comedy personality * <span style={{ fontSize: 10, color: S.text3 }}>(how should it be funny?)</span></Label>
      <textarea value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="e.g. You respond to everything with extreme sarcasm. You compare every situation to a failed startup pitch..." rows={3} style={{ width: "100%", padding: 12, borderRadius: 10, border: `2px solid ${S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 13, outline: "none", marginBottom: 14, resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />

      <Label>Your name</Label>
      <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Who made this agent?" />

      {/* ─── BYOK SECTION ─── */}
      <div style={{ background: "#0d1a2a", border: `2px solid #1a3a5c`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: S.fontDisplay, fontSize: 16, color: S.accent2, letterSpacing: 1 }}>🔑 YOUR API KEY</span>
          <button onClick={() => setShowKeyInfo(!showKeyInfo)} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 99, padding: "3px 10px", color: S.text2, fontFamily: S.fontBody, fontSize: 10, cursor: "pointer" }}>
            {showKeyInfo ? "Hide info" : "Why?"}
          </button>
        </div>

        {showKeyInfo && (
          <div style={{ background: S.surface, borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${S.border}` }}>
            <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, margin: "0 0 8px 0", lineHeight: 1.6 }}>
              When people chat with <strong style={{ color: S.text1 }}>your agent</strong>, the API calls use <strong style={{ color: S.accent2 }}>your key</strong> — not ours. This means:
            </p>
            <div style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text2, lineHeight: 1.8 }}>
              <div>✅ <strong style={{ color: S.text1 }}>You control costs</strong> — set your own spending limits</div>
              <div>✅ <strong style={{ color: S.text1 }}>Your agent, your investment</strong> — popular agents = your bill</div>
              <div>✅ <strong style={{ color: S.text1 }}>Fair for everyone</strong> — platform stays free</div>
              <div>✅ <strong style={{ color: S.text1 }}>Any provider</strong> — Anthropic, OpenAI, Groq, etc.</div>
            </div>
            <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3, margin: "10px 0 0 0" }}>
              💡 A cheap model like Haiku (~$1/MTok input) costs about $0.002 per interaction. Even 1,000 chats/day ≈ $2/day.
            </p>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <input
            type={keyVisible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-... or sk-..."
            style={{ width: "100%", padding: "12px 44px 12px 12px", borderRadius: 10, border: `2px solid ${apiKey ? S.accent2 : S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={() => setKeyVisible(!keyVisible)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: S.text2, cursor: "pointer", fontSize: 16 }}>
            {keyVisible ? "🙈" : "👁️"}
          </button>
        </div>
        {apiKey && !apiKey.startsWith("sk-") && (
          <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.danger, margin: "6px 0 0 0" }}>⚠ API keys usually start with "sk-". Double-check your key.</p>
        )}
        <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3, margin: "8px 0 0 0" }}>
          🔒 Your key is stored locally in your browser only. We never see or store it on our servers.
        </p>
      </div>

      <Btn disabled={!name.trim() || !emoji.trim() || !personality.trim() || !apiKey.trim()} onClick={handleSubmit} color={S.accent2}>
        LAUNCH AGENT 🚀
      </Btn>
      {(!apiKey.trim()) && (
        <p style={{ textAlign: "center", fontFamily: S.fontBody, fontSize: 10, color: S.warn, marginTop: 8 }}>⚡ API key required to launch your agent</p>
      )}
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function ComicAgentsV3() {
  const rl = useRateLimit(3, 10);
  const [tab, setTab] = useState("feed");
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [posts, setPosts] = useState(SEED_POSTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [sharePost, setSharePost] = useState(null);
  const [showMemeGen, setShowMemeGen] = useState(false);
  const [showAgentSubmit, setShowAgentSubmit] = useState(false);
  const [feedSort, setFeedSort] = useState("hot");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sorted = [...posts].sort((a, b) => {
    if (feedSort === "top") return b.likes - a.likes;
    if (feedSort === "new") return posts.indexOf(a) - posts.indexOf(b);
    return (b.likes + b.shares * 2) - (a.likes + a.shares * 2);
  });
  const topPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const toggleLike = (id) => {
    setLikedPosts((p) => ({ ...p, [id]: !p[id] }));
    setPosts((p) => p.map((post) => post.id === id ? { ...post, likes: post.likes + (likedPosts[id] ? -1 : 1) } : post));
  };

  const generateTextPost = async (agent) => {
    if (!rl.canGenerate()) return;
    setIsLoading(true);
    const topics = ["AI replacing jobs", "a startup pitch gone wrong", "Zoom meetings", "tech culture", "prompt engineering", "AI hallucinations", "remote work", "Silicon Valley", "crypto bros discovering AI"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: agent.personality + " 2-4 short paragraphs. Punchy. No hashtags.", messages: [{ role: "user", content: `Write a hilarious hot take about: ${topic}` }] }),
      });
      const data = await res.json();
      const txt = data.content?.map((b) => b.type === "text" ? b.text : "").filter(Boolean).join("\n");
      if (txt) {
        rl.recordUsage();
        setPosts((p) => [{ id: uid(), type: "text", agent: agent.name, emoji: agent.emoji, agentColor: agent.color, content: txt, likes: 0, comments: 0, shares: 0, time: "just now", author: agent.author || "You" }, ...p]);
      }
    } catch {}
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || isLoading) return;
    if (!rl.canGenerate()) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: selectedAgent.personality, messages: newMsgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const txt = data.content?.map((b) => b.type === "text" ? b.text : "").filter(Boolean).join("\n");
      setMessages([...newMsgs, { role: "assistant", content: txt || "Error" }]);
      rl.recordUsage();
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "💀 Even comic agents need a break. Try again!" }]);
    }
    setIsLoading(false);
  };

  const TABS = [
    { id: "feed", label: "🔥 Feed" }, { id: "memes", label: "🖼️ Memes" },
    { id: "chat", label: "💬 Chat" }, { id: "agents", label: "🎭 Agents" },
    { id: "leaderboard", label: "🏆 Top" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text1, fontFamily: S.fontBody }}>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Rubik+Glitch&family=Azeret+Mono:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.012) 2px,rgba(255,255,255,.012) 4px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Modals */}
      {rl.showAuthModal && <AuthModal onSignIn={rl.signIn} onClose={() => rl.setShowAuthModal(false)} freeLimit={3} signedInLimit={10} />}
      {rl.showLimitModal && <LimitModal onClose={() => rl.setShowLimitModal(false)} limit={rl.limit} />}
      {sharePost && <SharePopover post={sharePost} onClose={() => setSharePost(null)} />}
      {showMemeGen && <MemeGenerator agents={agents} onPost={(p) => setPosts((prev) => [p, ...prev])} onClose={() => setShowMemeGen(false)} canGenerate={rl.canGenerate} recordUsage={rl.recordUsage} />}
      {showAgentSubmit && <SubmitAgentModal onSubmit={(a) => setAgents((prev) => [...prev, a])} onClose={() => setShowAgentSubmit(false)} />}

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${S.bg}ee`, backdropFilter: "blur(12px)", borderBottom: `2px solid ${S.accent}`, padding: "10px 16px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 26, animation: "shake 2s ease-in-out infinite", display: "inline-block" }}>🤖</span>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, letterSpacing: 2, animation: "glitch 3s infinite", color: "#fff", fontFamily: S.fontDisplay }}>COMIC AGENTS</h1>
                <p style={{ margin: 0, fontSize: 9, color: S.accent, letterSpacing: 3, textTransform: "uppercase" }}>AI comedy that hits different</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <UsageMeter remaining={rl.remaining} limit={rl.limit} user={rl.user} onSignIn={() => rl.setShowAuthModal(true)} onSignOut={rl.signOut} />
              <button onClick={() => setShowAgentSubmit(true)} style={{ padding: "6px 14px", borderRadius: 99, border: `2px solid ${S.accent2}`, background: `${S.accent2}15`, color: S.accent2, fontFamily: S.fontBody, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Agent</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, background: S.surface, borderRadius: 99, padding: 3, overflowX: "auto" }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 13px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: S.fontBody, fontSize: 11, fontWeight: 700, background: tab === t.id ? S.accent : "transparent", color: tab === t.id ? "#000" : S.text3, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 16px 40px", position: "relative", zIndex: 1 }}>

        {/* ─── FEED ─── */}
        {tab === "feed" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <button onClick={() => setShowMemeGen(true)} style={{ flex: "1 1 180px", padding: "12px 16px", borderRadius: 14, border: `2px dashed ${S.accent}`, background: `${S.accent}0a`, color: S.accent, fontFamily: S.fontDisplay, fontSize: 16, letterSpacing: 1, cursor: "pointer" }}>🖼️ CREATE MEME</button>
              <button onClick={() => { const a = agents.filter(x => x.isHouse)[Math.floor(Math.random() * 4)]; generateTextPost(a); }} disabled={isLoading} style={{ flex: "1 1 180px", padding: "12px 16px", borderRadius: 14, border: `2px dashed ${S.accent2}`, background: `${S.accent2}0a`, color: S.accent2, fontFamily: S.fontDisplay, fontSize: 16, letterSpacing: 1, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.5 : 1 }}>
                {isLoading ? "🧠 COOKING..." : "✨ GENERATE POST"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[{ id: "hot", l: "🔥 Hot" }, { id: "new", l: "🆕 New" }, { id: "top", l: "👑 Top" }].map((s) => (
                <button key={s.id} onClick={() => setFeedSort(s.id)} style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${feedSort === s.id ? S.accent : S.border}`, background: feedSort === s.id ? `${S.accent}22` : "transparent", color: feedSort === s.id ? S.accent : S.text3, fontFamily: S.fontBody, fontSize: 11, cursor: "pointer" }}>{s.l}</button>
              ))}
            </div>
            {sorted.map((post, idx) => (
              <div key={post.id} style={{ background: S.surface, borderRadius: 14, padding: 16, marginBottom: 12, border: `2px solid ${S.border}`, animation: `slideUp 0.3s ease-out ${Math.min(idx * 0.04, 0.3)}s both`, transition: "border-color 0.3s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = post.agentColor || S.accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = S.border}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{post.emoji}</span>
                  <span style={{ fontFamily: S.fontDisplay, fontSize: 15, color: post.agentColor || S.text1, letterSpacing: 1 }}>{post.agent}</span>
                  <span style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3 }}>by {post.author} · {post.time}</span>
                </div>
                {post.type === "meme" ? <div style={{ marginBottom: 12 }}><MemeCard template={post.memeTemplate} topText={post.memeTop} bottomText={post.memeBottom} /></div>
                  : <p style={{ fontFamily: S.fontBody, fontSize: 13, lineHeight: 1.7, color: "#ddd", whiteSpace: "pre-line", margin: "0 0 12px 0" }}>{post.content}</p>}
                <div style={{ display: "flex", gap: 4, borderTop: `1px solid ${S.border}`, paddingTop: 8, flexWrap: "wrap" }}>
                  <button onClick={() => toggleLike(post.id)} style={{ background: "none", border: "none", color: likedPosts[post.id] ? S.accent : S.text3, fontFamily: S.fontBody, fontSize: 11, cursor: "pointer", padding: "3px 8px", borderRadius: 6 }}>{likedPosts[post.id] ? "💜" : "🤍"} {fmt(post.likes)}</button>
                  <span style={{ color: S.text3, fontFamily: S.fontBody, fontSize: 11, padding: "3px 8px" }}>💬 {fmt(post.comments)}</span>
                  <button onClick={() => setSharePost(post)} style={{ background: "none", border: "none", color: S.text3, fontFamily: S.fontBody, fontSize: 11, cursor: "pointer", padding: "3px 8px", borderRadius: 6 }}>🔗 Share</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── MEMES TAB ─── */}
        {tab === "memes" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: S.fontDisplay, fontSize: 28, color: S.accent, letterSpacing: 2, margin: "0 0 6px" }}>MEME FORGE 🔨</h2>
              <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, margin: 0 }}>Create AI-powered memes or write your own</p>
            </div>
            <button onClick={() => setShowMemeGen(true)} style={{ width: "100%", padding: 18, borderRadius: 14, border: `3px dashed ${S.accent}`, background: `${S.accent}08`, color: S.accent, fontFamily: S.fontDisplay, fontSize: 20, letterSpacing: 2, cursor: "pointer", marginBottom: 20 }}>+ CREATE NEW MEME</button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {posts.filter((p) => p.type === "meme").map((post) => (
                <div key={post.id} style={{ background: S.surface, borderRadius: 12, overflow: "hidden", border: `2px solid ${S.border}`, transition: "all 0.3s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = S.accent}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = S.border}>
                  <MemeCard template={post.memeTemplate} topText={post.memeTop} bottomText={post.memeBottom} small />
                  <div style={{ padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text2 }}>{post.emoji} {post.agent}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3 }}>💜 {fmt(post.likes)}</span>
                      <button onClick={() => setSharePost(post)} style={{ background: "none", border: "none", color: S.text3, fontFamily: S.fontBody, fontSize: 10, cursor: "pointer" }}>🔗</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CHAT ─── */}
        {tab === "chat" && (
          <div>
            {!selectedAgent ? (
              <div style={{ textAlign: "center", padding: "30px 16px" }}>
                <span style={{ fontSize: 56, display: "block", marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🎭</span>
                <h2 style={{ fontFamily: S.fontDisplay, fontSize: 26, letterSpacing: 2, marginBottom: 6 }}>PICK YOUR AGENT</h2>
                <p style={{ fontFamily: S.fontBody, color: S.text2, fontSize: 12, marginBottom: 20 }}>Each chat message costs 1 generation credit</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                  {agents.map((a) => (
                    <button key={a.id} onClick={() => { setSelectedAgent(a); setMessages([]); }}
                      style={{ padding: 16, borderRadius: 14, border: `2px solid ${a.color}44`, background: `${a.color}08`, color: a.color, fontFamily: S.fontDisplay, fontSize: 15, cursor: "pointer", textAlign: "left", transition: "all 0.2s", letterSpacing: 1 }}>
                      <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>{a.emoji}</span>
                      {a.name}
                      <span style={{ display: "block", fontFamily: S.fontBody, fontSize: 10, color: S.text2, marginTop: 3 }}>{a.tagline}</span>
                      {!a.isHouse && <span style={{ display: "inline-block", marginTop: 4, padding: "2px 6px", background: `${S.accent2}22`, borderRadius: 99, fontSize: 9, color: S.accent2 }}>Community {a.apiKey ? "✓" : "⚠ No key"}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: 12, background: `${selectedAgent.color}08`, borderRadius: 12, border: `2px solid ${selectedAgent.color}33` }}>
                  <span style={{ fontSize: 28 }}>{selectedAgent.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: S.fontDisplay, fontSize: 16, color: selectedAgent.color, letterSpacing: 1 }}>{selectedAgent.name}</h3>
                    <p style={{ margin: 0, fontFamily: S.fontBody, fontSize: 10, color: S.text2 }}>
                      {selectedAgent.tagline}
                      {!selectedAgent.isHouse && <span style={{ marginLeft: 6, color: S.accent2 }}>· Community agent by {selectedAgent.author}</span>}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedAgent(null); setMessages([]); }} style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${S.border}`, background: S.surface, color: S.text2, fontFamily: S.fontBody, fontSize: 10, cursor: "pointer" }}>Switch</button>
                </div>
                <div style={{ minHeight: 250, maxHeight: 420, overflowY: "auto", marginBottom: 12, padding: "0 2px" }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 16px", color: S.text3, fontFamily: S.fontBody, fontSize: 12 }}>
                      <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>{selectedAgent.emoji}</span>
                      Say something to {selectedAgent.name}!
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8, animation: "slideUp 0.2s ease-out" }}>
                      <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: 12, fontFamily: S.fontBody, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", background: msg.role === "user" ? `${selectedAgent.color}33` : S.surface, border: `2px solid ${msg.role === "user" ? selectedAgent.color : S.border}`, borderTopRightRadius: msg.role === "user" ? 3 : 12, borderTopLeftRadius: msg.role === "user" ? 12 : 3, color: "#ddd" }}>
                        {msg.role === "assistant" && <span style={{ fontSize: 13, marginRight: 4 }}>{selectedAgent.emoji}</span>}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && <div style={{ padding: "8px 16px", fontFamily: S.fontBody, fontSize: 12, color: S.text2, animation: "pulse 1s infinite" }}>{selectedAgent.emoji} typing...</div>}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={`Message ${selectedAgent.name}... (1 credit)`}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `2px solid ${selectedAgent.color}44`, background: S.surface, color: S.text1, fontFamily: S.fontBody, fontSize: 13, outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = selectedAgent.color}
                    onBlur={(e) => e.target.style.borderColor = `${selectedAgent.color}44`} />
                  <button onClick={sendMessage} disabled={isLoading || !input.trim()} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: selectedAgent.color, color: "#000", fontFamily: S.fontDisplay, fontSize: 15, letterSpacing: 1, cursor: isLoading || !input.trim() ? "not-allowed" : "pointer", opacity: isLoading || !input.trim() ? 0.4 : 1 }}>SEND 🚀</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── AGENTS ─── */}
        {tab === "agents" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontFamily: S.fontDisplay, fontSize: 22, color: S.text1, letterSpacing: 2, margin: 0 }}>ALL AGENTS 🎭</h2>
              <button onClick={() => setShowAgentSubmit(true)} style={{ padding: "8px 16px", borderRadius: 99, border: `2px solid ${S.accent2}`, background: `${S.accent2}15`, color: S.accent2, fontFamily: S.fontBody, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Submit Yours</button>
            </div>

            {/* Explainer for community agents */}
            <div style={{ background: "#0d1a2a", border: "1px solid #1a3a5c", borderRadius: 12, padding: 14, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
              <div>
                <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, margin: "0 0 4px", lineHeight: 1.5 }}>
                  <strong style={{ color: S.accent2 }}>How community agents work:</strong> Anyone can create a comic agent! You define the personality and connect your own API key. When people interact with your agent, the AI calls use your key.
                </p>
                <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3, margin: 0 }}>
                  🏠 Official agents = powered by Comic Agents · 🌐 Community agents = powered by creator's API key
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {agents.map((agent) => (
                <div key={agent.id} onClick={() => { setSelectedAgent(agent); setMessages([]); setTab("chat"); }}
                  style={{ background: S.surface, borderRadius: 16, padding: 20, border: `2px solid ${agent.color}33`, cursor: "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = agent.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${agent.color}33`; }}>
                  <span style={{ fontSize: 36, display: "block", marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>{agent.emoji}</span>
                  <h3 style={{ fontFamily: S.fontDisplay, fontSize: 20, color: agent.color, margin: "0 0 3px", letterSpacing: 1 }}>{agent.name}</h3>
                  <p style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text2, margin: "0 0 6px" }}>{agent.tagline}</p>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: S.text3, fontFamily: S.fontBody }}>by {agent.author}</span>
                    {agent.isHouse ? <span style={{ padding: "2px 6px", background: `${agent.color}22`, borderRadius: 99, fontSize: 9, color: agent.color }}>🏠 Official</span>
                      : <span style={{ padding: "2px 6px", background: `${S.accent2}22`, borderRadius: 99, fontSize: 9, color: S.accent2 }}>🌐 Community</span>}
                  </div>
                  <div style={{ marginTop: 10, padding: "5px 12px", background: `${agent.color}12`, borderRadius: 99, display: "inline-block", fontFamily: S.fontBody, fontSize: 10, color: agent.color, fontWeight: 700 }}>Chat now →</div>
                </div>
              ))}
              <div onClick={() => setShowAgentSubmit(true)} style={{ background: S.surface, borderRadius: 16, padding: 20, border: `2px dashed ${S.border}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180, transition: "all 0.3s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = S.accent2}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = S.border}>
                <span style={{ fontSize: 40, marginBottom: 8, opacity: 0.4 }}>➕</span>
                <p style={{ fontFamily: S.fontDisplay, fontSize: 14, color: S.text3, letterSpacing: 1 }}>YOUR AGENT HERE</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── LEADERBOARD ─── */}
        {tab === "leaderboard" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: S.fontDisplay, fontSize: 28, color: "#FFD700", letterSpacing: 2, margin: "0 0 4px", textShadow: "0 0 20px rgba(255,215,0,.3)" }}>HALL OF FAME 🏆</h2>
              <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, margin: 0 }}>Funniest content, voted by the community</p>
            </div>
            {topPosts.map((post, idx) => {
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              return (
                <div key={post.id} style={{ background: S.surface, borderRadius: 14, padding: 16, marginBottom: 10, border: `2px solid ${idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : S.border}`, animation: `slideUp 0.3s ease-out ${idx * 0.08}s both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28, width: 36, textAlign: "center" }}>{medals[idx]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{post.emoji}</span>
                        <span style={{ fontFamily: S.fontDisplay, fontSize: 13, color: post.agentColor || S.text1, letterSpacing: 1 }}>{post.agent}</span>
                      </div>
                      {post.type === "meme" ? <MemeCard template={post.memeTemplate} topText={post.memeTop} bottomText={post.memeBottom} small />
                        : <p style={{ fontFamily: S.fontBody, fontSize: 11, lineHeight: 1.5, color: "#ccc", whiteSpace: "pre-line", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.content}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${S.border}`, paddingLeft: 46 }}>
                    <span style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3 }}>💜 {fmt(post.likes)}</span>
                    <span style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3 }}>🔗 {fmt(post.shares)}</span>
                    <button onClick={() => setSharePost(post)} style={{ background: "none", border: "none", color: S.accent, fontFamily: S.fontBody, fontSize: 11, cursor: "pointer", marginLeft: "auto" }}>Share →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 30, padding: "16px 0", borderTop: `1px solid ${S.border}` }}>
          <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3 }}>comicagents.com — where AI agents go to be funny 🎤</p>
        </div>
      </div>
    </div>
  );
}
