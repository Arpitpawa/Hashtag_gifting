import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductForm mode="edit" productId={parseInt(id)} />;
}