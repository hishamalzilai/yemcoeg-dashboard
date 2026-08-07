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
    color: "from-red-600 to-red-500",
  },
  {
    label: "طلبات المساعدة",
    href: "/admin/dashboard/aid-requests",
    icon: HandHeart,
    color: "from-slate-900 to-slate-800",
  },
  {
    label: "الأخبار",
    href: "/admin/dashboard/news",
    icon: Newspaper,
    color: "from-red-600 to-red-500",
  },
  {
    label: "الإعلانات",
    href: "/admin/dashboard/announcements",
    icon: Megaphone,
    color: "from-slate-900 to-slate-800",
  },
  {
    label: "أرقام الطوارئ",
    href: "/admin/dashboard/emergency",
    icon: Phone,
    color: "from-red-600 to-red-500",
  },
  {
    label: "الإشعارات",
    href: "/admin/dashboard/notifications",
    icon: Bell,
    color: "from-slate-900 to-slate-800",
  },
  {
    label: "الإعدادات",
    href: "/admin/dashboard/settings",
    icon: Settings,
    color: "from-slate-400 to-slate-500",
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
  const [role, setRole] = useState("superadmin");

  useEffect(() => {
    fetch("/api/admin/profile")
      .then(res => res.json())
      .then(data => {
        if (data.role) setRole(data.role);
      })
      .catch(console.error);
  }, []);

  const visibleLinks = sidebarLinks.filter(link => {
    if (role === "superadmin") return true;
    if (role === "aid_admin") {
      return ["/admin/dashboard", "/admin/dashboard/aid-requests", "/admin/dashboard/settings"].includes(link.href);
    }
    if (role === "news_admin") {
      return ["/admin/dashboard", "/admin/dashboard/news", "/admin/dashboard/announcements", "/admin/dashboard/notifications", "/admin/dashboard/settings"].includes(link.href);
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-screen w-[280px]
          bg-white/95 backdrop-blur-xl
          border-l border-slate-200
          shadow-2xl shadow-slate-200/50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-[15px] leading-tight tracking-wide">
                الجالية اليمنية
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                لوحة التحكم الإدارية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            القائمة الرئيسية
          </p>
          {visibleLinks.map((link) => {
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
                      ? "bg-red-50 text-red-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-l-full bg-gradient-to-b from-red-500 to-red-600 shadow-[0_0_8px_rgba(206,17,38,0.3)]" />
                )}

                {/* Icon container */}
                <div
                  className={`
                    relative p-2 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? `bg-gradient-to-br ${link.color} shadow-md shadow-slate-200/50`
                        : "bg-slate-100 group-hover:bg-slate-200"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"}
                  />
                </div>

                <span className="flex-1">{link.label}</span>

                {isActive && (
                  <ChevronLeft
                    size={14}
                    className="text-red-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-slate-200">
          {/* Admin Info */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">م</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">المسؤول</p>
              <p className="text-[10px] text-slate-500">مدير النظام</p>
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold w-full
        text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
    >
      <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-red-100 transition-all duration-300">
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
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

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

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch("/api/admin/forms?status=pending");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.length);
        }
      } catch (error) {
        console.error("Failed to fetch pending forms", error);
      }
    };
    
    fetchPendingCount();
    // Poll every 1 minute
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[68px]">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all duration-200"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 flex items-center gap-2">
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
          <button 
            onClick={() => router.push('/admin/dashboard/aid-requests')}
            className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all duration-200"
            title="طلبات المساعدة"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-red-500/50">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* User Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">م</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-slate-900">
                المسؤول
              </span>
              <p className="text-[10px] text-slate-500">متصل</p>
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
    <div dir="rtl" className="min-h-screen font-cairo relative bg-slate-50 text-slate-900">
      {/* Background decorative orbs (Very subtle for light mode) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[500px] h-[500px] bg-red-600 -top-40 -right-40 opacity-5" />
        <div className="orb w-[400px] h-[400px] bg-slate-900 bottom-20 -left-40 opacity-[0.03]" />
        <div className="orb w-[300px] h-[300px] bg-red-500 top-1/2 right-1/3 opacity-[0.02]" />
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
          <footer className="px-6 py-4 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
            <p className="text-center text-[11px] text-slate-500 font-bold">
              © {new Date().getFullYear()} الجالية اليمنية — جميع الحقوق محفوظة
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
