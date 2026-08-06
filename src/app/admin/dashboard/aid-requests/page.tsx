"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HandHeart,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AidRequest {
  id: string;
  fullName: string;
  phone: string;
  idNumber: string;
  city: string;
  address: string;
  aidType: string;
  description: string | null;
  images: string;
  status: string;
  notes: string | null;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "معلّق",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: <Clock size={14} />,
  },
  processing: {
    label: "قيد المعالجة",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    icon: <Loader2 size={14} className="animate-spin" />,
  },
  completed: {
    label: "مكتمل",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle2 size={14} />,
  },
  rejected: {
    label: "مرفوض",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: <XCircle size={14} />,
  },
};

const aidTypeLabels: Record<string, string> = {
  food: "غذاء",
  money: "مالي",
  housing: "سكن",
  medical: "طبي",
  other: "أخرى",
};

function StatusBadge({ status }: { status: string }) {
  const s = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.bg} ${s.color}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

export default function AidRequestsPage() {
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AidRequest | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/forms?${params}`);
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdate = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/forms/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });
      setSelectedRequest(null);
      fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (req: AidRequest) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditNotes(req.notes || "");
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    processing: requests.filter((r) => r.status === "processing").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/15">
            <HandHeart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">طلبات المساعدة</h2>
            <p className="text-[12px] text-slate-500">
              إدارة ومتابعة جميع طلبات المساعدة
            </p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-medium"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "", label: "الكل", count: statusCounts.all },
          { key: "pending", label: "معلّق", count: statusCounts.pending },
          { key: "processing", label: "قيد المعالجة", count: statusCounts.processing },
          { key: "completed", label: "مكتمل", count: statusCounts.completed },
          { key: "rejected", label: "مرفوض", count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all
              ${
                statusFilter === tab.key
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.key
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.04] text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={17}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
        />
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pr-12 pl-4 text-sm text-white placeholder-slate-600 input-glow transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-emerald-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <HandHeart size={44} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["الاسم", "الهاتف", "المدينة", "نوع المساعدة", "الحالة", "التاريخ", "إجراء"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-right px-5 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200">
                      {req.fullName}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 font-mono">
                      {req.phone}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {req.city}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-medium">
                        {aidTypeLabels[req.aidType] || req.aidType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-[12px] text-slate-500 tabular-nums">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetail(req)}
                        className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">تفاصيل الطلب</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "الاسم", value: selectedRequest.fullName },
                { label: "الهاتف", value: selectedRequest.phone },
                { label: "رقم الهوية", value: selectedRequest.idNumber },
                { label: "المدينة", value: selectedRequest.city },
                { label: "العنوان", value: selectedRequest.address },
                {
                  label: "نوع المساعدة",
                  value: aidTypeLabels[selectedRequest.aidType] || selectedRequest.aidType,
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-600">{item.label}</p>
                  <p className="text-sm text-slate-300">{item.value}</p>
                </div>
              ))}
            </div>

            {selectedRequest.description && (
              <div className="mb-6 space-y-1">
                <p className="text-[11px] font-semibold text-slate-600">الوصف</p>
                <p className="text-sm text-slate-400 bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  {selectedRequest.description}
                </p>
              </div>
            )}

            {/* Status Update */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-500">
                  تحديث الحالة
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white input-glow transition-all appearance-none"
                >
                  <option value="pending" className="bg-[#111827]">معلّق</option>
                  <option value="processing" className="bg-[#111827]">قيد المعالجة</option>
                  <option value="completed" className="bg-[#111827]">مكتمل</option>
                  <option value="rejected" className="bg-[#111827]">مرفوض</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-500">
                  ملاحظات
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="أضف ملاحظات..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 input-glow transition-all resize-none"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
