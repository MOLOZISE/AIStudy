export function MetricCard({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-600">{unit}</span>}
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
