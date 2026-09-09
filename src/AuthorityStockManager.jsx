import React, { useState, useEffect } from "react";
import {
  subscribeToSupplyInventory,
  updateSupplyStock,
  addMedicineStock,
  updateMedicineStockDetails,
  deleteMedicineStock
} from "./dataStore";
import { Pill, Plus, Edit3, Trash2, Snowflake, PackagePlus } from "lucide-react";

export function AuthorityStockManager({ _lang = "en" }) {
  const [supplies, setSupplies] = useState([]);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterFacility, setFilterFacility] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [addQty, setAddQty] = useState(50);
  const [adjustType, setAdjustType] = useState("ADD"); // "ADD" | "SET"

  // New Medicine Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedCategory, setNewMedCategory] = useState("Vaccine & Cold Chain");
  const [newMedFacility, setNewMedFacility] = useState("Tanuku Government Area Hospital (AH Tanuku)");
  const [newMedCurrentStock, setNewMedCurrentStock] = useState(100);
  const [newMedMinBuffer, setNewMedMinBuffer] = useState(25);
  const [newMedUnit, setNewMedUnit] = useState("Doses");
  const [newMedStorageTemp, setNewMedStorageTemp] = useState("Cold Chain (2-8°C)");
  const [newMedBatch, setNewMedBatch] = useState("");
  const [newMedExpiry, setNewMedExpiry] = useState("2027-12-31");

  const facilities = [
    "Tanuku Government Area Hospital (AH Tanuku)",
    "Relangi Sub-Centre & Anganwadi",
    "Attili 24x7 PHC Vaccine Cold Chain",
    "K.S. Gattu Tribal Health Post",
    "Relangi Disaster Relief Post"
  ];

  useEffect(() => {
    const unsub = subscribeToSupplyInventory((list) => {
      setSupplies(list);
    });
    return () => unsub();
  }, []);

  // Handle Add Medicine
  const handleAddNewMedicine = async (e) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      alert("Please enter a medicine name.");
      return;
    }

    await addMedicineStock({
      name: newMedName.trim(),
      category: newMedCategory,
      priority: newMedCategory.includes("Vaccine") || newMedCategory.includes("ASV") ? "P1 - Critical" : "P2 - Essential",
      facility: newMedFacility,
      currentStock: Number(newMedCurrentStock) || 0,
      minBuffer: Number(newMedMinBuffer) || 10,
      unit: newMedUnit,
      storageTemp: newMedStorageTemp,
      batchNumber: newMedBatch || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: newMedExpiry,
      createdByName: "Higher Authority"
    });

    setShowAddModal(false);
    setNewMedName("");
    setNewMedBatch("");
    alert("Medicine successfully added to central inventory!");
  };

  // Handle Stock Quantity Adjustment
  const handleStockAdjust = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const delta = Number(addQty) || 0;
    const nextStock = adjustType === "ADD" ? Math.max(0, adjustingItem.currentStock + delta) : Math.max(0, delta);

    updateSupplyStock(adjustingItem.id, nextStock, "Higher Authority");
    setAdjustingItem(null);
    setAddQty(50);
  };

  // Handle Edit Medicine Details
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    await updateMedicineStockDetails(editingItem.id, {
      name: editingItem.name,
      facility: editingItem.facility,
      category: editingItem.category,
      minBuffer: Number(editingItem.minBuffer),
      unit: editingItem.unit,
      storageTemp: editingItem.storageTemp,
      expiryDate: editingItem.expiryDate,
      updatedByName: "Higher Authority"
    });

    setEditingItem(null);
  };

  // Handle Delete Medicine
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove "${name}" from the inventory?`)) {
      await deleteMedicineStock(id);
    }
  };

  // Filter supplies
  const filtered = supplies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facility?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "ALL" ||
      s.category?.toLowerCase().includes(filterCategory.toLowerCase()) ||
      (filterCategory === "LOW" && (s.status === "Low Stock" || s.status === "Stockout"));

    const matchesFacility = filterFacility === "ALL" || s.facility === filterFacility;

    return matchesSearch && matchesCategory && matchesFacility;
  });

  const lowCount = supplies.filter((s) => s.status === "Low Stock" || s.status === "Stockout").length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Pill size={22} color="#0F6CBD" />
            <span>💊 Dynamic Central Supply & Medicine Stock Command</span>
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
            Real-time CRUD management for Polio vaccines, ASV, cold-chain buffers, and emergency drugs
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {lowCount > 0 && (
            <span className="badge badge-high" style={{ padding: "6px 12px", fontSize: "12px" }}>
              ⚠️ {lowCount} Critical Stock Warning(s)
            </span>
          )}

          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ width: "auto", padding: "8px 14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            <span>Add Medicine Stock</span>
          </button>
        </div>
      </div>

      {/* Search & Facility Filter */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="🔍 Search medicine by name, category, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "12px" }}
          />
        </div>

        <select
          value={filterFacility}
          onChange={(e) => setFilterFacility(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="ALL">All Facilities ({facilities.length})</option>
          {facilities.map((fac) => (
            <option key={fac} value={fac}>
              {fac.split("(")[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {["ALL", "LOW", "Vaccine & Cold Chain", "Anti-Snake Venom (ASV)", "Critical Lifeline", "Maternal & Child Health"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "4px 10px",
              borderRadius: "16px",
              fontSize: "11px",
              border: filterCategory === cat ? "1.5px solid #0D9488" : "1px solid #CBD5E1",
              background: filterCategory === cat ? "#E6F7F5" : "white",
              color: filterCategory === cat ? "#0D9488" : "#64748B",
              fontWeight: filterCategory === cat ? "700" : "500",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {cat === "LOW" ? "⚠️ Needs Restock" : cat}
          </button>
        ))}
      </div>

      {/* Medicines Inventory List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.length === 0 ? (
          <div className="care-card" style={{ textAlign: "center", padding: "30px" }}>
            <p style={{ color: "#64748B", margin: "0 0 10px 0" }}>No matching medicine records found.</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ width: "auto", margin: "0 auto" }}>
              ➕ Add New Medicine Item
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isStockout = item.status === "Stockout" || item.currentStock <= 0;
            const isLow = item.status === "Low Stock" || item.currentStock < item.minBuffer;
            const isColdChain = item.storageTemp?.toLowerCase().includes("cold") || item.name?.toLowerCase().includes("polio");

            return (
              <div
                key={item.id}
                className="care-card"
                style={{
                  borderLeft: isStockout ? "4px solid #DC2626" : isLow ? "4px solid #D97706" : "4px solid #16A34A"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "15px", color: "#0F172A" }}>{item.name}</strong>
                      {isColdChain && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            background: "#E0F2FE",
                            color: "#0284C7",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          <Snowflake size={10} /> Cold Chain
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                      Facility: <strong>{item.facility}</strong> &bull; Category: {item.category || item.priority}
                    </div>
                  </div>

                  <span
                    className={
                      isStockout ? "badge badge-high" : isLow ? "badge badge-med" : "badge badge-low"
                    }
                  >
                    {isStockout ? "🔴 Stockout" : isLow ? "🟡 Low Stock" : "🟢 Healthy"}
                  </span>
                </div>

                {/* Quantitative Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    margin: "12px 0 8px 0",
                    background: "#F8FAFC",
                    padding: "10px",
                    borderRadius: "10px",
                    textAlign: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Current Available</div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: "bold",
                        color: isStockout ? "#DC2626" : isLow ? "#D97706" : "#0F172A"
                      }}
                    >
                      {item.currentStock} {item.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Min Buffer Threshold</div>
                    <div style={{ fontSize: "17px", fontWeight: "bold", color: "#64748B" }}>
                      {item.minBuffer} {item.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Batch & Expiry</div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#0F6CBD", marginTop: "3px" }}>
                      {item.batchNumber || "BATCH-2026"} &bull; {item.expiryDate || "2027"}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    Last Audit: {item.lastUpdated || "Today"}
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setAdjustingItem(item);
                        setAddQty(50);
                      }}
                      style={{ padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                      title="Add or reduce stock"
                    >
                      <PackagePlus size={13} />
                      <span>Restock / Dispense</span>
                    </button>

                    <button
                      className="btn-outline"
                      onClick={() => setEditingItem({ ...item })}
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      title="Edit medicine details"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{
                        background: "none",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                      title="Remove medicine from inventory"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add New Medicine */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#0F6CBD", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={20} />
                <span>Add New Medicine / Vaccine to Stock</span>
              </h3>
              <button className="btn-outline" onClick={() => setShowAddModal(false)} style={{ padding: "2px 8px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewMedicine}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Medicine / Vaccine Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bivalent Oral Polio Vaccine (bOPV)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="Vaccine & Cold Chain">👶 Vaccine & Cold Chain</option>
                    <option value="Anti-Snake Venom (ASV)">🐍 Anti-Snake Venom (ASV)</option>
                    <option value="Critical Lifeline">🩺 Critical Lifeline</option>
                    <option value="Antibiotics & Oral Drops">💊 Antibiotics & Oral Drops</option>
                    <option value="Maternal & Child Health">🤰 Maternal Health</option>
                    <option value="Disaster Buffer">🌊 Disaster Relief Buffer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Storage Temperature
                  </label>
                  <select
                    value={newMedStorageTemp}
                    onChange={(e) => setNewMedStorageTemp(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="Cold Chain (2-8°C)">❄️ Cold Chain (2-8°C)</option>
                    <option value="Deep Freeze (-20°C)">🧊 Deep Freeze (-20°C)</option>
                    <option value="Room Temperature (15-25°C)">🌡️ Room Temp (15-25°C)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Assigned Facility / PHC Location *
                </label>
                <select
                  value={newMedFacility}
                  onChange={(e) => setNewMedFacility(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {facilities.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMedCurrentStock}
                    onChange={(e) => setNewMedCurrentStock(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Min Buffer *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMedMinBuffer}
                    onChange={(e) => setNewMedMinBuffer(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Unit
                  </label>
                  <select value={newMedUnit} onChange={(e) => setNewMedUnit(e.target.value)} style={{ width: "100%" }}>
                    <option value="Doses">Doses</option>
                    <option value="Vials">Vials</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Packs">Packs</option>
                    <option value="Bottles">Bottles</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-2026-POL"
                    value={newMedBatch}
                    onChange={(e) => setNewMedBatch(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newMedExpiry}
                    onChange={(e) => setNewMedExpiry(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: "10px" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: "10px", fontWeight: "700" }}>
                  Confirm & Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust / Restock Medicine Quantity */}
      {adjustingItem && (
        <div className="modal-backdrop" onClick={() => setAdjustingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h3 style={{ color: "#0F6CBD", marginTop: 0 }}>Adjust Medicine Stock</h3>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              Updating quantity for <strong>{adjustingItem.name}</strong> at <strong>{adjustingItem.facility}</strong>.
            </p>

            <form onSubmit={handleStockAdjust}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setAdjustType("ADD")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: adjustType === "ADD" ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                    background: adjustType === "ADD" ? "#EFF6FF" : "white",
                    color: adjustType === "ADD" ? "#0F6CBD" : "#475569",
                    fontWeight: "700"
                  }}
                >
                  ➕ Add Restock Batch
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("SET")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: adjustType === "SET" ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                    background: adjustType === "SET" ? "#EFF6FF" : "white",
                    color: adjustType === "SET" ? "#0F6CBD" : "#475569",
                    fontWeight: "700"
                  }}
                >
                  ✏️ Set Exact Stock
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                  {adjustType === "ADD"
                    ? `Quantity to Add (${adjustingItem.unit})`
                    : `New Current Stock (${adjustingItem.unit})`}
                </label>
                <input
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  style={{ width: "100%", padding: "10px" }}
                  required
                />
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                  Current: {adjustingItem.currentStock} {adjustingItem.unit} &bull; Min Buffer: {adjustingItem.minBuffer}
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn-outline" onClick={() => setAdjustingItem(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, fontWeight: "700" }}>
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Medicine Record Details */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3 style={{ color: "#0F6CBD", marginTop: 0 }}>Edit Medicine Details</h3>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Medicine Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Assigned Facility
                </label>
                <select
                  value={editingItem.facility}
                  onChange={(e) => setEditingItem({ ...editingItem, facility: e.target.value })}
                  style={{ width: "100%" }}
                >
                  {facilities.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Min Buffer Threshold
                  </label>
                  <input
                    type="number"
                    value={editingItem.minBuffer}
                    onChange={(e) => setEditingItem({ ...editingItem, minBuffer: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn-outline" onClick={() => setEditingItem(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, fontWeight: "700" }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityStockManager;
