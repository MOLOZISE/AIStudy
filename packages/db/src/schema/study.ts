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
    lastWrongAt: timestamp('last_wrong_at', { withTimezone: true }).defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
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

export const studyQuestionVisibilityCheck = sql`study_questions.is_active = true AND study_questions.is_hidden = false`;
