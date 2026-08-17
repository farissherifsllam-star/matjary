import React, { useState } from 'react';
import { db } from '../../lib/database';
import { Store, Product, Category, Order, CartItem, StoreThemeId } from '../../types';
import { InvoiceModal } from '../../components/InvoiceModal';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Search,
  Check,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  X,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  ShieldCheck,
  Star,
  CheckCircle2,
  FileText,
  MessageCircle,
  ExternalLink,
  Crown
} from 'lucide-react';

interface StorefrontViewProps {
  storeSlug: string;
  onNavigate: (path: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({ storeSlug, onNavigate }) => {
  const store = db.getStoreBySlug(storeSlug) || db.getStores()[0];
  const currency = store?.currency || 'EGP';

  // Products and Categories
  const products = store ? db.getProductsByStoreId(store.id).filter((p) => p.is_active) : [];
  const categories = store ? db.getCategoriesByStoreId(store.id) : [];
  const shippingSettings = store ? db.getShippingSettings(store.id) : null;
  const paymentSettings = store ? db.getPaymentSettings(store.id) : null;

  // Store Customization & Theme
  const themeId: StoreThemeId = store?.theme_id || 'luxury_purple';
  const primaryColor = store?.primary_color || '#7C3AED';
  const buttonStyle = store?.button_style || 'pill';

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Product Quick View Modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment' | 'success'>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingCity, setShippingCity] = useState('القاهرة');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'wallet' | 'bank_transfer'>('cod');
  const [walletReceiptNumber, setWalletReceiptNumber] = useState('');

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-400">عذراً، هذا المتجر غير موجود أو تم إيقافه.</p>
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-purple-600 rounded-xl font-bold text-xs"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Calculate Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Shipping calculation
  const flatRate = shippingSettings?.flat_rate ?? 50.00;
  const freeThreshold = shippingSettings?.free_shipping_threshold ?? 500.00;
  const shippingFee = cartSubtotal >= freeThreshold ? 0 : flatRate;
  const cartTotal = cartSubtotal + shippingFee;

  // Add to cart
  const handleAddToCart = (product: Product, quantity = 1, variants: Record<string, string> = {}) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + quantity;
      if (newQty > product.stock_quantity) {
        alert(`عذراً، الكمية المتوفرة في المخزون هي ${product.stock_quantity} فقط.`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      if (quantity > product.stock_quantity) {
        alert(`عذراً، الكمية المتوفرة في المخزون هي ${product.stock_quantity} فقط.`);
        return;
      }
      setCart([...cart, { product, quantity, selected_variants: variants }]);
    }
    setActiveProduct(null);
    setIsCartOpen(true);
  };

  // Update cart item quantity
  const handleUpdateCartQty = (index: number, delta: number) => {
    const item = cart[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else if (newQty > item.product.stock_quantity) {
      alert(`الكمية القصوى المتاحة في المخزون هي ${item.product.stock_quantity}.`);
    } else {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  // Atomic Place Order execution (Section 5 & 11)
  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);

    if (cart.length === 0) {
      setCheckoutError('السلة فارغة!');
      setIsSubmitting(false);
      return;
    }

    try {
      const orderPayload = {
        store_id: store.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        shipping_address: {
          city: shippingCity,
          address: shippingAddress.trim(),
          notes: customerNotes.trim() || undefined,
        },
        items: cart.map((c) => ({
          product_id: c.product.id,
          quantity: c.quantity,
          variant_name: c.selected_variants ? Object.values(c.selected_variants).join(' / ') : undefined,
        })),
        payment_method: selectedPaymentMethod,
        shipping_fee: shippingFee,
      };

      // Call Atomic Database Engine
      const order = db.placeOrder(orderPayload);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6']
      });

      setCompletedOrder(order);
      setCart([]);
      setCheckoutStep('success');
      setIsSubmitting(false);
    } catch (err: any) {
      setCheckoutError(err.message || 'حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة مجدداً.');
      setIsSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Dynamic Theme Styling wrapper
  const isDarkTheme = themeId === 'modern_dark' || themeId === 'luxury_purple';
  const pageBgClass =
    themeId === 'modern_dark'
      ? 'bg-slate-950 text-slate-100'
      : themeId === 'luxury_purple'
      ? 'bg-slate-900 text-slate-100'
      : themeId === 'bold_commerce'
      ? 'bg-slate-50 text-slate-900'
      : 'bg-white text-slate-900';

  const cardBgClass =
    isDarkTheme ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  const buttonShapeClass =
    buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-xs' : 'rounded-xl';

  return (
    <div className={`min-h-screen ${pageBgClass} font-sans`} dir="rtl">
      
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white text-center py-2 px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
        <Crown className="w-3.5 h-3.5 text-amber-300" />
        <span>شحن مجاني لكافة الطلبات الأكثر من {freeThreshold} {currency} | الدفع عند الاستلام متاح</span>
      </div>

      {/* Store Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'} px-4 sm:px-8 py-3.5 transition`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow">
                {store.store_name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-black text-sm sm:text-base">{store.store_name}</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {store.description || 'متجر إلكتروني رسمي معتمد'}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في منتجات المتجر..."
              className={`w-full pl-3 pr-9 py-2 rounded-xl text-xs focus:outline-hidden ${
                isDarkTheme
                  ? 'bg-slate-900 border border-slate-800 text-white focus:border-purple-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 focus:border-purple-600'
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Actions: Cart Button & WhatsApp */}
          <div className="flex items-center gap-2.5">
            {store.whatsapp_phone && (
              <a
                href={`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً متجر ${store.store_name}، لدي استفسار بخصوص المنتجات.`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition text-xs font-bold hidden sm:flex items-center gap-1.5"
                title="تواصل معنا عبر واتساب"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative px-4 py-2.5 ${buttonShapeClass} bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition flex items-center gap-2 active:scale-95 cursor-pointer`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>السلة ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
              {cart.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5"></span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Dynamic Hero Section */}
        <section className={`relative rounded-3xl overflow-hidden border p-8 sm:p-12 shadow-2xl ${
          themeId === 'luxury_purple'
            ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-purple-900/40 text-white'
            : themeId === 'modern_dark'
            ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800 text-white'
            : 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-slate-200 text-slate-900'
        }`}>
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              تشكيلة حصرية فاخرة
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              أفضل المنتجات بأعلى معايير الجودة والضمان
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              تسوق الآن واستمتع بتوصيل سريع لباب منزلك مع خيارات الدفع عند الاستلام والمحافظ الإلكترونية.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#products-section"
                className={`px-6 py-3 ${buttonShapeClass} bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition inline-flex items-center gap-2`}
              >
                <span>تصفح المنتجات الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 ${buttonShapeClass} font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : isDarkTheme
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              جميع المنتجات ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 ${buttonShapeClass} font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow'
                    : isDarkTheme
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid Section */}
        <section id="products-section" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
            <h3 className="font-black text-lg sm:text-xl">
              {selectedCategory === 'all'
                ? 'جميع منتجات المتجر'
                : categories.find((c) => c.id === selectedCategory)?.name || 'المنتجات'}
            </h3>
            <span className="text-xs text-slate-400">
              عرض {filteredProducts.length} من {products.length} منتج
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-slate-400 text-xs">لا توجد منتجات مطابقة في هذا القسم حالياً.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-purple-400 underline font-bold"
              >
                إظهار كافة المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const mainImg = product.images && product.images[0] ? product.images[0].image_url : null;
                const isOutOfStock = product.stock_quantity <= 0;

                return (
                  <div
                    key={product.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition duration-300 hover:shadow-xl ${cardBgClass} group`}
                  >
                    <div>
                      {/* Product Image */}
                      <div
                        onClick={() => {
                          setActiveProduct(product);
                          setSelectedImageIdx(0);
                          setModalQuantity(1);
                        }}
                        className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-800 cursor-pointer mb-3.5"
                      >
                        {mainImg ? (
                          <img
                            src={mainImg}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            VIP
                          </div>
                        )}

                        {product.compare_at_price && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow">
                            خصم خاص
                          </span>
                        )}

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-rose-400 text-xs font-black">
                            نفد من المخزون
                          </div>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-purple-400 font-bold">
                          {product.category?.name || 'عام'}
                        </span>
                        <h4
                          onClick={() => {
                            setActiveProduct(product);
                            setSelectedImageIdx(0);
                            setModalQuantity(1);
                          }}
                          className="font-bold text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-purple-400 transition"
                        >
                          {product.name}
                        </h4>
                      </div>
                    </div>

                    {/* Pricing & Add to cart button */}
                    <div className="pt-4 border-t border-slate-800/40 mt-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div className="font-mono font-black text-base text-purple-400">
                          {product.price.toFixed(2)}{' '}
                          <span className="text-[10px] font-normal text-slate-400">{currency}</span>
                        </div>
                        {product.compare_at_price && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            {product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product, 1)}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 px-3 ${buttonShapeClass} text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                          isDarkTheme
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className={`rounded-3xl w-full max-w-3xl overflow-hidden border shadow-2xl my-8 ${cardBgClass}`}>
            
            <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
              <span className="text-xs font-bold text-purple-400">تفاصيل ومواصفات المنتج</span>
              <button
                onClick={() => setActiveProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Media Gallery */}
              <div className="space-y-3">
                <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                  {activeProduct.images && activeProduct.images[selectedImageIdx] ? (
                    <img
                      src={activeProduct.images[selectedImageIdx].image_url}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      صورة المنتج
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {activeProduct.images && activeProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeProduct.images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                          selectedImageIdx === idx ? 'border-purple-500 scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info & Options */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="font-black text-lg">{activeProduct.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-400 font-mono">
                      {activeProduct.price.toFixed(2)} {currency}
                    </span>
                    {activeProduct.compare_at_price && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {activeProduct.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProduct.description || 'منتج أصلي عالي الجودة مع ضمان استبدال واسترجاع.'}
                  </p>

                  {/* Stock Status Badge */}
                  <div className="text-xs">
                    {activeProduct.stock_quantity > 0 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        متوفر في المخزون ({activeProduct.stock_quantity} قطعة متبقية)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">نفد من المخزون حالياً</span>
                    )}
                  </div>

                  {/* Dynamic Variants (e.g. Size, Color) */}
                  {activeProduct.options_json?.variants?.map((v, i) => (
                    <div key={i} className="space-y-1.5 pt-2">
                      <label className="block text-xs font-semibold text-slate-400">{v.name}:</label>
                      <div className="flex gap-2 flex-wrap">
                        {v.values.map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedVariants({ ...selectedVariants, [v.name]: val })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                              selectedVariants[v.name] === val
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quantity & Add to Cart */}
                <div className="space-y-3 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">الكمية:</span>
                    <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="p-1 text-slate-300 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-mono font-bold text-xs">{modalQuantity}</span>
                      <button
                        onClick={() => setModalQuantity(Math.min(activeProduct.stock_quantity, modalQuantity + 1))}
                        className="p-1 text-slate-300 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(activeProduct, modalQuantity, selectedVariants)}
                    disabled={activeProduct.stock_quantity <= 0}
                    className={`w-full py-3 px-4 ${buttonShapeClass} bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>إضافة إلى سلة الشراء ({ (activeProduct.price * modalQuantity).toFixed(2) } {currency})</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className={`w-full max-w-md h-full flex flex-col justify-between p-6 ${cardBgClass} shadow-2xl`}>
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">سلة المشتريات ({cart.length})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p>سلتك فارغة حالياً</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs gap-3">
                    <div className="flex items-center gap-3">
                      {item.product.images && item.product.images[0] ? (
                        <img src={item.product.images[0].image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">VIP</div>
                      )}
                      <div>
                        <h4 className="font-bold line-clamp-1">{item.product.name}</h4>
                        <div className="font-mono text-purple-400 text-[11px] font-bold">
                          {item.product.price.toFixed(2)} {currency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => handleUpdateCartQty(idx, -1)} className="p-1 text-slate-300">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => handleUpdateCartQty(idx, 1)} className="p-1 text-slate-300">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => handleUpdateCartQty(idx, -999)} className="text-rose-400 hover:text-rose-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold text-white">{cartSubtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>تكلفة الشحن:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {shippingFee === 0 ? 'مجاناً' : `${shippingFee.toFixed(2)} ${currency}`}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono text-purple-400 text-base">{cartTotal.toFixed(2)} {currency}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep('info');
                  }}
                  className={`w-full py-3 px-4 ${buttonShapeClass} bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <span>متابعة إتمام الطلب كعميل ضيف</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Guest Checkout Modal (Section 5 & 11) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className={`rounded-3xl w-full max-w-2xl overflow-hidden border shadow-2xl my-8 ${cardBgClass}`}>
            
            {/* Checkout Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>إتمام الطلب السريع (Guest Checkout)</span>
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="m-6 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                {checkoutError}
              </div>
            )}

            {/* Step 1 & 2: Guest Details & Payment Form */}
            {checkoutStep !== 'success' && (
              <form onSubmit={handleExecuteCheckout} className="p-6 space-y-6 text-xs text-slate-300">
                
                {/* Guest Info Fields */}
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
                    1. بيانات العميل والشحن
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: أحمد مصطفى"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">رقم الهاتف (لاستلام الطلب) *</label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">المدينة / المحافظة *</label>
                      <select
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
                      >
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="المنصورة">المنصورة</option>
                        <option value="طنطا">طنطا</option>
                        <option value="الرياض">الرياض</option>
                        <option value="جدة">جدة</option>
                        <option value="دبي">دبي</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-300 mb-1">العنوان بالتفصيل (الشارع، رقم المبنى) *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="مثال: شارع النصر، عمارة 12، الدور الرابع"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
                    2. طريقة الدفع المفضلة
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentSettings?.cod_enabled !== false && (
                      <div
                        onClick={() => setSelectedPaymentMethod('cod')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          selectedPaymentMethod === 'cod'
                            ? 'border-purple-600 bg-purple-950/40 text-white'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Banknote className="w-5 h-5 text-emerald-400" />
                          {selectedPaymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                        </div>
                        <span className="font-bold text-xs">الدفع عند الاستلام</span>
                      </div>
                    )}

                    {paymentSettings?.wallet_enabled && (
                      <div
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          selectedPaymentMethod === 'wallet'
                            ? 'border-purple-600 bg-purple-950/40 text-white'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Smartphone className="w-5 h-5 text-purple-400" />
                          {selectedPaymentMethod === 'wallet' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                        </div>
                        <span className="font-bold text-xs">فودافون كاش / إنستاباي</span>
                      </div>
                    )}

                    {paymentSettings?.bank_transfer_enabled && (
                      <div
                        onClick={() => setSelectedPaymentMethod('bank_transfer')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          selectedPaymentMethod === 'bank_transfer'
                            ? 'border-purple-600 bg-purple-950/40 text-white'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                          {selectedPaymentMethod === 'bank_transfer' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                        </div>
                        <span className="font-bold text-xs">تحويل بنكي مباشر</span>
                      </div>
                    )}
                  </div>

                  {/* Wallet instructions if selected */}
                  {selectedPaymentMethod === 'wallet' && paymentSettings?.wallet_number && (
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs space-y-1">
                      <p className="font-bold">رقم المحفظة للتحويل: <span className="font-mono text-amber-300" dir="ltr">{paymentSettings.wallet_number}</span></p>
                      <p className="text-[11px] text-slate-300">{paymentSettings.wallet_instructions}</p>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>قيمة المنتجات ({cart.length}):</span>
                    <span className="font-mono text-white">{cartSubtotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>الشحن والتوصيل:</span>
                    <span className="font-mono text-emerald-400">
                      {shippingFee === 0 ? 'مجاني' : `${shippingFee.toFixed(2)} ${currency}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                    <span>المبلغ المستحق للدفع:</span>
                    <span className="font-mono text-purple-400 text-base">{cartTotal.toFixed(2)} {currency}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-4 ${buttonShapeClass} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد الطلب وحجز المخزون ({cartTotal.toFixed(2)} {currency})</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Step 3: Success Screen (Section 11) */}
            {checkoutStep === 'success' && completedOrder && (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">تم استلام طلبك بنجاح!</h3>
                  <p className="text-xs text-slate-400">
                    رقم الطلب الخاص بك: <strong className="font-mono text-purple-400 text-sm">#{completedOrder.order_number}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    سيتم التواصل معك هاتفياً أو عبر الواتساب لتأكيد الشحن والتسليم.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  {/* WhatsApp confirmation button */}
                  {store.whatsapp_phone && (
                    <a
                      href={`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${store.store_name}، قمت للتو بتأكيد الطلب رقم #${completedOrder.order_number} بقيمة ${completedOrder.total_amount} ${currency}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>تأكيد الطلب فوراً عبر واتساب</span>
                    </a>
                  )}

                  {/* Invoice trigger */}
                  <button
                    type="button"
                    onClick={() => setIsInvoiceOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>عرض وطباعة الفاتورة الضريبية</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCompletedOrder(null);
                    }}
                    className="text-xs text-purple-400 hover:underline font-bold"
                  >
                    متابعة التسوق في المتجر
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Invoice Modal for Customer */}
      {isInvoiceOpen && completedOrder && (
        <InvoiceModal
          order={completedOrder}
          store={store}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

    </div>
  );
};
