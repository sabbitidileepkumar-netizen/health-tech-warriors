import React, { useState, useEffect } from "react";
import { subscribeToCollection, getLocal } from "./dataStore";
import { AuthorityScheduleManager } from "./AuthorityScheduleManager";
import { AuthorityCampaignManager } from "./AuthorityCampaignManager";
import { AuthorityAlertsManager } from "./AuthorityAlertsManager";
import { AuthorityStockManager } from "./AuthorityStockManager";
import { AuthorityPolioScheduler } from "./AuthorityPolioScheduler";
import { AuthorityAshaManagement } from "./AuthorityAshaManagement";
import { AuthorityOutbreakReview } from "./AuthorityOutbreakReview";
import { AuthorityAuditLog } from "./AuthorityAuditLog";

export function AuthorityDashboard({ userProfile, onLogout, onSwitchPortal, lang = "en", t }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Real Metric States
  const [citizenCount, setCitizenCount] = useState(0);
  const [ashaCount, setAshaCount] = useState(0);
  const [triageCount, setTriageCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [vaxCoveragePct, setVaxCoveragePct] = useState(0);
  const [stockAlertCount, setStockAlertCount] = useState(0);
  const [activeOutbreaks, setActiveOutbreaks] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  useEffect(() => {
    // 1. Citizens
    const unsubPatients = subscribeToCollection("patients", (list) => {
      setCitizenCount(list.length);
    });

    // 2. ASHA Workers
    const unsubUsers = subscribeToCollection("users", (list) => {
      const ashas = list.filter((u) => u.role === "ASHA_WORKER");
      setAshaCount(ashas.length || 4);
    });

    // 3. Triage
    const unsubTriage = subscribeToCollection("triage_records", (list) => {
      setTriageCount(list.length);
      setHighPriorityCount(list.filter((t) => t.priorityLevel === "HIGH" || t.priorityLevel === "CRITICAL").length);
    });

    // 4. Referrals
    const unsubReferrals = subscribeToCollection("referrals", (list) => {
      setReferralsCount(list.filter((r) => r.status !== "Completed").length);
    });

    // 5. Vaccines
    const unsubVaccines = subscribeToCollection("child_vaccines", (list) => {
      let totalDoses = 0;
      let completedDoses = 0;
      list.forEach((c) => {
        (c.doses || []).forEach((d) => {
          totalDoses++;
          if (d.status === "Completed") completedDoses++;
        });
      });
      const pct = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 76;
      setVaxCoveragePct(pct);
    });

    // 6. Outbreaks
    const unsubOutbreaks = subscribeToCollection("outbreak_reports", (list) => {
      setActiveOutbreaks(list.filter((o) => o.status !== "RESOLVED"));
    });

    // 7. Schedules
    const unsubSchedules = subscribeToCollection("schedules", (list) => {
      setUpcomingSchedules(list.filter((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED"));
    });

    // 8. Stocks
    const stocks = getLocal("supply_inventory");
    const low = stocks.filter((s) => s.status === "Low Stock" || s.status === "Stockout").length;
    setStockAlertCount(low);

    return () => {
      unsubPatients();
      unsubUsers();
      unsubTriage();
      unsubReferrals();
      unsubVaccines();
      unsubOutbreaks();
      unsubSchedules();
    };
  }, []);

  const navItems = [
    { key: "overview", label: "📊 Overview", icon: "📊" },
    { key: "polio", label: "👶 Polio Drops Scheduler", icon: "👶" },
    { key: "stock", label: "💊 Dynamic Medicine Stock", icon: "💊" },
    { key: "schedules", label: "📅 All Schedules & Camps", icon: "📅" },
    { key: "campaigns", label: "📢 Campaigns", icon: "📢" },
    { key: "alerts", label: "🚨 Public Alerts", icon: "🚨" },
    { key: "workforce", label: "👩‍⚕️ ASHA Workforce", icon: "👩‍⚕️" },
    { key: "outbreaks", label: "🏕️ Outbreak Review", icon: "🏕️" },
    { key: "audit", label: "📜 Audit Logs", icon: "📜" }
  ];

  return (
    <div className="page-content" style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Executive Command Center Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #0F6CBD 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "18px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "36px" }}>🏛️</span>
            <div>
              <h1 style={{ color: "white", fontSize: "19px", margin: 0, fontWeight: "800" }}>
                {t.authorityTitle || "District Public Health Command Center"}
              </h1>
              <p style={{ color: "#E0F2FE", margin: "2px 0 0", fontSize: "12px" }}>
                {userProfile?.name || "Dr. K.V. Rao"} &bull; {userProfile?.jurisdiction || "West Godavari District"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {onSwitchPortal && (
              <button
                onClick={onSwitchPortal}
                style={{
                  background: "rgba(255, 255, 255, 0.22)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.45)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title="Return to the 4 Portals Hub"
              >
                <span>🏠</span>
                <span>Portals Hub</span>
              </button>
            )}
            <button
              onClick={onLogout}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Executive Real-Time Indicators */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginTop: "16px",
            textAlign: "center"
          }}
        >
          <div style={{ background: "rgba(255, 255, 255, 0.12)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#BAE6FD" }}>Total Citizens</div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{citizenCount}</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.12)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#BAE6FD" }}>Active ASHA</div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{ashaCount}</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.12)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#FCA5A5" }}>High Priority</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FECACA" }}>{highPriorityCount}</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.12)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#BBF7D0" }}>UIP Coverage</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#86EFAC" }}>{vaxCoveragePct}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "16px",
          overflowX: "auto",
          paddingBottom: "6px"
        }}
      >
        {navItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              border: activeTab === tab.key ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
              background: activeTab === tab.key ? "#0F6CBD" : "white",
              color: activeTab === tab.key ? "white" : "#475569",
              fontWeight: activeTab === tab.key ? "700" : "500",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: activeTab === tab.key ? "0 2px 6px rgba(15,108,189,0.3)" : "none"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Active Outbreak Warning Banner */}
          {activeOutbreaks.length > 0 && (
            <div
              onClick={() => setActiveTab("outbreaks")}
              style={{
                background: "#FEF2F2",
                border: "2px solid #FECACA",
                borderRadius: "14px",
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "28px" }}>🚨</span>
                <div>
                  <strong style={{ color: "#DC2626", fontSize: "14px" }}>
                    {activeOutbreaks.length} Active Village Outbreak(s) Under Review
                  </strong>
                  <div style={{ fontSize: "12px", color: "#991B1B" }}>
                    Latest: {activeOutbreaks[0].village} ({activeOutbreaks[0].affectedCount} cases &bull;{" "}
                    {activeOutbreaks[0].condition})
                  </div>
                </div>
              </div>
              <span className="badge" style={{ background: "#DC2626", color: "white" }}>
                REVIEW &rarr;
              </span>
            </div>
          )}

          {/* Quick KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="care-card" style={{ textAlign: "center", padding: "16px" }}>
              <span style={{ fontSize: "28px" }}>📋</span>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Pending Referrals</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#D97706" }}>{referralsCount}</div>
              <div style={{ fontSize: "11px", color: "#94A3B8" }}>Hospital cases under treatment</div>
            </div>

            <div className="care-card" style={{ textAlign: "center", padding: "16px" }}>
              <span style={{ fontSize: "28px" }}>💊</span>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Supply Alerts</div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: stockAlertCount > 0 ? "#DC2626" : "#16A34A"
                }}
              >
                {stockAlertCount}
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8" }}>ASV / buffer items low</div>
            </div>
          </div>

          {/* Upcoming Schedules Widget */}
          <div className="care-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "#0F172A" }}>📅 Upcoming Health Camps & Schedules</h3>
              <button
                onClick={() => setActiveTab("schedules")}
                style={{ background: "none", border: "none", color: "#0F6CBD", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
              >
                View All &rarr;
              </button>
            </div>

            {upcomingSchedules.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No active schedules pending.</p>
            ) : (
              upcomingSchedules.slice(0, 3).map((sch) => (
                <div
                  key={sch.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "13px", color: "#1E293B" }}>{sch.title}</strong>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>
                      📍 {sch.village} &bull; 👩‍⚕️ {sch.assignedAshaName || "ASHA"} &bull; 📅 {sch.date}
                    </div>
                  </div>
                  <span className="badge badge-med" style={{ fontSize: "10px" }}>
                    {sch.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* District Surveillance Summary */}
          <div className="care-card" style={{ background: "#F8FAFC" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0F172A" }}>
              🗺️ District Health Jurisdictions (West Godavari)
            </h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#64748B" }}>
              Active surveillance network covering 4 village health beats:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong>Relangi:</strong> Sub-Centre & Flood Post (142 Citizens)
              </div>
              <div style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong>Tanuku:</strong> Area Hospital & CHC (185 Citizens)
              </div>
              <div style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong>Attili:</strong> 24x7 PHC & Cold Chain (120 Citizens)
              </div>
              <div style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong>K.S. Gattu:</strong> Remote Tribal Beat (95 Citizens)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "polio" && <AuthorityPolioScheduler lang={lang} />}
      {activeTab === "stock" && <AuthorityStockManager lang={lang} />}
      {activeTab === "schedules" && <AuthorityScheduleManager lang={lang} />}
      {activeTab === "campaigns" && <AuthorityCampaignManager lang={lang} />}
      {activeTab === "alerts" && <AuthorityAlertsManager lang={lang} />}
      {activeTab === "workforce" && <AuthorityAshaManagement lang={lang} onAssignSchedule={() => setActiveTab("schedules")} />}
      {activeTab === "outbreaks" && <AuthorityOutbreakReview lang={lang} />}
      {activeTab === "audit" && <AuthorityAuditLog lang={lang} />}
    </div>
  );
}

export default AuthorityDashboard;
