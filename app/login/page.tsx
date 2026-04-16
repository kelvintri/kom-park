"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
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
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-b from-[#1a365d] to-[#002045]">
        {/* Decorative Architectural Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <img
            className="w-full h-full object-cover grayscale"
            src="/stitch/architectural-bg.jpg"
            alt="Fine line architectural drawing of a historic university campus library"
          />
        </div>
        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              <svg className="text-white text-3xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black tracking-widest uppercase text-xs opacity-80">Academic Authority</p>
              <h2 className="text-white font-headline font-extrabold tracking-tighter text-xl">University Parking Services</h2>
            </div>
          </div>
        </div>
        {/* Central Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-white font-headline font-extrabold text-5xl leading-[1.1] tracking-tight mb-6">
            Campus Parking Authority: <span className="text-[#adc7f7]">Secure Administrative Access</span>
          </h1>
          <p className="text-[#86a0cd] text-lg leading-relaxed font-medium">
            Managing the architectural flow of campus transit with precision and institutional integrity.
          </p>
        </div>
        {/* Footer Branding/Status */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f2e00]/30 backdrop-blur-md rounded-full border border-[#ffddba]/20">
            <span className="w-2 h-2 rounded-full bg-[#ffddba] shadow-[0_0_8px_rgba(255,221,186,0.8)]"></span>
            <span className="text-[#ffddba] text-xs font-bold tracking-wide uppercase">System Operational: Administrative Node 01</span>
          </div>
        </div>
      </section>

      {/* Right Pane: Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#f7f9fb] p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden mb-12 flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="text-[#002045] text-5xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
              <h2 className="text-[#002045] font-headline font-extrabold tracking-tighter text-2xl">Campus Parking</h2>
            </div>
          </div>
          {/* Form Header */}
          <header className="mb-10 text-center lg:text-left">
            <h2 className="text-[#191c1e] font-headline font-bold text-3xl mb-3 tracking-tight">Administrative Sign In</h2>
            <p className="text-[#43474e] font-medium">Please enter your institutional credentials to proceed.</p>
          </header>
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email / NIM Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#43474e] px-1" htmlFor="email">
                Email or NIM (University ID)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-[#74777f] text-xl group-focus-within:text-[#002045] transition-colors" />
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-[#ffffff] text-[#191c1e] border-none rounded-xl focus:ring-0 focus:bg-[#f7f9fb] transition-all placeholder:text-[#c4c6cf] font-medium shadow-sm"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. administrator@university.edu"
                  required
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#002045] transition-all duration-300 group-focus-within:w-full rounded-full"></div>
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-[#43474e]" htmlFor="password">
                  Password
                </label>
                <a className="text-xs font-bold text-[#002045] hover:underline transition-all" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-[#74777f] text-xl group-focus-within:text-[#002045] transition-colors" />
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-4 bg-[#ffffff] text-[#191c1e] border-none rounded-xl focus:ring-0 focus:bg-[#f7f9fb] transition-all placeholder:text-[#c4c6cf] font-medium shadow-sm"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#74777f] hover:text-[#191c1e] transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-xl" />
                  ) : (
                    <Eye className="text-xl" />
                  )}
                </button>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#002045] transition-all duration-300 group-focus-within:w-full rounded-full"></div>
              </div>
            </div>
            {/* Remember Me & Policy */}
            <div className="flex items-center py-2">
              <div className="flex items-center h-5">
                <input
                  className="h-5 w-5 text-[#002045] focus:ring-[#002045] border-[#c4c6cf] rounded-lg transition-all"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-[#43474e]" htmlFor="remember-me">
                  Remember this session for 30 days
                </label>
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
            <div className="pt-2">
              <button
                className="w-full bg-[#1a365d] text-white font-headline font-bold py-4 rounded-xl shadow-[0_2px_10px_rgba(26,54,93,0.2)] hover:bg-[#002045] transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </>
                )}
                <div className="absolute top-0 inset-x-0 h-px bg-white/10"></div>
              </button>
            </div>
          </form>
          {/* Help & Footer Links */}
          <footer className="mt-12 pt-8 border-t border-[#c4c6cf]/15 flex flex-col items-center gap-6">
            <p className="text-sm text-[#43474e] font-medium">Need administrative support?</p>
            <div className="flex gap-6">
              <a className="flex items-center gap-2 text-[#002045] font-bold text-xs hover:opacity-80 transition-opacity" href="#">
                <svg className="text-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>Support Center</span>
              </a>
              <a className="flex items-center gap-2 text-[#002045] font-bold text-xs hover:opacity-80 transition-opacity" href="#">
                <svg className="text-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
                </svg>
                <span>System Help</span>
              </a>
            </div>
            <p className="text-[0.65rem] text-[#74777f] font-medium tracking-wide uppercase mt-4">
              © 2024 University Parking Services. All Rights Reserved.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
