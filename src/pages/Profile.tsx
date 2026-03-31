import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, ArrowLeft, Phone, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [phone, setPhone] = useState(profile?.phone_number ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name, phone_number: phone, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Timer className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-foreground font-display">Profile</h1>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 max-w-sm mx-auto w-full space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="pl-10 h-12 rounded-xl bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-number" className="text-sm">Phone Number (for SMS alerts)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone-number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+15551234567"
                  className="pl-10 h-12 rounded-xl bg-secondary border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">E.164 format. Used for SMS screen time alerts.</p>
            </div>

            <Button type="submit" variant="timer" className="w-full h-12 rounded-xl" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl gap-2" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default Profile;
