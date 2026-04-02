import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FamilyInvite {
  id: string;
  owner_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
}

interface FamilyMember {
  id: string;
  owner_id: string;
  member_id: string;
  created_at: string;
}

export function useFamily() {
  const { user } = useAuth();
  const [sentInvites, setSentInvites] = useState<FamilyInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<FamilyInvite[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sentRes, receivedRes, membersRes] = await Promise.all([
        supabase.from("family_invites").select("*").eq("owner_id", user.id),
        supabase.from("family_invites").select("*").eq("invitee_email", user.email ?? ""),
        supabase.from("family_members").select("*"),
      ]);

      if (sentRes.data) setSentInvites(sentRes.data);
      if (receivedRes.data) {
        setReceivedInvites(
          receivedRes.data.filter((i) => i.owner_id !== user.id && i.status === "pending")
        );
      }
      if (membersRes.data) setFamilyMembers(membersRes.data);
    } catch (err) {
      console.error("Failed to fetch family data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const sendInvite = useCallback(
    async (email: string) => {
      if (!user) return;
      if (email.toLowerCase() === user.email?.toLowerCase()) {
        toast.error("You can't invite yourself!");
        return;
      }
      const { error } = await supabase.from("family_invites").insert({
        owner_id: user.id,
        invitee_email: email.toLowerCase(),
      });
      if (error) {
        toast.error("Failed to send invite");
        return;
      }
      toast.success("Invite sent!");
      fetchAll();
    },
    [user, fetchAll]
  );

  const acceptInvite = useCallback(
    async (invite: FamilyInvite) => {
      if (!user) return;
      const { error } = await supabase.rpc("accept_family_invite", {
        invite_id: invite.id,
      });
      if (error) {
        toast.error("Failed to accept invite");
        console.error(error);
        return;
      }
      toast.success("You're now connected as a family!");
      fetchAll();
    },
    [user, fetchAll]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      const { error } = await supabase
        .from("family_invites")
        .update({ status: "declined" })
        .eq("id", inviteId);
      if (error) {
        toast.error("Failed to decline invite");
        return;
      }
      toast.info("Invite declined");
      fetchAll();
    },
    [fetchAll]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId);
      if (error) {
        toast.error("Failed to remove family member");
        return;
      }
      toast.success("Family member removed");
      fetchAll();
    },
    [fetchAll]
  );

  return {
    sentInvites,
    receivedInvites,
    familyMembers,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeMember,
    refresh: fetchAll,
  };
}
