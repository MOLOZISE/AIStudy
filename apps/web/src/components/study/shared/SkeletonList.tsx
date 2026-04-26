export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}
