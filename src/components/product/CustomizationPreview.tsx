"use client";

import {
  useEffect, useRef, useState, useCallback,
} from "react";
import { Loader2, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PreviewZone {
  id:          string;
  type:        "text" | "image";
  fieldType:   "text" | "textarea" | "image";
  x:           number;
  y:           number;
  width:       number;
  height?:     number;
  fontSize?:   number;
  fontFamily?: string;
  color?:      string;
  align?:      "left" | "center" | "right";
  maxLines?:   number;
  shape?:      "circle" | "rectangle";
  border?:     boolean;
  borderColor?: string;
  borderWidth?: number;
}

interface CustomizationData {
  name?:     string;
  message?:  string;
  photoUrl?: string;
  [key: string]: string | undefined;
}

interface Props {
  templateImage: string;           // Cloudinary product template URL
  previewZones:  PreviewZone[];    // Zone configs
  customization: CustomizationData;
  productName:   string;
}

const CANVAS_WIDTH  = 500;
const CANVAS_HEIGHT = 500;

export default function CustomizationPreview({
  templateImage,
  previewZones,
  customization,
  productName,
}: Props) {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading]   = useState(true);
  const [zoom,    setZoom]      = useState(1);
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);
  const [photoImg,    setPhotoImg]    = useState<HTMLImageElement | null>(null);
  const prevPhotoUrl = useRef<string | undefined>(undefined);

  // ── LOAD TEMPLATE IMAGE ONCE ──
  useEffect(() => {
    if (!templateImage) return;
    setLoading(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateImage;

    img.onload  = () => { setTemplateImg(img); setLoading(false); };
    img.onerror = () => { setLoading(false); };
  }, [templateImage]);

  // ── LOAD PHOTO WHEN URL CHANGES ──
  useEffect(() => {
    if (!customization.photoUrl || customization.photoUrl === prevPhotoUrl.current) return;
    prevPhotoUrl.current = customization.photoUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = customization.photoUrl;
    img.onload = () => setPhotoImg(img);
  }, [customization.photoUrl]);

  // ── DRAW CANVAS ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw template
    ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw each zone
    for (const zone of previewZones) {
      if (zone.type === "image" && zone.fieldType === "image") {
        drawImageZone(ctx, zone);
      } else if (zone.type === "text") {
        drawTextZone(ctx, zone);
      }
    }
  }, [templateImg, photoImg, customization, previewZones]);

  // ── DRAW IMAGE ZONE ──
  const drawImageZone = (
    ctx:  CanvasRenderingContext2D,
    zone: PreviewZone
  ) => {
    const img    = photoImg;
    const width  = zone.width;
    const height = zone.height || zone.width;

    if (!img) {
      // Placeholder when no photo uploaded
      ctx.save();

      if (zone.shape === "circle") {
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, width / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      // Dashed placeholder box
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#c0555a";
      ctx.lineWidth   = 2;

      if (zone.shape === "circle") {
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, width / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(zone.x - width / 2, zone.y - height / 2, width, height);
      }

      // Placeholder text
      ctx.setLineDash([]);
      ctx.fillStyle  = "#c0555a";
      ctx.font       = "13px Arial";
      ctx.textAlign  = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Your photo here", zone.x, zone.y);

      ctx.restore();
      return;
    }

    ctx.save();

    if (zone.shape === "circle") {
      // Clip to circle
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, width / 2, 0, Math.PI * 2);
      ctx.clip();

      // Draw image scaled to fit circle
      const imgAspect  = img.width / img.height;
      let drawW = width, drawH = height;
      if (imgAspect > 1) {
        drawH = width;
        drawW = drawH * imgAspect;
      } else {
        drawW = height;
        drawH = drawW / imgAspect;
      }

      ctx.drawImage(
        img,
        zone.x - drawW / 2,
        zone.y - drawH / 2,
        drawW,
        drawH
      );

    } else {
      // Rectangle
      ctx.drawImage(
        img,
        zone.x - width / 2,
        zone.y - height / 2,
        width,
        height
      );
    }

    ctx.restore();

    // Draw border
    if (zone.border) {
      ctx.save();
      ctx.strokeStyle = zone.borderColor || "#c0555a";
      ctx.lineWidth   = zone.borderWidth || 3;

      if (zone.shape === "circle") {
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, width / 2 + (zone.borderWidth || 3) / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          zone.x - width / 2,
          zone.y - height / 2,
          width,
          height
        );
      }
      ctx.restore();
    }
  };

  // ── DRAW TEXT ZONE ──
  const drawTextZone = (
    ctx:  CanvasRenderingContext2D,
    zone: PreviewZone
  ) => {
    // Get value from customization
    const value =
      zone.fieldType === "text"     ? customization.name    :
      zone.fieldType === "textarea" ? customization.message :
      customization[zone.id];

    if (!value || value.trim() === "") {
      // Placeholder
      ctx.save();
      ctx.font         = `italic ${zone.fontSize || 20}px ${zone.fontFamily || "Arial"}`;
      ctx.fillStyle    = "rgba(0,0,0,0.2)";
      ctx.textAlign    = (zone.align || "center") as CanvasTextAlign;
      ctx.textBaseline = "middle";

      const placeholder =
        zone.fieldType === "text"     ? "Your name here"    :
        zone.fieldType === "textarea" ? "Your message here" :
        "Text here";

      ctx.fillText(placeholder, zone.x, zone.y);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.font         = `${zone.fontSize || 20}px ${zone.fontFamily || "Arial"}`;
    ctx.fillStyle    = zone.color || "#1a1a1a";
    ctx.textAlign    = (zone.align || "center") as CanvasTextAlign;
    ctx.textBaseline = "middle";

    // Wrap text for textarea
    if (zone.fieldType === "textarea" && zone.maxLines && zone.maxLines > 1) {
      const words    = value.split(" ");
      const lines: string[] = [];
      let   current  = "";

      for (const word of words) {
        const test  = current ? `${current} ${word}` : word;
        const width = ctx.measureText(test).width;

        if (width > zone.width && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }

        if (lines.length >= zone.maxLines) break;
      }
      if (current && lines.length < zone.maxLines) lines.push(current);

      const lineHeight = (zone.fontSize || 20) * 1.4;
      const totalH     = lines.length * lineHeight;
      let   startY     = zone.y - totalH / 2 + lineHeight / 2;

      for (const line of lines) {
        ctx.fillText(line, zone.x, startY, zone.width);
        startY += lineHeight;
      }
    } else {
      // Single line — scale if too long
      const textWidth = ctx.measureText(value).width;
      if (textWidth > zone.width) {
        ctx.scale(zone.width / textWidth, 1);
        const scaledX = zone.align === "center"
          ? zone.x * (textWidth / zone.width)
          : zone.x;
        ctx.fillText(value, scaledX, zone.y);
      } else {
        ctx.fillText(value, zone.x, zone.y, zone.width);
      }
    }

    ctx.restore();
  };

  // ── REDRAW ON EVERY CHANGE ──
  useEffect(() => {
    draw();
  }, [draw]);

  // ── DOWNLOAD PREVIEW ──
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link    = document.createElement("a");
    link.download = `${productName}-preview.png`;
    link.href     = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col gap-3">

      {/* LABEL */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">
          Live preview
        </p>
        <div className="flex items-center gap-2">
          {/* ZOOM CONTROLS */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="w-7 h-7 bg-[#f3efe8] rounded-full flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] text-[#aaa] w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="w-7 h-7 bg-[#f3efe8] rounded-full flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-7 h-7 bg-[#f3efe8] rounded-full flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
            title="Reset zoom"
          >
            <RotateCcw size={13} />
          </button>
          {/* DOWNLOAD */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c0555a] text-white text-[11px] font-semibold rounded-full hover:bg-[#a84449] transition-colors"
            title="Download preview"
          >
            <Download size={11} />
            Save preview
          </button>
        </div>
      </div>

      {/* CANVAS WRAPPER */}
      <div className="relative bg-[#f3efe8] rounded-2xl overflow-hidden border border-[#e8e0d5] flex items-center justify-center"
        style={{ minHeight: "320px" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f3efe8] z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-[#c0555a] animate-spin" />
              <p className="text-[12px] text-[#aaa]">Loading preview...</p>
            </div>
          </div>
        )}

        <div
          style={{
            transform:       `scale(${zoom})`,
            transformOrigin: "center center",
            transition:      "transform 0.2s ease",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-xl shadow-md"
            style={{
              maxWidth:  "100%",
              maxHeight: "400px",
              display:   loading ? "none" : "block",
            }}
          />
        </div>
      </div>

      {/* HINT */}
      <p className="text-[11px] text-[#aaa] text-center">
        Preview is for reference only. Actual product may vary slightly.
      </p>
    </div>
  );
}