import React, { useState } from 'react';
import { Store } from '../../types';
import { db, RESERVED_SLUGS } from '../../lib/database';
import { CURATED_PRODUCT_IMAGES } from '../../lib/storage';
import {
  Save,
  Globe,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  Coins
} from 'lucide-react';

interface GeneralSettingsTabProps {
  store: Store;
  isSubscriptionActive: boolean;
  onStoreUpdated: (updated: Store) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  store,
  isSubscriptionActive,
  onStoreUpdated,
}) => {
  const [storeName, setStoreName] = useState(store.store_name);
  const [slug, setSlug] = useState(store.slug);
  const [customDomain, setCustomDomain] = useState(store.custom_domain || '');
  const [description, setDescription] = useState(store.description || '');
  const [supportEmail, setSupportEmail] = useState(store.support_email || '');
  const [currency, setCurrency] = useState(store.currency || 'EGP');
  const [language, setLanguage] = useState(store.language || 'ar');
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(store.favicon_url || '');
  const [isActive, setIsActive] = useState(store.is_active);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isSubscriptionActive) {
      setFeedback({
        type: 'error',
        message: 'لا يمكن حفظ التعديلات لأن اشتراك المتجر منتهي أو غير نشط. يرجى تجديد الاشتراك.',
      });
      return;
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      setFeedback({
        type: 'error',
        message: `الرابط "${cleanSlug}" محجوز للنظام ولا يمكن استخدامه.`,
      });
      return;
    }

    setSaving(true);
    try {
      const updated = db.updateStore(store.id, {
        store_name: storeName.trim(),
        slug: cleanSlug,
        custom_domain: customDomain.trim() || null,
        description: description.trim() || null,
        support_email: supportEmail.trim() || null,
        currency,
        language,
        logo_url: logoUrl.trim() || null,
        favicon_url: faviconUrl.trim() || null,
        is_active: isActive,
      });

      onStoreUpdated(updated);
      setFeedback({
        type: 'success',
        message: 'تم حفظ إعدادات المتجر بنجاح!',
      });
      setSaving(false);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء حفظ الإعدادات',
      });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900">الإعدادات العامة للمتجر</h2>
        <p className="text-xs text-slate-500">
          تحكم في هوية المتجر، الرابط المخصص، وسائل التواصل، والعملة الافتراضية
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
        
        {/* Card 1: Identity & Slug */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            هوية المتجر والرابط
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المتجر التجاري *
              </label>
              <input
                type="text"
                required
                disabled={!isSubscriptionActive}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="مثال: متجر الأناقة"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رابط المتجر الفرعي (Slug) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="elegance"
                  className="w-full pl-3.5 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-mono pointer-events-none">
                  vipstore.me/store/
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                لا يمكن استخدام الروابط المحجوزة: admin, api, dashboard, auth, store, www, app, pricing
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              الدومين المخصص (Custom Domain)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.mybrand.com"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
              />
              <span className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold shrink-0">
                مفعل في خطط Pro & VIP
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              وصف مختصر للمتجر
            </label>
            <textarea
              rows={3}
              disabled={!isSubscriptionActive}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن المنتجات والخدمات التي تقدمها لعملائك..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
            />
          </div>
        </div>

        {/* Card 2: Logo & Media */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            شعار المتجر والأيقونة (Logo & Favicon)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                شعار المتجر (Logo URL)
              </label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Store Logo"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    disabled={!isSubscriptionActive}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={!isSubscriptionActive}
                      onClick={() => setLogoUrl(CURATED_PRODUCT_IMAGES[0].url)}
                      className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition"
                    >
                      شعار أنيق 1
                    </button>
                    <button
                      type="button"
                      disabled={!isSubscriptionActive}
                      onClick={() => setLogoUrl(CURATED_PRODUCT_IMAGES[2].url)}
                      className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition"
                    >
                      شعار فخم 2
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                أيقونة المتصفح (Favicon URL)
              </label>
              <div className="flex items-center gap-3">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="url"
                    disabled={!isSubscriptionActive}
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://.../favicon.png"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Localization & Currency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            اللغة، العملة والاتصال
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عملة المتجر
              </label>
              <select
                disabled={!isSubscriptionActive}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اللغة الافتراضية
              </label>
              <select
                disabled={!isSubscriptionActive}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
              >
                <option value="ar">العربية (RTL Native)</option>
                <option value="en">English (LTR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                بريد الدعم الفني
              </label>
              <input
                type="email"
                dir="ltr"
                disabled={!isSubscriptionActive}
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@store.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:border-purple-600 disabled:opacity-50 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="store_active_toggle"
              disabled={!isSubscriptionActive}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
            />
            <label htmlFor="store_active_toggle" className="text-xs font-bold text-slate-800 cursor-pointer">
              المتجر متاح للجمهور ويستقبل الزيارات والطلبات (is_active)
            </label>
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
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
