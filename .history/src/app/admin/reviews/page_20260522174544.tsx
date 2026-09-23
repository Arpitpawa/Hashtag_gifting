"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, CheckCircle, X, Loader2 } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("PENDING");
  const [acting,  setActing]  = useState<number|null>(null);

  const load = async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/reviews?status=${filter}`);
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : (data.reviews || []));
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const act = async (id: number, status: string) => {
    setActing(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActing(null); load();
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-6">Reviews</h1>

      <div className="flex gap-2 mb-5">
        {["PENDING","APPROVED","REJECTED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
              filter === s ? "bg-[#c0555a] text-white" : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
            }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#c0555a]" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] py-16 text-center text-[#aaa] text-[14px]">
          No {filter.toLowerCase()} reviews
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[14px]">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">{r.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={s <= r.rating ? "fill-[#f4b56a] text-[#f4b56a]" : "fill-[#e8e0d5] text-[#e8e0d5]"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#555] leading-relaxed mb-2">{r.comment}</p>
                  <p className="text-[12px] text-[#aaa]">
                    Product: <span className="text-[#c0555a] capitalize">{r.product?.name}</span>
                    {" · "}{new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {r.images.map((img: string, i: number) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#e8e8e8]">
                          <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {filter === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => act(r.id, "APPROVED")} disabled={acting === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-[13px] font-semibold rounded-full hover:bg-green-600 transition-all disabled:opacity-50">
                      {acting === r.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      Approve
                    </button>
                    <button onClick={() => act(r.id, "REJECTED")} disabled={acting === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-[13px] font-semibold rounded-full hover:bg-red-600 transition-all disabled:opacity-50">
                      <X size={13} /> Reject
                    </button>
                  </div>
                )}
                {filter !== "PENDING" && (
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                    r.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>{r.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}