import React, { useState } from "react";
import { EmergencyModal } from "./EmergencyModal";
import { BloodSearch } from "./BloodSearch";
import { MedicineReminders } from "./MedicineReminders";
import { OrganDonation } from "./OrganDonation";
import { GuidanceContent } from "./GuidanceContent";
import { HospitalFinder } from "./HospitalFinder";
import { ChildImmunization } from "./ChildImmunization";
import { VenomousAnimalTracker } from "./VenomousAnimalTracker";
import { WeatherSeasonalAlerts } from "./WeatherSeasonalAlerts";
import { AIAssistant } from "./AIAssistant";

export function CitizenHome({ lang = "en", t }) {
  const [activeScreen, setActiveScreen] = useState("home");
  const [showEmergency, setShowEmergency] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("");

  const handleVoiceSim = () => {
    setIsListening(true);
    setVoiceQuery(t.listening || "Listening... Speak now in Telugu or English");

    setTimeout(() => {
      const sampleQueries = [
        { text: "Need O+ blood urgently for accident in Tanuku", screen: "blood" },
        { text: "Call 108 ambulance right away", emergency: true },
        { text: "Snakebite first aid and anti-venom in Relangi", screen: "snake" },
        { text: "Pulse Polio drop schedule for my child", screen: "polio" },
        { text: "Hospitals with ICU oxygen beds in Bhimavaram", screen: "hospitals" },
        { text: "Ask AI doctor about fever medicine", screen: "ai" },
        { text: "Godavari flood and weather warning", screen: "weather" }
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setVoiceQuery("Recognized: \"" + randomQuery.text + "\"");
      setIsListening(false);

      setTimeout(() => {
        if (randomQuery.emergency) {
          setShowEmergency(true);
        } else if (randomQuery.screen) {
          setActiveScreen(randomQuery.screen);
        }
        setVoiceQuery("");
      }, 1200);
    }, 2000);
  };

  if (activeScreen === "blood") {
    return <BloodSearch onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "medicines") {
    return <MedicineReminders onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "organ") {
    return <OrganDonation onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "pregnancy") {
    return <GuidanceContent onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "hospitals") {
    return <HospitalFinder onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "polio") {
    return <ChildImmunization onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "snake") {
    return <VenomousAnimalTracker onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "weather") {
    return <WeatherSeasonalAlerts onBack={() => setActiveScreen("home")} lang={lang} />;
  }
  if (activeScreen === "ai") {
    return <AIAssistant onBack={() => setActiveScreen("home")} lang={lang} />;
  }

  return (
    <div className="page-content">
      {/* Voice / Tap Hero Section */}
      <div className="voice-assistant-panel">
        <h2 style={{ color: "white", fontSize: "19px", margin: 0 }}>{t.howCanWeHelp}</h2>
        <p style={{ color: "#E0F2FE", fontSize: "13px", marginTop: "4px" }}>{t.tapOrSpeak}</p>

        <button
          className={"mic-circle-btn " + (isListening ? "listening" : "")}
          onClick={handleVoiceSim}
          title="Tap to speak"
        >
          {isListening ? "🔴" : "🎙️"}
        </button>

        <div style={{ fontSize: "13px", fontWeight: "600", color: "#F0F9FF" }}>
          {voiceQuery || t.speakBtn}
        </div>
      </div>

      {/* Primary Emergency Banner */}
      <div
        onClick={() => setShowEmergency(true)}
        style={{
          background: "#FEF2F2",
          border: "2px solid #FECACA",
          borderRadius: "16px",
          padding: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "32px" }}>🚨</span>
          <div>
            <strong style={{ color: "#DC2626", fontSize: "15px" }}>{t.emergency}</strong>
            <p style={{ margin: 0, fontSize: "12px", color: "#991B1B" }}>{t.emergencyDesc}</p>
          </div>
        </div>
        <span className="badge" style={{ background: "#DC2626", color: "white" }}>108 CALL</span>
      </div>

      {/* CareLink Citizen Grid */}
      <div className="icon-card-grid">
        {/* Snakebite & Venom SOS */}
        <div className="icon-card" onClick={() => setActiveScreen("snake")}>
          <div className="icon-card-bubble" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            🐍
          </div>
          <div className="icon-card-title">{t.snakebiteEmergency || "Snakebite SOS"}</div>
          <div className="icon-card-desc">{t.snakebiteEmergencyDesc || "First aid & Anti-Venom"}</div>
        </div>

        {/* Accident Blood Finder */}
        <div className="icon-card" onClick={() => setActiveScreen("blood")}>
          <div className="icon-card-bubble" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            🩸
          </div>
          <div className="icon-card-title">{t.bloodBank}</div>
          <div className="icon-card-desc">{t.bloodBankDesc}</div>
        </div>

        {/* Child Polio & Vaccines */}
        <div className="icon-card" onClick={() => setActiveScreen("polio")}>
          <div className="icon-card-bubble" style={{ background: "#FEF3C7", color: "#D97706" }}>
            👶
          </div>
          <div className="icon-card-title">{t.childImmunization || "Child Polio Drops"}</div>
          <div className="icon-card-desc">{t.childImmunizationDesc || "Vaccination calendar"}</div>
        </div>

        {/* AI Health Copilot */}
        <div className="icon-card" onClick={() => setActiveScreen("ai")}>
          <div className="icon-card-bubble" style={{ background: "#F3E8FF", color: "#7E22CE" }}>
            🤖
          </div>
          <div className="icon-card-title">{t.aiAssistant || "AI Health Copilot"}</div>
          <div className="icon-card-desc">{t.aiAssistantDesc || "Voice medical advisor"}</div>
        </div>

        {/* Find Hospital */}
        <div className="icon-card" onClick={() => setActiveScreen("hospitals")}>
          <div className="icon-card-bubble" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>
            🏥
          </div>
          <div className="icon-card-title">{t.findHospital}</div>
          <div className="icon-card-desc">{t.findHospitalDesc}</div>
        </div>

        {/* Weather & Seasonal Alerts */}
        <div className="icon-card" onClick={() => setActiveScreen("weather")}>
          <div className="icon-card-bubble" style={{ background: "#E0F2FE", color: "#0284C7" }}>
            🌦️
          </div>
          <div className="icon-card-title">{t.weatherAlerts || "Weather Alerts"}</div>
          <div className="icon-card-desc">{t.weatherAlertsDesc || "Flood & outbreak alerts"}</div>
        </div>

        {/* Medicines & Reminders */}
        <div className="icon-card" onClick={() => setActiveScreen("medicines")}>
          <div className="icon-card-bubble" style={{ background: "#E6F7F5", color: "#0D9488" }}>
            💊
          </div>
          <div className="icon-card-title">{t.medicines}</div>
          <div className="icon-card-desc">{t.medicinesDesc}</div>
        </div>

        {/* Pregnancy & Child Care */}
        <div className="icon-card" onClick={() => setActiveScreen("pregnancy")}>
          <div className="icon-card-bubble" style={{ background: "#FFF7ED", color: "#F97316" }}>
            🤰
          </div>
          <div className="icon-card-title">{t.pregnancyCare}</div>
          <div className="icon-card-desc">{t.pregnancyCareDesc}</div>
        </div>

        {/* Organ Donation */}
        <div className="icon-card" onClick={() => setActiveScreen("organ")}>
          <div className="icon-card-bubble" style={{ background: "#F3E8FF", color: "#7E22CE" }}>
            🫀
          </div>
          <div className="icon-card-title">{t.organDonation}</div>
          <div className="icon-card-desc">{t.organDonationDesc}</div>
        </div>
      </div>

      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} lang={lang} />}
    </div>
  );
}

export default CitizenHome;
