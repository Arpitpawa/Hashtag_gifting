export interface CustomizationField {
  type:         "text" | "textarea" | "image";
  label:        string;
  maxLength?:   number;
  required:     boolean;
  placeholder?: string;
}

export interface Review {
  id:        number;
  name:      string;
  rating:    number;
  comment:   string;
  images:    string[];
  createdAt: string;
}

// ── NEW: Variant types ────────────────────────────────────────────────────────
export interface ProductVariant {
  id:           number;
  groupName:    string;   // "Color", "Size", "Material"
  optionName:   string;   // "Red", "Large", "Wood"
  price:        number | null;  // null = use base product price
  comparePrice: number | null;
  stock:        number;
  images:       string[];
  sku:          string | null;
  sortOrder:    number;
  isDefault:    boolean;
}

// Grouped for easier rendering: { "Color": [...variants], "Size": [...variants] }
export type VariantGroups = Record<string, ProductVariant[]>;

export interface Product {
  id:                  number;
  name:                string;
  slug:                string;
  description:         string;
  detailsDescription:  string | null;
  price:               number;
  comparePrice:        number | null;
  images:              string[];
  badge:               string | null;
  stock:               number;
  customizable:        boolean;
  hasCharm:            boolean;
  customizationFields: CustomizationField[];
  previewTemplate:     string | null;
  previewZones:        any[] | null;
  availableFonts:      string[];
  tags:                string[];
  category:            { id: number; name: string; slug: string } | null;
  reviews:             Review[];
  avgRating:           number;
  related:             any[];
  variants:            ProductVariant[];   // ← NEW
}

export interface RecentlyViewedProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}