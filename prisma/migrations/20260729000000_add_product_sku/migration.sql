-- Admin-only reference code so staff can tell which product/variant a
-- customer ordered at a glance in Orders/Inventory. Never exposed on
-- customer-facing pages or APIs.
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
