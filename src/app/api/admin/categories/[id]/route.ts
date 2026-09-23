import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import slugify from "slugify";
import { invalidateCache } from "@/lib/cache";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body   = await req.json();
    const { name, description, image, parentId, showInNav, navOrder } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // Regenerate slug only if name changed
    let slug = existing.slug;
    if (name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const taken = await prisma.category.findFirst({ where: { slug, NOT: { id: Number(id) } } });
      if (taken) slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        description: description || null,
        image:       image       || null,
        parentId:    parentId    ? Number(parentId) : null,
        ...(showInNav !== undefined && { showInNav: Boolean(showInNav) }),
        ...(navOrder  !== undefined && { navOrder:  Number(navOrder) }),
      },
    });

    invalidateCache("categories"); // bust the public nav/shop cache — edits should show up right away

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("CATEGORY UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Check for products — trashed (soft-deleted) products don't count,
    // otherwise a category could get permanently stuck un-deletable just
    // because something in it was moved to Trash.
    const productCount = await prisma.product.count({
      where: { categoryId: Number(id), deletedAt: null },
    });

    if (productCount > 0) {
      return NextResponse.json({
        error: `Cannot delete — this category has ${productCount} product(s). Move them first.`,
      }, { status: 400 });
    }

    // Orphan any child categories rather than deleting them
    await prisma.category.updateMany({
      where: { parentId: Number(id) },
      data:  { parentId: null },
    });

    await prisma.category.delete({ where: { id: Number(id) } });

    invalidateCache("categories"); // bust the public nav/shop cache

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("CATEGORY DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}