"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, Loader2, RefreshCw, X, AlertTriangle, Save } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  active: boolean;
  priority: number;
  createdAt: string;
}

const priorityConfig: Record<number, { label: string; color: string; border: string }> = {
  0: { label: "عادي", color: "text-slate-400 bg-slate-500/10", border: "border-slate-500/20" },
  1: { label: "هام", color: "text-amber-400 bg-amber-500/10", border: "border-amber-500/20" },
  2: { label: "عاجل", color: "text-rose-400 bg-rose-500/10", border: "border-rose-500/20" },
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    active: true,
    priority: 0,
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: Announcement) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        active: item.active,
        priority: item.priority,
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", content: "", active: true, priority: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    setSaving(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/announcements/${editingItem.id}` : "/api/admin/announcements";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      setShowModal(false);
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/15">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">الإعلانات</h2>
            <p className="text-[12px] text-slate-500">إدارة الإعلانات والتنبيهات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchItems}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all text-sm font-bold"
          >
            <Plus size={16} />
            إعلان جديد
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-violet-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <Megaphone size={44} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">لا توجد إعلانات نشطة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const p = priorityConfig[item.priority] || priorityConfig[0];
            return (
              <div
                key={item.id}
                className="group flex flex-col p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] card-hover relative overflow-hidden"
              >
                {/* Urgent indicator line */}
                {item.priority === 2 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500" />
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${p.color} ${p.border}`}>
                      {p.label}
                    </span>
                    {!item.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold border text-slate-400 bg-slate-500/10 border-slate-500/20">
                        غير نشط
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  {item.priority === 2 && <AlertTriangle size={14} className="text-rose-400" />}
                  {item.title}
                </h3>
                <p className="text-[12px] text-slate-400 leading-relaxed mb-4 flex-1">
                  {item.content}
                </p>

                <div className="text-[11px] text-slate-500 pt-4 border-t border-white/[0.06]">
                  نُشر في: {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "تعديل الإعلان" : "إضافة إعلان جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">عنوان الإعلان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنواناً واضحاً..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">نص الإعلان</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="محتوى التنبيه أو الإعلان..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">الأهمية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all appearance-none"
                >
                  <option value={0} className="bg-[#111827]">عادي</option>
                  <option value={1} className="bg-[#111827]">هام (يظهر بلون مميز)</option>
                  <option value={2} className="bg-[#111827]">عاجل (يظهر باللون الأحمر بأعلى القائمة)</option>
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-white/[0.05] text-violet-500 focus:ring-violet-500/20"
                />
                <div>
                  <p className="text-sm font-semibold text-white">إعلان نشط</p>
                  <p className="text-[11px] text-slate-500">سيظهر للمستخدمين مباشرة عند تفعيل هذا الخيار</p>
                </div>
              </label>

              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.content}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-gradient-to-l from-violet-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "جاري الحفظ..." : "حفظ الإعلان"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
