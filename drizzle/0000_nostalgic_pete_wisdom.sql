CREATE TABLE `manager_login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fingerprint` text NOT NULL,
	`succeeded` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_manager_login_attempts_fingerprint_created_at` ON `manager_login_attempts` (`fingerprint`,`created_at`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_key` text NOT NULL,
	`candidate_name` text NOT NULL,
	`phone` text NOT NULL,
	`role` text NOT NULL,
	`biodata_json` text NOT NULL,
	`fit_percentage` integer NOT NULL,
	`outcome` text NOT NULL,
	`total_score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`work_style_score` integer NOT NULL,
	`work_style_max` integer NOT NULL,
	`communication_score` integer NOT NULL,
	`communication_max` integer NOT NULL,
	`problem_solving_score` integer NOT NULL,
	`problem_solving_max` integer NOT NULL,
	`technical_score` integer NOT NULL,
	`technical_max` integer NOT NULL,
	`critical_misses` integer DEFAULT 0 NOT NULL,
	`answers_json` text NOT NULL,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`test_version` text NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_submission_key_unique` ON `submissions` (`submission_key`);--> statement-breakpoint
CREATE INDEX `idx_submissions_submitted_at` ON `submissions` (`submitted_at`);--> statement-breakpoint
CREATE INDEX `idx_submissions_role_submitted_at` ON `submissions` (`role`,`submitted_at`);--> statement-breakpoint
PRAGMA optimize;
