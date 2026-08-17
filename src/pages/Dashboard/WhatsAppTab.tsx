import React, { useState } from 'react';
import { Store, Order } from '../../types';
import { db } from '../../lib/database';
import {
  MessageCircle,
  Phone,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface WhatsAppTabProps {
  store: Store;
  orders: Order[];
  isSubscriptionActive: boolean;
  onStoreUpdated: (updated: Store) => void;
}

export const WhatsAppTab: React.FC<WhatsAppTabProps> = ({
  store,
  orders,
  isSubscriptionActive,
  onStoreUpdated,
}) => {
  const currency = store.currency || 'EGP';
  const [merchantPhone, setMerchantPhone] = useState(store.whatsapp_phone || '+201012345678');
  const [templateType, setTemplateType] = useState<'new_order' | 'shipped' | 'delivered' | 'reminder'>('new_order');
  const [customMsg, setCustomMsg] = useState(
    'مرحباً {customer_name}! شكراً لطلبك من {store_name}. تم استلام طلبك رقم #{order_number} بنجاح بقيمة {total_amount} {currency} وجاري تجهيز الشحنة الآن.'
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Demo order for preview
  const sampleOrder = orders[0] || {
    id: 'ord-sample',
    order_number: 'VIP-1001',
    total_amount: 549.00,
    customer: { name: 'محمد علي', phone: '+201099887766' },
  };

  const previewMessage = customMsg
    .replace('{customer_name}', sampleOrder.customer?.name || 'محمد علي')
    .replace('{store_name}', store.store_name)
    .replace('{order_number}', sampleOrder.order_number)
    .replace('{total_amount}', sampleOrder.total_amount.toFixed(2))
    .replace('{currency}', currency);

  const sampleCustomerPhone = (sampleOrder.customer?.phone || '+201099887766').replace(/\D/g, '');
  const generatedWaUrl = `https://wa.me/${sampleCustomerPhone}?text=${encodeURIComponent(previewMessage)}`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscriptionActive) {
      setFeedback({ type: 'error', message: 'اشتراك المتجر منتهي.' });
      return;
    }

    setSaving(true);
    try {
      const updated = db.updateStore(store.id, {
        whatsapp_phone: merchantPhone.trim(),
      });
      onStoreUpdated(updated);
      setFeedback({ type: 'success', message: 'تم حفظ رقم وهاتف إشعارات الواتساب بنجاح!' });
      setSaving(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشل الحفظ' });
      setSaving(false);
    }
  };

  const handleApplyPreset = (type: 'new_order' | 'shipped' | 'delivered' | 'reminder') => {
    setTemplateType(type);
    if (type === 'new_order') {
      setCustomMsg('مرحباً {customer_name}! شكراً لطلبك من {store_name}. تم استلام طلبك رقم #{order_number} بنجاح بقيمة {total_amount} {currency} وجاري تجهيز الشحنة الآن.');
    } else if (type === 'shipped') {
      setCustomMsg('أهلاً {customer_name}، شحنتك رقم #{order_number} من متجر {store_name} تم تسليمها لشركة الشحن وهي في طريقها إليك الآن!');
    } else if (type === 'delivered') {
      setCustomMsg('مرحباً {customer_name}، نأمل أن تكون منتجاتك من {store_name} قد نالت إعجابك! يسعدنا دائماً تقييمك لخدمتنا.');
    } else if (type === 'reminder') {
      setCustomMsg('مرحباً {customer_name}، لاحظنا اهتمامك بمنتجات {store_name}. هل تود المساعدة في إتمام طلبك اليوم؟');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900">إشعارات الواتساب المباشرة (WhatsApp Automation)</h2>
        <p className="text-xs text-slate-500">
          توليد رسائل wa.me مخصصة ببيانات الطلب والعميل لإرسال التحديثات بنقرة واحدة
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Card 1: Merchant Number */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>رقم الواتساب الرسمي لخدمة عملاء المتجر</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رقم الهاتف (مع الرمز الدولي) *
            </label>
            <input
              type="tel"
              required
              dir="ltr"
              disabled={!isSubscriptionActive}
              value={merchantPhone}
              onChange={(e) => setMerchantPhone(e.target.value)}
              placeholder="+201012345678"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              يظهر هذا الرقم في زر "تواصل معنا عبر واتساب" في واجهة المتجر.
            </p>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving || !isSubscriptionActive}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>حفظ رقم الواتساب</span>
            </button>
          </div>
        </div>
      </form>

      {/* Template Builder Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>قوالب الرسائل التلقائية (Dynamic Templates)</span>
          </h3>
          <span className="text-[11px] text-slate-400">تدعم المتغيرات الذكية</span>
        </div>

        {/* Presets buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600">اختر نموذجاً:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('new_order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              templateType === 'new_order' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            تأكيد استلام الطلب
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('shipped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              templateType === 'shipped' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            إشعار الشحن والخروج
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              templateType === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            شكر بعد الاستلام
          </button>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            نص الرسالة (يمكنك استخدام المتغيرات: {'{customer_name}'}، {'{order_number}'}، {'{total_amount}'}، {'{store_name}'})
          </label>
          <textarea
            rows={4}
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
          />
        </div>

        {/* Live Preview Box */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              معاينة الرسالة الحية كما تظهر للعميل:
            </span>
            <span className="font-mono text-[11px] text-slate-500">إلى: {sampleCustomerPhone}</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs leading-relaxed shadow-inner">
            {previewMessage}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <a
              href={generatedWaUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>تجربة الإرسال عبر تطبيق الواتساب الآن</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
