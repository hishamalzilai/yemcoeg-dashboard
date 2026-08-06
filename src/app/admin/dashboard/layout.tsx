"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  HandHeart,
  Megaphone,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Bell,
} from "lucide-react";

const sidebarLinks = [
  {
    label: "لوحة التحكم",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "from-emerald-400 to-teal-500",
    glowColor: "emerald",
  },
  {
    label: "طلبات المساعدة",
    href: "/admin/dashboard/aid-requests",
    icon: HandHeart,
    color: "from-amber-400 to-orange-500",
    glowColor: "amber",
  },
  {
    label: "الأخبار",
    href: "/admin/dashboard/news",
    icon: Newspaper,
    color: "from-cyan-400 to-blue-500",
    glowColor: "cyan",
  },
  {
    label: "الإعلانات",
    href: "/admin/dashboard/announcements",
    icon: Megaphone,
    color: "from-violet-400 to-purple-500",
    glowColor: "violet",
  },
  {
    label: "أرقام الطوارئ",
    href: "/admin/dashboard/emergency",
    icon: Phone,
    color: "from-rose-400 to-pink-500",
    glowColor: "rose",
  },
  {
    label: "الإعدادات",
    href: "/admin/dashboard/settings",
    icon: Settings,
    color: "from-slate-400 to-slate-500",
    glowColor: "emerald",
  },
];

function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-screen w-[280px]
          bg-[#0b1222]/90 backdrop-blur-xl
          border-l border-white/[0.06]
          shadow-2xl shadow-black/40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield size={20} className="text-white" />
              </div>
              {/* Glow pulse behind logo */}
              <div className="absolute inset-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-30 blur-md animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-white text-[15px] leading-tight tracking-wide">
                الجالية اليمنية
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                لوحة التحكم الإدارية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">
            القائمة الرئيسية
          </p>
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin/dashboard" &&
                pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium
                  transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-white/[0.07] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-l-full bg-gradient-to-b from-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}

                {/* Icon container */}
                <div
                  className={`
                    relative p-2 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? `bg-gradient-to-br ${link.color} shadow-lg shadow-emerald-500/10`
                        : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"}
                  />
                  {/* Icon glow on active */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${link.color} opacity-30 blur-md`} />
                  )}
                </div>

                <span className="flex-1">{link.label}</span>

                {isActive && (
                  <ChevronLeft
                    size={14}
                    className="text-emerald-400/70"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          {/* Admin Info */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <span className="text-white text-xs font-bold">م</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">المسؤول</p>
              <p className="text-[10px] text-slate-600">مدير النظام</p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full
        text-slate-500 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all duration-300 group"
    >
      <div className="p-2 rounded-xl bg-white/[0.04] group-hover:bg-rose-500/10 transition-all duration-300">
        <LogOut size={16} className={loading ? "animate-spin" : ""} />
      </div>
      <span>{loading ? "جاري الخروج..." : "تسجيل الخروج"}</span>
    </button>
  );
}

function TopHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0b1222]/60 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[68px]">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all duration-200"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
              مرحباً بك
              <span className="text-xl">👋</span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              {currentTime || "لوحة تحكم الجالية اليمنية"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all duration-200">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/[0.06] hidden sm:block" />

          {/* User Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/15">
                <span className="text-white text-xs font-bold">م</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b1222] shadow-sm shadow-emerald-400/50" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold text-slate-200">
                المسؤول
              </span>
              <p className="text-[10px] text-slate-600">متصل</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen font-cairo relative">
      {/* Background decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[500px] h-[500px] bg-emerald-600 -top-40 -right-40" />
        <div className="orb w-[400px] h-[400px] bg-cyan-600 bottom-20 -left-40" />
        <div className="orb w-[300px] h-[300px] bg-violet-600 top-1/2 right-1/3 opacity-10" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header */}
          <TopHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 dot-pattern">
            {children}
          </main>

          {/* Footer */}
          <footer className="px-6 py-4 border-t border-white/[0.04] bg-[#0b1222]/40 backdrop-blur-sm">
            <p className="text-center text-[11px] text-slate-600 font-medium">
              © {new Date().getFullYear()} الجالية اليمنية — جميع الحقوق محفوظة
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
