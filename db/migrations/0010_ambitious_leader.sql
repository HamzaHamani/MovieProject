ALTER TABLE "logged_movies" RENAME COLUMN "movieId" TO "showId";--> statement-breakpoint
ALTER TABLE "logged_movies" ALTER COLUMN "watchedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "logged_movies" ALTER COLUMN "watchedAt" SET NOT NULL;