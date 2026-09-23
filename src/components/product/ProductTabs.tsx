"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import WriteReviewModal from "./WriteReviewModal";

interface Props {
  product: Product;
}

export default function ProductReviews({ product }: Props) {
  const [writeOpen, setWriteOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (product.reviews.length === 0) {
    return (
      <>
        <section id="product-reviews" className="mb-16">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-[22px] font-bold text-[#1a1a1a]">Customer Reviews</h2>
            <button
              onClick={() => setWriteOpen(true)}
              className="text-[13px] font-semibold text-white bg-[#c0555a] hover:bg-[#a84449] px-4 py-2 rounded-full transition-colors"
            >
              Write a review
            </button>
          </div>
          <p className="text-[13px] text-[#888]">No reviews yet — be the first to share your experience!</p>
        </section>
        <WriteReviewModal open={writeOpen} onClose={() => setWriteOpen(false)} productId={product.id} />
      </>
    );
  }

  // Reviews with a photo, or a strong rating, shown first.
  const featuredReviews = product.reviews.filter((r) => r.images?.length > 0 || r.rating >= 4);

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 280, behavior: "smooth" });

  return (
    <>
    <section id="product-reviews" className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-bold text-[#1a1a1a]">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14}
                  className={s <= Math.round(product.avgRating)
                    ? "fill-[#f4b56a] text-[#f4b56a]"
                    : "fill-gray-200 text-gray-200"}
                />
              ))}
            </div>
            <span className="text-[13px] font-bold text-[#1a1a1a]">{product.avgRating}</span>
            <span className="text-[13px] text-[#888]">({product.reviews.length} reviews)</span>
          </div>
        </div>
        <button
          onClick={() => setWriteOpen(true)}
          className="text-[13px] font-semibold text-white bg-[#c0555a] hover:bg-[#a84449] px-4 py-2 rounded-full transition-colors"
        >
          Write a review
        </button>
      </div>

      {/* Rating breakdown (left) + review cards (right) — bumped from lg to
          xl for the same reason as ProductClient's gallery/info split: an
          iPad Pro in portrait matches lg (1024px) and was cramming the
          rating summary into a fixed 280px column on a screen that's
          actually narrow. */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">
        {/* Summary */}
        <div className="bg-white border border-[#e8e0d5] rounded-2xl p-5 xl:self-start">
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-[#1a1a1a]">{product.avgRating}</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16}
                  className={s <= Math.round(product.avgRating)
                    ? "fill-[#f4b56a] text-[#f4b56a]"
                    : "fill-gray-200 text-gray-200"}
                />
              ))}
            </div>
            <p className="text-[12px] text-[#aaa] mt-1">Based on {product.reviews.length} reviews</p>
          </div>

          {[5,4,3,2,1].map((star) => {
            const count = product.reviews.filter((r) => r.rating === star).length;
            const pct   = Math.round((count / product.reviews.length) * 100);
            return (
              <div key={star} className="flex items-center gap-2 mb-2">
                <span className="text-[12px] text-[#555] w-3 flex-shrink-0">{star}</span>
                <Star size={11} className="fill-[#f4b56a] text-[#f4b56a] flex-shrink-0" />
                <div className="flex-1 h-2 bg-[#e8e0d5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#f4b56a] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-[#aaa] w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Review carousel */}
        {featuredReviews.length > 0 && (
          <div className="relative min-w-0">
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {featuredReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[260px] bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden group hover:shadow-md transition-shadow duration-300"
                >
                  {review.images?.[0] && (
                    <div className="relative w-full h-[160px] bg-[#f8f5f0]">
                      <Image
                        src={review.images[0]}
                        alt={`Review by ${review.name}`}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        sizes="260px"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12}
                          className={s <= review.rating
                            ? "fill-[#f4b56a] text-[#f4b56a]"
                            : "fill-gray-200 text-gray-200"}
                        />
                      ))}
                    </div>
                    <p className="text-[13px] text-[#444] leading-relaxed line-clamp-3 mb-3">
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#c0555a] rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {review.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#1a1a1a]">{review.name}</p>
                        <p className="text-[10px] text-[#aaa]">Verified buyer</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {featuredReviews.length > 1 && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={scrollLeft}
                  className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
                 aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
                 aria-label="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </section>

      <WriteReviewModal open={writeOpen} onClose={() => setWriteOpen(false)} productId={product.id} />
    </>
  );
}
