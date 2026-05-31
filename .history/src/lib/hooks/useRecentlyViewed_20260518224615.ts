import { useEffect, useState } from "react";

interface ViewedProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

const KEY      = "hashtag-recently-viewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState<ViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const addProduct = (product: ViewedProduct) => {
    try {
      const stored  = localStorage.getItem(KEY);
      const current: ViewedProduct[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      const filtered = current.filter((p) => p.id !== product.id);

      // Add to front
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);

      localStorage.setItem(KEY, JSON.stringify(updated));
      setViewed(updated);
    } catch {}
  };

  const getOthers = (currentId: number): ViewedProduct[] => {
    return viewed.filter((p) => p.id !== currentId);
  };

  return { viewed, addProduct, getOthers };
}