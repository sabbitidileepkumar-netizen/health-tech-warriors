import React, { useState, useEffect } from "react";
import { subscribeToCollection } from "./dataStore";

export function AuthorityAuditLog({ lang = "en" }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = subscribeToCollection("audit_logs", (list) => {
      setLogs(list);
    });
    return () => unsub();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.actor?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>📜 System Security & Clinical Audit Logs</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Immutable administrative records, clinical actions, and emergency dispatches
          </p>
        </div>
        <span className="badge" style={{ background: "#F1F5F9", color: "#475569" }}>
          {logs.length} Total Logs
        </span>
      </div>

      <input
        type="text"
        placeholder="🔍 Filter audit logs by actor, action or keywords..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "14px" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No audit logs found.</p>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span
                  style={{
                    fontWeight: "700",
                    color:
                      log.action?.includes("ALERT") || log.action?.includes("CRITICAL")
                        ? "#DC2626"
                        : log.action?.includes("SCHEDULE")
                        ? "#0F6CBD"
                        : "#0D9488",
                    fontSize: "11px"
                  }}
                >
                  [{log.action}]
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={{ color: "#1E293B", fontWeight: "500", marginBottom: "2px" }}>
                {log.details}
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>
                Actor: <strong>{log.actor}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuthorityAuditLog;
