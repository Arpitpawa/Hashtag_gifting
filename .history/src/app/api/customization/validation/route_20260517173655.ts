import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, customization } = await req.json();

    const product = await prisma.product.findUnique({
      where:  { id: Number(productId) },
      select: {
        customizable:        true,
        customizationFields: true,
        name:                true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.customizable) {
      return NextResponse.json({ valid: true }); // No customization needed
    }

    const fields  = product.customizationFields as any[] || [];
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const value = customization?.[field.type];

      if (field.required && (!value || value.toString().trim() === "")) {
        errors[field.type] = `${field.label} is required`;
        continue;
      }

      if (value && field.maxLength && value.toString().length > field.maxLength) {
        errors[field.type] = `${field.label} must be under ${field.maxLength} characters`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ valid: false, errors }, { status: 400 });
    }

    return NextResponse.json({ valid: true });

  } catch (err) {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}