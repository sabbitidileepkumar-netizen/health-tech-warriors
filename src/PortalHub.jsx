import React from "react";
import { Landmark, Info, ArrowRight, HeartPulse, Stethoscope } from "lucide-react";

export function PortalHub({ user, userProfile, _role, isGuest, lang, onSelectPortal, onOpenLanguageSelect, onLogout, t }) {
  const portals = [
    {
      id: "citizen",
      title: lang === "te" ? "పౌరుల పోర్టల్" : lang === "hi" ? "नागरिक पोर्टल" : lang === "mr" ? "नागरिक पोर्टल" : "Citizen Portal",
      shortLabel: "Citizen",
      icon: <HeartPulse size={30} color="#0F6CBD" />,
      tagline: lang === "te" ? "ప్రజల అత్యవసర & ఆరోగ్య సేవలు" : "Public health services & patient lifeline",
      badge: lang === "te" ? "పౌరుల సేవలు" : "Citizen / Public",
      badgeBg: "#EBF3FC",
      badgeColor: "#0F6CBD",
      borderAccent: "#0F6CBD",
      features: [
        lang === "te" ? "ఆసుపత్రులు & బెడ్ల వివరాలు (Find Hospital)" : "Find Hospital & ICU Beds",
        lang === "te" ? "108 ఎమర్జెన్సీ SOS & అంబులెన్స్" : "108 Emergency SOS Lifeline",
        lang === "te" ? "పిల్లల పోలియో & సమగ్ర టీకాలు" : "Child Polio & UIP Immunization",
        lang === "te" ? "రక్తదాతల అన్వేషణ & అవయవదానం" : "Emergency Blood & Organ Registry"
      ]
    },
    {
      id: "asha",
      title: lang === "te" ? "ఆశా కార్యకర్త పోర్టల్" : lang === "hi" ? "आशा कार्यकर्ता पोर्टल" : lang === "mr" ? "आशा सेविका पोर्टल" : "ASHA Worker Portal",
      shortLabel: "ASHA Worker",
      icon: <Stethoscope size={30} color="#0D9488" />,
      tagline: lang === "te" ? "గ్రామ ఆరోగ్య నిఘా & ఫీల్డ్ వర్క్" : "Frontline community health & field triage",
      badge: lang === "te" ? "ఆశా కార్యకర్తలు" : "Field Health Worker",
      badgeBg: "#E6F7F5",
      badgeColor: "#0D9488",
      borderAccent: "#0D9488",
      features: [
        lang === "te" ? "16 ఫీల్డ్ టూల్స్ & హెల్త్ క్యాంప్స్" : "16 Field Diagnostic & Camp Tools",
        lang === "te" ? "AI ట్రయాజ్ & రోగుల నమోదు" : "AI Vitals Triage & Patient Records",
        lang === "te" ? "అధికారుల కేటాయించిన పనులు (Schedules)" : "Authority Assigned Schedules & Tasks",
        lang === "te" ? "గ్రామ వ్యాధి వ్యాప్తి రిపోర్టింగ్ (SOS)" : "Instant Outbreak SOS Reporting"
      ]
    },
    {
      id: "authority",
      title: lang === "te" ? "ఉన్నతాధికార పోర్టల్" : lang === "hi" ? "उच्च प्राधिकारी पोर्टल" : lang === "mr" ? "उच्च अधिकारी पोर्टल" : "Higher Authority Portal",
      shortLabel: "Higher Authority",
      icon: <Landmark size={30} color="#6366F1" />,
      tagline: lang === "te" ? "మందుల స్టాక్ & పోలియో షెడ్యూలింగ్" : "Medicine stock command & polio drop dates",
      badge: lang === "te" ? "కమాండ్ సెంటర్ (DM&HO)" : "District Command (DM&HO)",
      badgeBg: "#EEF2FF",
      badgeColor: "#4F46E5",
      borderAccent: "#6366F1",
      highlight: true,
      features: [
        lang === "te" ? "💊 డైనమిక్ మందుల స్టాక్ నిర్వహణ" : "💊 Dynamic Medicine & ASV Stock Control",
        lang === "te" ? "👶 పోలియో చుక్కల తేదీల షెడ్యూలర్" : "👶 Polio Drops Campaign Date Scheduler",
        lang === "te" ? "🗺️ జిల్లా ఆరోగ్య నిఘా & అంటువ్యాధుల సమీక్ష" : "🗺️ District Surveillance & Outbreak Review",
        lang === "te" ? "👩‍⚕️ ఆశా వర్కర్ల టాస్కింగ్ & పర్యవేక్షణ" : "👩‍⚕️ ASHA Workforce Direct Dispatch"
      ]
    },
    {
      id: "about",
      title: lang === "te" ? "యాప్ గురించి" : lang === "hi" ? "ऐप के बारे में" : lang === "mr" ? "अ‍ॅप बद्दल" : "About CareLink",
      shortLabel: "About",
      icon: <Info size={30} color="#8B5CF6" />,
      tagline: lang === "te" ? "పశ్చిమ గోదావరి గ్రామీణ ఆరోగ్య వ్యవస్థ" : "Mission, offline-first specs & health coverage",
      badge: "Platform Info",
      badgeBg: "#F5F3FF",
      badgeColor: "#7C3AED",
      borderAccent: "#8B5CF6",
      features: [
        lang === "te" ? "100% ఆఫ్‌లైన్-ఫస్ట్ ఆర్కిటెక్చర్" : "100% Offline-First Local Cache",
        lang === "te" ? "గోదావరి గ్రామీణ కవరేజ్ (రిలంగి, తణుకు, అత్తిలి)" : "West Godavari Sub-Centre Network",
        lang === "te" ? "సిస్టమ్ డాక్యుమెంటేషన్ & మార్గదర్శకాలు" : "System Architecture & User Guidelines",
        lang === "te" ? "హెల్ప్‌డెస్క్ & అత్యవసర కాంటాక్ట్స్" : "24/7 Support & Health Emergency Desk"
      ]
    }
  ];

  return (
    <div className="page-content" style={{ maxWidth: "780px", margin: "16px auto", padding: "16px" }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)",
          color: "white",
          padding: "20px 22px",
          borderRadius: "20px",
          marginBottom: "20px",
          boxShadow: "0 8px 24px rgba(15, 108, 189, 0.2)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}
            >
              🩺
            </div>
            <div>
              <h1 style={{ color: "white", fontSize: "20px", margin: 0, fontWeight: "800" }}>
                {t.appTitle || "CareLink"} &bull;{" "}
                {lang === "te" ? "హెల్త్‌కేర్ పోర్టల్స్" : lang === "hi" ? "स्वास्थ्य पोर्टल" : "Healthcare Portals"}
              </h1>
              <p style={{ color: "#E0F2FE", margin: "3px 0 0", fontSize: "12px" }}>
                {userProfile?.name || user?.email || (isGuest ? "Guest Access" : "CareLink User")} &bull;{" "}
                <strong>{userProfile?.village || "Relangi Health Beat"}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onOpenLanguageSelect}
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Change Language"
            >
              🌐 {lang === "te" ? "తెలుగు" : lang === "hi" ? "हिंदी" : lang === "mr" ? "मराठी" : "English"}
            </button>

            <button
              onClick={onLogout}
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🔒 {t.logout || "Logout"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: "12px", color: "#BAE6FD" }}>
          {lang === "te"
            ? "కింది 4 పోర్టల్‌లలో ఒకదాన్ని ఎంచుకోండి. మీరు ఎప్పుడైనా పోర్టల్‌లను మార్చుకోవచ్చు."
            : "Select any of the 4 healthcare portals below to view or manage services. You can switch portals anytime."}
        </div>
      </div>

      {/* 2x2 Portals Grid Matching Handwritten Sketch */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        {portals.map((portal) => (
          <div
            key={portal.id}
            onClick={() => onSelectPortal(portal.id)}
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "20px",
              border: portal.highlight ? `2px solid ${portal.borderAccent}` : "1.5px solid #E2E8F0",
              boxShadow: portal.highlight
                ? "0 6px 20px rgba(99, 102, 241, 0.18)"
                : "0 2px 8px rgba(0,0,0,0.06)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = portal.highlight
                ? "0 6px 20px rgba(99, 102, 241, 0.18)"
                : "0 2px 8px rgba(0,0,0,0.06)";
            }}
          >
            {/* Top row: Icon & Role Badge */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: portal.badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {portal.icon}
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: portal.badgeBg,
                    color: portal.badgeColor
                  }}
                >
                  {portal.badge}
                </span>
              </div>

              {/* Title & Tagline */}
              <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#0F172A", fontWeight: "800" }}>
                {portal.title}
              </h2>
              <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "#64748B", lineHeight: "1.4" }}>
                {portal.tagline}
              </p>

              {/* Key Features List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                {portal.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "12px",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#F8FAFC",
                      padding: "5px 8px",
                      borderRadius: "8px"
                    }}
                  >
                    <span style={{ color: portal.borderAccent, fontWeight: "bold" }}>&bull;</span>
                    <span style={{ fontWeight: "500" }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enter Portal Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "12px",
                borderTop: "1px solid #F1F5F9",
                color: portal.borderAccent,
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              <span>{lang === "te" ? "పోర్టల్‌లోకి ప్రవేశించండి" : "Enter " + portal.shortLabel + " Portal"}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Language Re-select Bar */}
      <div
        style={{
          background: "white",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🌐</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
              {lang === "te" ? "ఎంచుకున్న భాష: తెలుగు" : "Active Language: " + (lang === "te" ? "Telugu" : lang === "hi" ? "Hindi" : lang === "mr" ? "Marathi" : "English")}
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              {lang === "te" ? "భాషను మార్చడానికి ఇక్కడ క్లిక్ చేయండి" : "Click to select a different language"}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenLanguageSelect}
          style={{
            background: "#F1F5F9",
            border: "1px solid #CBD5E1",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#0F6CBD",
            cursor: "pointer"
          }}
        >
          {lang === "te" ? "వేరే భాషను ఎంచుకోండి" : "Change Language"} &rarr;
        </button>
      </div>
    </div>
  );
}

export default PortalHub;
