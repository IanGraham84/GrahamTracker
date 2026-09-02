import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabaseServer";
import LoginForm from "@/components/LoginForm";

export default async function Home() {
  const user = await requireAdmin();
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
