ALTER TABLE "bookmarksMovies" ALTER COLUMN "addedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookmarksMovies" ALTER COLUMN "addedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookmarksMovies" ADD COLUMN "review" text NOT NULL;