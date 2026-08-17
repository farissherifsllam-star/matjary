import React, { useState } from 'react';
import { Store, PaymentSettings } from '../../types';
import { db } from '../../lib/database';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';

interface PaymentGatewaysTabProps {
  store: Store;
  isSubscriptionActive: boolean;
}

export const PaymentGatewaysTab: React.FC<PaymentGatewaysTabProps> = ({ store, isSubscriptionActive }) => {
  const currentSettings = db.getPaymentSettings(store.id);

  const [codEnabled, setCodEnabled] = useState(currentSettings?.cod_enabled ?? true);
  const [walletEnabled, setWalletEnabled] = useState(currentSettings?.wallet_enabled ?? true);
  const [walletNumber, setWalletNumber] = useState(currentSettings?.wallet_number || '01012345678');
  const [walletInstructions, setWalletInstructions] = useState(
    currentSettings?.wallet_instructions || 'يرجى تحويل المبلغ عبر فودافون كاش أو إنستاباي (InstaPay) ثم إرفاق صورة الإيصال.'
  );

  const [bankEnabled, setBankEnabled] = useState(currentSettings?.bank_transfer_enabled ?? false);
  const [bankName, setBankName] = useState(currentSettings?.bank_name || 'البنك الأهلي المصري');
  const [bankAccountHolder, setBankAccountHolder] = useState(currentSettings?.bank_account_holder || store.store_name);
  const [bankIban, setBankIban] = useState(currentSettings?.bank_iban || 'EG0000000000000000000000000');

  const [paymobEnabled, setPaymobEnabled] = useState(currentSettings?.paymob_enabled ?? false);
  const [paymobApiKey, setPaymobApiKey] = useState(currentSettings?.paymob_api_key || '');
  const [paymobIntegrationId, setPaymobIntegrationId] = useState(currentSettings?.paymob_integration_id || '');

  const [paypalEnabled, setPaypalEnabled] = useState(currentSettings?.paypal_enabled ?? false);
  const [paypalClientId, setPaypalClientId] = useState(currentSettings?.paypal_client_id || '');

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
      db.updatePaymentSettings(store.id, {
        cod_enabled: codEnabled,
        wallet_enabled: walletEnabled,
        wallet_number: walletNumber.trim() || null,
        wallet_instructions: walletInstructions.trim() || null,
        bank_transfer_enabled: bankEnabled,
        bank_name: bankName.trim() || null,
        bank_account_holder: bankAccountHolder.trim() || null,
        bank_iban: bankIban.trim() || null,
        paymob_enabled: paymobEnabled,
        paymob_api_key: paymobApiKey.trim() || null,
        paymob_integration_id: paymobIntegrationId.trim() || null,
        paypal_enabled: paypalEnabled,
        paypal_client_id: paypalClientId.trim() || null,
      });

      setFeedback({ type: 'success', message: 'تم حفظ وتحديث بوابات الدفع للمتجر بنجاح!' });
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
        <h2 className="text-xl font-black text-slate-900">بوابات وطرق الدفع (Payment Gateways)</h2>
        <p className="text-xs text-slate-500">
          تفعيل الدفع عند الاستلام، المحافظ الإلكترونية، التحويل البنكي وبوابات الدفع الإلكتروني
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
        
        {/* Gateway 1: Cash on Delivery (COD) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">الدفع عند الاستلام (COD)</h3>
                <p className="text-xs text-slate-400">تحصيل قيمة الطلب نقداً من العميل وقت تسليم الشحنة</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Gateway 2: Mobile Wallets & InstaPay */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">المحافظ الإلكترونية وإنستاباي (Vodafone Cash & InstaPay)</h3>
                <p className="text-xs text-slate-400">استلام التحويلات الفورية من محافظ فودافون كاش، أورنج، اتصالات وإنستاباي</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={walletEnabled}
                onChange={(e) => setWalletEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {walletEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم المحفظة / معرّف InstaPay *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  placeholder="01012345678 أو username@instapay"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تعليمات الدفع للعميل
                </label>
                <input
                  type="text"
                  disabled={!isSubscriptionActive}
                  value={walletInstructions}
                  onChange={(e) => setWalletInstructions(e.target.value)}
                  placeholder="مثال: يرجى إرسال لقطة شاشة للإيصال عبر واتساب"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gateway 3: Bank Transfer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">التحويل البنكي المباشر (Bank Wire)</h3>
                <p className="text-xs text-slate-400">إتاحة التحويل إلى حسابك البنكي ورقم الآيبان الدولي</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={bankEnabled}
                onChange={(e) => setBankEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {bankEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم البنك
                </label>
                <input
                  type="text"
                  disabled={!isSubscriptionActive}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="البنك الأهلي المصري"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم صاحب الحساب
                </label>
                <input
                  type="text"
                  disabled={!isSubscriptionActive}
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="اسم الشركة أو التاجر"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الآيبان (IBAN)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  placeholder="EG1234567890123456789012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gateway 4: Paymob Gateway */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">بوابة بيموب (Paymob Payment Gateway)</h3>
                <p className="text-xs text-slate-400">قبول البطاقات البنكية فيزا / ماستركارد وميزة والتقسيط</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isSubscriptionActive}
                checked={paymobEnabled}
                onChange={(e) => setPaymobEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {paymobEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paymob API Secret Key
                </label>
                <input
                  type="password"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={paymobApiKey}
                  onChange={(e) => setPaymobApiKey(e.target.value)}
                  placeholder="ZXlKaGJHY2lPaUpJVX..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Integration ID
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!isSubscriptionActive}
                  value={paymobIntegrationId}
                  onChange={(e) => setPaymobIntegrationId(e.target.value)}
                  placeholder="412589"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white"
                />
              </div>
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
                <span>حفظ إعدادات بوابات الدفع</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
