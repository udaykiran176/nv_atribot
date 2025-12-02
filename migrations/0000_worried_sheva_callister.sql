CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"course_id" integer NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"assigned_user_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"activated_at" timestamp with time zone,
	"deactivated_at" timestamp with time zone,
	CONSTRAINT "license_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "license_keys" ADD CONSTRAINT "license_keys_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_keys_course_idx" ON "license_keys" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "license_keys_assigned_idx" ON "license_keys" USING btree ("assigned_user_id");