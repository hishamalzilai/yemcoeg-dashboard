"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, Loader2, RefreshCw, X, AlertTriangle, Save, Image as ImageIcon } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  active: boolean;
  priority: number;
  createdAt: string;
}

const priorityConfig: Record<number, { label: string; color: string; border: string }> = {
  0: { label: "عادي", color: "text-slate-600 bg-slate-100", border: "border-slate-200" },
  1: { label: "هام", color: "text-orange-600 bg-orange-50", border: "border-orange-200" },
  2: { label: "عاجل", color: "text-red-600 bg-red-50", border: "border-red-200" },
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
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
        imageUrl: item.imageUrl || "",
        active: item.active,
        priority: item.priority,
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", content: "", imageUrl: "", active: true, priority: 0 });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert("فشل رفع الصورة: " + (data.error || "خطأ غير معروف"));
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
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
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl || null,
        }),
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">الإعلانات</h2>
            <p className="text-[12px] text-slate-500">إدارة الإعلانات والتنبيهات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchItems}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-bold"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20 hover:bg-black hover:shadow-lg transition-all text-sm font-bold"
          >
            <Plus size={16} />
            إعلان جديد
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-slate-800" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Megaphone size={44} className="mb-3 opacity-30" />
          <p className="text-sm font-bold">لا توجد إعلانات نشطة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const p = priorityConfig[item.priority] || priorityConfig[0];
            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md card-hover relative overflow-hidden"
              >
                {/* Urgent indicator line */}
                {item.priority === 2 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-500 z-10" />
                )}

                {item.imageUrl && (
                  <div className="w-full h-40 bg-slate-100 border-b border-slate-200 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${p.color} ${p.border}`}>
                        {p.label}
                      </span>
                      {!item.active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold border text-slate-500 bg-slate-100 border-slate-200">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                    {item.priority === 2 && <AlertTriangle size={14} className="text-red-600" />}
                    {item.title}
                  </h3>
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed mb-4 flex-1">
                    {item.content}
                  </p>

                  <div className="text-[11px] font-bold text-slate-400 pt-4 border-t border-slate-100">
                    نُشر في: {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? "تعديل الإعلان" : "إضافة إعلان جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">عنوان الإعلان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنواناً واضحاً..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">نص الإعلان</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="محتوى التنبيه أو الإعلان..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all resize-none shadow-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">صورة الإعلان (اختياري)</label>
                <div className="flex flex-col gap-3">
                  {formData.imageUrl && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed transition-all
                      ${uploadingImage 
                        ? 'bg-slate-100 border-slate-300 text-slate-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400'
                      }
                    `}>
                      {uploadingImage ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm font-bold">جاري الرفع...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} />
                          <span className="text-sm font-bold">اضغط لاختيار صورة</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">الأهمية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all appearance-none shadow-sm font-medium"
                >
                  <option value={0} className="bg-white">عادي</option>
                  <option value={1} className="bg-white">هام (يظهر بلون مميز)</option>
                  <option value={2} className="bg-white">عاجل (يظهر باللون الأحمر بأعلى القائمة)</option>
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-500/20"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">إعلان نشط</p>
                  <p className="text-[11px] font-medium text-slate-500">سيظهر للمستخدمين مباشرة عند تفعيل هذا الخيار</p>
                </div>
              </label>

              <button
                onClick={handleSave}
                disabled={saving || uploadingImage || !formData.title || !formData.content}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md shadow-slate-900/20 hover:bg-black hover:shadow-lg transition-all disabled:opacity-50"
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
