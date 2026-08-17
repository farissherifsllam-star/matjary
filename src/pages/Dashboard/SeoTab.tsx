import React, { useState } from 'react';
import { Store } from '../../types';
import { db } from '../../lib/database';
import {
  Search,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Code2,
  Sparkles
} from 'lucide-react';

interface SeoTabProps {
  store: Store;
  isSubscriptionActive: boolean;
  onStoreUpdated: (updated: Store) => void;
}

export const SeoTab: React.FC<SeoTabProps> = ({ store, isSubscriptionActive, onStoreUpdated }) => {
  const [metaTitle, setMetaTitle] = useState(store.store_name);
  const [metaDesc, setMetaDesc] = useState(store.description || '');
  const [fbPixelId, setFbPixelId] = useState('123456789012345');
  const [gaTrackingId, setGaTrackingId] = useState('G-ABC123XYZ4');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [snapPixelId, setSnapPixelId] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscriptionActive) {
      setFeedback({ type: 'error', message: 'اشتراك المتجر منتهي. يرجى تجديد الاشتراك لحفظ الإعدادات.' });
      return;
    }

    setSaving(true);
    try {
      const updated = db.updateStore(store.id, {
        description: metaDesc.trim(),
      });
      onStoreUpdated(updated);
      setFeedback({ type: 'success', message: 'تم حفظ إعدادات محركات البحث والتتبع بنجاح!' });
      setSaving(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشل الحفظ' });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900">تحسين محركات البحث والتتبع (SEO & Pixels)</h2>
        <p className="text-xs text-slate-500">
          إعدادات الميتا تاج وأكواد بكسل فيسبوك، جوجل أناليتكس، تيك توك وسناب شات
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
        
        {/* Card 1: Google Search Meta Tags */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span>ظهور المتجر في نتائج بحث جوجل (Meta Tags)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عنوان الصفحة في جوجل (Meta Title)
              </label>
              <input
                type="text"
                disabled={!isSubscriptionActive}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="اسم المتجر | تشكيلة المنتجات المميزة"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الوصف التعريفي للبحث (Meta Description)
              </label>
              <textarea
                rows={3}
                disabled={!isSubscriptionActive}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="اكتب وصفاً جذاباً يشجع مستخدمي محركات البحث على الدخول لمتجرك..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
              />
            </div>

            {/* Google SERP Live Snippet */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">معاينة النتيجة في جوجل:</span>
              <div className="text-blue-700 text-sm font-semibold hover:underline cursor-pointer">
                {metaTitle || store.store_name}
              </div>
              <div className="text-emerald-700 text-[11px] font-mono" dir="ltr">
                https://vipstore.me/store/{store.slug}
              </div>
              <div className="text-slate-600 text-xs line-clamp-2">
                {metaDesc || store.description || 'متجر إلكتروني متكامل للبيع والشحن الفوري.'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tracking Pixels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-600" />
            <span>أكواد التتبع والحملات الإعلانية (Pixels & GA4)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                معرف فيسبوك بكسل (Meta Pixel ID)
              </label>
              <input
                type="text"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                معرف جوجل أناليتكس (Google Analytics GA4 ID)
              </label>
              <input
                type="text"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                تيك توك بكسل (TikTok Pixel ID)
              </label>
              <input
                type="text"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="C1234567890ABC"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                سناب شات بكسل (Snapchat Pixel ID)
              </label>
              <input
                type="text"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={snapPixelId}
                onChange={(e) => setSnapPixelId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
              />
            </div>
          </div>
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
                <span>حفظ إعدادات التتبع والـ SEO</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
