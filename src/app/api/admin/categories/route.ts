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

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { parentId: null }, // top-level; children come nested below
    include: {
      // Trashed (soft-deleted) products shouldn't count towards "this
      // category has products" — otherwise a category can get stuck
      // un-deletable just because something in it was moved to Trash.
      _count:   { select: { products: { where: { deletedAt: null } }, productCategories: { where: { product: { deletedAt: null } } } } },
      children: {
        include: { _count: { select: { products: { where: { deletedAt: null } }, productCategories: { where: { product: { deletedAt: null } } } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  // Multi-category products count in every category they belong to.
  const fix = (c: any) => ({ ...c, _count: { products: Math.max(c._count.products, c._count.productCategories) } });
  return NextResponse.json(categories.map((c: any) => ({ ...fix(c), children: c.children.map(fix) })));
}

export async function POST(req: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, image, parentId, showInNav, navOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,           // Cloudinary URL
        parentId:  parentId ? Number(parentId) : null,
        showInNav: showInNav !== undefined ? Boolean(showInNav) : true,
        navOrder:  navOrder !== undefined ? Number(navOrder) : 0,
      },
    });

    invalidateCache("categories"); // bust the public nav/shop cache — new category should show up right away

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}