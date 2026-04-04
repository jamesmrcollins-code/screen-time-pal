
-- Bonus tasks: parent-created tasks that reward extra screen time
CREATE TABLE public.bonus_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id TEXT,
  task_name TEXT NOT NULL,
  bonus_minutes INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.bonus_tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own tasks" ON public.bonus_tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON public.bonus_tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON public.bonus_tasks FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Family members can view shared tasks" ON public.bonus_tasks FOR SELECT USING (user_id IN (SELECT owner_id FROM family_members WHERE member_id = auth.uid()));

-- Bonus completions: tracks task completion and parent approval
CREATE TABLE public.bonus_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.bonus_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  profile_id TEXT,
  completed_date TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON public.bonus_completions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own completions" ON public.bonus_completions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own completions" ON public.bonus_completions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Family members can view shared completions" ON public.bonus_completions FOR SELECT USING (user_id IN (SELECT owner_id FROM family_members WHERE member_id = auth.uid()));
