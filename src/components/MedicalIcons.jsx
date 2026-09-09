import React from "react";

/**
 * Enterprise Clinical Medical Icons & Internal Telemetry Illustrations
 * High precision SVGs for healthcare UI design
 */

export function LungsIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 4v7" />
      <path d="M12 8c-2.5-2-5-2-7 0-2 2-2 7 0 10 1.5 2 3.5 2 5 1 .7-.5 1.5-1 2-2" />
      <path d="M12 8c2.5-2 5-2 7 0 2 2 2 7 0 10-1.5 2-3.5 2-5 1-.7-.5-1.5-1-2-2" />
      <path d="M9 13c-.5 1-1.5 1.5-2.5 1" />
      <path d="M15 13c.5 1 1.5 1.5 2.5 1" />
    </svg>
  );
}

export function HeartPulseIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H7l2-4 3 8 2-4h4.78" />
    </svg>
  );
}

export function BrainNeuroIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04Z" />
      <path d="M6 12h3" />
      <path d="M15 12h3" />
    </svg>
  );
}

export function GlucoseDropIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      <path d="M9.5 15.5a2.5 2.5 0 0 1 2.5-2.5" />
      <circle cx="14" cy="16" r="1" fill={color} />
      <circle cx="10" cy="18" r="1" fill={color} />
    </svg>
  );
}

export function StomachGastroIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M10 2v4c0 1.5-1 3-3 4-2.5 1.2-4 3.7-4 6.5A7.5 7.5 0 0 0 10.5 24c4.5 0 8.5-3.5 8.5-8.5 0-3-1.5-5.5-3.5-7-1.5-1.1-2.5-2.5-2.5-4.5V2" />
      <path d="M7 16c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

export function SepsisShieldIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="3" strokeDasharray="2 2" />
    </svg>
  );
}

export function EcgWaveGraphic({ width = 120, height = 30, color = "#0F766E", strokeWidth = 2 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 30" fill="none" style={{ display: "block" }}>
      <path
        d="M0 15 H30 L35 7 L42 24 L48 10 L54 18 L60 15 H80 L84 4 L90 26 L96 12 L102 17 L106 15 H120"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OximeterWaveGraphic({ width = 100, height = 24, color = "#0284C7" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 24" fill="none">
      <path
        d="M0 16 Q10 16 15 14 T25 4 Q30 4 35 12 T45 16 H50 Q60 16 65 14 T75 4 Q80 4 85 12 T95 16 H100"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThermometerGraphic({ temp = 98.6, width = 36, height = 70 }) {
  const minTemp = 95;
  const maxTemp = 105;
  const clamped = Math.max(minTemp, Math.min(maxTemp, Number(temp) || 98.6));
  const percent = ((clamped - minTemp) / (maxTemp - minTemp)) * 100;
  const fillHeight = Math.max(8, (percent / 100) * 44);

  const fillColor =
    clamped >= 102 ? "#DC2626" : clamped >= 99.5 ? "#EA580C" : clamped <= 96 ? "#2563EB" : "#16A34A";

  return (
    <svg width={width} height={height} viewBox="0 0 36 70" fill="none">
      <rect x="13" y="4" width="10" height="48" rx="5" stroke="#CBD5E1" strokeWidth="2" fill="#F8FAFC" />
      <circle cx="18" cy="54" r="10" stroke="#CBD5E1" strokeWidth="2" fill="#F8FAFC" />
      <rect x="15" y={48 - fillHeight} width="6" height={fillHeight} rx="3" fill={fillColor} />
      <circle cx="18" cy="54" r="8" fill={fillColor} />
      <line x1="8" y1="14" x2="11" y2="14" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="6" y1="24" x2="11" y2="24" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="8" y1="34" x2="11" y2="34" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="6" y1="44" x2="11" y2="44" stroke="#94A3B8" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Clinical Triage Hero Banner Graphic (Internal Picture / Illustration)
 */
export function TriageHeroIllustration() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0F766E 0%, #0F6CBD 60%, #0A4373 100%)",
        color: "white",
        borderRadius: "18px",
        padding: "22px 24px",
        marginBottom: "20px",
        boxShadow: "0 10px 25px -5px rgba(15, 118, 110, 0.35)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-20px",
          top: "-30px",
          opacity: 0.08,
          pointerEvents: "none"
        }}
      >
        <svg width="240" height="240" viewBox="0 0 100 100" fill="white">
          <rect x="35" y="0" width="30" height="100" rx="6" />
          <rect x="0" y="35" width="100" height="30" rx="6" />
        </svg>
      </div>

      <div style={{ zIndex: 1, maxWidth: "580px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#34D399",
                boxShadow: "0 0 8px #34D399"
              }}
            />
            Clinical Decision Support &bull; ESI & NEWS2
          </span>
          <span
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#A7F3D0",
              padding: "3px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "600"
            }}
          >
            Offline Field Telemetry
          </span>
        </div>

        <h1 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 6px 0", lineHeight: 1.2 }}>
          Emergency Clinical Triage & Risk Stratification
        </h1>
        <p style={{ color: "#E0F2FE", fontSize: "13px", margin: 0, lineHeight: 1.4 }}>
          Comprehensive multi-vector physiological biomarker telemetry & neural risk scoring for rural healthcare
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "14px",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "8px 14px",
            borderRadius: "10px",
            width: "fit-content"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <HeartPulseIcon size={18} color="#F87171" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#FEE2E2" }}>Telemetry Active</span>
          </div>
          <EcgWaveGraphic width={110} height={20} color="#34D399" strokeWidth={2} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "16px",
          padding: "16px 20px",
          textAlign: "center",
          zIndex: 1,
          minWidth: "130px"
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            marginBottom: "8px"
          }}
        >
          <HeartPulseIcon size={28} color="#0F766E" />
        </div>
        <div style={{ fontSize: "13px", fontWeight: "800", color: "white" }}>CDSS Protocol</div>
        <div style={{ fontSize: "11px", color: "#BAE6FD" }}>ESI Staging 1-5</div>
      </div>
    </div>
  );
}
