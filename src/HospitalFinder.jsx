import React, { useState, useEffect } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Location access not supported on this device.");
      setLoading(false);
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
        setError("Could not get your location. Please enable GPS/location permission and reload.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

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
              distanceKm: getDistanceKm(lat, lon, elLat, elLon)
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 20);

        setHospitals(results);
        setLoading(false);
        return; // success — stop trying other mirrors
      } catch (err) {
        lastErrorDetail = err && err.name === "AbortError" ? `${endpoint} timed out` : `${endpoint} failed: ${err.message}`;
        console.error("HospitalFinder fetch error:", lastErrorDetail);
        // try next mirror
      }
    }

    // All mirrors failed
    console.error("All Overpass mirrors failed. Last error:", lastErrorDetail);
    setError("Could not load nearby hospitals right now. The map data service may be busy — please try again in a moment.");
    setLoading(false);
  };

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>Live GPS Search</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0369A1 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "34px" }}>🏥</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "సమీప ఆసుపత్రులు" : "Nearby Hospitals & Clinics"}
            </h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              {lang === "te" ? "మీ ప్రస్తుత లొకేషన్ ఆధారంగా" : "Based on your real-time GPS location"}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
          📡 Finding hospitals near you...
        </div>
      )}

      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder={lang === "te" ? "🔍 ఆసుపత్రి పేరు వెతకండి..." : "🔍 Search hospital name or area..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "14px" }}
          />

          {filteredHospitals.length === 0 && (
            <p style={{ color: "#64748B", textAlign: "center", padding: "20px" }}>
              No hospitals found nearby. Try widening your search or check your connection.
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
                      📍 {h.address} ({h.distanceKm.toFixed(1)} km away)
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
                      📞 Call
                    </a>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>No phone listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HospitalFinder;
