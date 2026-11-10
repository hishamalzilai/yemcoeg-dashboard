"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UsersRound,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Wand2,
  ShieldCheck,
} from "lucide-react";
import { ROLES, isRole, type Role } from "@/lib/roles";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const roleStyles: Record<Role, string> = {
  superadmin: "text-red-700 bg-red-50 border-red-200",
  news_admin: "text-blue-700 bg-blue-50 border-blue-200",
  aid_admin: "text-emerald-700 bg-emerald-50 border-emerald-200",
  secretary: "text-amber-700 bg-amber-50 border-amber-200",
};

const roleOrder: Role[] = ["news_admin", "aid_admin", "secretary", "superadmin"];
const emptyForm = { name: "", email: "", password: "", role: "news_admin" as Role };

const inputClass =
  "w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:border-red-500 outline-none transition-all placeholder-slate-400 font-medium";

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setUsers(data.users);
      setCurrentId(data.currentId);
      setLoadError("");
    } catch {
      setLoadError("تعذّر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data on mount
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: isRole(user.role) ? user.role : "news_admin",
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(editing ? `/api/admin/users/${editing.id}` : "/api/admin/users", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? { name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) }
            : form,
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذّر الحفظ");
      setShowModal(false);
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user: AdminUser) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم «${user.name}»؟ سيفقد الدخول فوراً.`)) return;
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      await load();
    } catch (e) {
      alert(e instanceof Error && e.message ? e.message : "تعذّر حذف المستخدم");
    } finally {
      setDeleting(null);
    }
  };

  const isSelf = editing?.id === currentId;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
            <UsersRound size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">المستخدمون والصلاحيات</h2>
            <p className="text-[12px] text-slate-500">أضف موظفين وحدد الأقسام التي يدخلونها</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 transition-all"
        >
          <Plus size={16} />
          إضافة مستخدم
        </button>
      </div>

      {/* Role guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ROLES) as Role[]).map((role) => (
          <div key={role} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleStyles[role]}`}>
              {ROLES[role].label}
            </span>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">{ROLES[role].description}</p>
          </div>
        ))}
      </div>

      {loadError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-rose-50 border-rose-200 text-rose-700 text-sm font-bold">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {/* Users */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-slate-600">{user.name.trim().charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
                    {user.id === currentId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-white font-bold">أنت</span>
                    )}
                  </div>
                  <p dir="ltr" className="text-[12px] text-slate-500 text-right truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    isRole(user.role) ? roleStyles[user.role] : "text-slate-600 bg-slate-100 border-slate-200"
                  }`}
                >
                  {isRole(user.role) ? ROLES[user.role].label : user.role}
                </span>
                <button
                  onClick={() => openEdit(user)}
                  aria-label={`تعديل ${user.name}`}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                {user.id !== currentId && (
                  <button
                    onClick={() => remove(user)}
                    disabled={deleting === user.id}
                    aria-label={`حذف ${user.name}`}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                  >
                    {deleting === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{editing ? "تعديل مستخدم" : "إضافة مستخدم"}</h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                aria-label="إغلاق"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600">الاسم</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600">البريد الإلكتروني (يستخدمه للدخول)</label>
              <input
                dir="ltr"
                type="email"
                value={form.email}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600">
                {editing ? "كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)" : "كلمة المرور"}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    dir="ltr"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, password: generatePassword() });
                    setShowPassword(true);
                  }}
                  className="flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[12px] font-bold whitespace-nowrap"
                >
                  <Wand2 size={14} />
                  توليد
                </button>
              </div>
              <p className="text-[11px] text-slate-400">10 أحرف على الأقل. أرسلها للموظف بطريقة آمنة.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-600">الصلاحية</label>
              {isSelf ? (
                <p className="flex items-center gap-2 text-[12px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <ShieldCheck size={15} />
                  لا يمكنك تغيير صلاحيات حسابك.
                </p>
              ) : (
                roleOrder.map((role) => (
                  <label
                    key={role}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === role ? "border-red-400 bg-red-50/50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={form.role === role}
                      onChange={() => setForm({ ...form, role })}
                      className="mt-1 accent-red-600"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">{ROLES[role].label}</span>
                      <span className="block text-[11px] text-slate-500">{ROLES[role].description}</span>
                    </span>
                  </label>
                ))
              )}
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-[12px] text-rose-600 font-bold">
                <AlertCircle size={14} />
                {formError}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة المستخدم"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
