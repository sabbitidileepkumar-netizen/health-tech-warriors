import React, { useState, useEffect } from "react";
import { getLocal } from "./dataStore";

export function WeatherSeasonalAlerts({ onBack, lang = "en" }) {
  const [weather, setWeather] = useState(null);
  const [checklist, setChecklist] = useState({
    chlorine: false,
    orsPacks: true,
    mosquitoFogging: false,
    gumbootsAdvisory: true
  });

  useEffect(() => {
    setWeather(getLocal("weather_intelligence"));
  }, []);

  const toggleTask = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!weather) return null;

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#E0F2FE", color: "#0369A1" }}>Met Department & Health Sync</span>
      </div>

      {/* Weather Header Card */}
      <div style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", color: "white", padding: "20px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", margin: 0 }}>
              {lang === "te" ? "వాతావరణ & సీజనల్ ఆరోగ్య హెచ్చరికలు" : "Seasonal Weather & Health Intelligence"}
            </h1>
            <p style={{ color: "#E0F2FE", margin: "4px 0 0", fontSize: "13px" }}>
              📍 {weather.region}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "36px", fontWeight: "800" }}>{weather.temp}</span>
            <div style={{ fontSize: "12px", color: "#BAE6FD" }}>Humidity: {weather.humidity}</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "10px 14px", borderRadius: "10px", marginTop: "14px", fontSize: "13px" }}>
          🌧️ <strong>Forecast:</strong> {weather.forecast} &bull; ⚠️ <strong>Flood Risk:</strong> {weather.floodRisk}
        </div>
      </div>

      {/* Seasonal Threat Matrix */}
      <h3 style={{ marginBottom: "10px" }}>
        {lang === "te" ? "ప్రస్తుత సీజనల్ వ్యాధుల ప్రమాద సూచిక" : "Active Seasonal Health Risks"}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
        {weather.seasonalAlerts?.map((alert, idx) => {
          const isCritical = alert.level === "CRITICAL";
          return (
            <div
              key={idx}
              className="care-card"
              style={{
                margin: 0,
                borderLeft: isCritical ? "6px solid #DC2626" : "6px solid #F59E0B",
                background: isCritical ? "#FFF5F5" : "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{alert.threat}</strong>
                  </div>
                  <span className="badge" style={{ background: "#F1F5F9", color: "#475569", marginTop: "4px", fontSize: "11px" }}>
                    {alert.season}
                  </span>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#334155" }}>
                    <strong>Action Required:</strong> {alert.action}
                  </p>
                </div>

                <span className={"badge " + (isCritical ? "badge-high" : "badge-med")}>
                  {alert.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ASHA Preventive Field Action Checklist */}
      <div className="care-card">
        <h3 style={{ color: "#0F6CBD", margin: "0 0 12px" }}>
          📋 {lang === "te" ? "ఆశా కార్యకర్త నివారణ చర్యల చెక్‌లిస్ట్" : "ASHA Field Preparedness Checklist"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
            <input
              type="checkbox"
              checked={checklist.chlorine}
              onChange={() => toggleTask("chlorine")}
              style={{ width: "auto" }}
            />
            <span>Chlorinate drinking water wells in Relangi low-lying areas</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
            <input
              type="checkbox"
              checked={checklist.orsPacks}
              onChange={() => toggleTask("orsPacks")}
              style={{ width: "auto" }}
            />
            <span>Pre-position 50+ ORS & Zinc packets in vulnerable households</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
            <input
              type="checkbox"
              checked={checklist.mosquitoFogging}
              onChange={() => toggleTask("mosquitoFogging")}
              style={{ width: "auto" }}
            />
            <span>Coordinate with Gram Panchayat for anti-larval spray in Attili</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
            <input
              type="checkbox"
              checked={checklist.gumbootsAdvisory}
              onChange={() => toggleTask("gumbootsAdvisory")}
              style={{ width: "auto" }}
            />
            <span>Issue field advisory for paddy farmers to wear gumboots during weeding</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default WeatherSeasonalAlerts;
