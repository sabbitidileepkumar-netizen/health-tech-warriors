import React, { useState } from "react";

const translations = {
  en: {
    title: "CareLink AI",
    subtitle: "Your health guidance assistant",
    placeholder: "Describe your health concern...",
    send: "Send",
    listening: "Listening...",
    voice: "Voice",
    back: "Back",
    emergency: "Emergency",
    urgent: "Urgent",
    routine: "Routine",
    selfCare: "Self-care",
    summary: "Summary",
    whatToDo: "What you can do",
    precautions: "Precautions",
    warningSigns: "Warning signs",
    seekCare: "When to seek medical care",
    questions: "Important questions",
    disclaimer: "Health information only — not a medical diagnosis.",
    emergencyHelp:
      "This may require urgent medical attention. Please contact emergency medical services or go to the nearest emergency department.",
    thinking: "CareLink is thinking...",
    error: "Something went wrong. Please try again.",
    welcome:
      "Hello! 👋 Tell me about your health concern. I can provide simple guidance, precautions and warning signs."
  },

  te: {
    title: "CareLink AI",
    subtitle: "మీ ఆరోగ్య మార్గదర్శక సహాయకుడు",
    placeholder: "మీ ఆరోగ్య సమస్యను వివరించండి...",
    send: "పంపండి",
    listening: "వింటోంది...",
    voice: "వాయిస్",
    back: "వెనుకకు",
    emergency: "అత్యవసరం",
    urgent: "త్వరగా వైద్య సహాయం",
    routine: "సాధారణం",
    selfCare: "స్వీయ సంరక్షణ",
    summary: "సారాంశం",
    whatToDo: "మీరు చేయగలవి",
    precautions: "జాగ్రత్తలు",
    warningSigns: "ప్రమాద సూచనలు",
    seekCare: "ఎప్పుడు వైద్య సహాయం తీసుకోవాలి",
    questions: "ముఖ్యమైన ప్రశ్నలు",
    disclaimer:
      "ఇది సాధారణ ఆరోగ్య సమాచారం మాత్రమే — వైద్య నిర్ధారణ కాదు.",
    emergencyHelp:
      "ఇది అత్యవసర వైద్య సహాయం అవసరమైన పరిస్థితి కావచ్చు. వెంటనే అత్యవసర వైద్య సేవలను సంప్రదించండి లేదా సమీప ఆసుపత్రికి వెళ్లండి.",
    thinking: "CareLink ఆలోచిస్తోంది...",
    error: "ఏదో సమస్య వచ్చింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    welcome:
      "నమస్కారం! 👋 మీ ఆరోగ్య సమస్యను చెప్పండి. నేను సులభమైన మార్గదర్శకం, జాగ్రత్తలు మరియు ప్రమాద సూచనలు అందిస్తాను."
  },

  hi: {
    title: "CareLink AI",
    subtitle: "आपका स्वास्थ्य मार्गदर्शन सहायक",
    placeholder: "अपनी स्वास्थ्य समस्या बताएं...",
    send: "भेजें",
    listening: "सुन रहा है...",
    voice: "आवाज़",
    back: "वापस",
    emergency: "आपातकाल",
    urgent: "जल्दी चिकित्सा सहायता",
    routine: "सामान्य",
    selfCare: "स्वयं देखभाल",
    summary: "सारांश",
    whatToDo: "आप क्या कर सकते हैं",
    precautions: "सावधानियां",
    warningSigns: "चेतावनी के संकेत",
    seekCare: "कब चिकित्सा सहायता लें",
    questions: "महत्वपूर्ण प्रश्न",
    disclaimer:
      "यह केवल सामान्य स्वास्थ्य जानकारी है — चिकित्सा निदान नहीं।",
    emergencyHelp:
      "यह स्थिति तुरंत चिकित्सा सहायता की मांग कर सकती है। आपातकालीन चिकित्सा सेवा से संपर्क करें या निकटतम अस्पताल जाएं।",
    thinking: "CareLink सोच रहा है...",
    error: "कुछ गलत हुआ। कृपया फिर से प्रयास करें।",
    welcome:
      "नमस्ते! 👋 अपनी स्वास्थ्य समस्या बताएं। मैं सरल मार्गदर्शन, सावधानियां और चेतावनी संकेत बता सकता हूं।"
  },

  mr: {
    title: "CareLink AI",
    subtitle: "तुमचा आरोग्य मार्गदर्शन सहाय्यक",
    placeholder: "तुमची आरोग्य समस्या सांगा...",
    send: "पाठवा",
    listening: "ऐकत आहे...",
    voice: "आवाज",
    back: "मागे",
    emergency: "आपत्कालीन",
    urgent: "लवकर वैद्यकीय मदत",
    routine: "सामान्य",
    selfCare: "स्वतःची काळजी",
    summary: "सारांश",
    whatToDo: "तुम्ही काय करू शकता",
    precautions: "सावधगिरी",
    warningSigns: "धोक्याची चिन्हे",
    seekCare: "वैद्यकीय मदत कधी घ्यावी",
    questions: "महत्त्वाचे प्रश्न",
    disclaimer:
      "ही फक्त सामान्य आरोग्य माहिती आहे — वैद्यकीय निदान नाही.",
    emergencyHelp:
      "ही परिस्थिती तातडीच्या वैद्यकीय मदतीची गरज दर्शवू शकते. आपत्कालीन वैद्यकीय सेवांशी संपर्क करा किंवा जवळच्या रुग्णालयात जा.",
    thinking: "CareLink विचार करत आहे...",
    error: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    welcome:
      "नमस्कार! 👋 तुमची आरोग्य समस्या सांगा. मी सोपे मार्गदर्शन, सावधगिरी आणि धोक्याची चिन्हे सांगू शकतो."
  }
};

