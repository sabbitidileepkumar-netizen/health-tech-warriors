import React from "react";
import {
  HeartPulseIcon,
  GlucoseDropIcon,
  LungsIcon,
  OximeterWaveGraphic,
  ThermometerGraphic
} from "./MedicalIcons";
import { Activity, Zap } from "lucide-react";

/**
 * Real-time Clinical Vitals Telemetry Gauges
 * Renders physiological gauges for BP, Glucose, SpO2, Pulse, and Temp.
 */

export function BloodPressureGauge({
  systolic,
  diastolic,
  onChangeSys,
  onChangeDia,
  liveEval
}) {
  const sysNum = Number(systolic) || 0;
  const diaNum = Number(diastolic) || 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: liveEval ? `1.5px solid ${liveEval.color}` : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <HeartPulseIcon size={16} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
              Blood Pressure (BP)
            </div>
            <div style={{ fontSize: "10px", color: "#64748B" }}>AHA Clinical Staging</div>
          </div>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>mmHg</span>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Systolic</label>
          <input
            type="number"
            placeholder="e.g. 120"
            value={systolic}
            onChange={(e) => onChangeSys(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "8px"
            }}
          />
        </div>
        <span style={{ fontSize: "18px", fontWeight: "800", color: "#94A3B8", marginTop: "14px" }}>/</span>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Diastolic</label>
          <input
            type="number"
            placeholder="e.g. 80"
            value={diastolic}
            onChange={(e) => onChangeDia(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "8px"
            }}
          />
        </div>
      </div>

      {/* Visual Staging Bar */}
      {liveEval ? (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: liveEval.bg,
              color: liveEval.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{liveEval.stage}</span>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>Score: +{liveEval.score}</span>
          </div>

          {/* Graphical BP Spectrum Gauge */}
          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginTop: "6px", gap: "2px" }}>
            <div style={{ flex: 1, background: sysNum < 120 ? "#16A34A" : "#E2E8F0" }} title="Normal (<120)" />
            <div style={{ flex: 1, background: sysNum >= 120 && sysNum < 130 ? "#EAB308" : "#E2E8F0" }} title="Elevated (120-129)" />
            <div style={{ flex: 1, background: sysNum >= 130 && sysNum < 140 ? "#F97316" : "#E2E8F0" }} title="Stage 1 HTN (130-139)" />
            <div style={{ flex: 1, background: sysNum >= 140 && sysNum < 180 ? "#DC2626" : "#E2E8F0" }} title="Stage 2 HTN (140-179)" />
            <div style={{ flex: 1, background: sysNum >= 180 || diaNum >= 120 ? "#991B1B" : "#E2E8F0" }} title="Crisis (>=180 or >=120)" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "8px", textAlign: "center" }}>
          Target: &lt;120/80 mmHg
        </div>
      )}
    </div>
  );
}

export function BloodSugarGauge({
  bloodSugar,
  sugarState,
  onChangeSugar,
  onChangeState,
  liveEval
}) {
  const sugarNum = Number(bloodSugar) || 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: liveEval ? `1.5px solid ${liveEval.color}` : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#F3E8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <GlucoseDropIcon size={16} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
              Blood Glucose
            </div>
            <div style={{ fontSize: "10px", color: "#64748B" }}>ADA Glycemic Spectrum</div>
          </div>
        </div>
        <select
          value={sugarState}
          onChange={(e) => onChangeState(e.target.value)}
          style={{
            fontSize: "11px",
            padding: "3px 6px",
            borderRadius: "6px",
            width: "auto",
            fontWeight: "600"
          }}
        >
          <option value="random">Random</option>
          <option value="fasting">Fasting</option>
          <option value="postprandial">Post-Meal</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Value (mg/dL)</label>
        <input
          type="number"
          placeholder="e.g. 110 mg/dL"
          value={bloodSugar}
          onChange={(e) => onChangeSugar(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "14px",
            fontWeight: "700",
            borderRadius: "8px"
          }}
        />
      </div>

      {liveEval ? (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: liveEval.bg,
              color: liveEval.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{liveEval.status}</span>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>Score: +{liveEval.score}</span>
          </div>

          {/* Glycemic Spectrum Bar */}
          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginTop: "6px", gap: "2px" }}>
            <div style={{ flex: 1, background: sugarNum > 0 && sugarNum < 70 ? "#DC2626" : "#E2E8F0" }} title="Hypoglycemia (<70)" />
            <div style={{ flex: 1.5, background: sugarNum >= 70 && sugarNum <= 140 ? "#16A34A" : "#E2E8F0" }} title="Normal (70-140)" />
            <div style={{ flex: 1, background: sugarNum > 140 && sugarNum <= 199 ? "#F59E0B" : "#E2E8F0" }} title="Pre-diabetic / Elevated" />
            <div style={{ flex: 1.5, background: sugarNum >= 200 ? "#DC2626" : "#E2E8F0" }} title="Severe Hyperglycemia (200+)" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "8px", textAlign: "center" }}>
          Fasting: 70–99 | Random: &lt;140 mg/dL
        </div>
      )}
    </div>
  );
}

