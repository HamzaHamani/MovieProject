DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'backdrop_path'
  ) THEN
    ALTER TABLE "user" ADD COLUMN "backdrop_path" text;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'backdropPath'
  ) THEN
    UPDATE "user"
    SET "backdrop_path" = COALESCE("backdrop_path", "backdropPath")
    WHERE "backdropPath" IS NOT NULL;
  END IF;
END $$;