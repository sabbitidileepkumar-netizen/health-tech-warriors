import React, { useState, useEffect } from "react";
import {
  Droplet,
  Baby,
  Bot,
  Hospital,
  CloudRain,
  Pill,
  HeartHandshake,
  HeartPulse,
  Siren,
  Bell,
  CalendarDays
} from "lucide-react";
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
import { CareCoordination } from "./CareCoordination";
import { subscribeToCollection, markNotificationRead } from "./dataStore";

export function CitizenHome({ lang = "en", t, userLocation, userProfile, isGuest = false }) {
  const [activeScreen, setActiveScreen] = useState("home");
  const [showEmergency, setShowEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'services' | 'records' | 'notifications'

  // Live Database States for this Citizen
  const [myTriageRecords, setMyTriageRecords] = useState([]);
  const [myReferrals, setMyReferrals] = useState([]);
  const [myChildVaccines, setMyChildVaccines] = useState([]);
  const [villageSchedules, setVillageSchedules] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const citizenName = userProfile?.name || "Ravi Kumar";
  const citizenVillage = userProfile?.village || "Relangi";

  useEffect(() => {
    // 1. My Triage Records
    const unsubTriage = subscribeToCollection("triage_records", (list) => {
      const mine = list.filter(
        (r) =>
          r.patientName?.toLowerCase() === citizenName.toLowerCase() ||
          r.patientId === userProfile?.uid ||
          r.village?.toLowerCase() === citizenVillage.toLowerCase()
      );
      setMyTriageRecords(mine);
    });

    // 2. My Referrals
    const unsubRefs = subscribeToCollection("referrals", (list) => {
      const mine = list.filter(
        (r) =>
          r.patientName?.toLowerCase() === citizenName.toLowerCase() ||
          r.patientId === userProfile?.uid
      );
      setMyReferrals(mine);
    });

    // 3. Child Vaccines
    const unsubVax = subscribeToCollection("child_vaccines", (list) => {
      const mine = list.filter(
        (c) =>
          c.parentName?.toLowerCase().includes(citizenName.toLowerCase()) ||
          c.village?.toLowerCase() === citizenVillage.toLowerCase()
      );
      setMyChildVaccines(mine);
    });

    // 4. Village Schedules & Health Camps from Authority
    const unsubSched = subscribeToCollection("schedules", (list) => {
      const villageCamps = list.filter(
        (s) =>
          s.village?.toLowerCase() === citizenVillage.toLowerCase() &&
          s.status !== "CANCELLED"
      );
      setVillageSchedules(villageCamps);
    });

    // 5. Active Public Alerts
    const unsubAlerts = subscribeToCollection("alerts", (list) => {
      const relevant = list.filter(
        (a) =>
          a.active &&
          (a.targetType === "ALL" ||
            a.targetVillages?.some((v) => v.toLowerCase() === citizenVillage.toLowerCase())) &&
          (a.audience === "BOTH" || a.audience === "CITIZEN")
      );
      setActiveAlerts(relevant);
    });

    // 6. Citizen Notifications
    const unsubNotifs = subscribeToCollection("notifications", (list) => {
      const mine = list.filter(
        (n) =>
          n.recipientRole === "CITIZEN" ||
          n.recipientRole === "BOTH" ||
          n.recipientName?.toLowerCase() === citizenName.toLowerCase()
      );
      setNotifications(mine);
    });

    return () => {
      unsubTriage();
      unsubRefs();
      unsubVax();
      unsubSched();
      unsubAlerts();
      unsubNotifs();
    };
  }, [citizenName, citizenVillage, userProfile]);

  // Sub-screen routers
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
  if (activeScreen === "care") {
    return (
      <CareCoordination
        onBack={() => setActiveScreen("home")}
        lang={lang}
        userProfile={userProfile}
        isGuest={isGuest}
      />
    );
  }

  const citizenItems = [
    { key: "snake", icon: "🐍", bg: "#FEE2E2", color: "#DC2626", title: t.snakebiteEmergency || "Snakebite SOS", desc: t.snakebiteEmergencyDesc || "First aid & Anti-Venom" },
    { key: "blood", icon: Droplet, bg: "#FEE2E2", color: "#DC2626", title: t.bloodBank, desc: t.bloodBankDesc },
    { key: "polio", icon: Baby, bg: "#FEF3C7", color: "#D97706", title: t.childImmunization || "Child Polio Drops", desc: t.childImmunizationDesc || "Vaccination calendar" },
    { key: "ai", icon: Bot, bg: "#F3E8FF", color: "#7E22CE", title: t.aiAssistant || "AI Health Copilot", desc: t.aiAssistantDesc || "Voice medical advisor" },
    { key: "care", icon: CalendarDays, bg: "#E0F2FE", color: "#075985", title: lang === "te" ? "చికిత్స సమన్వయం" : lang === "hi" ? "देखभाल समन्वय" : lang === "mr" ? "सेवा समन्वय" : "Care coordination", desc: lang === "te" ? "అపాయింట్‌మెంట్, పరీక్షలు మరియు వీడియో సంప్రదింపు" : lang === "hi" ? "अपॉइंटमेंट, जांच और वीडियो परामर्श" : lang === "mr" ? "अपॉइंटमेंट, तपासण्या व व्हिडिओ सल्ला" : "Appointments, tests & video consult" },
    { key: "hospitals", icon: Hospital, bg: "#EBF3FC", color: "#0F6CBD", title: t.findHospital, desc: t.findHospitalDesc },
    { key: "weather", icon: CloudRain, bg: "#E0F2FE", color: "#0284C7", title: t.weatherAlerts || "Weather Alerts", desc: t.weatherAlertsDesc || "Flood & outbreak alerts" },
    { key: "medicines", icon: Pill, bg: "#E6F7F5", color: "#0D9488", title: t.medicines, desc: t.medicinesDesc },
    { key: "pregnancy", icon: HeartHandshake, bg: "#FFF7ED", color: "#F97316", title: t.pregnancyCare, desc: t.pregnancyCareDesc },
    { key: "organ", icon: HeartPulse, bg: "#F3E8FF", color: "#7E22CE", title: t.organDonation, desc: t.organDonationDesc }
  ];

  const filteredItems = citizenItems.filter((item) =>
    (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page-content">
      {/* Citizen Profile Card with Assigned ASHA Worker */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)",
          color: "white",
          padding: "16px 18px",
          borderRadius: "16px",
          marginBottom: "14px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>👤</span>
              <div>
                <h2 style={{ color: "white", fontSize: "17px", margin: 0 }}>
                  {citizenName} {isGuest && "(Guest Mode)"}
                </h2>
                <div style={{ fontSize: "12px", color: "#E0F2FE" }}>
                  📍 {citizenVillage} &bull; Blood: <strong>{userProfile?.bloodGroup || "O+"}</strong>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("notifications")}
            style={{
              position: "relative",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer"
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  background: "#DC2626",
                  color: "white",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

        {/* Assigned ASHA Worker Banner */}
        <div
          style={{
            marginTop: "12px",
            background: "rgba(255,255,255,0.15)",
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>👩‍⚕️</span>
            <span>
              Assigned ASHA: <strong>{userProfile?.assignedAshaName || "Rani Devi"}</strong> ({citizenVillage} Beat)
            </span>
          </div>
          <a
            href={`tel:${userProfile?.assignedAshaPhone || "9848011223"}`}
            style={{
              color: "white",
              textDecoration: "none",
              background: "rgba(255,255,255,0.25)",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600"
            }}
          >
            📞 Call
          </a>
        </div>
      </div>

      {/* Guest Mode Restriction Warning */}
      {isGuest && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1px solid #FDE68A",
            padding: "10px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            color: "#92400E",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>ℹ️</span>
          <span>
            Operating in <strong>Guest Mode</strong>. Public emergency tools are active. Sign in to view personal clinical records.
          </span>
        </div>
      )}

      {/* Active Public / Flood Alert from Higher Authority */}
      {activeAlerts.length > 0 && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1.5px solid #FECACA",
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "20px" }}>🚨</span>
            <strong style={{ color: "#DC2626", fontSize: "13px" }}>
              Public Health Advisory: {activeAlerts[0].title}
            </strong>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#7F1D1D", lineHeight: "1.4" }}>
            {activeAlerts[0].message}
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            flex: 1,
            padding: "8px 4px",
            borderRadius: "10px",
            border: activeTab === "dashboard" ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
            background: activeTab === "dashboard" ? "#EBF3FC" : "white",
            color: activeTab === "dashboard" ? "#0F6CBD" : "#64748B",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          🏠 My Health Lifeline
        </button>
        <button
          onClick={() => setActiveTab("services")}
          style={{
            flex: 1,
            padding: "8px 4px",
            borderRadius: "10px",
            border: activeTab === "services" ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
            background: activeTab === "services" ? "#EBF3FC" : "white",
            color: activeTab === "services" ? "#0F6CBD" : "#64748B",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          🩺 All Services
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          style={{
            flex: 1,
            padding: "8px 4px",
            borderRadius: "10px",
            border: activeTab === "notifications" ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
            background: activeTab === "notifications" ? "#EBF3FC" : "white",
            color: activeTab === "notifications" ? "#0F6CBD" : "#64748B",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          🔔 Alerts ({notifications.length})
        </button>
      </div>

      {/* TAB 1: MY HEALTH LIFELINE DASHBOARD */}
      {activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Emergency SOS Banner */}
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
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Siren size={32} color="#DC2626" />
              <div>
                <strong style={{ color: "#DC2626", fontSize: "15px" }}>{t.emergency}</strong>
                <p style={{ margin: 0, fontSize: "12px", color: "#991B1B" }}>{t.emergencyDesc}</p>
              </div>
            </div>
            <span className="badge" style={{ background: "#DC2626", color: "white" }}>108 CALL</span>
          </div>

          {/* Real Data: My Active PHC Referrals */}
          {myReferrals.length > 0 && (
            <div className="care-card" style={{ borderLeft: "4px solid #D97706" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "13px", color: "#0F172A" }}>🏥 My Hospital Referral Status</strong>
                <span className="badge badge-med">{myReferrals[0].status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                <div><strong>Facility:</strong> {myReferrals[0].facility}</div>
                <div><strong>Reason:</strong> {myReferrals[0].reason}</div>
                {myReferrals[0].ambulanceDispatched && (
                  <div style={{ color: "#DC2626", fontWeight: "600", marginTop: "2px" }}>
                    🚑 108 Ambulance Dispatched
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real Data: My Child Vaccination Schedule */}
          {myChildVaccines.length > 0 && (
            <div className="care-card" style={{ borderLeft: "4px solid #F59E0B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "13px", color: "#0F172A" }}>
                  👶 Child Immunization: {myChildVaccines[0].childName}
                </strong>
                <span
                  onClick={() => setActiveScreen("polio")}
                  style={{ fontSize: "11px", color: "#0F6CBD", cursor: "pointer", fontWeight: "600" }}
                >
                  View Schedule &rarr;
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                <div>
                  <strong>Next / Recent Dose:</strong>{" "}
                  {myChildVaccines[0].doses?.find((d) => d.status === "Upcoming")?.name || "All primary doses up to date"}
                </div>
                <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748B" }}>
                  Updated live by ASHA worker {myChildVaccines[0].assignedAshaId || "Rani Devi"}
                </div>
              </div>
            </div>
          )}

          {/* Real Data: Upcoming Village Health Camps */}
          {villageSchedules.length > 0 && (
            <div className="care-card" style={{ borderLeft: "4px solid #0F6CBD" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "13px", color: "#0F172A" }}>📅 Health Camps in {citizenVillage}</strong>
                <span className="badge" style={{ background: "#E0F2FE", color: "#0284C7" }}>
                  {villageSchedules[0].status}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                <div style={{ fontWeight: "600" }}>{villageSchedules[0].title}</div>
                <div>📅 Date: {villageSchedules[0].date} ({villageSchedules[0].time})</div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                  Assigned ASHA: {villageSchedules[0].assignedAshaName} &bull; Focus: {villageSchedules[0].task}
                </div>
              </div>
            </div>
          )}

          {/* Real Data: My Clinical Triage History */}
          {myTriageRecords.length > 0 && (
            <div className="care-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "13px", color: "#0F172A" }}>📋 Recent Clinical Triage Assessment</strong>
                <span
                  className={
                    myTriageRecords[0].priorityLevel === "CRITICAL"
                      ? "badge badge-high"
                      : myTriageRecords[0].priorityLevel === "HIGH"
                      ? "badge badge-high"
                      : "badge badge-low"
                  }
                >
                  {myTriageRecords[0].priorityLevel}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                <div><strong>Assessed by:</strong> {myTriageRecords[0].ashaName || "ASHA"}</div>
                {myTriageRecords[0].vitals && (
                  <div style={{ margin: "4px 0", fontSize: "11px" }}>
                    BP: {myTriageRecords[0].vitals.systolicBP || "—"}/{myTriageRecords[0].vitals.diastolicBP || "—"} &bull; Sugar:{" "}
                    {myTriageRecords[0].vitals.bloodSugar || "—"} mg/dL &bull; SpO2: {myTriageRecords[0].vitals.spo2 || "—"}%
                  </div>
                )}
                <div style={{ fontSize: "11px", color: "#0F6CBD" }}>
                  Status: Recorded on {new Date(myTriageRecords[0].timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Quick Access to Key Services */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
            <div
              className="care-card"
              onClick={() => setActiveScreen("care")}
              style={{ cursor: "pointer", textAlign: "center", padding: "14px", border: "1.5px solid #BAE6FD" }}
            >
              <span style={{ fontSize: "28px" }}>📅</span>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#075985", marginTop: "4px" }}>
                {lang === "te" ? "చికిత్స సమన్వయం" : lang === "hi" ? "देखभाल समन्वय" : lang === "mr" ? "सेवा समन्वय" : "Care Coordination"}
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>
                {lang === "te" ? "అపాయింట్‌మెంట్ & వీడియో సంప్రదింపు" : lang === "hi" ? "अपॉइंटमेंट और वीडियो परामर्श" : lang === "mr" ? "अपॉइंटमेंट व व्हिडिओ सल्ला" : "Appointments & video consult"}
              </div>
            </div>

            <div
              className="care-card"
              onClick={() => setActiveScreen("ai")}
              style={{ cursor: "pointer", textAlign: "center", padding: "14px", border: "1.5px solid #E9D5FF" }}
            >
              <span style={{ fontSize: "28px" }}>🤖</span>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#7E22CE", marginTop: "4px" }}>
                AI Health Copilot
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>Voice & Text Guidance</div>
            </div>

            <div
              className="care-card"
              onClick={() => setActiveScreen("hospitals")}
              style={{ cursor: "pointer", textAlign: "center", padding: "14px", border: "1.5px solid #BAE6FD" }}
            >
              <span style={{ fontSize: "28px" }}>🏥</span>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#0F6CBD", marginTop: "4px" }}>
                Hospitals & Beds
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>Find Local Facilities</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL SERVICES GRID */}
      {activeTab === "services" && (
        <div>
          <input
            type="text"
            placeholder={lang === "te" ? "🔍 సేవను వెతకండి..." : "🔍 Search services (e.g. blood, vaccine)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "14px" }}
          />

          <div className="icon-card-grid">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="icon-card" key={item.key} onClick={() => setActiveScreen(item.key)}>
                  <div className="icon-card-bubble" style={{ background: item.bg, color: item.color }}>
                    {typeof Icon === "string" ? Icon : <Icon size={28} color={item.color} />}
                  </div>
                  <div className="icon-card-title">{item.title}</div>
                  <div className="icon-card-desc">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS DRAWER */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", color: "#0F172A" }}>🔔 Health Alerts & Updates</h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>{notifications.length} Total</span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No new notifications.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  background: n.isRead ? "white" : "#F0FDF4",
                  border: n.isRead ? "1px solid var(--border)" : "1.5px solid #86EFAC",
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "13px", color: "#0F172A" }}>{n.title}</strong>
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          lang={lang}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}

export default CitizenHome;
