import {
  Profile,
  Plan,
  Store,
  Subscription,
  Category,
  Product,
  ProductImage,
  Customer,
  Order,
  OrderItem,
  PaymentSettings,
  ShippingSettings,
  SeoSettings,
  PlaceOrderPayload,
  StoreThemeId
} from '../types';

// Reserved slugs definition matching SQL trigger
export const RESERVED_SLUGS = ['admin', 'api', 'dashboard', 'auth', 'store', 'www', 'app', 'pricing'];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-1-free',
    name: 'Free Trial',
    name_ar: 'تجربة مجانية',
    price: 0.00,
    interval: 'trial',
    duration_days: 7,
    features_json: {
      max_products: 15,
      custom_domain: false,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Community',
      remove_branding: false,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-2-monthly-basic',
    name: 'Monthly Standard',
    name_ar: 'شهري عادي',
    price: 99.00,
    interval: 'monthly',
    duration_days: 30,
    features_json: {
      max_products: 100,
      custom_domain: false,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Email',
      remove_branding: false,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-3-monthly-pro',
    name: 'Monthly Pro',
    name_ar: 'شهري برو',
    price: 299.00,
    interval: 'monthly',
    duration_days: 30,
    features_json: {
      max_products: 1000,
      custom_domain: true,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Priority 24/7',
      remove_branding: true,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-4-yearly-basic',
    name: 'Yearly Standard',
    name_ar: 'سنوي عادي',
    price: 900.00,
    interval: 'yearly',
    duration_days: 365,
    features_json: {
      max_products: 250,
      custom_domain: true,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Standard',
      remove_branding: false,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-5-yearly-pro',
    name: 'Yearly Pro',
    name_ar: 'سنوي احترافي',
    price: 1500.00,
    interval: 'yearly',
    duration_days: 365,
    features_json: {
      max_products: 5000,
      custom_domain: true,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Dedicated Manager',
      remove_branding: true,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-6-lifetime',
    name: 'Lifetime Standard',
    name_ar: 'مدى الحياة',
    price: 2000.00,
    interval: 'lifetime',
    features_json: {
      max_products: 1000,
      custom_domain: true,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Lifetime VIP',
      remove_branding: true,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-7-lifetime-vip',
    name: 'Lifetime VIP',
    name_ar: 'مدى الحياة VIP',
    price: 5000.00,
    interval: 'lifetime',
    features_json: {
      max_products: 99999,
      custom_domain: true,
      analytics: true,
      whatsapp_notifications: true,
      support_level: 'Private WhatsApp & Direct Call Support',
      remove_branding: true,
    },
    created_at: new Date().toISOString(),
  },
];

// Initial Seed Database
function getInitialDatabaseState() {
  const adminId = 'user-super-admin-01';
  const merchantId = 'user-merchant-demo-01';
  const storeId = 'store-elegance-01';

  const profiles: Profile[] = [
    {
      id: adminId,
      full_name: 'مدير النظام (Super Admin)',
      phone: '+201000000000',
      email: 'admin@vipstore.com',
      role: 'super_admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: merchantId,
      full_name: 'أحمد محمود (التاجر)',
      phone: '+201012345678',
      email: 'merchant@vipstore.com',
      role: 'merchant',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const stores: Store[] = [
    {
      id: storeId,
      owner_id: merchantId,
      store_name: 'بوتيك الأناقة الملكية',
      slug: 'elegance',
      custom_domain: 'elegance-vip.com',
      domain_verified: true,
      logo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
      favicon_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=64&auto=format&fit=crop&q=80',
      description: 'أرقى الأزياء، الساعات والعطور الأصلية المصممة للذوق الرفيع مع شحن سريع وضمان استبدال.',
      support_email: 'support@elegance-vip.com',
      currency: 'EGP',
      language: 'ar',
      theme_id: 'luxury_purple',
      primary_color: '#7C3AED',
      font_family: 'Cairo',
      button_style: 'pill',
      layout_style: 'grid',
      is_active: true,
      sections_json: [
        {
          id: 'sec-hero',
          type: 'hero',
          title: 'تشكيلة الموسم الفاخرة 2026',
          subtitle: 'اكتشف أرقى الساعات، العطور والأزياء مع خصومات حصرية وتوصيل سريع لباب منزلك.',
          button_text: 'تسوق الآن',
          button_link: '#products',
          image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
          enabled: true,
          order: 1
        },
        {
          id: 'sec-categories',
          type: 'categories',
          title: 'تصفح حسب الأقسام',
          enabled: true,
          order: 2
        },
        {
          id: 'sec-featured',
          type: 'featured_products',
          title: 'المنتجات الأكثر طلباً',
          subtitle: 'مختارات راقية نالت إعجاب أكثر من 10,000 عميل',
          enabled: true,
          order: 3
        },
        {
          id: 'sec-banner',
          type: 'banner',
          title: 'عروض حصرية بنصف السعر لفترة محدودة',
          subtitle: 'استخدم كود VIP2026 عند إتمام الطلب',
          button_text: 'استفد من العرض',
          image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
          enabled: true,
          order: 4
        },
        {
          id: 'sec-testimonials',
          type: 'testimonials',
          title: 'آراء عملائنا الكرام',
          subtitle: 'تجارب حقيقية تعكس التزامنا بالجودة والسرعة',
          enabled: true,
          order: 5
        },
        {
          id: 'sec-contact',
          type: 'contact',
          title: 'تواصل معنا مباشرة',
          subtitle: 'فريق خدمة العملاء جاهز للرد على استفساراتك على مدار الساعة عبر الواتساب',
          enabled: true,
          order: 6
        }
      ],
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const subscriptions: Subscription[] = [
    {
      id: 'sub-elegance-01',
      store_id: storeId,
      plan_id: 'plan-3-monthly-pro',
      status: 'active',
      starts_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      ends_at: new Date(Date.now() + 15 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const categories: Category[] = [
    {
      id: 'cat-watches',
      store_id: storeId,
      name: 'ساعات فاخرة',
      slug: 'luxury-watches',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-perfumes',
      store_id: storeId,
      name: 'عطور ملكية',
      slug: 'royal-perfumes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-leather',
      store_id: storeId,
      name: 'حقائب وجلديات',
      slug: 'leather-goods',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-accessories',
      store_id: storeId,
      name: 'إكسسوارات ونظارات',
      slug: 'accessories',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const products: Product[] = [
    {
      id: 'prod-watch-cronos',
      store_id: storeId,
      category_id: 'cat-watches',
      name: 'ساعة كرونوغراف ستانلس ستيل بريميوم',
      description: 'ساعة رجالية راقية مقاومة للماء مع زجاج سافير ضد الخدش وسوار ستانلس ستيل مصقول بدقة.',
      price: 1850.00,
      compare_at_price: 2400.00,
      stock_quantity: 14,
      sku: 'WCH-CRN-09',
      weight_kg: 0.35,
      is_active: true,
      options_json: {
        variants: [
          { name: 'لون الميناء', values: ['أسود كلاسيكي', 'أزرق ملكي', 'فضي لؤلؤي'] },
          { name: 'المقاس', values: ['40mm', '42mm'] }
        ],
        badges: ['الأكثر مبيعاً', 'خصم 23%']
      },
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-perfume-oud',
      store_id: storeId,
      category_id: 'cat-perfumes',
      name: 'عطر دهن العود الملكي المعتّق (100 مل)',
      description: 'مزيج ساحر من العود الكمبودي النادر وخشب الصندل والعنبر الدافئ، ثبات يدوم أكثر من 48 ساعة.',
      price: 1250.00,
      compare_at_price: 1600.00,
      stock_quantity: 25,
      sku: 'PRF-OUD-01',
      weight_kg: 0.50,
      is_active: true,
      options_json: {
        variants: [
          { name: 'الحجم', values: ['50 مل', '100 مل'] }
        ],
        badges: ['حصري']
      },
      created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-bag-leather',
      store_id: storeId,
      category_id: 'cat-leather',
      name: 'حقيبة أعمال جلد طبيعي إيطالي',
      description: 'حقيبة كلاسيكية متينة مصممة للمدراء ورجال الأعمال، تتسع لحاسوب محمول 15.6 بوصة ومستندات هامة.',
      price: 2100.00,
      compare_at_price: 2800.00,
      stock_quantity: 8,
      sku: 'BAG-LTR-88',
      weight_kg: 1.20,
      is_active: true,
      options_json: {
        variants: [
          { name: 'اللون', values: ['بني كلاسيك', 'أسود ملكي', 'هافان'] }
        ],
        badges: ['جلد طبيعي 100%']
      },
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-sunglasses-aviator',
      store_id: storeId,
      category_id: 'cat-accessories',
      name: 'نظارة شمسية أفياتور مستقطبة UV400',
      description: 'إطار تيتانيوم فائق الخفة مع عدسات مستقطبة عالية الوضوح تحمي العين من الأشعة فوق البنفسجية.',
      price: 650.00,
      compare_at_price: 850.00,
      stock_quantity: 30,
      sku: 'SGL-AVT-12',
      weight_kg: 0.15,
      is_active: true,
      options_json: {
        variants: [
          { name: 'لون العدسة', values: ['أسود متدرج', 'أخضر كلاسيكي', 'فضي عاكس'] }
        ]
      },
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-wallet-card',
      store_id: storeId,
      category_id: 'cat-leather',
      name: 'محفظة بطاقات جلدية ذكية مضادة للسرقة RFID',
      description: 'تصميم أنيق نحيف بخاصية النبثاق السريع للبطاقات مع حماية كاملة من المسح الإلكتروني.',
      price: 380.00,
      compare_at_price: 520.00,
      stock_quantity: 45,
      sku: 'WLT-SLM-05',
      weight_kg: 0.10,
      is_active: true,
      options_json: {
        variants: [
          { name: 'اللون', values: ['أسود كاربون', 'بني داكن', 'أزرق كحلي'] }
        ]
      },
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-perfume-rose',
      store_id: storeId,
      category_id: 'cat-perfumes',
      name: 'عطر مسك الورد الجوري الفاخر (75 مل)',
      description: 'نفحات منعشة من الورد الجوري والياسمين مع لمسات المسك الأبيض المنعش، مثالي للاستخدام اليومي.',
      price: 950.00,
      compare_at_price: 1200.00,
      stock_quantity: 18,
      sku: 'PRF-RS-02',
      weight_kg: 0.40,
      is_active: true,
      options_json: {
        variants: []
      },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const productImages: ProductImage[] = [
    {
      id: 'img-1',
      product_id: 'prod-watch-cronos',
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    },
    {
      id: 'img-2',
      product_id: 'prod-watch-cronos',
      image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80',
      display_order: 1,
    },
    {
      id: 'img-3',
      product_id: 'prod-perfume-oud',
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    },
    {
      id: 'img-4',
      product_id: 'prod-bag-leather',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    },
    {
      id: 'img-5',
      product_id: 'prod-sunglasses-aviator',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    },
    {
      id: 'img-6',
      product_id: 'prod-wallet-card',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    },
    {
      id: 'img-7',
      product_id: 'prod-perfume-rose',
      image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=700&auto=format&fit=crop&q=80',
      display_order: 0,
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust-1',
      store_id: storeId,
      name: 'محمود عبد العزيز',
      phone: '+201122334455',
      email: 'mahmoud@gmail.com',
      address: 'القاهرة، المعادي، شارع النصر، عمارة 12',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'cust-2',
      store_id: storeId,
      name: 'سارة طارق',
      phone: '+201233445566',
      email: 'sara.t@yahoo.com',
      address: 'الجيزة، الشيخ زايد، كمبوند الياسمين، فيلا 5',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'cust-3',
      store_id: storeId,
      name: 'كريم الشناوي',
      phone: '+201099887766',
      email: 'karim.sh@gmail.com',
      address: 'الإسكندرية، سموحة، شارع فوزي معاذ',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord-101',
      store_id: storeId,
      customer_id: 'cust-1',
      order_number: 'ORD-20260814-A7F901',
      total_amount: 3100.00,
      status: 'delivered',
      payment_method: 'cod',
      payment_status: 'paid',
      shipping_carrier: 'بوسطة (Bosta)',
      shipping_address_json: {
        city: 'القاهرة',
        street: 'شارع النصر، المعادي الجديدة',
        building: 'عمارة 12 الدور الرابع شقة 8',
        notes: 'يرجى الاتصال قبل الوصول'
      },
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'ord-102',
      store_id: storeId,
      customer_id: 'cust-2',
      order_number: 'ORD-20260815-B8E332',
      total_amount: 1850.00,
      status: 'shipped',
      payment_method: 'wallet',
      payment_status: 'paid',
      shipping_carrier: 'مايلرز (Mylerz)',
      shipping_address_json: {
        city: 'الجيزة',
        street: 'الشيخ زايد، الحي التاسع',
        building: 'فيلا 5',
        notes: 'الاستلام عند البوابة'
      },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'ord-103',
      store_id: storeId,
      customer_id: 'cust-3',
      order_number: 'ORD-20260816-C9D441',
      total_amount: 1030.00,
      status: 'new',
      payment_method: 'cod',
      payment_status: 'pending',
      shipping_carrier: 'شحن يدوي مباشر',
      shipping_address_json: {
        city: 'الإسكندرية',
        street: 'سموحة، شارع فوزي معاذ',
        building: 'برج الأطباء',
        notes: ''
      },
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const orderItems: OrderItem[] = [
    {
      id: 'item-1',
      order_id: 'ord-101',
      product_id: 'prod-watch-cronos',
      product_name_snapshot: 'ساعة كرونوغراف ستانلس ستيل بريميوم (لون أسود)',
      quantity: 1,
      unit_price: 1850.00,
      total_price: 1850.00,
    },
    {
      id: 'item-2',
      order_id: 'ord-101',
      product_id: 'prod-perfume-oud',
      product_name_snapshot: 'عطر دهن العود الملكي المعتّق (100 مل)',
      quantity: 1,
      unit_price: 1250.00,
      total_price: 1250.00,
    },
    {
      id: 'item-3',
      order_id: 'ord-102',
      product_id: 'prod-watch-cronos',
      product_name_snapshot: 'ساعة كرونوغراف ستانلس ستيل بريميوم (لون أزرق ملكي)',
      quantity: 1,
      unit_price: 1850.00,
      total_price: 1850.00,
    },
    {
      id: 'item-4',
      order_id: 'ord-103',
      product_id: 'prod-sunglasses-aviator',
      product_name_snapshot: 'نظارة شمسية أفياتور مستقطبة UV400',
      quantity: 1,
      unit_price: 650.00,
      total_price: 650.00,
    },
    {
      id: 'item-5',
      order_id: 'ord-103',
      product_id: 'prod-wallet-card',
      product_name_snapshot: 'محفظة بطاقات جلدية ذكية RFID (أسود كاربون)',
      quantity: 1,
      unit_price: 380.00,
      total_price: 380.00,
    }
  ];

  const paymentSettings: PaymentSettings[] = [
    {
      id: 'pay-settings-01',
      store_id: storeId,
      cod_enabled: true,
      bank_transfer_enabled: true,
      bank_details_text: 'البنك الأهلي المصري - حساب رقم: EG5000020000000123456789012 - باسم: مؤسسة الأناقة للتجارة',
      wallet_enabled: true,
      wallet_number: '01012345678',
      paymob_enabled: true,
      paypal_enabled: false,
    }
  ];

  const shippingSettings: ShippingSettings[] = [
    {
      id: 'ship-settings-01',
      store_id: storeId,
      bosta_enabled: true,
      bosta_api_key: 'bosta_live_key_demo_987214',
      mylerz_enabled: true,
      mylerz_api_key: 'mylerz_sec_key_demo_441209',
      manual_shipping_enabled: true,
      shipping_fee: 50.00,
    }
  ];

  const seoSettings: SeoSettings[] = [
    {
      id: 'seo-settings-01',
      store_id: storeId,
      facebook_pixel_id: '992837182736451',
      google_analytics_id: 'G-VIPSTORE2026',
      whatsapp_number: '201012345678',
    }
  ];

  return {
    profiles,
    plans: INITIAL_PLANS,
    stores,
    subscriptions,
    categories,
    products,
    productImages,
    customers,
    orders,
    orderItems,
    paymentSettings,
    shippingSettings,
    seoSettings,
  };
}

const STORAGE_KEY = 'vipstore_master_db_v1';

class DatabaseEngine {
  private data: ReturnType<typeof getInitialDatabaseState>;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        // ensure plans are always present and up-to-date
        this.data.plans = INITIAL_PLANS;
      } catch (e) {
        console.error('Failed to parse saved database state', e);
        this.data = getInitialDatabaseState();
      }
    } else {
      this.data = getInitialDatabaseState();
      this.save();
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Storage quota exceeded or private mode', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // ===================== PROFILES =====================
  public getProfiles() {
    return [...this.data.profiles];
  }

  public getProfileById(id: string) {
    return this.data.profiles.find((p) => p.id === id) || null;
  }

  public createProfile(profile: Profile) {
    this.data.profiles.push(profile);
    this.save();
    return profile;
  }

  public updateProfile(id: string, updates: Partial<Profile>) {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.profiles[idx] = {
        ...this.data.profiles[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.profiles[idx];
    }
    return null;
  }

  // ===================== PLANS =====================
  public getPlans() {
    return [...this.data.plans];
  }

  public getPlanById(id: string) {
    return this.data.plans.find((p) => p.id === id) || null;
  }

  // ===================== STORES =====================
  public getStores() {
    return [...this.data.stores];
  }

  public getStoreById(id: string) {
    return this.data.stores.find((s) => s.id === id) || null;
  }

  public getStoreBySlug(slug: string) {
    return (
      this.data.stores.find(
        (s) => s.slug.toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }

  public getStoreByOwner(ownerId: string) {
    return this.data.stores.find((s) => s.owner_id === ownerId) || null;
  }

  public createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>) {
    // Reserved slug guard trigger emulation
    const cleanSlug = storeData.slug.trim().toLowerCase();
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      throw new Error('This store URL is reserved.');
    }
    // Unique slug check
    if (this.data.stores.some((s) => s.slug.toLowerCase() === cleanSlug)) {
      throw new Error('رابط المتجر هذا مستخدم بالفعل، يرجى اختيار رابط آخر.');
    }

    const newStore: Store = {
      ...storeData,
      slug: cleanSlug,
      id: 'store-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.stores.push(newStore);

    // Auto initialize payment & shipping settings
    this.data.paymentSettings.push({
      id: 'pay-' + newStore.id,
      store_id: newStore.id,
      cod_enabled: true,
      bank_transfer_enabled: false,
      bank_details_text: '',
      wallet_enabled: false,
      wallet_number: '',
      paymob_enabled: false,
      paypal_enabled: false,
    });

    this.data.shippingSettings.push({
      id: 'ship-' + newStore.id,
      store_id: newStore.id,
      bosta_enabled: false,
      bosta_api_key: '',
      mylerz_enabled: false,
      mylerz_api_key: '',
      manual_shipping_enabled: true,
      shipping_fee: 40.0,
    });

    this.data.seoSettings.push({
      id: 'seo-' + newStore.id,
      store_id: newStore.id,
      facebook_pixel_id: '',
      google_analytics_id: '',
      whatsapp_number: '',
    });

    this.save();
    return newStore;
  }

  public updateStore(id: string, updates: Partial<Store>) {
    const idx = this.data.stores.findIndex((s) => s.id === id);
    if (idx !== -1) {
      if (updates.slug) {
        const cleanSlug = updates.slug.trim().toLowerCase();
        if (RESERVED_SLUGS.includes(cleanSlug)) {
          throw new Error('This store URL is reserved.');
        }
        const existing = this.data.stores.find(
          (s) => s.id !== id && s.slug.toLowerCase() === cleanSlug
        );
        if (existing) {
          throw new Error('رابط المتجر هذا مستخدم بالفعل.');
        }
        updates.slug = cleanSlug;
      }

      this.data.stores[idx] = {
        ...this.data.stores[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.stores[idx];
    }
    throw new Error('Store not found');
  }

  public toggleStoreStatus(storeId: string, isActive: boolean) {
    const store = this.getStoreById(storeId);
    if (store) {
      store.is_active = isActive;
      store.updated_at = new Date().toISOString();
      this.save();
      return store;
    }
    return null;
  }

  // ===================== SUBSCRIPTIONS =====================
  public isSubscriptionActive(storeId: string): boolean {
    const store = this.getStoreById(storeId);
    if (!store || !store.is_active) return false;

    const sub = this.data.subscriptions.find((s) => s.store_id === storeId);
    if (!sub) return false;

    const validStatus = sub.status === 'trialing' || sub.status === 'active';
    if (!validStatus) return false;

    if (sub.ends_at === null) return true; // lifetime
    return new Date(sub.ends_at) > new Date();
  }

  public getSubscriptionByStoreId(storeId: string) {
    return this.data.subscriptions.find((s) => s.store_id === storeId) || null;
  }

  public getAllSubscriptions() {
    return [...this.data.subscriptions];
  }

  public createSubscription(
    storeId: string,
    planId: string,
    status: 'trialing' | 'active' = 'active'
  ) {
    const plan = this.getPlanById(planId);
    if (!plan) throw new Error('Plan not found');

    let endsAt: string | null = null;
    if (plan.interval === 'trial') {
      endsAt = new Date(Date.now() + 7 * 86400000).toISOString();
    } else if (plan.interval === 'monthly') {
      endsAt = new Date(Date.now() + 30 * 86400000).toISOString();
    } else if (plan.interval === 'yearly') {
      endsAt = new Date(Date.now() + 365 * 86400000).toISOString();
    } else if (plan.interval === 'lifetime') {
      endsAt = null;
    }

    const existingIdx = this.data.subscriptions.findIndex(
      (s) => s.store_id === storeId
    );

    const sub: Subscription = {
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      store_id: storeId,
      plan_id: planId,
      status: status,
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      this.data.subscriptions[existingIdx] = sub;
    } else {
      this.data.subscriptions.push(sub);
    }

    this.save();
    return sub;
  }

  public updateSubscriptionAdmin(
    id: string,
    updates: Partial<Pick<Subscription, 'status' | 'ends_at' | 'plan_id'>>
  ) {
    const idx = this.data.subscriptions.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.subscriptions[idx] = {
        ...this.data.subscriptions[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.subscriptions[idx];
    }
    throw new Error('Subscription not found');
  }

  // ===================== CATEGORIES =====================
  public getCategoriesByStore(storeId: string) {
    return this.data.categories.filter((c) => c.store_id === storeId);
  }

  public createCategory(storeId: string, name: string, slug?: string) {
    if (!this.isSubscriptionActive(storeId)) {
      throw new Error('اشتراك المتجر منتهي أو غير مفعل. يرجى تجديد الاشتراك أولاً.');
    }
    const cleanSlug =
      (slug || name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A-]+/g, '') ||
      'cat-' + Math.random().toString(36).substring(2, 6);

    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      store_id: storeId,
      name,
      slug: cleanSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, name: string, slug?: string) {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    if (!this.isSubscriptionActive(cat.store_id)) {
      throw new Error('اشتراك المتجر منتهي. لا يمكن التعديل.');
    }
    cat.name = name;
    if (slug) cat.slug = slug;
    cat.updated_at = new Date().toISOString();
    this.save();
    return cat;
  }

  public deleteCategory(id: string) {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) return;
    if (!this.isSubscriptionActive(cat.store_id)) {
      throw new Error('اشتراك المتجر منتهي.');
    }
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    // update products category to null
    this.data.products.forEach((p) => {
      if (p.category_id === id) p.category_id = null;
    });
    this.save();
  }

  // ===================== PRODUCTS =====================
  public getProductsByStore(storeId: string, activeOnly: boolean = false) {
    const prods = this.data.products.filter(
      (p) => p.store_id === storeId && (!activeOnly || p.is_active)
    );
    return prods.map((p) => ({
      ...p,
      images: this.data.productImages
        .filter((img) => img.product_id === p.id)
        .sort((a, b) => a.display_order - b.display_order),
      category: this.data.categories.find((c) => c.id === p.category_id),
    }));
  }

  public getProductById(id: string) {
    const p = this.data.products.find((prod) => prod.id === id);
    if (!p) return null;
    return {
      ...p,
      images: this.data.productImages
        .filter((img) => img.product_id === p.id)
        .sort((a, b) => a.display_order - b.display_order),
      category: this.data.categories.find((c) => c.id === p.category_id),
    };
  }

  public createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    imageUrls: string[] = []
  ) {
    if (!this.isSubscriptionActive(productData.store_id)) {
      throw new Error('اشتراك المتجر منتهي أو غير مفعل. لا يمكن إضافة منتجات جديدة.');
    }

    const newProd: Product = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.products.push(newProd);

    imageUrls.forEach((url, index) => {
      this.data.productImages.push({
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        product_id: newProd.id,
        image_url: url,
        display_order: index,
      });
    });

    this.save();
    return this.getProductById(newProd.id);
  }

  public updateProduct(
    id: string,
    updates: Partial<Product>,
    imageUrls?: string[]
  ) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const storeId = this.data.products[idx].store_id;
    if (!this.isSubscriptionActive(storeId)) {
      throw new Error('اشتراك المتجر منتهي. لا يمكن تعديل المنتجات.');
    }

    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (imageUrls) {
      // replace product images
      this.data.productImages = this.data.productImages.filter(
        (img) => img.product_id !== id
      );
      imageUrls.forEach((url, i) => {
        this.data.productImages.push({
          id: 'img-' + Math.random().toString(36).substring(2, 9),
          product_id: id,
          image_url: url,
          display_order: i,
        });
      });
    }

    this.save();
    return this.getProductById(id);
  }

  public deleteProduct(id: string) {
    const prod = this.data.products.find((p) => p.id === id);
    if (!prod) return;
    if (!this.isSubscriptionActive(prod.store_id)) {
      throw new Error('اشتراك المتجر منتهي.');
    }
    this.data.products = this.data.products.filter((p) => p.id !== id);
    this.data.productImages = this.data.productImages.filter(
      (img) => img.product_id !== id
    );
    this.save();
  }

  // ===================== ATOMIC CHECKOUT RPC FUNCTION (place_order) =====================
  // Client code MUST NEVER decrement stock_quantity directly.
  // All checkouts go through this atomic function matching the PostgreSQL RPC exactly.
  public placeOrder(payload: PlaceOrderPayload): { order_id: string; order_number: string } {
    const { store_id, customer, customer_name, customer_phone, customer_email, items, payment_method, shipping_address, shipping_fee } = payload;

    // Normalize customer info
    const custName = customer?.name || customer_name || 'عميل';
    const custPhone = customer?.phone || customer_phone || '01000000000';
    const custEmail = customer?.email || customer_email || null;
    const custAddress = customer?.address || shipping_address?.address || `${shipping_address?.city || ''} ${shipping_address?.street || ''}`;

    // 1. Subscription active check
    if (!this.isSubscriptionActive(store_id)) {
      throw new Error('هذا المتجر غير متاح حالياً لاستقبال الطلبات بسبب انتهاء الاشتراك.');
    }

    // 2. Validate items array
    if (!items || items.length === 0) {
      throw new Error('سلة التسوق فارغة.');
    }

    // 3. Row lock / stock verification for all products
    const productRecords: {
      product: Product;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const prod = this.data.products.find(
        (p) => p.id === item.product_id && p.store_id === store_id
      );
      if (!prod) {
        throw new Error('Product not found in this store.');
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`نفذت الكمية المطلوبة للمنتج: "${prod.name}" (المتبقي: ${prod.stock_quantity})`);
      }
      productRecords.push({ product: prod, quantity: item.quantity });
    }

    // 4. Upsert Customer (unique store_id, phone)
    let customerRecord = this.data.customers.find(
      (c) => c.store_id === store_id && c.phone === custPhone
    );

    if (customerRecord) {
      customerRecord.name = custName;
      if (custEmail) customerRecord.email = custEmail;
      if (custAddress) customerRecord.address = custAddress;
    } else {
      customerRecord = {
        id: 'cust-' + Math.random().toString(36).substring(2, 9),
        store_id,
        name: custName,
        phone: custPhone,
        email: custEmail,
        address: custAddress,
        created_at: new Date().toISOString(),
      };
      this.data.customers.push(customerRecord);
    }

    // 5. Generate Order Number: ORD-YYYYMMDD-XXXXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHash}`;
    const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);

    // 6. Atomically Decrement stock and calculate total
    let itemsTotal = 0;
    const createdOrderItems: OrderItem[] = [];

    for (const pr of productRecords) {
      // Decrement stock
      pr.product.stock_quantity -= pr.quantity;
      pr.product.updated_at = new Date().toISOString();

      const itemTotal = Number((pr.product.price * pr.quantity).toFixed(2));
      itemsTotal += itemTotal;

      const orderItem: OrderItem = {
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        product_id: pr.product.id,
        product_name_snapshot: pr.product.name,
        quantity: pr.quantity,
        unit_price: pr.product.price,
        total_price: itemTotal,
      };
      createdOrderItems.push(orderItem);
      this.data.orderItems.push(orderItem);
    }

    const finalTotal = itemsTotal + (shipping_fee || 0);

    // 7. Insert Order
    const newOrder: Order = {
      id: orderId,
      store_id,
      customer_id: customerRecord.id,
      order_number: orderNumber,
      total_amount: Number(finalTotal.toFixed(2)),
      status: 'new',
      payment_method,
      payment_status: payment_method === 'cod' ? 'pending' : 'pending',
      shipping_carrier: 'شحن مباشر',
      shipping_address_json: shipping_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.orders.unshift(newOrder);
    this.save();

    return {
      order_id: orderId,
      order_number: orderNumber,
    };
  }

  // ===================== ORDERS (Merchant/Super Admin) =====================
  public getOrders() {
    return this.data.orders.map((o) => ({
      ...o,
      items: this.data.orderItems.filter((item) => item.order_id === o.id),
      customer: this.data.customers.find((c) => c.id === o.customer_id),
    }));
  }

  public getOrdersByStore(storeId: string) {
    const storeOrders = this.data.orders.filter((o) => o.store_id === storeId);
    return storeOrders.map((o) => ({
      ...o,
      items: this.data.orderItems.filter((item) => item.order_id === o.id),
      customer: this.data.customers.find((c) => c.id === o.customer_id),
    }));
  }

  public getOrdersByStoreId(storeId: string) {
    return this.getOrdersByStore(storeId);
  }

  public getProductsByStoreId(storeId: string, activeOnly: boolean = false) {
    return this.getProductsByStore(storeId, activeOnly);
  }

  public getCategoriesByStoreId(storeId: string) {
    return this.getCategoriesByStore(storeId);
  }

  public getSubscriptions() {
    return this.getAllSubscriptions();
  }

  public updateSubscription(
    id: string,
    updates: Partial<Pick<Subscription, 'status' | 'ends_at' | 'plan_id'>>
  ) {
    return this.updateSubscriptionAdmin(id, updates);
  }

  public getCustomers() {
    return [...this.data.customers];
  }

  public getOrderById(orderId: string) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    return {
      ...order,
      items: this.data.orderItems.filter((item) => item.order_id === order.id),
      customer: this.data.customers.find((c) => c.id === order.customer_id),
    };
  }

  public getOrderByNumber(orderNumber: string) {
    const order = this.data.orders.find((o) => o.order_number === orderNumber);
    if (!order) return null;
    return {
      ...order,
      items: this.data.orderItems.filter((item) => item.order_id === order.id),
      customer: this.data.customers.find((c) => c.id === order.customer_id),
    };
  }

  public updateOrderStatus(orderId: string, status: Order['status'], carrier?: string) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    if (carrier) order.shipping_carrier = carrier;
    order.updated_at = new Date().toISOString();
    this.save();
    return order;
  }

  // ===================== CUSTOMERS CRM =====================
  public getCustomersByStore(storeId: string) {
    const storeCustomers = this.data.customers.filter(
      (c) => c.store_id === storeId
    );
    const storeOrders = this.data.orders.filter((o) => o.store_id === storeId);

    return storeCustomers.map((c) => {
      const custOrders = storeOrders.filter((o) => o.customer_id === c.id);
      const totalSpent = custOrders.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0
      );
      return {
        ...c,
        orders_count: custOrders.length,
        total_spent: Number(totalSpent.toFixed(2)),
        last_order_date: custOrders.length > 0 ? custOrders[0].created_at : null,
      };
    });
  }

  // ===================== SETTINGS =====================
  public getPaymentSettings(storeId: string) {
    let settings = this.data.paymentSettings.find((p) => p.store_id === storeId);
    if (!settings) {
      settings = {
        id: 'pay-' + storeId,
        store_id: storeId,
        cod_enabled: true,
        bank_transfer_enabled: false,
        bank_details_text: '',
        wallet_enabled: false,
        wallet_number: '',
        paymob_enabled: false,
        paypal_enabled: false,
      };
      this.data.paymentSettings.push(settings);
      this.save();
    }
    return { ...settings };
  }

  public updatePaymentSettings(storeId: string, updates: Partial<PaymentSettings>) {
    let idx = this.data.paymentSettings.findIndex((p) => p.store_id === storeId);
    if (idx === -1) {
      this.getPaymentSettings(storeId);
      idx = this.data.paymentSettings.findIndex((p) => p.store_id === storeId);
    }
    this.data.paymentSettings[idx] = {
      ...this.data.paymentSettings[idx],
      ...updates,
    };
    this.save();
    return this.data.paymentSettings[idx];
  }

  public getShippingSettings(storeId: string) {
    let settings = this.data.shippingSettings.find((s) => s.store_id === storeId);
    if (!settings) {
      settings = {
        id: 'ship-' + storeId,
        store_id: storeId,
        bosta_enabled: false,
        bosta_api_key: '',
        mylerz_enabled: false,
        mylerz_api_key: '',
        manual_shipping_enabled: true,
        shipping_fee: 35.0,
      };
      this.data.shippingSettings.push(settings);
      this.save();
    }
    return { ...settings };
  }

  public updateShippingSettings(
    storeId: string,
    updates: Partial<ShippingSettings>
  ) {
    let idx = this.data.shippingSettings.findIndex((s) => s.store_id === storeId);
    if (idx === -1) {
      this.getShippingSettings(storeId);
      idx = this.data.shippingSettings.findIndex((s) => s.store_id === storeId);
    }
    this.data.shippingSettings[idx] = {
      ...this.data.shippingSettings[idx],
      ...updates,
    };
    this.save();
    return this.data.shippingSettings[idx];
  }

  public getSeoSettings(storeId: string) {
    let settings = this.data.seoSettings.find((s) => s.store_id === storeId);
    if (!settings) {
      settings = {
        id: 'seo-' + storeId,
        store_id: storeId,
        facebook_pixel_id: '',
        google_analytics_id: '',
        whatsapp_number: '',
      };
      this.data.seoSettings.push(settings);
      this.save();
    }
    return { ...settings };
  }

  public updateSeoSettings(storeId: string, updates: Partial<SeoSettings>) {
    let idx = this.data.seoSettings.findIndex((s) => s.store_id === storeId);
    if (idx === -1) {
      this.getSeoSettings(storeId);
      idx = this.data.seoSettings.findIndex((s) => s.store_id === storeId);
    }
    this.data.seoSettings[idx] = {
      ...this.data.seoSettings[idx],
      ...updates,
    };
    this.save();
    return this.data.seoSettings[idx];
  }

  // Reset database to initial seed for testing
  public resetToSeed() {
    this.data = getInitialDatabaseState();
    this.save();
  }
}

export const db = new DatabaseEngine();
