'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Upload, Save } from 'lucide-react';
import api from '@/lib/api';
import CategorySelect from '@/components/ui/CategorySelect';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => api.get(`/products/by-id/${id}`).then(r => r.data.data),
  });

  const { data: categoriesTree = [] } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: () => api.get('/categories?all=true').then(r => r.data.data),
  });

  // Recursive flatten: tüm seviyeleri düzleştir
  function flattenCats(cats: any[], depth = 0): any[] {
    return cats.flatMap(c => [
      { ...c, _depth: depth },
      ...flattenCats(c.children || [], depth + 1),
    ]);
  }
  const allCategories = flattenCats(categoriesTree);

  const { register, handleSubmit, control, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      name: '', sku: '', description: '', shortDesc: '',
      price: '', comparePrice: '', costPrice: '',
      stock: 0, taxRate: 18, categoryId: '',
      status: 'ACTIVE', isFeatured: false, isNew: false, trackStock: true,
      metaTitle: '', metaDesc: '',
      attributes: [] as { name: string; value: string }[],
    }
  });

  const { fields: attrFields, append: appendAttr, remove: removeAttr } = useFieldArray({ control, name: 'attributes' });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        shortDesc: product.shortDesc || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        costPrice: product.costPrice?.toString() || '',
        stock: product.stock || 0,
        taxRate: product.taxRate || 18,
        categoryId: product.categoryId || '',
        status: product.status || 'ACTIVE',
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        trackStock: product.trackStock ?? true,
        metaTitle: product.metaTitle || '',
        metaDesc: product.metaDesc || '',
        attributes: product.attributes || [],
      });
      // Görselleri yükle
      const imgs = [
        ...(product.thumbnail ? [product.thumbnail] : []),
        ...(product.images?.map((i: any) => i.url) || []),
      ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
      setImages(imgs);
    }
  }, [product, reset]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload/product-image', formData);
    return data.data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const toastId = toast.loading('Görsel yükleniyor...');
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} görsel yüklendi!`, { id: toastId });
    } catch {
      toast.error('Görsel yüklenemedi.', { id: toastId });
    }
  };

  const updateProduct = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        thumbnail: images[0] || null,
      };
      // 1) Ürünü güncelle
      await api.put(`/products/${id}`, payload);

      // 2) Görselleri senkronize et: sil/ekle
      const existingImgs: { id: string; url: string }[] = product?.images || [];
      const existingUrls = existingImgs.map((i: any) => i.url);
      const toDelete = existingImgs.filter((img: any) => !images.includes(img.url));
      const toAdd = images.filter((url: string) => !existingUrls.includes(url));

      await Promise.all(
        toDelete.map((img: any) => api.delete(`/products/${id}/images/${img.id}`).catch(() => {}))
      );
      await Promise.all(
        toAdd.map((url: string) =>
          api.post(`/products/${id}/images`, { url, sortOrder: images.indexOf(url) }).catch(() => {})
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['product-edit', id] });
      toast.success('Ürün güncellendi!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata oluştu.'),
  });

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="card p-5 h-48 bg-gray-100" />
        <div className="card p-5 h-32 bg-gray-100" />
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 text-gray-400">Ürün bulunamadı.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
          <p className="text-sm text-gray-400">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => updateProduct.mutate(d))} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Sol */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Temel Bilgiler</h2>
              <div>
                <label className="label">Ürün Adı *</label>
                <input {...register('name', { required: true })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU</label>
                  <input {...register('sku')} className="input" />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CategorySelect
                        cats={allCategories}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="label">Kısa Açıklama</label>
                <input {...register('shortDesc')} className="input" />
              </div>
              <div>
                <label className="label">Detaylı Açıklama</label>
                <textarea {...register('description')} rows={5} className="input resize-none" />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Fiyatlandırma</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Satış Fiyatı (₺) *</label>
                  <input {...register('price', { required: true })} type="number" step="0.01" className="input" />
                </div>
                <div>
                  <label className="label">Karşılaştırma Fiyatı</label>
                  <input {...register('comparePrice')} type="number" step="0.01" className="input" />
                </div>
                <div>
                  <label className="label">Maliyet</label>
                  <input {...register('costPrice')} type="number" step="0.01" className="input" />
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

            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Stok</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Stok Adedi</label>
                  <input {...register('stock', { valueAsNumber: true })} type="number" min="0" className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('trackStock')} className="accent-brand-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Stok takibi</span>
              </label>
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Özellikler</h2>
                <button type="button" onClick={() => appendAttr({ name: '', value: '' })} className="btn-ghost gap-1 text-sm">
                  <Plus size={14} /> Ekle
                </button>
              </div>
              {attrFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input {...register(`attributes.${i}.name`)} placeholder="Özellik" className="input flex-1" />
                  <input {...register(`attributes.${i}.value`)} placeholder="Değer" className="input flex-1" />
                  <button type="button" onClick={() => removeAttr(i)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {attrFields.length === 0 && <p className="text-sm text-gray-400">Özellik yok</p>}
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">SEO</h2>
              <div>
                <label className="label">Meta Başlık</label>
                <input {...register('metaTitle')} className="input" />
              </div>
              <div>
                <label className="label">Meta Açıklama</label>
                <textarea {...register('metaDesc')} rows={2} className="input resize-none" />
              </div>
            </div>
          </div>

          {/* Sağ */}
          <div className="space-y-5">
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Durum</h2>
              <select {...register('status')} className="input">
                <option value="ACTIVE">Aktif</option>
                <option value="DRAFT">Taslak</option>
                <option value="INACTIVE">Pasif</option>
                <option value="OUT_OF_STOCK">Stok Yok</option>
              </select>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm">Öne Çıkan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isNew')} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm">Yeni Ürün Rozeti</span>
                </label>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Görseller</h2>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <Image src={getImgSrc(url)} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">Ana</span>}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-brand-300 transition-colors"
                  >
                    <Plus size={20} className="text-gray-400" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-outline w-full gap-2 py-8 border-dashed"
                >
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Görsel Yükle</span>
                </button>
              )}
            </div>

            {/* XML bilgisi */}
            {product.source === 'XML' && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">📡 XML Kaynaklı Ürün</p>
                <p className="text-xs text-blue-500">Tedarikçi: {product.supplier?.name}</p>
                <p className="text-xs text-blue-500">Harici ID: {product.externalId}</p>
                <p className="text-xs text-blue-400 mt-1">Bir sonraki XML sync'te bazı alanlar otomatik güncellenebilir.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={updateProduct.isPending}
              className="btn-primary w-full py-3 text-base gap-2"
            >
              <Save size={16} />
              {updateProduct.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>

            <Link href={`/product/${product.slug}`} target="_blank" className="block text-center text-sm text-gray-400 hover:text-brand-600 transition-colors">
              ↗ Ürünü önizle
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
