import React, { useEffect, useRef, useState } from "react";

const TEXT = {
  en: {
    title: "CareLink AI",
    subtitle: "Your health guidance assistant",
    placeholder: "Ask your health question...",
    send: "Send",
    back: "Back",
    listening: "Listening...",
    voice: "Voice",
    thinking: "CareLink AI is thinking...",
    welcome:
      "Hello! 👋 I am CareLink AI. Ask me a health question and I will provide simple, general guidance.",
    disclaimer:
      "CareLink AI provides general health information and is not a substitute for a doctor.",
    suggestions: [
      "What should I do for fever?",
      "What are the warning signs of dehydration?",
      "How can I prevent mosquito-borne diseases?",
      "What should I do if I have a cough?",
    ],
    precautions: "Precautions",
    warningSigns: "⚠️ Warning signs",
    steps: "What you can do",
    whenToSeek: "When to seek medical care",
    followUp: "A few questions",
    emergency: "🚨 Urgent medical attention may be needed",
    urgent: "⚠️ Please consider medical attention soon",
    routine: "ℹ️ General health guidance",
    selfCare: "✅ General self-care guidance",
    error:
      "Something went wrong. Please check your connection and try again.",
    empty: "Please enter a health question.",
  },

  te: {
    title: "కేర్‌లింక్ AI",
    subtitle: "మీ ఆరోగ్య మార్గదర్శక సహాయకుడు",
    placeholder: "మీ ఆరోగ్య ప్రశ్నను అడగండి...",
    send: "పంపండి",
    back: "వెనుకకు",
    listening: "వింటోంది...",
    voice: "వాయిస్",
    thinking: "కేర్‌లింక్ AI ఆలోచిస్తోంది...",
    welcome:
      "నమస్కారం! 👋 నేను కేర్‌లింక్ AI. మీ ఆరోగ్య ప్రశ్నను అడగండి. నేను సులభమైన సాధారణ ఆరోగ్య సమాచారం అందిస్తాను.",
    disclaimer:
      "కేర్‌లింక్ AI సాధారణ ఆరోగ్య సమాచారాన్ని మాత్రమే అందిస్తుంది. ఇది వైద్యుడికి ప్రత్యామ్నాయం కాదు.",
    suggestions: [
      "జ్వరం వచ్చినప్పుడు నేను ఏమి చేయాలి?",
      "డీహైడ్రేషన్ ప్రమాద సూచనలు ఏమిటి?",
      "దోమల ద్వారా వచ్చే వ్యాధులను ఎలా నివారించాలి?",
      "దగ్గు వచ్చినప్పుడు ఏమి చేయాలి?",
    ],
    precautions: "జాగ్రత్తలు",
    warningSigns: "⚠️ ప్రమాద సూచనలు",
    steps: "మీరు చేయగలిగేవి",
    whenToSeek: "వైద్య సహాయం ఎప్పుడు పొందాలి",
    followUp: "కొన్ని ప్రశ్నలు",
    emergency: "🚨 వెంటనే వైద్య సహాయం అవసరం కావచ్చు",
    urgent: "⚠️ త్వరలో వైద్య సహాయం పొందడం మంచిది",
    routine: "ℹ️ సాధారణ ఆరోగ్య మార్గదర్శకం",
    selfCare: "✅ సాధారణ స్వీయ సంరక్షణ సమాచారం",
    error:
      "ఏదో సమస్య వచ్చింది. ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
    empty: "దయచేసి ఆరోగ్య ప్రశ్నను నమోదు చేయండి.",
  },

  hi: {
    title: "केयरलिंक AI",
    subtitle: "आपका स्वास्थ्य मार्गदर्शन सहायक",
    placeholder: "अपना स्वास्थ्य प्रश्न पूछें...",
    send: "भेजें",
    back: "वापस",
    listening: "सुन रहा है...",
    voice: "आवाज़",
    thinking: "केयरलिंक AI सोच रहा है...",
    welcome:
      "नमस्ते! 👋 मैं केयरलिंक AI हूँ। अपना स्वास्थ्य प्रश्न पूछें। मैं सरल सामान्य स्वास्थ्य जानकारी दूंगा।",
    disclaimer:
      "केयरलिंक AI सामान्य स्वास्थ्य जानकारी प्रदान करता है। यह डॉक्टर का विकल्प नहीं है।",
    suggestions: [
      "बुखार होने पर मुझे क्या करना चाहिए?",
      "डिहाइड्रेशन के चेतावनी संकेत क्या हैं?",
      "मच्छर से होने वाली बीमारियों से कैसे बचें?",
      "खांसी होने पर क्या करना चाहिए?",
    ],
    precautions: "सावधानियां",
    warningSigns: "⚠️ चेतावनी संकेत",
    steps: "आप क्या कर सकते हैं",
    whenToSeek: "चिकित्सकीय सहायता कब लें",
    followUp: "कुछ प्रश्न",
    emergency: "🚨 तुरंत चिकित्सा सहायता की आवश्यकता हो सकती है",
    urgent: "⚠️ जल्द चिकित्सा सहायता लेने पर विचार करें",
    routine: "ℹ️ सामान्य स्वास्थ्य मार्गदर्शन",
    selfCare: "✅ सामान्य स्व-देखभाल जानकारी",
    error:
      "कुछ गलत हुआ। अपना इंटरनेट कनेक्शन जांचें और फिर प्रयास करें।",
    empty: "कृपया स्वास्थ्य प्रश्न दर्ज करें।",
  },

  mr: {
    title: "केअरLink AI",
    subtitle: "तुमचा आरोग्य मार्गदर्शन सहाय्यक",
    placeholder: "तुमचा आरोग्य प्रश्न विचारा...",
    send: "पाठवा",
    back: "मागे",
    listening: "ऐकत आहे...",
    voice: "आवाज",
    thinking: "CareLink AI विचार करत आहे...",
    welcome:
      "नमस्कार! 👋 मी CareLink AI आहे. तुमचा आरोग्य प्रश्न विचारा. मी सोप्या सामान्य आरोग्याची माहिती देईन.",
    disclaimer:
      "CareLink AI सामान्य आरोग्य माहिती देते. हे डॉक्टरांचा पर्याय नाही.",
    suggestions: [
      "ताप आल्यास मी काय करावे?",
      "डिहायड्रेशनची धोक्याची चिन्हे कोणती?",
      "डासांमुळे होणाऱ्या आजारांपासून कसे वाचावे?",
      "खोकला असल्यास काय करावे?",
    ],
    precautions: "सावधगिरी",
    warningSigns: "⚠️ धोक्याची चिन्हे",
    steps: "तुम्ही काय करू शकता",
    whenToSeek: "वैद्यकीय मदत कधी घ्यावी",
    followUp: "काही प्रश्न",
    emergency: "🚨 तातडीच्या वैद्यकीय मदतीची आवश्यकता असू शकते",
    urgent: "⚠️ लवकर वैद्यकीय मदत घेण्याचा विचार करा",
    routine: "ℹ️ सामान्य आरोग्य मार्गदर्शन",
    selfCare: "✅ सामान्य स्व-देखभाल माहिती",
    error:
      "काहीतरी चूक झाली. इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
    empty: "कृपया आरोग्य प्रश्न लिहा.",
  },
};

