'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { WrongNoteList } from '@/components/study/wrong-notes/WrongNoteList';
import { WrongNoteDetailPanel } from '@/components/study/wrong-notes/WrongNoteDetailPanel';
import { WrongNoteFilters } from '@/components/study/wrong-notes/WrongNoteFilters';
import { useState } from 'react';
import { mockWrongNotes } from '@/lib/study/mock-data';

export default function StudyWrongNotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(mockWrongNotes[0]?.id);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredNotes =
    filterStatus === 'all'
      ? mockWrongNotes
      : mockWrongNotes.filter((note) => note.status === filterStatus);

  const selectedNote = mockWrongNotes.find((n) => n.id === selectedNoteId);

  return (
    <StudyShell
      title="오답노트"
      description="틀린 문항들을 정리하고 복습하세요"
    >
      <div className="space-y-4 mb-6">
        <WrongNoteFilters onFilterChange={setFilterStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wrong Notes List */}
        <div className="lg:col-span-1">
          <SectionCard>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">오답 목록</h3>
              <WrongNoteList
                notes={filteredNotes}
                selectedId={selectedNoteId}
                onSelect={setSelectedNoteId}
              />
            </div>
          </SectionCard>
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <WrongNoteDetailPanel note={selectedNote} />
          ) : (
            <SectionCard>
              <div className="text-center py-12">
                <p className="text-gray-500">오답을 선택하면 상세 정보가 표시됩니다</p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </StudyShell>
  );
}
