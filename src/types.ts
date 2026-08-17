export type UserRole = 'super_admin' | 'merchant' | 'customer';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PlanInterval = 'trial' | 'monthly' | 'yearly' | 'lifetime';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  name_ar: string;
  price: number; // Numeric(10,2)
  interval: PlanInterval;
  duration_days?: number;
  features_json: {
    max_products?: number;
    custom_domain?: boolean;
    analytics?: boolean;
    whatsapp_notifications?: boolean;
    support_level?: string;
    remove_branding?: boolean;
    [key: string]: any;
  };
  created_at: string;
}

export type StoreThemeId = 'minimalist' | 'modern_dark' | 'bold_commerce' | 'luxury_purple' | 'classic_white';

export interface StoreSection {
  id: string;
  type: 'hero' | 'featured_products' | 'banner' | 'categories' | 'testimonials' | 'contact';
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  image_url?: string;
  enabled: boolean;
  order: number;
}

export interface Store {
  id: string;
  owner_id: string;
  store_name: string;
  slug: string;
  custom_domain: string | null;
  domain_verified: boolean;
  logo_url: string | null;
  favicon_url: string | null;
  description: string | null;
  support_email: string | null;
  currency: string; // default EGP
  language: string; // default ar
  theme_id: StoreThemeId;
  primary_color: string; // default #7C3AED
  font_family: string | null;
  button_style: string | null; // rounded | pill | square
  layout_style: string | null;
  is_active: boolean;
  sections_json?: StoreSection[];
  whatsapp_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  store_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null; // null = lifetime
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantOption {
  name: string; // e.g. "Size", "Color"
  values: string[]; // e.g. ["S", "M", "L"]
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number; // Numeric(10,2)
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string | null;
  weight_kg: number | null;
  is_active: boolean;
  options_json: {
    variants?: ProductVariantOption[];
    badges?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  // relations
  images?: ProductImage[];
  category?: Category;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  orders_count?: number;
  total_spent?: number;
  last_order_date?: string | null;
}

export interface Order {
  id: string;
  store_id: string;
  customer_id: string | null;
  order_number: string;
  total_amount: number; // Numeric(10,2)
  status: OrderStatus;
  payment_method: string | null; // 'cod' | 'wallet' | 'bank_transfer'
  payment_status: string; // 'pending' | 'paid' | 'failed'
  shipping_carrier: string | null;
  shipping_address_json: {
    city?: string;
    street?: string;
    building?: string;
    address?: string;
    notes?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
  // relations
  items?: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentSettings {
  id: string;
  store_id: string;
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;
  bank_details_text: string | null;
  bank_name?: string | null;
  bank_account_holder?: string | null;
  bank_iban?: string | null;
  wallet_enabled: boolean;
  wallet_number: string | null;
  wallet_instructions?: string | null;
  paymob_enabled: boolean;
  paymob_api_key?: string | null;
  paymob_integration_id?: string | null;
  paypal_enabled: boolean;
  paypal_client_id?: string | null;
}

export interface ShippingSettings {
  id: string;
  store_id: string;
  bosta_enabled: boolean;
  bosta_api_key: string | null;
  bosta_business_id?: string | null;
  mylerz_enabled: boolean;
  mylerz_api_key: string | null;
  manual_shipping_enabled: boolean;
  shipping_fee: number;
  flat_rate?: number;
  free_shipping_threshold?: number | null;
}

export interface SeoSettings {
  id: string;
  store_id: string;
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  whatsapp_number: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_variants?: Record<string, string>;
}

export interface PlaceOrderPayload {
  store_id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    product_id: string;
    quantity: number;
    variant_name?: string;
  }>;
  payment_method: string;
  shipping_fee?: number;
  shipping_address: {
    city: string;
    street?: string;
    building?: string;
    address?: string;
    notes?: string;
  };
}
