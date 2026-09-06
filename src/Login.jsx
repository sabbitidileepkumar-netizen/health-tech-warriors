import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export function Login({ onLoginSuccess, onCancel, t, lang = "en" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(lang === "te" ? "దయచేసి ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి." : "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        name: userCred.user.email.split("@")[0],
        loginAt: new Date().toISOString()
      };
      localStorage.setItem("carelink_asha_auth", JSON.stringify(authData));
      onLoginSuccess(authData);
    } catch (err) {
      setError(
        lang === "te"
          ? "తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్."
          : "Invalid email or password."
      );
    }
    setLoading(false);
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
            {lang === "te" ? "ఆశా కార్యకర్త అధికారిక లాగిన్" : "ASHA Health Worker Portal"}
          </h2>
          <p style={{ color: "#64748B", fontSize: "13px", marginTop: "4px" }}>
            {lang === "te"
              ? "ఈ పోర్టల్ గ్రామీణ ఆరోగ్య పర్యవేక్షణ కోసం కేటాయించబడింది"
              : "Authorized clinical intake, triage & village outbreak surveillance"}
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", fontWeight: "600", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              🆔 {lang === "te" ? "ఇమెయిల్" : "Email"}
            </label>
            <input
              type="email"
              placeholder="ashaworker@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid var(--border)" }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              🔒 {lang === "te" ? "పాస్‌వర్డ్" : "Password"}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid var(--border)" }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: "15px", marginBottom: "12px" }}
          >
            {loading ? "..." : "🔓 " + (lang === "te" ? "సురక్షితంగా లాగిన్ అవ్వండి" : "Secure ASHA Login")}
          </button>
        </form>

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
