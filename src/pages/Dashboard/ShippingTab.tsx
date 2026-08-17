import React, { useState } from 'react';
import { Store, ShippingSettings } from '../../types';
import { db } from '../../lib/database';
import {
  Truck,
  Package,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Settings2,
  DollarSign
} from 'lucide-react';

interface ShippingTabProps {
  store: Store;
  isSubscriptionActive: boolean;
}

export const ShippingTab: React.FC<ShippingTabProps> = ({ store, isSubscriptionActive }) => {
  const currency = store.currency || 'EGP';
  const currentSettings = db.getShippingSettings(store.id);

  const [manualEnabled, setManualEnabled] = useState(currentSettings?.manual_shipping_enabled ?? true);
  const [flatRate, setFlatRate] = useState<number>(currentSettings?.flat_rate ?? 50.00);
  const [freeThreshold, setFreeThreshold] = useState<number | ''>(currentSettings?.free_shipping_threshold ?? 500.00);

  const [bostaEnabled, setBostaEnabled] = useState(currentSettings?.bosta_enabled ?? false);
  const [bostaApiKey, setBostaApiKey] = useState(currentSettings?.bosta_api_key || '');
  const [bostaBusinessId, setBostaBusinessId] = useState(currentSettings?.bosta_business_id || '');

  const [mylerzEnabled, setMylerzEnabled] = useState(currentSettings?.mylerz_enabled ?? false);
  const [mylerzApiKey, setMylerzApiKey] = useState(currentSettings?.mylerz_api_key || '');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscriptionActive) {
      setFeedback({ type: 'error', message: 'اشتراك المتجر منتهي. يرجى تجديد الاشتراك.' });
      return;
    }

    setSaving(true);
    try {
      db.updateShippingSettings(store.id, {
        manual_shipping_enabled: manualEnabled,
        flat_rate: Number(flatRate),
        free_shipping_threshold: freeThreshold ? Number(freeThreshold) : null,
        bosta_enabled: bostaEnabled,
        bosta_api_key: bostaApiKey.trim() || null,
        bosta_business_id: bostaBusinessId.trim() || null,
        mylerz_enabled: mylerzEnabled,
        mylerz_api_key: mylerzApiKey.trim() || null,
      });

      setFeedback({ type: 'success', message: 'تم حفظ وتحديث إعدادات الشحن بنجاح!' });
      setSaving(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشل حفظ الإعدادات' });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900">إعدادات الشحن والتوصيل (Shipping & Couriers)</h2>
        <p className="text-xs text-slate-500">
          تحديد تكلفة الشحن اليدوي والربط مع شركات الشحن السريع (بوسطة Bosta & مايلرز Mylerz)
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

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Flat Rate / Manual Shipping */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">الشحن الثابت واليدوي (Manual / Flat Rate)</h3>
                <p className="text-xs text-slate-400">تحديد سعر توصيل قياسي لكافة الطلبات مع إمكانية الشحن المجاني</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={manualEnabled}
                onChange={(e) => setManualEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {manualEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  سعر الشحن الافتراضي ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  disabled={!isSubscriptionActive}
                  value={flatRate}
                  onChange={(e) => setFlatRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الحد الأدنى للشحن المجاني ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!isSubscriptionActive}
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="مثال: 500 (اختياري)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  إذا وصل إجمالي سلة العميل إلى هذا المبلغ تصبح تكلفة الشحن 0 تلقائياً.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Bosta Integration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">شركة بوسطة للشحن (Bosta Courier Integration)</h3>
                <p className="text-xs text-slate-400">توليد بوالص الشحن الآلية وتتبع الطرود لحظياً في مصر والسعودية</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={bostaEnabled}
                onChange={(e) => setBostaEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {bostaEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bosta API Key *
                </label>
                <input
                  type="password"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={bostaApiKey}
                  onChange={(e) => setBostaApiKey(e.target.value)}
                  placeholder="bosta_live_key_..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bosta Business ID
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={bostaBusinessId}
                  onChange={(e) => setBostaBusinessId(e.target.value)}
                  placeholder="biz_984124"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Mylerz Integration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">شركة مايلرز (Mylerz Express)</h3>
                <p className="text-xs text-slate-400">شحن سريع مع خيارات التسليم في نفس اليوم والدفع عند الاستلام</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={mylerzEnabled}
                onChange={(e) => setMylerzEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {mylerzEnabled && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mylerz API Access Token
              </label>
              <input
                type="password"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={mylerzApiKey}
                onChange={(e) => setMylerzApiKey(e.target.value)}
                placeholder="mylerz_token_..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !isSubscriptionActive}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ إعدادات الشحن والتوصيل</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
