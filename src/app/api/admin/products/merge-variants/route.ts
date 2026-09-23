import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// Folds several standalone Product rows into ProductVariant rows on one
// chosen "parent" product, then deletes the now-redundant standalone
// listings. Lets admin merge e.g. 7 separately-listed "designs" of the same
// item into one product with 7 variants, instead of managing 7 product
// pages by hand.
//
// Body: {
//   parentId: number,
//   groupName: string,                      // e.g. "Design", "Colour"
//   children: { productId: number, optionName: string }[]
// }
//
// Same safety rule as permanent-delete elsewhere in admin: a child product
// that already has a real order against it is left alone (blocked) rather
// than merged+deleted, since its standalone product page needs to keep
// existing for that order's history/links to make sense.
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parentId: number = Number(body.parentId);
    const groupName: string = (typeof body.groupName === "string" && body.groupName.trim()) || "Design";
    const children: { productId: number; optionName?: string }[] = Array.isArray(body.children) ? body.children : [];

    if (!parentId || children.length === 0) {
      return NextResponse.json({ error: "parentId and at least one child product are required" }, { status: 400 });
    }
    if (children.some((c) => Number(c.productId) === parentId)) {
      return NextResponse.json({ error: "The parent product can't also be one of the children" }, { status: 400 });
    }

    const parent = await prisma.product.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Parent product not found" }, { status: 404 });
    }

    const existingVariantCount = await prisma.productVariant.count({ where: { productId: parentId } });

    let merged = 0, blocked = 0, failed = 0;
    const blockedNames: string[] = [];

    for (let i = 0; i < children.length; i++) {
      const childId = Number(children[i].productId);
      const optionNameInput = children[i].optionName?.trim();

      try {
        const child = await prisma.product.findUnique({ where: { id: childId } });
        if (!child) { failed++; continue; }

        const hasOrders = await prisma.orderItem.findFirst({ where: { productId: childId } });
        if (hasOrders) { blocked++; blockedNames.push(child.name); continue; }

        await prisma.$transaction([
          prisma.productVariant.create({
            data: {
              productId:    parentId,
              groupName,
              optionName:   optionNameInput || child.name,
              price:        child.price,
              comparePrice: child.comparePrice,
              stock:        child.stock,
              images:       child.images,
              sku:          child.sku,
              sortOrder:    existingVariantCount + i,
            },
          }),
          prisma.review.deleteMany({ where: { productId: childId } }),
          prisma.cartItem.deleteMany({ where: { productId: childId } }),
          prisma.wishlist.deleteMany({ where: { productId: childId } }),
          prisma.product.delete({ where: { id: childId } }),
        ]);
        merged++;
      } catch (err) {
        console.error("MERGE VARIANTS — child failed:", childId, err);
        failed++;
      }
    }

    return NextResponse.json({ success: true, merged, blocked, failed, blockedNames });

  } catch (err) {
    console.error("MERGE VARIANTS ERROR:", err);
    return NextResponse.json({ error: "Merge failed" }, { status: 500 });
  }
}
