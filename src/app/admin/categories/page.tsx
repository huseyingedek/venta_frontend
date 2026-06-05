'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  description?: string;
  children?: Category[];
  _count?: { products: number };
}

const defaultForm = { name: '', description: '', parentId: '', sortOrder: 0, isActive: true };

export default function AdminCategoriesPage() {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories?all=true').then(r => r.data.data),
  });

  const form = useForm({ defaultValues: defaultForm });

  const openCreate = (parentId = '') => {
    form.reset({ ...defaultForm, parentId });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    form.reset({
      name: cat.name,
      description: cat.description || '',
      parentId: cat.parentId || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setEditing(cat);
    setShowForm(true);
  };

  const saveCat = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data, parentId: data.parentId || null };
      return editing
        ? api.put(`/categories/${editing.id}`, payload)
        : api.post('/categories', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editing ? 'Kategori güncellendi!' : 'Kategori oluşturuldu!');
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata oluştu.'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/categories/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const deleteCat = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['nav-categories'] });
      toast.success('Kategori silindi.');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Silinemedi.'),
  });

  // Düz liste: ana kategoriler + alt kategoriler
  const flatList = categories.flatMap(cat => [cat, ...(cat.children || [])]);
  const topLevel = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <button onClick={() => openCreate()} className="btn-primary gap-2">
          <Plus size={16} /> Kategori Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="mb-5 font-semibold text-gray-800">
            {editing ? `Düzenle: ${editing.name}` : 'Yeni Kategori'}
          </h2>
          <form onSubmit={form.handleSubmit(d => saveCat.mutate(d))} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Kategori Adı *</label>
              <input {...form.register('name', { required: true })} className="input" placeholder="Kategori adını girin" />
            </div>
            <div>
              <label className="label">Üst Kategori</label>
              <select {...form.register('parentId')} className="input">
                <option value="">Ana kategori (üst yok)</option>
                {topLevel.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sıralama</label>
              <input {...form.register('sortOrder', { valueAsNumber: true })} type="number" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Açıklama</label>
              <input {...form.register('description')} className="input" placeholder="Kısa açıklama (isteğe bağlı)" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...form.register('isActive')} className="accent-brand-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Aktif (sitede görünsün)</span>
              </label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saveCat.isPending} className="btn-primary">
                {saveCat.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kategori ağacı */}
      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Henüz kategori yok</p>
          <button onClick={() => openCreate()} className="btn-primary mt-4 gap-2">
            <Plus size={15} /> İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Ürün Sayısı</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Sıra</th>
                <th className="px-5 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <>
                  {/* Ana kategori */}
                  <tr key={cat.id} className="bg-gray-50/50 hover:bg-gray-50 font-medium">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Folder size={16} className="text-brand-500" />
                        <span className="text-gray-800">{cat.name}</span>
                        <span className="text-xs text-gray-400 font-normal">/{cat.slug}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{cat._count?.products || 0}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive.mutate({ id: cat.id, isActive: !cat.isActive })}
                        className={`badge cursor-pointer ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {cat.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{cat.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openCreate(cat.id)}
                          className="p-1.5 rounded hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                          title="Alt kategori ekle"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`"${cat.name}" silinsin mi?`)) deleteCat.mutate(cat.id); }}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Alt kategoriler */}
                  {cat.children?.map(child => (
                    <tr key={child.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 pl-6">
                          <ChevronRight size={12} className="text-gray-300" />
                          <Folder size={14} className="text-gray-400" />
                          <span className="text-gray-700">{child.name}</span>
                          <span className="text-xs text-gray-400">/{child.slug}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{child._count?.products || 0}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive.mutate({ id: child.id, isActive: !child.isActive })}
                          className={`badge cursor-pointer ${child.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {child.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{child.sortOrder}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(child)}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { if (confirm(`"${child.name}" silinsin mi?`)) deleteCat.mutate(child.id); }}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
