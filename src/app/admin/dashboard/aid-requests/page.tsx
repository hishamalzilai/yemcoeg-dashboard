"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  AlertCircle,
  Download,
  Trash2,
  BellRing,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import * as XLSX from "xlsx";

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
    color: "text-slate-600",
    bg: "bg-slate-100 border-slate-200",
    icon: <Clock size={14} />,
  },
  processing: {
    label: "قيد المعالجة",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <Loader2 size={14} className="animate-spin" />,
  },
  completed: {
    label: "مكتمل",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 size={14} />,
  },
  rejected: {
    label: "مرفوض",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${s.bg} ${s.color}`}
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

  // Pagination (20 per page, handled by the API)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // "Delete all data" dialog
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wipeText, setWipeText] = useState("");
  const [wiping, setWiping] = useState(false);
  const [wipeError, setWipeError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = search.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1); // new search → back to the first page
        return next;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Live updates: ids already shown, highlighted new arrivals, and a short notice
  const knownIds = useRef<Set<string>>(new Set());
  const lastTotalAll = useRef<number | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [arrivals, setArrivals] = useState(0);
  const arrivalsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // silent = background refresh: no spinner, and new requests get highlighted
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/forms?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      const items: AidRequest[] = data.items;
      if (silent) {
        const fresh = items.filter((r) => !knownIds.current.has(r.id)).map((r) => r.id);
        if (fresh.length > 0) setNewIds(new Set(fresh));
        const added = lastTotalAll.current === null ? 0 : (data.counts?.all ?? 0) - lastTotalAll.current;
        if (added > 0) {
          setArrivals(added);
          if (arrivalsTimer.current) clearTimeout(arrivalsTimer.current);
          arrivalsTimer.current = setTimeout(() => setArrivals(0), 8000);
        }
      }
      for (const r of items) knownIds.current.add(r.id);
      lastTotalAll.current = data.counts?.all ?? null;
      setRequests(items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
      setCounts(data.counts);
      if (data.page !== page) setPage(data.page);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Background refresh every 15s while the tab is visible (paused while saving or in the delete dialog)
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible" && !savingId && !wipeOpen) fetchRequests(true);
    };
    const id = setInterval(tick, 15_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [fetchRequests, savingId, wipeOpen]);

  const goToPage = (p: number) => {
    setExpandedId(null);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWipe = async () => {
    setWiping(true);
    setWipeError("");
    try {
      const res = await fetch("/api/admin/forms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE_ALL_AID_REQUESTS" }),
      });
      if (!res.ok) throw new Error();
      setWipeOpen(false);
      setWipeText("");
      setExpandedId(null);
      setStatusFilter("");
      setSearch("");
      if (page === 1) fetchRequests();
      else setPage(1);
    } catch {
      setWipeError("تعذّر حذف البيانات، حاول مرة أخرى.");
    } finally {
      setWiping(false);
    }
  };

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
    all: counts.all ?? 0,
    pending: counts.pending ?? 0,
    processing: counts.processing ?? 0,
    completed: counts.completed ?? 0,
    rejected: counts.rejected ?? 0,
  };

  const exportToExcel = async () => {
    // Export every request matching the current filters, not just the visible page
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    let allRequests: AidRequest[] = [];
    try {
      const res = await fetch(`/api/admin/forms?${params}`);
      if (!res.ok) throw new Error();
      allRequests = await res.json();
    } catch (e) {
      console.error(e);
      alert("تعذّر تحميل الطلبات للتصدير");
      return;
    }

    const formattedData = allRequests.map(req => {
      let imageLinks = "لا يوجد";
      try {
        const parsedImages = JSON.parse(req.images);
        if (parsedImages && parsedImages.length > 0) {
          imageLinks = parsedImages.join(" \n ");
        }
      } catch (e) {
        // ignore
      }

      return {
        "رقم المعاملة": req.transactionId || "غير متوفر",
        "الاسم الكامل": req.fullName,
        "رقم الهاتف": req.phone,
        "رقم الهوية/الجواز": req.idNumber,
        "المدينة": req.city,
        "العنوان التفصيلي": req.address,
        "نوع المساعدة": aidTypeLabels[req.aidType] || req.aidType,
        "الحالة": statusConfig[req.status]?.label || req.status,
        "تفاصيل الاستمارة": req.description || "لا يوجد",
        "روابط المرفقات": imageLinks,
        "تاريخ التسجيل": new Date(req.createdAt).toLocaleString("ar-EG"),
        "ملاحظات الإدارة": req.notes || "لا يوجد",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Add custom column widths
    worksheet["!cols"] = [
      { wch: 15 }, // رقم المعاملة
      { wch: 25 }, // الاسم
      { wch: 15 }, // الهاتف
      { wch: 15 }, // الهوية
      { wch: 15 }, // المدينة
      { wch: 30 }, // العنوان
      { wch: 15 }, // نوع المساعدة
      { wch: 15 }, // الحالة
      { wch: 50 }, // الوصف
      { wch: 40 }, // روابط المرفقات
      { wch: 20 }, // التاريخ
      { wch: 30 }, // ملاحظات
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "طلبات المساعدة");
    
    // Set RTL direction if supported by the viewer
    if (!workbook.Workbook) workbook.Workbook = { Views: [{ RTL: true }] };
    
    XLSX.writeFile(workbook, `طلبات_المساعدة_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
            <HandHeart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">طلبات المساعدة</h2>
            <p className="text-[12px] text-slate-500">
              إدارة ومتابعة جميع طلبات المساعدة والمستفيدين
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setWipeText("");
              setWipeError("");
              setWipeOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all text-sm font-bold"
          >
            <Trash2 size={16} />
            حذف جميع البيانات
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all text-sm font-bold"
          >
            <Download size={16} />
            تصدير إلى Excel
          </button>
          <button
            onClick={() => fetchRequests()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-bold"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* New requests notice */}
      {arrivals > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 text-sm font-bold">
          <BellRing size={18} />
          {arrivals === 1 ? "وصل طلب مساعدة جديد" : `وصل ${arrivals} طلبات مساعدة جديدة`}
          {(page !== 1 || statusFilter || debouncedSearch) && (
            <button
              onClick={() => {
                setArrivals(0);
                setStatusFilter("");
                setSearch("");
                goToPage(1);
              }}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              عرض
            </button>
          )}
        </div>
      )}

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
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all
              ${
                statusFilter === tab.key
                  ? "bg-slate-800 text-white border border-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
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
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="ابحث بالاسم، رقم الهاتف، أو رقم المعاملة (مثال: 123456)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pr-12 pl-4 text-sm text-slate-900 placeholder-slate-400 input-glow transition-all"
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-red-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <HandHeart size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">لا توجد طلبات مطابقة للبحث</p>
          </div>
        ) : (
          requests.map((req) => {
            const isExpanded = expandedId === req.id;
            return (
              <div 
                key={req.id} 
                className={`transition-all duration-300 rounded-2xl border overflow-hidden ${
                  isExpanded 
                    ? "bg-slate-50 border-slate-300 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                } ${newIds.has(req.id) ? "ring-2 ring-emerald-400 ring-offset-2" : ""}`}
                onMouseEnter={() => {
                  if (newIds.has(req.id)) setNewIds((prev) => { const next = new Set(prev); next.delete(req.id); return next; });
                }}
              >
                {/* Collapsed Header */}
                <div 
                  onClick={() => toggleExpand(req)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                      <FileText size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{req.fullName}</h3>
                        {req.transactionId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono tracking-wider">
                            {req.transactionId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Phone size={12} /> {req.phone}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {req.city}</span>
                        <span className="flex items-center gap-1.5"><Hash size={12} /> {aidTypeLabels[req.aidType] || req.aidType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-left hidden sm:block">
                      <p className="text-[11px] text-slate-500 mb-1 font-semibold">تاريخ الطلب</p>
                      <p className="text-[12px] text-slate-700 tabular-nums font-bold">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG", { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                    <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? "bg-red-50 text-red-600 rotate-180" : "bg-slate-100 text-slate-400"}`}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white p-5 sm:p-6 flex flex-col lg:flex-row gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    
                    {/* Left Side: Information */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-600" />
                          البيانات الشاملة
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "رقم الهوية/الجواز", value: req.idNumber },
                            { label: "العنوان التفصيلي", value: req.address },
                            { label: "نوع المساعدة", value: req.aidType },
                            { label: "تاريخ التسجيل", value: new Date(req.createdAt).toLocaleString("ar-EG") },
                          ].map((info, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <p className="text-[11px] text-slate-500 mb-1 font-semibold">{info.label}</p>
                              <p className="text-[13px] text-slate-900 font-bold">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {req.description && (
                        <div>
                          <h4 className="text-[12px] font-bold text-slate-600 mb-2">تفاصيل الاستمارة / الوصف</h4>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {req.description}
                          </div>
                        </div>
                      )}
                      
                      {(() => {
                        let parsedImages: string[] = [];
                        try {
                          parsedImages = JSON.parse(req.images);
                        } catch (e) {
                          parsedImages = [];
                        }

                        if (parsedImages.length > 0) {
                          return (
                            <div>
                              <h4 className="text-[12px] font-bold text-slate-600 mb-2">المرفقات والصور</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {parsedImages.map((url, idx) => (
                                  <a 
                                    key={idx} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block relative rounded-xl overflow-hidden border border-slate-200 group aspect-square bg-slate-100"
                                  >
                                    <img 
                                      src={url} 
                                      alt="مرفق" 
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Right Side: Actions (Admin Controls) */}
                    <div className="w-full lg:w-72 shrink-0 space-y-4">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">إجراءات الإدارة</h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-600">حالة الطلب</label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:border-red-500 outline-none transition-all appearance-none font-medium shadow-sm"
                            >
                              <option value="pending">معلّق - في انتظار المراجعة</option>
                              <option value="processing">قيد المعالجة - جاري العمل عليه</option>
                              <option value="completed">مكتمل - تم تقديم المساعدة</option>
                              <option value="rejected">مرفوض - لا يستوفي الشروط</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-600">ملاحظات إدارية (داخلية)</label>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                              placeholder="أضف ملاحظات تفيد الفريق..."
                              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:border-red-500 outline-none transition-all resize-none placeholder-slate-400 font-medium shadow-sm"
                            />
                          </div>

                          <button
                            onClick={() => handleUpdate(req.id)}
                            disabled={savingId === req.id}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50"
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

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[12px] text-slate-500 font-semibold tabular-nums">
            عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} من {total} طلب
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
                السابق
              </button>
              <span className="px-3 text-[13px] text-slate-700 font-bold tabular-nums">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                التالي
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete-all confirmation dialog */}
      {wipeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => !wiping && setWipeOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900">حذف جميع البيانات</h3>
              </div>
              <button
                onClick={() => setWipeOpen(false)}
                disabled={wiping}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-[13px] text-rose-800 leading-relaxed font-medium space-y-1">
              <p>سيتم حذف <b>جميع طلبات المساعدة</b> بكل حالاتها مع الصور المرفقة بها <b>نهائياً</b>.</p>
              <p>لا يمكن التراجع عن هذه العملية.</p>
            </div>

            <button
              onClick={exportToExcel}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all text-sm font-bold"
            >
              <Download size={16} />
              احفظ نسخة Excel قبل الحذف
            </button>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-600">
                للتأكيد اكتب كلمة <span className="text-rose-600">حذف</span>
              </label>
              <input
                type="text"
                value={wipeText}
                onChange={(e) => setWipeText(e.target.value)}
                disabled={wiping}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:border-rose-500 outline-none transition-all"
              />
            </div>

            {wipeError && <p className="text-[12px] text-rose-600 font-bold">{wipeError}</p>}

            <button
              onClick={handleWipe}
              disabled={wipeText.trim() !== "حذف" || wiping}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {wiping ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {wiping ? "جاري الحذف..." : "حذف جميع البيانات نهائياً"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
