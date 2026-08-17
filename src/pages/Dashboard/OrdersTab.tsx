import React, { useState } from 'react';
import { Store, Order, OrderStatus } from '../../types';
import { db } from '../../lib/database';
import {
  ShoppingBag,
  FileText,
  MessageCircle,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  User,
  Filter
} from 'lucide-react';

interface OrdersTabProps {
  store: Store;
  orders: Order[];
  isSubscriptionActive: boolean;
  onRefresh: () => void;
  onOpenOrderInvoice: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  store,
  orders,
  isSubscriptionActive,
  onRefresh,
  onOpenOrderInvoice,
}) => {
  const currency = store.currency || 'EGP';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (!isSubscriptionActive) {
      alert('لا يمكن تعديل حالة الطلبات لأن اشتراكك منتهي.');
      return;
    }
    db.updateOrderStatus(orderId, newStatus);
    onRefresh();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة ومتابعة طلبات المتجر</h2>
          <p className="text-xs text-slate-500">
            تحديث الحالات لحظياً، طباعة الفواتير الضريبية، ومراسلة العملاء عبر الواتساب
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200">
            إجمالي الطلبات: {orders.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="text-xs text-slate-500 ml-1">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'new', label: 'جديد' },
            { id: 'processing', label: 'قيد التجهيز' },
            { id: 'shipped', label: 'تم الشحن' },
            { id: 'delivered', label: 'تم التسليم' },
            { id: 'cancelled', label: 'ملغي' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">رقم الطلب والتاريخ</th>
                <th className="py-3.5 px-4">بيانات العميل</th>
                <th className="py-3.5 px-4">المنتجات المطلوبة</th>
                <th className="py-3.5 px-4">طريقة الدفع</th>
                <th className="py-3.5 px-4">المبلغ الإجمالي</th>
                <th className="py-3.5 px-4">حالة الطلب</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    لا توجد طلبات مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerPhone = order.customer?.phone?.replace(/\D/g, '') || '';
                  const waMessage = encodeURIComponent(
                    `مرحباً ${order.customer?.name || 'عميلنا العزيز'}، بخصوص طلبك رقم #${order.order_number} بقيمة ${order.total_amount} ${currency} من متجر ${store.store_name}، نود إعلامك بأن حالة طلبك الحالية: ${
                      order.status === 'new'
                        ? 'تم الاستلام وجاري التجهيز'
                        : order.status === 'processing'
                        ? 'قيد التجهيز والتغليف'
                        : order.status === 'shipped'
                        ? 'تم تسليمه لشركة الشحن'
                        : order.status === 'delivered'
                        ? 'تم التسليم بنجاح، شكراً لتسوقك معنا'
                        : 'تم الإلغاء'
                    }`
                  );
                  const waUrl = `https://wa.me/${customerPhone}?text=${waMessage}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-slate-900">{order.order_number}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{order.customer?.name || 'عميل ضيف'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customer?.phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {order.shipping_address_json?.city} - {order.shipping_address_json?.address}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.items?.map((item) => (
                            <div key={item.id} className="text-[11px] text-slate-700">
                              <span className="font-bold">{item.product?.name}</span>{' '}
                              <span className="text-slate-400 font-mono">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {order.payment_method === 'cod' && 'الدفع عند الاستلام'}
                          {order.payment_method === 'wallet' && 'محفظة إلكترونية'}
                          {order.payment_method === 'bank_transfer' && 'تحويل بنكي'}
                          {order.payment_method === 'card' && 'بطاقة بنكية'}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {order.payment_status === 'paid' ? '● مدفوع' : '● معلق عند التسليم'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-purple-700 text-sm">
                        {order.total_amount.toFixed(2)}{' '}
                        <span className="text-[10px] font-normal text-slate-500">{currency}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={!isSubscriptionActive}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          <option value="new">طلب جديد</option>
                          <option value="processing">قيد التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Invoice Modal Trigger */}
                          <button
                            onClick={() => onOpenOrderInvoice(order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold transition"
                            title="عرض وطباعة الفاتورة الضريبية"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Customer Link */}
                          {customerPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                              title="مراسلة العميل بتحديث الطلب عبر واتساب"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
