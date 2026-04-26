'use client';

import { FilterBar } from '@/components/study/shared';
import { useState } from 'react';

interface WrongNoteFiltersProps {
  onFilterChange?: (status: string) => void;
}

export function WrongNoteFilters({ onFilterChange }: WrongNoteFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filters = [
    { id: 'all', label: '전체' },
    { id: 'open', label: '복습 필요' },
    { id: 'reviewing', label: '복습 중' },
    { id: 'mastered', label: '마스터' },
    { id: 'ignored', label: '제외' },
  ];

  const handleStatusChange = (id: string) => {
    setSelectedStatus(id);
    onFilterChange?.(id);
  };

  return (
    <FilterBar>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleStatusChange(filter.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === filter.id
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </FilterBar>
  );
}
