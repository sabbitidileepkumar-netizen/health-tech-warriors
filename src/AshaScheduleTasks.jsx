import React, { useState, useEffect } from "react";
import { subscribeToCollection, updateScheduleStatus } from "./dataStore";

export function AshaScheduleTasks({ onBack, currentWorkerId = "ASHA-001", currentVillage = "Relangi", _lang = "en" }) {
  const [schedules, setSchedules] = useState([]);
  const [completingSchedule, setCompletingSchedule] = useState(null);
  const [citizensCovered, setCitizensCovered] = useState(25);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsub = subscribeToCollection("schedules", (list) => {
      // Filter schedules relevant to this worker or village
      const relevant = list.filter(
        (s) =>
          s.assignedAshaId === currentWorkerId ||
          s.village?.toLowerCase() === currentVillage?.toLowerCase() ||
          !s.assignedAshaId
      );
      setSchedules(relevant);
    });
    return () => unsub();
  }, [currentWorkerId, currentVillage]);

  const handleAcknowledge = async (id) => {
    await updateScheduleStatus(id, "ACKNOWLEDGED");
  };

  const handleStartTask = async (id) => {
    await updateScheduleStatus(id, "IN_PROGRESS");
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingSchedule) return;

    await updateScheduleStatus(completingSchedule.id, "COMPLETED", {
      citizensCovered: Number(citizensCovered) || 0,
      notes: notes || "Task successfully conducted in designated ward.",
      completedByWorkerId: currentWorkerId
    });

    setCompletingSchedule(null);
    setNotes("");
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "PUBLISHED":
        return <span className="badge" style={{ background: "#E0F2FE", color: "#0284C7" }}>📢 New Schedule</span>;
      case "ACKNOWLEDGED":
        return <span className="badge" style={{ background: "#FEF3C7", color: "#D97706" }}>👀 Acknowledged</span>;
      case "IN_PROGRESS":
        return <span className="badge" style={{ background: "#FFEDD5", color: "#EA580C" }}>⏳ In Progress</span>;
      case "COMPLETED":
        return <span className="badge" style={{ background: "#DCFCE7", color: "#16A34A" }}>✅ Completed</span>;
      default:
        return <span className="badge">{st}</span>;
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>
          Authority Task System
        </span>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)",
          color: "white",
          padding: "18px",
          borderRadius: "16px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "32px" }}>📅</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>My Assigned Schedules & Camps</h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "12px" }}>
              Official assignments dispatched by District Higher Authority (DM&HO)
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>
            No pending schedules assigned to your beat.
          </p>
        ) : (
          schedules.map((item) => (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <strong style={{ fontSize: "15px", color: "#0F172A" }}>{item.title}</strong>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                    📍 <strong>{item.village}</strong> &bull; 📅 {item.date} ({item.time})
                  </div>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", margin: "8px 0" }}>
                <div><strong>Focus Task:</strong> {item.task}</div>
                {item.instructions && (
                  <div style={{ marginTop: "4px", color: "#475569" }}>
                    <strong>Authority Directives:</strong> <em>"{item.instructions}"</em>
                  </div>
                )}
              </div>

              {item.status === "COMPLETED" ? (
                <div style={{ background: "#F0FDF4", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#166534" }}>
                  ✅ <strong>Task Completed!</strong> Covered {item.citizensCovered || "all"} citizens. Completed at {item.completedAt || "on time"}.
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  {item.status === "PUBLISHED" && (
                    <button
                      className="btn-outline"
                      onClick={() => handleAcknowledge(item.id)}
                      style={{ flex: 1, padding: "8px", fontSize: "12px", fontWeight: "600" }}
                    >
                      👀 Acknowledge Task
                    </button>
                  )}

                  {(item.status === "PUBLISHED" || item.status === "ACKNOWLEDGED") && (
                    <button
                      className="btn-primary"
                      onClick={() => handleStartTask(item.id)}
                      style={{ flex: 1, padding: "8px", fontSize: "12px", background: "#EA580C" }}
                    >
                      ⏳ Start Field Work
                    </button>
                  )}

                  {item.status === "IN_PROGRESS" && (
                    <button
                      className="btn-primary"
                      onClick={() => setCompletingSchedule(item)}
                      style={{ flex: 1, padding: "8px", fontSize: "12px", background: "#16A34A" }}
                    >
                      ✅ Mark as Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {completingSchedule && (
        <div className="modal-backdrop" onClick={() => setCompletingSchedule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#16A34A", marginTop: 0 }}>Complete Field Assignment</h3>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              Submitting completion report for <strong>{completingSchedule.title}</strong> to Higher Authority.
            </p>

            <form onSubmit={handleCompleteSubmit}>
              <div style={{ margin: "14px 0" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Number of Citizens Screened / Covered *
                </label>
                <input
                  type="number"
                  value={citizensCovered}
                  onChange={(e) => setCitizensCovered(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Field Summary Notes & Follow-ups
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Visited 30 households in Ward 1. All infants administered Oral Polio Drops..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn-outline" onClick={() => setCompletingSchedule(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, background: "#16A34A" }}>
                  🚀 Submit & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AshaScheduleTasks;
