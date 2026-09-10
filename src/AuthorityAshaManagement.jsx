import React, { useState, useEffect } from "react";
import { getLocal, saveLocal, addAuditLog } from "./dataStore";
import { VILLAGES, DEFAULT_VILLAGE } from "./villageConfig";

export function AuthorityAshaManagement({ lang = "en", onAssignSchedule }) {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);
  const [newVillage, setNewVillage] = useState(DEFAULT_VILLAGE);

  const villages = VILLAGES;

  useEffect(() => {
    const allUsers = getLocal("users");
    const ashaUsers = allUsers.filter((u) => u.role === "ASHA_WORKER");
    if (ashaUsers.length === 0) {
      // Fallback demo workers
      const demoWorkers = [
        {
          id: "ASHA-001",
          name: "Rani Devi",
          village: "Relangi",
          phone: "9848011223",
          status: "Active",
          assignedCitizensCount: 142,
          beats: ["Ward 1", "Ward 2", "Main Canal Area"]
        },
        {
          id: "ASHA-002",
          name: "Sita Kumari",
          village: "Tanuku",
          phone: "9848022334",
          status: "Active",
          assignedCitizensCount: 185,
          beats: ["Ward 3", "Ward 4", "Railway Colony"]
        },
        {
          id: "ASHA-003",
          name: "Padma Lakshmi",
          village: "Attili",
          phone: "9848033445",
          status: "Active",
          assignedCitizensCount: 120,
          beats: ["Sub-Centre Area", "Market Road"]
        },
        {
          id: "ASHA-004",
          name: "K. Mary",
          village: "K.S. Gattu",
          phone: "9848044556",
          status: "Active",
          assignedCitizensCount: 95,
          beats: ["Lowlands", "Tribal Hamlet"]
        }
      ];
      setWorkers(demoWorkers);
    } else {
      setWorkers(ashaUsers);
    }
  }, []);

  const handleToggleStatus = async (workerId) => {
    const updated = workers.map((w) => {
      if (w.id === workerId || w.workerId === workerId) {
        const nextStatus = w.status === "Active" ? "On Leave / Inactive" : "Active";
        addAuditLog(
          "Higher Authority",
          "TOGGLE_ASHA_STATUS",
          `Updated ASHA worker ${w.name} (${w.village}) status to ${nextStatus}`
        );
        return { ...w, status: nextStatus };
      }
      return w;
    });
    setWorkers(updated);
  };

  const handleReassignVillage = async () => {
    if (!editingWorker) return;
    const updated = workers.map((w) => {
      if (w.id === editingWorker.id) {
        addAuditLog(
          "Higher Authority",
          "REASSIGN_ASHA_VILLAGE",
          `Reassigned ASHA ${w.name} from ${w.village} to ${newVillage}`
        );
        return { ...w, village: newVillage };
      }
      return w;
    });
    setWorkers(updated);
    setEditingWorker(null);
  };

  const filtered = workers.filter(
    (w) =>
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.village?.toLowerCase().includes(search.toLowerCase()) ||
      w.phone?.includes(search)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>👩‍⚕️ ASHA Workforce Management</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Field workforce directory, beats, status control, and citizen allocations
          </p>
        </div>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD", fontWeight: "700" }}>
          {workers.length} Registered Workers
        </span>
      </div>

      <input
        type="text"
        placeholder="🔍 Search ASHA by name, village or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "14px" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((w) => (
          <div key={w.id || w.name} className="care-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0F6CBD, #0D9488)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
                >
                  👩‍⚕️
                </div>
                <div>
                  <strong style={{ fontSize: "15px", color: "#0F172A" }}>{w.name}</strong>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    ID: {w.id || w.workerId || "ASHA-001"} &bull; 📞 {w.phone || "9848011223"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(w.id || w.workerId)}
                style={{
                  background: w.status === "Active" ? "#DCFCE7" : "#FEE2E2",
                  color: w.status === "Active" ? "#166534" : "#991B1B",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {w.status === "Active" ? "✓ ACTIVE" : "⏸️ INACTIVE"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                background: "#F8FAFC",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                margin: "8px 0"
              }}
            >
              <div>
                <span style={{ color: "#64748B" }}>Assigned Village:</span> <strong>{w.village}</strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Citizens Covered:</span> <strong>{w.assignedCitizensCount || 120}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
              <button
                className="btn-outline"
                onClick={() => {
                  setEditingWorker(w);
                  setNewVillage(w.village);
                }}
                style={{ padding: "4px 10px", fontSize: "11px" }}
              >
                🔄 Reassign Village
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingWorker && (
        <div className="modal-backdrop" onClick={() => setEditingWorker(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#0F6CBD", marginTop: 0 }}>Reassign Village Beat</h3>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              Updating jurisdiction for <strong>{editingWorker.name}</strong>.
            </p>

            <div style={{ margin: "16px 0" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                Select Village
              </label>
              <select
                value={newVillage}
                onChange={(e) => setNewVillage(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-outline" onClick={() => setEditingWorker(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleReassignVillage} style={{ flex: 2 }}>
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityAshaManagement;
