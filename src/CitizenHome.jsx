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
  const [searchQuery, setSearchQuery] = useState("");

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

  const citizenItems = [
    { key: "snake", icon: "🐍", bg: "#FEE2E2", color: "#DC2626", title: t.snakebiteEmergency || "Snakebite SOS", desc: t.snakebiteEmergencyDesc || "First aid & Anti-Venom" },
    { key: "blood", icon: "🩸", bg: "#FEE2E2", color: "#DC2626", title: t.bloodBank, desc: t.bloodBankDesc },
    { key: "polio", icon: "👶", bg: "#FEF3C7", color: "#D97706", title: t.childImmunization || "Child Polio Drops", desc: t.childImmunizationDesc || "Vaccination calendar" },
    { key: "ai", icon: "🤖", bg: "#F3E8FF", color: "#7E22CE", title: t.aiAssistant || "AI Health Copilot", desc: t.aiAssistantDesc || "Voice medical advisor" },
    { key: "hospitals", icon: "🏥", bg: "#EBF3FC", color: "#0F6CBD", title: t.findHospital, desc: t.findHospitalDesc },
    { key: "weather", icon: "🌦️", bg: "#E0F2FE", color: "#0284C7", title: t.weatherAlerts || "Weather Alerts", desc: t.weatherAlertsDesc || "Flood & outbreak alerts" },
    { key: "medicines", icon: "💊", bg: "#E6F7F5", color: "#0D9488", title: t.medicines, desc: t.medicinesDesc },
    { key: "pregnancy", icon: "🤰", bg: "#FFF7ED", color: "#F97316", title: t.pregnancyCare, desc: t.pregnancyCareDesc },
    { key: "organ", icon: "🫀", bg: "#F3E8FF", color: "#7E22CE", title: t.organDonation, desc: t.organDonationDesc }
  ];

  const filteredItems = citizenItems.filter((item) =>
    (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content">
      <input
        type="text"
        placeholder={lang === "te" ? "🔍 సేవను వెతకండి..." : "🔍 Search services (e.g. blood, vaccine)..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "14px" }}
      />

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

      {filteredItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94A3B8", padding: "20px" }}>
          No matching services found.
        </p>
      ) : (
        <div className="icon-card-grid">
          {filteredItems.map((item) => (
            <div className="icon-card" key={item.key} onClick={() => setActiveScreen(item.key)}>
              <div className="icon-card-bubble" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div className="icon-card-title">{item.title}</div>
              <div className="icon-card-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} lang={lang} />}
    </div>
  );
}

export default CitizenHome;
