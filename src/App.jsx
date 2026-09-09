import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import { initStore } from "./dataStore";
import { initSyncListener, subscribeSyncStatus } from "./offlineSync";
import { AuthProvider, useAuth } from "./AuthContext";
import { AuthScreen } from "./AuthScreen";
import { LanguageSelectScreen } from "./LanguageSelectScreen";
import { PortalHub } from "./PortalHub";

import { CitizenHome } from "./CitizenHome";
import { AuthorityDashboard } from "./AuthorityDashboard";
import HomeDashboard from "./HomeDashboard";
import PatientRegistration from "./PatientRegistration";
import Triage from "./Triage";
import PriorityQueue from "./PriorityQueue";
import Referral from "./Referral";
import PatientRecords from "./PatientRecords";
import ReportsStats from "./ReportsStats";
import { OutbreakMonitor } from "./OutbreakMonitor";
import { AboutApp } from "./AboutApp";

// Modules
import { AllMembers } from "./AllMembers";
import { VenomousAnimalTracker } from "./VenomousAnimalTracker";
import { WeatherSeasonalAlerts } from "./WeatherSeasonalAlerts";
import { DisasterMode } from "./DisasterMode";
import { SupplyIntelligence } from "./SupplyIntelligence";
import { AIAssistant } from "./AIAssistant";
import HospitalFinder from "./HospitalFinder";
import ChildVaccineTracker from "./ChildVaccineTracker";
import { AshaScheduleTasks } from "./AshaScheduleTasks";

