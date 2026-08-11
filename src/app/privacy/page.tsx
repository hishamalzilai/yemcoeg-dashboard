import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | تطبيق الجالية اليمنية',
  description: 'سياسة الخصوصية لتطبيق الجالية اليمنية في مصر',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">سياسة الخصوصية</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. مقدمة</h2>
            <p>
              نحن في تطبيق "الجالية اليمنية" نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا للمعلومات واستخدامها وحمايتها عند استخدامك لتطبيقنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. المعلومات التي نجمعها</h2>
            <p>قد نقوم بجمع المعلومات التالية عند تقديمك لطلبات المساعدة أو استخدامك للتطبيق:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>الاسم الرباعي</li>
              <li>رقم الهاتف</li>
              <li>رقم الهوية / جواز السفر</li>
              <li>العنوان ومكان الإقامة (المدينة، الحي)</li>
              <li>الصور والمستندات المرفقة مع الطلبات</li>
              <li>معرف الجهاز (لغرض إرسال الإشعارات والتنبيهات)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. كيف نستخدم معلوماتك؟</h2>
            <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>معالجة طلبات المساعدة الخاصة بك والتواصل معك بشأنها.</li>
              <li>تحسين جودة الخدمات المقدمة لأبناء الجالية.</li>
              <li>إرسال الإشعارات والتحديثات الهامة والأخبار العاجلة.</li>
              <li>التحقق من الهوية لضمان وصول المساعدات لمستحقيها.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. حماية البيانات</h2>
            <p>
              نحن نتخذ كافة الإجراءات الأمنية التقنية والتنظيمية المناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به، أو التعديل، أو الإفصاح، أو الإتلاف.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. مشاركة المعلومات</h2>
            <p>
              نحن لا نقوم ببيع أو تأجير بياناتك الشخصية لأي أطراف خارجية. قد تتم مشاركة بعض المعلومات الضرورية فقط مع الجهات المختصة والمعنية بتقديم المساعدات في حال تطلب الأمر ذلك ولغرض خدمتك فقط.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. التغييرات على سياسة الخصوصية</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وإرسال إشعار عبر التطبيق.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. تواصل معنا</h2>
            <p>
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر القنوات الرسمية المتاحة في التطبيق.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>
    </div>
  );
}
