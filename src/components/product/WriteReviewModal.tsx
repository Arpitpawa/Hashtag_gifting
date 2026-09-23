"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { X, Star, Loader2, ImagePlus, CheckCircle } from "lucide-react";

interface Props {
  open:      boolean;
  onClose:   () => void;
  productId: number;
}

export default function WriteReviewModal({ open, onClose, productId }: Props) {
  const { data: session, status } = useSession();

  const [rating,    setRating]    = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [name,      setName]      = useState("");
  const [comment,   setComment]   = useState("");
  const [images,    setImages]    = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  if (!open) return null;

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 5 - images.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      }
      if (uploaded.length > 0) setImages((p) => [...p, ...uploaded]);
    } catch {
      setError("Image upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) return setError("Please select a star rating");
    if (!name.trim()) return setError("Please enter your name");
    if (comment.trim().length < 10) return setError("Review must be at least 10 characters");

    setSaving(true);
    try {
      const res  = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId, rating, name: name.trim(), comment: comment.trim(), images }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }
      setDone(true);
    } catch {
      setError("Failed to submit review — try again");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    setRating(0);
    setName("");
    setComment("");
    setImages([]);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-bold text-[#1a1a1a]">Write a review</h3>
          <button onClick={handleClose} className="text-[#aaa] hover:text-[#1a1a1a]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {status === "loading" ? (
          <p className="text-[13px] text-[#888] py-6 text-center">Loading...</p>
        ) : status !== "authenticated" ? (
          <div className="text-center py-6">
            <p className="text-[13px] text-[#555] mb-4">Please log in to write a review.</p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              className="inline-block px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-colors"
            >
              Log in
            </Link>
          </div>
        ) : done ? (
          <div className="text-center py-8">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Thanks for your review!</p>
            <p className="text-[12px] text-[#888]">It'll appear on the page once approved.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stars */}
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a] mb-1.5">Your rating</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                  >
                    <Star
                      size={26}
                      className={s <= (hoverStar || rating)
                        ? "fill-[#f4b56a] text-[#f4b56a]"
                        : "fill-gray-200 text-gray-200"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a] mb-1.5">Your name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full border border-[#e8e0d5] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
              />
            </div>

            {/* Comment */}
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a] mb-1.5">Your review</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did you like about this product?"
                className="w-full border border-[#e8e0d5] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors resize-none"
              />
            </div>

            {/* Photos */}
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a] mb-1.5">Add photos (optional)</p>
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e8e0d5]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#e8e0d5] flex items-center justify-center cursor-pointer hover:border-[#c0555a] transition-colors">
                    {uploading
                      ? <Loader2 size={16} className="animate-spin text-[#c0555a]" />
                      : <ImagePlus size={16} className="text-[#aaa]" />}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => e.target.files && uploadImages(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>

            {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="w-full py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : "Submit review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
