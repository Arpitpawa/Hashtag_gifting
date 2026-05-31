import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { rateLimit }     from "@/lib/rateLimit";
import { validateImageBuffer } from "@/lib/sanitize";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`cust-upload:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Please wait a moment." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image too large. Max 8MB allowed." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    // MIME type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WEBP images are allowed." }, { status: 400 });
    }

    // Extension check — block dangerous double extensions
    const fileName = file.name.toLowerCase();
    const dangerousExts = [".php", ".js", ".exe", ".sh", ".bat", ".html", ".asp", ".jsp", ".py", ".rb"];
    if (dangerousExts.some(ext => fileName.includes(ext))) {
      return NextResponse.json({ error: "Invalid file." }, { status: 400 });
    }

    // Magic bytes verification — ensure the file is actually an image
    const buffer     = Buffer.from(await file.arrayBuffer());
    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await uploadToCloudinary(buffer, "hashtag-gifting/customizations");
    return NextResponse.json({ success: true, url: result.url, publicId: result.publicId });

  } catch (err: any) {
    console.error("CUSTOMIZATION UPLOAD ERROR:", err);
    if (err.message?.includes("not configured")) {
      return NextResponse.json({
        error: "Photo upload is not configured. Please contact support.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}