function AppContent() {
  const { user, userProfile, role, isGuest, logout } = useAuth();

  const [lang, setLang] = useState(() => {
    return typeof localStorage !== "undefined" ? localStorage.getItem("carelink_lang") || "te" : "te";
  });

  // Track language selection confirmation (Screen 2 from sketch)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    return typeof sessionStorage !== "undefined" ? Boolean(sessionStorage.getItem("carelink_lang_confirmed")) : false;
  });

  // Track app view: "language" | "hub" | "portal"
  const [appView, setAppView] = useState(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("carelink_lang_confirmed")) {
      return "hub";
    }
    return "language";
  });

  // Track active portal: "citizen" | "asha" | "authority" | "about"
  const [activePortal, setActivePortal] = useState(() => {
    if (role === "HIGHER_AUTHORITY") return "authority";
    if (role === "ASHA_WORKER") return "asha";
    return "citizen";
  });

  useEffect(() => {
    if (role === "HIGHER_AUTHORITY") {
      setActivePortal("authority");
    } else if (role === "ASHA_WORKER") {
      setActivePortal("asha");
    } else if (role === "CITIZEN" || isGuest) {
      setActivePortal("citizen");
    }
  }, [role, isGuest]);

  const [screen, setScreen] = useState("home");
  const [syncStatus, setSyncStatus] = useState("SYNCED");
  const [pendingCount, setPendingCount] = useState(0);
  const [referralPatient, setReferralPatient] = useState(null);
  const [triagePatient, setTriagePatient] = useState(null);

  const [userLocation, setUserLocation] = useState({
    village: "Detecting location...",
    coords: "—",
    accuracy: "Locating..."
  });

  useEffect(() => {
    initStore();
    initSyncListener();

    const unsubSync = subscribeSyncStatus((st, count) => {
      setSyncStatus(st);
      setPendingCount(count);
    });

    // Reverse geocode user coordinates
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
          "Relangi, West Godavari"
        );
      } catch (_e) {
        return "Relangi, West Godavari";
      }
    };

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
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
            village: "Relangi (Default)",
            coords: "16.704° N, 81.630° E",
            accuracy: "GPS Default Mode"
          });
        },
        { timeout: 5000 }
      );
    }

    return () => unsubSync();
  }, []);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("carelink_lang", newLang);
    }
  };

  const t = translations[lang] || translations.te || translations.en;

  const handleNavigateToReferral = (patient) => {
    setReferralPatient(patient);
    setScreen("referral");
  };

  const handleNavigateToTriage = (patient) => {
    setTriagePatient(patient);
    setScreen("triage");
  };

  const handleLogout = async () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("carelink_lang_confirmed");
    }
    setHasSelectedLanguage(false);
    setAppView("language");
    await logout();
  };

  // Screen 1 from sketch: Authentication (Email/Pass, Google, Guest, Demo)
  if (!user && !isGuest) {
    return <AuthScreen lang={lang} setLang={handleLangChange} t={t} />;
  }

  // Screen 2 from sketch: Select Languages
  if (!hasSelectedLanguage || appView === "language") {
    return (
      <LanguageSelectScreen
        currentLang={lang}
        onSelectLang={handleLangChange}
        onContinue={(chosenLang) => {
          handleLangChange(chosenLang);
          setHasSelectedLanguage(true);
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("carelink_lang_confirmed", "true");
          }
          setAppView("hub");
        }}
      />
    );
  }

  // Screen 3 from sketch: Portals Hub (2x2 Grid)
  if (appView === "hub") {
    return (
      <PortalHub
        user={user}
        userProfile={userProfile}
        role={role}
        isGuest={isGuest}
        lang={lang}
        t={t}
        onSelectPortal={(portalId) => {
          if (portalId === "about") {
            setScreen("about");
          } else {
            setScreen("home");
          }
          setActivePortal(portalId);
          setAppView("portal");
        }}
        onOpenLanguageSelect={() => {
          setAppView("language");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Render ASHA Screen
  const renderAshaScreen = () => {
    if (screen === "home") {
      return (
        <HomeDashboard
          onNavigate={(k) => setScreen(k)}
          t={t}
          lang={lang}
          ashaProfile={userProfile}
        />
      );
    }
    if (screen === "schedules") {
      return (
        <AshaScheduleTasks
          onBack={() => setScreen("home")}
          currentWorkerId={userProfile?.workerId || "ASHA-001"}
          currentVillage={userProfile?.village || "Relangi"}
          lang={lang}
        />
      );
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

  const getSyncBadge = () => {
    switch (syncStatus) {
      case "SYNCED":
        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0"
            }}
          >
            {t.syncSynced || "🟢 SYNCED"}
          </span>
        );
      case "SYNCING":
        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE"
            }}
          >
            {t.syncSyncing || "🔄 SYNCING"} ({pendingCount})
          </span>
        );
      case "OFFLINE":
        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FDE68A"
            }}
          >
            {t.syncOffline || "📶 OFFLINE"} {pendingCount > 0 ? `(${pendingCount})` : ""}
          </span>
        );
      case "SYNC_FAILED":
        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              border: "1px solid #FECACA"
            }}
          >
            {t.syncFailed || "⚠️ SYNC FAILED"}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* CareLink Header */}
      <header className="header-bar">
        <div
          className="brand-badge"
          onClick={() => setAppView("hub")}
          style={{ cursor: "pointer" }}
          title="Return to Portals Hub"
        >
          <div className="brand-logo">CL</div>
          <div>
            <div className="brand-title">{t.appTitle}</div>
            <div className="brand-tagline">{t.tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Portals Hub Quick Access Button */}
          <button
            onClick={() => setAppView("hub")}
            style={{
              background: "#EBF3FC",
              border: "1.5px solid #0F6CBD",
              color: "#0F6CBD",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
            title="Return to the 4 Portals Hub"
          >
            <span>🏠</span>
            <span>{lang === "te" ? "పోర్టల్స్ హబ్" : "Portals Hub"}</span>
          </button>

          {/* Language Switcher */}
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
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

          {/* About App button */}
          <button
            onClick={() => {
              setActivePortal("about");
              setScreen("about");
            }}
            className="btn-outline"
            style={{ padding: "4px 8px", fontSize: "14px" }}
            title="About CareLink"
          >
            ℹ️
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #CBD5E1",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#64748B",
              cursor: "pointer",
              fontWeight: "600"
            }}
            title="Sign out of CareLink"
          >
            🔒 {t.logout || "Logout"}
          </button>
        </div>
      </header>

      {/* Geolocation Bar */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {getSyncBadge()}
        </div>
      </div>

      {/* Role Confirmation Sub-Bar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            className="badge"
            style={{
              background:
                activePortal === "authority"
                  ? "#EEF2FF"
                  : activePortal === "asha"
                  ? "#E6F7F5"
                  : activePortal === "about"
                  ? "#F5F3FF"
                  : "#EBF3FC",
              color:
                activePortal === "authority"
                  ? "#4F46E5"
                  : activePortal === "asha"
                  ? "#0D9488"
                  : activePortal === "about"
                  ? "#7C3AED"
                  : "#0F6CBD",
              fontWeight: "700"
            }}
          >
            {activePortal === "authority"
              ? "🏛️ Higher Authority Portal"
              : activePortal === "asha"
              ? "👩‍⚕️ ASHA Worker Portal"
              : activePortal === "about"
              ? "ℹ️ About CareLink"
              : isGuest
              ? "🌐 Guest View"
              : "👤 Citizen Portal"}
          </span>
          <span style={{ fontSize: "12px", color: "#64748B" }}>
            {userProfile?.name || user?.email}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#94A3B8" }}>
            Village: <strong>{userProfile?.village || "Relangi"}</strong>
          </span>
          <button
            onClick={() => setAppView("hub")}
            style={{
              background: "#F1F5F9",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              padding: "2px 8px",
              color: "#0F6CBD",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            title="Switch to another portal"
          >
            ⇄ Switch Portal
          </button>
        </div>
      </div>

      {/* Offline Status Warning Banner */}
      {syncStatus === "OFFLINE" && (
        <div className="status-banner status-offline">
          <span>📶 Operating in Offline Local-First Mode (Auto-cached on device)</span>
        </div>
      )}

      {/* Main Content Area Protected by RBAC & Portals */}
      <main style={{ flex: 1 }}>
        {activePortal === "about" || screen === "about" ? (
          <AboutApp onBack={() => setAppView("hub")} lang={lang} />
        ) : activePortal === "authority" ? (
          <AuthorityDashboard
            userProfile={userProfile}
            onLogout={handleLogout}
            onSwitchPortal={() => setAppView("hub")}
            lang={lang}
            t={t}
          />
        ) : activePortal === "asha" ? (
          renderAshaScreen()
        ) : (
          <CitizenHome
            lang={lang}
            t={t}
            userLocation={userLocation}
            userProfile={userProfile}
            isGuest={isGuest}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className="no-print"
        style={{
          background: "white",
          borderTop: "1px solid var(--border)",
          padding: "10px 16px",
          textAlign: "center",
          fontSize: "11px",
          color: "#94A3B8"
        }}
      >
        CareLink Rural Health Lifeline &bull; West Godavari (Relangi &bull; Tanuku &bull; Attili &bull; K.S. Gattu) &bull; Mode:{" "}
        <strong>
          {activePortal === "authority"
            ? "Public Health Command (DM&HO)"
            : activePortal === "asha"
            ? "ASHA Portal: " + (userProfile?.name || "Field Worker")
            : activePortal === "about"
            ? "App Documentation"
            : isGuest
            ? "Public Guest View"
            : "Citizen View: " + (userProfile?.name || "Verified Citizen")}
        </strong>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
