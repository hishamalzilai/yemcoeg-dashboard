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
        bg-white/[0.04] border border-white/[0.06]
        p-6 card-hover shine-hover
        fade-in-up ${delay}
        group
      `}
      style={{ opacity: 0 }}
    >
      {/* Background gradient glow */}
      <div
        className={`absolute -top-12 -left-12 w-32 h-32 rounded-full ${gradient} opacity-[0.07] blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-slate-500 mb-1 tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-black text-white mb-1 tabular-nums">
            {value.toLocaleString("ar-EG")}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-600 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpLeft size={12} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-semibold">
                {trend}
              </span>
            </div>
          )}
        </div>

        <div
          className={`
            p-3 rounded-2xl bg-gradient-to-br ${gradient}
            shadow-lg ${glowClass}
            group-hover:scale-110 transition-transform duration-300
          `}
        >
          {icon}
        </div>
      </div>

      {/* Bottom shine line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    processing: {
      label: "قيد المعالجة",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    completed: {
      label: "مكتمل",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    rejected: {
      label: "مرفوض",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  };

  const s = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.bg} ${s.color}`}
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
    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-medium">
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
      gradient: "from-amber-400 to-orange-500",
      glowClass: "shadow-amber-500/20",
      subtitle: "بانتظار المراجعة",
      delay: "stagger-1",
    },
    {
      title: "قيد المعالجة",
      value: processingRequests,
      icon: <TrendingUp size={22} className="text-white" />,
      gradient: "from-cyan-400 to-blue-500",
      glowClass: "shadow-cyan-500/20",
      subtitle: "جاري العمل عليها",
      delay: "stagger-2",
    },
    {
      title: "طلبات مكتملة",
      value: completedRequests,
      icon: <CheckCircle2 size={22} className="text-white" />,
      gradient: "from-emerald-400 to-teal-500",
      glowClass: "shadow-emerald-500/20",
      subtitle: "تم الإنجاز",
      delay: "stagger-3",
    },
    {
      title: "إجمالي الأخبار",
      value: totalNews,
      icon: <Newspaper size={22} className="text-white" />,
      gradient: "from-violet-400 to-purple-500",
      glowClass: "shadow-violet-500/20",
      subtitle: "منشور",
      delay: "stagger-4",
    },
    {
      title: "إعلانات نشطة",
      value: activeAnnouncements,
      icon: <Megaphone size={22} className="text-white" />,
      gradient: "from-rose-400 to-pink-500",
      glowClass: "shadow-rose-500/20",
      subtitle: "معروضة حالياً",
      delay: "stagger-5",
    },
    {
      title: "أرقام الطوارئ",
      value: emergencyNumbers,
      icon: <Phone size={22} className="text-white" />,
      gradient: "from-teal-400 to-emerald-500",
      glowClass: "shadow-teal-500/20",
      subtitle: "مسجّل",
      delay: "stagger-1",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="fade-in-up" style={{ opacity: 0 }}>
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/15">
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
        className="fade-in-up stagger-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
        style={{ opacity: 0 }}
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/15">
              <HandHeart size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">آخر الطلبات</h3>
              <p className="text-[11px] text-slate-600">أحدث 5 طلبات مساعدة</p>
            </div>
          </div>
          <a
            href="/admin/dashboard/aid-requests"
            className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
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
                <tr className="border-b border-white/[0.04]">
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    نوع المساعدة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    المدينة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req: RecentRequest, index: number) => (
                  <tr
                    key={req.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-200">
                        {req.fullName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AidTypeBadge type={req.aidType} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{req.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-slate-500 tabular-nums">
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
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <HandHeart size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
