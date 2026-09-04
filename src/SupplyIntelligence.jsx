import React, { useState, useEffect } from "react";
import { getLocal, updateSupplyStock } from "./dataStore";

export function SupplyIntelligence({ onBack, lang = "en" }) {
  const [supplies, setSupplies] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [requisitionSent, setRequisitionSent] = useState(false);

  useEffect(() => {
    setSupplies(getLocal("supply_inventory"));
  }, []);

  const priorities = ["All", "P1 - Critical", "P2 - Acute", "P3 - Chronic"];

  const filteredSupplies = selectedPriority === "All"
    ? supplies
    : supplies.filter((s) => s.priority === selectedPriority);

  const handleStockAdjust = (id, delta) => {
    const item = supplies.find((s) => s.id === id);
    if (!item) return;
    const nextStock = Math.max(0, item.currentStock + delta);
    const updated = updateSupplyStock(id, nextStock);
    setSupplies([...updated]);
  };

  const handleRequisition = () => {
    setRequisitionSent(true);
    setTimeout(() => {
      setRequisitionSent(false);
    }, 6000);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#E6F7F5", color: "#0D9488" }}>Cold-Chain & Essential Stock</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>💊</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "మందుల నిల్వ & సరఫరా ప్రాధాన్యత నిర్వహణ" : "Storage & Supply Priority Intelligence"}
            </h1>
            <p style={{ color: "#CCFBF1", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "జీవిత రక్షణ మందులు (ASV, ORS) నుండి క్రానిక్ మందుల వరకు ఖచ్చితమైన పర్యవేక్షణ"
                : "Triaged storage priorities: Critical ASV/ORS, acute infections & chronic care"}
            </p>
          </div>
        </div>

        <button
          onClick={handleRequisition}
          style={{
            marginTop: "14px",
            width: "100%",
            background: "white",
            color: "#0D9488",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "13px",
            border: "none",
            cursor: "pointer"
          }}
        >
          📦 {lang === "te" ? "డిస్ట్రిక్ట్ డ్రగ్ డిపో (DMSD) నుండి స్టాక్ రీఫిల్ అడగండి" : "Requisition Buffer Stock from District Medical Depot"}
        </button>
      </div>

      {requisitionSent && (
        <div style={{ background: "#DCFCE7", border: "1.5px solid #86EFAC", color: "#166534", padding: "12px", borderRadius: "12px", marginBottom: "16px" }}>
          ✅ <strong>Requisition Dispatched!</strong> Indent sent to District Medical Store Depot, Eluru / Bhimavaram. Estimated delivery: 24 hrs.
        </div>
      )}

      {/* Priority Filter Chips */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "12px", color: "#64748B", fontWeight: "bold" }}>
          Filter by Storage Urgency:
        </label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginTop: "4px" }}>
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                backgroundColor: selectedPriority === p ? "#0D9488" : "white",
                color: selectedPriority === p ? "white" : "#475569",
                border: "1px solid " + (selectedPriority === p ? "#0D9488" : "#CBD5E1")
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Supplies List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filteredSupplies.map((item) => {
          const isCritical = item.priority === "P1 - Critical";
          const isLow = item.status === "Low Stock" || item.status === "Stockout";
          return (
            <div
              key={item.id}
              className="care-card"
              style={{
                margin: 0,
                borderLeft: isCritical ? "6px solid #DC2626" : "6px solid #0D9488",
                background: isLow ? "#FFFBEB" : "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{item.name}</strong>
                    {isCritical && <span className="badge badge-high">P1 CRITICAL</span>}
                  </div>
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                    Category: {item.category} &bull; Min Buffer: <strong>{item.minBuffer} {item.unit}</strong>
                  </p>
                  <span className={"badge " + (item.status === "Healthy" ? "badge-low" : item.status === "Adequate" ? "badge-med" : "badge-high")} style={{ marginTop: "4px" }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: isLow ? "#D97706" : "#0D9488" }}>
                    {item.currentStock}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{item.unit} in Hand</div>
                </div>
              </div>

              {/* Adjust Stock Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => handleStockAdjust(item.id, -5)}
                  className="btn-outline"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  -5
                </button>
                <button
                  onClick={() => handleStockAdjust(item.id, 10)}
                  className="btn-outline"
                  style={{ padding: "4px 10px", fontSize: "12px", color: "#0D9488", borderColor: "#0D9488" }}
                >
                  +10 Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SupplyIntelligence;