const suggestedQuestions = {
  en: [
    "What should I do for fever?",
    "What are the warning signs of chest pain?",
    "How can I prevent dehydration?",
    "What should I do after an insect bite?"
  ],
  te: [
    "జ్వరం వచ్చినప్పుడు ఏమి చేయాలి?",
    "ఛాతి నొప్పిలో ప్రమాద సూచనలు ఏమిటి?",
    "డీహైడ్రేషన్‌ను ఎలా నివారించాలి?",
    "కీటకం కరిస్తే ఏమి చేయాలి?"
  ],
  hi: [
    "बुखार होने पर क्या करना चाहिए?",
    "सीने में दर्द के चेतावनी संकेत क्या हैं?",
    "डिहाइड्रेशन से कैसे बचें?",
    "कीड़े के काटने पर क्या करना चाहिए?"
  ],
  mr: [
    "ताप आल्यावर काय करावे?",
    "छातीत दुखण्याची धोक्याची चिन्हे कोणती?",
    "डिहायड्रेशन कसे टाळावे?",
    "कीटक चावल्यानंतर काय करावे?"
  ]
};

function getUrgencyInfo(urgency, t) {
  switch (urgency) {
    case "emergency":
      return {
        icon: "🚨",
        label: t.emergency
      };

    case "urgent":
      return {
        icon: "⚠️",
        label: t.urgent
      };

    case "self_care":
      return {
        icon: "🟢",
        label: t.selfCare
      };

    default:
      return {
        icon: "🔵",
        label: t.routine
      };
  }
}

