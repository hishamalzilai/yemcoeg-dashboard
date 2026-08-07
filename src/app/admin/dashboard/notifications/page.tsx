'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `تم إرسال الإشعار بنجاح! تم الوصول إلى ${data.successCount} جهاز.` });
        setTitle('');
        setBody('');
      } else {
        setStatus({ type: 'error', message: data.details ? `${data.error}: ${data.details}` : data.error || 'حدث خطأ أثناء الإرسال' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md shadow-slate-500/15">
            <Bell size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">إرسال إشعارات (Push Notifications)</h1>
            <p className="text-[12px] text-slate-500">إرسال تنبيهات مباشرة لجميع المستخدمين</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        {status && (
          <div className={`p-4 mb-6 rounded-lg font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">
              عنوان الإشعار
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 shadow-sm"
              placeholder="مثال: خبر عاجل للجالية"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">
              نص الإشعار
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 shadow-sm resize-none"
              placeholder="اكتب رسالتك هنا..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold shadow-md shadow-red-600/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 transition-all"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الإشعار الآن'}
          </button>
        </form>
      </div>
    </div>
  );
}
