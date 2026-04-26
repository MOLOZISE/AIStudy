import type {
  DashboardSummary,
  WorkbookListItem,
  PublicWorkbook,
  SolveQuestion,
  GeneratedQuestion,
  AttemptResult,
  WrongNote,
  QuestItem,
  UserProgressSummary,
  Badge,
  LeaderboardEntry,
  CommunityPost,
  CommentPreview,
  WorkbookRating,
  WorkbookDetail,
  GenerationJob,
  LearningStats,
} from './study-types';

// Dashboard Summary
export const mockDashboardSummary: DashboardSummary = {
  studyTimeTodayMinutes: 45,
  weeklyAccuracyRate: 78,
  streakDays: 7,
  todayQuestProgress: { completed: 2, total: 3 },
  recentWorkbooks: [],
};

// Workbook List
export const mockWorkbookListItems: WorkbookListItem[] = [
  {
    id: 'wb1',
    title: '고등수학 확률과 통계',
    subject: '수학',
    difficulty: 'hard',
    questionCount: 45,
    progressRate: 68,
    lastStudiedAt: '2024-04-24',
    ownership: 'created',
  },
  {
    id: 'wb2',
    title: '영어 빈칸 채우기',
    subject: '영어',
    difficulty: 'medium',
    questionCount: 32,
    progressRate: 45,
    lastStudiedAt: '2024-04-22',
    ownership: 'shared',
  },
  {
    id: 'wb3',
    title: '한국사 근현대사',
    subject: '한국사',
    difficulty: 'medium',
    questionCount: 28,
    progressRate: 85,
    lastStudiedAt: '2024-04-20',
    ownership: 'saved',
  },
];

// Public Workbooks for Discovery
export const mockPublicWorkbooks: PublicWorkbook[] = [
  {
    id: 'pub1',
    title: '수능 기출 수학 1등급',
    subject: '수학',
    difficulty: 'hard',
    questionCount: 120,
    authorName: '김대홍',
    rating: 4.8,
    solveCount: 1250,
    saveCount: 890,
    likeCount: 456,
    tags: ['수능', '기출', '1등급'],
    verified: true,
    updatedAt: '2024-04-15',
  },
  {
    id: 'pub2',
    title: '토익 900점 달성 가이드',
    subject: '영어',
    difficulty: 'hard',
    questionCount: 200,
    authorName: '이영희',
    rating: 4.6,
    solveCount: 2100,
    saveCount: 1200,
    likeCount: 678,
    tags: ['토익', '900점', 'LC'],
    verified: true,
    updatedAt: '2024-04-18',
  },
  {
    id: 'pub3',
    title: '중학 과학 완벽 정리',
    subject: '과학',
    difficulty: 'easy',
    questionCount: 85,
    authorName: '박과학',
    rating: 4.5,
    solveCount: 890,
    saveCount: 540,
    likeCount: 234,
    tags: ['중학', '과학', '정리'],
    verified: false,
    updatedAt: '2024-04-10',
  },
];

// Solve Questions
export const mockSolveQuestions: SolveQuestion[] = [
  {
    id: 'q1',
    order: 1,
    type: 'multiple_choice',
    body: '다음 중 확률의 덧셈 정리가 옳은 것은?',
    choices: [
      'P(A∪B) = P(A) + P(B)',
      'P(A∪B) = P(A) + P(B) - P(A∩B)',
      'P(A∪B) = P(A) × P(B)',
      'P(A∪B) = P(A) + P(B) + P(A∩B)',
    ],
    correctAnswer: 'P(A∪B) = P(A) + P(B) - P(A∩B)',
    explanation: '두 사건의 합집합의 확률은 각 확률의 합에서 교집합의 확률을 뺀 것입니다.',
    subject: '수학',
  },
  {
    id: 'q2',
    order: 2,
    type: 'short_answer',
    body: '52장의 카드에서 임의로 뽑은 카드가 스페이드일 확률은?',
    correctAnswer: '1/4 또는 0.25',
    explanation: '스페이드는 52장 중 13장이므로 13/52 = 1/4입니다.',
    subject: '수학',
  },
];

// Generated Questions (from AI)
export const mockGeneratedQuestions: GeneratedQuestion[] = [
  {
    id: 'gen1',
    order: 1,
    type: 'multiple_choice',
    title: '확률 개념 확인',
    body: '동전을 2번 던질 때 최소 1번 이상 앞면이 나올 확률은?',
    choices: ['1/4', '1/2', '3/4', '1'],
    answer: '3/4',
    explanation: '전체 경우에서 뒷면이 2번 나올 경우를 뺍니다.',
    difficulty: 'medium',
    source: 'ai',
  },
  {
    id: 'gen2',
    order: 2,
    type: 'essay',
    title: '확률 계산 문제',
    body: '주머니에 빨간 공 3개, 파란 공 2개가 있을 때, 공을 하나 꺼낼 때 빨간 공일 확률을 구하고 설명하시오.',
    answer: '3/5',
    explanation: '전체 공은 5개이고 빨간 공은 3개이므로 3/5입니다.',
    difficulty: 'easy',
    source: 'ai',
  },
];

