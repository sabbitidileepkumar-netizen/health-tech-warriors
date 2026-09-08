import React, { useState, useEffect } from "react";
import { getLocal, saveLocal, toggleDisasterActive } from "./dataStore";

const DEFAULT_COORDS = { lat: 16.704, lon: 81.630 }; // Relangi fallback

export function DisasterMode({ onBack, lang = "en" }) {
  const [disaster, setDisaster] = useState(null);
  const [halazoneTabs, setHalazoneTabs] = useState(340);
  const [orsDistributed, setOrsDistributed] = useState(210);
  const [liveRisk, setLiveRisk] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    setDisaster(getLocal("disaster_status"));
    fetchLiveFloodRisk();
  }, []);

  const applyCoords = async (lat, lon) => {
    try {
      const [wRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      ]);
      const wData = await wRes.json();
      const geoData = await geoRes.json();

      const rainToday = wData.daily?.precipitation_sum?.[0] ?? 0;
      const level = rainToday > 100 ? "High" : rainToday > 40 ? "Moderate" : "Low";
      const placeName =
        geoData.address?.village ||
        geoData.address?.town ||
        geoData.address?.city ||
        geoData.address?.county ||
        "Your Area";

      setLiveRisk({ rainToday, level, placeName });
    } catch (err) {
      console.warn("Live flood risk fetch failed", err);
    } finally {
      setLiveLoading(false);
    }
  };

  const fetchLiveFloodRisk = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude),
        () => applyCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon),
        { timeout: 5000 }
      );
    } else {
      applyCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
    }
  };

  const handleToggleActive = () => {
    const willActivate = !disaster.active;
    const updated = toggleDisasterActive();

    if (willActivate && liveRisk) {
      const merged = {
        ...updated,
        alertTitle: `Flood Alert: ${liveRisk.placeName}`,
        floodLevel: `Live Rainfall Today: ${liveRisk.rainToday}mm (${liveRisk.level} Risk)`,
        affectedZones: [liveRisk.placeName]
      };
      saveLocal("disaster_status", merged);
      setDisaster(merged);
    } else {
      setDisaster({ ...updated });
    }
  };

  const handleDistributeTabs = () => {
    setHalazoneTabs((prev) => prev + 50);
  };

  const handleDistributeOrs = () => {
    setOrsDistributed((prev) => prev + 25);
  };

  if (!disaster) return null;

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: disaster.active ? "#FEE2E2" : "#ECFDF5", color: disaster.active ? "#DC2626" : "#065F46" }}>
          {disaster.active ? "🚨 DISASTER RESPONSE ACTIVE" : "🟢 Standby Monitoring"}
        </span>
      </div>

      <div style={{ background: "#EFF6FF", border: "1.5px solid #93C5FD", borderRadius: "12px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#1E40AF" }}>
        {liveLoading
          ? "🔄 Detecting live rainfall & location..."
          : liveRisk
          ? `🌧️ Live Detected: ${liveRisk.rainToday}mm rain today near ${liveRisk.placeName} — Risk: ${liveRisk.level}`
          : "⚠️ Could not fetch live weather data."}
      </div>

      <div
        style={{
          background: disaster.active ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" : "linear-gradient(135deg, #475569 0%, #334155 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "32px" }}>🌊</span>
            <h1 style={{ color: "white", fontSize: "19px", margin: "6px 0 2px" }}>
              {disaster.alertTitle || "No Active Alert"}
            </h1>
            <p style={{ color: "#E2E8F0", margin: 0, fontSize: "13px" }}>
              {disaster.floodLevel || "Monitoring conditions"}
            </p>
          </div>

          <button
            onClick={handleToggleActive}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              fontSize: "12px",
              cursor: "pointer",
              backgroundColor: disaster.active ? "white" : "#EF4444",
              color: disaster.active ? "#DC2626" : "white"
            }}
          >
            {disaster.active ? "Deactivate SOS" : "🚨 Activate Flood Mode"}
          </button>
        </div>

        <div style={{ marginTop: "12px", fontSize: "12px", background: "rgba(255,255,255,0.15)", padding: "8px 12px", borderRadius: "8px" }}>
          ⚠️ <strong>Affected Zones:</strong> {disaster.affectedZones?.length ? disaster.affectedZones.join(", ") : "None currently"}
        </div>
      </div>

      <div className="care-card" style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 12px", color: "#0F6CBD" }}>
          📦 {lang === "te" ? "వరద సహాయక సామాగ్రి పంపిణీ" : "Emergency Flood Relief Supply Counter"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#166534" }}>{halazoneTabs}</div>
            <div style={{ fontSize: "12px", color: "#15803D", fontWeight: "600" }}>Chlorine Tabs Given</div>
            <button
              onClick={handleDistributeTabs}
              className="btn-outline"
              style={{ marginTop: "8px", padding: "4px 8px", fontSize: "11px", color: "#166534", borderColor: "#166534" }}
            >
              +50 Tabs
            </button>
          </div>

          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#B45309" }}>{orsDistributed}</div>
            <div style={{ fontSize: "12px", color: "#B45309", fontWeight: "600" }}>ORS Sachets Given</div>
            <button
              onClick={handleDistributeOrs}
              className="btn-outline"
              style={{ marginTop: "8px", padding: "4px 8px", fontSize: "11px", color: "#B45309", borderColor: "#B45309" }}
            >
              +25 Sachets
            </button>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: "10px" }}>
        {lang === "te" ? "పునరావాస కేంద్రాలు (Relief Shelters)" : "Designated Emergency Relief Shelters"}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
        {disaster.shelters?.map((s, idx) => {
          const occupancyPct = Math.round((s.occupied / s.capacity) * 100);
          return (
            <div key={idx} className="care-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "#0F172A" }}>🏕️ {s.name}</strong>
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                    Medical Lead: <strong>{s.medicalLead}</strong>
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    <span className="badge badge-low">🚰 Water: {s.waterPurity}</span>
                    <span className="badge badge-med">🍲 {s.foodPacks} Food Packs</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0F6CBD" }}>
                    {s.occupied} / {s.capacity}
                  </span>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>Occupancy ({occupancyPct}%)</div>
                </div>
              </div>

              <div style={{ width: "100%", background: "#E2E8F0", height: "6px", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
                <div
                  style={{
                    width: occupancyPct + "%",
                    background: occupancyPct > 80 ? "#DC2626" : "#0F6CBD",
                    height: "100%"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
        <span style={{ fontSize: "13px", color: "#991B1B", fontWeight: "bold" }}>
          🚨 District Disaster Control Room (West Godavari): 112 / 08812-230100
        </span>
      </div>
    </div>
  );
}

export default DisasterMode;
