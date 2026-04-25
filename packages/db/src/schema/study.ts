import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

export const studySubjects = pgTable(
  'study_subjects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 120 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    examName: varchar('exam_name', { length: 255 }),
    description: text('description'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_study_subjects_slug').on(table.slug),
  })
);

export const studyWorkbooks = pgTable(
  'study_workbooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id').references(() => studySubjects.id, { onDelete: 'set null' }),
    uploadedBy: uuid('uploaded_by'),
    originalFilename: varchar('original_filename', { length: 500 }).notNull(),
    storageBucket: varchar('storage_bucket', { length: 120 }).notNull().default('study-workbooks'),
    storagePath: text('storage_path').notNull(),
    fileHash: varchar('file_hash', { length: 128 }),
    status: varchar('status', { length: 40 }).notNull().default('uploaded'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    storagePathIdx: uniqueIndex('idx_study_workbooks_storage_path').on(table.storagePath),
    subjectIdx: index('idx_study_workbooks_subject_id').on(table.subjectId),
    uploadedByIdx: index('idx_study_workbooks_uploaded_by').on(table.uploadedBy),
    statusIdx: index('idx_study_workbooks_status').on(table.status),
  })
);

export const studyImportJobs = pgTable(
  'study_import_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    requestedBy: uuid('requested_by'),
    status: varchar('status', { length: 40 }).notNull().default('pending'),
    sourceHash: varchar('source_hash', { length: 128 }),
    totalRows: integer('total_rows').default(0),
    importedRows: integer('imported_rows').default(0),
    failedRows: integer('failed_rows').default(0),
    errors: jsonb('errors').$type<Array<Record<string, unknown>>>().default([]),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookIdx: index('idx_study_import_jobs_workbook_id').on(table.workbookId),
    statusIdx: index('idx_study_import_jobs_status').on(table.status),
    sourceHashIdx: index('idx_study_import_jobs_source_hash').on(table.sourceHash),
  })
);

export const studyConcepts = pgTable(
  'study_concepts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => studySubjects.id, { onDelete: 'set null' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => studyConcepts.id, { onDelete: 'set null' }),
    externalId: varchar('external_id', { length: 120 }).notNull(),
    parentExternalId: varchar('parent_external_id', { length: 120 }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    orderIndex: integer('order_index').default(0),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookExternalIdx: uniqueIndex('idx_study_concepts_workbook_external').on(table.workbookId, table.externalId),
    workbookIdx: index('idx_study_concepts_workbook_id').on(table.workbookId),
    subjectIdx: index('idx_study_concepts_subject_id').on(table.subjectId),
    parentIdx: index('idx_study_concepts_parent_id').on(table.parentId),
  })
);

export const studySeeds = pgTable(
  'study_seeds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => studySubjects.id, { onDelete: 'set null' }),
    conceptId: uuid('concept_id').references(() => studyConcepts.id, { onDelete: 'set null' }),
    externalId: varchar('external_id', { length: 120 }).notNull(),
    title: varchar('title', { length: 500 }),
    content: text('content'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookExternalIdx: uniqueIndex('idx_study_seeds_workbook_external').on(table.workbookId, table.externalId),
    workbookIdx: index('idx_study_seeds_workbook_id').on(table.workbookId),
    conceptIdx: index('idx_study_seeds_concept_id').on(table.conceptId),
  })
);

