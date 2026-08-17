import React, { useState } from 'react';
import { db } from '../../lib/database';
import { auth } from '../../lib/auth';
import { Store, Plan, Subscription, SubscriptionStatus } from '../../types';
import {
  ShieldAlert,
  Crown,
  Store as StoreIcon,
  DollarSign,
  Users,
  Calendar,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Check,
  X
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (path: string) => void;
  onOpenSqlModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate, onOpenSqlModal }) => {
  const stores = db.getStores();
  const plans = db.getPlans();
  const orders = db.getOrders();
  const subscriptions = db.getSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubForEdit, setSelectedSubForEdit] = useState<{
    sub: Subscription;
    store: Store;
  } | null>(null);

  // Edit sub form state
  const [overridePlanId, setOverridePlanId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<SubscriptionStatus>('active');
  const [overrideDays, setOverrideDays] = useState<number>(30);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Platform calculations
  const totalPlatformRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length;

  const handleOpenEditSub = (store: Store) => {
    const sub = db.getSubscriptionByStoreId(store.id);
    if (!sub) return;
    setSelectedSubForEdit({ sub, store });
    setOverridePlanId(sub.plan_id);
    setOverrideStatus(sub.status);
    setOverrideDays(30);
  };

  const handleSaveSubOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForEdit) return;

    try {
      const endsAt =
        overrideStatus === 'active'
          ? new Date(Date.now() + overrideDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      db.updateSubscription(selectedSubForEdit.sub.id, {
        plan_id: overridePlanId,
        status: overrideStatus,
        ends_at: endsAt,
      });

      setFeedback({
        type: 'success',
        message: `تم تحديث وتمديد اشتراك متجر "${selectedSubForEdit.store.store_name}" بنجاح!`,
      });
      setSelectedSubForEdit(null);
    } catch (err: any) {
      alert(err.message || 'فشل التحديث');
    }
  };

  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.store_name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>لوحة التحكم الإدارية الفائقة (Super Admin Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              إدارة منصة VIPSTORE والمتاجر المشتركة
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSqlModal}
              className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>مخطط قواعد البيانات SQL</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              الذهاب للوحة التاجر
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">إجمالي المتاجر المنشأة</span>
            <div className="text-2xl font-black text-white font-mono">{stores.length}</div>
            <p className="text-[11px] text-purple-400">تغطي مختلف الأنشطة التجارية</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">الاشتراكات النشطة</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activeSubsCount}</div>
            <p className="text-[11px] text-slate-500">متاجر مفعلة تستقبل الطلبات</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">إجمالي مبيعات المتاجر</span>
            <div className="text-2xl font-black text-amber-400 font-mono">{totalPlatformRevenue.toFixed(2)} EGP</div>
            <p className="text-[11px] text-slate-500">حجم التداول الكلي للطلبات</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">إجمالي الطلبات المنفذة</span>
            <div className="text-2xl font-black text-blue-400 font-mono">{orders.length}</div>
            <p className="text-[11px] text-slate-500">تمت عبر دالة place_order()</p>
          </div>
        </div>

        {/* Stores and Subscription Management Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-white">قائمة المتاجر والتحكم بالاشتراكات (Section 12)</h3>
              <p className="text-xs text-slate-400">تعديل الباقات يدوياً، تمديد الصلاحيات، وفحص الحالات</p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المتجر أو الرابط..."
                className="w-full pl-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">المتجر</th>
                  <th className="py-3 px-4">الرابط المباشر</th>
                  <th className="py-3 px-4">الباقة الحالية</th>
                  <th className="py-3 px-4">حالة الاشتراك</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4 text-center">إجراءات المشرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStores.map((st) => {
                  const sub = db.getSubscriptionByStoreId(st.id);
                  const plan = sub ? plans.find((p) => p.id === sub.plan_id) : null;
                  const isActive = sub ? db.isSubscriptionActive(st.id) : false;

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          {st.logo_url ? (
                            <img src={st.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold">
                              {st.store_name.charAt(0)}
                            </div>
                          )}
                          <span>{st.store_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-purple-400" dir="ltr">
                        <a
                          href={`#/store/${st.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/store/${st.slug}`);
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>/store/{st.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">{plan?.name_ar || 'غير محدد'}</span>
                        <div className="text-[10px] text-slate-400">{plan?.interval}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {sub?.status === 'trialing' && 'تجريبي (Trial)'}
                          {sub?.status === 'active' && 'نشط ومفعل'}
                          {sub?.status === 'expired' && 'منتهي الصلاحية'}
                          {sub?.status === 'cancelled' && 'ملغي'}
                          {!sub && 'بدون اشتراك'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {sub?.ends_at
                          ? new Date(sub.ends_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'مدى الحياة (مفتوح)'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenEditSub(st)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/30 transition flex items-center gap-1 mx-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل وتمديد الاشتراك</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Subscription Modal */}
        {selectedSubForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
              
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>تعديل اشتراك: {selectedSubForEdit.store.store_name}</span>
                </h3>
                <button
                  onClick={() => setSelectedSubForEdit(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubOverride} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    تعيين الخطة / الباقة
                  </label>
                  <select
                    value={overridePlanId}
                    onChange={(e) => setOverridePlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_ar} ({p.price} EGP / {p.interval})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    حالة الاشتراك
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as SubscriptionStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="active">نشط ومفعل (Active)</option>
                    <option value="trialing">فترة تجريبية (Trialing)</option>
                    <option value="expired">منتهي (Expired)</option>
                    <option value="cancelled">ملغي (Cancelled)</option>
                  </select>
                </div>

                {overrideStatus === 'active' && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      تمديد الصلاحية لعدد (أيام) إضافية
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      value={overrideDays}
                      onChange={(e) => setOverrideDays(parseInt(e.target.value, 10) || 30)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSubForEdit(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
                  >
                    تطبيق التغييرات
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
