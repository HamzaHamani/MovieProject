CREATE TABLE IF NOT EXISTS "list_collaborators" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmarkId" text NOT NULL,
	"userId" text NOT NULL,
	"status" text DEFAULT 'accepted' NOT NULL,
	"addedBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"sourceUserId" text,
	"referenceId" text,
	"message" text,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_bookmarkId_bookmarks_id_fk" FOREIGN KEY ("bookmarkId") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_addedBy_user_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sourceUserId_user_id_fk" FOREIGN KEY ("sourceUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "list_collaborators_bookmark_user_unique" ON "list_collaborators" USING btree ("bookmarkId","userId");