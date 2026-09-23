"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Review {
  id:        number;
  name:      string;
  rating:    number;
  comment:   string;
  images:    string[];
  createdAt: string;
}

interface Props {
  reviews:   Review[];
  avgRating: number;
  totalCount: number;
}

export default function ProductReviewCarousel({ reviews, avgRating, totalCount }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 280, behavior: "smooth" });

  // Only show reviews that have images or are particularly notable
  const featuredReviews = reviews.filter((r) => r.images?.length > 0 || r.rating >= 4);

  if (featuredReviews.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#1a1a1a]">Customers are saying</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14}
                  className={s <= Math.round(avgRating)
                    ? "fill-[#f4b56a] text-[#f4b56a]"
                    : "fill-gray-200 text-gray-200"}
                />
              ))}
            </div>
            <span className="text-[13px] font-bold text-[#1a1a1a]">{avgRating}</span>
            <span className="text-[13px] text-[#888]">({totalCount} reviews)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
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
            {/* Review image */}
            {review.images?.[0] && (
              <div className="relative w-full h-[180px] bg-[#f8f5f0]">
                <Image
                  src={review.images[0]}
                  alt={`Review by ${review.name}`}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="260px"
                />
              </div>
            )}

            {/* Content */}
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
    </section>
  );
}