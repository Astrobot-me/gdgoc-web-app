import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import {} from "@auth"


type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {

  // const {} = await 

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,188,4,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(66,133,244,0.12),_transparent_24%),linear-gradient(180deg,#f8fafc,#f5f7fb)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(66,133,244,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(52,168,83,0.12),_transparent_24%),linear-gradient(180deg,#07111d,#0f172a)]">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
