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
  police: { label: "الشرطة", color: "text-blue-400 bg-blue-500/10", border: "border-blue-500/20" },
  ambulance: { label: "الإسعاف", color: "text-rose-400 bg-rose-500/10", border: "border-rose-500/20" },
  embassy: { label: "السفارة", color: "text-emerald-400 bg-emerald-500/10", border: "border-emerald-500/20" },
  fire: { label: "الإطفاء", color: "text-orange-400 bg-orange-500/10", border: "border-orange-500/20" },
  other: { label: "أخرى", color: "text-slate-400 bg-slate-500/10", border: "border-slate-500/20" },
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/15">
            <Phone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">أرقام الطوارئ</h2>
            <p className="text-[12px] text-slate-500">إدارة دليل أرقام الهواتف الهامة</p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all text-sm font-bold"
          >
            <Plus size={16} />
            رقم جديد
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-rose-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <Phone size={44} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">لا توجد أرقام مسجلة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["الاسم", "رقم الهاتف", "النوع", "الترتيب", "إجراء"].map((h) => (
                    <th
                      key={h}
                      className="text-right px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider"
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
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-200">{item.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[15px] text-white font-mono tracking-wider">{item.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${t.color} ${t.border}`}>
                          {t.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{item.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all disabled:opacity-50"
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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
        <div className="text-sm leading-relaxed">
          <strong>ملاحظة:</strong> سيتم عرض هذه الأرقام في التطبيق للمستخدمين لسهولة الوصول إليها في حالات الطوارئ. استخدم "الترتيب" لتحديد الأرقام التي تظهر في الأعلى.
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "تعديل الرقم" : "إضافة رقم جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">اسم الجهة / الشخص</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الإسعاف المركزي..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">رقم الهاتف</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="مثال: 123"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white font-mono input-glow transition-all text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all appearance-none"
                >
                  <option value="police" className="bg-[#111827]">الشرطة</option>
                  <option value="ambulance" className="bg-[#111827]">الإسعاف</option>
                  <option value="embassy" className="bg-[#111827]">السفارة</option>
                  <option value="fire" className="bg-[#111827]">الإطفاء</option>
                  <option value="other" className="bg-[#111827]">أخرى</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-400">الترتيب (أصغر رقم يظهر أولاً)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all text-left"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.number}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-gradient-to-l from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all disabled:opacity-50"
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
