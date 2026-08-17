/**
 * Storage Engine for store-assets bucket
 * Path convention: {store_id}/{logo|favicon|banner|products}/{filename}
 */

export async function uploadStoreAsset(
  storeId: string,
  folder: 'logo' | 'favicon' | 'banner' | 'products',
  file: File | Blob,
  filename?: string
): Promise<string> {
  const cleanName = filename || (file instanceof File ? file.name : `asset-${Date.now()}.png`);
  const safeName = cleanName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${storeId}/${folder}/${Date.now()}-${safeName}`;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Return base64 data URL for local storage persistence or Supabase URL
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export const CURATED_PRODUCT_IMAGES = [
  { name: 'ساعة رجالية سوداء', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80' },
  { name: 'ساعة ذهبية فخمة', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80' },
  { name: 'عطر فاخر أسود', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=80' },
  { name: 'عطر نسائي أنيق', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=700&auto=format&fit=crop&q=80' },
  { name: 'حقيبة جلد طبيعي', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80' },
  { name: 'محفظة ذكية RFID', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80' },
  { name: 'نظارة شمسية كلاسيك', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80' },
  { name: 'حذاء كلاسيكي أنيق', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=700&auto=format&fit=crop&q=80' },
  { name: 'قميص أكسفورد أبيض', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=700&auto=format&fit=crop&q=80' },
  { name: 'سماعات رأس لاسلكية', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80' }
];

export const CURATED_HERO_BANNERS = [
  { name: 'فخامة وأناقة ملكية', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80' },
  { name: 'أحدث خطوط الموضة', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80' },
  { name: 'إلكترونيات واكسسوارات', url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeede?w=1200&auto=format&fit=crop&q=80' },
  { name: 'متجر عطور وبخور', url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1200&auto=format&fit=crop&q=80' },
];
