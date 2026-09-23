"use client";

import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export default function ProductReviews({ product }: Props) {
  if (product.reviews.length === 0) return null;

  return (
    <section id="product-reviews" className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-bold text-[#1a1a1a]">Customer Reviews</h2>
        <button className="text-[13px] font-semibold text-white bg-[#c0555a] hover:bg-[#a84449] px-4 py-2 rounded-full transition-colors">
          Write a review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Summary */}
        <div className="bg-white border border-[#e8e0d5] rounded-2xl p-5 lg:self-start">
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

        {/* List */}
        <div className="flex flex-col gap-4">
          {product.reviews.map((review) => (
            <div key={review.id} className="bg-white border border-[#e8e0d5] rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#c0555a] rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                    {review.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">{review.name}</p>
                      <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                        <BadgeCheck size={10} /> Verified
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11}
                          className={s <= review.rating
                            ? "fill-[#f4b56a] text-[#f4b56a]"
                            : "fill-gray-200 text-gray-200"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#aaa] flex-shrink-0">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>

              <p className="text-[13px] text-[#555] leading-relaxed">{review.comment}</p>

              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e8e0d5]">
                      <Image src={img} alt="Review" fill className="object-cover" sizes="64px" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}