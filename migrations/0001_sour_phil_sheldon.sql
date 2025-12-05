CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"component" varchar(256) NOT NULL,
	"thumbnail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"image" varchar(512),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcq_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"answer" varchar(512) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"image" varchar(512),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swipe_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"image" varchar(512),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"url" varchar(512) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "image" varchar(512);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcq_questions" ADD CONSTRAINT "mcq_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipe_cards" ADD CONSTRAINT "swipe_cards_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "games_lesson_id_idx" ON "games" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lessons_course_id_idx" ON "lessons" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lessons_order_idx" ON "lessons" USING btree ("course_id","order");--> statement-breakpoint
CREATE INDEX "mcq_questions_lesson_id_idx" ON "mcq_questions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "mcq_questions_order_idx" ON "mcq_questions" USING btree ("lesson_id","order");--> statement-breakpoint
CREATE INDEX "steps_lesson_id_idx" ON "steps" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "steps_order_idx" ON "steps" USING btree ("lesson_id","order");--> statement-breakpoint
CREATE INDEX "swipe_cards_lesson_id_idx" ON "swipe_cards" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "swipe_cards_order_idx" ON "swipe_cards" USING btree ("lesson_id","order");--> statement-breakpoint
CREATE INDEX "videos_lesson_id_idx" ON "videos" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "videos_order_idx" ON "videos" USING btree ("lesson_id","order");--> statement-breakpoint
CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "courses_order_idx" ON "courses" USING btree ("order");