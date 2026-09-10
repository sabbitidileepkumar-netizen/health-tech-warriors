import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  Phone,
  Video
} from "lucide-react";
import {
  createAppointment,
  createDiagnosticRequest,
  createTeleconsultation,
  subscribeToCollection,
  updateAppointmentStatus,
  updateDiagnosticRequestStatus,
  updateTeleconsultationStatus
} from "./dataStore";

const copy = {
  en: {
    back: "Back",
    title: "Care coordination",
    subtitle: "Book care, request tests, and prepare remote consultations.",
    appointments: "Appointments",
    consultation: "Audio / video consult",
    diagnostics: "Diagnostics",
    facility: "Hospital, PHC, or clinic",
    date: "Preferred date",
    time: "Preferred time",
    reason: "Reason for visit",
    book: "Request appointment",
    noAppointments: "No appointments yet.",
    consultationMode: "Consultation type",
    video: "Video consultation",
    audio: "Audio consultation",
    requestConsult: "Request consultation",
    noConsults: "No consultations yet.",
    test: "Test or diagnostic service",
    requestTest: "Request diagnostic coordination",
    noDiagnostics: "No diagnostic requests yet.",
    saved: "Saved. It will sync automatically when a connection is available.",
    required: "Please complete all required fields.",
    offline: "Offline requests are safely queued on this device and will be sent after reconnecting.",
    join: "Join consultation",
    publicMeeting: "Joining opens Jitsi Meet. Use an approved provider for real clinical deployments and do not share sensitive records in a public room.",
    confirm: "Confirm",
    complete: "Mark complete",
    cancel: "Cancel",
    collected: "Sample collected",
    resultReady: "Result ready",
    requestId: "Request ID",
    status: "Status",
    coordinator: "Care desk view",
    patient: "Patient",
    noCareDesk: "No requests from this village yet.",
    callAsha: "Call ASHA"
  },
  te: {
    back: "వెనుకకు",
    title: "చికిత్స సమన్వయం",
    subtitle: "అపాయింట్‌మెంట్, పరీక్షలు మరియు రిమోట్ సంప్రదింపులను అభ్యర్థించండి.",
    appointments: "అపాయింట్‌మెంట్లు",
    consultation: "ఆడియో / వీడియో సంప్రదింపు",
    diagnostics: "పరీక్షలు",
    facility: "ఆసుపత్రి, PHC లేదా క్లినిక్",
    date: "ఇష్టమైన తేదీ",
    time: "ఇష్టమైన సమయం",
    reason: "సందర్శన కారణం",
    book: "అపాయింట్‌మెంట్ అభ్యర్థించండి",
    noAppointments: "ఇంకా అపాయింట్‌మెంట్లు లేవు.",
    consultationMode: "సంప్రదింపు రకం",
    video: "వీడియో సంప్రదింపు",
    audio: "ఆడియో సంప్రదింపు",
    requestConsult: "సంప్రదింపు అభ్యర్థించండి",
    noConsults: "ఇంకా సంప్రదింపులు లేవు.",
    test: "పరీక్ష లేదా నిర్ధారణ సేవ",
    requestTest: "పరీక్ష సమన్వయం అభ్యర్థించండి",
    noDiagnostics: "ఇంకా పరీక్ష అభ్యర్థనలు లేవు.",
    saved: "సేవ్ అయింది. కనెక్షన్ వచ్చినప్పుడు స్వయంచాలకంగా సింక్ అవుతుంది.",
    required: "అవసరమైన వివరాలు పూర్తి చేయండి.",
    offline: "ఆఫ్‌లైన్ అభ్యర్థనలు ఈ పరికరంలో భద్రంగా నిల్వ అవుతాయి; కనెక్షన్ వచ్చినప్పుడు పంపబడతాయి.",
    join: "సంప్రదింపులో చేరండి",
    publicMeeting: "Jitsi Meet తెరుచుకుంటుంది. వాస్తవ వైద్య వినియోగానికి ఆమోదిత ప్రొవైడర్‌ను ఉపయోగించండి; పబ్లిక్ గదిలో సున్నితమైన రికార్డులను పంచుకోకండి.",
    confirm: "నిర్ధారించండి",
    complete: "పూర్తయిందిగా గుర్తించండి",
    cancel: "రద్దు చేయండి",
    collected: "నమూనా సేకరించబడింది",
    resultReady: "ఫలితం సిద్ధంగా ఉంది",
    requestId: "అభ్యర్థన ID",
    status: "స్థితి",
    coordinator: "చికిత్స డెస్క్ వీక్షణ",
    patient: "రోగి",
    noCareDesk: "ఈ గ్రామం నుండి ఇంకా అభ్యర్థనలు లేవు.",
    callAsha: "ఆశా వర్కర్‌కు కాల్ చేయండి"
  },
  hi: {
    back: "वापस",
    title: "देखभाल समन्वय",
    subtitle: "अपॉइंटमेंट बुक करें, जांच मांगें और दूरस्थ परामर्श तैयार करें।",
    appointments: "अपॉइंटमेंट",
    consultation: "ऑडियो / वीडियो परामर्श",
    diagnostics: "जांच",
    facility: "अस्पताल, PHC या क्लिनिक",
    date: "पसंदीदा तारीख",
    time: "पसंदीदा समय",
    reason: "आने का कारण",
    book: "अपॉइंटमेंट का अनुरोध करें",
    noAppointments: "अभी कोई अपॉइंटमेंट नहीं है।",
    consultationMode: "परामर्श का प्रकार",
    video: "वीडियो परामर्श",
    audio: "ऑडियो परामर्श",
    requestConsult: "परामर्श का अनुरोध करें",
    noConsults: "अभी कोई परामर्श नहीं है।",
    test: "जांच या निदान सेवा",
    requestTest: "जांच समन्वय का अनुरोध करें",
    noDiagnostics: "अभी कोई जांच अनुरोध नहीं है।",
    saved: "सहेज लिया गया। कनेक्शन मिलने पर यह अपने आप सिंक होगा।",
    required: "कृपया सभी जरूरी फ़ील्ड भरें।",
    offline: "ऑफलाइन अनुरोध इस डिवाइस में सुरक्षित रूप से कतार में रहेंगे और कनेक्शन आने पर भेजे जाएंगे।",
    join: "परामर्श में शामिल हों",
    publicMeeting: "Jitsi Meet खुलता है। वास्तविक चिकित्सीय उपयोग के लिए स्वीकृत प्रदाता का प्रयोग करें और सार्वजनिक कमरे में संवेदनशील रिकॉर्ड साझा न करें।",
    confirm: "पुष्टि करें",
    complete: "पूर्ण चिह्नित करें",
    cancel: "रद्द करें",
    collected: "नमूना एकत्र हुआ",
    resultReady: "परिणाम तैयार है",
    requestId: "अनुरोध ID",
    status: "स्थिति",
    coordinator: "देखभाल डेस्क दृश्य",
    patient: "रोगी",
    noCareDesk: "इस गांव से अभी कोई अनुरोध नहीं है।",
    callAsha: "आशा कार्यकर्ता को कॉल करें"
  },
  mr: {
    back: "मागे",
    title: "सेवा समन्वय",
    subtitle: "अपॉइंटमेंट बुक करा, तपासणी मागा आणि दूरस्थ सल्लामसलत तयार करा.",
    appointments: "अपॉइंटमेंट",
    consultation: "ऑडिओ / व्हिडिओ सल्लामसलत",
    diagnostics: "तपासण्या",
    facility: "रुग्णालय, PHC किंवा क्लिनिक",
    date: "पसंतीची तारीख",
    time: "पसंतीची वेळ",
    reason: "भेटीचे कारण",
    book: "अपॉइंटमेंटची विनंती करा",
    noAppointments: "अजून अपॉइंटमेंट नाहीत.",
    consultationMode: "सल्लामसलतीचा प्रकार",
    video: "व्हिडिओ सल्लामसलत",
    audio: "ऑडिओ सल्लामसलत",
    requestConsult: "सल्लामसलतीची विनंती करा",
    noConsults: "अजून सल्लामसलत नाही.",
    test: "तपासणी किंवा निदान सेवा",
    requestTest: "तपासणी समन्वयाची विनंती करा",
    noDiagnostics: "अजून तपासणी विनंत्या नाहीत.",
    saved: "जतन केले. कनेक्शन मिळाल्यावर आपोआप सिंक होईल.",
    required: "कृपया आवश्यक सर्व माहिती भरा.",
    offline: "ऑफलाइन विनंत्या या डिव्हाइसवर सुरक्षितपणे रांगेत राहतील आणि कनेक्शन मिळाल्यावर पाठवल्या जातील.",
    join: "सल्लामसलतीत सामील व्हा",
    publicMeeting: "Jitsi Meet उघडते. प्रत्यक्ष वैद्यकीय वापरासाठी मान्य प्रदाता वापरा आणि सार्वजनिक खोलीत संवेदनशील नोंदी शेअर करू नका.",
    confirm: "पुष्टी करा",
    complete: "पूर्ण चिन्हांकित करा",
    cancel: "रद्द करा",
    collected: "नमुना घेतला",
    resultReady: "निकाल तयार आहे",
    requestId: "विनंती ID",
    status: "स्थिती",
    coordinator: "सेवा डेस्क दृश्य",
    patient: "रुग्ण",
    noCareDesk: "या गावातून अजून विनंत्या नाहीत.",
    callAsha: "आशा सेविकेला कॉल करा"
  }
};