export const studyQuestions = pgTable(
  'study_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => studySubjects.id, { onDelete: 'set null' }),
    conceptId: uuid('concept_id').references(() => studyConcepts.id, { onDelete: 'set null' }),
    seedId: uuid('seed_id').references(() => studySeeds.id, { onDelete: 'set null' }),
    externalId: varchar('external_id', { length: 120 }).notNull(),
    questionNo: varchar('question_no', { length: 80 }),
    type: varchar('type', { length: 60 }).notNull().default('multiple_choice'),
    prompt: text('prompt').notNull(),
    choices: jsonb('choices').$type<string[]>().default([]),
    answer: text('answer').notNull(),
    explanation: text('explanation'),
    difficulty: varchar('difficulty', { length: 40 }),
    sourceSheet: varchar('source_sheet', { length: 120 }).notNull().default('05_정식문제은행'),
    reviewStatus: varchar('review_status', { length: 60 }).default('approved'),
    isActive: boolean('is_active').notNull().default(true),
    isHidden: boolean('is_hidden').notNull().default(false),
    rowHash: varchar('row_hash', { length: 128 }),
    raw: jsonb('raw').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookExternalIdx: uniqueIndex('idx_study_questions_workbook_external').on(table.workbookId, table.externalId),
    workbookActiveIdx: index('idx_study_questions_workbook_active').on(table.workbookId, table.isActive, table.isHidden),
    conceptIdx: index('idx_study_questions_concept_id').on(table.conceptId),
    seedIdx: index('idx_study_questions_seed_id').on(table.seedId),
  })
);

export const studyExamSets = pgTable(
  'study_exam_sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => studySubjects.id, { onDelete: 'set null' }),
    externalId: varchar('external_id', { length: 120 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    totalQuestions: integer('total_questions').default(0),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookExternalIdx: uniqueIndex('idx_study_exam_sets_workbook_external').on(table.workbookId, table.externalId),
    workbookIdx: index('idx_study_exam_sets_workbook_id').on(table.workbookId),
  })
);

export const studyExamSetItems = pgTable(
  'study_exam_set_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    setId: uuid('set_id')
      .notNull()
      .references(() => studyExamSets.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => studyQuestions.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    points: numeric('points', { precision: 6, scale: 2 }).default('1'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  },
  (table) => ({
    setPositionIdx: uniqueIndex('idx_study_exam_set_items_set_position').on(table.setId, table.position),
    setQuestionIdx: uniqueIndex('idx_study_exam_set_items_set_question').on(table.setId, table.questionId),
    questionIdx: index('idx_study_exam_set_items_question_id').on(table.questionId),
  })
);

export const studyAttempts = pgTable(
  'study_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => studyQuestions.id, { onDelete: 'cascade' }),
    selectedAnswer: text('selected_answer').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    elapsedSeconds: integer('elapsed_seconds'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userSubmittedIdx: index('idx_study_attempts_user_submitted').on(table.userId, table.submittedAt),
    questionIdx: index('idx_study_attempts_question_id').on(table.questionId),
    workbookIdx: index('idx_study_attempts_workbook_id').on(table.workbookId),
  })
);

export const studyWrongNotes = pgTable(
  'study_wrong_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => studyQuestions.id, { onDelete: 'cascade' }),
    attemptId: uuid('attempt_id').references(() => studyAttempts.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 40 }).notNull().default('open'),
    note: text('note'),
    wrongCount: integer('wrong_count').notNull().default(1),
    reviewCount: integer('review_count').notNull().default(0),
    lastWrongAt: timestamp('last_wrong_at', { withTimezone: true }).defaultNow(),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    masteredAt: timestamp('mastered_at', { withTimezone: true }),
    ignoredAt: timestamp('ignored_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userQuestionIdx: uniqueIndex('idx_study_wrong_notes_user_question').on(table.userId, table.questionId),
    userStatusIdx: index('idx_study_wrong_notes_user_status').on(table.userId, table.status),
    workbookIdx: index('idx_study_wrong_notes_workbook_id').on(table.workbookId),
  })
);

export const studySubjectsRelations = relations(studySubjects, ({ many }) => ({
  workbooks: many(studyWorkbooks),
  concepts: many(studyConcepts),
  seeds: many(studySeeds),
  questions: many(studyQuestions),
  examSets: many(studyExamSets),
}));

export const studyWorkbooksRelations = relations(studyWorkbooks, ({ one, many }) => ({
  subject: one(studySubjects, {
    fields: [studyWorkbooks.subjectId],
    references: [studySubjects.id],
  }),
  importJobs: many(studyImportJobs),
  concepts: many(studyConcepts),
  seeds: many(studySeeds),
  questions: many(studyQuestions),
  examSets: many(studyExamSets),
  attempts: many(studyAttempts),
  wrongNotes: many(studyWrongNotes),
}));

