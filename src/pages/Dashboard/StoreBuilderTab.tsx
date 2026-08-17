import React, { useState } from 'react';
import { Store, StoreThemeId, StoreSection } from '../../types';
import { db } from '../../lib/database';
import { CURATED_HERO_BANNERS } from '../../lib/storage';
import {
  Palette,
  Layout,
  Type,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface StoreBuilderTabProps {
  store: Store;
  isSubscriptionActive: boolean;
  onStoreUpdated: (updated: Store) => void;
  onPreviewStore: () => void;
}

const THEME_OPTIONS: { id: StoreThemeId; name: string; desc: string; previewColor: string; bgClass: string }[] = [
  {
    id: 'luxury_purple',
    name: 'الفخامة الملكية (Luxury Purple)',
    desc: 'تصميم ملكي راقي باللون البنفسجي العميق، مناسب للعطور، الساعات والأزياء الفاخرة.',
    previewColor: '#7C3AED',
    bgClass: 'from-purple-950 to-slate-900',
  },
  {
    id: 'minimalist',
    name: 'التبسيطي النقي (Minimalist)',
    desc: 'مساحات بيضاء نقية مع تركيز كامل على جماليات صور المنتجات والتفاصيل.',
    previewColor: '#0F172A',
    bgClass: 'from-slate-100 to-white',
  },
  {
    id: 'modern_dark',
    name: 'الداكن العصري (Modern Dark)',
    desc: 'واجهة داكنة مريحة للعين مع لمسات نيون براقة للمتاجر التقنية والإلكترونيات.',
    previewColor: '#6366F1',
    bgClass: 'from-slate-950 to-slate-900',
  },
  {
    id: 'bold_commerce',
    name: 'التجاري الجريء (Bold Commerce)',
    desc: 'خطوط عريضة وأزرار واضحة تزيد من معدل التحويل والمبيعات السريعة.',
    previewColor: '#EA580C',
    bgClass: 'from-orange-950 to-slate-900',
  },
  {
    id: 'classic_white',
    name: 'الأبيض الكلاسيكي (Classic White)',
    desc: 'تصميم تقليدي فائق الوضوح مستوحى من كبرى المتاجر العالمية.',
    previewColor: '#2563EB',
    bgClass: 'from-blue-50 to-slate-50',
  },
];

export const StoreBuilderTab: React.FC<StoreBuilderTabProps> = ({
  store,
  isSubscriptionActive,
  onStoreUpdated,
  onPreviewStore,
}) => {
  const [themeId, setThemeId] = useState<StoreThemeId>(store.theme_id || 'luxury_purple');
  const [primaryColor, setPrimaryColor] = useState(store.primary_color || '#7C3AED');
  const [fontFamily, setFontFamily] = useState(store.font_family || 'Cairo');
  const [buttonStyle, setButtonStyle] = useState(store.button_style || 'pill');
  const [sections, setSections] = useState<StoreSection[]>(
    store.sections_json && store.sections_json.length > 0
      ? store.sections_json
      : [
          { id: 'sec-hero', type: 'hero', title: 'تشكيلة الموسم الفاخرة', subtitle: 'اكتشف أفضل المنتجات بخصومات خاصة', button_text: 'تسوق الآن', enabled: true, order: 1 },
          { id: 'sec-categories', type: 'categories', title: 'تصفح حسب الأقسام', enabled: true, order: 2 },
          { id: 'sec-featured', type: 'featured_products', title: 'المنتجات الأكثر طلباً', enabled: true, order: 3 },
          { id: 'sec-banner', type: 'banner', title: 'عروض حصرية لفترة محدودة', subtitle: 'خصم يصل إلى 40%', button_text: 'استفد من العرض', enabled: true, order: 4 },
          { id: 'sec-testimonials', type: 'testimonials', title: 'آراء عملائنا الكرام', enabled: true, order: 5 },
          { id: 'sec-contact', type: 'contact', title: 'تواصل معنا مباشرة عبر الواتساب', enabled: true, order: 6 },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!isSubscriptionActive) return;
    const newSections = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // reindex order
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(newSections);
  };

  const handleToggleSection = (index: number) => {
    if (!isSubscriptionActive) return;
    const newSections = [...sections];
    newSections[index].enabled = !newSections[index].enabled;
    setSections(newSections);
  };

  const handleUpdateSectionContent = (index: number, key: keyof StoreSection, val: any) => {
    if (!isSubscriptionActive) return;
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [key]: val,
    };
    setSections(newSections);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isSubscriptionActive) {
      setFeedback({
        type: 'error',
        message: 'لا يمكن حفظ تعديلات القالب لأن اشتراكك منتهي. يرجى تجديد الاشتراك.',
      });
      return;
    }

    setSaving(true);
    try {
      const updated = db.updateStore(store.id, {
        theme_id: themeId,
        primary_color: primaryColor,
        font_family: fontFamily,
        button_style: buttonStyle,
        sections_json: sections,
      });

      onStoreUpdated(updated);
      setFeedback({
        type: 'success',
        message: 'تم تحديث قالب وواجهة المتجر بنجاح!',
      });
      setSaving(false);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'فشل حفظ القالب',
      });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">منشئ ومخصص المتجر (Store Builder)</h2>
          <p className="text-xs text-slate-500">
            اختر من بين 5 قوالب فاخرة، وخصص الألوان، الخطوط، وشكل الأزرار، وبناء صفحاتك بسهولة
          </p>
        </div>
        <button
          type="button"
          onClick={onPreviewStore}
          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>معاينة واجهة المتجر الحية</span>
        </button>
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

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Themes Selection (5 themes) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>القوالب الجاهزة المعتمدة (5 أنماط)</span>
            </h3>
            <span className="text-[11px] text-purple-600 font-semibold">
              متوافقة بنسبة 100% مع كافة الشاشات والموبايل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => isSubscriptionActive && setThemeId(theme.id)}
                  className={`relative p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className={`h-16 rounded-lg bg-gradient-to-r ${theme.bgClass} flex items-center justify-center p-2 mb-3 shadow-inner`}>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                        {theme.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{theme.name}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{theme.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">اللون المميز:</span>
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.previewColor }}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Colors & Typography & Button Shapes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>تخصيص الألوان والخطوط والأزرار</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Primary Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                اللون الرئيسي للعلامة التجارية
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  disabled={!isSubscriptionActive}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-1 bg-white"
                />
                <input
                  type="text"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                نوع الخط العربي (Typography)
              </label>
              <select
                disabled={!isSubscriptionActive}
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
              >
                <option value="Cairo">خط القاهرة (Cairo - فخم ومعاصر)</option>
                <option value="Tajawal">خط تجوال (Tajawal - خفيف وانسيابي)</option>
                <option value="Outfit">خط أوتفيت (Plus Jakarta Sans / Outfit)</option>
              </select>
            </div>

            {/* Button Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                شكل أزرار الشراء والتنقل
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => isSubscriptionActive && setButtonStyle('pill')}
                  className={`py-2 text-xs font-semibold rounded-full border text-center transition ${
                    buttonStyle === 'pill' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  كبسولة (Pill)
                </button>
                <button
                  type="button"
                  onClick={() => isSubscriptionActive && setButtonStyle('rounded')}
                  className={`py-2 text-xs font-semibold rounded-xl border text-center transition ${
                    buttonStyle === 'rounded' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  منحني (Rounded)
                </button>
                <button
                  type="button"
                  onClick={() => isSubscriptionActive && setButtonStyle('square')}
                  className={`py-2 text-xs font-semibold rounded-xs border text-center transition ${
                    buttonStyle === 'square' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  كلاسيك (Square)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Homepage Sections Builder & Reorder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>منشئ أقسام الصفحة الرئيسية (Section Builder)</span>
            </h3>
            <span className="text-xs text-slate-400">
              قم بترتيب أو تعطيل وتفعيل أي قسم في واجهة المتجر
            </span>
          </div>

          <div className="space-y-3">
            {sections.map((section, index) => {
              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-xl border transition ${
                    section.enabled
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-slate-100/50 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>
                            {section.type === 'hero' && 'قسم البانر الرئيسي (Hero Section)'}
                            {section.type === 'categories' && 'قسم تصفح الأقسام (Categories)'}
                            {section.type === 'featured_products' && 'قسم المنتجات المميزة (Featured Products)'}
                            {section.type === 'banner' && 'بانر ترويجي وعروض (Promo Banner)'}
                            {section.type === 'testimonials' && 'آراء وتقييمات العملاء (Reviews)'}
                            {section.type === 'contact' && 'شريط التواصل والواتساب (Contact / WhatsApp)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={index === 0 || !isSubscriptionActive}
                        onClick={() => handleMoveSection(index, 'up')}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 disabled:opacity-30"
                        title="تحريك لأعلى"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sections.length - 1 || !isSubscriptionActive}
                        onClick={() => handleMoveSection(index, 'down')}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 disabled:opacity-30"
                        title="تحريك لأسفل"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!isSubscriptionActive}
                        onClick={() => handleToggleSection(index)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          section.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {section.enabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>مفعّل</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>معطّل</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Section Title Editor */}
                  {section.enabled && (section.type === 'hero' || section.type === 'banner' || section.type === 'featured_products') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          عنوان القسم
                        </label>
                        <input
                          type="text"
                          disabled={!isSubscriptionActive}
                          value={section.title || ''}
                          onChange={(e) => handleUpdateSectionContent(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          النص الفرعي / الوصف
                        </label>
                        <input
                          type="text"
                          disabled={!isSubscriptionActive}
                          value={section.subtitle || ''}
                          onChange={(e) => handleUpdateSectionContent(index, 'subtitle', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
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
                <span>حفظ القالب وتحديث المتجر</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
