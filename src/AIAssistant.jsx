import React, { useState } from "react";

// PASTE YOUR GEMINI API KEY BELOW (between the quotes)
const GEMINI_API_KEY = "AQ.Ab8RN6IXVpfeM4FqDt22PZYtiOGAHbjIiEpL0t8Vv6pMS5j-6g";

export function AIAssistant({ onBack, lang = "en" }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      sender: "ai",
      text: lang === "te"
        ? "నమస్తే! నేను మీ కేర్ లింక్ AI ఆరోగ్య సహాయకుడిని. పాము కాటు, టీకాలు, జ్వరం లేదా ప్రథమ చికిత్స గురించి నన్ను అడగండి."
        : "Namaste! I am your CareLink AI Rural Health Copilot. Ask me about snakebite first-aid, child vaccines, ORS, or hospital care in Tanuku/Relangi."
    }
  ]);

  const samplePrompts = [
    { key: "snakebite", label: lang === "te" ? "🐍 పాము కాటు వేస్తే ఏం చేయాలి?" : "🐍 Snakebite first aid protocol" },
    { key: "polio", label: lang === "te" ? "👶 పోలియో చుక్కలు ఎప్పుడు వేయించాలి?" : "👶 Child polio vaccination advice" },
    { key: "ors", label: lang === "te" ? "💧 ORS ద్రావణం ఎలా తయారు చేయాలి?" : "💧 How to prepare home ORS" },
    { key: "chestpain", label: lang === "te" ? "💔 తీవ్రమైన ఛాతీ నొప్పి వస్తే?" : "💔 Chest pain emergency action" }
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim() || isLoading) return;

    const userMessage = { sender: "user", text: q };
    setChatLog((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    const systemContext = lang === "te"
      ? "మీరు గ్రామీణ భారతదేశంలోని పశ్చిమ గోదావరి జిల్లాలో పనిచేసే ఆశా హెల్త్ వర్కర్ల కోసం ఒక సహాయక AI. తెలుగులో సూటిగా, స్పష్టంగా, స్వల్ప వాక్యాలలో సమాధానం ఇవ్వండి. ఇది వైద్య నిర్ధారణ కాదు, ప్రాథమిక సమాచారం మాత్రమే అని గుర్తుంచుకోండి. తీవ్రమైన పరిస్థితుల్లో 108కి కాల్ చేయమని చెప్పండి."
      : "You are a helpful AI assistant for ASHA health workers in rural West Godavari, India. Answer clearly and concisely in plain language. This is general guidance only, not a medical diagnosis. For serious/emergency symptoms, always advise calling 108 or visiting the nearest hospital.";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemContext + "\n\nQuestion: " + q }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "te"
          ? "క్షమించండి, సమాధానం రాబట్టడంలో సమస్య వచ్చింది. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా 108కి కాల్ చేయండి."
          : "Sorry, I had trouble getting a response. Please try again or call 108 for emergencies.");

      setChatLog((prev) => [...prev, { sender: "ai", text: aiText }]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: lang === "te"
            ? "నెట్‌వర్క్ సమస్య వచ్చింది. దయచేసి కనెక్షన్ చెక్ చేసి మళ్ళీ ప్రయత్నించండి."
            : "Network error. Please check your connection and try again."
        }
      ]);
    }

    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      setQuery(randomPrompt.label);
      handleSend(randomPrompt.label);
    }, 2000);
  };

  const handleSpeakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "te" ? "te-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported on this browser.");
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#F3E8FF", color: "#7E22CE" }}>AI Multilingual Health Bot</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #7E22CE 0%, #581C87 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🤖</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "కేర్ లింక్ AI ఆరోగ్య సహాయకుడు" : "CareLink AI Rural Health Copilot"}
            </h1>
            <p style={{ color: "#F3E8FF", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "వాయిస్ లేదా మెసేజ్ ద్వారా వైద్య సందేహాలను అడగండి - మాట్లాడి వినిపిస్తుంది"
                : "Voice & text assistant calibrated with local PHC protocols & emergency guidance"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label style={{ fontSize: "12px", color: "#64748B", fontWeight: "bold" }}>
          {lang === "te" ? "త్వరిత ప్రశ్నలు:" : "Suggested Questions:"}
        </label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginTop: "4px" }}>
          {samplePrompts.map((p) => (
            <button
              key={p.key}
              onClick={() => handleSend(p.label)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                backgroundColor: "#FAF5FF",
                color: "#7E22CE",
                border: "1px solid #D8B4FE",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", maxHeight: "420px", overflowY: "auto" }}>
        {chatLog.map((msg, idx) => {
          const isAI = msg.sender === "ai";
          return (
            <div
              key={idx}
              style={{
                alignSelf: isAI ? "flex-start" : "flex-end",
                maxWidth: "85%",
                background: isAI ? "#FFFFFF" : "#7E22CE",
                color: isAI ? "#1E293B" : "white",
                padding: "12px 14px",
                borderRadius: "14px",
                boxShadow: "var(--shadow-sm)",
                border: isAI ? "1.5px solid var(--border)" : "none",
                fontSize: "13px",
                lineHeight: "1.5"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontWeight: "bold", fontSize: "11px", opacity: 0.8 }}>
                  {isAI ? "🤖 CareLink AI" : "👤 You"}
                </span>
                {isAI && (
                  <button
                    onClick={() => handleSpeakText(msg.text)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "0 4px"
                    }}
                    title="Read Aloud (Voice)"
                  >
                    🔊
                  </button>
                )}
              </div>
              <div>{msg.text}</div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", fontSize: "13px", color: "#7E22CE", padding: "8px" }}>
            🤖 Thinking...
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={handleVoiceInput}
          className={"mic-circle-btn " + (isListening ? "listening" : "")}
          style={{ width: "46px", height: "46px", margin: 0, fontSize: "20px" }}
          title="Tap to speak in Telugu or English"
        >
          {isListening ? "🔴" : "🎙️"}
        </button>

        <input
          type="text"
          placeholder={lang === "te" ? "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి..." : "Type your health concern or tap mic..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1, margin: 0 }}
        />

        <button
          onClick={() => handleSend()}
          className="btn-primary"
          style={{ background: "#7E22CE", width: "auto", padding: "10px 16px" }}
          disabled={isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