// Attempt Results
export const mockAttemptResult: AttemptResult = {
  id: 'attempt1',
  score: 78,
  accuracyRate: 78,
  correctCount: 39,
  totalCount: 50,
  durationSeconds: 1800,
};

// Wrong Notes
export const mockWrongNotes: WrongNote[] = [
  {
    id: 'wn1',
    questionId: 'q5',
    questionTitle: '조합론 문제',
    subject: '수학',
    userAnswer: '240',
    wrongCount: 3,
    status: 'open',
    lastAttemptedAt: '2024-04-20',
  },
  {
    id: 'wn2',
    questionId: 'q8',
    questionTitle: '확률분포 문제',
    subject: '수학',
    userAnswer: '0.15',
    wrongCount: 2,
    status: 'reviewing',
    lastAttemptedAt: '2024-04-22',
  },
];

// Quests
export const mockQuests: QuestItem[] = [
  {
    id: 'qst1',
    title: '문제 10개 풀기',
    description: '오늘 문제를 10개 이상 풀어보세요',
    type: 'daily',
    targetValue: 10,
    currentValue: 7,
    reward: { xp: 100, points: 50 },
    completed: false,
  },
  {
    id: 'qst2',
    title: '문제집 공유하기',
    description: '작성한 문제집을 공유하세요',
    type: 'daily',
    targetValue: 1,
    currentValue: 0,
    reward: { xp: 200, points: 100 },
    completed: false,
  },
  {
    id: 'qst3',
    title: '정답률 70% 이상',
    description: '70% 이상의 정답률로 문제집을 완료하세요',
    type: 'daily',
    targetValue: 70,
    currentValue: 78,
    reward: { xp: 150, points: 75 },
    completed: true,
  },
];

// User Progress
export const mockUserProgress: UserProgressSummary = {
  level: 12,
  totalXp: 8450,
  points: 2340,
  streakDays: 7,
  completedQuestCount: 24,
};

// Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge1',
    icon: '⭐',
    name: '첫 문제 풀이',
    description: '첫 번째 문제를 풀었어요',
    earnedAt: '2024-01-15',
  },
  {
    id: 'badge2',
    icon: '🔥',
    name: '7일 연속',
    description: '7일 연속으로 학습했어요',
    earnedAt: '2024-04-20',
  },
  {
    id: 'badge3',
    icon: '🏆',
    name: '1등급 달성',
    description: '정답률 95% 이상을 달성했어요',
    earnedAt: undefined,
    progress: 85,
    target: 95,
  },
  {
    id: 'badge4',
    icon: '📚',
    name: '문제 마스터',
    description: '100개 이상의 문제를 풀었어요',
    earnedAt: undefined,
    progress: 78,
    target: 100,
  },
];

// Community Posts
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post1',
    category: 'tip',
    title: '수능 100일 전 집중력 유지 비결',
    bodyPreview: '안녕하세요. 이번 게시물에서는 수능을 앞두고 마지막 100일동안 집중력을 유지하는 방법을...',
    commentCount: 24,
    likeCount: 156,
    tags: ['수능', '집중력', '팁'],
    author: '수능전사',
    createdAt: '2024-04-24',
  },
  {
    id: 'post2',
    category: 'question',
    title: '확률 문제 풀이 방법',
    bodyPreview: '확률 단원에서 계산 실수가 자주 나는데 효과적인 풀이 방법이 있을까요?...',
    commentCount: 12,
    likeCount: 45,
    tags: ['수학', '확률', '도움'],
    author: '수학초보',
    createdAt: '2024-04-23',
  },
];

// Generation Job
export const mockGenerationJob: GenerationJob = {
  id: 'job1',
  status: 'complete',
  progress: 100,
  generatedQuestionCount: 12,
  mcqCount: 8,
  essayCount: 3,
  shortAnswerCount: 1,
};

// Learning Stats
export const mockLearningStats: LearningStats = {
  totalStudyTime: 3420,
  overallAccuracyRate: 78,
  totalQuestionsStudied: 156,
  streakDays: 7,
  weeklyGoalProgress: 85,
  monthlyGoalProgress: 62,
  subjectAchievements: [
    { subject: '수학', accuracy: 82, solved: 45 },
    { subject: '영어', accuracy: 76, solved: 38 },
    { subject: '한국사', accuracy: 75, solved: 32 },
    { subject: '과학', accuracy: 72, solved: 41 },
  ],
  recentStudyHistory: [
    { date: '2024-04-24', duration: 45, questionsStudied: 15 },
    { date: '2024-04-23', duration: 60, questionsStudied: 22 },
    { date: '2024-04-22', duration: 50, questionsStudied: 18 },
    { date: '2024-04-21', duration: 55, questionsStudied: 20 },
  ],
};

