"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Loader2, Trash2, Move } from "lucide-react";

interface Zone {
  x: number; y: number; width: number; height: number;
  label: string; type: "image" | "text";
}

interface Props {
  templateUrl:    string;
  zones:          Zone[];
  onTemplateChange: (url: string) => void;
  onZonesChange:  (zones: Zone[]) => void;
}

const CANVAS = 500;

export default function ZoneSelector({ templateUrl, zones, onTemplateChange, onZonesChange }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drawing,   setDrawing]   = useState(false);
  const [start,     setStart]     = useState({ x: 0, y: 0 });
  const [current,   setCurrent]   = useState({ x: 0, y: 0 });
  const [selected,  setSelected]  = useState<number | null>(null);
  const [mode,      setMode]      = useState<"draw" | "select">("select");
  const [newLabel,  setNewLabel]  = useState("Your photo");
  const [newType,   setNewType]   = useState<"image" | "text">("image");

  const [urlInput, setUrlInput] = useState("");

  const applyUrl = () => {
    if (urlInput.trim()) {
      onTemplateChange(urlInput.trim());
      setUrlInput("");
    }
  };
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    if (templateUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS, CANVAS);
        drawZones(ctx);
      };
      img.onerror = () => {
        ctx.fillStyle = "#f3efe8";
        ctx.fillRect(0, 0, CANVAS, CANVAS);
        ctx.fillStyle = "#aaa";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Could not load template image", CANVAS/2, CANVAS/2);
        drawZones(ctx);
      };
      img.src = templateUrl;
    } else {
      ctx.fillStyle = "#f8f5f0";
      ctx.fillRect(0, 0, CANVAS, CANVAS);
      ctx.strokeStyle = "#e8e0d5";
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(10, 10, CANVAS-20, CANVAS-20);
      ctx.setLineDash([]);
      ctx.fillStyle = "#aaa";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Upload your product template image above", CANVAS/2, CANVAS/2 - 10);
      ctx.font = "12px Arial";
      ctx.fillText("Then draw zones on it", CANVAS/2, CANVAS/2 + 15);
    }
  }, [templateUrl, zones, selected, drawing, start, current]);

  function drawZones(ctx: CanvasRenderingContext2D) {
    // Draw existing zones
    zones.forEach((z, i) => {
      const isSelected = selected === i;
      ctx.fillStyle = z.type === "image"
        ? "rgba(192,85,90,0.15)"
        : "rgba(196,146,42,0.15)";
      ctx.fillRect(z.x, z.y, z.width, z.height);
      ctx.strokeStyle = isSelected
        ? "#1a1a1a"
        : z.type === "image" ? "#c0555a" : "#c4922a";
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.setLineDash(isSelected ? [] : [5, 3]);
      ctx.strokeRect(z.x, z.y, z.width, z.height);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = z.type === "image" ? "#c0555a" : "#c4922a";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`${i+1}. ${z.label}`, z.x + 6, z.y + 16);

      // Type badge
      const badge = z.type === "image" ? "📷 Photo" : "✏️ Text";
      ctx.font = "10px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(z.x + 4, z.y + z.height - 20, 60, 16);
      ctx.fillStyle = "#555";
      ctx.fillText(badge, z.x + 8, z.y + z.height - 8);
    });

    // Draw current drag rectangle
    if (drawing) {
      const rx = Math.min(start.x, current.x);
      const ry = Math.min(start.y, current.y);
      const rw = Math.abs(current.x - start.x);
      const rh = Math.abs(current.y - start.y);
      ctx.fillStyle = newType === "image"
        ? "rgba(192,85,90,0.2)"
        : "rgba(196,146,42,0.2)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = newType === "image" ? "#c0555a" : "#c4922a";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
      if (rw > 30 && rh > 20) {
        ctx.fillStyle = newType === "image" ? "#c0555a" : "#c4922a";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${newLabel}`, rx + rw/2, ry + rh/2);
      }
    }
  }

  useEffect(() => { redraw(); }, [redraw, drawing, current]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect  = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS / rect.width;
    return {
      x: Math.round((e.clientX - rect.left) * scale),
      y: Math.round((e.clientY - rect.top)  * scale),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    if (mode === "draw") {
      setDrawing(true);
      setStart(pos); setCurrent(pos);
    } else {
      // Select a zone
      const idx = zones.findIndex(z =>
        pos.x >= z.x && pos.x <= z.x + z.width &&
        pos.y >= z.y && pos.y <= z.y + z.height
      );
      setSelected(idx >= 0 ? idx : null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setCurrent(getPos(e));
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    setDrawing(false);
    const rx = Math.min(start.x, current.x);
    const ry = Math.min(start.y, current.y);
    const rw = Math.abs(current.x - start.x);
    const rh = Math.abs(current.y - start.y);
    if (rw > 20 && rh > 20) {
      onZonesChange([...zones, {
        x: rx, y: ry, width: rw, height: rh,
        label: newLabel, type: newType,
      }]);
    }
    setMode("select");
  };

  const removeZone = (i: number) => {
    const next = zones.filter((_, j) => j !== i);
    onZonesChange(next);
    setSelected(null);
  };

  // Upload template
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onTemplateChange(data.url);
      else {
        // Fallback: use local URL for preview
        onTemplateChange(URL.createObjectURL(file));
      }
    } catch {
      onTemplateChange(URL.createObjectURL(file));
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Template upload */}
      <div>
        <p className="text-[12px] font-bold text-[#555] uppercase tracking-wider mb-2">
          Step 1 — Upload your clean product photo (no customer design on it)
        </p>
        {templateUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <img src={templateUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-green-700">Template uploaded ✓</p>
              <p className="text-[11px] text-green-600 truncate">{templateUrl.slice(0, 50)}...</p>
            </div>
            <button onClick={() => { onTemplateChange(""); onZonesChange([]); }}
              className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <>
          <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-[#e8e0d5] rounded-xl cursor-pointer hover:border-[#c0555a] hover:bg-[#c0555a]/5 transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin text-[#c0555a]" />
              : <Upload size={18} className="text-[#c0555a]" />}
            <span className="text-[13px] font-medium text-[#555]">
              {uploading ? "Uploading..." : "Upload template image (JPG, PNG)"}
            </span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          <div className="flex gap-2 mt-2">
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyUrl()}
              placeholder="Or paste an image URL directly..."
              className="flex-1 border border-[#e8e0d5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a]" />
            <button onClick={applyUrl} disabled={!urlInput.trim()}
              className="px-4 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] disabled:opacity-40 transition-colors whitespace-nowrap">
              Use URL
            </button>
          </div>
          </>
        )}
      </div>

      {/* Zone drawer */}
      {templateUrl && (
        <>
          <div>
            <p className="text-[12px] font-bold text-[#555] uppercase tracking-wider mb-2">
              Step 2 — Draw zones on the image where customer content goes
            </p>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-[#f3efe8] rounded-xl border border-[#e8e0d5]">
              <select value={newType} onChange={e => setNewType(e.target.value as any)}
                className="border border-[#e8e0d5] rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none focus:border-[#c0555a]">
                <option value="image">📷 Photo zone</option>
                <option value="text">✏️ Text zone</option>
              </select>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Zone label e.g. Your photo"
                className="border border-[#e8e0d5] rounded-lg px-2 py-1.5 text-[12px] flex-1 min-w-[120px] outline-none focus:border-[#c0555a]" />
              <button onClick={() => setMode(mode === "draw" ? "select" : "draw")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  mode === "draw"
                    ? "bg-[#c0555a] text-white"
                    : "bg-white border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                }`}>
                {mode === "draw" ? "✏️ Drawing mode ON" : "✏️ Draw zone"}
              </button>
            </div>
            <p className="text-[11px] text-[#888] mb-2">
              {mode === "draw"
                ? "🖱️ Click and drag on the image below to draw a zone"
                : "Click a zone to select it, or click Draw zone to add new"}
            </p>

            {/* Canvas */}
            <canvas ref={canvasRef} width={CANVAS} height={CANVAS}
              className={`w-full rounded-2xl border-2 transition-colors ${
                mode === "draw" ? "border-[#c0555a] cursor-crosshair" : "border-[#e8e0d5] cursor-pointer"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Zone list */}
          {zones.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-[#555] uppercase tracking-wider mb-2">
                Zones defined ({zones.length})
              </p>
              <div className="flex flex-col gap-2">
                {zones.map((z, i) => (
                  <div key={i}
                    onClick={() => setSelected(selected === i ? null : i)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      selected === i ? "border-[#1a1a1a] bg-[#f5f5f5]" : "border-[#e8e0d5] bg-white hover:border-[#c0555a]"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 ${
                      z.type === "image" ? "bg-[#c0555a]" : "bg-[#c4922a]"
                    }`}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{z.label}</p>
                      <p className="text-[11px] text-[#888]">
                        {z.type === "image" ? "📷 Photo zone" : "✏️ Text zone"} ·{" "}
                        {z.width}×{z.height}px at ({z.x},{z.y})
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeZone(i); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#aaa] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {zones.length === 0 && (
            <div className="text-center py-6 text-[#aaa] text-[13px] bg-[#f8f8f8] rounded-xl border border-dashed border-[#e8e8e8]">
              No zones yet — click "Draw zone" then drag on the image above
            </div>
          )}
        </>
      )}
    </div>
  );
}