export const studyImportJobsRelations = relations(studyImportJobs, ({ one }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyImportJobs.workbookId],
    references: [studyWorkbooks.id],
  }),
}));

export const studyConceptsRelations = relations(studyConcepts, ({ one, many }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyConcepts.workbookId],
    references: [studyWorkbooks.id],
  }),
  subject: one(studySubjects, {
    fields: [studyConcepts.subjectId],
    references: [studySubjects.id],
  }),
  parent: one(studyConcepts, {
    fields: [studyConcepts.parentId],
    references: [studyConcepts.id],
    relationName: 'studyConceptTree',
  }),
  children: many(studyConcepts, { relationName: 'studyConceptTree' }),
  seeds: many(studySeeds),
  questions: many(studyQuestions),
}));

export const studySeedsRelations = relations(studySeeds, ({ one, many }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studySeeds.workbookId],
    references: [studyWorkbooks.id],
  }),
  subject: one(studySubjects, {
    fields: [studySeeds.subjectId],
    references: [studySubjects.id],
  }),
  concept: one(studyConcepts, {
    fields: [studySeeds.conceptId],
    references: [studyConcepts.id],
  }),
  questions: many(studyQuestions),
}));

export const studyQuestionsRelations = relations(studyQuestions, ({ one, many }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyQuestions.workbookId],
    references: [studyWorkbooks.id],
  }),
  subject: one(studySubjects, {
    fields: [studyQuestions.subjectId],
    references: [studySubjects.id],
  }),
  concept: one(studyConcepts, {
    fields: [studyQuestions.conceptId],
    references: [studyConcepts.id],
  }),
  seed: one(studySeeds, {
    fields: [studyQuestions.seedId],
    references: [studySeeds.id],
  }),
  examSetItems: many(studyExamSetItems),
  attempts: many(studyAttempts),
  wrongNotes: many(studyWrongNotes),
}));

export const studyExamSetsRelations = relations(studyExamSets, ({ one, many }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyExamSets.workbookId],
    references: [studyWorkbooks.id],
  }),
  subject: one(studySubjects, {
    fields: [studyExamSets.subjectId],
    references: [studySubjects.id],
  }),
  items: many(studyExamSetItems),
}));

export const studyExamSetItemsRelations = relations(studyExamSetItems, ({ one }) => ({
  set: one(studyExamSets, {
    fields: [studyExamSetItems.setId],
    references: [studyExamSets.id],
  }),
  question: one(studyQuestions, {
    fields: [studyExamSetItems.questionId],
    references: [studyQuestions.id],
  }),
}));

export const studyAttemptsRelations = relations(studyAttempts, ({ one, many }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyAttempts.workbookId],
    references: [studyWorkbooks.id],
  }),
  question: one(studyQuestions, {
    fields: [studyAttempts.questionId],
    references: [studyQuestions.id],
  }),
  wrongNotes: many(studyWrongNotes),
}));

export const studyUserProgress = pgTable(
  'study_user_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique(),
    level: integer('level').notNull().default(1),
    totalXp: integer('total_xp').notNull().default(0),
    totalPoints: integer('total_points').notNull().default(0),
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    lastStudyDate: timestamp('last_study_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex('idx_study_user_progress_user_id').on(table.userId),
  })
);

export const studyRewardEvents = pgTable(
  'study_reward_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    eventType: varchar('event_type', { length: 120 }).notNull(),
    sourceType: varchar('source_type', { length: 120 }).notNull(),
    sourceId: uuid('source_id'),
    points: integer('points').notNull().default(0),
    xp: integer('xp').notNull().default(0),
    reason: text('reason'),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: index('idx_study_reward_events_user_id').on(table.userId),
    eventTypeIdx: index('idx_study_reward_events_event_type').on(table.eventType),
    createdAtIdx: index('idx_study_reward_events_created_at').on(table.createdAt),
    idempotencyIdx: uniqueIndex('idx_study_reward_events_idempotency').on(table.idempotencyKey),
  })
);