function Section({ icon, title, children }) {
  return (
    <div className="cl-section">
      <div className="cl-section-title">
        <span>{icon}</span>
        <strong>{title}</strong>
      </div>

      <div className="cl-section-content">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="cl-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function AIResponse({ data, t }) {
  const urgency = getUrgencyInfo(data.urgency, t);

  return (
    <div className="cl-response">

      <div className="cl-response-header">
        <div>
          <div className="cl-response-title">
            {data.title || "CareLink"}
          </div>

          <div className="cl-summary">
            {data.summary}
          </div>
        </div>

        <div className={`cl-urgency ${data.urgency}`}>
          {urgency.icon} {urgency.label}
        </div>
      </div>

      {data.urgency === "emergency" && (
        <div className="cl-emergency">
          <div className="cl-emergency-title">
            🚨 {t.emergency}
          </div>

          <div>
            {data.emergencyMessage || t.emergencyHelp}
          </div>
        </div>
      )}

      {data.steps?.length > 0 && (
        <Section icon="💡" title={t.whatToDo}>
          <div className="cl-steps">
            {data.steps.map((step, index) => (
              <div className="cl-step" key={index}>
                <div className="cl-step-icon">
                  {step.icon || "➡️"}
                </div>

                <div>
                  <div className="cl-step-title">
                    {step.title}
                  </div>

                  <div className="cl-step-description">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.precautions?.length > 0 && (
        <Section icon="🛡️" title={t.precautions}>
          <BulletList items={data.precautions} />
        </Section>
      )}

      {data.redFlags?.length > 0 && (
        <Section icon="🔴" title={t.warningSigns}>
          <BulletList items={data.redFlags} />
        </Section>
      )}

      {data.whenToSeekCare && (
        <Section icon="🏥" title={t.seekCare}>
          <p>{data.whenToSeekCare}</p>
        </Section>
      )}

      {data.followUpQuestions?.length > 0 && (
        <Section icon="❓" title={t.questions}>
          <BulletList items={data.followUpQuestions} />
        </Section>
      )}

      <div className="cl-disclaimer">
        ℹ️ {data.disclaimer || t.disclaimer}
      </div>
    </div>
  );
}

export default function AIAssistant({ onBack, lang = "en" }) {
  const t = translations[lang] || translations.en;

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const sendMessage = async (text = query) => {
    const cleanText = text.trim();

    if (!cleanText || loading) return;

    const userMessage = {
      role: "user",
      text: cleanText
    };

    const previousMessages = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      text:
        typeof message.text === "string"
          ? message.text
          : message.data?.summary || ""
    }));

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: cleanText,
          language: lang,
          history: previousMessages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          data
        }
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t.error,
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    const languageMap = {
      en: "en-IN",
      te: "te-IN",
      hi: "hi-IN",
      mr: "mr-IN"
    };

    recognition.lang =
      languageMap[lang] || "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setQuery(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="carelink-ai">

      <style>{`
        .carelink-ai {
          min-height: 100%;
          width: 100%;
          background:
            radial-gradient(
              circle at top right,
              rgba(37, 99, 235, 0.18),
              transparent 35%
            ),
            #061018;
          color: #eef6ff;
          padding: 18px;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .cl-container {
          width: 100%;
          max-width: 900px;
          margin: auto;
          min-height: calc(100vh - 36px);
          display: flex;
          flex-direction: column;
        }

        .cl-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0 18px;
        }

        .cl-back {
          border: 0;
          background: rgba(255,255,255,0.08);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          font-size: 21px;
          cursor: pointer;
        }

        .cl-brand-icon {
          width: 45px;
          height: 45px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          background: linear-gradient(
            135deg,
            #16a34a,
            #0891b2
          );
          font-size: 23px;
        }

        .cl-brand-title {
          font-size: 21px;
          font-weight: 800;
        }

        .cl-brand-subtitle {
          color: #91a6b8;
          font-size: 13px;
          margin-top: 2px;
        }

        .cl-online {
          margin-left: auto;
          font-size: 12px;
          color: #6ee7b7;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cl-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
        }

        .cl-chat {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0 20px;
        }

        .cl-welcome {
          padding: 25px 5px;
          text-align: center;
        }

        .cl-welcome-icon {
          font-size: 50px;
          margin-bottom: 12px;
        }

        .cl-welcome-title {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .cl-welcome-text {
          max-width: 600px;
          margin: auto;
          color: #9db0c1;
          line-height: 1.6;
        }

        .cl-suggestions {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
          max-width: 700px;
          margin: 25px auto;
        }

        .cl-suggestion {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045);
          color: #dcecff;
          border-radius: 15px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
        }

        .cl-suggestion:hover {
          background: rgba(255,255,255,0.09);
          transform: translateY(-1px);
        }

        .cl-message {
          margin-bottom: 16px;
        }

        .cl-user-message {
          display: flex;
          justify-content: flex-end;
        }

        .cl-user-bubble {
          max-width: 80%;
          background: #155e75;
          padding: 13px 16px;
          border-radius: 18px 18px 4px 18px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .cl-response {
          max-width: 850px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 18px;
          margin-right: 10px;
        }

        .cl-response-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
        }

        .cl-response-title {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .cl-summary {
          color: #b5c6d5;
          line-height: 1.55;
        }

        .cl-urgency {
          flex-shrink: 0;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255,255,255,0.08);
        }

        .cl-urgency.emergency {
          background: rgba(239,68,68,0.18);
          color: #fecaca;
        }

        .cl-urgency.urgent {
          background: rgba(245,158,11,0.18);
          color: #fde68a;
        }

        .cl-urgency.self_care {
          background: rgba(34,197,94,0.15);
          color: #bbf7d0;
        }

        .cl-emergency {
          margin-top: 16px;
          padding: 15px;
          border-radius: 16px;
          background: rgba(220,38,38,0.13);
          border: 1px solid rgba(248,113,113,0.25);
          color: #fecaca;
          line-height: 1.55;
        }

        .cl-emergency-title {
          font-weight: 800;
          margin-bottom: 5px;
        }

        .cl-section {
          margin-top: 18px;
          padding-top: 17px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .cl-section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 16px;
          margin-bottom: 11px;
        }

        .cl-section-content {
          color: #c3d1dd;
          line-height: 1.6;
        }

        .cl-steps {
          display: grid;
          gap: 10px;
        }

        .cl-step {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
        }

        .cl-step-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: rgba(255,255,255,0.07);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .cl-step-title {
          font-weight: 700;
          color: #edf7ff;
          margin-bottom: 3px;
        }

        .cl-step-description {
          color: #aebfce;
          font-size: 14px;
        }

        .cl-list {
          margin: 0;
          padding-left: 21px;
        }

        .cl-list li {
          margin-bottom: 7px;
        }

        .cl-disclaimer {
          margin-top: 18px;
          padding: 11px;
          border-radius: 12px;
          background: rgba(255,255,255,0.035);
          color: #8196a8;
          font-size: 12px;
          line-height: 1.5;
        }

        .cl-loading {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #9fb3c3;
          padding: 12px;
        }

        .cl-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: #38bdf8;
          animation: cl-spin 0.8s linear infinite;
        }

        @keyframes cl-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .cl-input-area {
          position: sticky;
          bottom: 0;
          padding-top: 10px;
          background: linear-gradient(
            transparent,
            #061018 25%
          );
        }

        .cl-input-box {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 9px;
          background: #0c1b27;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 19px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }

        .cl-textarea {
          flex: 1;
          min-height: 45px;
          max-height: 130px;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          padding: 11px 8px;
          font-size: 15px;
          font-family: inherit;
        }

        .cl-textarea::placeholder {
          color: #71869a;
        }

        .cl-voice,
        .cl-send {
          width: 45px;
          height: 45px;
          border: 0;
          border-radius: 14px;
          cursor: pointer;
          font-size: 18px;
        }

        .cl-voice {
          background: rgba(255,255,255,0.07);
          color: white;
        }

        .cl-voice.active {
          background: rgba(239,68,68,0.2);
        }

        .cl-send {
          background: #0891b2;
          color: white;
        }

        .cl-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cl-error {
          padding: 13px;
          border-radius: 14px;
          background: rgba(239,68,68,0.1);
          color: #fecaca;
        }

        @media (max-width: 650px) {
          .carelink-ai {
            padding: 10px;
          }

          .cl-container {
            min-height: calc(100vh - 20px);
          }

          .cl-suggestions {
            grid-template-columns: 1fr;
          }

          .cl-response-header {
            flex-direction: column;
          }

          .cl-urgency {
            align-self: flex-start;
          }

          .cl-user-bubble {
            max-width: 90%;
          }

          .cl-response {
            margin-right: 0;
          }

          .cl-brand-subtitle {
            display: none;
          }
        }
      `}</style>

      <div className="cl-container">

        <div className="cl-topbar">

          <button
            className="cl-back"
            onClick={onBack}
            aria-label={t.back}
          >
            ←
          </button>

          <div className="cl-brand-icon">
            🩺
          </div>

          <div>
            <div className="cl-brand-title">
              {t.title}
            </div>

            <div className="cl-brand-subtitle">
              {t.subtitle}
            </div>
          </div>

          <div className="cl-online">
            <span className="cl-online-dot" />
            AI
          </div>

        </div>

        <div className="cl-chat">

          {messages.length === 0 && (
            <div className="cl-welcome">

              <div className="cl-welcome-icon">
                🩺
              </div>

              <div className="cl-welcome-title">
                {t.title}
              </div>

              <div className="cl-welcome-text">
                {t.welcome}
              </div>

              <div className="cl-suggestions">

                {(suggestedQuestions[lang] ||
                  suggestedQuestions.en).map(
                  (question, index) => (
                    <button
                      key={index}
                      className="cl-suggestion"
                      onClick={() =>
                        sendMessage(question)
                      }
                    >
                      💬 {question}
                    </button>
                  )
                )}

              </div>

            </div>
          )}

          {messages.map((message, index) => (
            <div
              className="cl-message"
              key={index}
            >

              {message.role === "user" ? (
                <div className="cl-user-message">
                  <div className="cl-user-bubble">
                    {message.text}
                  </div>
                </div>
              ) : message.error ? (
                <div className="cl-error">
                  ⚠️ {message.text}
                </div>
              ) : (
                <AIResponse
                  data={message.data}
                  t={t}
                />
              )}

            </div>
          ))}

          {loading && (
            <div className="cl-loading">
              <div className="cl-spinner" />
              {t.thinking}
            </div>
          )}

        </div>

        <div className="cl-input-area">

          <div className="cl-input-box">

            <textarea
              className="cl-textarea"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              disabled={loading}
            />

            <button
              className={`cl-voice ${
                listening ? "active" : ""
              }`}
              onClick={startVoiceInput}
              disabled={loading}
              title={
                listening
                  ? t.listening
                  : t.voice
              }
            >
              {listening ? "🔴" : "🎙️"}
            </button>

            <button
              className="cl-send"
              onClick={() => sendMessage()}
              disabled={
                loading || !query.trim()
              }
              title={t.send}
            >
              ➤
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
