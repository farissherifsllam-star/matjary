import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  PlaceOrderPayload,
  UserRole,
  SubscriptionStatus,
  OrderStatus,
} from '../types';
import { db } from './database';

// ----------------------------------------------------------------------
// PostgreSQL Schema Type Definitions for Supabase Client
// ----------------------------------------------------------------------
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
      };
      plans: {
        Row: Plan;
        Insert: Plan;
        Update: Partial<Plan>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Store>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Subscription>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Category>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Product>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, 'id'>;
        Update: Partial<ProductImage>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at'>;
        Update: Partial<Customer>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<OrderItem>;
      };
      payment_settings: {
        Row: PaymentSettings;
        Insert: PaymentSettings;
        Update: Partial<PaymentSettings>;
      };
      shipping_settings: {
        Row: ShippingSettings;
        Insert: ShippingSettings;
        Update: Partial<ShippingSettings>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_subscription_active: {
        Args: { p_store_id: string };
        Returns: boolean;
      };
      place_order: {
        Args: {
          p_store_id: string;
          p_customer: { name: string; phone: string; email?: string | null; address?: string | null };
          p_items: Array<{ product_id: string; quantity: number }>;
          p_payment_method: string;
          p_shipping_address: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_status: SubscriptionStatus;
      order_status: OrderStatus;
    };
  };
}

// ----------------------------------------------------------------------
// Environment Variables & Client Initializer
// ----------------------------------------------------------------------
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

/**
 * Instantiates the Supabase client safely with proper options.
 */
function initializeSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init),
      },
    });
  } catch (err) {
    console.warn('[VIPSTORE] Failed to initialize Supabase client:', err);
    return null;
  }
}

export const supabase: SupabaseClient<Database> | null = initializeSupabaseClient();

// ----------------------------------------------------------------------
// Unified Type-Safe Database Service Interface
// Provides seamless transition between live Supabase backend and embedded DB engine
// ----------------------------------------------------------------------
export interface TypeSafeDatabaseService {
  // Profiles
  getProfile(id: string): Promise<Profile | null>;
  createProfile(profile: Profile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null>;

  // Stores
  getStoreBySlug(slug: string): Promise<Store | null>;
  getStoreById(id: string): Promise<Store | null>;
  getStoreByOwner(ownerId: string): Promise<Store | null>;
  createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store>;
  updateStore(id: string, updates: Partial<Store>): Promise<Store | null>;

  // Products & Categories
  getProducts(storeId: string, activeOnly?: boolean): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imageUrls?: string[]): Promise<Product | null>;
  updateProduct(id: string, updates: Partial<Product>, imageUrls?: string[]): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  getCategories(storeId: string): Promise<Category[]>;
  createCategory(storeId: string, name: string, slug?: string): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Subscriptions & Plans
  getPlans(): Promise<Plan[]>;
  getSubscription(storeId: string): Promise<Subscription | null>;
  isSubscriptionActive(storeId: string): Promise<boolean>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null>;

