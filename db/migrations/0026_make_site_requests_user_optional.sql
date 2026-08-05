ALTER TABLE "site_requests"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "site_requests"
  DROP CONSTRAINT IF EXISTS "site_requests_userId_user_id_fk";

ALTER TABLE "site_requests"
  ADD CONSTRAINT "site_requests_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL;
