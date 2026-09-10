import React, { useState, useEffect } from "react";

const hospitalText = {
  en: {
    back: "Back", offlineList: "Offline list", liveSearch: "Live GPS search", title: "Nearby Hospitals & Clinics",
    offlineSubtitle: "Showing the saved facility list for this area", liveSubtitle: "Based on your real-time GPS location",
    finding: "Finding hospitals near you…", offlineNotice: "No internet or live map data — showing the saved facility list.",
    search: "Search hospital name or area…", none: "No hospitals found nearby. Try widening your search or check your connection.",
    call: "Call", directions: "Directions", noPhone: "No phone listed", distance: "away"
  },
  te: {
    back: "వెనుకకు", offlineList: "ఆఫ్‌లైన్ జాబితా", liveSearch: "ప్రత్యక్ష GPS శోధన", title: "సమీప ఆసుపత్రులు మరియు క్లినిక్‌లు",
    offlineSubtitle: "ఈ ప్రాంతానికి సేవ్ చేసిన సదుపాయాల జాబితా చూపబడుతోంది", liveSubtitle: "మీ ప్రస్తుత GPS స్థానం ఆధారంగా",
    finding: "మీ సమీపంలోని ఆసుపత్రులను వెతుకుతోంది…", offlineNotice: "ఇంటర్నెట్ లేదా లైవ్ మ్యాప్ డేటా లేదు — సేవ్ చేసిన జాబితా చూపబడుతోంది.",
    search: "ఆసుపత్రి పేరు లేదా ప్రాంతం వెతకండి…", none: "సమీపంలో ఆసుపత్రులు లేవు. శోధనను విస్తరించండి లేదా కనెక్షన్‌ను తనిఖీ చేయండి.",
    call: "కాల్", directions: "దారులు", noPhone: "ఫోన్ వివరాలు లేవు", distance: "దూరంలో"
  },
  hi: {
    back: "वापस", offlineList: "ऑफलाइन सूची", liveSearch: "लाइव GPS खोज", title: "नजदीकी अस्पताल और क्लिनिक",
    offlineSubtitle: "इस क्षेत्र की सहेजी गई सुविधा सूची दिखाई जा रही है", liveSubtitle: "आपके वर्तमान GPS स्थान के आधार पर",
    finding: "आपके पास के अस्पताल खोजे जा रहे हैं…", offlineNotice: "इंटरनेट या लाइव मैप डेटा नहीं है — सहेजी हुई सूची दिखाई जा रही है।",
    search: "अस्पताल का नाम या क्षेत्र खोजें…", none: "पास में कोई अस्पताल नहीं मिला। खोज बढ़ाएं या कनेक्शन जांचें।",
    call: "कॉल", directions: "दिशा", noPhone: "फोन उपलब्ध नहीं", distance: "दूर"
  },
  mr: {
    back: "मागे", offlineList: "ऑफलाइन यादी", liveSearch: "लाइव्ह GPS शोध", title: "जवळची रुग्णालये आणि क्लिनिक",
    offlineSubtitle: "या भागासाठी जतन केलेली सुविधा यादी दाखवत आहे", liveSubtitle: "तुमच्या सध्याच्या GPS स्थानावर आधारित",
    finding: "तुमच्याजवळील रुग्णालये शोधत आहे…", offlineNotice: "इंटरनेट किंवा लाइव्ह नकाशा डेटा नाही — जतन केलेली यादी दाखवत आहे.",
    search: "रुग्णालयाचे नाव किंवा भाग शोधा…", none: "जवळ रुग्णालय सापडले नाही. शोध वाढवा किंवा कनेक्शन तपासा.",
    call: "कॉल", directions: "दिशानिर्देश", noPhone: "फोन उपलब्ध नाही", distance: "दूर"
  }
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Offline fallback — real hospitals near SRKR Engineering College, Chinamiram, Bhimavaram.
// Used when there's no internet or the live Overpass API is unreachable.
const FALLBACK_HOSPITALS = [
  {
    id: "fallback-1",
    name: "Bhimavaram Hospitals",
    type: "Hospital",
    address: "J.P. Road, Opposite SRKR Engineering College, Chinamiram",
    phone: "08816221111",
    lat: 16.5411,
    lon: 81.4960
  },
  {
    id: "fallback-2",
    name: "Sree Subhadra Hospitals",
    type: "Hospital",
    address: "J.P. Road, Chinamiram, Bhimavaram",
    phone: null,
    lat: 16.5405,
    lon: 81.4970
  },
  {
    id: "fallback-3",
    name: "Akshara Speciality Hospitals",
    type: "Hospital",
    address: "Juvvalapalem Road, Tammi Raju Nagar, Bhimavaram",
    phone: "08816297197",
    lat: 16.5395,
    lon: 81.4985
  },
  {
    id: "fallback-4",
    name: "Mahatma Gandhi Cancer Hospital",
    type: "Hospital",
    address: "Juvvalapalem Road, Upparapadu, Pedamiram, Bhimavaram",
    phone: "08816222208",
    lat: 16.5390,
    lon: 81.4990
  },
  {
    id: "fallback-5",
    name: "Gandhi Eye Hospital",
    type: "Hospital",
    address: "Juvvalapalem Road, Upparapadu, Pedamiram, Bhimavaram",
    phone: "08816224570",
    lat: 16.5388,
    lon: 81.4992
  },
  {
    id: "fallback-6",
    name: "Varma Hospitals",
    type: "Hospital",
    address: "Juvvalapalem Road, Suryanarayanapuram, Bhimavaram",
    phone: "08816227268",
    lat: 16.5370,
    lon: 81.5010
  }
];

// Multiple mirrors — if one is down/rate-limited, we try the next
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter"
];

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export function HospitalFinder({ onBack, lang = "en" }) {
  const t = hospitalText[lang] || hospitalText.en;
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (!navigator.onLine) {
      loadFallback(null);
      return;
    }

    if (!("geolocation" in navigator)) {
      loadFallback(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserCoords({ lat, lon });
        fetchNearbyHospitals(lat, lon);
      },
      () => {
        loadFallback(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const loadFallback = (coords) => {
    const refLat = coords ? coords.lat : FALLBACK_HOSPITALS[0].lat;
    const refLon = coords ? coords.lon : FALLBACK_HOSPITALS[0].lon;
    const withDistance = FALLBACK_HOSPITALS.map((h) => ({
      ...h,
      distanceKm: getDistanceKm(refLat, refLon, h.lat, h.lon)
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    setHospitals(withDistance);
    setUsingFallback(true);
    setError("");
    setLoading(false);
  };

  const fetchNearbyHospitals = async (lat, lon) => {
    setLoading(true);
    setError("");
    const radius = 15000; // 15km radius
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    let lastErrorDetail = "";

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetchWithTimeout(
          endpoint,
          {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: query
          },
          12000 // 12s timeout per mirror
        );

        if (!response.ok) {
          lastErrorDetail = `${endpoint} responded with status ${response.status}`;
          continue; // try next mirror
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.elements)) {
          lastErrorDetail = `${endpoint} returned unexpected data shape`;
          continue;
        }

        const results = data.elements
          .map((el) => {
            const elLat = el.lat || (el.center && el.center.lat);
            const elLon = el.lon || (el.center && el.center.lon);
            if (!elLat || !elLon) return null;
            return {
              id: el.id,
              name: (el.tags && el.tags.name) || "Unnamed Health Facility",
              type: el.tags && el.tags.amenity === "clinic" ? "Clinic" : "Hospital",
              address: (el.tags && (el.tags["addr:full"] || el.tags["addr:street"])) || "Address not listed",
              phone: (el.tags && (el.tags.phone || el.tags["contact:phone"])) || null,
              lat: elLat,
              lon: elLon,
              distanceKm: getDistanceKm(lat, lon, elLat, elLon)
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 20);

        if (results.length === 0) {
          loadFallback({ lat, lon });
          return;
        }

        setHospitals(results);
        setUsingFallback(false);
        setLoading(false);
        return; // success — stop trying other mirrors
      } catch (err) {
        lastErrorDetail = err && err.name === "AbortError" ? `${endpoint} timed out` : `${endpoint} failed: ${err.message}`;
        console.error("HospitalFinder fetch error:", lastErrorDetail);
        // try next mirror
      }
    }

    // All mirrors failed — fall back to the known local list instead of an error screen
    console.warn("All Overpass mirrors failed, using offline fallback list. Last error:", lastErrorDetail);
    loadFallback({ lat, lon });
  };

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirectionsUrl = (hospital) => {
    const params = new URLSearchParams({
      api: "1",
      destination: `${hospital.lat},${hospital.lon}`,
      travelmode: "driving"
    });
    if (userCoords) params.set("origin", `${userCoords.lat},${userCoords.lon}`);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>← {t.back}</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>
          {usingFallback ? t.offlineList : t.liveSearch}
        </span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0369A1 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "34px" }}>🏥</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {t.title}
            </h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              {usingFallback ? t.offlineSubtitle : t.liveSubtitle}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
          📡 {t.finding}
        </div>
      )}

      {usingFallback && !loading && (
        <div style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", marginBottom: "14px", fontWeight: "600" }}>
          📴 {t.offlineNotice}
        </div>
      )}

      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && (
        <>
          <input
            type="text"
            placeholder={`🔍 ${t.search}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "14px" }}
          />

          {filteredHospitals.length === 0 && (
            <p style={{ color: "#64748B", textAlign: "center", padding: "20px" }}>
              {t.none}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredHospitals.map((h) => (
              <div key={h.id} className="care-card" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{h.name}</strong>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#0F6CBD", fontWeight: "600" }}>{h.type}</p>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                      📍 {h.address} ({h.distanceKm.toFixed(1)} km {t.distance})
                    </p>
                  </div>
                  {h.phone ? (
                    <a
                      href={"tel:" + h.phone}
                      style={{
                        background: "#0D9488",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      📞 {t.call}
                    </a>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>{t.noPhone}</span>
                  )}
                </div>
                {Number.isFinite(h.lat) && Number.isFinite(h.lon) && (
                  <a
                    href={getDirectionsUrl(h)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ display: "inline-flex", marginTop: "10px", textDecoration: "none", fontSize: "12px", padding: "7px 10px" }}
                  >
                    🧭 {t.directions}
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HospitalFinder;
