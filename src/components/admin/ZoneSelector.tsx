"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import {
  Upload, Loader2, Trash2, RotateCw, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Check, Pencil, MousePointer2, Image as ImageIcon,
} from "lucide-react";

interface Zone {
  x: number; y: number; width: number; height: number;
  rotation?: number;
  label: string; type: "image" | "text"; fontColor?: string;
}

interface Props {
  templateUrl:    string;
  zones:          Zone[];
  onTemplateChange: (url: string) => void;
  onZonesChange:  (zones: Zone[]) => void;
}

const CANVAS = 500;
const HANDLE_DIST   = 26; // px above zone edge, in 500-canvas space
const HANDLE_RADIUS = 7;  // visual radius of the drag handle
const HANDLE_HIT    = 12; // click tolerance radius
const GRAB_PADDING  = 10; // extra invisible margin around a zone's body, makes thin/rotated zones easier to grab

// Snap the rotate handle to these angles when the drag gets close —
// makes it easy to hit a clean 0°/45°/90° etc without fighting the mouse.
const SNAP_ANGLES = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
const SNAP_TOLERANCE = 2.5;

function toRad(deg: number) { return (deg * Math.PI) / 180; }

// Center of a zone's unrotated bounding box
function zoneCenter(z: Zone) {
  return { x: z.x + z.width / 2, y: z.y + z.height / 2 };
}

// Rotate handle position — sits above the zone, offset by its own rotation
function handlePos(z: Zone) {
  const angle  = toRad(z.rotation || 0);
  const c      = zoneCenter(z);
  const dist   = z.height / 2 + HANDLE_DIST;
  return { x: c.x + dist * Math.sin(angle), y: c.y - dist * Math.cos(angle) };
}

// Point where the connecting line meets the (rotated) top edge of the zone
function topEdgeMid(z: Zone) {
  const angle = toRad(z.rotation || 0);
  const c     = zoneCenter(z);
  const dist  = z.height / 2;
  return { x: c.x + dist * Math.sin(angle), y: c.y - dist * Math.cos(angle) };
}

