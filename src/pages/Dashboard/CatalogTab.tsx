import React, { useState } from 'react';
import { Store, Product, Category, ProductVariantOption } from '../../types';
import { db } from '../../lib/database';
import { CURATED_PRODUCT_IMAGES } from '../../lib/storage';
import {
  Package,
  Plus,
  FolderPlus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Search,
  Tag,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

interface CatalogTabProps {
  store: Store;
  products: Product[];
  categories: Category[];
  isSubscriptionActive: boolean;
  onRefresh: () => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  store,
  products,
  categories,
  isSubscriptionActive,
  onRefresh,
}) => {
  const currency = store.currency || 'EGP';
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form fields
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategoryId, setPCategoryId] = useState<string>('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pComparePrice, setPComparePrice] = useState<number | ''>('');
  const [pStock, setPStock] = useState<number>(10);
  const [pSku, setPSku] = useState('');
  const [pWeight, setPWeight] = useState<number | ''>('');
  const [pIsActive, setPIsActive] = useState(true);
  const [pImages, setPImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [variantOptions, setVariantOptions] = useState<ProductVariantOption[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValues, setNewVarValues] = useState('');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Open Product Modal
  const handleOpenProductModal = (product?: Product) => {
    setFeedback(null);
    if (product) {
      setEditingProduct(product);
      setPName(product.name);
      setPDesc(product.description || '');
      setPCategoryId(product.category_id || '');
      setPPrice(product.price);
      setPComparePrice(product.compare_at_price || '');
      setPStock(product.stock_quantity);
      setPSku(product.sku || '');
      setPWeight(product.weight_kg || '');
      setPIsActive(product.is_active);
      setPImages(product.images ? product.images.map((img) => img.image_url) : []);
      setVariantOptions(product.options_json?.variants || []);
    } else {
      setEditingProduct(null);
      setPName('');
      setPDesc('');
      setPCategoryId(categories[0]?.id || '');
      setPPrice(299.00);
      setPComparePrice(399.00);
      setPStock(20);
      setPSku(`SKU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setPWeight(0.5);
      setPIsActive(true);
      setPImages([CURATED_PRODUCT_IMAGES[0].url]);
      setVariantOptions([]);
    }
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscriptionActive) {
      alert('لا يمكن إضافة أو تعديل المنتجات لأن اشتراكك منتهي.');
      return;
    }

    try {
      if (editingProduct) {
        db.updateProduct(
          editingProduct.id,
          {
            name: pName.trim(),
            description: pDesc.trim() || null,
            category_id: pCategoryId || null,
            price: Number(pPrice),
            compare_at_price: pComparePrice ? Number(pComparePrice) : null,
            stock_quantity: Math.max(0, parseInt(String(pStock), 10) || 0),
            sku: pSku.trim() || null,
            weight_kg: pWeight ? Number(pWeight) : null,
            is_active: pIsActive,
            options_json: {
              variants: variantOptions,
            },
          },
          pImages
        );
        setFeedback({ type: 'success', message: 'تم تحديث المنتج بنجاح!' });
      } else {
        db.createProduct(
          {
            store_id: store.id,
            name: pName.trim(),
            description: pDesc.trim() || null,
            category_id: pCategoryId || null,
            price: Number(pPrice),
            compare_at_price: pComparePrice ? Number(pComparePrice) : null,
            stock_quantity: Math.max(0, parseInt(String(pStock), 10) || 0),
            sku: pSku.trim() || null,
            weight_kg: pWeight ? Number(pWeight) : null,
            is_active: pIsActive,
            options_json: {
              variants: variantOptions,
            },
          },
          pImages
        );
        setFeedback({ type: 'success', message: 'تمت إضافة المنتج الجديد بنجاح!' });
      }

      setIsProductModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ المنتج');
    }
  };

  // Delete Product
  const handleDeleteProduct = (id: string, name: string) => {
    if (!isSubscriptionActive) {
      alert('اشتراك المتجر منتهي.');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف المنتج: "${name}"؟`)) {
      db.deleteProduct(id);
      onRefresh();
    }
  };

  // Add Variant Option
  const handleAddVariant = () => {
    if (!newVarName.trim() || !newVarValues.trim()) return;
    const valuesArray = newVarValues
      .split(/[,،]/)
      .map((v) => v.trim())
      .filter(Boolean);

    setVariantOptions([
      ...variantOptions,
      { name: newVarName.trim(), values: valuesArray },
    ]);
    setNewVarName('');
    setNewVarValues('');
  };

  // Remove Variant Option
  const handleRemoveVariant = (index: number) => {
    setVariantOptions(variantOptions.filter((_, i) => i !== index));
  };

  // Open Category Modal
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatSlug('');
    }
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscriptionActive) {
      alert('اشتراكك منتهي.');
      return;
    }
    try {
      if (editingCategory) {
        db.updateCategory(editingCategory.id, catName.trim(), catSlug.trim());
      } else {
        db.createCategory(store.id, catName.trim(), catSlug.trim());
      }
      setIsCategoryModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء حفظ القسم');
    }
  };

  // Delete Category
  const handleDeleteCategory = (id: string, name: string) => {
    if (!isSubscriptionActive) return;
    if (confirm(`هل أنت متأكد من حذف القسم "${name}"؟`)) {
      db.deleteCategory(id);
      onRefresh();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة كتالوج المنتجات والأقسام</h2>
          <p className="text-xs text-slate-500">
            أضف منتجاتك، تحكم في المخزون بدقة، وأنشئ أقساماً لتنظيم متجرك
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCategoryModal()}
            disabled={!isSubscriptionActive}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-purple-600" />
            <span>إضافة قسم جديد</span>
          </button>
          <button
            onClick={() => handleOpenProductModal()}
            disabled={!isSubscriptionActive}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Switcher: Products vs Categories */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'products'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>قائمة المنتجات ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'categories'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>أقسام المتجر ({categories.length})</span>
        </button>
      </div>

      {/* Products Sub Tab */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج أو رمز الـ SKU..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 shrink-0">تصفية حسب القسم:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              >
                <option value="all">كافة الأقسام ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">صورة المنتج</th>
                    <th className="py-3 px-4">اسم المنتج</th>
                    <th className="py-3 px-4">القسم</th>
                    <th className="py-3 px-4">السعر</th>
                    <th className="py-3 px-4">المخزون</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        لا توجد منتجات مطابقة للبحث أو القسم المحدد.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const mainImage = p.images && p.images[0] ? p.images[0].image_url : null;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={p.name}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                                {p.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              SKU: {p.sku || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {p.category?.name || 'بدون قسم'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {p.price.toFixed(2)} {currency}
                            {p.compare_at_price && (
                              <span className="text-[11px] text-slate-400 line-through mr-1 font-normal">
                                {p.compare_at_price.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stock_quantity <= 5
                                ? 'bg-rose-100 text-rose-800'
                                : p.stock_quantity <= 15
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock_quantity} قطعة
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {p.is_active ? 'متاح للبيع' : 'مخفي'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                disabled={!isSubscriptionActive}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition disabled:opacity-40"
                                title="تعديل المنتج"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                disabled={!isSubscriptionActive}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40"
                                title="حذف المنتج"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
      )}

      {/* Categories Sub Tab */}
      {activeSubTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700">الأقسام الحالية</h3>
            <button
              onClick={() => handleOpenCategoryModal()}
              disabled={!isSubscriptionActive}
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition"
            >
              + إضافة قسم
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((cat) => {
              const catProdsCount = products.filter((p) => p.category_id === cat.id).length;
              return (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">slug: {cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {catProdsCount} منتج مرتبط
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        disabled={!isSubscriptionActive}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={!isSubscriptionActive}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span>{editingProduct ? `تعديل المنتج: ${editingProduct.name}` : 'إضافة منتج جديد للكتالوج'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              
              {/* Product Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="مثال: ساعة يد رجالية فاخرة"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    القسم التابع له
                  </label>
                  <select
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="">بدون قسم</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  وصف المنتج ومميزاته
                </label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="مواصفات الخامة، الضمان، المقاسات، طريقة الاستخدام..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Pricing & Stock Grid (NUMERIC 10,2) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    سعر البيع ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    السعر قبل الخصم ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pComparePrice}
                    onChange={(e) => setPComparePrice(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="اختياري"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    الكمية في المخزون (Stock) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              {/* SKU and Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    رمز التخزين التعريفي (SKU)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="WCH-001"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    وزن الشحنة بالكيلوغرام (Weight KG)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pWeight}
                    onChange={(e) => setPWeight(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="0.5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Multi-Image Management */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-800">
                  صور المنتج (Multi-Images)
                </label>
                
                {/* Images Preview list */}
                <div className="flex flex-wrap gap-2.5 mb-2">
                  {pImages.map((imgUrl, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPImages(pImages.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Image URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="أدخل رابط صورة جديد (https://...)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setPImages([...pImages, newImageUrl.trim()]);
                        setNewImageUrl('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    + إضافة
                  </button>
                </div>

                {/* Curated quick picker */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400">صور سريعة جاهزة:</span>
                  {CURATED_PRODUCT_IMAGES.slice(0, 4).map((curated, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPImages([...pImages, curated.url])}
                      className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                    >
                      {curated.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Variants JSON (Colors / Sizes) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">خيارات ومواصفات المنتج (Variants JSON)</h4>
                  <span className="text-[11px] text-slate-400">مثل الألوان، المقاسات، والأحجام</span>
                </div>

                {/* List of existing variants */}
                <div className="space-y-2">
                  {variantOptions.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                      <div>
                        <strong className="text-slate-800 ml-2">{opt.name}:</strong>
                        <span className="text-slate-500">{opt.values.join(' ، ')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new variant inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder="اسم الخاصية (مثال: اللون)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={newVarValues}
                      onChange={(e) => setNewVarValues(e.target.value)}
                      placeholder="القيم مفصولة بفاصلة (مثال: أسود، أزرق، فضي)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-full py-1.5 px-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod_active"
                  checked={pIsActive}
                  onChange={(e) => setPIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="prod_active" className="font-bold text-slate-800 cursor-pointer">
                  المنتج نشط ومتاح للشراء في المتجر (is_active)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المنتج في الكتالوج</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد للمتجر'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="مثال: ساعات رجالية"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  الرابط الفرعي (Slug)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="luxury-watches"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500"
                >
                  حفظ القسم
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
