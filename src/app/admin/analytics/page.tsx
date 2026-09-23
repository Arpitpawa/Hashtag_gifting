"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users, Loader2 } from "lucide-react";
import IndiaMap from "@/components/admin/IndiaMap";

const fp = (p: number) => `Rs. ${(p/100).toLocaleString("en-IN")}`;

// ── Pure SVG Line Chart ──────────────────────────────────────────────────────
function LineChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const W = 800, H = 200, PAD = 40;

  // With zero orders yet (or a date range with no data), `data` can be an
  // empty array — points[points.length-1] was then undefined, and reading
  // .x off it crashed the whole page. Same divide-by-zero risk with exactly
  // 1 point (data.length - 1 === 0). Bail out to a plain empty state
  // instead of computing a chart with nothing (or one point) to plot.
  if (data.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-[13px] text-[#aaa]">
        No revenue data for this period yet
      </div>
    );
  }

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const points = data.map((d, i) => ({
    x: PAD + (data.length === 1 ? 0 : i / (data.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - d.revenue / maxRev) * (H - PAD * 2),
    ...d,
  }));
  const pathD   = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD   = `${pathD} L ${points[points.length-1].x} ${H-PAD} L ${PAD} ${H-PAD} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 400 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0555a" stopOpacity=".2" />
            <stop offset="100%" stopColor="#c0555a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0,.25,.5,.75,1].map(f => (
          <line key={f} x1={PAD} y1={PAD + f*(H-PAD*2)} x2={W-PAD} y2={PAD + f*(H-PAD*2)}
            stroke="#f0f0f0" strokeWidth="1" />
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#revGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#c0555a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots + labels */}
        {points.filter((_,i) => i % 5 === 0 || i === points.length-1).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#c0555a" stroke="white" strokeWidth="2" />
            <text x={p.x} y={H-PAD+14} textAnchor="middle" fontSize="9" fill="#aaa">
              {new Date(p.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
            </text>
          </g>
        ))}
        {/* Y-axis labels */}
        {[0,.5,1].map(f => (
          <text key={f} x={PAD-6} y={PAD + f*(H-PAD*2) + 4} textAnchor="end" fontSize="9" fill="#aaa">
            {fp(maxRev * (1-f))}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Bar chart for hours ──────────────────────────────────────────────────────
function HourHeatmap({ hourMap }: { hourMap: number[] }) {
  const max = Math.max(...hourMap, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {hourMap.map((v, h) => (
        <div key={h} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-sm transition-all" style={{
            height: `${Math.max(4, (v/max)*52)}px`,
            background: v > 0 ? `rgba(192,85,90,${0.2 + (v/max)*0.8})` : "#f0f0f0",
          }} title={`${h}:00 — ${v} orders`} />
          {h % 6 === 0 && <span className="text-[8px] text-[#aaa]">{h}h</span>}
        </div>
      ))}
    </div>
  );
}

// ── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { name: string; count: number }[] }) {
  const COLORS = ["#c0555a","#c4922a","#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444","#6366f1"];
  const total  = data.reduce((s,d) => s+d.count, 0);
  let angle    = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 360;
    const a1    = angle, a2 = angle + sweep;
    angle      += sweep;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1    = 50 + 35 * Math.cos(toRad(a1 - 90));
    const y1    = 50 + 35 * Math.sin(toRad(a1 - 90));
    const x2    = 50 + 35 * Math.cos(toRad(a2 - 90));
    const y2    = 50 + 35 * Math.sin(toRad(a2 - 90));
    const large = sweep > 180 ? 1 : 0;
    return { ...d, path:`M 50 50 L ${x1} ${y1} A 35 35 0 ${large} 1 ${x2} ${y2} Z`, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
        {slices.map((s,i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1" />)}
        <circle cx="50" cy="50" r="18" fill="white" />
        <text x="50" y="50" textAnchor="middle" dy="4" fontSize="7" fill="#1a1a1a" fontWeight="bold">{total}</text>
        <text x="50" y="50" textAnchor="middle" dy="12" fontSize="5" fill="#aaa">items</text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((s,i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[#555] truncate flex-1">{s.name}</span>
            <span className="text-[#1a1a1a] font-semibold flex-shrink-0">{Math.round(s.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data,    setData]    = useState<any>(null);
  const [cities,  setCities]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then(r => r.json()),
      fetch("/api/admin/cities").then(r => r.json()),
    ]).then(([analytics, cityData]) => {
      setData(analytics);
      setCities(cityData.cities || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-[#c0555a]" />
    </div>
  );

  const t = data?.today || {};
  const revenueByDay   = data?.revenueByDay   || [];
  const byCategory     = data?.byCategory     || [];
  const hourMap        = data?.hourMap        || Array(24).fill(0);
  const topProducts    = data?.topProducts    || [];
  const topCustomers   = data?.topCustomers   || [];

  const Trend = ({ val }: { val: number }) => val === 0 ? null : (
    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${val > 0 ? "text-green-600" : "text-red-500"}`}>
      {val > 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>} {Math.abs(val)}%
    </span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

      {/* Today's report card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Today's revenue", value: fp(t.revenue||0), change: t.revenueChange, icon:<IndianRupee size={18} className="text-green-600"/>, bg:"bg-green-50" },
          { label:"Today's orders",  value: t.orders||0,      change: t.ordersChange,  icon:<ShoppingBag size={18} className="text-blue-600"/>,  bg:"bg-blue-50"  },
          { label:"30-day revenue",  value: fp(data?.totalRevenue30||0), change:null, icon:<TrendingUp size={18} className="text-[#c0555a]"/>, bg:"bg-[#c0555a]/10" },
          { label:"Avg order value", value: fp(revenueByDay.reduce((s:number,d:any)=>s+d.revenue,0) / Math.max(revenueByDay.filter((d:any)=>d.orders>0).length,1)),
            change:null, icon:<Users size={18} className="text-purple-600"/>, bg:"bg-purple-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e8e8] p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>{s.icon}</div>
            <p className="text-[12px] text-[#888]">{s.label}</p>
            <p className="text-[22px] font-bold text-[#1a1a1a] mt-0.5">{s.value}</p>
            {s.change != null && <Trend val={s.change} />}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Revenue — last 30 days</h3>
        <LineChart data={revenueByDay} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Sales by category</h3>
          {byCategory.length === 0
            ? <p className="text-[13px] text-[#aaa]">No data yet</p>
            : <DonutChart data={byCategory} />}
        </div>

        {/* Peak hours */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">Peak order hours</h3>
          <p className="text-[12px] text-[#aaa] mb-4">Last 7 days</p>
          <HourHeatmap hourMap={hourMap} />
          {hourMap.some((v:number) => v > 0) && (
            <p className="text-[12px] text-[#888] mt-3">
              Busiest: <strong className="text-[#c0555a]">{hourMap.indexOf(Math.max(...hourMap))}:00</strong>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Top products (30 days)</h3>
          {topProducts.length === 0
            ? <p className="text-[13px] text-[#aaa]">No data yet</p>
            : topProducts.map((p:any, i:number) => (
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-[13px] font-bold text-[#aaa] w-5 flex-shrink-0">#{i+1}</span>
              {p.product?.images?.[0] && (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8]">
                  <Image src={p.product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1a1a1a] capitalize line-clamp-1">{p.product?.name}</p>
                <p className="text-[11px] text-[#888]">{p._sum?.quantity || p._count?.id} sold</p>
              </div>
              <div className="w-24 h-2 bg-[#f0f0f0] rounded-full overflow-hidden flex-shrink-0">
                <div className="h-full bg-[#c0555a] rounded-full" style={{
                  width:`${(((p._sum?.quantity||p._count?.id||0) / Math.max(...topProducts.map((x:any)=>x._sum?.quantity||x._count?.id||1)))*100)}%`
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Top customers</h3>
          {topCustomers.length === 0
            ? <p className="text-[13px] text-[#aaa]">No data yet</p>
            : topCustomers.map((c:any, i:number) => (
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-9 h-9 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
                {c.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{c.user?.name || "Guest"}</p>
                <p className="text-[11px] text-[#888]">{c._count?.id} orders</p>
              </div>
              <p className="text-[13px] font-bold text-[#c0555a] flex-shrink-0">{fp(c._sum?.totalAmount||0)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* India map */}
      {cities.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">Orders by city</h3>
          <p className="text-[12px] text-[#aaa] mb-5">Pin size = order volume · Hover for details</p>
          <IndiaMap cities={cities} />
        </div>
      )}
    </div>
  );
}