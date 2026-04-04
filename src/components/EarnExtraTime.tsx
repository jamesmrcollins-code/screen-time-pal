import React, { useState } from "react";
import { useBonusTasks } from "@/hooks/useBonusTasks";
import { useProfiles, ChildProfile } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, CheckCheck, Clock, Gift } from "lucide-react";

const PRESET_MINUTES = [5, 10, 15, 20, 30];

export const EarnExtraTime: React.FC = () => {
  const { profiles } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null
  );
  const {
    tasks,
    completions,
    addTask,
    removeTask,
    markDone,
    approve,
    todayBonusMinutes,
  } = useBonusTasks(selectedProfileId);

  const [newTaskName, setNewTaskName] = useState("");
  const [newBonusMinutes, setNewBonusMinutes] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async () => {
    if (!newTaskName.trim()) return;
    await addTask(newTaskName.trim(), newBonusMinutes);
    setNewTaskName("");
    setNewBonusMinutes(10);
    setShowAddForm(false);
  };

  const getCompletionForTask = (taskId: string) =>
    completions.find((c) => c.taskId === taskId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Earn Extra Time</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Create tasks that earn bonus screen time. Kids mark them done, then a parent approves.
      </p>

      {/* Profile selector */}
      {profiles.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProfileId(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                selectedProfileId === p.id
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/25"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
              }`}
            >
              {p.avatar} {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Today's bonus summary */}
      {todayBonusMinutes > 0 && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            +{todayBonusMinutes} min earned today
          </span>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const completion = getCompletionForTask(task.id);
          const isDone = !!completion;
          const isApproved = completion?.approved ?? false;

          return (
            <div
              key={task.id}
              className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2.5 border border-border"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {task.taskName}
                </span>
                <span className="text-xs text-primary font-bold shrink-0">
                  +{task.bonusMinutes}m
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-600 dark:text-green-400">
                    <CheckCheck className="w-3 h-3" />
                    Approved
                  </span>
                ) : isDone ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approve(completion!.id)}
                    className="h-7 text-xs gap-1 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Check className="w-3 h-3" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markDone(task.id)}
                    className="h-7 text-xs gap-1 rounded-full"
                  >
                    <Check className="w-3 h-3" />
                    Done
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(task.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            No tasks yet. Add one to get started!
          </p>
        )}
      </div>

      {/* Add task form */}
      {showAddForm ? (
        <div className="bg-card border border-border rounded-xl p-3 space-y-3">
          <Input
            placeholder="Task name (e.g. Read for 20 min)"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="text-sm"
            autoFocus
          />
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Bonus minutes</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNewBonusMinutes(m)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    newBonusMinutes === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
                  }`}
                >
                  +{m}m
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newTaskName.trim()} className="rounded-full">
              Add Task
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-full">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="rounded-full gap-1.5 w-full"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      )}
    </div>
  );
};
