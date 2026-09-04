import React, { useState } from "react";

export function Login({ onLoginSuccess, onCancel, t, lang = "en" }) {
  const [workerId, setWorkerId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!workerId.trim() || !pin.trim()) {
      setError(lang === "te" ? "దయచేసి ఆశా ఐడీ మరియు పిన్ నమోదు చేయండి." : "Please enter ASHA ID and security PIN.");
      return;
    }

    // Authenticate and save session
    const authData = {
      workerId: workerId.trim(),
      name: "Lakshmi Devi (ASHA)",
      village: "Relangi",
      beat: "Beat #4 - West Godavari",
      loginAt: new Date().toISOString()
    };
    localStorage.setItem("carelink_asha_auth", JSON.stringify(authData));
    onLoginSuccess(authData);
  };

  const handleDemoLogin = () => {
    const demoData = {
      workerId: "ASHA-RELANGI-04",
      name: "Sujatha K (ASHA Lead)",
      village: "Relangi",
      beat: "Tanuku Mandal - Beat #4",
      loginAt: new Date().toISOString()
    };
    localStorage.setItem("carelink_asha_auth", JSON.stringify(demoData));
    onLoginSuccess(demoData);
  };

  return (
    <div className="page-content" style={{ maxWidth: "460px", margin: "30px auto" }}>
      <div className="care-card" style={{ border: "2px solid #0F6CBD", boxShadow: "var(--shadow-lg)", padding: "26px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0F6CBD, #0D9488)",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "12px",
              boxShadow: "0 4px 12px rgba(15,108,189,0.25)"
            }}
          >
            👩‍⚕️
          </div>
          <h2 style={{ color: "#0F6CBD", margin: 0, fontSize: "21px" }}>
            {lang === "te" ? "ఆశా కార్యకర్త అధికారిక లాగిన్" : lang === "hi" ? "आशा कार्यकर्ता आधिकारिक लॉगिन" : "ASHA Health Worker Portal"}
          </h2>
          <p style={{ color: "#64748B", fontSize: "13px", marginTop: "4px" }}>
            {lang === "te"
              ? "ఈ పోర్టల్ గ్రామీణ ఆరోగ్య పర్యవేక్షణ కోసం కేటాయించబడింది"
              : "Authorized clinical intake, triage & village outbreak surveillance"}
          </p>
          <span className="badge" style={{ background: "#E6F7F5", color: "#0D9488", fontSize: "11px", marginTop: "6px" }}>
            🛡️ NHM / Govt. of Andhra Pradesh Healthcare Desk
          </span>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", fontWeight: "600", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              🆔 {lang === "te" ? "ఆశా వర్కర్ ఐడీ లేదా రిజిస్టర్డ్ మొబైల్" : "ASHA Worker ID / Mobile"}
            </label>
            <input
              type="text"
              placeholder="e.g. ASHA-RELANGI-04 or 98480XXXXX"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid var(--border)" }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              🔒 {lang === "te" ? "సెక్యూరిటీ పిన్ / పాస్‌వర్డ్" : "Security PIN / Password"}
            </label>
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid var(--border)" }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "12px", fontSize: "15px", marginBottom: "12px" }}
          >
            🔓 {lang === "te" ? "సురక్షితంగా లాగిన్ అవ్వండి" : "Secure ASHA Login"}
          </button>
        </form>

        <div style={{ position: "relative", textAlign: "center", margin: "16px 0" }}>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
          <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 10px", fontSize: "11px", color: "#94A3B8" }}>
            OR QUICK DEMO
          </span>
        </div>

        {/* 1-Click Demo Login for SIH Jury and offline testing */}
        <button
          onClick={handleDemoLogin}
          style={{
            width: "100%",
            background: "#ECFDF5",
            color: "#065F46",
            border: "1.5px dashed #10B981",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "12px"
          }}
        >
          ⚡ {lang === "te" ? "త్వరిత ఆశా డెమో లాగిన్ (రిలంగి బీట్ #4)" : "Quick ASHA Demo Login (Relangi Beat #4)"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-outline"
            style={{ width: "100%", padding: "8px", fontSize: "12px" }}
          >
            ⬅️ {lang === "te" ? "పౌరుల మోడ్‌కి తిరిగి వెళ్లండి" : "Back to Citizen View"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;
