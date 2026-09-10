import React, { useState, useEffect } from "react";
import { subscribeToCollection, addSchedule, updateScheduleStatus } from "./dataStore";
import { VILLAGES, DEFAULT_VILLAGE } from "./villageConfig";

export function AuthorityScheduleManager({ _lang = "en" }) {
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00 AM - 02:00 PM");
  const [village, setVillage] = useState(DEFAULT_VILLAGE);
  const [assignedAshaId, setAssignedAshaId] = useState("ASHA-001");
  const [assignedAshaName, setAssignedAshaName] = useState("Rani Devi");
  const [task, setTask] = useState("Child Vaccination & Vitamin A Drops");
  const [instructions, setInstructions] = useState("");
  const [priority, setPriority] = useState("High");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const villages = VILLAGES;
  const ashaList = [
    { id: "ASHA-001", name: "Rani Devi", village: "Chinamiram" },
    { id: "ASHA-002", name: "Sita Kumari", village: "Rayalam" },
    { id: "ASHA-003", name: "Padma Lakshmi", village: "Annavaram" },
    { id: "ASHA-004", name: "K. Mary", village: "Taderu" }
  ];

  useEffect(() => {
    const unsub = subscribeToCollection("schedules", (list) => {
      setSchedules(list);
    });
    return () => unsub();
  }, []);

  const handleAshaChange = (id) => {
    const found = ashaList.find((a) => a.id === id);
    if (found) {
      setAssignedAshaId(found.id);
      setAssignedAshaName(found.name);
      setVillage(found.village);
    }
  };

  const handleSave = async (publishImmediate = false) => {
    if (!title || !date) {
      alert("Please enter title and date.");
      return;
    }

    const newSchedule = {
      title,
      date,
      time,
      village,
      assignedAshaId,
      assignedAshaName,
      task,
      instructions: instructions || "Visit designated wards, record screenings, and escalate high-priority cases.",
      priority,
      status: publishImmediate ? "PUBLISHED" : "DRAFT",
      createdBy: "dr.k.v.rao@carelink.in",
      createdByName: "Dr. K.V. Rao (DM&HO)"
    };

    await addSchedule(newSchedule);
    setShowCreateModal(false);
    setTitle("");
    setDate("");
    setInstructions("");
  };

  const handleCancelSchedule = async (id) => {
    if (window.confirm("Are you sure you want to cancel this schedule?")) {
      await updateScheduleStatus(id, "CANCELLED");
    }
  };

  const filtered = schedules.filter((s) => {
    if (statusFilter === "ALL") return true;
    return s.status === statusFilter;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case "DRAFT":
        return <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>📝 Draft</span>;
      case "PUBLISHED":
        return <span className="badge" style={{ background: "#E0F2FE", color: "#0284C7" }}>📢 Published</span>;
      case "ACKNOWLEDGED":
        return <span className="badge" style={{ background: "#FEF3C7", color: "#D97706" }}>👀 Acknowledged</span>;
      case "IN_PROGRESS":
        return <span className="badge" style={{ background: "#FFEDD5", color: "#EA580C" }}>⏳ In Progress</span>;
      case "COMPLETED":
        return <span className="badge" style={{ background: "#DCFCE7", color: "#16A34A" }}>✅ Completed</span>;
      case "CANCELLED":
        return <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>❌ Cancelled</span>;
      default:
        return <span className="badge">{st}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>📅 District Schedules & Field Camps</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Create, assign, and track field execution across ASHA workers
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}
        >
          ➕ Create New Schedule
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {["ALL", "PUBLISHED", "ACKNOWLEDGED", "IN_PROGRESS", "COMPLETED", "DRAFT"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              border: statusFilter === st ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
              background: statusFilter === st ? "#EBF3FC" : "white",
              color: statusFilter === st ? "#0F6CBD" : "#64748B",
              fontWeight: statusFilter === st ? "700" : "500",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Schedules List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No schedules found.</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="care-card"
              style={{
                borderLeft:
                  item.status === "COMPLETED"
                    ? "4px solid #16A34A"
                    : item.status === "IN_PROGRESS"
                    ? "4px solid #EA580C"
                    : item.status === "PUBLISHED"
                    ? "4px solid #0F6CBD"
                    : "4px solid #94A3B8"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "#0F172A" }}>{item.title}</strong>
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                    📍 <strong>{item.village}</strong> &bull; 📅 {item.date} ({item.time})
                  </div>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  margin: "8px 0"
                }}
              >
                <div><strong>Assigned ASHA:</strong> 👩‍⚕️ {item.assignedAshaName || "Unassigned"} ({item.assignedAshaId})</div>
                <div><strong>Task:</strong> {item.task}</div>
                {item.instructions && (
                  <div style={{ marginTop: "4px", color: "#64748B", fontSize: "11px" }}>
                    <em>"{item.instructions}"</em>
                  </div>
                )}
              </div>

              {/* Completion Information */}
              {item.status === "COMPLETED" && (
                <div
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#166534",
                    marginBottom: "8px"
                  }}
                >
                  <div>✅ <strong>Completed at:</strong> {item.completedAt || "Recorded"}</div>
                  {item.citizensCovered != null && (
                    <div>👥 <strong>Citizens Covered:</strong> {item.citizensCovered}</div>
                  )}
                  {item.notes && <div>📝 <strong>Field Notes:</strong> {item.notes}</div>}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#94A3B8" }}>
                <span>Priority: <strong>{item.priority}</strong> &bull; Creator: {item.createdByName || "Authority"}</span>
                {item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCancelSchedule(item.id)}
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
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Schedule */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#0F6CBD" }}>➕ Create New Schedule / Camp</h3>
              <button className="btn-outline" onClick={() => setShowCreateModal(false)} style={{ padding: "4px 8px" }}>
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(true);
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Schedule Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Relangi Pulse Polio & Vitamin A Camp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Date *
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
                    placeholder="09:00 AM - 02:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Assign ASHA Worker *
                </label>
                <select
                  value={assignedAshaId}
                  onChange={(e) => handleAshaChange(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {ashaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      👩‍⚕️ {a.name} ({a.village} Beat)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Target Village
                  </label>
                  <select value={village} onChange={(e) => setVillage(e.target.value)} style={{ width: "100%" }}>
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Priority
                  </label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%" }}>
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Routine">🟢 Routine</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Task Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Antenatal Checkups / Child Immunization"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Field Instructions
                </label>
                <textarea
                  rows="2"
                  placeholder="Instructions for the ASHA worker during field visit..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => handleSave(false)}
                  style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                >
                  📝 Save Draft
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: "10px", fontSize: "13px", fontWeight: "700" }}
                >
                  🚀 Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityScheduleManager;
