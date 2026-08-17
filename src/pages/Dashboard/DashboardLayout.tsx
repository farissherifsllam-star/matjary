import React, { useState } from 'react';
import { db } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Order, Product, Category, Customer } from '../../types';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { InvoiceModal } from '../../components/InvoiceModal';
import { OverviewTab } from './OverviewTab';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { StoreBuilderTab } from './StoreBuilderTab';
import { CatalogTab } from './CatalogTab';
import { OrdersTab } from './OrdersTab';
import { CustomersTab } from './CustomersTab';
import { WhatsAppTab } from './WhatsAppTab';
import { PaymentGatewaysTab } from './PaymentGatewaysTab';
import { ShippingTab } from './ShippingTab';
import { AnalyticsTab } from './AnalyticsTab';
import { SeoTab } from './SeoTab';

import {
  LayoutDashboard,
  Settings,
  Palette,
  Package,
  ShoppingBag,
  Users,
  MessageCircle,
  CreditCard,
  Truck,
  TrendingUp,
  Search,
  Store as StoreIcon,
  ExternalLink,
  ChevronLeft,
  Crown,
  Menu,
  X,
  Layers
} from 'lucide-react';

interface DashboardLayoutProps {
  onNavigate: (path: string) => void;
  selectedStoreId?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onNavigate, selectedStoreId }) => {
  const { session, profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Store resolution
  const stores = db.getStores();
  let currentStore = selectedStoreId
    ? db.getStoreById(selectedStoreId)
    : profile?.id
    ? db.getStoreByOwner(profile.id)
    : stores[0];

  if (!currentStore && stores.length > 0) {
    currentStore = stores[0];
  }

  // If no store exists for the current user, auto-create one
  if (!currentStore && profile && user) {
    currentStore = db.createStore({
      owner_id: profile.id,
      store_name: `متجر ${profile.full_name?.split(' ')[0] || 'الجديد'}`,
      slug: `store-${Math.random().toString(36).substring(2, 6)}`,
      custom_domain: null,
      domain_verified: false,
      logo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
      favicon_url: null,
      description: 'متجر إلكتروني متكامل للبيع والشحن الفوري',
      support_email: user.email || 'support@mystore.com',
      currency: 'EGP',
      language: 'ar',
      theme_id: 'minimalist',
      primary_color: '#7C3AED',
      font_family: 'Cairo',
      button_style: 'rounded',
      layout_style: 'grid',
      is_active: true,
    });
    db.createSubscription(currentStore.id, 'plan-1-free', 'trialing');
  }

  const isSubActive = currentStore ? db.isSubscriptionActive(currentStore.id) : false;
  const currentSub = currentStore ? db.getSubscriptionByStoreId(currentStore.id) : null;
  const orders = currentStore ? db.getOrdersByStoreId(currentStore.id) : [];
  const products = currentStore ? db.getProductsByStoreId(currentStore.id) : [];
  const categories = currentStore ? db.getCategoriesByStoreId(currentStore.id) : [];
  const customers = currentStore ? db.getCustomers() : [];

  const navItems = [
    { id: 'overview', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag, badge: orders.filter((o) => o.status === 'new').length || undefined },
    { id: 'catalog', label: 'كتالوج المنتجات والأقسام', icon: Package, badge: products.length },
    { id: 'store_builder', label: 'منشئ القوالب (5 أنماط)', icon: Palette },
    { id: 'customers', label: 'العملاء (CRM)', icon: Users },
    { id: 'whatsapp', label: 'إشعارات الواتساب', icon: MessageCircle },
    { id: 'payments', label: 'بوابات وطرق الدفع', icon: CreditCard },
    { id: 'shipping', label: 'إعدادات الشحن والتوصيل', icon: Truck },
    { id: 'analytics', label: 'التحليلات والمبيعات', icon: TrendingUp },
    { id: 'seo', label: 'الـ SEO وأكواد البكسل', icon: Search },
    { id: 'general', label: 'الإعدادات العامة والرابط', icon: Settings },
  ];

  if (!currentStore) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-400">لا يوجد متجر مرتبط بهذا الحساب.</p>
          <button
            onClick={() => onNavigate('/pricing')}
            className="px-6 py-2.5 bg-purple-600 rounded-xl font-bold text-xs"
          >
            اختر باقة وأنشئ متجرك
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      
      {/* Top Banner: Subscription Enforcement Check (Section 7) */}
      <SubscriptionBanner
        storeId={currentStore.id}
        subscription={currentSub}
        onRenew={() => onNavigate('/pricing')}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between border-l border-slate-800 shrink-0">
          <div className="p-5 space-y-6">
            
            {/* Store switcher info */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="flex items-center gap-2.5">
                {currentStore.logo_url ? (
                  <img
                    src={currentStore.logo_url}
                    alt={currentStore.store_name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-600 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentStore.store_name.charAt(0)}
                  </div>
                )}
                <div className="truncate">
                  <h3 className="font-bold text-xs text-white truncate">{currentStore.store_name}</h3>
                  <span className="text-[10px] text-purple-400 font-mono" dir="ltr">
                    /{currentStore.slug}
                  </span>
                </div>
              </div>

              {/* Fast View Live Store Button */}
              <button
                onClick={() => onNavigate(`/store/${currentStore.slug}`)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-bold border border-purple-500/30 transition flex items-center justify-center gap-1.5"
              >
                <span>معاينة واجهة المتجر</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-5 border-t border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">حالة الاشتراك:</span>
              <span className={`font-bold ${isSubActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSubActive ? 'نشط ومفعل' : 'منتهي / بحاجة تجديد'}
              </span>
            </div>
            <button
              onClick={() => onNavigate('/pricing')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>ترقية أو تجديد الباقة</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header / Menu */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-around text-slate-400 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-purple-400' : ''}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-purple-400' : ''}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>الطلبات</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'catalog' ? 'text-purple-400' : ''}`}
          >
            <Package className="w-5 h-5" />
            <span>المنتجات</span>
          </button>
          <button
            onClick={() => setActiveTab('store_builder')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'store_builder' ? 'text-purple-400' : ''}`}
          >
            <Palette className="w-5 h-5" />
            <span>القالب</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-1"
          >
            <Menu className="w-5 h-5" />
            <span>المزيد</span>
          </button>
        </div>

        {/* Mobile Slide-over Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
            <div className="w-72 bg-slate-900 h-full p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">القائمة الكاملة</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === item.id ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => onNavigate(`/store/${currentStore.slug}`)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>معاينة المتجر المباشر</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 lg:pb-8">
          {activeTab === 'overview' && (
            <OverviewTab
              store={currentStore}
              orders={orders}
              products={products}
              customers={customers}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenOrderInvoice={(order) => setSelectedInvoiceOrder(order)}
              onPreviewStore={() => onNavigate(`/store/${currentStore.slug}`)}
            />
          )}

          {activeTab === 'general' && (
            <GeneralSettingsTab
              store={currentStore}
              isSubscriptionActive={isSubActive}
              onStoreUpdated={() => triggerRefresh()}
            />
          )}

          {activeTab === 'store_builder' && (
            <StoreBuilderTab
              store={currentStore}
              isSubscriptionActive={isSubActive}
              onStoreUpdated={() => triggerRefresh()}
              onPreviewStore={() => onNavigate(`/store/${currentStore.slug}`)}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogTab
              store={currentStore}
              products={products}
              categories={categories}
              isSubscriptionActive={isSubActive}
              onRefresh={() => triggerRefresh()}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              store={currentStore}
              orders={orders}
              isSubscriptionActive={isSubActive}
              onRefresh={() => triggerRefresh()}
              onOpenOrderInvoice={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              store={currentStore}
              customers={customers}
              orders={orders}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppTab
              store={currentStore}
              orders={orders}
              isSubscriptionActive={isSubActive}
              onStoreUpdated={() => triggerRefresh()}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentGatewaysTab
              store={currentStore}
              isSubscriptionActive={isSubActive}
            />
          )}

          {activeTab === 'shipping' && (
            <ShippingTab
              store={currentStore}
              isSubscriptionActive={isSubActive}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              store={currentStore}
              orders={orders}
              products={products}
            />
          )}

          {activeTab === 'seo' && (
            <SeoTab
              store={currentStore}
              isSubscriptionActive={isSubActive}
              onStoreUpdated={() => triggerRefresh()}
            />
          )}
        </main>

      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          store={currentStore}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

    </div>
  );
};