  // Orders
  getOrders(storeId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null>;
  placeOrder(payload: PlaceOrderPayload): Promise<{ order_id: string; order_number: string }>;

  // Settings
  getPaymentSettings(storeId: string): Promise<PaymentSettings | null>;
  updatePaymentSettings(storeId: string, updates: Partial<PaymentSettings>): Promise<PaymentSettings>;
  getShippingSettings(storeId: string): Promise<ShippingSettings | null>;
  updateShippingSettings(storeId: string, updates: Partial<ShippingSettings>): Promise<ShippingSettings>;
}

class UnifiedDatabaseService implements TypeSafeDatabaseService {
  public async getProfile(id: string): Promise<Profile | null> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (!error && data) return data as Profile;
    }
    return db.getProfileById(id);
  }

  public async createProfile(profile: Profile): Promise<Profile> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').insert(profile as never).select().single();
      if (!error && data) return data as Profile;
    }
    return db.createProfile(profile);
  }

  public async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').update(updates as never).eq('id', id).select().single();
      if (!error && data) return data as Profile;
    }
    return db.updateProfile(id, updates);
  }

  public async getStoreBySlug(slug: string): Promise<Store | null> {
    if (supabase) {
      const { data, error } = await supabase.from('stores').select('*').ilike('slug', slug).single();
      if (!error && data) return data as Store;
    }
    return db.getStoreBySlug(slug);
  }

  public async getStoreById(id: string): Promise<Store | null> {
    if (supabase) {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (!error && data) return data as Store;
    }
    return db.getStoreById(id);
  }

  public async getStoreByOwner(ownerId: string): Promise<Store | null> {
    if (supabase) {
      const { data, error } = await supabase.from('stores').select('*').eq('owner_id', ownerId).single();
      if (!error && data) return data as Store;
    }
    return db.getStoreByOwner(ownerId);
  }

  public async createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    return db.createStore(storeData);
  }

  public async updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
    if (supabase) {
      const { data, error } = await supabase.from('stores').update(updates as never).eq('id', id).select().single();
      if (!error && data) return data as Store;
    }
    return db.updateStore(id, updates);
  }

  public async getProducts(storeId: string, activeOnly = false): Promise<Product[]> {
    if (supabase) {
      let query = supabase.from('products').select('*, product_images(*)').eq('store_id', storeId);
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (!error && data) return data as unknown as Product[];
    }
    return db.getProductsByStore(storeId, activeOnly);
  }

  public async getProduct(id: string): Promise<Product | null> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*, product_images(*)').eq('id', id).single();
      if (!error && data) return data as unknown as Product;
    }
    return db.getProductById(id);
  }

  public async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imageUrls: string[] = []): Promise<Product | null> {
    return db.createProduct(productData, imageUrls);
  }

  public async updateProduct(id: string, updates: Partial<Product>, imageUrls?: string[]): Promise<Product | null> {
    return db.updateProduct(id, updates, imageUrls);
  }

  public async deleteProduct(id: string): Promise<boolean> {
    db.deleteProduct(id);
    return true;
  }

  public async getCategories(storeId: string): Promise<Category[]> {
    return db.getCategoriesByStore(storeId);
  }

  public async createCategory(storeId: string, name: string, slug?: string): Promise<Category> {
    return db.createCategory(storeId, name, slug);
  }

  public async deleteCategory(id: string): Promise<boolean> {
    db.deleteCategory(id);
    return true;
  }

  public async getPlans(): Promise<Plan[]> {
    return db.getPlans();
  }

  public async getSubscription(storeId: string): Promise<Subscription | null> {
    return db.getSubscriptionByStoreId(storeId);
  }

  public async isSubscriptionActive(storeId: string): Promise<boolean> {
    return db.isSubscriptionActive(storeId);
  }

  public async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    return db.updateSubscriptionAdmin(id, updates);
  }

  public async getOrders(storeId: string): Promise<Order[]> {
    return db.getOrdersByStore(storeId);
  }

  public async getOrder(id: string): Promise<Order | null> {
    return db.getOrderById(id);
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    return db.updateOrderStatus(orderId, status);
  }

  public async placeOrder(payload: PlaceOrderPayload): Promise<{ order_id: string; order_number: string }> {
    return db.placeOrder(payload);
  }

  public async getPaymentSettings(storeId: string): Promise<PaymentSettings | null> {
    return db.getPaymentSettings(storeId);
  }

  public async updatePaymentSettings(storeId: string, updates: Partial<PaymentSettings>): Promise<PaymentSettings> {
    return db.updatePaymentSettings(storeId, updates);
  }

  public async getShippingSettings(storeId: string): Promise<ShippingSettings | null> {
    return db.getShippingSettings(storeId);
  }

  public async updateShippingSettings(storeId: string, updates: Partial<ShippingSettings>): Promise<ShippingSettings> {
    return db.updateShippingSettings(storeId, updates);
  }
}

export const dbService: TypeSafeDatabaseService = new UnifiedDatabaseService();
