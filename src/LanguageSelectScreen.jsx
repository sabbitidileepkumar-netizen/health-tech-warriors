import React, { useState } from "react";
import { Globe, ArrowRight, CheckCircle2 } from "lucide-react";

export function LanguageSelectScreen({ currentLang, onSelectLang, onContinue }) {
  const [selected, setSelected] = useState(currentLang || "te");

  const languages = [
    {
      code: "te",
      name: "తెలుగు",
      englishName: "Telugu",
      desc: "ఆంధ్రప్రదేశ్ గ్రామీణ ఆరోగ్య సేవలు",
      badge: "ఆంధ్రప్రదేశ్"
    },
    {
      code: "hi",
      name: "हिंदी",
      englishName: "Hindi",
      desc: "राष्ट्रीय ग्रामीण एवं जन स्वास्थ्य सेवा",
      badge: "राष्ट्रीय"
    },
    {
      code: "en",
      name: "English",
      englishName: "English",
      desc: "District Public Health & Rural Lifeline",
      badge: "Standard"
    },
    {
      code: "mr",
      name: "मराठी",
      englishName: "Marathi",
      desc: "सार्वजनिक आरोग्य व ग्राम सेवा",
      badge: "प्रादेशिक"
    }
  ];

  const handlePick = (code) => {
    setSelected(code);
    onSelectLang(code);
  };

  const handleProceed = () => {
    onSelectLang(selected);
    if (onContinue) onContinue(selected);
  };

  return (
    <div className="page-content" style={{ maxWidth: "460px", margin: "24px auto", padding: "16px" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0F6CBD 0%, #0D9488 100%)",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(15, 108, 189, 0.25)",
            marginBottom: "12px"
          }}
        >
          <Globe size={32} />
        </div>
        <h1 style={{ color: "#0F6CBD", fontSize: "22px", margin: "0 0 4px 0", fontWeight: "800" }}>
          Select Languages
        </h1>
        <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontWeight: "500" }}>
          భాషను ఎంచుకోండి &bull; अपनी भाषा चुनें &bull; Choose your language
        </p>
      </div>

      {/* Language Options Stack (Matching the sketch) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {languages.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => handlePick(lang.code)}
              style={{
                border: isSelected ? "2px solid #0F6CBD" : "1.5px solid #E2E8F0",
                background: isSelected ? "#EFF6FF" : "white",
                borderRadius: "16px",
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: isSelected ? "0 4px 14px rgba(15, 108, 189, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: isSelected ? "#0F6CBD" : "#F1F5F9",
                    color: isSelected ? "white" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "14px"
                  }}
                >
                  {lang.code.toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "16px", color: isSelected ? "#0F6CBD" : "#0F172A" }}>
                      {lang.name}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>({lang.englishName})</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                    {lang.desc}
                  </div>
                </div>
              </div>

              <div>
                {isSelected ? (
                  <CheckCircle2 size={22} color="#0F6CBD" fill="#EFF6FF" />
                ) : (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid #CBD5E1"
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Action */}
      <button
        onClick={handleProceed}
        className="btn-primary"
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 6px 18px rgba(15, 108, 189, 0.3)"
        }}
      >
        <span>
          {selected === "te"
            ? "పోర్టల్‌ల పేజీకి వెళ్లండి"
            : selected === "hi"
            ? "पोर्टल पर आगे बढ़ें"
            : selected === "mr"
            ? "पोर्टल निवडा"
            : "Continue to Portals Hub"}
        </span>
        <ArrowRight size={18} />
      </button>

      <div style={{ textAlign: "center", marginTop: "14px", fontSize: "11px", color: "#94A3B8" }}>
        You can easily change language at any time from the top header bar.
      </div>
    </div>
  );
}

export default LanguageSelectScreen;
