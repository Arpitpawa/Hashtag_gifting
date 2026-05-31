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

export interface Product {
  id:                  number;
  name:                string;
  slug:                string;
  description:         string;
  price:               number;
  comparePrice:        number | null;
  images:              string[];
  badge:               string | null;
  stock:               number;
  customizable:        boolean;
  customizationFields: CustomizationField[];
  previewTemplate:     string | null;
  previewZones:        any[] | null;
  tags:                string[];
  category:            { id: number; name: string; slug: string } | null;
  reviews:             Review[];
  avgRating:           number;
  related:             any[];
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