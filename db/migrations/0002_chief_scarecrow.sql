CREATE TABLE IF NOT EXISTS "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"bookmarkName" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmarksMovies" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmarkId" text NOT NULL,
	"movieId" text NOT NULL,
	"addedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarksMovies" ADD CONSTRAINT "bookmarksMovies_bookmarkId_bookmarks_id_fk" FOREIGN KEY ("bookmarkId") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "bookmark";