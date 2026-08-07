"use client";

import { useState, useEffect } from "react";
import { Phone, Plus, Edit2, Trash2, Loader2, RefreshCw, X, AlertCircle, Save } from "lucide-react";

interface EmergencyNumber {
  id: string;
  name: string;
  number: string;
  type: string;
  order: number;
}

const typeConfig: Record<string, { label: string; color: string; border: string }> = {
  police: { label: "الشرطة", color: "text-blue-700 bg-blue-50", border: "border-blue-200" },
  ambulance: { label: "الإسعاف", color: "text-red-700 bg-red-50", border: "border-red-200" },
  embassy: { label: "السفارة", color: "text-emerald-700 bg-emerald-50", border: "border-emerald-200" },
  fire: { label: "الإطفاء", color: "text-orange-700 bg-orange-50", border: "border-orange-200" },
  other: { label: "أخرى", color: "text-slate-600 bg-slate-100", border: "border-slate-200" },
};

export default function EmergencyPage() {
  const [items, setItems] = useState<EmergencyNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmergencyNumber | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    type: "police",
    order: 0,
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/emergency");
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

  const handleOpenModal = (item?: EmergencyNumber) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        number: item.number,
        type: item.type,
        order: item.order,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", number: "", type: "police", order: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.number) return;
    setSaving(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/emergency/${editingItem.id}` : "/api/admin/emergency";
      
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
    if (!confirm("هل أنت متأكد من حذف هذا الرقم؟")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/emergency/${id}`, { method: "DELETE" });
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-md shadow-red-500/15">
            <Phone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">أرقام الطوارئ</h2>
            <p className="text-[12px] text-slate-500">إدارة دليل أرقام الهواتف الهامة</p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all text-sm font-bold"
          >
            <Plus size={16} />
            رقم جديد
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-red-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Phone size={44} className="mb-3 opacity-30" />
            <p className="text-sm font-bold">لا توجد أرقام مسجلة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  {["الاسم", "رقم الهاتف", "النوع", "الترتيب", "إجراء"].map((h) => (
                    <th
                      key={h}
                      className="text-right px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const t = typeConfig[item.type] || typeConfig.other;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[15px] text-slate-800 font-bold font-mono tracking-wider" dir="ltr">{item.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${t.color} ${t.border}`}>
                          {t.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600">{item.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
        <div className="text-sm font-medium leading-relaxed">
          <strong>ملاحظة:</strong> سيتم عرض هذه الأرقام في التطبيق للمستخدمين لسهولة الوصول إليها في حالات الطوارئ. استخدم "الترتيب" لتحديد الأرقام التي تظهر في الأعلى.
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? "تعديل الرقم" : "إضافة رقم جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">اسم الجهة / الشخص</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الإسعاف المركزي..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">رقم الهاتف</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="مثال: 123"
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 font-mono focus:border-red-500 outline-none transition-all text-left font-bold shadow-sm"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all appearance-none font-medium shadow-sm"
                >
                  <option value="police" className="bg-white">الشرطة</option>
                  <option value="ambulance" className="bg-white">الإسعاف</option>
                  <option value="embassy" className="bg-white">السفارة</option>
                  <option value="fire" className="bg-white">الإطفاء</option>
                  <option value="other" className="bg-white">أخرى</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">الترتيب (أصغر رقم يظهر أولاً)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-red-500 outline-none transition-all text-left font-bold shadow-sm"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.number}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "جاري الحفظ..." : "حفظ الرقم"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
