-- Add a separate long-form "Product Details" description (SEO copy),
-- distinct from the existing short `description` field used as the
-- product-page tagline.
ALTER TABLE "Product" ADD COLUMN "detailsDescription" TEXT;