const today = () => new Date().toISOString().slice(0, 10);
const after = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const textFor = (lang) => copy[lang] || copy.en;
const normalize = (value) => String(value || "").trim().toLowerCase();

function belongsTo(record, profile) {
  const profileId = profile?.uid || profile?.id;
  return Boolean(
    (profileId && record.patientId === profileId) ||
    (profile?.phone && record.patientPhone === profile.phone) ||
    (profile?.name && normalize(record.patientName) === normalize(profile.name))
  );
}

function formatWhen(date, time) {
  if (!date) return "—";
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString();
  return time ? `${formatted} · ${time}` : formatted;
}

function statusStyle(status) {
  const normalized = String(status || "REQUESTED").toUpperCase();
  if (normalized.includes("CANCEL")) return { background: "#FEE2E2", color: "#B91C1C" };
  if (normalized.includes("COMPLETE") || normalized.includes("RESULT")) return { background: "#DCFCE7", color: "#166534" };
  if (normalized.includes("CONFIRM") || normalized.includes("READY") || normalized.includes("COLLECT")) return { background: "#DBEAFE", color: "#1D4ED8" };
  return { background: "#FEF3C7", color: "#92400E" };
}

function SectionCard({ children }) {
  return <div className="care-card" style={{ margin: 0 }}>{children}</div>;
}

