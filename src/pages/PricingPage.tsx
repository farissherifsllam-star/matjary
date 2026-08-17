import React, { useState } from 'react';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { Plan } from '../types';
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  Flame,
  ArrowLeft,
  Store,
  CreditCard,
  Layers,
  Infinity as InfinityIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PricingPageProps {
  onNavigate: (path: string) => void;
  selectedStoreId?: string;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, selectedStoreId }) => {
  const plans = db.getPlans();
  const { session, profile, loginAs } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [billingFilter, setBillingFilter] = useState<'all' | 'monthly' | 'yearly' | 'lifetime'>('all');

  const currentStore = selectedStoreId
    ? db.getStoreById(selectedStoreId)
    : profile?.id
    ? db.getStoreByOwner(profile.id)
    : db.getStores()[0];

  const currentSub = currentStore ? db.getSubscriptionByStoreId(currentStore.id) : null;

  const handleSubscribe = async (plan: Plan) => {
    setLoadingPlanId(plan.id);

    // If not logged in, prompt or create demo session
    if (!session) {
      loginAs('merchant');
    }

    const activeProfile = profile || session?.profile;
    const activeUserId = activeProfile?.id || 'profile-merchant-1';

    // Ensure user has a store
    let targetStore = currentStore;
    if (!targetStore) {
      targetStore = db.createStore({
        owner_id: activeUserId,
        store_name: `متجر ${activeProfile?.full_name?.split(' ')[0] || 'الجديد'}`,
        slug: `store-${Math.random().toString(36).substring(2, 6)}`,
        custom_domain: null,
        domain_verified: false,
        logo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
        favicon_url: null,
        description: 'متجر إلكتروني متكامل للبيع والشحن الفوري',
        support_email: session?.user.email || 'support@mystore.com',
        currency: 'EGP',
        language: 'ar',
        theme_id: 'minimalist',
        primary_color: '#7C3AED',
        font_family: 'Cairo',
        button_style: 'rounded',
        layout_style: 'grid',
        is_active: true,
      });
    }

    try {
      const status = plan.interval === 'trial' ? 'trialing' : 'active';
      db.createSubscription(targetStore.id, plan.id, status);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#EC4899', '#10B981', '#F59E0B']
      });

      setSuccessMessage(`تم تفعيل باقة "${plan.name_ar}" بنجاح لمتجرك "${targetStore.store_name}"!`);

      setTimeout(() => {
        setLoadingPlanId(null);
        onNavigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الاشتراك');
      setLoadingPlanId(null);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (billingFilter === 'all') return true;
    if (billingFilter === 'monthly') return p.interval === 'monthly' || p.interval === 'trial';
    if (billingFilter === 'yearly') return p.interval === 'yearly';
    if (billingFilter === 'lifetime') return p.interval === 'lifetime';
    return true;
  });

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>باقات مرنة تناسب طموحك</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            اختر الباقة المثالية وأطلق متجرك الاحترافي خلال دقيقة
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            جميع الباقات تشمل نظام إدارة المخزون، الشحن التلقائي، بوابات الدفع، وإشعارات الواتساب بدون عمولة على المبيعات.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 inline-flex gap-1 text-xs">
            <button
              onClick={() => setBillingFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold transition ${billingFilter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              جميع الباقات (7 مستويات)
            </button>
            <button
              onClick={() => setBillingFilter('monthly')}
              className={`px-4 py-2 rounded-lg font-bold transition ${billingFilter === 'monthly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              شهري وتجريبي
            </button>
            <button
              onClick={() => setBillingFilter('yearly')}
              className={`px-4 py-2 rounded-lg font-bold transition ${billingFilter === 'yearly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              سنوي (وفر حتى 30%)
            </button>
            <button
              onClick={() => setBillingFilter('lifetime')}
              className={`px-4 py-2 rounded-lg font-bold transition ${billingFilter === 'lifetime' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              مدى الحياة (دفع لمرة واحدة)
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm text-center font-bold animate-in zoom-in-95">
            {successMessage}
          </div>
        )}

        {/* 7 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const isCurrent = currentSub?.plan_id === plan.id;
            const isLifetime = plan.interval === 'lifetime';
            const isPro = plan.name_ar.includes('برو') || plan.name_ar.includes('احترافي') || isLifetime;
            const isVip = plan.name_ar.includes('VIP');

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition duration-300 ${
                  isVip
                    ? 'bg-gradient-to-b from-purple-900/60 via-slate-900 to-slate-900 border-2 border-amber-400/80 shadow-2xl shadow-purple-950/80 scale-[1.02]'
                    : isPro
                    ? 'bg-slate-800/90 border-2 border-purple-500/60 shadow-xl'
                    : 'bg-slate-800/40 border border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Popular / VIP Badge */}
                {isVip ? (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wide flex items-center gap-1 shadow-md">
                    <Crown className="w-3.5 h-3.5" />
                    <span>الباقة الملكية الأكثر تميزاً</span>
                  </div>
                ) : plan.interval === 'yearly' && plan.price === 1500 ? (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px] shadow-sm">
                    الأكثر طلباً للتجار
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-lg text-white">{plan.name_ar}</h3>
                    {isLifetime && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <InfinityIcon className="w-3 h-3" /> مدى الحياة
                      </span>
                    )}
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-slate-700/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                        {plan.price === 0 ? 'مجاناً' : `${plan.price.toFixed(0)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-slate-400 text-xs font-semibold">
                          جنيه مصري / {plan.interval === 'monthly' ? 'شهرياً' : plan.interval === 'yearly' ? 'سنوياً' : 'دفعة واحدة للأبد'}
                        </span>
                      )}
                    </div>
                    {plan.interval === 'trial' && (
                      <p className="text-xs text-purple-400 mt-1">صلاحية كاملة لمدة 7 أيام بدون دفع مسبق</p>
                    )}
                    {plan.interval === 'yearly' && (
                      <p className="text-xs text-emerald-400 mt-1">وفر تكلفة 3 أشهر مقارنة بالدفع الشهري</p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        عدد المنتجات: <strong>{plan.features_json.max_products?.toLocaleString('ar-EG')} منتج</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        دومين مخصص (Custom Domain): {plan.features_json.custom_domain ? 'متاح ومفعل' : 'نطاق فرعي مجاني'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>إشعارات الطلبات المباشرة عبر الواتساب</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>بوابات دفع: الدفع عند الاستلام + المحافظ الإلكترونية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ربط شركات الشحن (بوسطة Bosta & مايلرز Mylerz)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>مستوى الدعم الفني: <strong>{plan.features_json.support_level}</strong></span>
                    </li>
                    {plan.features_json.remove_branding && (
                      <li className="flex items-center gap-2 text-amber-300 font-semibold">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>إزالة حقوق منصة VIPSTORE بالكامل</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlanId === plan.id}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : isVip
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-900/30'
                        : isPro
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {loadingPlanId === plan.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isCurrent ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>باقتك الحالية النشطة</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.price === 0 ? 'ابدأ التجربة المجانية' : 'اشترك الآن وفعل متجرك'}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* FAQ & Trust Banner */}
        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/80 text-center space-y-4">
          <h3 className="font-bold text-lg text-white">هل لديك استفسار حول الباقات والاشتراكات؟</h3>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto">
            جميع الاشتراكات تمنحك وصولاً كاملاً بدون قيود سرية أو عمولات اقتطاع من مبيعاتك. يمكنك الترقية أو تغيير الخطة في أي وقت من لوحة التحكم.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> ضمان تفعيل فوري
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <Zap className="w-4 h-4" /> لوحة تحكم فورية
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <CreditCard className="w-4 h-4" /> وسائل دفع آمنة 100%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
