import React, { useState, useEffect } from "react";
import { subscribeToCollection, addPolioScheduleCampaign, updateScheduleStatus, addAuditLog } from "./dataStore";
import { Baby, Plus } from "lucide-react";

export function AuthorityPolioScheduler({ _lang = "en" }) {
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingSchedule, setUpdatingSchedule] = useState(null);
  const [progressCount, setProgressCount] = useState("");
  const [progressNotes, setProgressNotes] = useState("");

  // Form State
  const [title, setTitle] = useState("National Pulse Polio Immunization Day 2026");
  const [date, setDate] = useState("2026-09-25");
  const [time, setTime] = useState("08:00 AM - 04:00 PM");
  const [village, setVillage] = useState("Relangi");
  const [boothVenue, setBoothVenue] = useState("Relangi Primary Anganwadi Centre & Sub-Centre");
  const [assignedAshaId, setAssignedAshaId] = useState("ASHA-001");
  const [assignedAshaName, setAssignedAshaName] = useState("Rani Devi");
  const [targetChildren, setTargetChildren] = useState(250);
  const [allocatedDoses, setAllocatedDoses] = useState(300);
  const [instructions, setInstructions] = useState(
    "Maintain cold chain at 2-8°C with conditioned ice packs. Check Vaccine Vial Monitor (VVM) indicator. Administer 2 drops of bOPV to all children 0-5 yrs. Mark left pinky fingernail with indelible ink."
  );

  const ashaList = [
    { id: "ASHA-001", name: "Rani Devi", village: "Relangi" },
    { id: "ASHA-002", name: "Sita Kumari", village: "Tanuku" },
    { id: "ASHA-003", name: "Padma Lakshmi", village: "Attili" },
    { id: "ASHA-004", name: "K. Mary", village: "K.S. Gattu" }
  ];

  useEffect(() => {
    const unsub = subscribeToCollection("schedules", (list) => {
      // Filter for polio drives or child immunization schedules
      const polioList = list.filter(
        (s) =>
          s.isPolioDrive ||
          s.category === "POLIO_CAMPAIGN" ||
          s.title?.toLowerCase().includes("polio") ||
          s.task?.toLowerCase().includes("polio")
      );
      setSchedules(polioList);
    });
    return () => unsub();
  }, []);

  const handleAshaChange = (id) => {
    const found = ashaList.find((a) => a.id === id);
    if (found) {
      setAssignedAshaId(found.id);
      setAssignedAshaName(found.name);
      setVillage(found.village);
      setBoothVenue(`${found.village} Anganwadi Centre & PHC Booth`);
    }
  };

  const handleCreatePolioDrive = async (e) => {
    e.preventDefault();
    if (!title || !date) {
      alert("Please enter title and date.");
      return;
    }

    await addPolioScheduleCampaign({
      title,
      date,
      time,
      village,
      boothVenue,
      assignedAshaId,
      assignedAshaName,
      targetChildren: Number(targetChildren) || 200,
      allocatedDoses: Number(allocatedDoses) || 250,
      instructions
    });

    setShowCreateModal(false);
    alert("Polio Drop date successfully scheduled! Dispatched to ASHA worker and citizen portal.");
  };

  const handleSaveProgress = async () => {
    if (!updatingSchedule) return;

    const count = Number(progressCount) || 0;
    const isFinished = count >= updatingSchedule.targetChildren;

    await updateScheduleStatus(
      updatingSchedule.id,
      isFinished ? "COMPLETED" : "IN_PROGRESS",
      {
        dosesAdministered: count,
        citizensCovered: count,
        notes: progressNotes || `Administered ${count} bOPV doses.`,
        completedAt: new Date().toLocaleTimeString()
      }
    );

    await addAuditLog(
      "Higher Authority",
      "UPDATE_POLIO_PROGRESS",
      `Recorded progress for ${updatingSchedule.title}: ${count} doses administered.`
    );

    setUpdatingSchedule(null);
    setProgressCount("");
    setProgressNotes("");
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this scheduled Polio drive date?")) {
      await updateScheduleStatus(id, "CANCELLED");
    }
  };

  // KPIs
  const totalDrives = schedules.length;
  const totalTarget = schedules.reduce((acc, s) => acc + (Number(s.targetChildren) || 0), 0);
  const totalDosesGiven = schedules.reduce((acc, s) => acc + (Number(s.dosesAdministered || s.citizensCovered) || 0), 0);
  const totalAllocated = schedules.reduce((acc, s) => acc + (Number(s.allocatedDoses) || 0), 0);
  const overallCoverage = totalTarget > 0 ? Math.round((totalDosesGiven / totalTarget) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Baby size={22} color="#0F6CBD" />
            <span>👶 Pulse Polio & UIP Immunization Scheduler</span>
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
            Schedule national & sub-national Polio drop dates, assign village booths, and monitor cold-chain doses
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ width: "auto", padding: "8px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          <span>Schedule Polio Drop Date</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px", textAlign: "center" }}>
        <div className="care-card" style={{ padding: "12px 6px" }}>
          <div style={{ fontSize: "11px", color: "#64748B" }}>Scheduled Drives</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0F6CBD" }}>{totalDrives}</div>
        </div>
        <div className="care-card" style={{ padding: "12px 6px" }}>
          <div style={{ fontSize: "11px", color: "#64748B" }}>Target Children (0-5)</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0F172A" }}>{totalTarget}</div>
        </div>
        <div className="care-card" style={{ padding: "12px 6px" }}>
          <div style={{ fontSize: "11px", color: "#64748B" }}>bOPV Doses Allocated</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0D9488" }}>{totalAllocated}</div>
        </div>
        <div className="care-card" style={{ padding: "12px 6px" }}>
          <div style={{ fontSize: "11px", color: "#64748B" }}>Live Coverage</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16A34A" }}>{overallCoverage}%</div>
        </div>
      </div>

      {/* Drives List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.length === 0 ? (
          <div className="care-card" style={{ textAlign: "center", padding: "30px" }}>
            <p style={{ color: "#64748B", margin: "0 0 12px 0" }}>No Polio Drop schedules active currently.</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: "auto", margin: "0 auto" }}>
              ➕ Schedule First Polio Drive
            </button>
          </div>
        ) : (
          schedules.map((item) => {
            const administered = Number(item.dosesAdministered || item.citizensCovered) || 0;
            const target = Number(item.targetChildren) || 200;
            const pct = Math.min(100, Math.round((administered / target) * 100));

            return (
              <div
                key={item.id}
                className="care-card"
                style={{
                  borderLeft:
                    item.status === "COMPLETED"
                      ? "4px solid #16A34A"
                      : item.status === "IN_PROGRESS"
                      ? "4px solid #EA580C"
                      : "4px solid #0F6CBD"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{item.title}</strong>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "3px" }}>
                      📍 <strong>{item.village}</strong> &bull; 📅 {item.date} ({item.time})
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background:
                        item.status === "COMPLETED"
                          ? "#DCFCE7"
                          : item.status === "IN_PROGRESS"
                          ? "#FFEDD5"
                          : "#E0F2FE",
                      color:
                        item.status === "COMPLETED"
                          ? "#16A34A"
                          : item.status === "IN_PROGRESS"
                          ? "#C2410C"
                          : "#0284C7",
                      fontWeight: "700"
                    }}
                  >
                    {item.status === "COMPLETED" ? "✅ Completed" : item.status === "IN_PROGRESS" ? "⏳ Active" : "📢 Scheduled"}
                  </span>
                </div>

                {/* Venue & Booth info */}
                <div
                  style={{
                    background: "#F8FAFC",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    marginBottom: "10px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px"
                  }}
                >
                  <div>
                    <span style={{ color: "#64748B" }}>Booth Venue:</span> <strong>{item.boothVenue || "Anganwadi Center"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>In-Charge ASHA:</span> 👩‍⚕️ <strong>{item.assignedAshaName || "Assigned"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Target Children:</span> <strong>{item.targetChildren || 250} (Ages 0-5)</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>bOPV Vaccine Stock:</span> <strong>{item.allocatedDoses || 300} Doses (Cold Chain)</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748B" }}>Coverage Progress:</span>
                    <strong style={{ color: pct >= 100 ? "#16A34A" : "#0F6CBD" }}>
                      {administered} / {target} children ({pct}%)
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "6px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: pct >= 100 ? "#16A34A" : "linear-gradient(90deg, #0F6CBD 0%, #0D9488 100%)",
                        borderRadius: "6px",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                </div>

                {/* Instructions */}
                {item.instructions && (
                  <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#64748B", fontStyle: "italic" }}>
                    "{item.instructions}"
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    Published by: {item.createdByName || "DM&HO"}
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
                      <>
                        <button
                          onClick={() => {
                            setUpdatingSchedule(item);
                            setProgressCount(administered);
                            setProgressNotes(item.notes || "");
                          }}
                          className="btn-outline"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          ✏️ Update Coverage
                        </button>
                        <button
                          onClick={() => handleCancel(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#DC2626",
                            fontSize: "11px",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Polio Schedule */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#0F6CBD", display: "flex", alignItems: "center", gap: "6px" }}>
                <Baby size={20} />
                <span>Schedule Polio Drop Date</span>
              </h3>
              <button className="btn-outline" onClick={() => setShowCreateModal(false)} style={{ padding: "2px 8px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolioDrive}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Polio Campaign Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Pulse Polio Immunization Day 2026"
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="08:00 AM - 04:00 PM"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Assign ASHA Worker & Target Village *
                </label>
                <select
                  value={assignedAshaId}
                  onChange={(e) => handleAshaChange(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {ashaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      👩‍⚕️ {a.name} &bull; {a.village} Beat ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Designated Booth Venue / Center *
                </label>
                <input
                  type="text"
                  value={boothVenue}
                  onChange={(e) => setBoothVenue(e.target.value)}
                  placeholder="e.g. Relangi Anganwadi Centre 1 & Sub-Centre"
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Target Children (0-5 Yrs) *
                  </label>
                  <input
                    type="number"
                    value={targetChildren}
                    onChange={(e) => setTargetChildren(e.target.value)}
                    min="1"
                    required
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    bOPV Doses Allocated (Cold Chain) *
                  </label>
                  <input
                    type="number"
                    value={allocatedDoses}
                    onChange={(e) => setAllocatedDoses(e.target.value)}
                    min="1"
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Cold-Chain & Administration Guidelines
                </label>
                <textarea
                  rows="3"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: "10px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: "10px", fontWeight: "700" }}
                >
                  🚀 Publish Polio Date & Notify ASHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Coverage Progress */}
      {updatingSchedule && (
        <div className="modal-backdrop" onClick={() => setUpdatingSchedule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#0F6CBD" }}>Update Polio Coverage</h3>
            <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "#64748B" }}>
              Recording field doses for <strong>{updatingSchedule.title}</strong> at {updatingSchedule.village}.
            </p>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Children Administered (Doses Given)
              </label>
              <input
                type="number"
                value={progressCount}
                onChange={(e) => setProgressCount(e.target.value)}
                max={updatingSchedule.targetChildren * 2}
                min="0"
                style={{ width: "100%", padding: "8px" }}
              />
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                Target: {updatingSchedule.targetChildren} children
              </span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Field Notes & Mop-up Status
              </label>
              <textarea
                rows="2"
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="e.g. Ward 1 and 2 covered. 14 missed children scheduled for door-to-door mop-up tomorrow."
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-outline" onClick={() => setUpdatingSchedule(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveProgress} style={{ flex: 2, fontWeight: "700" }}>
                💾 Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityPolioScheduler;