export function OxygenSpo2Gauge({ spo2, onChangeSpo2, liveEval }) {
  const o2Num = Number(spo2) || 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: liveEval ? `1.5px solid ${liveEval.color}` : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#E0F2FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <LungsIcon size={16} color="#0284C7" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
              Oxygen Saturation (SpO2)
            </div>
            <div style={{ fontSize: "10px", color: "#64748B" }}>Pulse Oximeter Telemetry</div>
          </div>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>%</span>
      </div>

      <div>
        <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Reading (%)</label>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="number"
            placeholder="e.g. 98%"
            value={spo2}
            onChange={(e) => onChangeSpo2(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "8px"
            }}
          />
          {o2Num >= 90 && (
            <div style={{ display: "none" }} className="telemetry-pleth">
              <OximeterWaveGraphic width={70} height={20} color="#0284C7" />
            </div>
          )}
        </div>
      </div>

      {liveEval ? (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: liveEval.bg,
              color: liveEval.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{liveEval.status}</span>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>Score: +{liveEval.score}</span>
          </div>

          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginTop: "6px", gap: "2px" }}>
            <div style={{ flex: 1, background: o2Num > 0 && o2Num < 90 ? "#DC2626" : "#E2E8F0" }} title="Critical Hypoxia (<90)" />
            <div style={{ flex: 1, background: o2Num >= 90 && o2Num <= 93 ? "#F59E0B" : "#E2E8F0" }} title="Mild Hypoxia (90-93)" />
            <div style={{ flex: 2, background: o2Num >= 94 ? "#16A34A" : "#E2E8F0" }} title="Adequate Saturation (>=94)" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "8px", textAlign: "center" }}>
          Normal: 95% – 100% ambient air
        </div>
      )}
    </div>
  );
}

export function PulseHeartRateGauge({ pulse, onChangePulse, liveEval }) {
  const bpmNum = Number(pulse) || 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: liveEval && liveEval.alert ? "1.5px solid #EA580C" : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#FFF7ED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Activity size={16} color="#EA580C" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
              Pulse / Heart Rate
            </div>
            <div style={{ fontSize: "10px", color: "#64748B" }}>NEWS2 Cardiac Staging</div>
          </div>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>BPM</span>
      </div>

      <div>
        <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Beats / Minute</label>
        <input
          type="number"
          placeholder="e.g. 74 BPM"
          value={pulse}
          onChange={(e) => onChangePulse(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "14px",
            fontWeight: "700",
            borderRadius: "8px"
          }}
        />
      </div>

      {liveEval && liveEval.alert ? (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: "#FFF7ED",
              color: liveEval.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{liveEval.alert}</span>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>Score: +{liveEval.score}</span>
          </div>

          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginTop: "6px", gap: "2px" }}>
            <div style={{ flex: 1, background: bpmNum > 0 && bpmNum < 50 ? "#DC2626" : "#E2E8F0" }} title="Severe Bradycardia (<50)" />
            <div style={{ flex: 1.5, background: bpmNum >= 60 && bpmNum <= 100 ? "#16A34A" : "#E2E8F0" }} title="Normal (60-100)" />
            <div style={{ flex: 1, background: bpmNum > 100 && bpmNum <= 130 ? "#F59E0B" : "#E2E8F0" }} title="Tachycardia (101-130)" />
            <div style={{ flex: 1, background: bpmNum > 130 ? "#DC2626" : "#E2E8F0" }} title="Severe Tachycardia (>130)" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "8px", textAlign: "center" }}>
          Target: 60 – 100 beats/min at rest
        </div>
      )}
    </div>
  );
}

export function TemperatureGauge({ temp, onChangeTemp, liveEval }) {
  const tempNum = Number(temp) || 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: liveEval && liveEval.alert ? "1.5px solid #EA580C" : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Zap size={16} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
              Body Temperature
            </div>
            <div style={{ fontSize: "10px", color: "#64748B" }}>Core Pyrexia Telemetry</div>
          </div>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>°F</span>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", color: "#64748B", marginBottom: "2px" }}>Oral/Axillary (°F)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 98.6°F"
            value={temp}
            onChange={(e) => onChangeTemp(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "8px"
            }}
          />
        </div>
        {tempNum > 0 && <ThermometerGraphic temp={tempNum} width={28} height={50} />}
      </div>

      {liveEval && liveEval.alert ? (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: "#FEF2F2",
              color: liveEval.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{liveEval.alert}</span>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>Score: +{liveEval.score}</span>
          </div>

          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginTop: "6px", gap: "2px" }}>
            <div style={{ flex: 1, background: tempNum > 0 && tempNum < 96 ? "#2563EB" : "#E2E8F0" }} title="Hypothermia (<96°F)" />
            <div style={{ flex: 1.5, background: tempNum >= 97 && tempNum <= 99.5 ? "#16A34A" : "#E2E8F0" }} title="Normothermia (97-99.5°F)" />
            <div style={{ flex: 1, background: tempNum > 99.5 && tempNum <= 102 ? "#F59E0B" : "#E2E8F0" }} title="Pyrexia (99.6-102°F)" />
            <div style={{ flex: 1, background: tempNum > 102 ? "#DC2626" : "#E2E8F0" }} title="Hyperpyrexia (>102°F)" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "8px", textAlign: "center" }}>
          Normal: 97.8°F – 99.1°F (36.5°C – 37.3°C)
        </div>
      )}
    </div>
  );
}
