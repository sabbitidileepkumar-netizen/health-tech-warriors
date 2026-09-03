import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import { initStore } from "./dataStore";

import { CitizenHome } from "./CitizenHome";
import HomeDashboard from "./HomeDashboard";
import PatientRegistration from "./PatientRegistration";
import Triage from "./Triage";
import PriorityQueue from "./PriorityQueue";
import Referral from "./Referral";
import PatientRecords from "./PatientRecords";
import ReportsStats from "./ReportsStats";
import { OutbreakMonitor } from "./OutbreakMonitor";
import { AboutApp } from "./AboutApp";

function App() {
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("citizen"); // "citizen" or "asha"
  const [screen, setScreen] = useState("home");
  const [isOnline, setIsOnline] = useState(true);
  const [referralPatient, setReferralPatient] = useState(null);

  useEffect(() => {
    initStore();
  }, []);

  const t = translations[lang] || translations.en;

  const handleNavigateToReferral = (patient) => {
    setReferralPatient(patient);
    setScreen("referral");
  };

  const renderAshaScreen = () => {
    if (screen === "home") {
      return <HomeDashboard onNavigate={(k) => setScreen(k)} t={t} lang={lang} />;
    }
    if (screen === "register") {
      return <PatientRegistration onBack={() => setScreen("home")} t={t} />;
    }
    if (screen === "triage") {
      return (
        <Triage
          onBack={() => setScreen("home")}
          onNavigateToReferral={handleNavigateToReferral}
          t={t}
        />
      );
    }
    if (screen === "queue") {
      return (
        <PriorityQueue
          onBack={() => setScreen("home")}
          onRefer={handleNavigateToReferral}
        />
      );
    }
    if (screen === "referral") {
      return (
        <Referral
          onBack={() => {
            setReferralPatient(null);
            setScreen("home");
          }}
          defaultPatient={referralPatient}
        />
      );
    }
    if (screen === "records") {
      return <PatientRecords onBack={() => setScreen("home")} />;
    }
    if (screen === "stats") {
      return <ReportsStats onBack={() => setScreen("home")} />;
    }
    if (screen === "outbreak") {
      return <OutbreakMonitor onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "about") {
      return <AboutApp onBack={() => setScreen("home")} />;
    }
    return (
      <div className="page-content" style={{ textAlign: "center", padding: "40px 20px" }}>
        <button className="btn-outline" onClick={() => setScreen("home")}>⬅️ Back to Home</button>
        <p style={{ marginTop: "20px" }}>Module under synchronization.</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header Bar */}
      <header className="header-bar">
        <div
          className="brand-badge"
          onClick={() => {
            setScreen("home");
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="brand-logo">CL</div>
          <div>
            <div className="brand-title">{t.appTitle}</div>
            <div className="brand-tagline">{t.tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Language Selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "white",
              width: "auto"
            }}
            title="Switch Language"
          >
            <option value="en">English</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>

          {/* About Page Button */}
          <button
            onClick={() => setScreen("about")}
            className="btn-outline"
            style={{ padding: "4px 8px", fontSize: "14px" }}
            title="About CareLink (SIH26133)"
          >
            ℹ️
          </button>
        </div>
      </header>

      {/* Mode Switcher & Connectivity Sub-Bar */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Dual Mode Switcher Pill */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === "citizen" ? "active" : ""}`}
            onClick={() => {
              setMode("citizen");
              setScreen("home");
            }}
          >
            👤 Citizen
          </button>
          <button
            className={`mode-btn ${mode === "asha" ? "active" : ""}`}
            onClick={() => {
              setMode("asha");
              setScreen("home");
            }}
          >
            👩‍⚕️ ASHA Worker
          </button>
        </div>

        {/* Tier 2: Low-connectivity indicator banner toggle */}
        <div
          onClick={() => setIsOnline(!isOnline)}
          style={{
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 8px",
            borderRadius: "12px",
            backgroundColor: isOnline ? "#ECFDF5" : "#FEF3C7",
            color: isOnline ? "#065F46" : "#92400E",
            border: "1px solid " + (isOnline ? "#A7F3D0" : "#FDE68A"),
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
          title="Click to simulate Online / Offline mode"
        >
          <span>{isOnline ? "🟢 Online" : "📶 Offline Mode"}</span>
        </div>
      </div>

      {/* Offline Alert Strip when toggled */}
      {!isOnline && (
        <div className="status-banner status-offline">
          <span>📶 Operating in Offline Local-First Mode (Auto-cached on device)</span>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {screen === "about" ? (
          <AboutApp onBack={() => setScreen("home")} />
        ) : mode === "citizen" ? (
          <CitizenHome lang={lang} t={t} />
        ) : (
          renderAshaScreen()
        )}
      </main>

      {/* Bottom Footer Navigation Indicator */}
      <footer className="no-print" style={{ background: "white", borderTop: "1px solid var(--border)", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#94A3B8" }}>
        CareLink Public Health Portal &bull; SIH 2026 (Govt. of Maharashtra) &bull; Mode: <strong>{mode === "citizen" ? "Citizen View" : "ASHA Health Worker"}</strong>
      </footer>
    </div>
  );
}

export default App;
