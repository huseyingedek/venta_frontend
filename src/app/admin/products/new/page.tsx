'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Upload, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import CategorySelect from '@/components/ui/CategorySelect';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function NewProductPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '', sku: '', description: '', shortDesc: '',
      price: '', comparePrice: '', costPrice: '',
      stock: 0, taxRate: 18, categoryId: '',
      status: 'ACTIVE', source: 'MANUAL',
      isFeatured: false, isNew: false, trackStock: true,
      metaTitle: '', metaDesc: '',
      attributes: [] as { name: string; value: string }[],
    }
  });

  const { fields: attrFields, append: appendAttr, remove: removeAttr } = useFieldArray({ control, name: 'attributes' });

  const { data: categoriesTree = [] } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: () => api.get('/categories?all=true').then(r => r.data.data),
  });

  function flattenCats(cats: any[], depth = 0): any[] {
    return cats.flatMap(c => [
      { ...c, _depth: depth },
      ...flattenCats(c.children || [], depth + 1),
    ]);
  }
  const allCategories = flattenCats(categoriesTree);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload/product-image', formData);
    return data.data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    toast.loading('Görsel yükleniyor...');
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setUploadedImages(prev => [...prev, ...urls]);
      toast.dismiss();
      toast.success(`${urls.length} görsel yüklendi!`);
    } catch {
      toast.dismiss();
      toast.error('Görsel yüklenirken hata oluştu.');
    }
  };

  const createProduct = useMutation({
    mutationFn: (formData: any) => {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        thumbnail: uploadedImages[0] || undefined,
      };
      return api.post('/products', payload);
    },
    onSuccess: async (res) => {
      const productId = res.data.data.id;

      // Görsel kaydet
      if (uploadedImages.length > 0) {
        await Promise.all(uploadedImages.map((url, i) =>
          api.post('/products/' + productId + '/images', { url, sortOrder: i }).catch(() => {})
        ));
      }

      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Ürün oluşturuldu!');
      router.push('/admin/products');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu.'),
  });

  const getImgSrc = (url: string) =>
    url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
      </div>

      <form onSubmit={handleSubmit(d => createProduct.mutate(d))} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Sol — Temel bilgiler */}
          <div className="lg:col-span-2 space-y-5">
            {/* Temel */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Temel Bilgiler</h2>
              <div>
                <label className="label">Ürün Adı *</label>
                <input {...register('name', { required: 'Ürün adı gerekli' })} className="input" placeholder="Ürün adını girin" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU</label>
                  <input {...register('sku')} className="input" placeholder="VP-001" />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={{ required: 'Kategori seçin' }}
                    render={({ field }) => (
                      <CategorySelect
                        cats={allCategories}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message as string}</p>}
                </div>
              </div>
              <div>
                <label className="label">Kısa Açıklama</label>
                <input {...register('shortDesc')} className="input" placeholder="Ürünü özetleyin..." />
              </div>
              <div>
                <label className="label">Detaylı Açıklama</label>
                <textarea {...register('description')} rows={5} className="input resize-none" placeholder="Ürün açıklaması..." />
              </div>
            </div>

            {/* Fiyat */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Fiyatlandırma</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Satış Fiyatı (₺) *</label>
                  <input {...register('price', { required: 'Fiyat gerekli' })} type="number" step="0.01" className="input" placeholder="0.00" />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message as string}</p>}
                </div>
                <div>
                  <label className="label">Karşılaştırma Fiyatı (₺)</label>
                  <input {...register('comparePrice')} type="number" step="0.01" className="input" placeholder="Eski fiyat" />
                </div>
                <div>
                  <label className="label">Maliyet (₺)</label>
                  <input {...register('costPrice')} type="number" step="0.01" className="input" placeholder="Sadece admin görür" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">KDV Oranı (%)</label>
                  <select {...register('taxRate', { valueAsNumber: true })} className="input">
                    <option value={0}>%0</option>
                    <option value={1}>%1</option>
                    <option value={8}>%8</option>
                    <option value={18}>%18</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stok */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Stok Yönetimi</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Stok Adedi</label>
                  <input {...register('stock', { valueAsNumber: true })} type="number" min="0" className="input" />
                </div>
                <div>
                  <label className="label">Düşük Stok Uyarısı</label>
                  <input {...register('lowStockAlert' as any, { valueAsNumber: true })} type="number" min="0" defaultValue={5} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('trackStock')} className="accent-brand-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Stok takibi yap</span>
              </label>
            </div>

            {/* Özellikler */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Özellikler</h2>
                <button type="button" onClick={() => appendAttr({ name: '', value: '' })} className="btn-ghost gap-1 text-sm">
                  <Plus size={14} /> Ekle
                </button>
              </div>
              {attrFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input {...register(`attributes.${i}.name`)} placeholder="Özellik (ör: Renk)" className="input flex-1" />
                  <input {...register(`attributes.${i}.value`)} placeholder="Değer (ör: Kırmızı)" className="input flex-1" />
                  <button type="button" onClick={() => removeAttr(i)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {attrFields.length === 0 && <p className="text-sm text-gray-400">Özellik eklenmedi</p>}
            </div>

            {/* SEO */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">SEO</h2>
              <div>
                <label className="label">Meta Başlık</label>
                <input {...register('metaTitle')} className="input" placeholder="Boş bırakılırsa ürün adı kullanılır" />
              </div>
              <div>
                <label className="label">Meta Açıklama</label>
                <textarea {...register('metaDesc')} rows={2} className="input resize-none" placeholder="Arama motorlarında gösterilecek açıklama" />
              </div>
            </div>
          </div>

          {/* Sağ */}
          <div className="space-y-5">
            {/* Durum */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Yayın Durumu</h2>
              <select {...register('status')} className="input">
                <option value="ACTIVE">Aktif (Yayında)</option>
                <option value="DRAFT">Taslak</option>
                <option value="INACTIVE">Pasif</option>
              </select>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm text-gray-700">Öne Çıkan Ürün</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isNew')} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm text-gray-700">Yeni Ürün Rozeti</span>
                </label>
              </div>
            </div>

            {/* Görseller */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Ürün Görselleri</h2>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-outline w-full gap-2 py-8 border-dashed"
              >
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-500">Görsel yükle (JPEG, PNG, WebP)</span>
              </button>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={getImgSrc(url)} alt="Ürün görseli" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white"
                      >
                        <Trash2 size={10} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">Ana</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kaydet */}
            <button type="submit" disabled={createProduct.isPending} className="btn-primary w-full py-3 text-base">
              {createProduct.isPending ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
            </button>
            <Link href="/admin/products" className="block text-center text-sm text-gray-400 hover:text-gray-600">İptal</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
