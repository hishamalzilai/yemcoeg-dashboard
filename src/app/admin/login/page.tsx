"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-cairo px-4"
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[600px] h-[600px] bg-emerald-600 -top-60 -right-60 opacity-20" />
        <div className="orb w-[500px] h-[500px] bg-cyan-600 -bottom-40 -left-40 opacity-15" />
        <div className="orb w-[400px] h-[400px] bg-violet-600 top-1/3 left-1/4 opacity-10" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] fade-in-up" style={{ opacity: 0 }}>
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/25 mx-auto">
              <Shield size={28} className="text-white" />
            </div>
            {/* Glow behind logo */}
            <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-30 blur-xl mx-auto" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1.5">
            الجالية اليمنية
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            تسجيل الدخول إلى لوحة التحكم
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] p-8 shadow-2xl shadow-black/20">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p className="text-[13px] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-400">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                    py-3.5 pr-12 pl-4
                    text-sm text-white placeholder-slate-600
                    input-glow transition-all duration-300
                    focus:bg-white/[0.06]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-400">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                    py-3.5 pr-12 pl-12
                    text-sm text-white placeholder-slate-600
                    input-glow transition-all duration-300
                    focus:bg-white/[0.06]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl text-[15px] font-bold text-white
                bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500
                hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400
                shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    تسجيل الدخول
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-700 mt-6 font-medium">
          © {new Date().getFullYear()} الجالية اليمنية — لوحة التحكم الإدارية
        </p>
      </div>
    </div>
  );
}
