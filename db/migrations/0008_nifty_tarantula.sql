CREATE TABLE IF NOT EXISTS "logged_movies" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"movieId" text NOT NULL,
	"review" text,
	"rating" integer,
	"watchedAt" timestamp DEFAULT now(),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logged_movies" ADD CONSTRAINT "logged_movies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
