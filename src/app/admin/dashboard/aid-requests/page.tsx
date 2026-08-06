"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HandHeart,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
  FileText,
  MapPin,
  Phone,
  Hash,
  AlertCircle
} from "lucide-react";

interface AidRequest {
  id: string;
  transactionId: string | null;
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
  
  // For expandable cards
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // For editing state inside the expanded card
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const toggleExpand = (req: AidRequest) => {
    if (expandedId === req.id) {
      setExpandedId(null);
    } else {
      setExpandedId(req.id);
      setEditStatus(req.status);
      setEditNotes(req.notes || "");
    }
  };

  const handleUpdate = async (id: string) => {
    setSavingId(id);
    try {
      await fetch(`/api/admin/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });
      // Update local state without fully refetching to avoid collapsing the card
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: editStatus, notes: editNotes } : r));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    processing: requests.filter((r) => r.status === "processing").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/15">
            <HandHeart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">طلبات المساعدة</h2>
            <p className="text-[12px] text-slate-500">
              إدارة ومتابعة جميع طلبات المساعدة والمستفيدين
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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "", label: "الكل", count: statusCounts.all },
          { key: "pending", label: "معلّق", count: statusCounts.pending },
          { key: "processing", label: "قيد المعالجة", count: statusCounts.processing },
          { key: "completed", label: "مكتمل", count: statusCounts.completed },
          { key: "rejected", label: "مرفوض", count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setExpandedId(null);
            }}
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
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/[0.04] text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={17}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="ابحث بالاسم، رقم الهاتف، أو رقم المعاملة (مثال: YEM-123456)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pr-12 pl-4 text-sm text-white placeholder-slate-500 input-glow transition-all"
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-amber-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <HandHeart size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">لا توجد طلبات مطابقة للبحث</p>
          </div>
        ) : (
          requests.map((req) => {
            const isExpanded = expandedId === req.id;
            return (
              <div 
                key={req.id} 
                className={`transition-all duration-300 rounded-2xl border overflow-hidden ${
                  isExpanded 
                    ? "bg-[#161b26] border-amber-500/20 shadow-xl shadow-amber-500/5" 
                    : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.03]"
                }`}
              >
                {/* Collapsed Header */}
                <div 
                  onClick={() => toggleExpand(req)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                      <FileText size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold text-white">{req.fullName}</h3>
                        {req.transactionId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-amber-200 border border-white/[0.05] font-mono tracking-wider">
                            {req.transactionId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-400">
                        <span className="flex items-center gap-1.5"><Phone size={12} /> {req.phone}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {req.city}</span>
                        <span className="flex items-center gap-1.5"><Hash size={12} /> {aidTypeLabels[req.aidType] || req.aidType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-left hidden sm:block">
                      <p className="text-[11px] text-slate-500 mb-1">تاريخ الطلب</p>
                      <p className="text-[12px] text-slate-300 tabular-nums">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG", { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                    <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? "bg-amber-500/10 text-amber-400 rotate-180" : "bg-white/[0.04] text-slate-400"}`}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details Content */}
                {isExpanded && (
                  <div className="border-t border-white/[0.04] bg-black/20 p-5 sm:p-6 flex flex-col lg:flex-row gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    
                    {/* Left Side: Information */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-400" />
                          البيانات الشاملة
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "رقم الهوية/الجواز", value: req.idNumber },
                            { label: "العنوان التفصيلي", value: req.address },
                            { label: "نوع المساعدة", value: req.aidType },
                            { label: "تاريخ التسجيل", value: new Date(req.createdAt).toLocaleString("ar-EG") },
                          ].map((info, idx) => (
                            <div key={idx} className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                              <p className="text-[11px] text-slate-500 mb-1">{info.label}</p>
                              <p className="text-[13px] text-slate-200 font-medium">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {req.description && (
                        <div>
                          <h4 className="text-[12px] font-semibold text-slate-400 mb-2">تفاصيل الاستمارة / الوصف</h4>
                          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.03] text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {req.description}
                          </div>
                        </div>
                      )}
                      
                      {/* Note: Images rendering can be added here if needed */}
                    </div>

                    {/* Right Side: Actions (Admin Controls) */}
                    <div className="w-full lg:w-72 shrink-0 space-y-4">
                      <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
                        <h4 className="text-sm font-bold text-white mb-4">إجراءات الإدارة</h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500">حالة الطلب</label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all appearance-none"
                            >
                              <option value="pending">معلّق - في انتظار المراجعة</option>
                              <option value="processing">قيد المعالجة - جاري العمل عليه</option>
                              <option value="completed">مكتمل - تم تقديم المساعدة</option>
                              <option value="rejected">مرفوض - لا يستوفي الشروط</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500">ملاحظات إدارية (داخلية)</label>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                              placeholder="أضف ملاحظات تفيد الفريق..."
                              className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all resize-none placeholder-slate-700"
                            />
                          </div>

                          <button
                            onClick={() => handleUpdate(req.id)}
                            disabled={savingId === req.id}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                          >
                            {savingId === req.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}
                            {savingId === req.id ? "جاري التحديث..." : "تحديث الطلب"}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
