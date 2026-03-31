import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Users } from "lucide-react";
import type { ChildProfile } from "@/hooks/useProfiles";

interface Props {
  profiles: ChildProfile[];
  activeId: string | null;
  onSwitch: (id: string | null) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export const ProfileSelector: React.FC<Props> = ({
  profiles, activeId, onSwitch, onAdd, onRemove,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Profiles</h3>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onSwitch(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
            !activeId ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"
          }`}
        >
          👤 Default
        </button>
        {profiles.map((p) => (
          <div key={p.id} className="relative group">
            <button
              onClick={() => onSwitch(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeId === p.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"
              }`}
            >
              {p.avatar} {p.name}
            </button>
            <button
              onClick={() => onRemove(p.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Child's name"
            className="bg-secondary border-border flex-1"
            autoFocus
          />
          <Button size="sm" onClick={handleAdd} className="rounded-lg">Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="rounded-lg">✕</Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)} className="rounded-full">
          <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Child
        </Button>
      )}
    </div>
  );
};