function getText(lang) {
  return TEXT[lang] || TEXT.en;
}

function normalizeResponse(data, lang) {
  if (!data || typeof data !== "object") {
    return {
      title: "",
      summary: "",
      urgency: "routine",
      emergencyMessage: "",
      steps: [],
      precautions: [],
      redFlags: [],
      whenToSeekCare: "",
      followUpQuestions: [],
      disclaimer: getText(lang).disclaimer,
    };
  }

  return {
    title: data.title || "",
    summary: data.summary || "",
    urgency: data.urgency || "routine",
    emergencyMessage: data.emergencyMessage || "",
    steps: Array.isArray(data.steps) ? data.steps : [],
    precautions: Array.isArray(data.precautions)
      ? data.precautions
      : [],
    redFlags: Array.isArray(data.redFlags)
      ? data.redFlags
      : [],
    whenToSeekCare: data.whenToSeekCare || "",
    followUpQuestions: Array.isArray(data.followUpQuestions)
      ? data.followUpQuestions
      : [],
    disclaimer:
      data.disclaimer || getText(lang).disclaimer,
  };
}

function UrgencyBanner({ urgency, message, t }) {
  if (urgency === "emergency") {
    return (
      <div className="carelink-urgency emergency">
        <div className="urgency-icon">🚨</div>
        <div>
          <strong>{t.emergency}</strong>
          {message ? <p>{message}</p> : null}
        </div>
      </div>
    );
  }

  if (urgency === "urgent") {
    return (
      <div className="carelink-urgency urgent">
        <div className="urgency-icon">⚠️</div>
        <div>
          <strong>{t.urgent}</strong>
          {message ? <p>{message}</p> : null}
        </div>
      </div>
    );
  }

  return null;
}

