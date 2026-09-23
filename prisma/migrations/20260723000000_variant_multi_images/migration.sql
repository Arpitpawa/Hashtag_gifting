-- AlterTable: replace single ProductVariant.image with a multi-image array.
-- Preserve any existing single image by moving it into the new array first,
-- then drop the old column.
ALTER TABLE "ProductVariant" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "ProductVariant"
SET "images" = ARRAY["image"]
WHERE "image" IS NOT NULL;

ALTER TABLE "ProductVariant" DROP COLUMN "image";
