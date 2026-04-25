export type StudyWorkbookStatus = 'uploaded' | 'importing' | 'imported' | 'failed';
export type StudyImportJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StudyQuestionType =
  | 'multiple_choice' | 'multiple_choice_single'
  | 'short_answer'
  | 'true_false' | 'ox'
  | 'essay' | 'essay_self_review';
export type EssaySelfReview = '알고있음' | '부분이해' | '모름';
export type StudyReviewStatus = 'approved' | 'needs_fix' | 'rejected' | 'draft';
export type StudyWrongNoteStatus = 'open' | 'reviewing' | 'resolved';

export interface StudySubject {
  id: string;
  slug: string;
  name: string;
  examName?: string;
  description?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyWorkbook {
  id: string;
  subjectId?: string;
  uploadedBy?: string;
  originalFilename: string;
  storageBucket: string;
  storagePath: string;
  fileHash?: string;
  status: StudyWorkbookStatus;
  metadata: Record<string, unknown>;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface StudyImportJob {
  id: string;
  workbookId: string;
  requestedBy?: string;
  status: StudyImportJobStatus;
  sourceHash?: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface StudyConcept {
  id: string;
  workbookId: string;
  subjectId?: string;
  parentId?: string;
  externalId: string;
  parentExternalId?: string;
  title: string;
  description?: string;
  orderIndex: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySeed {
  id: string;
  workbookId: string;
  subjectId?: string;
  conceptId?: string;
  externalId: string;
  title?: string;
  content?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyQuestion {
  id: string;
  workbookId: string;
  subjectId?: string;
  conceptId?: string;
  seedId?: string;
  externalId: string;
  questionNo?: string;
  type: StudyQuestionType;
  prompt: string;
  choices: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
  sourceSheet: string;
  reviewStatus: StudyReviewStatus;
  isActive: boolean;
  isHidden: boolean;
  rowHash?: string;
  raw: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyExamSet {
  id: string;
  workbookId: string;
  subjectId?: string;
  externalId: string;
  title: string;
  description?: string;
  totalQuestions: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyExamSetItem {
  id: string;
  setId: string;
  questionId: string;
  position: number;
  points: string;
  metadata: Record<string, unknown>;
}

export interface StudyAttempt {
  id: string;
  userId: string;
  workbookId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  elapsedSeconds?: number;
  metadata: Record<string, unknown>;
  submittedAt: Date;
}

export interface StudyWrongNote {
  id: string;
  userId: string;
  workbookId: string;
  questionId: string;
  attemptId?: string;
  status: StudyWrongNoteStatus;
  note?: string;
  wrongCount: number;
  lastWrongAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
