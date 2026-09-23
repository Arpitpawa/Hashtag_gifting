import type { PersonalizationZone } from "./types";

// ── Admin ZoneSelector uses a fixed 500×500 canvas ──────────────────────────
// Zones are stored as raw pixel values in 0–500 space, NOT as percentages.
// This function converts from 500px canvas coords → actual Konva stage px.
const ADMIN_CANVAS = 500;

export function zoneToPx(
  zone: PersonalizationZone,
  stageW: number,
  stageH: number
) {
  return {
    x:      (zone.x      / ADMIN_CANVAS) * stageW,
    y:      (zone.y      / ADMIN_CANVAS) * stageH,
    width:  (zone.width  / ADMIN_CANVAS) * stageW,
    height: (zone.height / ADMIN_CANVAS) * stageH,
  };
}

// Convert Konva px back to 500px canvas coords (used when saving from admin)
export function pxToZone(
  px: { x: number; y: number; width: number; height: number },
  stageW: number,
  stageH: number
) {
  return {
    x:      (px.x      / stageW) * ADMIN_CANVAS,
    y:      (px.y      / stageH) * ADMIN_CANVAS,
    width:  (px.width  / stageW) * ADMIN_CANVAS,
    height: (px.height / stageH) * ADMIN_CANVAS,
  };
}

// Scale font size from 500px canvas base → actual stage width
export function scaleFontSize(baseFontSize: number, stageW: number): number {
  return Math.max(8, Math.round((baseFontSize / ADMIN_CANVAS) * stageW));
}

export function validateZones(
  zones: PersonalizationZone[],
  values: Record<string, string>
): boolean {
  return zones
    .filter(z => z.required)
    .every(z => values[z.id]?.trim());
}