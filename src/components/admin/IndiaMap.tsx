"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Globe2, AlertTriangle, Loader2, MapPin } from "lucide-react";

// India: this specific dataset is proven to actually work — it rendered
// correctly earlier (real content, no LFS pointer issues, no CSP issues).
// It's district-level rather than state-level (a true state-only file turned
// out to live in a Git-LFS-backed repo that isn't reliably reachable), so
// the internal lines are styled very subtly below — real geographic detail
// without looking like visual noise.
const INDIA_TOPO_URL = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/topojson/india.json";
const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Real [longitude, latitude] pairs for major Indian cities — react-simple-maps
// plots markers by true geographic coordinates, not arbitrary pixel positions.
const CITY_COORDS: Record<string, [number, number]> = {
  "delhi":          [77.1025, 28.7041], "new delhi":  [77.1025, 28.7041],
  "mumbai":         [72.8777, 19.0760], "bombay":     [72.8777, 19.0760],
  "bengaluru":      [77.5946, 12.9716], "bangalore":  [77.5946, 12.9716],
  "hyderabad":      [78.4867, 17.3850],
  "chennai":        [80.2707, 13.0827], "madras":     [80.2707, 13.0827],
  "kolkata":        [88.3639, 22.5726], "calcutta":   [88.3639, 22.5726],
  "ahmedabad":      [72.5714, 23.0225],
  "pune":           [73.8567, 18.5204],
  "jaipur":         [75.7873, 26.9124],
  "lucknow":        [80.9462, 26.8467],
  "surat":          [72.8311, 21.1702],
  "kanpur":         [80.3319, 26.4499],
  "nagpur":         [79.0882, 21.1458],
  "indore":         [75.8577, 22.7196],
  "bhopal":         [77.4126, 23.2599],
  "visakhapatnam":  [83.2185, 17.6868],
  "patna":          [85.1376, 25.5941],
  "vadodara":       [73.1812, 22.3072],
  "agra":           [78.0081, 27.1767],
  "noida":          [77.3910, 28.5355],
  "gurgaon":        [77.0266, 28.4595], "gurugram": [77.0266, 28.4595],
  "coimbatore":     [76.9558, 11.0168],
  "kochi":          [76.2673,  9.9312], "cochin":   [76.2673, 9.9312],
  "chandigarh":     [76.7794, 30.7333],
  "goa":            [73.8278, 15.4909], "panaji":   [73.8278, 15.4909],
  "jodhpur":        [73.0243, 26.2389],
  "udaipur":        [73.7125, 24.5854],
  "amritsar":       [74.8723, 31.6340],
  "varanasi":       [82.9739, 25.3176],
  "bhubaneswar":    [85.8245, 20.2961],
  "thiruvananthapuram": [76.9366, 8.5241],
  "ranchi":         [85.3096, 23.3441],
  "raipur":         [81.6296, 21.2514],
  "guwahati":       [91.7362, 26.1445],
  "dehradun":       [78.0322, 30.3165],
  "shimla":         [77.1734, 31.1048],
  "ludhiana":       [75.8573, 30.9010],
  "nashik":         [73.7898, 19.9975],
  "rajkot":         [70.8022, 22.3039],
  "meerut":         [77.7064, 28.9845],
  "faridabad":      [77.3178, 28.4089],
  "ghaziabad":      [77.4538, 28.6692],
  "thane":          [72.9781, 19.2183],
  "jamshedpur":     [86.2029, 22.8046],
  "mysore":         [76.6394, 12.2958], "mysuru": [76.6394, 12.2958],
  "vijayawada":     [80.6480, 16.5062],
  "madurai":        [78.1198, 9.9252],
};

interface CityData { city: string; orders: number; revenue: number; }
interface Props { cities: CityData[]; }
type Tab = "india" | "world";

