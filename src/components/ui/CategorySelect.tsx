'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Cat { id: string; name: string; _depth: number; }

interface Props {
  cats: Cat[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export default function CategorySelect({ cats, value, onChange, placeholder = 'Kategori seçin' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = cats.find(c => c.id === value);

  const filtered = query.trim().length === 0
    ? cats
    : cats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? ('—'.repeat(selected._depth) + ' ' + selected.name).trimStart() : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onChange(''); setQuery(''); }}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Arama */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Kategori ara..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı</p>
            ) : (
              filtered.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { onChange(cat.id); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors ${cat.id === value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700'}`}
                >
                  <span className="text-gray-300">{'—'.repeat(cat._depth)}</span>
                  {cat._depth > 0 && ' '}
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
