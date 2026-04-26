// Core domain types for study app

export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type WorkbookVisibility = 'private' | 'friends' | 'public';
export type WrongNoteStatus = 'open' | 'reviewing' | 'mastered' | 'ignored';
export type QuestType = 'daily' | 'weekly' | 'monthly';
export type RewardEventType = 'solve_question' | 'create_workbook' | 'community_share' | 'quest_complete';

// Dashboard
export interface DashboardSummary {
  studyTimeTodayMinutes: number;
  weeklyAccuracyRate: number;
  streakDays: number;
  todayQuestProgress: { completed: number; total: number };
  recentWorkbooks: WorkbookListItem[];
}

// Workbooks
export interface WorkbookListItem {
  id: string;
  title: string;
  subject: string;
  difficulty: QuestionDifficulty;
  questionCount: number;
  progressRate: number;
  lastStudiedAt?: string;
  ownership: 'created' | 'shared' | 'saved';
}

export interface PublicWorkbook {
  id: string;
  title: string;
  subject: string;
  difficulty: QuestionDifficulty;
  questionCount: number;
  authorName: string;
  rating: number;
  solveCount: number;
  saveCount: number;
  likeCount: number;
  tags: string[];
  verified: boolean;
  updatedAt: string;
}

// Questions
export interface SolveQuestion {
  id: string;
  order: number;
  type: QuestionType;
  body: string;
  choices?: string[];
  correctAnswer?: string;
  explanation?: string;
  subject?: string;
}

export interface GeneratedQuestion {
  id: string;
  order: number;
  type: QuestionType;
  title: string;
  body: string;
  choices?: string[];
  answer: string;
  explanation?: string;
  subject?: string;
  difficulty?: QuestionDifficulty;
  source?: 'ai' | 'excel' | 'manual';
}

// Attempts & Results
export interface AttemptResult {
  id: string;
  score: number;
  accuracyRate: number;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
}

// Wrong Notes
export interface WrongNote {
  id: string;
  questionId: string;
  questionTitle: string;
  subject: string;
  userAnswer?: string;
  wrongCount: number;
  status: WrongNoteStatus;
  lastAttemptedAt: string;
}

// Quests & Gamification
export interface QuestItem {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  targetValue: number;
  currentValue: number;
  reward: { xp: number; points: number };
  completed: boolean;
}

export interface UserProgressSummary {
  level: number;
  totalXp: number;
  points: number;
  streakDays: number;
  completedQuestCount: number;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  earnedAt?: string;
  progress?: number;
  target?: number;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  initials: string;
  xp: number;
  solvedCount: number;
  streakDays: number;
  questProgress: string;
  isCurrentUser?: boolean;
}

// Community
export interface CommunityPost {
  id: string;
  category: 'question' | 'review' | 'workbook' | 'tip' | 'discussion';
  title: string;
  bodyPreview: string;
  commentCount: number;
  likeCount: number;
  tags: string[];
  author: string;
  createdAt: string;
}

export interface CommentPreview {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  postTitle?: string;
}

// Workbook Detail
export interface WorkbookRating {
  averageRating: number;
  totalRatings: number;
  distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface WorkbookDetail {
  id: string;
  title: string;
  subject: string;
  difficulty: QuestionDifficulty;
  questionCount: number;
  authorName: string;
  solveCount: number;
  saveCount: number;
  likeCount: number;
  tags: string[];
  verified: boolean;
  updatedAt: string;
  description: string;
  authorInfo: {
    name: string;
    avatar?: string;
  };
  rating: WorkbookRating;
  liked: boolean;
  userRating?: number;
}

// AI Generation
export interface GenerationJob {
  id: string;
  status: 'idle' | 'uploading' | 'analyzing' | 'extracting' | 'generating' | 'checking' | 'complete' | 'failed';
  progress: number;
  estimatedTimeSeconds?: number;
  generatedQuestionCount: number;
  mcqCount: number;
  essayCount: number;
  shortAnswerCount: number;
}

// Stats
export interface LearningStats {
  totalStudyTime: number;
  overallAccuracyRate: number;
  totalQuestionsStudied: number;
  streakDays: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  subjectAchievements: Array<{
    subject: string;
    accuracy: number;
    solved: number;
  }>;
  recentStudyHistory: Array<{
    date: string;
    duration: number;
    questionsStudied: number;
  }>;
}
