"use client";

import { useEffect, useState } from "react";

export interface RealProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  badge: string | null;
}

/** Real products (from the store) for the given SKU product-type numbers, e.g. "01,15". */
export function useRealProducts(types: string, limit = 8, seed = 0) {
  const [products, setProducts] = useState<RealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/home/mix?${new URLSearchParams({ types, limit: String(limit), seed: String(seed) })}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setProducts(d.products || []); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [types, limit, seed]);
  return { products, loading };
}

/** First real product photo for each group of types (used for category tiles). */
export function useGroupImages(groups: string[]) {
  const [images, setImages] = useState<(string | null)[]>(groups.map(() => null));
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      groups.map((g, i) =>
        fetch(`/api/home/mix?${new URLSearchParams({ types: g, limit: "1", seed: String(i) })}`)
          .then((r) => r.json())
          .then((d) => (d.products?.[0]?.images?.[0] as string) || null)
          .catch(() => null)
      )
    ).then((imgs) => { if (!cancelled) setImages(imgs); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.join("|")]);
  return images;
}