function RecordMeta({ item, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "8px" }}>
      <span style={{ fontSize: "11px", color: "#64748B" }}>{c.requestId}: {item.requestCode || item.id}</span>
      <span className="badge" style={{ ...statusStyle(item.status), fontSize: "10px" }}>{item.status || "REQUESTED"}</span>
    </div>
  );
}

export function CareCoordination({ onBack, lang = "en", userProfile, role = "CITIZEN", isGuest = false }) {
  const c = textFor(lang);
  const isCoordinator = role === "ASHA_WORKER" || role === "HIGHER_AUTHORITY";
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [notice, setNotice] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({ facility: "", date: after(1), time: "10:00", reason: "" });
  const [consultForm, setConsultForm] = useState({ mode: "VIDEO", date: after(1), time: "10:00", reason: "" });
  const [diagnosticForm, setDiagnosticForm] = useState({ testType: "", facility: "", date: after(1), reason: "" });

  const profile = userProfile || {};
  const patientName = profile.name || "Guest citizen";
  const patientId = profile.uid || profile.id || "guest";
  const patientPhone = profile.phone || "";
  const village = profile.village || "";

  useEffect(() => {
    const unsubAppointments = subscribeToCollection("appointments", setAppointments);
    const unsubConsultations = subscribeToCollection("teleconsultations", setConsultations);
    const unsubDiagnostics = subscribeToCollection("diagnostic_requests", setDiagnostics);
    return () => {
      unsubAppointments();
      unsubConsultations();
      unsubDiagnostics();
    };
  }, []);

  const visible = useMemo(() => {
    const byScope = (items) => (isCoordinator
      ? items.filter((item) => !village || !item.village || normalize(item.village) === normalize(village))
      : items.filter((item) => belongsTo(item, profile)));
    return {
      appointments: byScope(appointments),
      consultations: byScope(consultations),
      diagnostics: byScope(diagnostics)
    };
  }, [appointments, consultations, diagnostics, isCoordinator, profile, village]);

  const requestCode = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  const baseRecord = () => ({
    patientId,
    patientName,
    patientPhone,
    village,
    assignedAshaId: profile.assignedAshaId,
    assignedAshaName: profile.assignedAshaName
  });

  const requireSignedIn = () => {
    if (isGuest) {
      setNotice("Please sign in to save personal care requests.");
      return false;
    }
    return true;
  };

  const submitAppointment = async (event) => {
    event.preventDefault();
    if (!requireSignedIn()) return;
    if (!appointmentForm.facility || !appointmentForm.date || !appointmentForm.reason) {
      setNotice(c.required);
      return;
    }
    await createAppointment({
      ...baseRecord(),
      requestCode: requestCode("APT"),
      facility: appointmentForm.facility.trim(),
      appointmentDate: appointmentForm.date,
      appointmentTime: appointmentForm.time,
      reason: appointmentForm.reason.trim(),
      appointmentType: "In-person consultation"
    });
    setAppointmentForm({ facility: "", date: after(1), time: "10:00", reason: "" });
    setNotice(c.saved);
  };

  const submitConsultation = async (event) => {
    event.preventDefault();
    if (!requireSignedIn()) return;
    if (!consultForm.date || !consultForm.reason) {
      setNotice(c.required);
      return;
    }
    const meetingCode = `carelink-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const joinUrl = `https://meet.jit.si/${meetingCode}${consultForm.mode === "AUDIO" ? "#config.startWithVideoMuted=true" : ""}`;
    await createTeleconsultation({
      ...baseRecord(),
      requestCode: requestCode("TEL"),
      mode: consultForm.mode,
      scheduledDate: consultForm.date,
      scheduledTime: consultForm.time,
      reason: consultForm.reason.trim(),
      meetingCode,
      joinUrl
    });
    setConsultForm({ mode: "VIDEO", date: after(1), time: "10:00", reason: "" });
    setNotice(c.saved);
  };

  const submitDiagnostic = async (event) => {
    event.preventDefault();
    if (!requireSignedIn()) return;
    if (!diagnosticForm.testType || !diagnosticForm.facility || !diagnosticForm.date) {
      setNotice(c.required);
      return;
    }
    await createDiagnosticRequest({
      ...baseRecord(),
      requestCode: requestCode("DIA"),
      testType: diagnosticForm.testType.trim(),
      facility: diagnosticForm.facility.trim(),
      preferredDate: diagnosticForm.date,
      reason: diagnosticForm.reason.trim()
    });
    setDiagnosticForm({ testType: "", facility: "", date: after(1), reason: "" });
    setNotice(c.saved);
  };

  const primaryButton = { marginTop: "12px" };
  const fieldGroup = { display: "grid", gap: "6px", marginTop: "10px" };
  const tabs = [
    ["appointments", CalendarDays, c.appointments],
    ["consultations", Video, c.consultation],
    ["diagnostics", FlaskConical, c.diagnostics]
  ];

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>← {c.back}</button>
        {isCoordinator && <span className="badge" style={{ background: "#E0F2FE", color: "#075985" }}>{c.coordinator}</span>}
      </div>

      <div style={{ background: "linear-gradient(135deg, #075985, #0D9488)", borderRadius: "16px", padding: "18px", color: "white", marginBottom: "14px" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>{c.title}</h1>
        <p style={{ color: "#E0F2FE", margin: "5px 0 0", fontSize: "13px" }}>{c.subtitle}</p>
      </div>

      {notice && (
        <div role="status" style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", marginBottom: "12px" }}>
          {notice}
        </div>
      )}

      <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#92400E", marginBottom: "14px" }}>
        📶 {c.offline}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "14px" }}>
        {tabs.map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setNotice(""); }}
            style={{ border: tab === key ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1", borderRadius: "10px", padding: "9px 5px", background: tab === key ? "#EBF3FC" : "white", color: tab === key ? "#0F6CBD" : "#475569", fontSize: "11px", lineHeight: 1.2 }}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      {tab === "appointments" && (
        <>
          {!isCoordinator && (
            <SectionCard>
              <form onSubmit={submitAppointment}>
                <h2 style={{ color: "#075985", marginBottom: "4px" }}>{c.appointments}</h2>
                <div style={fieldGroup}>
                  <label>{c.facility}<input list="carelink-facilities" value={appointmentForm.facility} onChange={(e) => setAppointmentForm({ ...appointmentForm, facility: e.target.value })} /></label>
                  <datalist id="carelink-facilities"><option>Primary Health Centre</option><option>Community Health Centre</option><option>Government Area Hospital</option></datalist>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <label>{c.date}<input type="date" min={today()} value={appointmentForm.date} onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })} /></label>
                    <label>{c.time}<input type="time" value={appointmentForm.time} onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })} /></label>
                  </div>
                  <label>{c.reason}<textarea rows="2" value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })} /></label>
                </div>
                <button className="btn-primary" type="submit" style={primaryButton}><CalendarDays size={17} /> {c.book}</button>
              </form>
            </SectionCard>
          )}
          <RequestList
            items={visible.appointments}
            emptyText={isCoordinator ? c.noCareDesk : c.noAppointments}
            c={c}
            render={(item) => <><strong>{item.facility}</strong><p style={{ margin: "3px 0", fontSize: "12px" }}>{formatWhen(item.appointmentDate, item.appointmentTime)} · {item.reason}</p></>}
            coordinator={isCoordinator}
            onConfirm={(item) => updateAppointmentStatus(item.id, "CONFIRMED")}
            onComplete={(item) => updateAppointmentStatus(item.id, "COMPLETED")}
            onCancel={(item) => updateAppointmentStatus(item.id, "CANCELLED")}
          />
        </>
      )}

      {tab === "consultations" && (
        <>
          {!isCoordinator && (
            <SectionCard>
              <form onSubmit={submitConsultation}>
                <h2 style={{ color: "#7E22CE", marginBottom: "4px" }}>{c.consultation}</h2>
                <div style={fieldGroup}>
                  <label>{c.consultationMode}<select value={consultForm.mode} onChange={(e) => setConsultForm({ ...consultForm, mode: e.target.value })}><option value="VIDEO">{c.video}</option><option value="AUDIO">{c.audio}</option></select></label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <label>{c.date}<input type="date" min={today()} value={consultForm.date} onChange={(e) => setConsultForm({ ...consultForm, date: e.target.value })} /></label>
                    <label>{c.time}<input type="time" value={consultForm.time} onChange={(e) => setConsultForm({ ...consultForm, time: e.target.value })} /></label>
                  </div>
                  <label>{c.reason}<textarea rows="2" value={consultForm.reason} onChange={(e) => setConsultForm({ ...consultForm, reason: e.target.value })} /></label>
                </div>
                <button className="btn-primary" type="submit" style={{ ...primaryButton, background: "#7E22CE" }}><Video size={17} /> {c.requestConsult}</button>
              </form>
            </SectionCard>
          )}
          <RequestList
            items={visible.consultations}
            emptyText={isCoordinator ? c.noCareDesk : c.noConsults}
            c={c}
            render={(item) => <>
              <strong>{item.mode === "AUDIO" ? c.audio : c.video}</strong>
              <p style={{ margin: "3px 0", fontSize: "12px" }}>{formatWhen(item.scheduledDate, item.scheduledTime)} · {item.reason}</p>
              {item.joinUrl && item.status !== "CANCELLED" && <><a href={item.joinUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: "inline-flex", marginTop: "7px", textDecoration: "none", fontSize: "12px" }}><ExternalLink size={14} /> {c.join}</a><p style={{ fontSize: "10px", marginTop: "6px", color: "#64748B" }}>{c.publicMeeting}</p></>}
            </>}
            coordinator={isCoordinator}
            onConfirm={(item) => updateTeleconsultationStatus(item.id, "READY")}
            onComplete={(item) => updateTeleconsultationStatus(item.id, "COMPLETED")}
            onCancel={(item) => updateTeleconsultationStatus(item.id, "CANCELLED")}
          />
        </>
      )}

      {tab === "diagnostics" && (
        <>
          {!isCoordinator && (
            <SectionCard>
              <form onSubmit={submitDiagnostic}>
                <h2 style={{ color: "#047857", marginBottom: "4px" }}>{c.diagnostics}</h2>
                <div style={fieldGroup}>
                  <label>{c.test}<input list="carelink-tests" value={diagnosticForm.testType} onChange={(e) => setDiagnosticForm({ ...diagnosticForm, testType: e.target.value })} /></label>
                  <datalist id="carelink-tests"><option>Blood test</option><option>Blood sugar test</option><option>Urine test</option><option>ECG</option><option>Ultrasound</option><option>X-ray</option></datalist>
                  <label>{c.facility}<input value={diagnosticForm.facility} onChange={(e) => setDiagnosticForm({ ...diagnosticForm, facility: e.target.value })} /></label>
                  <label>{c.date}<input type="date" min={today()} value={diagnosticForm.date} onChange={(e) => setDiagnosticForm({ ...diagnosticForm, date: e.target.value })} /></label>
                  <label>{c.reason}<textarea rows="2" value={diagnosticForm.reason} onChange={(e) => setDiagnosticForm({ ...diagnosticForm, reason: e.target.value })} /></label>
                </div>
                <button className="btn-primary" type="submit" style={{ ...primaryButton, background: "#047857" }}><FlaskConical size={17} /> {c.requestTest}</button>
              </form>
            </SectionCard>
          )}
          <RequestList
            items={visible.diagnostics}
            emptyText={isCoordinator ? c.noCareDesk : c.noDiagnostics}
            c={c}
            render={(item) => <><strong>{item.testType}</strong><p style={{ margin: "3px 0", fontSize: "12px" }}>{item.facility} · {formatWhen(item.preferredDate)}{item.reason ? ` · ${item.reason}` : ""}</p></>}
            coordinator={isCoordinator}
            onConfirm={(item) => updateDiagnosticRequestStatus(item.id, "CONFIRMED")}
            onCollected={(item) => updateDiagnosticRequestStatus(item.id, "SAMPLE_COLLECTED")}
            onComplete={(item) => updateDiagnosticRequestStatus(item.id, "RESULT_READY")}
            onCancel={(item) => updateDiagnosticRequestStatus(item.id, "CANCELLED")}
          />
        </>
      )}

      {!isCoordinator && profile.assignedAshaPhone && (
        <a href={`tel:${profile.assignedAshaPhone}`} className="btn-outline" style={{ display: "flex", textDecoration: "none", marginTop: "14px" }}><Phone size={16} /> {c.callAsha}</a>
      )}
    </div>
  );
}

