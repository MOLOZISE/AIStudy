'use client';

import { Search } from 'lucide-react';
import { forwardRef } from 'react';

export const SearchInput = forwardRef<
  HTMLInputElement,
  {
    placeholder?: string;
    className?: string;
  }
>(({ placeholder = '검색...', className }, ref) => {
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 ${className || ''}`}>
      <Search className="h-4 w-4 text-gray-400" />
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