// Convert a canvas-space point into a zone's own unrotated local frame,
// so hit-testing works the same regardless of rotation.
function toLocal(pos: { x: number; y: number }, z: Zone) {
  const angle = toRad(z.rotation || 0);
  const c = zoneCenter(z);
  const dx = pos.x - c.x, dy = pos.y - c.y;
  const cos = Math.cos(-angle), sin = Math.sin(-angle);
  return { x: c.x + (dx * cos - dy * sin), y: c.y + (dx * sin + dy * cos) };
}

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
  const [newColor,  setNewColor]  = useState("#FFFFFF");
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [urlInput, setUrlInput] = useState("");

  // ── Refs so the window-level drag listeners (attached once, see below)
  // always act on fresh data. Without this, a fast drag would read stale
  // zone positions captured on the render the listener happened to attach on.
  const zonesRef = useRef(zones);
  useEffect(() => { zonesRef.current = zones; }, [zones]);
  const onZonesChangeRef = useRef(onZonesChange);
  useEffect(() => { onZonesChangeRef.current = onZonesChange; }, [onZonesChange]);

  const updateZone = useCallback((i: number, patch: Partial<Zone>) => {
    onZonesChangeRef.current(zonesRef.current.map((z, j) => (j === i ? { ...z, ...patch } : z)));
  }, []);

  // Live move/rotate tracking — a ref (not React state) so the window-level
  // mousemove handler always reads the current drag without re-subscribing
  // on every pixel of movement.
  const dragRef = useRef<{
    type: "move" | "rotate" | null;
    index: number;
    anchor: { x: number; y: number };
    origin: { x: number; y: number };
  }>({ type: null, index: -1, anchor: { x: 0, y: 0 }, origin: { x: 0, y: 0 } });

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
      const angle = toRad(z.rotation || 0);
      const c = zoneCenter(z);

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(angle);
      ctx.translate(-c.x, -c.y);

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
      // Canvas-drawn text can't render a React icon, so this stays plain text.
      const badge = z.type === "image" ? "Photo" : "Text";
      ctx.font = "10px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(z.x + 4, z.y + z.height - 20, 60, 16);
      ctx.fillStyle = "#555";
      ctx.fillText(badge, z.x + 8, z.y + z.height - 8);

      ctx.restore();

      // Rotate handle — drawn in absolute space (not rotated itself),
      // only for the selected zone, only outside drawing mode.
      if (isSelected && mode === "select") {
        const top = topEdgeMid(z);
        const h   = handlePos(z);

        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(h.x, h.y);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(h.x, h.y, HANDLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
    });

    // Draw current drag rectangle (new zones always start unrotated)
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

  const findZoneAt = (pos: { x: number; y: number }) => {
    for (let i = zones.length - 1; i >= 0; i--) {
      const local = toLocal(pos, zones[i]);
      const z = zones[i];
      if (local.x >= z.x - GRAB_PADDING && local.x <= z.x + z.width + GRAB_PADDING &&
          local.y >= z.y - GRAB_PADDING && local.y <= z.y + z.height + GRAB_PADDING) {
        return i;
      }
    }
    return -1;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);

    if (mode === "draw") {
      setDrawing(true);
      setStart(pos); setCurrent(pos);
      return;
    }

    // Rotate-handle hit test takes priority over selection/move
    if (selected !== null && zones[selected]) {
      const h = handlePos(zones[selected]);
      if (Math.hypot(pos.x - h.x, pos.y - h.y) <= HANDLE_HIT) {
        dragRef.current = { type: "rotate", index: selected, anchor: pos, origin: { x: 0, y: 0 } };
        setRotatingIndex(selected);
        document.body.style.userSelect = "none";
        return;
      }
    }

    // Click-and-drag on a zone's body moves it — selects it too if it wasn't.
    // The actual tracking happens via the window-level listeners below, so
    // the drag keeps working smoothly even if the mouse leaves the canvas.
    const idx = findZoneAt(pos);
    if (idx >= 0) {
      setSelected(idx);
      dragRef.current = { type: "move", index: idx, anchor: pos, origin: { x: zones[idx].x, y: zones[idx].y } };
      setDraggingIndex(idx);
      document.body.style.userSelect = "none";
    } else {
      setSelected(null);
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
        x: rx, y: ry, width: rw, height: rh, rotation: 0,
        label: newLabel, type: newType, fontColor: newColor,
      }]);
    }
    setMode("select");
  };

  // Window-level listeners handle the actual move/rotate tracking, attached
  // once for the component's lifetime. Using the window instead of the
  // canvas element means the drag keeps following the mouse even once the
  // cursor leaves the (often small, scaled-down) canvas — this is what made
  // dragging feel unresponsive before, since it used to cancel the moment
  // the mouse crossed the canvas boundary.
  useEffect(() => {
    const posFromEvent = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scale = CANVAS / rect.width;
      return {
        x: Math.round((e.clientX - rect.left) * scale),
        y: Math.round((e.clientY - rect.top)  * scale),
      };
    };

    const onWindowMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (drag.type === null) return;
      const pos = posFromEvent(e);

      if (drag.type === "rotate") {
        const z = zonesRef.current[drag.index];
        if (!z) return;
        const c = zoneCenter(z);
        const dx = pos.x - c.x, dy = pos.y - c.y;
        let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
        deg = Math.round(deg * 2) / 2; // nearest 0.5°
        for (const s of SNAP_ANGLES) {
          if (Math.abs(deg - s) < SNAP_TOLERANCE) { deg = s; break; }
        }
        updateZone(drag.index, { rotation: deg });
      } else if (drag.type === "move") {
        const dx = pos.x - drag.anchor.x;
        const dy = pos.y - drag.anchor.y;
        updateZone(drag.index, { x: drag.origin.x + dx, y: drag.origin.y + dy });
      }
    };

    const onWindowMouseUp = () => {
      if (dragRef.current.type !== null) {
        dragRef.current = { type: null, index: -1, anchor: { x: 0, y: 0 }, origin: { x: 0, y: 0 } };
        setRotatingIndex(null);
        setDraggingIndex(null);
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [updateZone]);

  // Arrow-key nudge for the selected zone — 1px per press, 10px with Shift
  // held. Skipped while focus is in a text input so it doesn't hijack normal
  // text-navigation (e.g. editing the label or the angle box).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selected === null || mode !== "select") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const z = zonesRef.current[selected];
      if (!z) return;
      const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
      const dy = e.key === "ArrowUp"   ? -step : e.key === "ArrowDown"  ? step : 0;
      updateZone(selected, { x: z.x + dx, y: z.y + dy });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, mode, updateZone]);

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
              <p className="flex items-center gap-1 text-[13px] font-semibold text-green-700">Template uploaded <Check size={13} /></p>
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
              <AdminSelect value={newType} onChange={e => setNewType(e.target.value as any)}
                className="border border-[#e8e0d5] rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none focus:border-[#c0555a]">
                <option value="image">Photo zone</option>
                <option value="text">Text zone</option>
              </AdminSelect>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Zone label e.g. Your photo"
                className="border border-[#e8e0d5] rounded-lg px-2 py-1.5 text-[12px] flex-1 min-w-[120px] outline-none focus:border-[#c0555a]" />
              {newType === "text" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <label className="text-[11px] text-[#888] font-medium">Text color:</label>
                  <div className="flex items-center gap-1">
                    {[
                      { color: "#FFFFFF", label: "White"  },
                      { color: "#1a1a1a", label: "Black"  },
                      { color: "#C4922A", label: "Gold"   },
                      { color: "#C0555A", label: "Red"    },
                      { color: "#6B4F3F", label: "Brown"  },
                      { color: "#C0C0C0", label: "Silver" },
                      { color: "#1B4F72", label: "Navy"   },
                      { color: "#196F3D", label: "Green"  },
                    ].map(({ color, label }) => (
                      <button
                        key={color}
                        title={label}
                        onClick={() => setNewColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full transition-all flex-shrink-0 ${
                          newColor === color
                            ? "ring-2 ring-[#c0555a] ring-offset-1 scale-125 shadow-md border border-[#ccc]"
                            : "border border-[#ccc] hover:scale-110"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setMode(mode === "draw" ? "select" : "draw")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  mode === "draw"
                    ? "bg-[#c0555a] text-white"
                    : "bg-white border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                }`}>
                <Pencil size={12} className="inline mr-1" />{mode === "draw" ? "Drawing mode ON" : "Draw zone"}
              </button>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-[#888] mb-2">
              {mode === "draw"
                ? <><MousePointer2 size={12} className="flex-shrink-0" /> Click and drag on the image below to draw a zone</>
                : "Drag a zone anywhere to reposition it, or select it and use the Position boxes/arrow buttons below the canvas — those always work even if dragging feels finicky on a small zone."}
            </p>

            {/* Canvas */}
            <canvas ref={canvasRef} width={CANVAS} height={CANVAS}
              className={`w-full rounded-2xl border-2 transition-colors ${
                mode === "draw" ? "border-[#c0555a] cursor-crosshair"
                  : rotatingIndex !== null || draggingIndex !== null ? "border-[#e8e0d5] cursor-grabbing"
                  : "border-[#e8e0d5] cursor-move"
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
                    className={`rounded-xl border transition-all ${
                      selected === i ? "border-[#1a1a1a] bg-[#f5f5f5]" : "border-[#e8e0d5] bg-white hover:border-[#c0555a]"
                    }`}>
                    <div
                      onClick={() => setSelected(selected === i ? null : i)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 ${
                        z.type === "image" ? "bg-[#c0555a]" : "bg-[#c4922a]"
                      }`}>{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{z.label}</p>
                        <p className="flex items-center gap-1 flex-wrap text-[11px] text-[#888]">
                          {z.type === "image" ? <ImageIcon size={11} /> : <Pencil size={11} />}
                          {z.type === "image" ? "Photo zone" : "Text zone"} ·{" "}
                          {z.width}×{z.height}px at ({z.x},{z.y})
                          {z.rotation ? <> · <RotateCw size={11} className="inline" /> {z.rotation}°</> : ""}
                        </p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeZone(i); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#aaa] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {selected === i && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="flex flex-col gap-3 px-4 pb-3 pt-1 border-t border-[#e8e0d5]">

                        {/* Position — works even if dragging on the canvas is finicky */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Move size={14} className="text-[#888] flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-[#888] whitespace-nowrap">Position</span>

                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-[#aaa]">X</label>
                            <input
                              type="number"
                              value={Math.round(z.x)}
                              onChange={e => updateZone(i, { x: parseInt(e.target.value) || 0 })}
                              className="w-16 border border-[#e8e0d5] rounded-lg px-2 py-1 text-[12px] text-center outline-none focus:border-[#c0555a]"
                            />
                            <label className="text-[10px] text-[#aaa] ml-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(z.y)}
                              onChange={e => updateZone(i, { y: parseInt(e.target.value) || 0 })}
                              className="w-16 border border-[#e8e0d5] rounded-lg px-2 py-1 text-[12px] text-center outline-none focus:border-[#c0555a]"
                            />
                          </div>

                          {/* Directional nudge buttons — 1px per click, hold Shift for 10px */}
                          <div className="grid grid-cols-3 gap-0.5 ml-1">
                            <div />
                            <button
                              onClick={e => updateZone(i, { y: z.y - (e.shiftKey ? 10 : 1) })}
                              title="Move up (hold Shift for ×10)"
                              className="w-6 h-6 flex items-center justify-center rounded-md border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-colors">
                              <ChevronUp size={13} />
                            </button>
                            <div />
                            <button
                              onClick={e => updateZone(i, { x: z.x - (e.shiftKey ? 10 : 1) })}
                              title="Move left (hold Shift for ×10)"
                              className="w-6 h-6 flex items-center justify-center rounded-md border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-colors">
                              <ChevronLeft size={13} />
                            </button>
                            <div className="w-6 h-6" />
                            <button
                              onClick={e => updateZone(i, { x: z.x + (e.shiftKey ? 10 : 1) })}
                              title="Move right (hold Shift for ×10)"
                              className="w-6 h-6 flex items-center justify-center rounded-md border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-colors">
                              <ChevronRight size={13} />
                            </button>
                            <div />
                            <button
                              onClick={e => updateZone(i, { y: z.y + (e.shiftKey ? 10 : 1) })}
                              title="Move down (hold Shift for ×10)"
                              className="w-6 h-6 flex items-center justify-center rounded-md border border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-colors">
                              <ChevronDown size={13} />
                            </button>
                            <div />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center gap-3">
                          <RotateCw size={14} className="text-[#888] flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-[#888] whitespace-nowrap">Rotation</span>
                          <input
                            type="range" min={-180} max={180} step={0.5}
                            value={z.rotation || 0}
                            onChange={e => updateZone(i, { rotation: parseFloat(e.target.value) })}
                            className="flex-1 accent-[#c0555a]"
                          />
                          <input
                            type="number" min={-180} max={180} step={0.5}
                            value={z.rotation || 0}
                            onChange={e => updateZone(i, { rotation: parseFloat(e.target.value) || 0 })}
                            className="w-16 border border-[#e8e0d5] rounded-lg px-2 py-1 text-[12px] text-center outline-none focus:border-[#c0555a]"
                          />
                          <span className="text-[11px] text-[#888]">°</span>
                          {z.rotation ? (
                            <button onClick={() => updateZone(i, { rotation: 0 })}
                              className="text-[11px] text-[#c0555a] font-semibold hover:underline whitespace-nowrap">
                              Reset
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
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