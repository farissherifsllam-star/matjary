import React from 'react';
import { AlertTriangle, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import { Subscription } from '../types';

interface SubscriptionBannerProps {
  subscription: Subscription | null;
  isActive: boolean;
  onUpgradeClick: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  subscription,
  isActive,
  onUpgradeClick,
}) => {
  if (isActive && subscription?.status === 'active') {
    // If active and lifetime, no banner needed
    if (!subscription.ends_at) return null;
    
    // Check if expiring in less than 3 days
    const daysLeft = Math.ceil(
      (new Date(subscription.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft > 3) return null;

    return (
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>تنبيه تجديد:</strong> اشتراك متجرك ينتهي خلال <strong>{daysLeft} أيام</strong>. جدد الآن لضمان استمرار استقبال الطلبات دون انقطاع.
          </span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold transition active:scale-95 cursor-pointer"
        >
          <span>تجديد الاشتراك</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (isActive && subscription?.status === 'trialing') {
    const daysLeft = subscription.ends_at
      ? Math.max(0, Math.ceil((new Date(subscription.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 7;

    return (
      <div className="bg-purple-50 border-b border-purple-200 text-purple-950 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
            فترة تجريبية مجانية
          </span>
          <span>
            متبقي في فترتك التجريبية <strong>{daysLeft} أيام</strong>. استمتع بكافة المميزات أو قم بالترقية لخطة احترافية.
          </span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition active:scale-95 cursor-pointer shadow-xs"
        >
          <span>ترقية لـ Pro الآن</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // If subscription has expired / inactive
  return (
    <div className="bg-rose-600 text-white px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="w-5 h-5 text-rose-200 shrink-0" />
        <div>
          <strong className="text-sm block sm:inline">انتهى اشتراك المتجر — تم تقييد التعديل وعمليات الدفع!</strong>
          <span className="text-rose-100 mr-2">
            يمكنك تصفح بياناتك ولوحة التحكم، لكن تم إيقاف إنشاء وتعديل المنتجات وإتمام طلبات الشراء حتى يتم تجديد الاشتراك.
          </span>
        </div>
      </div>
      <button
        onClick={onUpgradeClick}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-rose-700 hover:bg-rose-50 rounded-lg font-bold transition shadow-sm active:scale-95 cursor-pointer shrink-0"
      >
        <span>تجديد أو ترقية الخطة</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
};