function RequestList({ items, emptyText, c, render, coordinator, onConfirm, onCollected, onComplete, onCancel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
      {items.length === 0 ? <p style={{ textAlign: "center", color: "#64748B", padding: "16px" }}>{emptyText}</p> : items.map((item) => (
        <SectionCard key={item.id}>
          {coordinator && <p style={{ fontSize: "12px", color: "#0F6CBD", marginBottom: "4px" }}>{c.patient}: <strong>{item.patientName}</strong></p>}
          {render(item)}
          <RecordMeta item={item} c={c} />
          {coordinator && item.status !== "CANCELLED" && item.status !== "COMPLETED" && item.status !== "RESULT_READY" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {item.status === "REQUESTED" && <button className="btn-secondary" onClick={() => onConfirm(item)} style={{ padding: "7px 9px", fontSize: "11px" }}><ClipboardList size={13} /> {c.confirm}</button>}
              {onCollected && item.status !== "SAMPLE_COLLECTED" && <button className="btn-secondary" onClick={() => onCollected(item)} style={{ padding: "7px 9px", fontSize: "11px" }}>{c.collected}</button>}
              <button className="btn-secondary" onClick={() => onComplete(item)} style={{ padding: "7px 9px", fontSize: "11px" }}>{onCollected ? c.resultReady : c.complete}</button>
              <button className="btn-outline" onClick={() => onCancel(item)} style={{ padding: "7px 9px", fontSize: "11px", color: "#B91C1C" }}>{c.cancel}</button>
            </div>
          )}
        </SectionCard>
      ))}
    </div>
  );
}

export default CareCoordination;
