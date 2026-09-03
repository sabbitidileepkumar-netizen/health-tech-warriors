import React, { useState, useEffect } from "react";
import { getLocal, triggerHealthCampDispatch } from "./dataStore";

export function OutbreakMonitor({ onBack, lang = "en" }) {
  const [outbreaks, setOutbreaks] = useState([]);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  useEffect(() => {
    setOutbreaks(getLocal("village_outbreaks"));
  }, []);

  const handleDispatch = (village) => {
    const updated = triggerHealthCampDispatch(village);
    setOutbreaks([...updated]);
    setDispatchAlert({
      village,
      time: new Date().toLocaleTimeString()
    });
    setTimeout(() => {
      setDispatchAlert(null);
    }, 8000);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>Epidemic Surveillance</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🏕️</span>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", margin: 0 }}>Village Outbreak & Health Camp Alert</h1>
            <p style={{ color: "#FEE2E2", margin: 0, fontSize: "13px" }}>
              Automated threshold trigger: When cases exceed 100+, dispatch emergency mobile medical camps.
            </p>
          </div>
        </div>
      </div>

      {dispatchAlert && (
        <div style={{ background: "#DCFCE7", border: "1.5px solid #86EFAC", padding: "14px", borderRadius: "14px", marginBottom: "16px" }}>
          <div style={{ color: "#166534", fontWeight: "bold", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✅</span> Emergency Health Camp Dispatched to {dispatchAlert.village}!
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#14532D" }}>
            Alert broadcasted at {dispatchAlert.time} to District Civil Surgeon & 2 Mobile Medical Units (MMUs).
          </p>
        </div>
      )}

      <h3 style={{ marginBottom: "12px" }}>Village Disease Surveillance</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {outbreaks.map((v) => {
          const isEpidemic = v.cases >= 100;
          return (
            <div
              key={v.village}
              className="care-card"
              style={{
                margin: 0,
                borderLeft: isEpidemic ? "6px solid #DC2626" : "6px solid #0D9488",
                background: isEpidemic ? "#FFF5F5" : "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ color: "#0F172A", margin: 0 }}>🏡 {v.village}</h3>
                    {isEpidemic && (
                      <span className="badge badge-high">⚠️ EPIDEMIC ALERT</span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "13px", color: "#475569" }}>
                    Primary Condition: <strong>{v.primaryCondition}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                    Updated: {v.lastUpdated}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: isEpidemic ? "#DC2626" : "#0D9488" }}>
                    {v.cases}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Total Reported Cases</div>
                </div>
              </div>

              {isEpidemic && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #FECACA" }}>
                  <p style={{ fontSize: "12px", color: "#991B1B", marginBottom: "8px", fontWeight: "600" }}>
                    🚨 Outbreak threshold (&gt;100 cases) breached! Immediate village health camp required to stop transmission.
                  </p>
                  {v.campDispatched ? (
                    <div style={{ background: "#DCFCE7", color: "#166534", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", textAlign: "center" }}>
                      🚑 Mobile Health Camp Dispatched (Under Deployment)
                    </div>
                  ) : (
                    <button
                      className="btn-danger"
                      onClick={() => handleDispatch(v.village)}
                      style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                    >
                      🚨 Dispatch Emergency Health Camp Now
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