function AIResponseCard({ data, lang, onFollowUp }) {
  const t = getText(lang);

  return (
    <div className="ai-response">

      {data.title && (
        <h2 className="response-title">
          {data.title}
        </h2>
      )}

      {data.summary && (
        <div className="summary-box">
          <span className="summary-icon">💡</span>
          <p>{data.summary}</p>
        </div>
      )}

      <UrgencyBanner
        urgency={data.urgency}
        message={data.emergencyMessage}
        t={t}
      />

      {data.steps.length > 0 && (
        <section className="response-section">
          <h3>🩺 {t.steps}</h3>

          <div className="steps-list">
            {data.steps.map((step, index) => (
              <div
                className="step-card"
                key={`step-${index}`}
              >
                <div className="step-icon">
                  {step.icon || "👉"}
                </div>

                <div className="step-content">
                  <strong>
                    {step.title || `Step ${index + 1}`}
                  </strong>

                  {step.description && (
                    <p>{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.precautions.length > 0 && (
        <section className="response-section">
          <h3>🛡️ {t.precautions}</h3>

          <ul className="bullet-list">
            {data.precautions.map((item, index) => (
              <li key={`precaution-${index}`}>
                <span>✓</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.redFlags.length > 0 && (
        <section className="response-section warning-section">
          <h3>{t.warningSigns}</h3>

          <ul className="bullet-list">
            {data.redFlags.map((item, index) => (
              <li key={`warning-${index}`}>
                <span>⚠️</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.whenToSeekCare && (
        <section className="response-section care-section">
          <h3>🏥 {t.whenToSeek}</h3>
          <p className="care-text">
            {data.whenToSeekCare}
          </p>
        </section>
      )}

      {data.followUpQuestions.length > 0 && (
        <section className="response-section">
          <h3>❓ {t.followUp}</h3>

          <div className="follow-up-list">
            {data.followUpQuestions.map(
              (question, index) => (
                <button
                  key={`question-${index}`}
                  className="follow-up-button"
                  onClick={() =>
                    onFollowUp(question)
                  }
                >
                  {question}
                </button>
              )
            )}
          </div>
        </section>
      )}

      <div className="ai-disclaimer">
        ℹ️ {data.disclaimer || t.disclaimer}
      </div>
    </div>
  );
}

export function AIAssistant({
  onBack,
  lang = "en",
}) {
  const t = getText(lang);

  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setChatLog([]);
    setError("");
    setQuery("");
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatLog, isLoading]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }
    };
  }, []);

  const getSpeechLanguage = () => {
    const languages = {
      en: "en-IN",
      te: "te-IN",
      hi: "hi-IN",
      mr: "mr-IN",
    };

    return languages[lang] || "en-IN";
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported by this browser."
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = getSpeechLanguage();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setQuery(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError(
        "Voice input could not be started. Please type your question."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (textOverride) => {
    const text =
      typeof textOverride === "string"
        ? textOverride
        : query;

    const cleanText = text.trim();

    if (!cleanText) {
      setError(t.empty);
      return;
    }

    if (isLoading) {
      return;
    }

    setError("");
    setQuery("");

    const previousMessages = chatLog
      .filter(
        (item) =>
          item.type === "user" ||
          item.type === "assistant"
      )
      .slice(-10)
      .map((item) => ({
        role:
          item.type === "assistant"
            ? "model"
            : "user",
        text:
          typeof item.text === "string"
            ? item.text
            : "",
      }));

    setChatLog((prev) => [
      ...prev,
      {
        id:
          Date.now() +
          Math.random(),
        type: "user",
        text: cleanText,
      },
    ]);

    setIsLoading(true);

    try {
      /*
       * IMPORTANT:
       * We call our own Vercel API route.
       *
       * The Gemini API key is NOT here.
       *
       * The key stays safely on the server
       * inside Vercel Environment Variables.
       */
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: cleanText,
          language: lang,
          history: previousMessages,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Server error (${response.status})`
        );
      }

      const aiResponse = normalizeResponse(
        data,
        lang
      );

      setChatLog((prev) => [
        ...prev,
        {
          id:
            Date.now() +
            Math.random(),
          type: "assistant",
          text: aiResponse.summary || "",
          response: aiResponse,
        },
      ]);
    } catch (err) {
      console.error(
        "CareLink AI error:",
        err
      );

      setError(
        err?.message || t.error
      );

      setChatLog((prev) => [
        ...prev,
        {
          id:
            Date.now() +
            Math.random(),
          type: "error",
          text: t.error,
        },
      ]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="carelink-ai-page">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .carelink-ai-page {
          width: 100%;
          min-height: 100%;
          color: #e8f3f8;
          background:
            radial-gradient(
              circle at top right,
              rgba(0, 120, 180, 0.18),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #030b12,
              #06131e 55%,
              #071a28
            );
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          display: flex;
          flex-direction: column;
        }

        .carelink-ai-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 26px 26px 20px;
        }

        .back-button {
          width: 64px;
          height: 64px;
          border: 0;
          border-radius: 20px;
          background: rgba(255,255,255,0.07);
          color: white;
          font-size: 27px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          flex-shrink: 0;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.13);
          transform: translateX(-2px);
        }

        .ai-logo {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              #08a7a0,
              #0077aa
            );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow:
            0 10px 30px
            rgba(0,150,190,0.18);
          flex-shrink: 0;
        }

        .header-info {
          flex: 1;
          min-width: 0;
        }

        .header-info h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .header-info p {
          margin: 5px 0 0;
          color: #91a7b4;
          font-size: 14px;
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #65e6a3;
          font-size: 14px;
          white-space: nowrap;
        }

        .online-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #24d56d;
          box-shadow:
            0 0 12px
            rgba(36,213,109,0.65);
        }

        .chat-container {
          flex: 1;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 10px 26px 150px;
        }

        .welcome-card {
          margin-top: 18px;
          border: 1px solid rgba(120,180,205,0.12);
          background: rgba(10,28,40,0.72);
          border-radius: 22px;
          padding: 20px;
          color: #c8d7de;
          line-height: 1.6;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .suggestion-button {
          border: 1px solid rgba(0,174,210,0.25);
          background: rgba(0,128,160,0.10);
          color: #aeeaf4;
          border-radius: 14px;
          padding: 11px 14px;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          transition: 0.2s;
        }

        .suggestion-button:hover {
          background: rgba(0,174,210,0.18);
          border-color: rgba(0,200,230,0.4);
          transform: translateY(-1px);
        }

        .message-row {
          display: flex;
          margin-top: 18px;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .user-message {
          max-width: 78%;
          background:
            linear-gradient(
              145deg,
              #086b83,
              #07546b
            );
          color: white;
          padding: 14px 17px;
          border-radius: 19px 19px 5px 19px;
          line-height: 1.55;
          white-space: pre-wrap;
          box-shadow:
            0 8px 25px
            rgba(0,0,0,0.15);
        }

        .assistant-message {
          width: 100%;
          max-width: 820px;
        }

        .ai-response {
          width: 100%;
          background:
            rgba(7,23,34,0.88);
          border:
            1px solid
            rgba(120,190,210,0.12);
          border-radius: 22px;
          padding: 20px;
          box-shadow:
            0 15px 45px
            rgba(0,0,0,0.16);
        }

        .response-title {
          margin: 0 0 14px;
          color: #f1f8fb;
          font-size: 21px;
        }

        .summary-box {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(18,130,150,0.09);
          border: 1px solid rgba(30,190,205,0.12);
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 16px;
        }

        .summary-icon {
          font-size: 22px;
        }

        .summary-box p {
          margin: 0;
          color: #c9d9df;
          line-height: 1.6;
        }

        .carelink-urgency {
          display: flex;
          gap: 13px;
          padding: 16px;
          border-radius: 17px;
          margin: 14px 0 18px;
          line-height: 1.5;
        }

        .carelink-urgency.emergency {
          background: rgba(180,45,55,0.15);
          border: 1px solid rgba(255,90,100,0.25);
        }

        .carelink-urgency.urgent {
          background: rgba(190,130,30,0.13);
          border: 1px solid rgba(255,190,70,0.24);
        }

        .urgency-icon {
          font-size: 23px;
        }

        .carelink-urgency strong {
          color: #fff;
        }

        .carelink-urgency p {
          margin: 5px 0 0;
          color: #d4e0e4;
        }

        .response-section {
          margin-top: 22px;
        }

        .response-section h3 {
          margin: 0 0 12px;
          font-size: 16px;
          color: #dcecf1;
        }

        .steps-list {
          display: grid;
          gap: 10px;
        }

        .step-card {
          display: flex;
          gap: 13px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .step-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          background: rgba(0,150,180,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .step-content strong {
          display: block;
          color: #edf8fb;
          margin-bottom: 4px;
        }

        .step-content p {
          margin: 0;
          color: #aebfc7;
          line-height: 1.55;
          font-size: 14px;
        }

        .bullet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 9px;
        }

        .bullet-list li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 11px 13px;
          border-radius: 13px;
          background: rgba(255,255,255,0.03);
        }

        .bullet-list li span {
          flex-shrink: 0;
        }

        .bullet-list p {
          margin: 0;
          color: #b9cbd2;
          line-height: 1.5;
          font-size: 14px;
        }

        .warning-section {
          padding: 15px;
          border-radius: 17px;
          background: rgba(180,100,30,0.07);
          border: 1px solid rgba(255,170,60,0.12);
        }

        .care-section {
          padding: 15px;
          border-radius: 17px;
          background: rgba(30,130,170,0.07);
          border: 1px solid rgba(50,180,210,0.12);
        }

        .care-text {
          margin: 0;
          color: #c0d1d8;
          line-height: 1.6;
          font-size: 14px;
        }

        .follow-up-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .follow-up-button {
          border: 1px solid rgba(0,170,205,0.2);
          background: rgba(0,140,175,0.08);
          color: #aee8f1;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
        }

        .follow-up-button:hover {
          background: rgba(0,160,190,0.16);
        }

        .ai-disclaimer {
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          color: #7f959f;
          font-size: 12px;
          line-height: 1.5;
        }

        .error-message {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(150,40,55,0.13);
          border: 1px solid rgba(255,80,90,0.18);
          color: #ffc4c8;
          line-height: 1.5;
        }

        .loading-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          margin-top: 18px;
          color: #9fb7c0;
        }

        .loading-dots {
          display: flex;
          gap: 5px;
        }

        .loading-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25c4d6;
          animation: carelinkPulse 1.2s infinite ease-in-out;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes carelinkPulse {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        .input-area {
          position: fixed;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: min(900px, 100%);
          padding: 15px 26px 22px;
          background:
            linear-gradient(
              to top,
              #040d14 65%,
              rgba(4,13,20,0)
            );
          z-index: 20;
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 9px;
          background: #0a1b27;
          border:
            1px solid
            rgba(110,180,205,0.15);
          border-radius: 20px;
          padding: 8px;
          box-shadow:
            0 15px 40px
            rgba(0,0,0,0.3);
        }

        .question-input {
          flex: 1;
          min-width: 0;
          min-height: 49px;
          max-height: 120px;
          resize: none;
          border: 0;
          outline: none;
          background: transparent;
          color: #edf7fa;
          font-size: 15px;
          line-height: 1.5;
          padding: 13px 9px;
          font-family: inherit;
        }

        .question-input::placeholder {
          color: #708792;
        }

        .icon-button {
          width: 49px;
          height: 49px;
          border: 0;
          border-radius: 15px;
          background: rgba(255,255,255,0.06);
          color: #c6dbe2;
          font-size: 21px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-button:hover {
          background: rgba(255,255,255,0.11);
        }

        .icon-button.listening {
          background: rgba(20,170,180,0.2);
          box-shadow:
            0 0 0 5px
            rgba(20,170,180,0.07);
        }

        .send-button {
          width: 54px;
          height: 54px;
          border: 0;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              #087c98,
              #00627d
            );
          color: white;
          font-size: 23px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .send-button:hover {
          filter: brightness(1.12);
        }

        .send-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .voice-label {
          position: absolute;
          bottom: 82px;
          left: 30px;
          padding: 7px 10px;
          border-radius: 9px;
          background: #122631;
          color: #9edee7;
          font-size: 11px;
          opacity: 0;
          pointer-events: none;
          transition: 0.2s;
        }

        .input-area:hover .voice-label {
          opacity: 1;
        }

        .bottom-note {
          text-align: center;
          color: #627983;
          font-size: 10px;
          margin-top: 7px;
        }

        @media (max-width: 700px) {
          .carelink-ai-header {
            padding: 18px 15px 14px;
          }

          .back-button,
          .ai-logo {
            width: 52px;
            height: 52px;
            border-radius: 16px;
          }

          .header-info h1 {
            font-size: 20px;
          }

          .header-info p {
            font-size: 12px;
          }

          .online-status {
            font-size: 12px;
          }

          .chat-container {
            padding:
              5px 15px 145px;
          }

          .input-area {
            padding:
              10px 15px 16px;
          }

          .welcome-card {
            padding: 16px;
          }

          .user-message {
            max-width: 88%;
          }

          .ai-response {
            padding: 16px;
          }

          .suggestions {
            flex-direction: column;
          }

          .suggestion-button {
            width: 100%;
          }
        }
      `}</style>

      <header className="carelink-ai-header">

        <button
          className="back-button"
          onClick={onBack}
          aria-label={t.back}
          type="button"
        >
          ←
        </button>

        <div className="ai-logo">
          🩺
        </div>

        <div className="header-info">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="online-status">
          <span className="online-dot" />
          AI
        </div>
      </header>

      <main className="chat-container">

        {chatLog.length === 0 && (
          <div className="welcome-card">

            <div>{t.welcome}</div>

            <div className="suggestions">
              {t.suggestions.map(
                (suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    className="suggestion-button"
                    type="button"
                    onClick={() =>
                      handleSend(suggestion)
                    }
                  >
                    💬 {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {chatLog.map((item) => {

          if (item.type === "user") {
            return (
              <div
                className="message-row user"
                key={item.id}
              >
                <div className="user-message">
                  {item.text}
                </div>
              </div>
            );
          }

          if (item.type === "assistant") {
            return (
              <div
                className="message-row"
                key={item.id}
              >
                <div className="assistant-message">
                  <AIResponseCard
                    data={item.response}
                    lang={lang}
                    onFollowUp={handleSend}
                  />
                </div>
              </div>
            );
          }

          if (item.type === "error") {
            return (
              <div
                className="error-message"
                key={item.id}
              >
                ⚠️ {item.text}
              </div>
            );
          }

          return null;
        })}

        {isLoading && (
          <div className="loading-message">
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>

            <span>{t.thinking}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <div className="input-area">

        <div className="input-box">

          <textarea
            ref={inputRef}
            className="question-input"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            disabled={isLoading}
            aria-label={t.placeholder}
          />

          <button
            className={`icon-button ${
              isListening
                ? "listening"
                : ""
            }`}
            type="button"
            onClick={startVoiceInput}
            disabled={isLoading}
            aria-label={
              isListening
                ? t.listening
                : t.voice
            }
            title={
              isListening
                ? t.listening
                : t.voice
            }
          >
            {isListening ? "🔴" : "🎙️"}
          </button>

          <button
            className="send-button"
            type="button"
            onClick={() => handleSend()}
            disabled={
              isLoading ||
              !query.trim()
            }
            aria-label={t.send}
            title={t.send}
          >
            ➤
          </button>
        </div>

        {isListening && (
          <div
            style={{
              textAlign: "center",
              color: "#76dbe5",
              fontSize: "12px",
              marginTop: "6px",
            }}
          >
            🎙️ {t.listening}
          </div>
        )}

        <div className="bottom-note">
          {t.disclaimer}
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
