import React, { useEffect, useState } from "react";
import { getLocal, subscribeToCollection } from "./dataStore";
import { AshaOutbreakReportModal } from "./AshaOutbreakReportModal";

export function HomeDashboard({ onNavigate, t, lang = "en", ashaProfile }) {
  const [patientCount, setPatientCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [assignedSchedules, setAssignedSchedules] = useState([]);
  const [stockAlertCount, setStockAlertCount] = useState(0);
  const [activeOutbreak, setActiveOutbreak] = useState(null);
  const [disasterActive, setDisasterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOutbreakModal, setShowOutbreakModal] = useState(false);

  const workerId = ashaProfile?.workerId || ashaProfile?.id || "ASHA-001";
  const workerVillage = ashaProfile?.village || "Relangi";

  useEffect(() => {
    // 1. Registered Citizens
    const unsubPatients = subscribeToCollection("patients", (patients) => {
      setPatientCount(patients.length);
    });

    // 2. High Priority Triage Cases
    const unsubTriage = subscribeToCollection("triage_records", (triages) => {
      setHighPriorityCount(
        triages.filter((tr) => tr.priorityLevel === "HIGH" || tr.priorityLevel === "CRITICAL").length
      );
    });

    // 3. Referrals Under Treatment
    const unsubRefs = subscribeToCollection("referrals", (refs) => {
      setReferralsCount(refs.filter((r) => r.status !== "Completed").length);
    });

    // 4. Schedules from Authority
    const unsubSchedules = subscribeToCollection("schedules", (list) => {
      const relevant = list.filter(
        (s) =>
          (s.assignedAshaId === workerId || s.village?.toLowerCase() === workerVillage.toLowerCase()) &&
          s.status !== "COMPLETED" &&
          s.status !== "CANCELLED"
      );
      setAssignedSchedules(relevant);
    });

    // 5. Village Outbreaks
    const outbreaks = getLocal("village_outbreaks");
    const hotspot = outbreaks.find((o) => o.cases >= 100);
    if (hotspot) setActiveOutbreak(hotspot);

    // 6. Disaster
    const disaster = getLocal("disaster_status");
    if (disaster && disaster.active) setDisasterActive(true);

    // 7. Stock alerts
    const supplies = getLocal("supply_inventory");
    const low = supplies.filter((s) => s.status === "Low Stock" || s.status === "Stockout").length;
    setStockAlertCount(low);

    return () => {
      unsubPatients();
      unsubTriage();
      unsubRefs();
      unsubSchedules();
    };
  }, [workerId, workerVillage]);

  const menuItems = [
    { key: "schedules", label: t.assignedSchedules || "Assigned Schedules & Camps", icon: "📅", color: "#0F6CBD", bg: "#EBF3FC", badge: assignedSchedules.length > 0 ? `${assignedSchedules.length} NEW` : null },
    { key: "register", label: t.registerPatient || "Register Patient", icon: "🧑‍🤝‍🧑", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "members", label: t.allMembers || "All Registered Members", icon: "👥", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "triage", label: t.triageScreening || "Triage & Screening", icon: "🩺", color: "#0D9488", bg: "#E6F7F5" },
    { key: "queue", label: t.priorityQueue || "Priority Queue", icon: "📋", color: "#DC2626", bg: "#FEF2F2" },
    { key: "referral", label: t.referral || "PHC Referral", icon: "🏥", color: "#D97706", bg: "#FFFBEB" },
    { key: "hospital", label: "Find Hospital & Beds", icon: "🚑", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "polio", label: t.vaccineTracker || "Child Vaccine Tracker", icon: "👶", color: "#F59E0B", bg: "#FEF3C7" },
    { key: "venom", label: t.venomTracker || "Snakebite & ASV Stock", icon: "🐍", color: "#DC2626", bg: "#FEE2E2" },
    { key: "disaster", label: t.disasterMode || "Disaster & Flood Mode", icon: "🌊", color: "#0284C7", bg: "#E0F2FE" },
    { key: "supply", label: t.supplyIntelligence || "Supply Storage Priority", icon: "💊", color: "#0D9488", bg: "#E6F7F5" },
    { key: "weather", label: t.weatherIntelligence || "Seasonal Intelligence", icon: "🌦️", color: "#0284C7", bg: "#E0F2FE" },
    { key: "records", label: t.patientRecords || "Patient Records", icon: "📁", color: "#7E22CE", bg: "#FAF5FF" },
    { key: "outbreak", label: t.outbreakAlert || "Outbreak Monitor", icon: "🏕️", color: "#DC2626", bg: "#FEE2E2" },
    { key: "ai", label: t.ashaAICopilot || "ASHA AI Copilot", icon: "🤖", color: "#7E22CE", bg: "#F3E8FF" },
    { key: "stats", label: t.reportsStats || "Reports & Stats", icon: "📊", color: "#0F6CBD", bg: "#EBF3FC" }
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content">
      {/* ASHA Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)",
          color: "white",
          padding: "18px",
          borderRadius: "16px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "32px" }}>👩‍⚕️</span>
            <div>
              <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>{t.ashaTitle}</h1>
              <p style={{ color: "#E0F2FE", margin: 0, fontSize: "12px" }}>
                {ashaProfile?.name || "Rani Devi"} &bull; {workerVillage} Health Beat
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOutbreakModal(true)}
            style={{
              background: "#DC2626",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            🚨 Report Outbreak
          </button>
        </div>

        {/* Real-time Field Indicators */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginTop: "14px", textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "9px", color: "#E0F2FE" }}>Registered</div>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{patientCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "9px", color: "#FEE2E2" }}>High Priority</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FCA5A5" }}>{highPriorityCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "9px", color: "#FEF3C7" }}>Tasks</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FDE68A" }}>{assignedSchedules.length}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "9px", color: "#E0F2FE" }}>Referrals</div>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{referralsCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "9px", color: "#FED7AA" }}>Low Stock</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: stockAlertCount > 0 ? "#FCA5A5" : "#86EFAC" }}>
              {stockAlertCount}
            </div>
          </div>
        </div>
      </div>

      {/* New Assigned Schedule Notification Banner */}
      {assignedSchedules.length > 0 && (
        <div
          onClick={() => onNavigate("schedules")}
          style={{
            background: "#E0F2FE",
            border: "1.5px solid #7DD3FC",
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>📅</span>
            <div>
              <strong style={{ fontSize: "13px", color: "#0369A1" }}>
                {assignedSchedules.length} New Schedule(s) Dispatched by Authority
              </strong>
              <div style={{ fontSize: "11px", color: "#0284C7" }}>
                Latest: {assignedSchedules[0].title} ({assignedSchedules[0].date})
              </div>
            </div>
          </div>
          <span className="badge" style={{ background: "#0F6CBD", color: "white" }}>
            VIEW &rarr;
          </span>
        </div>
      )}

      {/* Search Tools Input */}
      <input
        type="text"
        placeholder={lang === "te" ? "🔍 సాధనం వెతకండి..." : "🔍 Search tools (e.g. triage, hospital)..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "14px" }}
      />

      {/* Flood Alert Banner */}
      {disasterActive && (
        <div
          onClick={() => onNavigate("disaster")}
          style={{
            background: "#DC2626",
            color: "white",
            padding: "12px 14px",
            borderRadius: "14px",
            marginBottom: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🌊</span>
            <div>
              <strong style={{ fontSize: "13px" }}>Flood Alert Active: Godavari Lowlands</strong>
              <div style={{ fontSize: "11px", opacity: 0.9 }}>Relief shelters open in Relangi & Tanuku</div>
            </div>
          </div>
          <span className="badge" style={{ background: "white", color: "#DC2626" }}>VIEW &rarr;</span>
        </div>
      )}

      {/* Outbreak Hotspot Warning */}
      {activeOutbreak && (
        <div
          onClick={() => onNavigate("outbreak")}
          className="outbreak-alert-pulse"
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🚨</span>
            <div>
              <strong style={{ fontSize: "14px" }}>Outbreak Warning: {activeOutbreak.village}</strong>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                {activeOutbreak.cases} cases reported ({activeOutbreak.primaryCondition})
              </div>
            </div>
          </div>
          <span className="badge" style={{ background: "white", color: "#DC2626" }}>VIEW SOS &rarr;</span>
        </div>
      )}

      {/* 16-Tool Menu Grid */}
      {filteredMenuItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94A3B8", padding: "20px" }}>No matching tools found.</p>
      ) : (
        <div className="icon-card-grid">
          {filteredMenuItems.map((item) => (
            <div key={item.key} className="icon-card" onClick={() => onNavigate(item.key)} style={{ position: "relative" }}>
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "#0F6CBD",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: "bold",
                    padding: "2px 6px",
                    borderRadius: "10px"
                  }}
                >
                  {item.badge}
                </span>
              )}
              <div className="icon-card-bubble" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div className="icon-card-title">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Report Outbreak */}
      {showOutbreakModal && (
        <AshaOutbreakReportModal
          onClose={() => setShowOutbreakModal(false)}
          ashaProfile={ashaProfile}
          lang={lang}
        />
      )}
    </div>
  );
}

export default HomeDashboard;
