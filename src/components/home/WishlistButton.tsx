"use client";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";

export default function WishlistButton({ productId, className = "" }: { productId: number; className?: string }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(productId);

  return (
    <button
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(productId); }}
      className={`w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 ${className}`}
    >
      <Heart
        size={15}
        className={wishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-gray-400"}
      />
    </button>
  );
}