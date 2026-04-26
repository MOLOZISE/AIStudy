'use client';

export function SegmentTabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === item.value
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
