CREATE TABLE IF NOT EXISTS "review_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reviewId" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reviewId" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_follows" (
	"followerId" text NOT NULL,
	"followingId" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "user_follows_followerId_followingId_pk" PRIMARY KEY("followerId","followingId")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_reviewId_logged_movies_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."logged_movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_reviewId_logged_movies_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."logged_movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_user_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_user_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "review_likes_user_review_unique" ON "review_likes" USING btree ("userId","reviewId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique" ON "user" USING btree ("username");