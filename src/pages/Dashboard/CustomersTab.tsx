import React, { useState } from 'react';
import { Store, Customer, Order } from '../../types';
import { Users, Search, ShoppingBag, Phone, Mail, MapPin, Calendar, DollarSign, MessageCircle } from 'lucide-react';

interface CustomersTabProps {
  store: Store;
  customers: Customer[];
  orders: Order[];
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ store, customers, orders }) => {
  const currency = store.currency || 'EGP';
  const [searchQuery, setSearchQuery] = useState('');

  // Compute stats per customer
  const customerStats = customers.map((c) => {
    const customerOrders = orders.filter((o) => o.customer_id === c.id || (c.phone && o.customer?.phone === c.phone));
    const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].created_at : c.created_at;

    return {
      ...c,
      ordersCount: customerOrders.length,
      totalSpent,
      lastOrderDate,
    };
  });

  const filteredCustomers = customerStats.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة علاقات العملاء (Customer CRM)</h2>
          <p className="text-xs text-slate-500">
            سجل شامل للعملاء الذين قاموا بالشراء، مع إجمالي إنفاقهم وعدد طلباتهم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200">
            إجمالي العملاء: {customers.length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم العميل، رقم الهاتف، أو البريد الإلكتروني..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">اسم العميل</th>
                <th className="py-3.5 px-4">معلومات الاتصال</th>
                <th className="py-3.5 px-4">المدينة / العنوان</th>
                <th className="py-3.5 px-4">عدد الطلبات</th>
                <th className="py-3.5 px-4">إجمالي الإنفاق</th>
                <th className="py-3.5 px-4">آخر طلب</th>
                <th className="py-3.5 px-4 text-center">تواصل سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    لا يوجد عملاء مسجلين حالياً.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const cleanPhone = c.phone?.replace(/\D/g, '') || '';
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`مرحباً ${c.name}، معك متجر ${store.store_name}، نتمنى لك يوماً سعيداً!`)}`;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-slate-800 font-mono flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone || 'غير مسجل'}</span>
                        </div>
                        {c.email && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1" dir="ltr">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{c.city || 'القاهرة'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                          {c.ordersCount} طلبات
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-purple-700 text-xs">
                        {c.totalSpent.toFixed(2)} {currency}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(c.lastOrderDate).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {cleanPhone ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
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
