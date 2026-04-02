import React, { useState } from "react";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Check, X, Mail, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";

export const FamilySharing: React.FC = () => {
  const { user } = useAuth();
  const {
    sentInvites,
    receivedInvites,
    familyMembers,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeMember,
  } = useFamily();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSending(true);
    await sendInvite(trimmed);
    setEmail("");
    setSending(false);
  };

  if (!user) return null;

  const pendingSent = sentInvites.filter((i) => i.status === "pending");
  const acceptedSent = sentInvites.filter((i) => i.status === "accepted");

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Family Sharing</h3>
        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <Crown className="w-3 h-3" /> Premium
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Invite your partner to share access to your children's screen time profiles and timers.
      </p>

      {/* Invite form */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Partner's email"
            className="pl-10 h-12 rounded-xl bg-secondary border-border"
            type="email"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={sending || !email.trim()}
          className="h-12 rounded-xl gap-2"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Invite
        </Button>
      </div>

      {/* Received invites */}
      {receivedInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Pending Invitations</p>
          {receivedInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3"
            >
              <div className="text-sm">
                <p className="font-medium text-foreground">Family invite received</p>
                <p className="text-muted-foreground text-xs">From account owner</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-lg gap-1"
                  onClick={() => acceptInvite(invite)}
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg gap-1"
                  onClick={() => declineInvite(invite.id)}
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending sent invites */}
      {pendingSent.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Sent Invites</p>
          {pendingSent.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3"
            >
              <div className="text-sm">
                <p className="font-medium text-foreground">{invite.invitee_email}</p>
                <p className="text-muted-foreground text-xs">Pending</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Waiting...
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Connected family members */}
      {familyMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Connected Family</p>
          {familyMembers.map((member) => {
            const isOwner = member.owner_id === user.id;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3"
              >
                <div className="text-sm">
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {isOwner ? "Co-parent (member)" : "Account owner"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Connected {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg text-destructive hover:text-destructive"
                  onClick={() => removeMember(member.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
