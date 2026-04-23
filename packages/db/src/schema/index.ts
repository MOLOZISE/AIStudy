import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ============================================
// Profiles (extends Supabase Auth)
// ============================================
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('member'),
    department: varchar('department', { length: 255 }),
    jobTitle: varchar('job_title', { length: 255 }),
    avatarUrl: text('avatar_url'),
    isVerified: boolean('is_verified').default(false),
    trustScore: integer('trust_score').default(36),
    anonymousSeed: uuid('anonymous_seed').defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('idx_profiles_email').on(table.email),
      createdAtIdx: index('idx_profiles_created_at').on(table.createdAt),
    };
  }
);

export * from './study.js';
