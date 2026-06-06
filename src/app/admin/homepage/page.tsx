'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Save, X, Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

function getImg(url: string) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

/* ── Ürün Arama ── */
function ProductSearch({ sectionId, existingIds, onAdd }: {
  sectionId: string;
  existingIds: string[];
  onAdd: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: results = [] } = useQuery({
    queryKey: ['product-search-hp', query],
    queryFn: () => api.get('/products', { params: { search: query, limit: 8, status: 'ACTIVE' } }).then(r => r.data.data),
    enabled: query.trim().length >= 2,
    staleTime: 5000,
  });

  const addProduct = useMutation({
    mutationFn: (productId: string) => api.post(`/homepage/sections/${sectionId}/products`, { productId }),
    onSuccess: () => { onAdd(); toast.success('Ürün eklendi'); },
    onError: () => toast.error('Zaten ekli veya hata'),
  });

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 border border-dashed border-brand-300 rounded-xl px-3 py-2 bg-brand-50/50">
        <Search size={14} className="text-brand-400 shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Ürün adı yaz, ara ve ekle..."
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-brand-300"
        />
        {query && <button onClick={() => { setQuery(''); setOpen(false); }}><X size={12} className="text-gray-400" /></button>}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {(results as any[]).length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">Ürün bulunamadı</p>
          ) : (
            (results as any[]).map((p: any) => {
              const already = existingIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  disabled={already || addProduct.isPending}
                  onClick={() => { if (!already) { addProduct.mutate(p.id); setQuery(''); setOpen(false); } }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-50'}`}
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {p.thumbnail
                      ? <Image src={getImg(p.thumbnail) || ''} alt={p.name} width={36} height={36} className="h-full w-full object-cover" />
                      : <span className="flex h-full items-center justify-center text-base">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{Number(p.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
                  {already
                    ? <span className="text-xs text-gray-400">Zaten ekli</span>
                    : <span className="text-xs text-brand-600 font-semibold">+ Ekle</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ── Ana Sayfa ── */
export default function HomepagePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['homepage-sections-admin'],
    queryFn: () => api.get('/homepage/sections/all').then(r => r.data.data),
  });

  const addSection = useMutation({
    mutationFn: () => api.post('/homepage/sections', { title: newTitle, subtitle: newSubtitle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] });
      toast.success('Bölüm eklendi!');
      setNewTitle(''); setNewSubtitle(''); setShowForm(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const deleteSection = useMutation({
    mutationFn: (id: string) => api.delete(`/homepage/sections/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }); toast.success('Bölüm silindi'); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: any) => api.put(`/homepage/sections/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }),
  });

  const moveSection = useMutation({
    mutationFn: async ({ id, dir }: any) => {
      const arr = sections as any[];
      const idx = arr.findIndex((s: any) => s.id === id);
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return;
      const ids = arr.map((s: any) => s.id);
      [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
      return api.patch('/homepage/sections/reorder', { ids });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }),
  });

  const removeProduct = useMutation({
    mutationFn: ({ sectionId, productId }: any) => api.delete(`/homepage/sections/${sectionId}/products/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }),
  });

  const updateSection = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/homepage/sections/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }); toast.success('Kaydedildi'); },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anasayfa Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bölüm oluştur, istediğin ürünleri elle ekle</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary gap-2">
          {showForm ? <><X size={15} /> İptal</> : <><Plus size={15} /> Bölüm Ekle</>}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 border-2 border-brand-200 space-y-3">
          <h2 className="font-semibold">Yeni Bölüm</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Başlık *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="örn: Telefon Kılıfları" className="input" />
            </div>
            <div>
              <label className="label">Alt Başlık</label>
              <input value={newSubtitle} onChange={e => setNewSubtitle(e.target.value)} placeholder="örn: En çok satanlar" className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn-outline">İptal</button>
            <button onClick={() => { if (newTitle.trim()) addSection.mutate(); else toast.error('Başlık zorunlu'); }} disabled={addSection.isPending} className="btn-primary gap-1">
              <Save size={14} /> Oluştur
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}</div>
      ) : (sections as any[]).length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Henüz bölüm yok — yukarıdan ekle</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(sections as any[]).map((section: any, idx: number) => (
            <SectionCard
              key={section.id}
              section={section}
              idx={idx}
              total={(sections as any[]).length}
              onToggle={() => toggleActive.mutate({ id: section.id, isActive: !section.isActive })}
              onDelete={() => { if (confirm(`"${section.title}" silinsin mi?`)) deleteSection.mutate(section.id); }}
              onMove={(dir: 'up' | 'down') => moveSection.mutate({ id: section.id, dir })}
              onUpdate={data => updateSection.mutate({ id: section.id, data })}
              onRemoveProduct={(productId: string) => removeProduct.mutate({ sectionId: section.id, productId })}
              onProductAdded={() => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] })}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <strong>💡 Nasıl çalışır?</strong> Her bölüme istediğin ürünleri arayıp ekle.
        Anasayfada bölümler sırasıyla gösterilir. Pasif bölümler görünmez.
      </div>
    </div>
  );
}

function SectionCard({ section, idx, total, onToggle, onDelete, onMove, onUpdate, onRemoveProduct, onProductAdded }: any) {
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [subtitle, setSubtitle] = useState(section.subtitle || '');
  const [linkUrl, setLinkUrl] = useState(section.linkUrl || '');
  const existingIds = section.products?.map((p: any) => p.product.id) || [];

  return (
    <div className={`card border-l-4 ${section.isActive ? 'border-l-green-400' : 'border-l-gray-300'}`}>
      {/* Üst bar */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove('up')} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20"><ChevronUp size={13} /></button>
          <button onClick={() => onMove('down')} disabled={idx === total - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20"><ChevronDown size={13} /></button>
        </div>

        {editTitle ? (
          <div className="flex-1 flex gap-2 items-center flex-wrap">
            <input value={title} onChange={e => setTitle(e.target.value)} className="input input-sm flex-1 min-w-24" placeholder="Başlık" />
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="input input-sm flex-1 min-w-24" placeholder="Alt başlık" />
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="input input-sm flex-1 min-w-32" placeholder="Tümünü Gör linki (örn: /shop?category=kadin-giyim)" />
            <button onClick={() => { onUpdate({ title, subtitle: subtitle || null, linkUrl: linkUrl || null }); setEditTitle(false); }} className="btn-primary text-xs px-3 py-1.5">Kaydet</button>
            <button onClick={() => setEditTitle(false)} className="btn-ghost text-xs px-2 py-1.5">İptal</button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditTitle(true)}>
            <p className="font-semibold text-gray-800 text-sm">{section.title} <span className="text-gray-300 text-xs font-normal">— düzenle</span></p>
            {section.subtitle && <p className="text-xs text-gray-400">{section.subtitle}</p>}
            {section.linkUrl && <p className="text-xs text-brand-500 truncate">{section.linkUrl}</p>}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400">{section.products?.length || 0} ürün</span>
          <button onClick={onToggle} title={section.isActive ? 'Pasif yap' : 'Aktif yap'} className={`p-1.5 rounded-lg transition-colors ${section.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>
            {section.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Ürünler */}
      <div className="p-4 space-y-3">
        {/* Ekli ürünler */}
        {section.products?.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {section.products.map((item: any) => {
              const p = item.product;
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {p.thumbnail
                      ? <Image src={p.thumbnail.startsWith('http') ? p.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${p.thumbnail}`} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                      : <span className="flex h-full items-center justify-center">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{Number(p.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
                  <button onClick={() => onRemoveProduct(p.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Ürün arama */}
        <ProductSearch
          sectionId={section.id}
          existingIds={existingIds}
          onAdd={onProductAdded}
        />
      </div>
    </div>
  );
}
