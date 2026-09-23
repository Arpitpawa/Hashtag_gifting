-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableFonts" TEXT[] DEFAULT ARRAY[]::TEXT[];
