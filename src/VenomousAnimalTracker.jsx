import React, { useState, useEffect } from "react";
import { getLocal, reportVenomIncident } from "./dataStore";

export function VenomousAnimalTracker({ onBack, lang = "en" }) {
  const [stocks, setStocks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [victimName, setVictimName] = useState("");
  const [village, setVillage] = useState("Relangi");
  const [biteType, setBiteType] = useState("Russell Viper Snakebite");
  const [targetFacility, setTargetFacility] = useState("Tanuku Government Area Hospital (AH Tanuku)");
  const [sosDispatched, setSosDispatched] = useState(false);

  useEffect(() => {
    setStocks(getLocal("venom_stocks"));
    setIncidents(getLocal("venom_incidents"));
  }, []);

  const handleReport = (e) => {
    e.preventDefault();
    if (!victimName) return;

    reportVenomIncident({
      victimName,
      village,
      type: biteType,
      facility: targetFacility,
      status: "108 Dispatched - In Transit",
      urgency: "CRITICAL"
    });

    setIncidents(getLocal("venom_incidents"));
    setShowReportModal(false);
    setSosDispatched(true);
    setVictimName("");
    setTimeout(() => {
      setSosDispatched(false);
    }, 8000);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>Golden Hour Critical</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🐍</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "పాము కాటు & విష రక్షణ అత్యవసర డెస్క్" : "Venomous Attack & Anti-Venom Lifeline"}
            </h1>
            <p style={{ color: "#FEE2E2", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "తణుకు, భీమవరం, అత్తిలి పరిధిలోని ASV నిల్వలు & తక్షణ 108 అంబులెన్స్ సేవలు"
                : "Real-time Anti-Snake Venom (ASV) stocks & immediate 108 trauma referral"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          style={{
            marginTop: "14px",
            width: "100%",
            background: "white",
            color: "#DC2626",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          🚨 {lang === "te" ? "పాము కాటు / జంతు దాడి అత్యవసర అలర్ట్ పంపండి" : "Report Urgent Snakebite / Animal Attack"}
        </button>
      </div>

      {sosDispatched && (
        <div style={{ background: "#DCFCE7", border: "1.5px solid #86EFAC", padding: "12px", borderRadius: "12px", marginBottom: "16px" }}>
          <strong style={{ color: "#166534", fontSize: "14px" }}>
            ✅ {lang === "te" ? "108 ఎమర్జెన్సీ అంబులెన్స్ అలర్ట్ సక్రియం చేయబడింది!" : "108 Emergency Ambulance Alert Broadcasted!"}
          </strong>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#14532D" }}>
            {lang === "te"
              ? "తణుకు ఏరియా ఆసుపత్రి ఎమర్జెన్సీ డెస్క్‌కు సమాచారం చేరింది. ASV డోస్ సిద్ధం చేయబడుతుంది."
              : "Pre-alert dispatched to Tanuku Area Hospital Trauma Ward with 42 ASV vials on standby."}
          </p>
        </div>
      )}

      {/* Golden Hour Clinical DOs and DONTs */}
      <div className="care-card" style={{ border: "1.5px solid #FCA5A5", background: "#FFF5F5", marginBottom: "16px" }}>
        <h3 style={{ color: "#991B1B", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>⏱️</span> {lang === "te" ? "మొదటి 60 నిమిషాలు (గోల్డెన్ అవర్) ప్రథమ చికిత్స" : "Golden Hour First-Aid Protocol (Crucial DOs & DON'Ts)"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
          <div style={{ background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #BBF7D0" }}>
            <strong style={{ color: "#166534" }}>✅ {lang === "te" ? "ఖచ్చితంగా చేయాల్సినవి (DOs):" : "DOs:"}</strong>
            <ul style={{ paddingLeft: "16px", margin: "6px 0 0", color: "#14532D", lineHeight: "1.5" }}>
              <li>{lang === "te" ? "బాధితుడిని ప్రశాంతంగా ఉంచండి." : "Reassure patient & keep still."}</li>
              <li>{lang === "te" ? "కాటు వేసిన కాలు/చేయి కదలకుండా కట్టెతో స్థిరపరచండి." : "Immobilize bitten limb with a splint."}</li>
              <li>{lang === "te" ? "ఉంగరాలు, గాజులు వెంటనే తీసివేయండి." : "Remove tight rings/jewelry before swelling."}</li>
              <li>{lang === "te" ? "వెంటనే 108 వాహనంలో ప్రభుత్వ ఆసుపత్రికి తరలించండి." : "Rush to Tanuku AH or Bhimavaram CHC."}</li>
            </ul>
          </div>

          <div style={{ background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #FECACA" }}>
            <strong style={{ color: "#991B1B" }}>❌ {lang === "te" ? "ఎట్టిపరిస్థితుల్లో చేయకూడనివి (DON'Ts):" : "DON'Ts:"}</strong>
            <ul style={{ paddingLeft: "16px", margin: "6px 0 0", color: "#7F1D1D", lineHeight: "1.5" }}>
              <li>{lang === "te" ? "గాయాన్ని కోయవద్దు లేదా నోటితో రక్తం పీల్చవద్దు." : "Do NOT cut or suck venom with mouth."}</li>
              <li>{lang === "te" ? "గట్టిగా తాడు లేదా టోర్నికెట్ కట్టవద్దు." : "Do NOT tie tight arterial tourniquets."}</li>
              <li>{lang === "te" ? "నాటు వైద్యులు, మంత్రాల వద్దకు వెళ్లి సమయం వృధా చేయవద్దు." : "Do NOT waste time on quacks or black stones."}</li>
              <li>{lang === "te" ? "టీ, కాఫీ లేదా మద్యం ఇవ్వవద్దు." : "Do NOT give stimulants or alcohol."}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live ASV Stock Tracker */}
      <h3 style={{ marginBottom: "10px" }}>
        {lang === "te" ? "ప్రభుత్వ ఆసుపత్రుల్లో యాంటీ-స్నేక్ వెనమ్ (ASV) నిల్వలు" : "Live Anti-Venom (ASV) Stock at Nearby Facilities"}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
        {stocks.map((s, idx) => (
          <div key={idx} className="care-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#0F172A" }}>{s.facility}</strong>
                <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                  📍 {s.distanceKm} km away &bull; {s.icuEquipped ? "🛏️ ICU Ventilator Ready" : "🩺 Primary Stabilization"}
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  <span className="badge badge-high" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                    🧪 {s.asvVials} Anti-Venom Vials
                  </span>
                  <span className="badge" style={{ background: "#E0F2FE", color: "#0369A1" }}>
                    🐕 {s.arsVials} Anti-Rabies Vials
                  </span>
                </div>
              </div>

              <a
                href={"tel:" + s.phone}
                style={{
                  background: "#0D9488",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                📞 Call Desk
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Incidents Log */}
      <h3 style={{ marginBottom: "10px" }}>
        {lang === "te" ? "ఇటీవలి పాము కాటు కేసులు & నివేదికలు" : "Recent Incident Surveillance Log"}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {incidents.map((inc) => (
          <div key={inc.id} className="care-card" style={{ margin: 0, borderLeft: "5px solid #DC2626" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>👤 {inc.victimName}</strong> ({inc.village})
                <p style={{ margin: "2px 0", fontSize: "12px", color: "#DC2626", fontWeight: "600" }}>
                  ⚠️ {inc.type}
                </p>
                <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                  Facility: {inc.facility} &bull; {inc.timeAgo}
                </p>
              </div>
              <span className="badge badge-high">{inc.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ color: "#DC2626", margin: 0 }}>🚨 Urgent Incident Report</h3>
              <button className="btn-outline" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <form onSubmit={handleReport}>
              <div style={{ marginBottom: "10px" }}>
                <label>Victim Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Venkata Ramana"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label>Village Location</label>
                  <input
                    type="text"
                    list="village-options"
                    placeholder="Type village name"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    required
                  />
                  <datalist id="village-options">
                    <option value="Relangi" />
                    <option value="Tanuku" />
                    <option value="Attili" />
                    <option value="K.S. Gattu" />
                  </datalist>
                </div>

                <div>
                  <label>Type of Attack</label>
                  <select value={biteType} onChange={(e) => setBiteType(e.target.value)}>
                    <option value="Russell Viper Snakebite">Russell's Viper (రక్తపింజరి)</option>
                    <option value="Indian Cobra Snakebite">Indian Cobra (తాచుపాము)</option>
                    <option value="Common Krait Snakebite">Common Krait (కట్లపాము)</option>
                    <option value="Scorpion Sting">Scorpion Sting (తేలు కుట్టు)</option>
                    <option value="Stray Dog Bite (Rabies Risk)">Stray Dog Bite (పిచ్చి కుక్క)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label>Target Referral Facility</label>
                <select value={targetFacility} onChange={(e) => setTargetFacility(e.target.value)}>
                  <option value="Tanuku Government Area Hospital (AH Tanuku)">Tanuku Government Area Hospital (AH Tanuku) - 42 Vials</option>
                  <option value="Bhimavaram Community Health Centre (CHC)">Bhimavaram Community Health Centre (CHC) - 35 Vials</option>
                  <option value="Attili 24x7 Primary Health Centre (PHC)">Attili 24x7 Primary Health Centre (PHC) - 14 Vials</option>
                </select>
              </div>

              <button type="submit" className="btn-danger" style={{ width: "100%", padding: "12px", fontSize: "14px" }}>
                🚨 Submit Urgent Report & Dispatch 108
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenomousAnimalTracker;
