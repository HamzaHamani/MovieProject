CREATE TABLE IF NOT EXISTS "site_requests" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  CONSTRAINT "site_requests_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);
