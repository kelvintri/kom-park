"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Shield, Lock, Eye, EyeOff, Badge } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoNote, setShowDemoNote] = useState(true);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            router.push(callbackUrl);
          }
        }
      } catch (err) {
        // Ignore errors, user is not authenticated
      }
    };
    checkAuth();
  }, [router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#001b3c] min-h-screen flex items-center justify-center p-6 antialiased font-sans relative">
      {/* Demo Mode Note */}
      {showDemoNote && (
        <div className="absolute top-4 right-4 bg-[#ffddba] border border-[#ffddba]/50 rounded-lg px-4 py-3 shadow-lg max-w-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-[#2b1700] text-xs font-bold uppercase tracking-wider mb-1">Demo Mode</p>
              <p className="text-[#2b1700] text-sm mb-2">
                System is running in demo mode. Use these credentials:
              </p>
              <div className="bg-[#fff8f0] rounded px-3 py-2 mb-2 font-mono text-xs">
                <p className="text-[#2b1700]">admin@campusparking.com</p>
                <p className="text-[#2b1700]">admin123</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemoNote(false)}
              className="text-[#2b1700]/60 hover:text-[#2b1700] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <main className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-white/10">
        <div className="p-8 md:p-12">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f2f4f6] rounded-xl mb-6 border border-[#e6e8ea]">
              <Shield className="text-[#002045] text-3xl" />
            </div>
            <h1 className="font-['Playfair Display'] text-4xl font-black text-[#191c1e] mb-2 tracking-tight">Login Sistem Parkir</h1>
            <p className="text-[#43474e] font-sans font-semibold uppercase tracking-[0.15em] text-[11px] opacity-80">ITB STIKOM BALI</p>
          </header>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#74777f] uppercase tracking-widest px-1 font-sans" htmlFor="email">
                Admin ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Badge className="text-[#74777f]/60 text-xl group-focus-within:text-[#002045] transition-colors" />
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-[#f2f4f6] text-[#191c1e] border-transparent border rounded-xl focus:ring-0 focus:border-[#002045]/30 focus:bg-white transition-all placeholder:text-[#c4c6cf]/60 font-medium text-sm"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="System Identifier"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-[#74777f] uppercase tracking-widest font-sans" htmlFor="password">
                  Security Key
                </label>
                <a className="text-[10px] font-bold text-[#002045] uppercase tracking-widest hover:underline transition-all font-sans" href="#">
                  Reset
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-[#74777f]/60 text-xl group-focus-within:text-[#002045] transition-colors" />
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-4 bg-[#f2f4f6] text-[#191c1e] border-transparent border rounded-xl focus:ring-0 focus:border-[#002045]/30 focus:bg-white transition-all placeholder:text-[#c4c6cf]/60 font-medium text-sm"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#74777f]/60 hover:text-[#191c1e] transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-xl" />
                  ) : (
                    <Eye className="text-xl" />
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button
                className="w-full bg-[#1a365d] text-white font-sans font-bold py-3 rounded-xl shadow-xl shadow-[#1a365d]/20 hover:bg-[#002045] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group uppercase tracking-widest text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
          <footer className="mt-12 pt-8 border-t border-[#e0e3e5] flex flex-col items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-[#f2f4f6] rounded border border-[#e6e8ea]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[#43474e]/70 text-[8px] font-bold tracking-[0.2em] uppercase">Systems Running</span>
              </div>
              <p className="text-[9px] text-[#74777f]/40 font-bold tracking-[0.25em] uppercase text-center mt-2">
                © 2026 Kom-Park Team
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#001b3c]"><Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
