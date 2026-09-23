"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <h1 className="text-[28px] md:text-[36px] font-semibold text-[#1a1a1a] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Something went wrong
      </h1>
      <p className="text-[#666] max-w-md mb-8">We hit an unexpected problem loading this page. Please try again — if it keeps happening, contact us.</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={() => reset()} className="px-6 py-3 rounded-full bg-[#c0555a] text-white font-semibold hover:bg-[#a84449] transition-colors">
          Try again
        </button>
        <Link href="/" className="px-6 py-3 rounded-full border border-[#c0555a] text-[#c0555a] font-semibold hover:bg-[#c0555a] hover:text-white transition-colors">
          Go to home
        </Link>
      </div>
    </main>
  );
}
