import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // Validate size — max 8MB for customization photos
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 8MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary under customization folder
    const url = await uploadToCloudinary(file, "hashtag-gifting/customization");

    return NextResponse.json({
      success: true,
      url,
      message: "Photo uploaded successfully",
    });

  } catch (err) {
    console.error("CUSTOMIZATION UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}