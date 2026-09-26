-- Tracks each "abandoned cart" episode detected by the
-- /api/cron/abandoned-cart-scan endpoint: a logged-in user's cart sat
-- untouched past the delay threshold with a phone number on file.
-- Snapshots the message text at detection time -- product/price could
-- change later, but the message that was (or will be) sent shouldn't.
CREATE TYPE "AbandonedCartAlertStatus" AS ENUM ('READY', 'SENT');

CREATE TABLE "AbandonedCartAlert" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "firstProductName" TEXT NOT NULL,
    "firstProductImage" TEXT,
    "messageText" TEXT NOT NULL,
    "status" "AbandonedCartAlertStatus" NOT NULL DEFAULT 'READY',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbandonedCartAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AbandonedCartAlert_cartId_idx" ON "AbandonedCartAlert"("cartId");
CREATE INDEX "AbandonedCartAlert_userId_idx" ON "AbandonedCartAlert"("userId");
CREATE INDEX "AbandonedCartAlert_status_idx" ON "AbandonedCartAlert"("status");

ALTER TABLE "AbandonedCartAlert" ADD CONSTRAINT "AbandonedCartAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
