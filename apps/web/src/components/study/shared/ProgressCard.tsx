export function ProgressCard({
  label,
  current,
  target,
  description,
}: {
  label: string;
  current: number;
  target: number;
  description?: string;
}) {
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          {current}/{target}
        </p>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}
