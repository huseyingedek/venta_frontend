export default function ProductLoading() {
  return (
    <div className="container py-6">
      <div className="mb-6 h-4 w-64 rounded bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-3 animate-pulse">
          <div className="aspect-square rounded-2xl bg-gray-200" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="space-y-5 animate-pulse">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-10 w-1/3 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-12 w-32 rounded-xl bg-gray-200" />
            <div className="h-12 flex-1 rounded-xl bg-gray-200" />
            <div className="h-12 w-12 rounded-xl bg-gray-200" />
          </div>
          <div className="h-24 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
