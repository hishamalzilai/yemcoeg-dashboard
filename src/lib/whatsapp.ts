// إرسال إشعارات واتساب مباشرة عبر WasenderAPI (من السيرفر فقط — لا تستورد هذا الملف في كود العميل)

import { canHit, rateLimit } from "./rate-limit";

const WASENDER_URL = "https://www.wasenderapi.com/api/send-message";

// Anyone can create an aid request, so automatic confirmations are capped:
// a phone number can't be flooded, and the WhatsApp number can't be burned.
const MAX_CONFIRMATIONS_PER_PHONE_PER_DAY = 3;
const MAX_CONFIRMATIONS_PER_HOUR = 60;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

const STATUS_LABELS: Record<string, string> = {
  pending: "🕓 قيد الانتظار",
  processing: "⏳ قيد المعالجة",
  completed: "✅ تمت الموافقة",
  rejected: "❌ تم الرفض",
};

/** يحوّل الرقم إلى الصيغة الدولية +XXXXXXXX أو يرجع null إن كان غير صالح */
export function normalizePhone(raw: string | null | undefined): string | null {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("01")) d = "20" + d.slice(1); // مصري محلي 01xxxxxxxxx
  if (d.length === 13 && d.startsWith("200")) d = "20" + d.slice(3); // +20 010...
  if (d.length === 9 && d.startsWith("7")) d = "967" + d; // يمني محلي 7xxxxxxxx
  if (d.length === 13 && d.startsWith("9670")) d = "967" + d.slice(4); // +967 07...
  return d.length >= 10 && d.length <= 15 ? "+" + d : null;
}

/**
 * نتيجة الإرسال:
 * - "sent": وصلت إلى WasenderAPI بنجاح
 * - "retry": فشل مؤقت (ضغط/حد إرسال 429 أو خطأ سيرفر أو شبكة) — تستحق إعادة المحاولة لاحقاً
 * - "failed": فشل دائم (مفتاح ناقص/خاطئ أو رقم غير صالح) — لا فائدة من الإعادة
 */
export type SendResult = "sent" | "retry" | "failed";

/** يرسل رسالة نصية. لا يرمي أخطاء أبداً. */
export async function sendWhatsApp(phone: string, text: string): Promise<SendResult> {
  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) {
    console.warn("WhatsApp: WASENDER_API_KEY is not set, skipping");
    return "failed";
  }
  const to = normalizePhone(phone);
  if (!to) {
    console.warn(`WhatsApp: invalid phone "${phone}", skipping`);
    return "failed";
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(WASENDER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to, text }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        console.log(`WhatsApp: sent to ****${to.slice(-4)}`);
        return "sent";
      }
      console.error(`WhatsApp: attempt ${attempt} failed (${res.status}): ${await res.text()}`);
      if (res.status === 429) return "retry"; // حد الإرسال — ننتظر الدورة القادمة بدل الضغط أكثر
      if (res.status < 500) return "failed"; // خطأ في المفتاح/البيانات — لا فائدة من الإعادة
    } catch (err) {
      console.error(`WhatsApp: attempt ${attempt} error:`, err);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
  }
  return "retry";
}

/**
 * The name comes from the public form, so it can't be trusted inside a message sent from
 * our number: drop formatting, line breaks and anything carrying a link or phone number.
 */
export function safeName(raw: string | null | undefined): string {
  const name = String(raw ?? "")
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, " ")
    .replace(/[*_~`<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name || name.length > 60) return "";
  if (/https?:|www\.|\.[a-z]{2,}(\/|\s|$)|@|\d{3,}|[٠-٩]{3,}/i.test(name)) return "";
  return name;
}

export type ConfirmationResult = SendResult | "phone-limit" | "global-limit";

/**
 * Sends the "request received" confirmation, within the abuse limits.
 * "global-limit" means try again later; "phone-limit" means skip this one.
 */
export async function sendAidConfirmation(
  phone: string,
  name: string,
  requestId: string,
): Promise<ConfirmationResult> {
  const to = normalizePhone(phone);
  if (!to || !/^[A-Za-z0-9]{4,20}$/.test(requestId)) {
    console.warn("WhatsApp: confirmation skipped (invalid phone or request id)");
    return "failed";
  }
  // Checked in this order so a postponed message doesn't use up its phone's quota,
  // and repeats to one blocked number can't use up the shared hourly quota.
  if (!canHit("wa:global", MAX_CONFIRMATIONS_PER_HOUR, HOUR_MS)) {
    console.warn("WhatsApp: hourly limit reached, confirmation postponed");
    return "global-limit";
  }
  if (!rateLimit(`wa:${to}`, MAX_CONFIRMATIONS_PER_PHONE_PER_DAY, DAY_MS)) {
    console.warn(`WhatsApp: daily limit reached for ****${to.slice(-4)}, confirmation skipped`);
    return "phone-limit";
  }
  rateLimit("wa:global", MAX_CONFIRMATIONS_PER_HOUR, HOUR_MS);
  return sendWhatsApp(to, aidRequestReceivedMessage(name, requestId));
}

export function aidRequestReceivedMessage(name: string, requestId: string): string {
  const clean = safeName(name);
  return (
    "*تأكيد استلام طلب المساعدة* 🇾🇪🇪🇬\n\n" +
    (clean ? `مرحباً *${clean}*،\n` : "مرحباً بك،\n") +
    "تم استلام طلبك بنجاح من قبل الجالية اليمنية في مصر.\n\n" +
    `🔢 *رقم الطلب:* ${requestId}\n` +
    "⏳ سيتم مراجعة طلبك في أقرب وقت ممكن وسنوافيك بالتحديثات.\n\n" +
    "يمكنك متابعة حالة طلبك من التطبيق باستخدام رقم الطلب.\n" +
    "شكراً لتواصلك معنا! 🌷"
  );
}

export function statusUpdateMessage(
  name: string | null | undefined,
  requestId: string,
  status: string,
  notes?: string | null,
): string {
  return (
    "*تحديث بخصوص طلب المساعدة الخاص بك* 🇾🇪🇪🇬\n\n" +
    (safeName(name) ? `مرحباً *${safeName(name)}*،\n` : "مرحباً بك،\n") +
    "تم تحديث حالة طلبك لدى الجالية اليمنية في مصر.\n\n" +
    `🔢 *رقم الطلب:* ${requestId}\n` +
    `📊 *الحالة الحالية:* ${STATUS_LABELS[status] ?? status}\n` +
    `📝 *ملاحظات:* ${notes || "لا توجد ملاحظات إضافية"}\n\n` +
    "لأي استفسار، يرجى التواصل مع فريق الدعم.\n" +
    "نسعد بخدمتكم! 🌷"
  );
}
