import React from 'react';
import { Store, Order, Product, Customer } from '../../types';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  Eye
} from 'lucide-react';

interface OverviewTabProps {
  store: Store;
  orders: Order[];
  products: Product[];
  customers: any[];
  onNavigateTab: (tab: string) => void;
  onOpenOrderInvoice: (order: Order) => void;
  onPreviewStore: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  store,
  orders,
  products,
  customers,
  onNavigateTab,
  onOpenOrderInvoice,
  onPreviewStore,
}) => {
  const currency = store.currency || 'EGP';

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const pendingOrders = orders.filter((o) => o.status === 'new' || o.status === 'processing');
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 5);

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-800/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ● متجر مباشر نشط
            </span>
            <span className="text-xs text-slate-400 font-mono">
              vipstore.me/store/{store.slug}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            مرحباً بك في لوحة تحكم {store.store_name}
          </h2>
          <p className="text-xs text-slate-300">
            لديك <strong className="text-purple-300">{pendingOrders.length} طلبات جديدة</strong> بحاجة إلى معالجة وشحن اليوم.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewStore}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة واجهة المتجر</span>
          </button>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalRevenue.toFixed(2)} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% نمو هذا الشهر</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلبات</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {orders.length} <span className="text-xs font-normal text-slate-500">طلب</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold mt-1">
              <span>{deliveredOrders.length} تم تسليمها بنجاح</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المنتجات في الكتالوج</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {products.length} <span className="text-xs font-normal text-slate-500">منتج نشط</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
              <span>{lowStockProducts.length} منتجات أوشكت على النفاد</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">قاعدة العملاء</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {customers.length} <span className="text-xs font-normal text-slate-500">عميل مسجل</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-1">
              <span>تحديث دوري عبر نظام الـ CRM</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders and Stock Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">أحدث طلبات المتجر</h3>
              <p className="text-xs text-slate-400">سجل لحظي لعمليات الشراء الواردة</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
            >
              عرض كافة الطلبات ({orders.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">الإجمالي</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الفاتورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{order.customer?.name || 'عميل ضيف'}</div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{order.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {order.total_amount.toFixed(2)} {currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.status === 'new' && 'طلب جديد'}
                        {order.status === 'processing' && 'قيد التجهيز'}
                        {order.status === 'shipped' && 'تم الشحن'}
                        {order.status === 'delivered' && 'تم التسليم'}
                        {order.status === 'cancelled' && 'ملغي'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenOrderInvoice(order)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold transition"
                      >
                        عرض الفاتورة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stock & Catalog Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">متابعة المخزون الحرج</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                تنبيه مخزون
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {p.images && p.images[0] ? (
                      <img
                        src={p.images[0].image_url}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.price.toFixed(2)} {currency}</p>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      p.stock_quantity <= 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.stock_quantity} قطع
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('store_builder')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition text-center block"
            >
              تخصيص وتعديل واجهة المتجر (5 قوالب)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
