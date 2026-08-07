"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Key, User, Bell, Shield, Loader2, Database, Edit2, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetch("/api/admin/profile")
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setProfile({ name: data.name, email: data.email });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "تم تحديث الملف الشخصي بنجاح" });
      } else {
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء التحديث" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "كلمة المرور الجديدة غير متطابقة" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء التحديث" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "profile") handleSaveProfile();
    else if (activeTab === "security") handleSavePassword();
    else {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: "success", text: "تم حفظ الإعدادات" });
      }, 1000);
    }
  };

  const tabs = [
    { id: "general", label: "إعدادات عامة", icon: <SettingsIcon size={16} /> },
    { id: "profile", label: "الملف الشخصي", icon: <User size={16} /> },
    { id: "security", label: "الأمان", icon: <Shield size={16} /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell size={16} /> },
    { id: "api", label: "API & Integrations", icon: <Database size={16} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg shadow-slate-500/15">
          <SettingsIcon size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">الإعدادات</h2>
          <p className="text-[12px] text-slate-500">إدارة تفضيلات النظام وحسابك</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 transition-all ${
          message.type === "success" 
            ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
            : "bg-rose-50 border border-rose-200 text-rose-600"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-semibold">{message.text}</p>
          <button onClick={() => setMessage(null)} className="mr-auto opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage(null);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }
                `}
              >
                <div className={`${activeTab === tab.id ? "text-emerald-600" : ""}`}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 relative shadow-sm">
            
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-8 fade-in-up">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">إعدادات التطبيق الأساسية</h3>
                  <p className="text-[12px] text-slate-500 mb-6">المعلومات الأساسية التي تظهر في التطبيق للمستخدمين.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">اسم التطبيق</label>
                    <input
                      type="text"
                      defaultValue="تطبيق الجالية اليمنية"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">لغة الواجهة الافتراضية</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none">
                      <option className="bg-white">العربية</option>
                      <option className="bg-white">English</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[12px] font-semibold text-slate-600">رقم الدعم الفني (WhatsApp)</label>
                    <input
                      type="text"
                      defaultValue="+20 100 000 0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      dir="ltr"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">يُستخدم للتواصل المباشر مع الإدارة من خلال التطبيق.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-8 fade-in-up">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">معلومات الحساب</h3>
                  <p className="text-[12px] text-slate-500 mb-6">قم بتحديث معلوماتك الشخصية كمدير للنظام.</p>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-500/20">
                      {profile.name.charAt(0) || "م"}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">{profile.name || "المسؤول"}</h4>
                    <p className="text-sm text-slate-500">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">الاسم الكامل</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-8 fade-in-up">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">تغيير كلمة المرور</h3>
                  <p className="text-[12px] text-slate-500 mb-6">تأكد من اختيار كلمة مرور قوية.</p>
                </div>

                <div className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">كلمة المرور الحالية</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-600">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {(activeTab === "notifications" || activeTab === "api") && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 fade-in-up">
                <SettingsIcon size={48} className="mb-4 opacity-30" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">قيد التطوير</h3>
                <p className="text-sm">هذا القسم سيكون متاحاً قريباً.</p>
              </div>
            )}

            {/* Action Buttons */}
            {["general", "profile", "security"].includes(activeTab) && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    if (activeTab === "security") setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all text-sm font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
