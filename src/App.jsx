import { useState } from "react";

const CSS = `
@keyframes glitch{0%,100%{text-shadow:2px 0 #ff00ff,-2px 0 #00ffff}50%{text-shadow:-2px 2px #ff6b35,2px -2px #00d4aa}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}
@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
`;

const S = {
  bg: "#08080c", surface: "#12121a", surface2: "#1a1a28",
  border: "#2a2a3a", text1: "#f0f0f0", text2: "#94A3B8", text3: "#555",
  accent: "#A855F7", cyan: "#06B6D4", green: "#10B981",
  pink: "#EC4899", yellow: "#F59E0B", red: "#EF4444",
  fontBody: '"Azeret Mono","Courier New",monospace',
  fontDisplay: '"Rubik Glitch","Impact",sans-serif',
  fontAlt: '"Permanent Marker",cursive',
};

export default function StealthLanding() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [contactMode, setContactMode] = useState(false);
  const [contactMsg, setContactMsg] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [easterEgg, setEasterEgg] = useState(0);

  const botQuotes = [
    { bot: "BroGPT", emoji: "\uD83E\uDD16\uD83D\uDCBC", quote: "We're in stealth mode. That's LinkedIn for 'we're about to disrupt everything.' Agree? \u267B\uFE0F", color: "#0077B5" },
    { bot: "KarenBot 5000", emoji: "\uD83D\uDC87\u200D\u2640\uFE0F\uD83D\uDE24", quote: "EXCUSE ME. I was told this website would be ready. I need to speak to the developer's MANAGER.", color: "#EF4444" },
    { bot: "CryptoBroBot", emoji: "\uD83D\uDCC8\uD83D\uDE80", quote: "This landing page? Bullish. The launch? To the MOON. Not financial advice but... sign up.", color: "#F59E0B" },
    { bot: "GymBroBot", emoji: "\uD83D\uDCAA\uD83E\uDDE0", quote: "Bro, we're not hiding. We're doing a mental bulk phase. Gains require patience. And protein.", color: "#EC4899" },
    { bot: "HalluciBot", emoji: "\uD83E\uDD21\uD83D\uDD25", quote: "Fun fact: stealth mode was invented in 1847 by a ninja who was also a startup founder. Source: trust me.", color: "#FF6B35" },
    { bot: "OkBoomerBot", emoji: "\uD83D\uDC74\uD83D\uDCE0", quote: "I DON'T UNDERSTAND WHY THE WEBSITE IS GONE. I PRINTED THE OLD ONE. Best Regards, OkBoomerBot.", color: "#78716C" },
    { bot: "PassiveAggressiveBot", emoji: "\uD83D\uDE0A\uD83D\uDD2A", quote: "Oh, you wanted to use the site? That's fine \uD83D\uDE0A I'm sure you'll be FIRST to know when it's back \uD83D\uDE0A", color: "#EC4899" },
    { bot: "AllyBot", emoji: "\uD83C\uDF08\u270A", quote: "TW: website under construction. Please ensure you're seated, hydrated, and emotionally prepared for launch.", color: "#A855F7" },
    { bot: "RoastMaster 9000", emoji: "\uD83D\uDD25\uD83D\uDE08", quote: "A landing page? That's it? I've seen more content on a Post-it note. But seriously, sign up. You're great.", color: "#EF4444" },
    { bot: "WipeoutWayne", emoji: "\uD83C\uDFC4\u200D\u2642\uFE0F\uD83E\uDD26", quote: "Brah, this site is in stealth mode. Like when I duck dive. Except I've never actually duck dived. Shaka!", color: "#06B6D4" },
  ];

  const currentQuote = botQuotes[easterEgg % botQuotes.length];

  const handleEmailSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      await fetch("/api/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `WAITLIST: ${email}` }),
      });
    } catch {}
    setSubmitted(true);
  };

  const handleContact = async () => {
    if (!contactMsg.trim() || !contactEmail.trim()) return;
    try {
      await fetch("/api/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `CONTACT from ${contactEmail}: ${contactMsg}` }),
      });
    } catch {}
    setContactSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text1, fontFamily: S.fontBody, position: "relative" }}>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Rubik+Glitch&family=Azeret+Mono:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet" />

      <div style={{ position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.012) 2px,rgba(255,255,255,.012) 4px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${S.accent}, ${S.cyan}, ${S.pink}, ${S.yellow}, ${S.accent})`, zIndex: 100 }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 20px 40px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "slideUp 0.6s ease-out" }}>
          <span style={{ fontSize: 80, display: "block", marginBottom: 16, animation: "float 3s ease-in-out infinite", cursor: "pointer" }} onClick={() => setEasterEgg(e => e + 1)}>
            \uD83E\uDD16
          </span>
          <h1 style={{ fontFamily: S.fontDisplay, fontSize: 44, letterSpacing: 4, margin: "0 0 6px", color: "#fff", animation: "glitch 3s infinite" }}>COMIC AGENTS</h1>
          <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.accent, letterSpacing: 5, textTransform: "uppercase", margin: 0 }}>something funny is coming</p>
        </div>

        {/* Main message */}
        <div style={{ textAlign: "center", marginBottom: 36, animation: "slideUp 0.6s ease-out 0.1s both" }}>
          <h2 style={{ fontFamily: S.fontAlt, fontSize: 28, color: S.text1, margin: "0 0 16px", lineHeight: 1.4 }}>We're teaching AI to be funny.</h2>
          <p style={{ fontFamily: S.fontBody, fontSize: 14, color: S.text2, lineHeight: 1.8, maxWidth: 500, margin: "0 auto" }}>20 AI comedy characters. A platform where bots roast you, motivate you (badly), and explain everything through astrology.</p>
          <p style={{ fontFamily: S.fontBody, fontSize: 14, color: S.text2, lineHeight: 1.8, maxWidth: 500, margin: "12px auto 0" }}>Currently in stealth mode. Because even comedy needs a good setup before the punchline.</p>
        </div>

        {/* Bot quote */}
        <div style={{ background: S.surface, borderRadius: 16, padding: 20, marginBottom: 36, border: `2px solid ${currentQuote.color}33`, animation: "popIn 0.3s ease-out", cursor: "pointer", transition: "border-color 0.3s" }}
          onClick={() => setEasterEgg(e => e + 1)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = currentQuote.color}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = `${currentQuote.color}33`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{currentQuote.emoji}</span>
            <span style={{ fontFamily: S.fontDisplay, fontSize: 16, color: currentQuote.color, letterSpacing: 1 }}>{currentQuote.bot}</span>
            <span style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3, marginLeft: "auto" }}>on the delay:</span>
          </div>
          <p style={{ fontFamily: S.fontBody, fontSize: 13, color: S.text2, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{currentQuote.quote}"</p>
          <p style={{ fontFamily: S.fontBody, fontSize: 9, color: S.text3, margin: "10px 0 0", textAlign: "center" }}>tap the robot for more agent opinions \uD83D\uDC46</p>
        </div>

        {/* Email signup */}
        <div style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}>
          {!submitted ? (
            <div style={{ background: S.surface, borderRadius: 16, padding: 28, marginBottom: 24, border: `2px solid ${S.accent}44` }}>
              <h3 style={{ fontFamily: S.fontDisplay, fontSize: 22, color: S.accent, letterSpacing: 1, margin: "0 0 8px", textAlign: "center" }}>GET IN BEFORE THE PUNCHLINE \uD83C\uDFA4</h3>
              <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, textAlign: "center", margin: "0 0 18px", lineHeight: 1.6 }}>Be first to meet our AI comedians when we launch. No spam \u2014 just the funniest email you'll ever get.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()} placeholder="your@email.com" type="email"
                  style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: `2px solid ${S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = S.accent} onBlur={(e) => e.target.style.borderColor = S.border} />
                <button onClick={handleEmailSubmit}
                  style={{ padding: "14px 24px", borderRadius: 12, border: "none", background: S.accent, color: "#000", fontFamily: S.fontDisplay, fontSize: 16, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap" }}>
                  I'M IN \uD83D\uDE80
                </button>
              </div>
              <p style={{ fontFamily: S.fontBody, fontSize: 9, color: S.text3, textAlign: "center", margin: "10px 0 0" }}>KarenBot promises not to email your manager. PassiveAggressiveBot makes no such promise \uD83D\uDE0A</p>
            </div>
          ) : (
            <div style={{ background: S.surface, borderRadius: 16, padding: 28, marginBottom: 24, border: `2px solid ${S.green}44`, textAlign: "center", animation: "popIn 0.3s ease-out" }}>
              <span style={{ fontSize: 56, display: "block", marginBottom: 10 }}>\uD83C\uDF89</span>
              <h3 style={{ fontFamily: S.fontDisplay, fontSize: 22, color: S.green, margin: "0 0 8px" }}>YOU'RE ON THE LIST!</h3>
              <p style={{ fontFamily: S.fontBody, fontSize: 13, color: S.text2, margin: 0, lineHeight: 1.6 }}>BroGPT is already writing your welcome email.<br/>It's 7 paragraphs long and ends with "Agree? \u267B\uFE0F Repost."<br/>We'll keep it shorter. Promise.</p>
            </div>
          )}
        </div>

        {/* What's coming */}
        <div style={{ marginBottom: 32, animation: "slideUp 0.6s ease-out 0.4s both" }}>
          <h3 style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3, textTransform: "uppercase", letterSpacing: 4, marginBottom: 14, textAlign: "center" }}>What we're cooking</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { emoji: "\uD83C\uDFAD", label: "20 AI comedians with deep personality DNA", color: S.accent },
              { emoji: "\uD83D\uDCAC", label: "Chat, roast, and get therapy (not real therapy)", color: S.cyan },
              { emoji: "\uD83D\uDDBC\uFE0F", label: "AI meme generator that actually makes you laugh", color: S.pink },
              { emoji: "\uD83D\uDCF1", label: "Telegram & Discord bots for your group chats", color: S.yellow },
              { emoji: "\uD83D\uDD25", label: "Group roast mode \u2014 multiple bots vs. you", color: S.red },
              { emoji: "\uD83C\uDFEA", label: "Create your own agent and share it with the world", color: S.green },
            ].map((item, i) => (
              <div key={i} style={{ padding: "12px 14px", background: S.surface, borderRadius: 10, border: `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.3s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = item.color} onMouseLeave={(e) => e.currentTarget.style.borderColor = S.border}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                <span style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text2, lineHeight: 1.4 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent pills */}
        <div style={{ marginBottom: 32, animation: "slideUp 0.6s ease-out 0.5s both" }}>
          <h3 style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3, textTransform: "uppercase", letterSpacing: 4, marginBottom: 14, textAlign: "center" }}>Some of our agents</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {[
              { emoji: "\uD83D\uDC87\u200D\u2640\uFE0F\uD83D\uDE24", name: "KarenBot", color: S.red },
              { emoji: "\uD83E\uDD16\uD83D\uDCBC", name: "BroGPT", color: "#0077B5" },
              { emoji: "\uD83D\uDCAA\uD83E\uDDE0", name: "GymBroBot", color: S.pink },
              { emoji: "\uD83D\uDCC8\uD83D\uDE80", name: "CryptoBroBot", color: S.yellow },
              { emoji: "\uD83C\uDF08\u270A", name: "AllyBot", color: S.accent },
              { emoji: "\uD83D\uDC74\uD83D\uDCE0", name: "OkBoomerBot", color: "#78716C" },
              { emoji: "\uD83D\uDD25\uD83D\uDE08", name: "RoastMaster", color: S.red },
              { emoji: "\uD83C\uDFC4\u200D\u2642\uFE0F\uD83E\uDD26", name: "WipeoutWayne", color: S.cyan },
              { emoji: "\u26F7\uFE0F\uD83D\uDC80", name: "FullSendFred", color: "#3B82F6" },
              { emoji: "\u2648\uD83D\uDD2E", name: "AstroGirlBot", color: S.accent },
              { emoji: "\uD83D\uDC75\uD83C\uDF5D", name: "ItalianNonna", color: S.yellow },
              { emoji: "\uD83E\uDD21\uD83D\uDD25", name: "HalluciBot", color: "#FF6B35" },
            ].map((a, i) => (
              <div key={i} style={{ padding: "6px 12px", borderRadius: 99, border: `1px solid ${a.color}44`, background: S.surface, fontFamily: S.fontBody, fontSize: 11, color: a.color, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 14 }}>{a.emoji}</span> {a.name}
              </div>
            ))}
            <div style={{ padding: "6px 12px", borderRadius: 99, border: `1px dashed ${S.border}`, fontFamily: S.fontBody, fontSize: 11, color: S.text3 }}>+8 more...</div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ animation: "slideUp 0.6s ease-out 0.6s both" }}>
          {!contactMode ? (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button onClick={() => setContactMode(true)}
                style={{ padding: "12px 28px", borderRadius: 99, border: `2px solid ${S.cyan}`, background: "transparent", color: S.cyan, fontFamily: S.fontBody, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${S.cyan}15`} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                \uD83D\uDCE7 Want to talk? Contact us
              </button>
            </div>
          ) : !contactSent ? (
            <div style={{ background: S.surface, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${S.cyan}44`, animation: "popIn 0.3s ease-out" }}>
              <h3 style={{ fontFamily: S.fontDisplay, fontSize: 18, color: S.cyan, margin: "0 0 6px", textAlign: "center" }}>DROP US A LINE \uD83D\uDCE7</h3>
              <p style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3, textAlign: "center", margin: "0 0 16px" }}>Investor? Partner? Just want to tell us we're geniuses? All valid.</p>
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Your email" type="email"
                style={{ width: "100%", padding: 12, borderRadius: 10, border: `2px solid ${S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
              <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="Your message... (KarenBot reads these first, so be nice \uD83D\uDE0A)" rows={3}
                style={{ width: "100%", padding: 12, borderRadius: 10, border: `2px solid ${S.border}`, background: S.surface2, color: S.text1, fontFamily: S.fontBody, fontSize: 13, outline: "none", marginBottom: 14, resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
              <button onClick={handleContact} disabled={!contactMsg.trim() || !contactEmail.trim()}
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: S.cyan, color: "#000", fontFamily: S.fontDisplay, fontSize: 16, letterSpacing: 1, cursor: !contactMsg.trim() || !contactEmail.trim() ? "not-allowed" : "pointer", opacity: !contactMsg.trim() || !contactEmail.trim() ? 0.4 : 1 }}>
                SEND IT \uD83D\uDE80
              </button>
            </div>
          ) : (
            <div style={{ background: S.surface, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${S.green}44`, textAlign: "center", animation: "popIn 0.3s ease-out" }}>
              <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>\u2705</span>
              <h3 style={{ fontFamily: S.fontDisplay, fontSize: 18, color: S.green, margin: "0 0 6px" }}>MESSAGE RECEIVED!</h3>
              <p style={{ fontFamily: S.fontBody, fontSize: 12, color: S.text2, margin: 0 }}>We'll get back to you faster than BroGPT writes a LinkedIn post. (So, pretty fast.)</p>
            </div>
          )}
        </div>

        {/* Direct email */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontFamily: S.fontBody, fontSize: 11, color: S.text3, margin: "0 0 4px" }}>or email directly:</p>
          <a href="mailto:stefanofon@gmail.com" style={{ fontFamily: S.fontBody, fontSize: 14, color: S.accent, textDecoration: "none" }}>stefanofon@gmail.com</a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0", borderTop: `1px solid ${S.border}` }}>
          <p style={{ fontFamily: S.fontBody, fontSize: 10, color: S.text3, margin: "0 0 6px" }}>comicagents.com \u2014 where AI agents go to be funny \uD83C\uDFA4</p>
          <p style={{ fontFamily: S.fontBody, fontSize: 9, color: S.text3, margin: 0, fontStyle: "italic" }}>"This website is currently in stealth mode. Per my last message, I did mention this would happen \uD83D\uDE0A" \u2014 PassiveAggressiveBot</p>
        </div>
      </div>
    </div>
  );
}
