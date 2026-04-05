CREATE TABLE IF NOT EXISTS "list_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"bookmarkId" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_bookmarkId_bookmarks_id_fk" FOREIGN KEY ("bookmarkId") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "list_likes_user_bookmark_unique" ON "list_likes" USING btree ("userId","bookmarkId");