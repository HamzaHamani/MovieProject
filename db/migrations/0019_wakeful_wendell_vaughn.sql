ALTER TABLE "list_collaborators" DROP CONSTRAINT "list_collaborators_addedBy_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_addedBy_user_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
