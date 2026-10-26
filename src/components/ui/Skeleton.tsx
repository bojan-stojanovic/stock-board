export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading quotes" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}