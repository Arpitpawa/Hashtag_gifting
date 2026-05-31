"use client";

import { useState } from "react";

// Major Indian cities with approximate SVG coordinates (based on 600x700 viewBox)
const CITY_COORDS: Record<string, [number, number]> = {
  "delhi":       [295, 178],  "new delhi":   [295, 178],
  "mumbai":      [205, 340],  "bombay":      [205, 340],
  "bengaluru":   [265, 470],  "bangalore":   [265, 470],
  "hyderabad":   [290, 395],
  "chennai":     [310, 480],  "madras":      [310, 480],
  "kolkata":     [430, 255],  "calcutta":    [430, 255],
  "ahmedabad":   [185, 270],
  "pune":        [215, 360],
  "jaipur":      [255, 210],
  "lucknow":     [340, 210],
  "surat":       [190, 305],
  "kanpur":      [335, 220],
  "nagpur":      [305, 320],
  "indore":      [255, 295],
  "bhopal":      [270, 295],
  "visakhapatnam":[ 370, 390],
  "patna":       [390, 220],
  "vadodara":    [200, 285],
  "agra":        [295, 210],
  "noida":       [302, 182],
  "gurgaon":     [290, 185],
  "coimbatore":  [260, 500],
  "kochi":       [240, 530],  "cochin": [240, 530],
  "chandigarh":  [272, 155],
  "goa":         [205, 410],
  "jodhpur":     [220, 225],
  "udaipur":     [230, 255],
  "amritsar":    [255, 145],
  "varanasi":    [370, 235],
  "bhubaneswar": [400, 330],
};

interface CityData {
  city:    string;
  orders:  number;
  revenue: number;
}

interface Props {
  cities: CityData[];
}

// Simplified India SVG path (outline only)
const INDIA_PATH = "M295,60 L320,55 L360,65 L390,80 L420,90 L450,100 L470,120 L480,145 L475,165 L490,180 L495,205 L485,225 L470,240 L460,265 L450,290 L455,315 L450,340 L440,360 L430,380 L420,400 L410,420 L400,440 L390,460 L380,475 L365,490 L350,505 L335,515 L320,520 L305,525 L290,530 L275,535 L260,530 L245,520 L232,510 L218,495 L205,480 L195,460 L188,440 L182,415 L178,390 L175,365 L178,340 L185,315 L190,290 L188,265 L182,245 L172,228 L165,208 L162,185 L168,165 L175,145 L182,128 L192,112 L205,100 L220,88 L238,78 L255,70 L275,62 Z M295,60 L270,55 L258,48 L248,38 L252,30 L265,28 L278,32 L290,42 Z";

export default function IndiaMap({ cities }: Props) {
  const [hovered, setHovered] = useState<CityData | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  const maxOrders = Math.max(...cities.map(c => c.orders), 1);
  const fp = (p: number) => `Rs. ${(p/100).toLocaleString("en-IN")}`;

  const getCoords = (cityName: string): [number, number] | null => {
    const key = cityName.toLowerCase();
    return CITY_COORDS[key] || null;
  };

  const getPinSize = (orders: number) => {
    const ratio = orders / maxOrders;
    return Math.max(8, Math.min(28, 8 + ratio * 20));
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
    <div className="flex gap-6 flex-wrap">
      {/* Map */}
      <div className="relative flex-1 min-w-[300px]">
        <svg viewBox="0 0 600 580" className="w-full max-w-[500px] mx-auto">
          {/* India outline */}
          <path d={INDIA_PATH} fill="#f3efe8" stroke="#e8ddd0" strokeWidth="2" />

          {/* City pins */}
          {mappedCities.map((c, i) => {
            const [x, y] = c.coords;
            const size   = getPinSize(c.orders);
            const color  = getPinColor(c.orders);
            return (
              <g key={i}
                onMouseEnter={e => { setHovered(c); setTooltip({ x: e.clientX, y: e.clientY }); }}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer">
                {/* Pulse ring for top cities */}
                {c.orders === maxOrders && (
                  <circle cx={x} cy={y} r={size + 6} fill={color} opacity="0.2">
                    <animate attributeName="r" from={size} to={size+12} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Pin circle */}
                <circle cx={x} cy={y} r={size/2} fill={color} opacity="0.85" stroke="white" strokeWidth="1.5" />
                {/* Count label */}
                {c.orders > 1 && (
                  <text x={x} y={y+4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
                    {c.orders}
                  </text>
                )}
                {/* City name for larger pins */}
                {size > 14 && (
                  <text x={x} y={y + size/2 + 10} textAnchor="middle" fontSize="9" fill="#555" fontWeight="500">
                    {c.city}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

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
          {[{ color:"#c0555a", label:"High" }, { color:"#c4922a", label:"Medium" }, { color:"#3b82f6", label:"Low" }].map(l => (
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
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth:"none" }}>
          {cities.slice(0, 20).map((c, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-[#aaa] w-4">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-[#1a1a1a] truncate">{c.city}</span>
                  <span className="text-[11px] text-[#888] ml-2 flex-shrink-0">{c.orders}</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${(c.orders/maxOrders)*100}%`,
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
  );
}

function getPinColor(orders: number): string {
  return "#3b82f6"; // fallback, actual logic is in component
}