import React, { useState, useEffect } from "react";
import { subscribeToChildVaccines, updateChildDoseStatusFirestore, subscribeToCollection } from "./dataStore";
import { sendSms } from "./smsHelper";

export function ChildImmunization({ onBack, lang = "en" }) {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [smsAlert, setSmsAlert] = useState(null);
  const [sendingDoseId, setSendingDoseId] = useState(null);
  const [activePolioDrive, setActivePolioDrive] = useState(null);

  useEffect(() => {
    const unsub = subscribeToChildVaccines((list) => {
      setChildren(list);
      if (list.length > 0 && !selectedChildId) {
        setSelectedChildId(list[0].id);
      }
    });

    const unsubSchedules = subscribeToCollection("schedules", (list) => {
      const polio = list.find(
        (s) =>
          (s.isPolioDrive || s.category === "POLIO_CAMPAIGN" || s.title?.toLowerCase().includes("polio")) &&
          s.status !== "CANCELLED"
      );
      if (polio) setActivePolioDrive(polio);
    });

    return () => {
      unsub();
      unsubSchedules();
    };
  }, []);

  const activeChild = children.find((c) => c.id === selectedChildId);

  const handleToggleDose = async (child, dose) => {
    const nextStatus = dose.status === "Completed" ? "Upcoming" : "Completed";
    try {
      await updateChildDoseStatusFirestore(child.id, dose.id, child.doses, nextStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async (child, dose) => {
    const message = lang === "te"
      ? "కేర్ లింక్ ఆశా అలర్ట్: నమస్తే " + child.parentName + " గారు, మీ బిడ్డ " + child.childName + " కి " + dose.name + " టీకా సమయం అయింది. సమీప అంగన్‌వాడీకి తీసుకురండి."
      : "CareLink ASHA Reminder: Namaste " + child.parentName + ", vaccine dose '" + dose.name + "' is due for " + child.childName + ". Please visit nearest Anganwadi centre.";

    setSendingDoseId(dose.id);
    const result = await sendSms(child.phone, message);
    setSendingDoseId(null);

    setSmsAlert({ phone: child.phone, msg: message, success: result.success });
    setTimeout(() => {
      setSmsAlert(null);
    }, 7000);
  };

  const calculateProgress = (doses = []) => {
    if (doses.length === 0) return 0;
    const completed = doses.filter((d) => d.status === "Completed").length;
    return Math.round((completed / doses.length) * 100);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEF3C7", color: "#B45309" }}>UIP National Schedule</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>👶</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "పిల్లల పోలియో & సమగ్ర టీకా షెడ్యూల్" : "Child Polio & National Immunization"}
            </h1>
            <p style={{ color: "#FEF3C7", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "రెండు చుక్కల పోలియో - సంపూర్ణ రక్షణ. ప్రతి శిశువుకు నిర్ణీత సమయంలో టీకాలు."
                : "Birth to 5 years longitudinal vaccine tracking & Pulse Polio drives"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: "#EFF6FF", border: "1.5px solid #93C5FD", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>📢</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "4px" }}>
              <strong style={{ color: "#1D4ED8", fontSize: "14px" }}>
                {activePolioDrive?.title || (lang === "te" ? "రాష్ట్ర పల్స్ పోలియో ప్రత్యేక డ్రైవ్ 2026" : "Upcoming Pulse Polio Special Campaign 2026")}
              </strong>
              {activePolioDrive?.date && (
                <span className="badge" style={{ background: "#DBEAFE", color: "#1D4ED8", fontWeight: "700" }}>
                  📅 {activePolioDrive.date}
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#1E40AF" }}>
              {activePolioDrive
                ? `📍 Booth: ${activePolioDrive.boothVenue || activePolioDrive.village} • ⏰ ${activePolioDrive.time || "08:00 AM - 04:00 PM"} (Assigned ASHA: ${activePolioDrive.assignedAshaName || "Local Worker"})`
                : (lang === "te"
                  ? "తణుకు, రిలంగి, అత్తిలి పరిధిలోని 0-5 సంవత్సరాల పిల్లలందరికీ బూత్‌లలో చుక్కల మందు వేయబడును."
                  : "Mandatory oral polio drops for all 0-5 yr children across Tanuku, Relangi & Attili Anganwadis.")}
            </p>
          </div>
        </div>
      </div>

      {smsAlert && (
        <div style={{
          background: smsAlert.success ? "#ECFDF5" : "#FEF2F2",
          border: smsAlert.success ? "1.5px solid #10B981" : "1.5px solid #FCA5A5",
          borderRadius: "12px", padding: "12px", marginBottom: "16px"
        }}>
          <strong style={{ color: smsAlert.success ? "#065F46" : "#991B1B", fontSize: "13px" }}>
            {smsAlert.success ? `📲 SMS sent to ${smsAlert.phone}:` : `⚠️ Could not send SMS (offline or error):`}
          </strong>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#047857", fontStyle: "italic" }}>
            "{smsAlert.msg}"
          </p>
        </div>
      )}

      <div style={{ marginBottom: "14px" }}>
        <label style={{ fontSize: "13px", fontWeight: "bold" }}>
          👶 {lang === "te" ? "పిల్లల రికార్డును ఎంచుకోండి:" : "Select Registered Child:"}
        </label>
        {children.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "6px" }}>
            No children registered yet. Ask your ASHA worker to register your child first.
          </p>
        ) : (
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{ marginTop: "6px" }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.childName} ({c.village}) - Parent: {c.parentName}
              </option>
            ))}
          </select>
        )}
      </div>

      {activeChild && (
        <div>
          <div className="care-card" style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "#0F172A" }}>{activeChild.childName}</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                  🏡 {activeChild.village} &bull; 📞 {activeChild.phone}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#D97706" }}>
                  {calculateProgress(activeChild.doses)}%
                </span>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Vaccinated</div>
              </div>
            </div>

            <div style={{ width: "100%", background: "#E2E8F0", height: "8px", borderRadius: "4px", marginTop: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: calculateProgress(activeChild.doses) + "%",
                  background: "#D97706",
                  height: "100%",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
          </div>

          <h3 style={{ marginBottom: "10px" }}>
            {lang === "te" ? "టీకాల కాలక్రమం (Immunization Timeline)" : "Vaccine Doses Timeline"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeChild.doses.map((dose) => {
              const isDone = dose.status === "Completed";
              const isDue = dose.status === "Due Today";
              return (
                <div
                  key={dose.id}
                  className="care-card"
                  style={{
                    margin: 0,
                    borderLeft: isDone ? "6px solid #16A34A" : isDue ? "6px solid #DC2626" : "6px solid #CBD5E1",
                    background: isDue ? "#FFF5F5" : "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "14px", color: "#0F172A" }}>{dose.name}</strong>
                        {isDue && <span className="badge badge-high">DUE TODAY</span>}
                      </div>
                      <p style={{ margin: "2px 0", fontSize: "12px", color: "#0F6CBD", fontWeight: "600" }}>
                        ⏰ Target Period: {dose.duePeriod}
                      </p>
                      {dose.dateGiven && (
                        <p style={{ margin: 0, fontSize: "11px", color: "#166534" }}>
                          ✓ Administered on: {dose.dateGiven}
                        </p>
                      )}
                    </div>

                    <span className={"badge " + (isDone ? "badge-low" : isDue ? "badge-high" : "badge-med")}>
                      {dose.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => handleToggleDose(activeChild, dose)}
                      className="btn-outline"
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: "12px",
                        color: isDone ? "#DC2626" : "#16A34A",
                        borderColor: isDone ? "#DC2626" : "#16A34A"
                      }}
                    >
                      {isDone ? "Mark as Pending" : "✓ Mark Given"}
                    </button>

                    <button
                      onClick={() => handleSendReminder(activeChild, dose)}
                      className="btn-outline"
                      disabled={sendingDoseId === dose.id}
                      style={{ padding: "6px 12px", fontSize: "12px", color: "#0F6CBD", borderColor: "#0F6CBD", opacity: sendingDoseId === dose.id ? 0.6 : 1 }}
                      title="Send SMS Reminder to Parent"
                    >
                      {sendingDoseId === dose.id ? "Sending..." : "📲 Send SMS"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChildImmunization;
