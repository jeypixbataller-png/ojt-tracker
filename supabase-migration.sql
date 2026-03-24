-- ================================================================
-- OJT TRACKER — MIGRATION for New Features
-- Run this AFTER the original supabase-setup.sql
-- Paste into: Supabase → SQL Editor → New Query → Run
-- ================================================================

-- ── Add 'company' column to profiles if not exists ──
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company text DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ── Add 'updated_at' column to notes for edit tracking ──
DO $$ BEGIN
  ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ── Goals table (for future goals feature) ──
CREATE TABLE IF NOT EXISTS public.goals (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  target      numeric(6,2) DEFAULT 0,
  current     numeric(6,2) DEFAULT 0,
  unit        text DEFAULT 'hours',
  deadline    date,
  completed   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Enable RLS on goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Goals RLS policies
DROP POLICY IF EXISTS "Users manage own goals" ON public.goals;
CREATE POLICY "Users manage own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for goals
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable realtime for announcements
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Task Comments table ──
CREATE TABLE IF NOT EXISTS public.task_comments (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id    uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own task comments" ON public.task_comments;
CREATE POLICY "Users manage own task comments"
  ON public.task_comments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Documents storage bucket (create via Supabase Dashboard → Storage) ──
-- Note: Run this in the SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
-- ON CONFLICT (id) DO NOTHING;

-- ── Supervisor Feedback table ──
CREATE TABLE IF NOT EXISTS public.supervisor_feedback (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.supervisor_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage supervisor feedback" ON public.supervisor_feedback;
CREATE POLICY "Admins manage supervisor feedback"
  ON public.supervisor_feedback FOR ALL
  USING (public.get_my_role() IN ('admin', 'supervisor'))
  WITH CHECK (public.get_my_role() IN ('admin', 'supervisor'));

-- Update role check constraint to include supervisor
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'supervisor'));

-- ── Indexes for performance ──
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON public.logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_feedback_user ON public.supervisor_feedback(user_id);

-- ================================================================
-- Done! Your database is now ready for all new features.
-- ================================================================
