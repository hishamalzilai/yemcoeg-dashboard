// إرسال إشعارات واتساب مباشرة عبر WasenderAPI (من السيرفر فقط — لا تستورد هذا الملف في كود العميل)

const WASENDER_URL = "https://www.wasenderapi.com/api/send-message";

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

/** يرسل رسالة نصية. يرجع true عند النجاح ولا يرمي أخطاء أبداً. */
export async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) {
    console.warn("WhatsApp: WASENDER_API_KEY is not set, skipping");
    return false;
  }
  const to = normalizePhone(phone);
  if (!to) {
    console.warn(`WhatsApp: invalid phone "${phone}", skipping`);
    return false;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(WASENDER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to, text }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return true;
      console.error(`WhatsApp: attempt ${attempt} failed (${res.status}): ${await res.text()}`);
      if (res.status < 500 && res.status !== 429) return false; // خطأ في المفتاح/البيانات — لا فائدة من الإعادة
    } catch (err) {
      console.error(`WhatsApp: attempt ${attempt} error:`, err);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

export function aidRequestReceivedMessage(name: string, requestId: string): string {
  return (
    "*تأكيد استلام طلب المساعدة* 🇾🇪🇪🇬\n\n" +
    `مرحباً *${name}*،\n` +
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
    (name ? `مرحباً *${name}*،\n` : "مرحباً بك،\n") +
    "تم تحديث حالة طلبك لدى الجالية اليمنية في مصر.\n\n" +
    `🔢 *رقم الطلب:* ${requestId}\n` +
    `📊 *الحالة الحالية:* ${STATUS_LABELS[status] ?? status}\n` +
    `📝 *ملاحظات:* ${notes || "لا توجد ملاحظات إضافية"}\n\n` +
    "لأي استفسار، يرجى التواصل مع فريق الدعم.\n" +
    "نسعد بخدمتكم! 🌷"
  );
}
