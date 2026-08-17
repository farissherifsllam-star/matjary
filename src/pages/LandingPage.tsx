import React from 'react';
import {
  Crown,
  Sparkles,
  Store,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Palette,
  MessageCircle,
  Truck,
  Database,
  Layers,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { db } from '../lib/database';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenSqlModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenSqlModal }) => {
  const demoStore = db.getStoreBySlug('elegance') || db.getStores()[0];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>المنصة الأحدث لبناء وإدارة المتاجر في العالم العربي</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.2]">
              اصنع متجرك الإلكتروني الفاخر وابدأ البيع باحترافية
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
              منصة <span className="text-purple-400 font-bold">VIPSTORE</span> تمنحك متجراً عصرياً متكاملاً (مثل سلة وزد وشوبيفاي) مع تحكم كامل في القوالب، بوابات الدفع، الشحن الفوري، وإشعارات الواتساب بدون عمولة على مبيعاتك.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('/auth/register')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-purple-900/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>ابدأ متجرك مجاناً (7 أيام)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/store/elegance')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>معاينة متجر تجريبي مباشر</span>
              </button>

              <button
                onClick={onOpenSqlModal}
                className="px-4 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>كود PostgreSQL & RLS</span>
              </button>
            </div>

            {/* Key trust badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                دقة مالية NUMERIC(10,2)
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                حماية المخزون عبر Atomic Locking
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                إشعارات الواتساب للطلبات
              </span>
            </div>

          </div>

          {/* Interactive Live Store Preview Showcase */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-3 sm:p-5 shadow-2xl shadow-purple-950/40">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="mr-2 font-mono text-[11px] text-slate-400">
                  https://vipstore.me/store/{demoStore?.slug || 'elegance'}
                </span>
              </div>
              <button
                onClick={() => onNavigate(`/store/${demoStore?.slug || 'elegance'}`)}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>فتح المتجر بالكامل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Store Showcase Preview Frame */}
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              
              <div className="md:col-span-7 space-y-4">
                <div className="inline-block px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                  متجر حقيقي نشط يعمل الآن
                </div>
                <h3 className="text-2xl font-black text-white">{demoStore?.store_name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {demoStore?.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block">القالب المستخدم:</span>
                    <span className="font-bold text-purple-300">قالب الفخامة الملكية (Luxury)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block">طرق الدفع:</span>
                    <span className="font-bold text-emerald-400">عند الاستلام + المحافظ الذكية</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => onNavigate(`/store/${demoStore?.slug || 'elegance'}`)}
                    className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow"
                  >
                    <span>تجربة الشراء والـ Checkout كعميل ضيف</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                  >
                    <span>لوحة تحكم المتجر</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-5 relative">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
                  alt="Store Preview"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl border border-slate-800 shadow-md"
                />
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-bold text-amber-300">
                  خصم 23% على تشكيلة الساعات
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6 Core Platform Pillars */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              مميزات صممت لنمو تجارتك
            </span>
            <h2 className="text-3xl font-black text-white">كل ما يحتاجه التاجر لإدارة مبيعاته بكل سلاسة</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">منشئ المتاجر المتقدم (5 قوالب)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                اختر من بين 5 قوالب فاخرة (التبسيطي، الداكن الحديث، التجاري الجريء، البنفسجي الملكي، والأبيض الكلاسيكي) مع تخصيص الألوان والخطوط وترتيب الأقسام.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">شراء ذري وحماية المخزون (Atomic RPC)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                تنفيذ الطلبات يتم عبر دالة <code className="font-mono text-emerald-400">place_order()</code> المحمية بقفل سطري يمنع البيع الزائد تماماً ويحدث المخزون لحظياً.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">إشعارات الواتساب التلقائية</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                إنشاء روابط <code className="font-mono text-amber-400">wa.me</code> جاهزة ومجهزة بتفاصيل الطلب وبيانات العميل لإرسال تحديثات الشحن والمتابعة بنقرة زر.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">ربط شركات الشحن (بوسطة ومايلرز)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                إعدادات شحن مخصصة لشركات Bosta و Mylerz والشحن اليدوي مع حساب تلقائي لرسوم التوصيل وتتبع الشحنات.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">تحليلات المبيعات وCRM العملاء</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                لوحة إحصائيات للمبيعات اليومية والشهرية، المنتجات الأكثر طلباً، وسجل كامل لبيانات العملاء وقيمة مشترياتهم.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-base text-white">فواتير رقمية قابلة للطباعة والتصدير</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                توليد فواتير ضريبية مفصلة لكل طلب تلقائياً مطابقة للمواصفات القياسية وجاهزة للطباعة والتصدير إلى ملفات PDF.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            جاهز لإطلاق متجرك وتحقيق أولى مبيعاتك؟
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            انضم إلى مئات التجار الذين يديرون تجارتهم بكفاءة وأمان مع VIPSTORE. اختر باقتك المفضلة وابدأ الآن.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/pricing')}
              className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition active:scale-95 cursor-pointer"
            >
              استعراض الباقات والأسعار (7 باقات)
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              تجربة لوحة التحكم
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
