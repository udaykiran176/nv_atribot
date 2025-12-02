import { serial, integer, pgTable, text, varchar, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

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

 
