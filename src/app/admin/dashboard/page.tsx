export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  HandHeart,
  Newspaper,
  Megaphone,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowUpLeft,
  ChevronLeft,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  glowClass: string;
  subtitle?: string;
  trend?: string;
  delay: string;
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  glowClass,
  subtitle,
  trend,
  delay,
}: StatCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white border border-slate-200
        p-6 card-hover shine-hover shadow-sm
        fade-in-up ${delay}
        group
      `}
      style={{ opacity: 0 }}
    >
      {/* Background gradient glow */}
      <div
        className={`absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-500`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[12px] font-bold text-slate-500 mb-1 tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-black text-slate-900 mb-1 tabular-nums">
            {value.toLocaleString("ar-EG")}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpLeft size={12} className="text-red-600" />
              <span className="text-[11px] text-red-600 font-bold">
                {trend}
              </span>
            </div>
          )}
        </div>

        <div
          className={`
            p-3 rounded-2xl bg-gradient-to-br ${gradient}
            shadow-md ${glowClass}
            group-hover:scale-110 transition-transform duration-300
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface RecentRequest {
  id: string;
  fullName: string;
  aidType: string;
  status: string;
  city: string;
  createdAt: Date;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    pending: {
      label: "معلّق",
      color: "text-slate-600",
      bg: "bg-slate-100 border-slate-200",
    },
    processing: {
      label: "قيد المعالجة",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    completed: {
      label: "مكتمل",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    rejected: {
      label: "مرفوض",
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
    },
  };

  const s = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${s.bg} ${s.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} />
      {s.label}
    </span>
  );
}

function AidTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    food: "غذاء",
    money: "مالي",
    housing: "سكن",
    medical: "طبي",
    other: "أخرى",
  };
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-bold">
      {labels[type] || type}
    </span>
  );
}

export default async function DashboardPage() {
  const [
    pendingRequests,
    processingRequests,
    completedRequests,
    totalNews,
    activeAnnouncements,
    emergencyNumbers,
    recentRequests,
  ] = await Promise.all([
    prisma.aidRequest.count({ where: { status: "pending" } }),
    prisma.aidRequest.count({ where: { status: "processing" } }),
    prisma.aidRequest.count({ where: { status: "completed" } }),
    prisma.news.count(),
    prisma.announcement.count({ where: { active: true } }),
    prisma.emergencyNumber.count(),
    prisma.aidRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        aidType: true,
        status: true,
        city: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      title: "طلبات معلّقة",
      value: pendingRequests,
      icon: <Clock size={22} className="text-white" />,
      gradient: "from-slate-800 to-slate-900",
      glowClass: "shadow-slate-500/20",
      subtitle: "بانتظار المراجعة",
      delay: "stagger-1",
    },
    {
      title: "قيد المعالجة",
      value: processingRequests,
      icon: <TrendingUp size={22} className="text-white" />,
      gradient: "from-red-500 to-red-600",
      glowClass: "shadow-red-500/20",
      subtitle: "جاري العمل عليها",
      delay: "stagger-2",
    },
    {
      title: "طلبات مكتملة",
      value: completedRequests,
      icon: <CheckCircle2 size={22} className="text-white" />,
      gradient: "from-emerald-500 to-emerald-600",
      glowClass: "shadow-emerald-500/20",
      subtitle: "تم الإنجاز",
      delay: "stagger-3",
    },
    {
      title: "إجمالي الأخبار",
      value: totalNews,
      icon: <Newspaper size={22} className="text-white" />,
      gradient: "from-red-600 to-red-700",
      glowClass: "shadow-red-500/20",
      subtitle: "منشور",
      delay: "stagger-4",
    },
    {
      title: "إعلانات نشطة",
      value: activeAnnouncements,
      icon: <Megaphone size={22} className="text-white" />,
      gradient: "from-slate-800 to-slate-900",
      glowClass: "shadow-slate-500/20",
      subtitle: "معروضة حالياً",
      delay: "stagger-5",
    },
    {
      title: "أرقام الطوارئ",
      value: emergencyNumbers,
      icon: <Phone size={22} className="text-white" />,
      gradient: "from-red-500 to-red-600",
      glowClass: "shadow-red-500/20",
      subtitle: "مسجّل",
      delay: "stagger-1",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="fade-in-up" style={{ opacity: 0 }}>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-red-500 shadow-md shadow-red-500/15">
            <AlertTriangle size={20} className="text-white" />
          </div>
          نظرة عامة
        </h2>
        <p className="text-sm text-slate-500 mt-1 mr-12">
          ملخص سريع لأحدث البيانات والإحصائيات
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Aid Requests Table */}
      <div
        className="fade-in-up stagger-3 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm"
        style={{ opacity: 0 }}
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
              <HandHeart size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">آخر الطلبات</h3>
              <p className="text-[11px] text-slate-500">أحدث 5 طلبات مساعدة</p>
            </div>
          </div>
          <a
            href="/admin/dashboard/aid-requests"
            className="text-[12px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            عرض الكل
            <ChevronLeft size={14} />
          </a>
        </div>

        {/* Table */}
        {recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    نوع المساعدة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    المدينة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req: RecentRequest, index: number) => (
                  <tr
                    key={req.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {req.fullName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AidTypeBadge type={req.aidType} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{req.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] font-bold text-slate-500 tabular-nums">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <HandHeart size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-bold">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
