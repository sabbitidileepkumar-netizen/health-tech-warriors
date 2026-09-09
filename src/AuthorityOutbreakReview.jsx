import React, { useState, useEffect } from "react";
import { subscribeToCollection, updateOutbreakStatus, addAlert } from "./dataStore";

export function AuthorityOutbreakReview({ _lang = "en" }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [broadcastAlertOnVerify, setBroadcastAlertOnVerify] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCollection("outbreak_reports", (list) => {
      setReports(list);
    });
    return () => unsub();
  }, []);

  const handleTakeAction = async (report, nextStatus) => {
    await updateOutbreakStatus(report.id, nextStatus, {
      actionNotes: actionNotes || "Medical teams mobilized; MMUs dispatched with ORS & chlorine tablets.",
      actionTakenAt: new Date().toISOString()
    });

    if (broadcastAlertOnVerify && (nextStatus === "VERIFIED" || nextStatus === "ACTION_TAKEN")) {
      await addAlert({
        title: `Epidemic Warning: ${report.village}`,
        type: "DISEASE",
        severity: "CRITICAL",
        message: `${report.affectedCount} cases of ${report.condition} reported in ${report.village}. Emergency Mobile Medical Units dispatched. Drink only boiled water.`,
        targetType: "VILLAGE",
        targetVillages: [report.village],
        audience: "BOTH"
      });
    }

    setSelectedReport(null);
    setActionNotes("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>🏕️ Village Outbreak Surveillance Review</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Investigate frontline ASHA reports, verify epidemics, and deploy emergency units
          </p>
        </div>
        <span className="badge badge-high" style={{ padding: "6px 12px", fontSize: "12px" }}>
          {reports.filter((r) => r.status !== "RESOLVED").length} Active Reports
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reports.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No outbreak reports submitted.</p>
        ) : (
          reports.map((rep) => {
            const isCritical = rep.severity === "CRITICAL" || rep.affectedCount >= 100;

            return (
              <div
                key={rep.id}
                className="care-card"
                style={{
                  borderLeft: isCritical ? "4px solid #DC2626" : "4px solid #EA580C"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{rep.condition}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                      📍 <strong>{rep.village}</strong> &bull; Date: {rep.date} &bull; Reporter:{" "}
                      <strong>{rep.reportedByAshaName || "ASHA"}</strong>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: rep.status === "RESOLVED" ? "#DCFCE7" : "#FEE2E2",
                      color: rep.status === "RESOLVED" ? "#166534" : "#DC2626"
                    }}
                  >
                    {rep.status}
                  </span>
                </div>

                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#991B1B",
                    margin: "8px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>⚠️ <strong>Affected Individuals:</strong> {rep.affectedCount} persons</span>
                  <span style={{ fontWeight: "700" }}>Severity: {rep.severity}</span>
                </div>

                <p style={{ margin: "6px 0", fontSize: "13px", color: "#334155" }}>
                  {rep.description}
                </p>

                {rep.actionNotes && (
                  <div style={{ background: "#F8FAFC", padding: "8px", borderRadius: "6px", fontSize: "11px", color: "#0F6CBD", marginTop: "6px" }}>
                    <strong>Action Log:</strong> {rep.actionNotes}
                  </div>
                )}

                {rep.status !== "RESOLVED" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                    <button
                      className="btn-primary"
                      onClick={() => setSelectedReport(rep)}
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                    >
                      ⚡ Mobilize Response
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#DC2626", marginTop: 0 }}>Mobilize Outbreak Intervention</h3>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              Village: <strong>{selectedReport.village}</strong> &bull; Condition: <strong>{selectedReport.condition}</strong> (
              {selectedReport.affectedCount} cases)
            </p>

            <div style={{ margin: "14px 0" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Response Directive / Action Plan
              </label>
              <textarea
                rows="3"
                placeholder="e.g. 2 Mobile Medical Units dispatched. Chlorine packets allocated..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={broadcastAlertOnVerify}
                  onChange={(e) => setBroadcastAlertOnVerify(e.target.checked)}
                />
                <span>Automatically broadcast public emergency alert to {selectedReport.village} citizens</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-outline" onClick={() => setSelectedReport(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => handleTakeAction(selectedReport, "ACTION_TAKEN")}
                style={{ flex: 2 }}
              >
                🚨 Deploy MMU & Take Action
              </button>
              <button
                className="btn-primary"
                onClick={() => handleTakeAction(selectedReport, "RESOLVED")}
                style={{ flex: 1, background: "#16A34A" }}
              >
                ✓ Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityOutbreakReview;
