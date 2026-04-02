
CREATE OR REPLACE FUNCTION public.accept_family_invite(invite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite family_invites%ROWTYPE;
  v_user_email TEXT;
BEGIN
  -- Get the current user's email
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Get the invite and verify it belongs to this user
  SELECT * INTO v_invite FROM family_invites WHERE id = invite_id;
  
  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;
  
  IF v_invite.invitee_email != v_user_email THEN
    RAISE EXCEPTION 'This invite is not for you';
  END IF;
  
  IF v_invite.status != 'pending' THEN
    RAISE EXCEPTION 'Invite is no longer pending';
  END IF;
  
  -- Update invite status
  UPDATE family_invites SET status = 'accepted' WHERE id = invite_id;
  
  -- Create family membership
  INSERT INTO family_members (owner_id, member_id)
  VALUES (v_invite.owner_id, auth.uid())
  ON CONFLICT (owner_id, member_id) DO NOTHING;
END;
$$;
