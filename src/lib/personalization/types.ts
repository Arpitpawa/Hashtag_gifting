// ─────────────────────────────────────────────────────────────────────────────
// Hashtag Gifting — Personalisation Engine Types
// All coordinates are stored as raw px in the admin's fixed 500×500 canvas
// space (see zoneUtils.ts — ADMIN_CANVAS). At render time they're scaled to
// the actual stage size: px = (zone.x / 500) * stageWidth, etc.
// ─────────────────────────────────────────────────────────────────────────────

export type ZoneType = "text" | "image";

export interface PersonalizationZone {
  id:          string;      // unique e.g. "diary_name", "card_logo"
  label:       string;      // shown to customer e.g. "Enter name"
  type:        ZoneType;

  // Position — raw px in the 500×500 admin canvas space
  x:           number;      // left edge (unrotated bounding box)
  y:           number;      // top edge (unrotated bounding box)
  width:       number;      // zone width
  height:      number;      // zone height

  // Rotation — degrees, clockwise, pivots around the zone's own center.
  // Used for products with angled surfaces (e.g. pens shot at a slant) where
  // the customization zone needs to sit at an angle rather than axis-aligned.
  rotation?:   number;      // default 0

  // Text zone settings
  fontSize?:   number;      // base font size at 500px stage width
  fontFamily?: string;      // "Georgia" | "Arial" | etc.
  fontColor?:  string;      // hex color e.g. "#C4922A"
  fontWeight?: "normal" | "bold";
  fontStyle?:  "normal" | "italic";
  align?:      "left" | "center" | "right";
  letterSpacing?: number;
  placeholder?: string;     // shown before customer types e.g. "YOUR NAME"

  // Field settings
  required?:   boolean;
  maxLength?:  number;
}

export interface PersonalizationConfig {
  templateUrl: string;                // Cloudinary URL of the flat mockup
  zones:       PersonalizationZone[];
}

// What customer fills in — stored with order
export interface PersonalizationValues {
  [zoneId: string]: string; // text value or base64 image dataURL
}

// Full payload saved to order
export interface PersonalizationPayload {
  values:     PersonalizationValues;
  previewPng: string;  // base64 PNG from Konva stage export
}