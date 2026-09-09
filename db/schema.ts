import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    submissionKey: text("submission_key").notNull().unique(),
    candidateName: text("candidate_name").notNull(),
    phone: text("phone").notNull(),
    role: text("role").notNull(),
    biodataJson: text("biodata_json").notNull(),
    fitPercentage: integer("fit_percentage").notNull(),
    outcome: text("outcome").notNull(),
    totalScore: integer("total_score").notNull(),
    maxScore: integer("max_score").notNull(),
    workStyleScore: integer("work_style_score").notNull(),
    workStyleMax: integer("work_style_max").notNull(),
    communicationScore: integer("communication_score").notNull(),
    communicationMax: integer("communication_max").notNull(),
    problemSolvingScore: integer("problem_solving_score").notNull(),
    problemSolvingMax: integer("problem_solving_max").notNull(),
    technicalScore: integer("technical_score").notNull(),
    technicalMax: integer("technical_max").notNull(),
    criticalMisses: integer("critical_misses").notNull().default(0),
    answersJson: text("answers_json").notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    testVersion: text("test_version").notNull(),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_submissions_submitted_at").on(table.submittedAt),
    index("idx_submissions_role_submitted_at").on(table.role, table.submittedAt),
  ],
);

export const managerLoginAttempts = sqliteTable(
  "manager_login_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fingerprint: text("fingerprint").notNull(),
    succeeded: integer("succeeded", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_manager_login_attempts_fingerprint_created_at").on(
      table.fingerprint,
      table.createdAt,
    ),
  ],
);
