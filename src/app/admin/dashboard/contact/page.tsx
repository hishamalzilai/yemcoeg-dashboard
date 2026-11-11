"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Share2,
  ExternalLink,
  Wand2,
} from "lucide-react";

interface ContactInfo {
  address: string;
  phone: string;
  supportPhone: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  mapUrl: string;
  latitude: number;
  longitude: number;
}

const EMPTY: ContactInfo = {
  address: "",
  phone: "",
  supportPhone: "",
  email: "",
  whatsapp: "",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
  mapUrl: "",
  latitude: 30.0405289,
  longitude: 31.2071998,
};

/** Extracts the pin coordinates from a full Google Maps link. */
function coordsFromMapsUrl(url: string): { lat: number; lng: number } | null {
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // exact place pin
    /[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // map view center
  ];
  for (const re of patterns) {
    const m = decodeURIComponent(url).match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

const inputClass =
  "w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:border-red-500 outline-none transition-all placeholder-slate-400 font-medium shadow-sm";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-bold text-slate-600">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ContactInfoPage() {
  const [form, setForm] = useState<ContactInfo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [linkHint, setLinkHint] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/contact", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error);
        setForm({ ...EMPTY, ...data });
      } catch {
        setMessage({ type: "error", text: "تعذّر تحميل معلومات التواصل" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = <K extends keyof ContactInfo>(key: K, value: ContactInfo[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  const onMapUrlChange = (url: string) => {
    set("mapUrl", url);
    if (!url.trim()) return setLinkHint("");
    const coords = coordsFromMapsUrl(url);
    if (coords) {
      setForm((f) => ({ ...f, mapUrl: url, latitude: coords.lat, longitude: coords.lng }));
      setLinkHint(`✓ تم استخراج الإحداثيات تلقائياً: ${coords.lat}, ${coords.lng}`);
    } else {
      setLinkHint(
        "لم أجد إحداثيات في هذا الرابط (الروابط المختصرة لا تحتوي عليها). أدخل الإحداثيات يدوياً أو استخدم الرابط الكامل من المتصفح.",
      );
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذّر الحفظ");
      setForm({ ...EMPTY, ...data });
      setMessage({ type: "success", text: "تم الحفظ — ستظهر التغييرات في التطبيق خلال لحظات" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "تعذّر الحفظ" });
    } finally {
      setSaving(false);
    }
  };

  const validCoords =
    Number.isFinite(form.latitude) &&
    Number.isFinite(form.longitude) &&
    Math.abs(form.latitude) <= 90 &&
    Math.abs(form.longitude) <= 180;
  const previewSrc = validCoords
    ? `https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=16&output=embed`
    : "";
  const openUrl =
    form.mapUrl || (validCoords ? `https://www.google.com/maps/search/?api=1&query=${form.latitude},${form.longitude}` : "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
            <MapPin size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">معلومات التواصل</h2>
            <p className="text-[12px] text-slate-500">
              ما تحفظه هنا يظهر في صفحة «التواصل» داخل التطبيق. الحقول الفارغة لا تظهر للمستخدمين.
            </p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Map */}
      <Section icon={<MapPin size={16} className="text-red-600" />} title="الموقع على الخريطة">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <Field
              label="رابط خرائط جوجل"
              hint="يُفتح هذا الرابط عند ضغط المستخدم على الخريطة. الصق الرابط الكامل من خرائط جوجل وستُستخرج الإحداثيات تلقائياً."
            >
              <input
                dir="ltr"
                type="url"
                value={form.mapUrl}
                onChange={(e) => onMapUrlChange(e.target.value)}
                placeholder="https://www.google.com/maps/place/..."
                className={inputClass}
              />
            </Field>
            {linkHint && (
              <p
                className={`flex items-start gap-1.5 text-[12px] font-bold ${
                  linkHint.startsWith("✓") ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <Wand2 size={14} className="mt-0.5 shrink-0" />
                {linkHint}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="خط العرض (Latitude)">
                <input
                  dir="ltr"
                  type="number"
                  step="any"
                  value={Number.isFinite(form.latitude) ? form.latitude : ""}
                  onChange={(e) => set("latitude", e.target.value === "" ? NaN : Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="خط الطول (Longitude)">
                <input
                  dir="ltr"
                  type="number"
                  step="any"
                  value={Number.isFinite(form.longitude) ? form.longitude : ""}
                  onChange={(e) => set("longitude", e.target.value === "" ? NaN : Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
            {openUrl && (
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-red-600 hover:text-red-700"
              >
                <ExternalLink size={14} />
                تجربة فتح الموقع في خرائط جوجل
              </a>
            )}
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[240px]">
            {previewSrc ? (
              <iframe
                title="معاينة الموقع"
                src={previewSrc}
                className="w-full h-full min-h-[240px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="h-full min-h-[240px] flex items-center justify-center text-sm text-slate-400 font-bold">
                أدخل إحداثيات صحيحة لعرض المعاينة
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Address & phones */}
      <Section icon={<Phone size={16} className="text-red-600" />} title="العنوان ووسائل الاتصال">
        <Field label="العنوان">
          <textarea
            rows={3}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="رقم الهاتف">
            <input dir="ltr" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+20 1xx xxx xxxx" className={inputClass} />
          </Field>
          <Field label="رقم الدعم">
            <input dir="ltr" type="tel" value={form.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} placeholder="+20 1xx xxx xxxx" className={inputClass} />
          </Field>
          <Field label="البريد الإلكتروني">
            <input dir="ltr" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@example.com" className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Socials */}
      <Section icon={<Share2 size={16} className="text-red-600" />} title="شبكات التواصل الاجتماعي">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="واتساب" hint="رقم الواتساب بالصيغة الدولية، مثل +2010xxxxxxxx">
            <input dir="ltr" type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+20 1xx xxx xxxx" className={inputClass} />
          </Field>
          <Field label="فيسبوك">
            <input dir="ltr" type="url" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." className={inputClass} />
          </Field>
          <Field label="إنستغرام">
            <input dir="ltr" type="url" value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." className={inputClass} />
          </Field>
          <Field label="إكس (تويتر)">
            <input dir="ltr" type="url" value={form.xUrl} onChange={(e) => set("xUrl", e.target.value)} placeholder="https://x.com/..." className={inputClass} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
