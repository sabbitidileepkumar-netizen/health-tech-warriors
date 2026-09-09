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

// New Modules
import { Login } from "./Login";
import { AllMembers } from "./AllMembers";
import { VenomousAnimalTracker } from "./VenomousAnimalTracker";
import { WeatherSeasonalAlerts } from "./WeatherSeasonalAlerts";
import { DisasterMode } from "./DisasterMode";
import { SupplyIntelligence } from "./SupplyIntelligence";
import { AIAssistant } from "./AIAssistant";
import HospitalFinder from "./HospitalFinder";
import ChildVaccineTracker from "./ChildVaccineTracker";

function App() {
  const [lang, setLang] = useState("te");
  const [mode, setMode] = useState("citizen");
  const [screen, setScreen] = useState("home");
  const [isOnline, setIsOnline] = useState(true);
  const [referralPatient, setReferralPatient] = useState(null);
  const [triagePatient, setTriagePatient] = useState(null);

  const [ashaAuth, setAshaAuth] = useState(null);

  const [userLocation, setUserLocation] = useState({
    village: "Detecting location...",
    coords: "—",
    accuracy: "Locating..."
  });

  useEffect(() => {
    initStore();

    const storedAuth = localStorage.getItem("carelink_asha_auth");
    if (storedAuth) {
      try {
        setAshaAuth(JSON.parse(storedAuth));
      } catch (_e) {}
    }

    // Looks up a real place name for given coordinates using OpenStreetMap's
    // free Nominatim reverse-geocoding API (no key required).
    const reverseGeocode = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        const addr = data.address || {};
        return (
          addr.village ||
          addr.town ||
          addr.suburb ||
          addr.city ||
          addr.county ||
          data.display_name ||
          "Unknown Location"
        );
      } catch (_e) {
        return "Location name unavailable";
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Show coordinates immediately, then fill in the real place name
          // once the reverse-geocoding lookup finishes.
          setUserLocation({
            village: "Detecting location...",
            coords: lat.toFixed(3) + "° N, " + lon.toFixed(3) + "° E",
            accuracy: "Live GPS Active (" + Math.round(pos.coords.accuracy) + "m)"
          });

          const placeName = await reverseGeocode(lat, lon);

          setUserLocation({
            village: placeName,
            coords: lat.toFixed(3) + "° N, " + lon.toFixed(3) + "° E",
            accuracy: "Live GPS Active (" + Math.round(pos.coords.accuracy) + "m)"
          });
        },
        () => {
          setUserLocation({
            village: "Location Unavailable",
            coords: "—",
            accuracy: "GPS Permission Denied"
          });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const t = translations[lang] || translations.te || translations.en;

  const handleNavigateToReferral = (patient) => {
    setReferralPatient(patient);
    setScreen("referral");
  };

  const handleNavigateToTriage = (patient) => {
    setTriagePatient(patient);
    setScreen("triage");
  };

  const handleAshaLoginSuccess = (authData) => {
    setAshaAuth(authData);
    setMode("asha");
    setScreen("home");
  };

  const handleAshaLogout = () => {
    localStorage.removeItem("carelink_asha_auth");
    setAshaAuth(null);
    setMode("citizen");
    setScreen("home");
  };

  const renderAshaScreen = () => {
    if (!ashaAuth) {
      return (
        <Login
          onLoginSuccess={handleAshaLoginSuccess}
          onCancel={() => {
            setMode("citizen");
            setScreen("home");
          }}
          t={t}
          lang={lang}
        />
      );
    }

    if (screen === "home") {
      return <HomeDashboard onNavigate={(k) => setScreen(k)} t={t} lang={lang} />;
    }
    if (screen === "register") {
      return <PatientRegistration onBack={() => setScreen("home")} t={t} lang={lang} />;
    }
    if (screen === "members") {
      return (
        <AllMembers
          onBack={() => setScreen("home")}
          onNavigateToTriage={handleNavigateToTriage}
          onNavigateToReferral={handleNavigateToReferral}
          lang={lang}
        />
      );
    }
    if (screen === "triage") {
      return (
        <Triage
          onBack={() => {
            setTriagePatient(null);
            setScreen("home");
          }}
          onNavigateToReferral={handleNavigateToReferral}
          defaultPatient={triagePatient}
          t={t}
          lang={lang}
        />
      );
    }
    if (screen === "queue") {
      return (
        <PriorityQueue
          onBack={() => setScreen("home")}
          onRefer={handleNavigateToReferral}
          lang={lang}
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
          lang={lang}
        />
      );
    }
    if (screen === "polio") {
      return <ChildVaccineTracker onBack={() => setScreen("home")} />;
    }
    if (screen === "venom") {
      return <VenomousAnimalTracker onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "disaster") {
      return <DisasterMode onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "supply") {
      return <SupplyIntelligence onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "weather") {
      return <WeatherSeasonalAlerts onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "ai") {
      return <AIAssistant onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "hospital") {
      return <HospitalFinder onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "records") {
      return <PatientRecords onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "stats") {
      return <ReportsStats onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "outbreak") {
      return <OutbreakMonitor onBack={() => setScreen("home")} lang={lang} />;
    }
    if (screen === "about") {
      return <AboutApp onBack={() => setScreen("home")} lang={lang} />;
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

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              padding: "4px 6px",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "white",
              width: "auto",
              fontWeight: "600"
            }}
            title="Switch Language"
          >
            <option value="te">తెలుగు (Telugu)</option>
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>

          <button
            onClick={() => setScreen("about")}
            className="btn-outline"
            style={{ padding: "4px 8px", fontSize: "14px" }}
            title="About CareLink"
          >
            ℹ️
          </button>
        </div>
      </header>

      <div
        style={{
          background: "#F8FAFC",
          borderBottom: "1px solid var(--border)",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#475569"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#0F6CBD", fontSize: "13px" }}>📍</span>
          <span>
            <strong>{userLocation.village}</strong> &bull; {userLocation.coords}
          </span>
        </div>

        <span
          className="badge badge-low"
          style={{ fontSize: "10px", padding: "2px 6px" }}
        >
          🛰️ {userLocation.accuracy}
        </span>
      </div>

      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="mode-toggle">
          <button
            className={"mode-btn " + (mode === "citizen" ? "active" : "")}
            onClick={() => {
              setMode("citizen");
              setScreen("home");
            }}
          >
            👤 Citizen
          </button>
          <button
            className={"mode-btn " + (mode === "asha" ? "active" : "")}
            onClick={() => {
              setMode("asha");
              setScreen("home");
            }}
          >
            👩‍⚕️ ASHA Worker
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {mode === "asha" && ashaAuth && (
            <button
              onClick={handleAshaLogout}
              style={{
                background: "none",
                border: "1px solid #CBD5E1",
                padding: "4px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                color: "#64748B",
                cursor: "pointer"
              }}
              title="Logout ASHA session"
            >
              🔒 Logout
            </button>
          )}

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
      </div>

      {!isOnline && (
        <div className="status-banner status-offline">
          <span>📶 Operating in Offline Local-First Mode (Auto-cached on device)</span>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {screen === "about" ? (
          <AboutApp onBack={() => setScreen("home")} lang={lang} />
        ) : mode === "citizen" ? (
          <CitizenHome lang={lang} t={t} userLocation={userLocation} />
        ) : (
          renderAshaScreen()
        )}
      </main>

      <footer className="no-print" style={{ background: "white", borderTop: "1px solid var(--border)", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#94A3B8" }}>
        CareLink Rural Health Lifeline &bull; West Godavari (Relangi &bull; Tanuku &bull; Attili &bull; K.S. Gattu) &bull; Mode: <strong>{mode === "citizen" ? "Citizen View" : ashaAuth ? "ASHA: " + ashaAuth.name : "ASHA Worker Portal"}</strong>
      </footer>
    </div>
  );
}

export default App;
