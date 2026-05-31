import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { rateLimit }     from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Rate limit per IP — 20 uploads per minute
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`customization-upload:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Please wait a moment." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WEBP images are allowed" }, { status: 400 });
    }

    // Validate file size — max 8MB for customer photos
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
    }

    // Upload to Cloudinary in customizations folder
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "hashtag-gifting/customizations");

    return NextResponse.json({
      success:  true,
      url:      result.url,
      publicId: result.publicId,
    });

  } catch (err: any) {
    console.error("CUSTOMIZATION UPLOAD ERROR:", err);

    // Give helpful error if Cloudinary keys missing
    if (err.message?.includes("not configured")) {
      return NextResponse.json({
        error: "Photo upload is not configured yet. Please ask admin to set up Cloudinary.",
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}