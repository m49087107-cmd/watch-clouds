import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 bg-black/20 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
