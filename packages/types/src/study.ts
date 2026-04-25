export type StudyWorkbookStatus = 'uploaded' | 'importing' | 'imported' | 'failed';
export type StudyImportJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StudyQuestionType =
  | 'multiple_choice' | 'multiple_choice_single'
  | 'short_answer'
  | 'true_false' | 'ox'
  | 'essay' | 'essay_self_review';
export type EssaySelfReview = '알고있음' | '부분이해' | '모름';
export type StudyReviewStatus = 'approved' | 'needs_fix' | 'rejected' | 'draft';
export type StudyWrongNoteStatus = 'open' | 'reviewing' | 'mastered' | 'ignored' | 'resolved';

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
  reviewCount: number;
  lastWrongAt: Date;
  lastReviewedAt?: Date;
  resolvedAt?: Date;
  masteredAt?: Date;
  ignoredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyUserProgress {
  id: string;
  userId: string;
  level: number;
  totalXp: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type StudyRewardEventType =
  | 'question_attempt'
  | 'question_correct_bonus'
  | 'wrong_note_review_success'
  | 'wrong_note_marked_mastered'
  | 'exam_completed'
  | 'workbook_created'
  | 'workbook_published'
  | 'workbook_forked'
  | 'comment_created'
  | 'review_created';

export interface StudyRewardEvent {
  id: string;
  userId: string;
  eventType: StudyRewardEventType;
  sourceType: string;
  sourceId?: string;
  points: number;
  xp: number;
  reason?: string;
  idempotencyKey?: string;
  createdAt: Date;
}

export type QuestType = 'daily' | 'weekly' | 'monthly';
export type QuestMetric =
  | 'solve_questions'
  | 'correct_answers'
  | 'review_wrong_notes'
  | 'complete_exams'
  | 'earn_xp'
  | 'study_days';

export interface StudyQuest {
  id: string;
  type: QuestType;
  code: string;
  title: string;
  description?: string;
  metric: QuestMetric;
  targetValue: number;
  rewardXp: number;
  rewardPoints: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyUserQuestProgress {
  id: string;
  userId: string;
  questId: string;
  currentValue: number;
  completedAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkbookVisibility = 'private' | 'unlisted' | 'public';
export type WorkbookPublicationStatus = 'draft' | 'published' | 'hidden' | 'reported' | 'archived';

export interface StudyWorkbookPublication {
  id: string;
  workbookId: string;
  ownerId: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  tags: string[];
  visibility: WorkbookVisibility;
  status: WorkbookPublicationStatus;
  version: number;
  licenseType?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicWorkbookListItem {
  id: string;
  workbookId: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  tags: string[];
  questionCount: number;
  avgRating: number | null;
  reviewCount: number;
  likeCount: number;
  publishedAt: Date | null;
}

export interface WorkbookForkInfo {
  sourceWorkbookId: string;
  sourcePublicationId: string;
  forkedBy: string;
  forkedAt: Date;
}

export interface WorkbookSourceAttribution {
  publicationId: string;
  sourceTitle: string;
  sourceCategory?: string;
  sourceDifficulty?: string;
  forkedAt: Date;
}

export type CommentStatus = 'active' | 'hidden' | 'deleted' | 'reported';
export type CommentTargetType = 'publication' | 'question';

export interface StudyComment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  authorId: string;
  body: string;
  parentCommentId?: string;
  status: CommentStatus;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyCommentWithAuthor extends StudyComment {
  authorDisplayName: string;
  isAuthor?: boolean;
  isLiked?: boolean;
  replies?: StudyCommentWithAuthor[];
}
