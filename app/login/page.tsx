import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/components/login-form";
import { authOptions } from "@/lib/auth/options";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="eyebrow">KOM PARK</div>
        <h1>Sistem Parkir Kampus</h1>
        <p>Login admin untuk mengakses dashboard demo, simulator gate, dan log parkir.</p>
        <LoginForm />
        <div className="login-hint">
          <span>Email demo:</span> admin@kompark.local
          <br />
          <span>Password demo:</span> Admin123!
        </div>
      </section>
    </main>
  );
}
