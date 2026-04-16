"use client";

import { redirect, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export function ProtectedRoute({
  children,
  redirectPath = "/login",
}: ProtectedRouteProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        }
      } catch (err) {
        // Ignore errors, user is not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" />
      </div>
    );
  }

  if (!session?.user) {
    redirect(redirectPath);
    return null;
  }

  return <>{children}</>;
}
