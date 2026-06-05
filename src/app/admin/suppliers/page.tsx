'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, RefreshCw, Loader2, ChevronDown, ChevronRight, Truck, Rss, Play } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSuppliersPage() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [supplierForm, setSupplierForm] = useState({ name: '', contactEmail: '' });
  const xmlTedarikMapping = JSON.stringify({
    root: 'products.product',
    name: 'name',
    sku: 'productCode',
    price: 'listPrice',
    stock: 'quantity',
    description: 'detail',
    image: 'image1',
    category: 'category',
  }, null, 2);

  const [feedForm, setFeedForm] = useState({
    name: '',
    url: '',
    cronSchedule: '0 */6 * * *',
    isActive: true,
    fieldMapping: xmlTedarikMapping,
  });

  const { data: suppliers = [], isLoading } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then(r => r.data.data),
  });

  const createSupplier = useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Tedarikçi oluşturuldu.');
      setShowNewSupplier(false);
      setSupplierForm({ name: '', contactEmail: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const createFeed = useMutation({
    mutationFn: ({ supplierId, data }: { supplierId: string; data: any }) =>
      api.post(`/suppliers/${supplierId}/feeds`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('XML feed eklendi.');
      setShowFeedForm(null);
      setFeedForm({
        name: '', url: '', cronSchedule: '0 */6 * * *', isActive: true,
        fieldMapping: JSON.stringify({
          itemSelector: 'Product', name: 'Name', sku: 'StockCode',
          price: 'Price', stock: 'Quantity', description: 'Description',
          thumbnail: 'Image', category: 'Category',
        }, null, 2),
      });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const syncFeed = async (feedId: string) => {
    setSyncingId(feedId);
    try {
      const res = await api.post(`/suppliers/feeds/${feedId}/sync`);
      const d = res.data.data;
      toast.success(`Tamamlandı: ${d.created} yeni, ${d.updated} güncellendi, ${d.skipped} atlandı.`);
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Senkronizasyon hatası');
    } finally {
      setSyncingId(null);
    }
  };

  const syncAll = useMutation({
    mutationFn: () => api.post('/suppliers/sync-all'),
    onSuccess: () => {
      toast.success("Tüm feed'ler senkronize edildi.");
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: () => toast.error('Senkronizasyon hatası'),
  });

  const handleCreateFeed = (supplierId: string) => {
    try {
      const parsedMapping = JSON.parse(feedForm.fieldMapping);
      createFeed.mutate({
        supplierId,
        data: { name: feedForm.name, url: feedForm.url, cronSchedule: feedForm.cronSchedule, isActive: feedForm.isActive, fieldMapping: parsedMapping },
      });
    } catch {
      toast.error('fieldMapping geçerli bir JSON değil.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tedarikçi & XML Yönetimi</h1>
        <div className="flex gap-2">
          <button onClick={() => syncAll.mutate()} disabled={syncAll.isPending} className="btn-outline gap-2 text-sm">
            {syncAll.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Tümünü Senkronize Et
          </button>
          <button onClick={() => setShowNewSupplier(true)} className="btn-primary gap-2 text-sm">
            <Plus size={14} /> Tedarikçi Ekle
          </button>
        </div>
      </div>

      {showNewSupplier && (
        <div className="card p-5 border-l-4 border-brand-500">
          <h3 className="font-semibold mb-4">Yeni Tedarikçi</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">İsim *</label>
              <input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Tedarikçi adı" />
            </div>
            <div>
              <label className="label">İletişim E-posta</label>
              <input value={supplierForm.contactEmail} onChange={e => setSupplierForm(f => ({ ...f, contactEmail: e.target.value }))} className="input" placeholder="info@tedarikci.com" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => createSupplier.mutate(supplierForm)} disabled={!supplierForm.name || createSupplier.isPending} className="btn-primary text-sm gap-1.5">
              {createSupplier.isPending && <Loader2 size={13} className="animate-spin" />} Kaydet
            </button>
            <button onClick={() => setShowNewSupplier(false)} className="btn-outline text-sm">İptal</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : suppliers.length === 0 ? (
        <div className="card p-12 text-center">
          <Truck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Henüz tedarikçi eklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map((supplier: any) => (
            <div key={supplier.id} className="card overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedId(expandedId === supplier.id ? null : supplier.id)}>
                <div className="flex items-center gap-3">
                  {expandedId === supplier.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{supplier.name}</p>
                    <p className="text-xs text-gray-400">
                      {supplier._count?.products || 0} ürün · {supplier.xmlFeeds?.length || 0} XML feed
                      {supplier.email && ` · ${supplier.email}`}
                    </p>
                  </div>
                </div>
                <span className="badge bg-green-100 text-green-700 text-xs">Aktif</span>
              </div>

              {expandedId === supplier.id && (
                <div className="border-t border-gray-100 px-5 pb-5">
                  <div className="flex items-center justify-between py-3">
                    <p className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Rss size={14} /> XML Feed'ler</p>
                    <button onClick={() => setShowFeedForm(showFeedForm === supplier.id ? null : supplier.id)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                      <Plus size={12} /> Feed Ekle
                    </button>
                  </div>

                  {showFeedForm === supplier.id && (
                    <div className="mb-4 rounded-xl bg-gray-50 p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label">Feed Adı *</label>
                          <input value={feedForm.name} onChange={e => setFeedForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Ana ürün feed'i" />
                        </div>
                        <div>
                          <label className="label">Cron Zamanlaması</label>
                          <input value={feedForm.cronSchedule} onChange={e => setFeedForm(f => ({ ...f, cronSchedule: e.target.value }))} className="input font-mono text-sm" />
                          <p className="text-xs text-gray-400 mt-1">Her 6 saatte bir: <code>0 */6 * * *</code></p>
                        </div>
                      </div>
                      <div>
                        <label className="label">XML URL *</label>
                        <input value={feedForm.url} onChange={e => setFeedForm(f => ({ ...f, url: e.target.value }))} className="input" placeholder="https://tedarikci.com/urunler.xml" />
                      </div>
                      <div>
                        <label className="label">Alan Eşleştirme (JSON)</label>
                        <textarea value={feedForm.fieldMapping} onChange={e => setFeedForm(f => ({ ...f, fieldMapping: e.target.value }))} rows={8} className="input font-mono text-xs resize-none" spellCheck={false} />
                        <p className="text-xs text-gray-400 mt-1"><code>itemSelector</code> ile XML'deki ürün öğesini, diğer alanlarla alan isimlerini eşleştirin.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={feedForm.isActive} onChange={e => setFeedForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" /> Aktif
                        </label>
                        <button onClick={() => handleCreateFeed(supplier.id)} disabled={!feedForm.name || !feedForm.url || createFeed.isPending} className="btn-primary text-sm gap-1.5">
                          {createFeed.isPending && <Loader2 size={13} className="animate-spin" />} Feed Kaydet
                        </button>
                        <button onClick={() => setShowFeedForm(null)} className="text-sm text-gray-500 hover:text-gray-700">İptal</button>
                      </div>
                    </div>
                  )}

                  {supplier.xmlFeeds?.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">Bu tedarikçiye henüz XML feed eklenmedi.</p>
                  ) : (
                    <div className="space-y-2">
                      {supplier.xmlFeeds?.map((feed: any) => (
                        <div key={feed.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-700">{feed.name}</p>
                              <span className={`badge text-xs ${feed.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {feed.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{feed.url}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                              {feed.cronSchedule}
                              {feed.lastSyncAt && ` · Son: ${new Date(feed.lastSyncAt).toLocaleString('tr-TR')}`}
                            </p>
                          </div>
                          <button onClick={() => syncFeed(feed.id)} disabled={syncingId === feed.id} className="ml-3 flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                            {syncingId === feed.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            Senkronize Et
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
