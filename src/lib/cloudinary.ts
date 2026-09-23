import { v2 as cloudinary } from "cloudinary";

// Configure lazily so missing keys don't crash at import
function getCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder = "hashtag-gifting"
): Promise<{ url: string; publicId: string }> {
  const cl = getCloudinary();
  return new Promise((resolve, reject) => {
    cl.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            width:        1200,          // Max width — enough for all product cards
            height:       1200,          // Max height — keeps square ratio
            crop:         "limit",       // Only shrinks if larger, never upscales
            quality:      "auto:best",   // Best quality auto compression
            fetch_format: "auto",        // WEBP for modern browsers, JPG for old ones
            flags:        "progressive", // Progressive JPEG — loads top to bottom visually
            strip:        true,          // Remove EXIF data (GPS, camera info) = smaller file
          }
        ]
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    ).end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const cl = getCloudinary();
    await cl.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}