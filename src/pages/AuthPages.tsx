import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
import { Crown, Sparkles, Phone, Mail, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Store } from 'lucide-react';

interface AuthPagesProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode, onNavigate }) => {
  const { requestOtp, verifyOtp, loginAs, session } = useAuth();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('+201012345678');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const target = authMethod === 'phone' ? phone.trim() : email.trim();
    if (!target) {
      setError(authMethod === 'phone' ? 'يرجى إدخال رقم الهاتف' : 'يرجى إدخال البريد الإلكتروني');
      setIsLoading(false);
      return;
    }

    try {
      const res = requestOtp(target, mode === 'register', 'merchant');
      if (res.demoCode) {
        setDevCode(res.demoCode);
      }
      setStep('otp');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الرمز');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      verifyOtp(otpCode.trim(), fullName || 'تاجر VIP');
      
      if (session && mode === 'register' && storeName) {
        // Auto create store if registered
        const existingStore = db.getStoreByOwner(session.profile.id);
        if (!existingStore) {
          const newSlug = storeName
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u0621-\u064A-]+/g, '') || `store-${Math.random().toString(36).substring(2, 6)}`;

          const store = db.createStore({
            owner_id: session.profile.id,
            store_name: storeName,
            slug: newSlug,
            custom_domain: null,
            domain_verified: false,
            logo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
            favicon_url: null,
            description: 'متجرنا الإلكتروني المتكامل',
            support_email: session.user.email || 'support@mystore.com',
            currency: 'EGP',
            language: 'ar',
            theme_id: 'minimalist',
            primary_color: '#7C3AED',
            font_family: 'Cairo',
            button_style: 'rounded',
            layout_style: 'grid',
            is_active: true,
          });

          // Give 7-day free trial automatically
          db.createSubscription(store.id, 'plan-1-free', 'trialing');
        }
      }

      setIsLoading(false);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح');
      setIsLoading(false);
    }
  };

  const handleFastDemoLogin = (role: 'merchant' | 'super_admin') => {
    loginAs(role);
    if (role === 'super_admin') {
      onNavigate('/admin');
    } else {
      onNavigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-purple-950/30 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40 text-white">
            <Crown className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {mode === 'login' && 'تسجيل الدخول إلى VIPSTORE'}
            {mode === 'register' && 'إنشاء متجر جديد في دقيقة'}
            {mode === 'forgot-password' && 'استعادة الوصول للحساب'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'أدخل رقم هاتفك أو بريدك لتلقي رمز الدخول المباشر'}
            {mode === 'register' && 'ابدأ تجارتك الإلكترونية مع 7 أيام تجربة مجانية لكافة المميزات'}
            {mode === 'forgot-password' && 'أدخل بيانات حسابك لإرسال رمز التحقق الأمني'}
          </p>
        </div>

        {/* Fast Demo Accounts Bar */}
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2">
          <div className="text-[11px] font-bold text-purple-300 flex items-center justify-between">
            <span>تجربة سريعة بدون إدخال OTP:</span>
            <span className="text-[10px] text-amber-400 font-mono">1-Click Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleFastDemoLogin('merchant')}
              className="py-1.5 px-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/30 transition text-center"
            >
              حساب تاجر نشط
            </button>
            <button
              onClick={() => handleFastDemoLogin('super_admin')}
              className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition text-center"
            >
              حساب سوبر أدمن
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Step 1: Input Details */}
        {step === 'input' && (
          <form onSubmit={handleSubmitInitial} className="space-y-4">
            
            {/* Toggle phone vs email */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  authMethod === 'phone' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>رقم الهاتف (SMS)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  authMethod === 'email' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>البريد الإلكتروني</span>
              </button>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الاسم الكامل للتاجر
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد محمود"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم المتجر التجاري
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="مثال: بوتيك الأناقة الملكية"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-purple-500 transition"
                  />
                </div>
              </>
            )}

            {authMethod === 'phone' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الهاتف (مع كود الدولة)
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+201012345678"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-hidden focus:border-purple-500 transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-purple-500 transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>إرسال رمز التحقق (OTP)</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>تم إرسال الرمز إلى:</span>
                <span className="font-mono text-purple-300 font-bold" dir="ltr">
                  {authMethod === 'phone' ? phone : email}
                </span>
              </div>
              
              {/* Section 6 Dev Mock OTP Bypass indicator */}
              {import.meta.env.DEV && (
                <div className="pt-2 mt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-amber-300">
                  <span>كود الاختبار السريع (Dev OTP):</span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/40 transition"
                  >
                    123456 (اضغط للتعبئة)
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                أدخل رمز التحقق المكون من 6 أرقام
              </label>
              <input
                type="text"
                required
                maxLength={6}
                dir="ltr"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-lg font-mono tracking-widest focus:outline-hidden focus:border-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الرمز والدخول للمتجر</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('input'); setOtpCode(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition py-1"
            >
              تغيير رقم الهاتف أو البريد
            </button>

          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              ليس لديك متجر بعد؟{' '}
              <button
                onClick={() => onNavigate('/auth/register')}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                سجل متجرك مجاناً
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => onNavigate('/auth/login')}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
