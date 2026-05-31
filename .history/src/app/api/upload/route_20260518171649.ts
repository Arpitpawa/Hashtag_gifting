import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ── ADMIN ONLY — general upload ──
  const { error } = await requireAdmin();
  if (error) return error;

  // ── RATE LIMIT ──
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`upload:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const folder   = (formData.get("folder") as string) || "hashtag-gifting/products";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP and GIF files are allowed" },
        { status: 400 }
      );
    }

    // Validate size — max 5MB for admin uploads
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Validate folder whitelist
    const allowedFolders = [
      "hashtag-gifting/products",
      "hashtag-gifting/categories",
      "hashtag-gifting/banners",
      "hashtag-gifting/reviews",
    ];

    const safeFolder = allowedFolders.includes(folder)
      ? folder
      : "hashtag-gifting/products";

    const url = await uploadToCloudinary(file, safeFolder);

    return NextResponse.json({ success: true, url });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}