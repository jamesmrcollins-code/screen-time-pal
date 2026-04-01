
-- Add profile_id column to usage_logs
ALTER TABLE public.usage_logs ADD COLUMN profile_id text DEFAULT NULL;

-- Drop old unique constraint
ALTER TABLE public.usage_logs DROP CONSTRAINT usage_logs_user_id_date_key;

-- Add new unique constraint including profile_id
CREATE UNIQUE INDEX usage_logs_user_id_date_profile_key ON public.usage_logs (user_id, date, COALESCE(profile_id, ''));
