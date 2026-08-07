"use client";

import { useState, useEffect } from "react";
import { Newspaper, Plus, Edit2, Trash2, Loader2, RefreshCw, X, Image as ImageIcon, Save, ChevronRight, ChevronLeft } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    published: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

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

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      const data = await res.json();
      setNews(data);
      setCurrentPage(1); // Reset to first page on refresh
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenModal = (item?: NewsItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl || "",
        published: item.published,
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", content: "", imageUrl: "", published: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    setSaving(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/news/${editingItem.id}` : "/api/admin/news";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl || null,
        }),
      });
      
      setShowModal(false);
      fetchNews();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      fetchNews();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const currentNews = news.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-md shadow-red-500/15">
            <Newspaper size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">الأخبار</h2>
            <p className="text-[12px] text-slate-500">إدارة الأخبار والمقالات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNews}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-bold"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all text-sm font-bold"
          >
            <Plus size={16} />
            خبر جديد
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-red-600" />
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Newspaper size={44} className="mb-3 opacity-30" />
          <p className="text-sm font-bold">لا توجد أخبار مضافة</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNews.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden card-hover shadow-sm hover:shadow-md"
              >
                <div className="aspect-video bg-slate-100 border-b border-slate-200 relative flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={32} className="text-slate-400" />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-red-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        item.published
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {item.published ? "منشور" : "مسودة"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[12px] font-medium text-slate-600 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
              <span className="text-sm font-bold text-slate-700">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? "تعديل الخبر" : "إضافة خبر جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">عنوان الخبر</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنواناً واضحاً..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  placeholder="تفاصيل الخبر..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all resize-none shadow-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">صورة الخبر (اختياري)</label>
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
                        ? 'bg-red-50 border-red-300 text-red-600' 
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

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-red-600 focus:ring-red-500/20"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">نشر الخبر</p>
                  <p className="text-[11px] font-medium text-slate-500">سيظهر الخبر للمستخدمين في التطبيق مباشرة</p>
                </div>
              </label>

              <button
                onClick={handleSave}
                disabled={saving || uploadingImage || !formData.title || !formData.content}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "جاري الحفظ..." : "حفظ الخبر"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
