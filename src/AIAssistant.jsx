import React, { useState } from "react";

const KNOWLEDGE_BASE = {
  snakebite: {
    en: "🚨 Immediate Snakebite Protocol: 1. Keep the patient completely calm. 2. Immobilize the bitten limb using a splint or cloth (do not let them walk). 3. Remove rings/bangles before swelling starts. 4. NEVER cut the wound, suck venom, or apply tight tourniquets. 5. Call 108 or rush directly to Tanuku Government Area Hospital (AH Tanuku) or Bhimavaram CHC where 42 ASV vials are stocked.",
    te: "🚨 పాము కాటు తక్షణ అత్యవసర చర్యలు: 1. బాధితుడిని కదలకుండా ప్రశాంతంగా ఉంచండి. 2. కాటు వేసిన భాగాన్ని కట్టెతో కదలకుండా కట్టండి. 3. ఉంగరాలు, గాజులు వెంటనే తీయండి. 4. గాయాన్ని కోయవద్దు లేదా రక్తం పీల్చవద్దు. 5. వెంటనే 108 కు కాల్ చేసి 42 ASV వయల్స్ ఉన్న తణుకు ఏరియా ఆసుపత్రికి లేదా భీమవరం CHCకి తరలించండి."
  },
  polio: {
    en: "👶 Child Polio & Vaccine Advice: Oral Polio Drops (OPV) and Pentavalent vaccines can safely be caught up even if delayed. Visit the nearest Anganwadi centre in Relangi, Tanuku, or Attili on regular immunization days (Wednesday). Always participate in the upcoming Pulse Polio Special Campaign 2026.",
    te: "👶 పోలియో & టీకా సలహా: పోలియో చుక్కలు మరియు ఇతర టీకాలు ఆలస్యమైనప్పటికీ సురక్షితంగా వేయించవచ్చు. ప్రతి బుధవారం రిలంగి, తణుకు లేదా అత్తిలి అంగన్‌వాడీ కేంద్రాలలో టీకాలు వేస్తారు. రాబోయే 2026 పల్స్ పోలియో కార్యక్రమంలో 5 ఏళ్లలోపు పిల్లలందరికీ తప్పకుండా చుక్కల మందు వేయించండి."
  },
  ors: {
    en: "💧 Home ORS Preparation: In 1 litre of clean boiled and cooled drinking water, mix 6 level teaspoons of sugar and half a teaspoon of salt (or 1 full WHO ORS sachet). Give small sips every 10-15 minutes after every loose stool to prevent dehydration shock.",
    te: "💧 ఇంట్లోనే ORS తయారీ: 1 లీటరు కాచి చల్లార్చిన తాగునీటిలో 6 చెంచాల చక్కెర మరియు అర చెంచా ఉప్పు కలపండి (లేదా ఒక పూర్తి WHO ORS ప్యాకెట్). విరేచనం అయిన ప్రతిసారీ కొద్దికొద్దిగా తాగిస్తూ డీహైడ్రేషన్ రాకుండా కాపాడండి."
  },
  chestpain: {
    en: "💔 Chest Pain & Heart Alert: Severe chest pressure radiating to the left arm or jaw with sweating is a medical emergency. Do not give food or water. Call 108 immediately and transfer to Tanuku Government Area Hospital or Bhimavaram CHC equipped with ECG and emergency oxygen.",
    te: "💔 ఛాతీ నొప్పి & గుండె అత్యవసరం: ఛాతీలో తీవ్రమైన నొప్పి, ఎడమ చేయి లేదా దవడకు వ్యాపించడం, చెమటలు పట్టడం గుండెపోటు లక్షణాలు కావచ్చు. రోగికి నీరు లేదా ఆహారం ఇవ్వవద్దు. వెంటనే 108 కు ఫోన్ చేసి తణుకు లేదా భీమవరం ఆసుపత్రికి తరలించండి."
  }
};

export function AIAssistant({ onBack, lang = "en" }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      sender: "ai",
      text: lang === "te"
        ? "నమస్తే! నేను మీ కేర్ లింక్ AI ఆరోగ్య సహాయకుడిని. పాము కాటు, టీకాలు, జ్వరం లేదా ప్రథమ చికిత్స గురించి నన్ను అడగండి."
        : "Namaste! I am your CareLink AI Rural Health Copilot. Ask me about snakebite first-aid, child vaccines, ORS, or hospital care in Tanuku/Relangi."
    }
  ]);
  // speech state

  const samplePrompts = [
    { key: "snakebite", label: lang === "te" ? "🐍 పాము కాటు వేస్తే ఏం చేయాలి?" : "🐍 Snakebite first aid protocol" },
    { key: "polio", label: lang === "te" ? "👶 పోలియో చుక్కలు ఎప్పుడు వేయించాలి?" : "👶 Child polio vaccination advice" },
    { key: "ors", label: lang === "te" ? "💧 ORS ద్రావణం ఎలా తయారు చేయాలి?" : "💧 How to prepare home ORS" },
    { key: "chestpain", label: lang === "te" ? "💔 తీవ్రమైన ఛాతీ నొప్పి వస్తే?" : "💔 Chest pain emergency action" }
  ];

  const handleSend = (textToSend) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMessage = { sender: "user", text: q };
    setChatLog((prev) => [...prev, userMessage]);
    setQuery("");

    // Identify intent
    setTimeout(() => {
      const lower = q.toLowerCase();
      let answer = "";

      if (lower.includes("snake") || lower.includes("పాము") || lower.includes("bite") || lower.includes("కాటు")) {
        answer = KNOWLEDGE_BASE.snakebite[lang === "te" ? "te" : "en"];
      } else if (lower.includes("polio") || lower.includes("పోలియో") || lower.includes("vaccin") || lower.includes("టీకా")) {
        answer = KNOWLEDGE_BASE.polio[lang === "te" ? "te" : "en"];
      } else if (lower.includes("ors") || lower.includes("డయేరియా") || lower.includes("diarrhea") || lower.includes("విరేచన")) {
        answer = KNOWLEDGE_BASE.ors[lang === "te" ? "te" : "en"];
      } else if (lower.includes("chest") || lower.includes("heart") || lower.includes("గుండె") || lower.includes("ఛాతీ")) {
        answer = KNOWLEDGE_BASE.chestpain[lang === "te" ? "te" : "en"];
      } else {
        answer = lang === "te"
          ? "ధన్యవాదాలు. మీ ప్రశ్నకు సమీప తణుకు ఏరియా ఆసుపత్రి లేదా అత్తిలి PHC డాక్టర్‌ను సంప్రదించాలని సూచిస్తున్నాము. అత్యవసరమైతే 108 కు కాల్ చేయండి."
          : "Thank you. For specific clinical diagnosis, please visit Tanuku Area Hospital or Attili 24x7 PHC. For life-threatening trauma or distress, call 108 immediately.";
      }

      setChatLog((prev) => [...prev, { sender: "ai", text: answer }]);
    }, 600);
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
      // onstart
      // onend
      // onerror
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

      {/* Suggested Quick Prompts */}
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

      {/* Chat Messages */}
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
      </div>

      {/* Input Bar */}
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
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
