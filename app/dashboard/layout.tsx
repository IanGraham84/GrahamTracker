import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabaseServer";
import { AgentsProvider } from "@/lib/AgentsContext";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) {
    redirect("/");
  }

  return (
    <AgentsProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 sm:p-8">{children}</main>
      </div>
    </AgentsProvider>
  );
}
