import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdmin }  from "@/lib/adminAuth";
import { rateLimit }     from "@/lib/rateLimit";
import { validateImageBuffer } from "@/lib/sanitize";

export const runtime = "nodejs";

const MAX_FILE_SIZE  = 8  * 1024 * 1024; // 8MB
const ALLOWED_TYPES  = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FOLDERS = ["products", "categories", "hashtag-gifting"];

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`upload:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Please wait." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const folder   = (formData.get("folder") as string) || "hashtag-gifting";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── 1. File size check ────────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 8MB allowed." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    // ── 2. MIME type check ────────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP and GIF images are allowed." }, { status: 400 });
    }

    // ── 3. File extension check (prevent double extensions like image.php.jpg) ─
    const fileName = file.name.toLowerCase();
    const dangerousExts = [".php", ".js", ".exe", ".sh", ".bat", ".html", ".htm", ".asp", ".jsp", ".py"];
    if (dangerousExts.some(ext => fileName.includes(ext))) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
    }

    // ── 4. Folder whitelist ───────────────────────────────────────────────────
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "hashtag-gifting";

    // ── 5. Magic bytes check (verify actual file content) ────────────────────
    const buffer     = Buffer.from(await file.arrayBuffer());
    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // ── 6. Upload to Cloudinary ───────────────────────────────────────────────
    const result = await uploadToCloudinary(buffer, safeFolder);

    return NextResponse.json({ success: true, url: result.url });

  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}