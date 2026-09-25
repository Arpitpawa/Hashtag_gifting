-- Free-text gift note the customer can leave at checkout, shown on the
-- order confirmation email and the admin order detail page so fulfillment
-- staff can copy it onto the physical gift card. Distinct from the existing
-- (currently unused) "notes" column, which is reserved for internal
-- admin-only notes.
ALTER TABLE "Order" ADD COLUMN "giftNote" TEXT;
