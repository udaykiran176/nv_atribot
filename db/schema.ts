import { serial, integer, pgTable, text, varchar, boolean, timestamp, uuid, index, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { relations } from 'drizzle-orm'

// ============================================
// COURSES TABLE
// ============================================
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 512 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  coursesCreatedAtIdx: index('courses_created_at_idx').on(table.createdAt),
  coursesOrderIdx: index('courses_order_idx').on(table.order),
}))

// ============================================
// LESSONS TABLE
// ============================================
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 512 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  lessonsCourseIdIdx: index('lessons_course_id_idx').on(table.courseId),
  lessonsOrderIdx: index('lessons_order_idx').on(table.courseId, table.order),
}))

// ============================================
// VIDEOS TABLE (Challenge Type 1)
// ============================================
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  videosLessonIdIdx: index('videos_lesson_id_idx').on(table.lessonId),
  videosOrderIdx: index('videos_order_idx').on(table.lessonId, table.order),
}))

// ============================================
// SWIPE CARDS TABLE (Challenge Type 2)
// ============================================
export const swipeCards = pgTable('swipe_cards', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  image: varchar('image', { length: 512 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  swipeCardsLessonIdIdx: index('swipe_cards_lesson_id_idx').on(table.lessonId),
  swipeCardsOrderIdx: index('swipe_cards_order_idx').on(table.lessonId, table.order),
}))

// ============================================
// GAMES TABLE (Challenge Type 3)
// ============================================
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  type: varchar('type', { length: 128 }).notNull(), // e.g., 'puzzle', 'quiz', 'drag-drop'
  data: jsonb('data').notNull(), // Game-specific configuration and content
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  gamesLessonIdIdx: index('games_lesson_id_idx').on(table.lessonId),
  gamesTypeIdx: index('games_type_idx').on(table.type),
}))

// ============================================
// STEP BY STEP SLIDES TABLE (Challenge Type 4)
// ============================================
export const steps = pgTable('steps', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 512 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  stepsLessonIdIdx: index('steps_lesson_id_idx').on(table.lessonId),
  stepsOrderIdx: index('steps_order_idx').on(table.lessonId, table.order),
}))

// ============================================
// MCQ QUESTIONS TABLE (Challenge Type 5)
// ============================================
export const mcqQuestions = pgTable('mcq_questions', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // Array of strings: ["Option A", "Option B", "Option C", "Option D"]
  answer: varchar('answer', { length: 512 }).notNull(), // Correct answer text
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  mcqQuestionsLessonIdIdx: index('mcq_questions_lesson_id_idx').on(table.lessonId),
  mcqQuestionsOrderIdx: index('mcq_questions_order_idx').on(table.lessonId, table.order),
}))

// ============================================
// LICENSE KEYS TABLE (Existing)
// ============================================
export const licenseKeys = pgTable('license_keys', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  used: boolean('used').default(false).notNull(),
  assignedUserId: varchar('assigned_user_id', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
}, (table) => ({
  licenseKeysCourseIdx: index('license_keys_course_idx').on(table.courseId),
  licenseKeysAssignedIdx: index('license_keys_assigned_idx').on(table.assignedUserId),
}))

// ============================================
// RELATIONS (Optional - for Drizzle Relational Queries)
// ============================================
export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  licenseKeys: many(licenseKeys),
}))

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  videos: many(videos),
  swipeCards: many(swipeCards),
  games: many(games),
  steps: many(steps),
  mcqQuestions: many(mcqQuestions),
}))

export const videosRelations = relations(videos, ({ one }) => ({
  lesson: one(lessons, {
    fields: [videos.lessonId],
    references: [lessons.id],
  }),
}))

export const swipeCardsRelations = relations(swipeCards, ({ one }) => ({
  lesson: one(lessons, {
    fields: [swipeCards.lessonId],
    references: [lessons.id],
  }),
}))

export const gamesRelations = relations(games, ({ one }) => ({
  lesson: one(lessons, {
    fields: [games.lessonId],
    references: [lessons.id],
  }),
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  lesson: one(lessons, {
    fields: [steps.lessonId],
    references: [lessons.id],
  }),
}))

export const mcqQuestionsRelations = relations(mcqQuestions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [mcqQuestions.lessonId],
    references: [lessons.id],
  }),
}))

export const licenseKeysRelations = relations(licenseKeys, ({ one }) => ({
  course: one(courses, {
    fields: [licenseKeys.courseId],
    references: [courses.id],
  }),
}))

// ============================================
// TYPE EXPORTS (for TypeScript)
// ============================================
export type Course = typeof courses.$inferSelect
export type NewCourse = typeof courses.$inferInsert

export type Lesson = typeof lessons.$inferSelect
export type NewLesson = typeof lessons.$inferInsert

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert

export type SwipeCard = typeof swipeCards.$inferSelect
export type NewSwipeCard = typeof swipeCards.$inferInsert

export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert

export type Step = typeof steps.$inferSelect
export type NewStep = typeof steps.$inferInsert

export type McqQuestion = typeof mcqQuestions.$inferSelect
export type NewMcqQuestion = typeof mcqQuestions.$inferInsert

export type LicenseKey = typeof licenseKeys.$inferSelect
export type NewLicenseKey = typeof licenseKeys.$inferInsert
