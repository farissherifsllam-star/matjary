import React from 'react';
import { Order, Store } from '../types';
import { Printer, X, CheckCircle2, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, store, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const currency = store?.currency || 'EGP';
  const subtotal = order.items?.reduce((sum, item) => sum + item.total_price, 0) || order.total_amount;
  const shippingFee = 40.00; // estimated/standard
  const total = order.total_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Controls - Hidden on Print */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">فاتورة ضريبية رقمية للمتجر</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 font-mono">
              {order.order_number}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 sm:p-10 bg-white text-slate-800 space-y-8" id="printable-invoice">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                {store?.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.store_name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-black text-xl flex items-center justify-center">
                    {store?.store_name?.charAt(0) || 'V'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{store?.store_name || 'VIPSTORE'}</h1>
                  <p className="text-xs text-slate-500">{store?.custom_domain || `${store?.slug}.vipstore.me`}</p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-left dir-ltr">
              <div className="inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                INVOICE #{order.order_number}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                بيانات العميل المستلم:
              </h4>
              <p className="font-semibold text-slate-800">{order.customer?.name || 'عميل ضيف'}</p>
              <p className="text-slate-600 mt-1 flex items-center gap-1.5" dir="ltr">
                <Phone className="w-3 h-3 text-slate-400" /> {order.customer?.phone}
              </p>
              {order.customer?.email && (
                <p className="text-slate-600 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {order.customer.email}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                عنوان التوصيل والشحن:
              </h4>
              <p className="text-slate-700 font-medium">
                {order.shipping_address_json?.city} — {order.shipping_address_json?.street}
              </p>
              {order.shipping_address_json?.building && (
                <p className="text-slate-500 mt-0.5">{order.shipping_address_json.building}</p>
              )}
              {order.shipping_address_json?.notes && (
                <p className="text-slate-500 text-[11px] mt-1 bg-white p-1.5 rounded border border-slate-200">
                  ملاحظات العميل: {order.shipping_address_json.notes}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">المنتج / المواصفات</th>
                  <th className="py-2.5 px-2 text-center">الكمية</th>
                  <th className="py-2.5 px-2 text-left">سعر الوحدة</th>
                  <th className="py-2.5 px-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <tr key={item.id || i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-3 px-2 font-medium text-slate-800">
                        {item.product_name_snapshot}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-left text-slate-600 font-mono">
                        {item.unit_price.toFixed(2)} {currency}
                      </td>
                      <td className="py-3 px-2 text-left font-bold text-slate-900 font-mono">
                        {item.total_price.toFixed(2)} {currency}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      طلب إجمالي
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">طريقة الدفع:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                  {order.payment_method === 'cod' ? 'الدفع عند الاستلام (COD)' : order.payment_method === 'wallet' ? 'تحويل محفظة إلكترونية' : 'تحويل بنكي مباشر'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">حالة الدفع:</span>
                <span className={`px-2 py-0.5 rounded font-semibold ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {order.payment_status === 'paid' ? 'مدفوع' : 'قيد التحصيل'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>فاتورة معتمدة ومسجلة بنظام VIPSTORE للتجارة الإلكترونية</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{subtotal.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الشحن والتوصيل:</span>
                <span className="font-mono text-emerald-600">شحن قياسي</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                <span>المجموع الكلي:</span>
                <span className="font-mono text-purple-700">{total.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-6 border-t border-slate-100 text-[11px] text-slate-400">
            شكراً لثقتكم بنا وبمتجرنا! للاستفسارات يرجى التواصل عبر {store?.support_email || 'البريد الإلكتروني'}.
          </div>

        </div>

      </div>
    </div>
  );
};
