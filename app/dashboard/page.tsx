import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardShell } from "@/components/dashboard-shell";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardShell user={session.user} appMode={process.env.APP_MODE ?? "demo"} />;
}
