import React, { useEffect, useState } from "react";
import { getLocal, subscribeToCollection } from "./dataStore";
import { AshaOutbreakReportModal } from "./AshaOutbreakReportModal";
import {
  Calendar,
  UserPlus,
  Users,
  Stethoscope,
  ClipboardList,
  Hospital,
  Ambulance,
  Baby,
  ShieldAlert,
  Waves,
  Pill,
  CloudSun,
  FolderArchive,
  AlertTriangle,
  Bot,
  BarChart3,
  Search,
  ArrowRight,
  UserCheck,
  Video
} from "lucide-react";

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
    {
      key: "schedules",
      label: t.assignedSchedules || "Assigned Schedules & Camps",
      icon: <Calendar size={24} color="#0F6CBD" />,
      color: "#0F6CBD",
      bg: "#EBF3FC",
      badge: assignedSchedules.length > 0 ? `${assignedSchedules.length} NEW` : null
    },
    {
      key: "register",
      label: t.registerPatient || "Register Patient",
      icon: <UserPlus size={24} color="#0F6CBD" />,
      color: "#0F6CBD",
      bg: "#EBF3FC"
    },
    {
      key: "members",
      label: t.allMembers || "All Registered Members",
      icon: <Users size={24} color="#0F6CBD" />,
      color: "#0F6CBD",
      bg: "#EBF3FC"
    },
    {
      key: "triage",
      label: t.triageScreening || "Triage & Screening",
      icon: <Stethoscope size={24} color="#0D9488" />,
      color: "#0D9488",
      bg: "#E6F7F5"
    },
    {
      key: "queue",
      label: t.priorityQueue || "Priority Queue",
      icon: <ClipboardList size={24} color="#DC2626" />,
      color: "#DC2626",
      bg: "#FEF2F2"
    },
    {
      key: "followup",
      label: lang === "te" ? "అధిక ప్రమాద ఫాలో-అప్" : "High-Risk Follow-up",
      icon: <AlertTriangle size={24} color="#B91C1C" />,
      color: "#B91C1C",
      bg: "#FEE2E2"
    },
    {
      key: "referral",
      label: t.referral || "PHC Referral",
      icon: <Hospital size={24} color="#D97706" />,
      color: "#D97706",
      bg: "#FFFBEB"
    },
    {
      key: "care",
      label: lang === "te" ? "చికిత్స సమన్వయం" : lang === "hi" ? "देखभाल समन्वय" : lang === "mr" ? "सेवा समन्वय" : "Care Coordination",
      icon: <Video size={24} color="#7E22CE" />,
      color: "#7E22CE",
      bg: "#F3E8FF"
    },
    {
      key: "hospital",
      label: "Find Hospital & Beds",
      icon: <Ambulance size={24} color="#0F6CBD" />,
      color: "#0F6CBD",
      bg: "#EBF3FC"
    },
    {
      key: "polio",
      label: t.vaccineTracker || "Child Vaccine Tracker",
      icon: <Baby size={24} color="#F59E0B" />,
      color: "#F59E0B",
      bg: "#FEF3C7"
    },
    {
      key: "venom",
      label: t.venomTracker || "Snakebite & ASV Stock",
      icon: <ShieldAlert size={24} color="#DC2626" />,
      color: "#DC2626",
      bg: "#FEE2E2"
    },
    {
      key: "disaster",
      label: t.disasterMode || "Disaster & Flood Mode",
      icon: <Waves size={24} color="#0284C7" />,
      color: "#0284C7",
      bg: "#E0F2FE"
    },
    {
      key: "supply",
      label: t.supplyIntelligence || "Supply Storage Priority",
      icon: <Pill size={24} color="#0D9488" />,
      color: "#0D9488",
      bg: "#E6F7F5"
    },
    {
      key: "weather",
      label: t.weatherIntelligence || "Seasonal Intelligence",
      icon: <CloudSun size={24} color="#0284C7" />,
      color: "#0284C7",
      bg: "#E0F2FE"
    },
    {
      key: "records",
      label: t.patientRecords || "Patient Records",
      icon: <FolderArchive size={24} color="#7E22CE" />,
      color: "#7E22CE",
      bg: "#FAF5FF"
    },
    {
      key: "outbreak",
      label: t.outbreakAlert || "Outbreak Monitor",
      icon: <AlertTriangle size={24} color="#DC2626" />,
      color: "#DC2626",
      bg: "#FEE2E2"
    },
    {
      key: "ai",
      label: t.ashaAICopilot || "ASHA AI Copilot",
      icon: <Bot size={24} color="#7E22CE" />,
      color: "#7E22CE",
      bg: "#F3E8FF"
    },
    {
      key: "stats",
      label: t.reportsStats || "Reports & Stats",
      icon: <BarChart3 size={24} color="#0F6CBD" />,
      color: "#0F6CBD",
      bg: "#EBF3FC"
    }
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* ASHA Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)",
          color: "white",
          padding: "20px 22px",
          borderRadius: "18px",
          marginBottom: "18px",
          boxShadow: "0 10px 25px -4px rgba(15, 108, 189, 0.25)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              <UserCheck size={26} color="#0F6CBD" />
            </div>
            <div>
              <h1 style={{ color: "white", fontSize: "20px", margin: 0, fontWeight: "800" }}>{t.ashaTitle}</h1>
              <p style={{ color: "#E0F2FE", margin: "2px 0 0 0", fontSize: "13px" }}>
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
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
            }}
          >
            <AlertTriangle size={14} /> Report Outbreak SOS
          </button>
        </div>

        {/* Real-time Field Indicators */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
            marginTop: "16px",
            textAlign: "center"
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.14)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#E0F2FE", fontWeight: "600" }}>Registered</div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>{patientCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.14)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#FEE2E2", fontWeight: "600" }}>High Priority</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#FCA5A5" }}>{highPriorityCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.14)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#FEF3C7", fontWeight: "600" }}>Tasks</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#FDE68A" }}>{assignedSchedules.length}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.14)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#E0F2FE", fontWeight: "600" }}>Referrals</div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>{referralsCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.14)", padding: "10px 4px", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#FED7AA", fontWeight: "600" }}>Low Stock</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: stockAlertCount > 0 ? "#FCA5A5" : "#86EFAC" }}>
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
            padding: "12px 16px",
            marginBottom: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Calendar size={20} color="#0284C7" />
            </div>
            <div>
              <strong style={{ fontSize: "13px", color: "#0369A1" }}>
                {assignedSchedules.length} New Schedule(s) Dispatched by Authority
              </strong>
              <div style={{ fontSize: "11px", color: "#0284C7" }}>
                Latest: {assignedSchedules[0].title} ({assignedSchedules[0].date})
              </div>
            </div>
          </div>
          <span className="badge" style={{ background: "#0F6CBD", color: "white", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            VIEW <ArrowRight size={12} />
          </span>
        </div>
      )}

      {/* Search Tools Input with Vector Icon */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search
          size={18}
          color="#94A3B8"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }}
        />
        <input
          type="text"
          placeholder={lang === "te" ? "సాధనం వెతకండి (ట్రయాజ్, ఆసుపత్రి)..." : "Search clinical tools (e.g. triage, hospital)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: "42px",
            paddingRight: "14px",
            fontSize: "14px",
            borderRadius: "12px"
          }}
        />
      </div>

      {/* Flood Alert Banner */}
      {disasterActive && (
        <div
          onClick={() => onNavigate("disaster")}
          style={{
            background: "#DC2626",
            color: "white",
            padding: "12px 16px",
            borderRadius: "14px",
            marginBottom: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Waves size={24} color="white" />
            <div>
              <strong style={{ fontSize: "13px" }}>Flood Alert Active: Godavari Lowlands</strong>
              <div style={{ fontSize: "11px", opacity: 0.9 }}>Relief shelters open in Relangi &amp; Tanuku</div>
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
          style={{ cursor: "pointer", borderRadius: "14px", padding: "12px 16px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={24} color="white" />
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
        <p style={{ textAlign: "center", color: "#94A3B8", padding: "24px" }}>No matching tools found.</p>
      ) : (
        <div className="icon-card-grid">
          {filteredMenuItems.map((item) => (
            <div
              key={item.key}
              className="icon-card"
              onClick={() => onNavigate(item.key)}
              style={{ position: "relative" }}
            >
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
