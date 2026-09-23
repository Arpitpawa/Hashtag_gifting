-- Soft-delete support for Product: instead of hard-deleting, admin "delete"
-- now sets deletedAt so it can be restored from a Trash view. Permanent
-- deletion is a separate, explicit action.
ALTER TABLE "Product" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");