export default function IndiaMap({ cities }: Props) {
  const [tab, setTab]         = useState<Tab>("india");
  const [hovered, setHovered] = useState<CityData | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  // Fetch both map topologies explicitly (rather than letting react-simple-maps
  // fetch them silently) so a failure is visible and debuggable. Independent
  // state per source — if one fails, the other tab still works.
  const [indiaData, setIndiaData]     = useState<any>(null);
  const [indiaError, setIndiaError]   = useState<string | null>(null);
  const [indiaLoading, setIndiaLoading] = useState(true);

  const [worldData, setWorldData]     = useState<any>(null);
  const [worldError, setWorldError]   = useState<string | null>(null);
  const [worldLoading, setWorldLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(INDIA_TOPO_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Map data request failed (HTTP ${res.status})`);
        return res.json();
      })
      .then(data => { if (!cancelled) { setIndiaData(data); setIndiaLoading(false); } })
      .catch(err => {
        console.error("IndiaMap: failed to load India topology:", err);
        if (!cancelled) { setIndiaError(err?.message || "Failed to load map data"); setIndiaLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_TOPO_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Map data request failed (HTTP ${res.status})`);
        return res.json();
      })
      .then(data => { if (!cancelled) { setWorldData(data); setWorldLoading(false); } })
      .catch(err => {
        console.error("IndiaMap: failed to load world topology:", err);
        if (!cancelled) { setWorldError(err?.message || "Failed to load map data"); setWorldLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  const maxOrders = Math.max(...cities.map(c => c.orders), 1);
  const fp = (p: number) => `Rs. ${(p / 100).toLocaleString("en-IN")}`;

  const getCoords = (cityName: string): [number, number] | null =>
    CITY_COORDS[cityName.toLowerCase()] || null;

  const getPinSize = (orders: number) => {
    const ratio = orders / maxOrders;
    return Math.max(7, Math.min(20, 7 + ratio * 13));
  };

  const getPinColor = (orders: number) => {
    const ratio = orders / maxOrders;
    if (ratio > 0.66) return "#c0555a";
    if (ratio > 0.33) return "#c4922a";
    return "#3b82f6";
  };

  const mappedCities = cities
    .map(c => ({ ...c, coords: getCoords(c.city) }))
    .filter(c => c.coords !== null) as (CityData & { coords: [number, number] })[];

  const unmappedCities = cities.filter(c => !getCoords(c.city));

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#f3efe8] rounded-xl mb-4 w-fit">
        <button onClick={() => setTab("india")}
          className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
            tab === "india" ? "bg-white text-[#c0555a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
          }`}>
          <span className="flex items-center gap-1"><MapPin size={13} /> India</span>
        </button>
        <button onClick={() => setTab("world")}
          className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
            tab === "world" ? "bg-white text-[#c0555a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
          }`}>
          <span className="flex items-center gap-1"><Globe2 size={13} /> International</span>
        </button>
      </div>

      {tab === "india" ? (
        <div className="flex gap-6 flex-wrap">
          {/* Map */}
          <div className="relative flex-1 min-w-[300px] max-w-[500px] mx-auto">
            {indiaLoading ? (
              <div className="aspect-square max-w-[500px] mx-auto flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="text-[#c4b8a3] animate-spin" />
                <p className="text-[12px] text-[#aaa]">Loading map...</p>
              </div>
            ) : indiaError ? (
              <div className="aspect-square max-w-[500px] mx-auto flex flex-col items-center justify-center gap-2 text-center px-8">
                <AlertTriangle size={24} className="text-[#c0555a]" />
                <p className="text-[13px] font-semibold text-[#1a1a1a]">Map failed to load</p>
                <p className="text-[11px] text-[#aaa]">{indiaError}</p>
                <p className="text-[11px] text-[#aaa]">City data below is still accurate — just the map graphic didn't load.</p>
              </div>
            ) : (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 850, center: [82.8, 22.5] }}
              width={500} height={500}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={indiaData}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#f3efe8"
                      stroke="#e8ddc8"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover:   { outline: "none", fill: "#ece4d6" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {mappedCities.map((c, i) => {
                const size  = getPinSize(c.orders);
                const color = getPinColor(c.orders);
                const isTop = c.orders === maxOrders;
                return (
                  <Marker key={i} coordinates={c.coords}
                    onMouseEnter={(e: React.MouseEvent) => { setHovered(c); setTooltip({ x: e.clientX, y: e.clientY }); }}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isTop && (
                      <circle r={size / 2 + 6} fill={color} opacity={0.2}>
                        <animate attributeName="r" from={size / 2} to={size / 2 + 12} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle r={size / 2} fill={color} opacity={0.85} stroke="white" strokeWidth={1.5} style={{ cursor: "pointer" }} />
                    {c.orders > 1 && (
                      <text textAnchor="middle" y={3} fontSize={8} fill="white" fontWeight="bold" style={{ pointerEvents: "none" }}>
                        {c.orders}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>
            )}
            {/* Tooltip */}
            {hovered && (
              <div className="fixed z-50 bg-white rounded-xl shadow-xl border border-[#e8e8e8] p-3 pointer-events-none"
                style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
                <p className="text-[13px] font-bold text-[#1a1a1a]">{hovered.city}</p>
                <p className="text-[12px] text-[#888]">{hovered.orders} orders</p>
                <p className="text-[12px] text-[#c0555a] font-semibold">{fp(hovered.revenue)}</p>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center mt-2">
              {[{ color: "#c0555a", label: "High" }, { color: "#c4922a", label: "Medium" }, { color: "#3b82f6", label: "Low" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="text-[11px] text-[#888]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* City list */}
          <div className="w-[220px] flex-shrink-0">
            <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-3">Top cities</p>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {cities.slice(0, 20).map((c, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-[#aaa] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-semibold text-[#1a1a1a] truncate">{c.city}</span>
                      <span className="text-[11px] text-[#888] ml-2 flex-shrink-0">{c.orders}</span>
                    </div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${(c.orders / maxOrders) * 100}%`,
                        background: getPinColor(c.orders),
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {unmappedCities.length > 0 && (
                <p className="text-[11px] text-[#aaa] mt-2">+{unmappedCities.length} other cities</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ── WORLD TAB ──────────────────────────────────────────────────────
        // Real map, honestly empty: there's currently no `country` field
        // anywhere in the order/address data, so international orders can't
        // exist yet. This is ready to light up the moment that's built.
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[500px] opacity-40">
            {worldLoading ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 size={20} className="text-[#c4b8a3] animate-spin" />
              </div>
            ) : worldError ? (
              <div className="h-[280px] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#c0555a]" />
              </div>
            ) : (
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100, center: [10, 20] }}
              width={500} height={280} style={{ width: "100%", height: "auto" }}>
              <Geographies geography={worldData}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography key={geo.rsmKey} geography={geo}
                      fill="#f3efe8" stroke="#e0d5c4" strokeWidth={0.4}
                      style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
            )}
          </div>
          <div className="flex flex-col items-center text-center mt-4 max-w-[360px]">
            <Globe2 size={22} className="text-[#c4b8a3] mb-2" />
            <p className="text-[13px] font-semibold text-[#888]">No international orders yet</p>
            <p className="text-[11px] text-[#aaa] mt-1">
              International shipping isn't set up yet — addresses don't currently capture a country,
              so this will start populating once that's built.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}