export const studyQuests = pgTable(
  'study_quests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 40 }).notNull(), // 'daily' | 'weekly' | 'monthly'
    code: varchar('code', { length: 120 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    metric: varchar('metric', { length: 120 }).notNull(), // 'solve_questions', 'correct_answers', etc.
    targetValue: integer('target_value').notNull(),
    rewardXp: integer('reward_xp').notNull(),
    rewardPoints: integer('reward_points').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex('idx_study_quests_code').on(table.code),
    typeIdx: index('idx_study_quests_type').on(table.type),
    startsAtIdx: index('idx_study_quests_starts_at').on(table.startsAt),
    endsAtIdx: index('idx_study_quests_ends_at').on(table.endsAt),
    isActiveIdx: index('idx_study_quests_is_active').on(table.isActive),
  })
);

export const studyUserQuestProgress = pgTable(
  'study_user_quest_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    questId: uuid('quest_id')
      .notNull()
      .references(() => studyQuests.id, { onDelete: 'cascade' }),
    currentValue: integer('current_value').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userQuestIdx: uniqueIndex('idx_study_user_quest_progress_user_quest').on(table.userId, table.questId),
    userIdx: index('idx_study_user_quest_progress_user_id').on(table.userId),
    questIdx: index('idx_study_user_quest_progress_quest_id').on(table.questId),
    completedAtIdx: index('idx_study_user_quest_progress_completed_at').on(table.completedAt),
    claimedAtIdx: index('idx_study_user_quest_progress_claimed_at').on(table.claimedAt),
  })
);

export const studyWrongNotesRelations = relations(studyWrongNotes, ({ one }) => ({
  workbook: one(studyWorkbooks, {
    fields: [studyWrongNotes.workbookId],
    references: [studyWorkbooks.id],
  }),
  question: one(studyQuestions, {
    fields: [studyWrongNotes.questionId],
    references: [studyQuestions.id],
  }),
  attempt: one(studyAttempts, {
    fields: [studyWrongNotes.attemptId],
    references: [studyAttempts.id],
  }),
}));

export const studyUserProgressRelations = relations(studyUserProgress, ({ many }) => ({
  rewardEvents: many(studyRewardEvents),
}));

export const studyRewardEventsRelations = relations(studyRewardEvents, ({ one }) => ({
  userProgress: one(studyUserProgress, {
    fields: [studyRewardEvents.userId],
    references: [studyUserProgress.userId],
  }),
}));

export const studyQuestsRelations = relations(studyQuests, ({ many }) => ({
  userProgress: many(studyUserQuestProgress),
}));

export const studyUserQuestProgressRelations = relations(studyUserQuestProgress, ({ one }) => ({
  quest: one(studyQuests, {
    fields: [studyUserQuestProgress.questId],
    references: [studyQuests.id],
  }),
}));

// ──────────────────────────────────────────────────────────────────────
// P9: Public Workbook Repository
// ──────────────────────────────────────────────────────────────────────

export const studyWorkbookPublications = pgTable(
  'study_workbook_publications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    difficulty: varchar('difficulty', { length: 40 }),
    tags: jsonb('tags').$type<string[]>().default([]),
    visibility: varchar('visibility', { length: 20 }).notNull().default('private'),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    version: integer('version').notNull().default(1),
    licenseType: varchar('license_type', { length: 50 }).default('all-rights-reserved'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    workbookUniq: uniqueIndex('idx_swp_workbook_id').on(table.workbookId),
    ownerIdx: index('idx_swp_owner_id').on(table.ownerId),
    statusIdx: index('idx_swp_status').on(table.status),
  })
);

