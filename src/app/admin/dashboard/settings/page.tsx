"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Key, User, Bell, Shield, Loader2, Database, Edit2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // In a real app, this would show a toast notification
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "إعدادات عامة", icon: <SettingsIcon size={16} /> },
    { id: "profile", label: "الملف الشخصي", icon: <User size={16} /> },
    { id: "security", label: "الأمان", icon: <Shield size={16} /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell size={16} /> },
    { id: "api", label: "API & Integrations", icon: <Database size={16} /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/15">
          <SettingsIcon size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">الإعدادات</h2>
          <p className="text-[12px] text-slate-500">إدارة تفضيلات النظام وحسابك</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.06]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }
                `}
              >
                <div className={`${activeTab === tab.id ? "text-emerald-400" : ""}`}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8">
            
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-8 fade-in-up">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">إعدادات التطبيق الأساسية</h3>
                  <p className="text-[12px] text-slate-400 mb-6">المعلومات الأساسية التي تظهر في التطبيق للمستخدمين.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">اسم التطبيق</label>
                    <input
                      type="text"
                      defaultValue="تطبيق الجالية اليمنية"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">لغة الواجهة الافتراضية</label>
                    <select className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all appearance-none">
                      <option className="bg-[#111827]">العربية</option>
                      <option className="bg-[#111827]">English</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[12px] font-semibold text-slate-400">رقم الدعم الفني (WhatsApp)</label>
                    <input
                      type="text"
                      defaultValue="+20 100 000 0000"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white font-mono input-glow transition-all text-left"
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
                  <h3 className="text-lg font-bold text-white mb-1">معلومات الحساب</h3>
                  <p className="text-[12px] text-slate-400 mb-6">قم بتحديث معلوماتك الشخصية كمدير للنظام.</p>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-emerald-500/20">
                      م
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white text-slate-800 shadow-md hover:scale-110 transition-transform">
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-white font-bold">المسؤول</h4>
                    <p className="text-sm text-slate-400">admin@yemeni-community.com</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">الاسم الكامل</label>
                    <input
                      type="text"
                      defaultValue="المسؤول"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white input-glow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">البريد الإلكتروني</label>
                    <input
                      type="email"
                      defaultValue="admin@yemeni-community.com"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white font-mono input-glow transition-all text-left"
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
                  <h3 className="text-lg font-bold text-white mb-1">تغيير كلمة المرور</h3>
                  <p className="text-[12px] text-slate-400 mb-6">تأكد من اختيار كلمة مرور قوية.</p>
                </div>

                <div className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">كلمة المرور الحالية</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pr-11 pl-4 text-sm text-white input-glow transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pr-11 pl-4 text-sm text-white input-glow transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-400">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pr-11 pl-4 text-sm text-white input-glow transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {(activeTab === "notifications" || activeTab === "api") && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 fade-in-up">
                <SettingsIcon size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-white mb-2">قيد التطوير</h3>
                <p className="text-sm">هذا القسم سيكون متاحاً قريباً.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">
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

          </div>
        </div>
      </div>
    </div>
  );
}
