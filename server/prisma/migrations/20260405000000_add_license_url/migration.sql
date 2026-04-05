-- AddColumn licenseUrl to User table (safe: only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'licenseUrl'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "licenseUrl" TEXT;
  END IF;
END $$;