export const studyUserLibrary = pgTable(
  'study_user_library',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    sourcePublicationId: uuid('source_publication_id')
      .notNull()
      .references(() => studyWorkbookPublications.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userPubUniq: uniqueIndex('idx_sul_user_pub').on(table.userId, table.sourcePublicationId),
    userIdx: index('idx_sul_user_id').on(table.userId),
  })
);

export const studyWorkbookReviews = pgTable(
  'study_workbook_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workbookId: uuid('workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => studyWorkbookPublications.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userPubUniq: uniqueIndex('idx_swr_user_pub').on(table.userId, table.publicationId),
    pubIdx: index('idx_swr_publication_id').on(table.publicationId),
  })
);

export const studyWorkbookLikes = pgTable(
  'study_workbook_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => studyWorkbookPublications.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userPubUniq: uniqueIndex('idx_swl_user_pub').on(table.userId, table.publicationId),
    pubIdx: index('idx_swl_publication_id').on(table.publicationId),
  })
);

export const studyReports = pgTable(
  'study_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    targetType: varchar('target_type', { length: 40 }).notNull(),
    targetId: uuid('target_id').notNull(),
    reporterId: uuid('reporter_id').notNull(),
    reason: varchar('reason', { length: 100 }).notNull(),
    detail: text('detail'),
    status: varchar('status', { length: 40 }).notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    targetIdx: index('idx_sreports_target').on(table.targetType, table.targetId),
    reporterTargetUniq: uniqueIndex('idx_sreports_reporter_target').on(table.reporterId, table.targetId),
  })
);

// Relations for P9
export const studyWorkbookPublicationsRelations = relations(studyWorkbookPublications, ({ many }) => ({
  likes: many(studyWorkbookLikes),
  reviews: many(studyWorkbookReviews),
  libraryEntries: many(studyUserLibrary),
}));

export const studyUserLibraryRelations = relations(studyUserLibrary, ({ one }) => ({
  publication: one(studyWorkbookPublications, {
    fields: [studyUserLibrary.sourcePublicationId],
    references: [studyWorkbookPublications.id],
  }),
}));

export const studyWorkbookReviewsRelations = relations(studyWorkbookReviews, ({ one }) => ({
  publication: one(studyWorkbookPublications, {
    fields: [studyWorkbookReviews.publicationId],
    references: [studyWorkbookPublications.id],
  }),
}));

export const studyWorkbookLikesRelations = relations(studyWorkbookLikes, ({ one }) => ({
  publication: one(studyWorkbookPublications, {
    fields: [studyWorkbookLikes.publicationId],
    references: [studyWorkbookPublications.id],
  }),
}));

export const studyWorkbookForks = pgTable(
  'study_workbook_forks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceWorkbookId: uuid('source_workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    sourcePublicationId: uuid('source_publication_id')
      .notNull()
      .references(() => studyWorkbookPublications.id, { onDelete: 'cascade' }),
    forkedWorkbookId: uuid('forked_workbook_id')
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: 'cascade' }),
    forkedBy: uuid('forked_by').notNull(),
    forkedAt: timestamp('forked_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    sourceIdx: index('idx_swf_source_workbook_id').on(table.sourceWorkbookId),
    forkedIdx: index('idx_swf_forked_workbook_id').on(table.forkedWorkbookId),
    sourcePublicationIdx: index('idx_swf_source_publication_id').on(table.sourcePublicationId),
  })
);

export const studyWorkbookForksRelations = relations(studyWorkbookForks, ({ one }) => ({
  sourceWorkbook: one(studyWorkbooks, {
    fields: [studyWorkbookForks.sourceWorkbookId],
    references: [studyWorkbooks.id],
  }),
  forkedWorkbook: one(studyWorkbooks, {
    fields: [studyWorkbookForks.forkedWorkbookId],
    references: [studyWorkbooks.id],
  }),
  sourcePublication: one(studyWorkbookPublications, {
    fields: [studyWorkbookForks.sourcePublicationId],
    references: [studyWorkbookPublications.id],
  }),
}));

export const studyQuestionVisibilityCheck = sql`study_questions.is_active = true AND study_questions.is_hidden = false`;
