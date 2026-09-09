import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export function AuthScreen({ lang, setLang, t }) {
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginAsGuest,
    loginWithDemoAccount,
    sendPasswordReset
  } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("CITIZEN");
  const [village, setVillage] = useState("Relangi");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const villages = ["Relangi", "Tanuku", "Attili", "K.S. Gattu"];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError(lang === "te" ? "దయచేసి ఇమెయిల్ నమోదు చేయండి." : "Please enter your email.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        await sendPasswordReset(email);
        setNotice(
          lang === "te"
            ? "పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఇమెయిల్‌కి పంపబడింది."
            : "Password reset instructions sent to your email."
        );
      } catch (err) {
        setError(err.message || "Failed to send reset link.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password.trim()) {
      setError(lang === "te" ? "దయచేసి పాస్‌వర్డ్ నమోదు చేయండి." : "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, {
          name,
          role: selectedRole,
          village,
          phone
        });
      }
    } catch (err) {
      const msg = err.code === "auth/invalid-credential"
        ? (lang === "te" ? "తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్." : "Invalid email or password.")
        : err.code === "auth/email-already-in-use"
        ? (lang === "te" ? "ఈ ఇమెయిల్ ఇప్పటికే వాడుకలో ఉంది." : "Email already registered.")
        : (err.message || "Authentication failed.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "Google sign-in is not authorized on this domain in Firebase Console. You can use Email/Password or 1-Click Demo Login below."
        );
      } else {
        setError(err.message || "Google sign-in could not be completed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: "480px", margin: "20px auto", padding: "16px" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0F6CBD 0%, #0D9488 100%)",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "34px",
            boxShadow: "0 8px 24px rgba(15, 108, 189, 0.25)",
            marginBottom: "12px"
          }}
        >
          🩺
        </div>
        <h1 style={{ color: "#0F6CBD", fontSize: "24px", margin: "0 0 4px 0", fontWeight: "800" }}>
          {t.authTitle || "CARE-LINK"}
        </h1>
        <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontWeight: "500" }}>
          {t.authSubtitle || "Rural Health & Public Health Services"}
        </p>
      </div>

      {/* Language Quick Selector */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "10px",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>🌐 {t.switchLanguage}:</span>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { code: "te", label: "తెలుగు" },
            { code: "en", label: "EN" },
            { code: "hi", label: "हिंदी" },
            { code: "mr", label: "मराठी" }
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "8px",
                border: lang === item.code ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                background: lang === item.code ? "#EBF3FC" : "white",
                color: lang === item.code ? "#0F6CBD" : "#475569",
                fontWeight: lang === item.code ? "700" : "500",
                cursor: "pointer"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="care-card" style={{ border: "1.5px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
        {/* Toggle between Login and Signup */}
        {mode !== "forgot" && (
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              padding: "4px",
              borderRadius: "10px",
              marginBottom: "16px"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setNotice("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                background: mode === "login" ? "white" : "transparent",
                color: mode === "login" ? "#0F6CBD" : "#64748B",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: mode === "login" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setNotice("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                background: mode === "signup" ? "white" : "transparent",
                color: mode === "signup" ? "#0F6CBD" : "#64748B",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {t.signup}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              color: "#991B1B",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
              marginBottom: "14px",
              fontWeight: "600",
              textAlign: "center"
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {notice && (
          <div
            style={{
              background: "#DCFCE7",
              color: "#166534",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
              marginBottom: "14px",
              fontWeight: "600",
              textAlign: "center"
            }}
          >
            ✅ {notice}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit}>
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  👤 {t.name}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  🏷️ Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="CITIZEN">👤 {t.roleCitizen}</option>
                  <option value="ASHA_WORKER">👩‍⚕️ {t.roleAsha}</option>
                  <option value="HIGHER_AUTHORITY">🏛️ {t.roleAuthority}</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  📍 {t.village}
                </label>
                <select value={village} onChange={(e) => setVillage(e.target.value)} style={{ width: "100%" }}>
                  {villages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  📱 {t.phone}
                </label>
                <input
                  type="tel"
                  placeholder="10-digit phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
              ✉️ Email
            </label>
            <input
              type="email"
              placeholder="user@carelink.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          {mode !== "forgot" && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>🔒 Password</label>
                {mode === "login" && (
                  <span
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setNotice("");
                    }}
                    style={{ fontSize: "11px", color: "#0F6CBD", cursor: "pointer", fontWeight: "600" }}
                  >
                    {t.forgotPassword}
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}
          >
            {loading ? "..." : mode === "login" ? t.login : mode === "signup" ? t.signup : t.resetPassword}
          </button>

          {mode === "forgot" && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              style={{ width: "100%", padding: "8px", fontSize: "12px" }}
            >
              ⬅️ {t.back}
            </button>
          )}
        </form>

        {/* Separator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "14px 0",
            color: "#94A3B8",
            fontSize: "11px",
            fontWeight: "600"
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ padding: "0 10px" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1.5px solid #CBD5E1",
            background: "white",
            color: "#1E293B",
            fontWeight: "600",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {t.continueWithGoogle || "Continue with Google"}
        </button>

        {/* Continue as Guest */}
        <button
          type="button"
          onClick={loginAsGuest}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1.5px dashed #94A3B8",
            background: "#F8FAFC",
            color: "#475569",
            fontWeight: "600",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer"
          }}
        >
          <span>🌐</span> {t.continueAsGuest || "Continue as Guest (Public Services)"}
        </button>
      </div>

      {/* Instant Demo Logins Section */}
      <div
        style={{
          marginTop: "20px",
          background: "#F0FDF4",
          border: "1.5px solid #BBF7D0",
          borderRadius: "14px",
          padding: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <strong style={{ fontSize: "13px", color: "#166534" }}>{t.demoAccounts || "Instant Demo Logins"}</strong>
        </div>
        <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#15803D" }}>
          One-click login to inspect full role-based functionality:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
          <button
            type="button"
            onClick={() => loginWithDemoAccount("CITIZEN")}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #86EFAC",
              background: "white",
              color: "#166534",
              fontWeight: "600",
              fontSize: "12px",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span>👤 <strong>Citizen View:</strong> Ravi Kumar (Relangi)</span>
            <span style={{ fontSize: "11px", color: "#16A34A" }}>Login &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => loginWithDemoAccount("ASHA_WORKER")}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #86EFAC",
              background: "white",
              color: "#166534",
              fontWeight: "600",
              fontSize: "12px",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span>👩‍⚕️ <strong>ASHA Worker:</strong> Rani Devi (Relangi Beat)</span>
            <span style={{ fontSize: "11px", color: "#16A34A" }}>Login &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => loginWithDemoAccount("HIGHER_AUTHORITY")}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #86EFAC",
              background: "white",
              color: "#166534",
              fontWeight: "600",
              fontSize: "12px",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span>🏛️ <strong>Higher Authority:</strong> Dr. K.V. Rao (DM&HO)</span>
            <span style={{ fontSize: "11px", color: "#16A34A" }}>Login &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
