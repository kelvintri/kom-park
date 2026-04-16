"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen">
      {/* Left Pane: Branding Panel */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 bg-[#1a365d]">
        {/* Abstract Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] via-[#1a365d] to-[#002045] opacity-90"></div>
        {/* Pattern Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
              <svg className="text-white text-2xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold tracking-[0.2em] uppercase text-[10px] opacity-60">Admin Portal</p>
              <h2 className="text-white font-headline font-semibold tracking-tight text-lg">University Parking</h2>
            </div>
          </div>
        </div>
        {/* Central Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-white font-headline font-extrabold text-4xl leading-tight tracking-tight mb-6">
            Institutional <br/><span className="text-[#adc7f7]">Access Control</span>
          </h1>
          <p className="text-[#86a0cd]/80 text-base leading-relaxed font-normal border-l-2 border-[#adc7f7]/30 pl-6">
            Administrative gateway for the management and oversight of campus transit infrastructure.
          </p>
        </div>
        {/* Status Indicator */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Node 01 Active</span>
          </div>
        </div>
      </section>

      {/* Right Pane: Modernized Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#ffffff] p-8 md:p-16">
        <div className="w-full max-w-sm">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-16 text-center">
            <div className="inline-flex items-center gap-3">
              <svg className="text-[#002045] text-4xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
              <h2 className="text-[#002045] font-headline font-bold tracking-tight text-xl">University Parking</h2>
            </div>
          </div>
          {/* Form Header */}
          <header className="mb-12 text-center lg:text-left">
            <h2 className="text-[#191c1e] font-headline font-bold text-3xl mb-4 tracking-tight">Administrative Sign In</h2>
            <p className="text-[#43474e] font-medium text-sm">Authorized personnel only. Please verify your identity.</p>
          </header>
          {/* Login Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Admin ID Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-[#74777f] uppercase tracking-wider px-1" htmlFor="email">
                Admin ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="text-[#74777f]/60 text-xl group-focus-within:text-[#002045] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-[#f2f4f6] text-[#191c1e] border-transparent border-2 rounded-xl focus:ring-0 focus:border-[#002045]/20 focus:bg-white transition-all placeholder:text-[#c4c6cf]/60 font-medium text-sm"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your system ID"
                  required
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-[#74777f] uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a className="text-[11px] font-bold text-[#002045] uppercase tracking-wider hover:opacity-70 transition-opacity" href="#">
                  Recovery
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-[#74777f]/60 text-xl group-focus-within:text-[#002045] transition-colors" />
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-4 bg-[#f2f4f6] text-[#191c1e] border-transparent border-2 rounded-xl focus:ring-0 focus:border-[#002045]/20 focus:bg-white transition-all placeholder:text-[#c4c6cf]/60 font-medium text-sm"
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
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-[#ffdad6] p-3 text-sm text-[#93000a]">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}
            {/* Action Button */}
            <div className="pt-4">
              <button
                className="w-full bg-[#1a365d] text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-[#1a365d]/20 hover:bg-[#002045] transition-all active:scale-[0.99] flex items-center justify-center gap-3 group"
                type="submit"
                disabled={isLoading}
              >
                <span className="tracking-wide">Access System</span>
                <svg className="text-xl group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          </form>
          {/* Support Footer */}
          <footer className="mt-20 pt-10 border-t border-[#e6e8ea] flex flex-col items-center">
            <div className="flex gap-8 mb-8">
              <a className="flex items-center gap-2 text-[#74777f] font-bold text-[10px] uppercase tracking-widest hover:text-[#002045] transition-colors" href="#">
                <svg className="text-base" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>Support</span>
              </a>
              <a className="flex items-center gap-2 text-[#74777f] font-bold text-[10px] uppercase tracking-widest hover:text-[#002045] transition-colors" href="#">
                <svg className="text-base" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
                <span>Security</span>
              </a>
            </div>
            <p className="text-[9px] text-[#74777f]/50 font-bold tracking-[0.2em] uppercase text-center">
              © 2024 University Transit Authority
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f7f9fb]"><Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
