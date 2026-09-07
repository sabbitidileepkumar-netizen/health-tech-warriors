import React, { useState } from "react";

// IMPORTANT: Replace this with your actual Gemini API key from https://aistudio.google.com/
// Your API key should look like: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxx"
const GEMINI_API_KEY = "AQ.Ab8RN6Ibr3MSagCv_epi_IUbviMfX8jTCw8gzcn2r8ZJsQlYAw";

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

    // Check if API key is set
    if (GEMINI_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || !GEMINI_API_KEY) {
      setChatLog((prev) => [...prev, {
        sender: "ai",
        text: lang === "te"
          ? "⚠️ API కీ కాన్ఫిగర్ చేయబడలేదు. దయచేసి మీ Gemini API కీని సెట్ చేయండి."
          : "⚠️ API key not configured. Please set your Gemini API key."
      }]);
      return;
    }

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

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        
        // Check for specific error types
        if (response.status === 403 || response.status === 401) {
          throw new Error(lang === "te" 
            ? "API కీ చెల్లదు. దయచేసి సరైన Gemini API కీని కాన్ఫిగర్ చేయండి."
            : "Invalid API key. Please configure a valid Gemini API key.");
        } else {
          throw new Error(lang === "te"
            ? `API ఎర్రర్: ${response.status} - దయచేసి మళ్ళీ ప్రయత్నించండి.`
            : `API Error: ${response.status} - Please try again.`);
        }
      }

      const data = await response.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "te"
          ? "క్షమించండి, సమాధానం రాబట్టడంలో సమస్య వచ్చింది. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా 108కి కాల్ చేయండి."
          : "Sorry, I had trouble getting a response. Please try again or call 108 for emergencies.");

      setChatLog((prev) => [...prev, { sender: "ai", text: aiText }]);
    } catch (err) {
      console.error("Error details:", err);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: err.message || (lang === "te"
            ? "నెట్‌వర్క్ సమస్య వచ్చింది. దయచేసి కనెక్షన్ చెక్ చేసి మళ్ళీ ప్రయత్నించండి."
            : "Network error. Please check your connection and try again.")
        }
      ]);
    }

    setIsLoading(false);
  };

  // ... rest of your component code remains the same ...
}
