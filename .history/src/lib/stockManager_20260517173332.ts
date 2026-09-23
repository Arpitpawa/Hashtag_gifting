import prisma from "@/lib/prisma";

export interface StockReservation {
  productId: number;
  quantity:  number;
}

/**
 * Atomically deduct stock using DB transactions + row-level locking.
 * Prevents overselling when multiple users buy simultaneously.
 */
export async function deductStockSafely(
  reservations: StockReservation[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const { productId, quantity } of reservations) {
        // SELECT ... FOR UPDATE — locks the row while we check + update
        // This prevents another transaction from reading stale stock
        const result = await tx.$queryRaw<Array<{ stock: number; name: string }>>`
          SELECT stock, name
          FROM "Product"
          WHERE id = ${productId}
          FOR UPDATE
        `;

        const product = result[0];

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (product.stock < quantity) {
          throw new Error(
            `Only ${product.stock} unit(s) of "${product.name}" available. Please update your cart.`
          );
        }

        // Safe to deduct now — row is locked
        await tx.product.update({
          where: { id: productId },
          data:  { stock: { decrement: quantity } },
        });
      }
    }, {
      isolationLevel: "Serializable", // Highest isolation — no phantom reads
      timeout: 10000, // 10 second timeout
    });

    return { success: true };

  } catch (err: any) {
    return {
      success: false,
      error:   err?.message || "Stock reservation failed",
    };
  }
}

/**
 * Restore stock — used when order is cancelled
 */
export async function restoreStock(
  reservations: StockReservation[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const { productId, quantity } of reservations) {
      await tx.product.update({
        where: { id: productId },
        data:  { stock: { increment: quantity } },
      });
    }
  });
}

/**
 * Check stock availability without locking
 * Use this for validation before showing checkout
 */
export async function checkStockAvailability(
  reservations: StockReservation[]
): Promise<{
  available: boolean;
  issues: Array<{ productId: number; name: string; requested: number; available: number }>;
}> {
  const issues = [];

  for (const { productId, quantity } of reservations) {
    const product = await prisma.product.findUnique({
      where:  { id: productId },
      select: { stock: true, name: true },
    });

    if (!product || product.stock < quantity) {
      issues.push({
        productId,
        name:      product?.name || "Unknown",
        requested: quantity,
        available: product?.stock || 0,
      });
    }
  }

  return {
    available: issues.length === 0,
    issues,
  };
}