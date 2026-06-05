export default function ShopLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="animate-pulse h-8 w-40 bg-gray-200 rounded" />
        <div className="animate-pulse h-10 w-36 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-card">
            <div className="animate-pulse aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4" />
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
              <div className="animate-pulse h-9 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
