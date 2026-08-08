"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  User,
  Calendar
} from "lucide-react";

type RequestData = {
  trackingId: string;
  fullName: string;
  aidType: string;
  status: "pending" | "processing" | "completed" | "rejected";
  statusText: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TrackRequestPage() {
  const [trackingId, setTrackingId] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !idNumber) {
      setError("يرجى إدخال رقم التتبع ورقم الهوية");
      return;
    }

    setLoading(true);
    setError(null);
    setRequestData(null);

    try {
      const response = await fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId, idNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء البحث عن الطلب");
      }

      setRequestData(data.request);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير معروف");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { id: "pending", label: "تم استلام الطلب", icon: FileText, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-500" },
      { id: "processing", label: "جاري المعالجة", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-500" },
    ];

    if (currentStatus === "rejected") {
      steps.push({ id: "rejected", label: "تم الرفض", icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-500" });
    } else {
      steps.push({ id: "completed", label: "مكتمل", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-500" });
    }

    let currentIndex = 0;
    if (currentStatus === "processing") currentIndex = 1;
    if (currentStatus === "completed" || currentStatus === "rejected") currentIndex = 2;

    return { steps, currentIndex };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-YE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Hero Section */}
      <div className="bg-emerald-700 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">تتبع حالة طلبك</h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              يمكنك متابعة حالة طلب المساعدة الخاص بك بكل شفافية وسهولة من خلال إدخال رقم التتبع ورقم الهوية الخاص بك.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 pb-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100"
        >
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-semibold text-slate-700 mb-2">
                  رقم التتبع <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="مثال: AB-123456"
                    className="w-full pl-4 pr-12 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 bg-slate-50 focus:bg-white"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>
              
              <div>
                <label htmlFor="idNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                  رقم الهوية الوطنية / الجواز <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="أدخل رقم الهوية المسجل في الطلب"
                    className="w-full pl-4 pr-12 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 bg-slate-50 focus:bg-white"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    تتبع الطلب
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
                  <AlertCircle className="w-6 h-6 ml-3 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {requestData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border-t border-slate-100 pt-10"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">تفاصيل الطلب</h2>
                    <p className="text-slate-500">رقم التتبع: {requestData.trackingId}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    requestData.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    requestData.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    requestData.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {requestData.statusText}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">معلومات المستفيد</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">الاسم الكامل</p>
                        <p className="font-semibold text-slate-800">{requestData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">نوع المساعدة المطلوبة</p>
                        <p className="font-semibold text-slate-800">{requestData.aidType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">تواريخ هامة</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">تاريخ تقديم الطلب</p>
                        <div className="flex items-center text-slate-800 font-semibold">
                          <Calendar className="w-4 h-4 ml-2 text-slate-400" />
                          {formatDate(requestData.createdAt)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                        <div className="flex items-center text-slate-800 font-semibold">
                          <Clock className="w-4 h-4 ml-2 text-slate-400" />
                          {formatDate(requestData.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-8">مسار الطلب</h3>
                  <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-8 right-10 bottom-8 w-1 bg-slate-200 rounded-full hidden md:block"></div>
                    
                    {/* Progress Bar Fill */}
                    <div 
                      className={`absolute top-8 right-10 w-1 rounded-full hidden md:block transition-all duration-1000 ease-in-out
                        ${requestData.status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'}
                      `}
                      style={{ 
                        height: 
                          getStatusSteps(requestData.status).currentIndex === 0 ? '0%' : 
                          getStatusSteps(requestData.status).currentIndex === 1 ? '50%' : '100%' 
                      }}
                    ></div>

                    <div className="space-y-8 md:space-y-12">
                      {getStatusSteps(requestData.status).steps.map((step, index) => {
                        const { currentIndex } = getStatusSteps(requestData.status);
                        const isPast = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const StepIcon = step.icon;

                        return (
                          <motion.div 
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + 0.3 }}
                            className="relative flex items-start group"
                          >
                            {/* Step Indicator */}
                            <div className={`
                              relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 shrink-0 transition-colors duration-500
                              ${isPast ? `${step.bg} ${step.border}` : 'bg-white border-slate-200'}
                              ${isCurrent ? 'ring-4 ring-slate-100' : ''}
                            `}>
                              <StepIcon className={`w-6 h-6 ${isPast ? step.color : 'text-slate-300'}`} />
                            </div>

                            {/* Step Content */}
                            <div className="mr-6 pt-3">
                              <h4 className={`text-lg font-bold ${isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.label}
                              </h4>
                              {isCurrent && index === 0 && (
                                <p className="text-slate-500 mt-2 text-sm max-w-md leading-relaxed">
                                  تم استلام طلبك بنجاح وهو الآن قيد الانتظار لمراجعته من قبل الفريق المختص.
                                </p>
                              )}
                              {isCurrent && index === 1 && (
                                <p className="text-slate-500 mt-2 text-sm max-w-md leading-relaxed">
                                  يتم الآن مراجعة طلبك والتحقق من البيانات والمستندات المرفقة من قبل فريقنا.
                                </p>
                              )}
                              {isCurrent && index === 2 && requestData.status === 'completed' && (
                                <p className="text-slate-500 mt-2 text-sm max-w-md leading-relaxed">
                                  تمت الموافقة على طلبك بنجاح. سيتم التواصل معك قريباً لترتيب الإجراءات القادمة.
                                </p>
                              )}
                              {isCurrent && index === 2 && requestData.status === 'rejected' && (
                                <p className="text-slate-500 mt-2 text-sm max-w-md leading-relaxed">
                                  نعتذر، لم يتم قبول طلبك بعد المراجعة. 
                                  {requestData.notes && <span className="block mt-2 font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">السبب: {requestData.notes}</span>}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
