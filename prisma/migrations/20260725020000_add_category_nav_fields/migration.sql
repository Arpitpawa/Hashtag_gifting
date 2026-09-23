-- Lets admin control which categories show in the storefront navbar, and
-- in what order. Defaults to true/0 so existing categories keep showing
-- up exactly as they do today until an admin explicitly opts one out.
ALTER TABLE "Category" ADD COLUMN "showInNav" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Category" ADD COLUMN "navOrder" INTEGER NOT NULL DEFAULT 0;