// Comment Previews
export const mockCommentPreviews: CommentPreview[] = [
  {
    id: 'cmt1',
    author: '학습자123',
    text: '정말 유용한 문제집입니다. 추천합니다!',
    createdAt: '2024-04-24',
    postTitle: '수능 수학 전략',
  },
  {
    id: 'cmt2',
    author: '수학강사',
    text: '확률 단원 설명이 정확하네요.',
    createdAt: '2024-04-23',
    postTitle: '확률 완벽 정리',
  },
];

// Workbook Rating
export const mockWorkbookRating: WorkbookRating = {
  averageRating: 4.7,
  totalRatings: 248,
  distribution: {
    '5': 180,
    '4': 45,
    '3': 15,
    '2': 5,
    '1': 3,
  },
};

// Workbook Detail
export const mockWorkbookDetail: WorkbookDetail = {
  id: 'pub1',
  title: '수능 기출 수학 1등급',
  description: '2015~2024년 수능 기출 문제를 철저히 분석하고 정리한 문제집입니다. 객관식 문제를 완벽하게 풀기 위한 전략을 제시합니다.',
  subject: '수학',
  difficulty: 'hard',
  questionCount: 120,
  authorName: '김대홍',
  authorInfo: {
    name: '김대홍',
    avatar: '👨‍🏫',
  },
  rating: mockWorkbookRating,
  solveCount: 1250,
  saveCount: 890,
  likeCount: 456,
  liked: false,
  userRating: undefined,
  tags: ['수능', '기출', '1등급'],
  verified: true,
  updatedAt: '2024-04-15',
};

// Mypage - Point History
export const mockPointHistory = [
  { date: '2024-04-26', type: 'earn' as const, description: '퀘스트 완료', amount: 100, balance: 2500 },
  { date: '2024-04-25', type: 'earn' as const, description: '문제집 공유', amount: 50, balance: 2400 },
  { date: '2024-04-24', type: 'earn' as const, description: '문제 풀이', amount: 25, balance: 2350 },
  { date: '2024-04-23', type: 'spend' as const, description: '문제 생성 AI 이용', amount: 100, balance: 2325 },
  { date: '2024-04-22', type: 'earn' as const, description: '연속 학습 7일', amount: 200, balance: 2425 },
];

// Mypage - Subject Achievements
export const mockSubjectAchievements = [
  { subject: '수학', accuracy: 85, solved: 125 },
  { subject: '영어', accuracy: 78, solved: 98 },
  { subject: '한국사', accuracy: 92, solved: 64 },
  { subject: '과학', accuracy: 71, solved: 110 },
  { subject: '국어', accuracy: 88, solved: 76 },
];

// Mypage - Leaderboard
export const mockLeaderboardEntries: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', userName: '수학천재', initials: 'SK', xp: 8500, solvedCount: 450, streakDays: 15, questProgress: '12/15' },
  { rank: 2, userId: 'u2', userName: '영어왕', initials: 'EW', xp: 8200, solvedCount: 420, streakDays: 12, questProgress: '11/15' },
  { rank: 3, userId: 'u3', userName: '공부중', initials: 'KS', xp: 7900, solvedCount: 390, streakDays: 10, questProgress: '9/15' },
  { rank: 4, userId: 'u4', userName: '노력중', initials: 'NL', xp: 7500, solvedCount: 365, streakDays: 8, questProgress: '8/15' },
  { rank: 5, userId: 'user123', userName: '나 (changseok)', initials: 'CH', xp: 7200, solvedCount: 340, streakDays: 7, questProgress: '7/15', isCurrentUser: true },
  { rank: 6, userId: 'u6', userName: '학습자', initials: 'HL', xp: 6800, solvedCount: 310, streakDays: 5, questProgress: '6/15' },
  { rank: 7, userId: 'u7', userName: '시험준비', initials: 'SJ', xp: 6400, solvedCount: 280, streakDays: 4, questProgress: '5/15' },
  { rank: 8, userId: 'u8', userName: '열공중', initials: 'YG', xp: 6000, solvedCount: 250, streakDays: 3, questProgress: '4/15' },
  { rank: 9, userId: 'u9', userName: '신입', initials: 'SI', xp: 5500, solvedCount: 220, streakDays: 2, questProgress: '2/15' },
  { rank: 10, userId: 'u10', userName: '초보', initials: 'CB', xp: 4800, solvedCount: 180, streakDays: 1, questProgress: '1/15' },
];

// Mypage - Workbook History
export const mockWorkbookHistory = [
  { id: 'h1', workbookTitle: '수능 기출 수학 1등급', eventType: 'solved' as const, date: '2024-04-26' },
  { id: 'h2', workbookTitle: '토익 900점 달성 가이드', eventType: 'modified' as const, date: '2024-04-25' },
  { id: 'h3', workbookTitle: '중학 과학 완벽 정리', eventType: 'created' as const, date: '2024-04-24' },
  { id: 'h4', workbookTitle: '수능 기출 수학 1등급', eventType: 'solved' as const, date: '2024-04-23' },
  { id: 'h5', workbookTitle: '고등수학 확률과 통계', eventType: 'solved' as const, date: '2024-04-22' },
];
