
-- Family invites table
CREATE TABLE public.family_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view sent invites" ON public.family_invites FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Invitees can view received invites" ON public.family_invites FOR SELECT TO authenticated USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Owners can create invites" ON public.family_invites FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Invitees can update invite status" ON public.family_invites FOR UPDATE TO authenticated USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Owners can delete invites" ON public.family_invites FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TRIGGER update_family_invites_updated_at BEFORE UPDATE ON public.family_invites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  member_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (owner_id, member_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family memberships" ON public.family_members FOR SELECT TO authenticated USING (owner_id = auth.uid() OR member_id = auth.uid());
CREATE POLICY "Owners can create family members" ON public.family_members FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can delete family members" ON public.family_members FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Members can leave family" ON public.family_members FOR DELETE TO authenticated USING (member_id = auth.uid());

-- Shared data access policies
CREATE POLICY "Family members can view shared usage" ON public.usage_logs FOR SELECT TO authenticated USING (user_id IN (SELECT owner_id FROM public.family_members WHERE member_id = auth.uid()));
CREATE POLICY "Family members can insert shared usage" ON public.usage_logs FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT owner_id FROM public.family_members WHERE member_id = auth.uid()));
CREATE POLICY "Family members can update shared usage" ON public.usage_logs FOR UPDATE TO authenticated USING (user_id IN (SELECT owner_id FROM public.family_members WHERE member_id = auth.uid()));
CREATE POLICY "Family members can view shared schedule" ON public.schedule_settings FOR SELECT TO authenticated USING (user_id IN (SELECT owner_id FROM public.family_members WHERE member_id = auth.uid()));
CREATE POLICY "Family members can view shared rewards" ON public.rewards FOR SELECT TO authenticated USING (user_id IN (SELECT owner_id FROM public.family_members WHERE member_id = auth.uid()));
