ALTER TABLE "bookmarks" ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT true NOT NULL;
