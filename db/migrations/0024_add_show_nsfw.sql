-- Add show_nsfw boolean column to users table with default false
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS show_nsfw boolean DEFAULT false;

-- Ensure index/constraint if needed (none required for boolean)
 