import { redirect }          from "next/navigation";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/app/api/auth/[...nextauth]/options";
import AdminSidebar          from "@/components/admin/AdminSidebar";
import AdminHeader           from "@/components/admin/AdminHeader";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <AdminSidebar />
      <div className="flex-1 min-w-0 lg:ml-[240px] flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}