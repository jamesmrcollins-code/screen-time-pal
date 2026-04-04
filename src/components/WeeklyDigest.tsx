import React from "react";
import { useProfiles, ChildProfile } from "@/hooks/useProfiles";
import { useUsageLog } from "@/hooks/useUsageLog";
import { useSchedule, isWeekendDate } from "@/hooks/useSchedule";
import { startOfWeek, eachDayOfInterval, endOfWeek, format } from "date-fns";
import { CalendarCheck, TrendingDown, TrendingUp, Minus } from "lucide-react";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

interface ProfileDigest {
  profile: ChildProfile;
  weekTotal: number;
  weekLimit: number;
  daysUnder: number;
  totalDays: number;
  grade: "great" | "ok" | "over";
}

function useProfileDigest(profile: ChildProfile): ProfileDigest {
  const { getTotal, getDailyData } = useUsageLog(profile.id);
  const { settings } = useSchedule(profile.id);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: now > weekEnd ? weekEnd : now });
  const dailyData = getDailyData(7);

  const weekTotal = getTotal("week");

  let weekLimit = 0;
  let daysUnder = 0;

  days.forEach((day) => {
    const key = format(day, "yyyy-MM-dd");
    const dayData = dailyData.find((d) => d.fullDate === key);
    const used = dayData?.seconds ?? 0;
    const limit = isWeekendDate(day)
      ? settings.weekendLimitSeconds
      : settings.weekdayLimitSeconds;
    weekLimit += limit;
    if (used <= limit) daysUnder++;
  });

  const ratio = weekLimit > 0 ? weekTotal / weekLimit : 0;
  const grade: "great" | "ok" | "over" =
    ratio <= 0.8 ? "great" : ratio <= 1.0 ? "ok" : "over";

  return { profile, weekTotal, weekLimit, daysUnder, totalDays: days.length, grade };
}

const GradeBadge = ({ grade }: { grade: "great" | "ok" | "over" }) => {
  const config = {
    great: { label: "Great", icon: TrendingDown, className: "bg-green-500/15 text-green-600 dark:text-green-400" },
    ok: { label: "OK", icon: Minus, className: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
    over: { label: "Over", icon: TrendingUp, className: "bg-red-500/15 text-red-600 dark:text-red-400" },
  };
  const { label, icon: Icon, className } = config[grade];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const ProfileRow = ({ digest }: { digest: ProfileDigest }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div className="flex items-center gap-2">
      <span className="text-lg">{digest.profile.avatar}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{digest.profile.name}</p>
        <p className="text-xs text-muted-foreground">
          {digest.daysUnder}/{digest.totalDays} days under limit
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{formatDuration(digest.weekTotal)}</p>
        <p className="text-[10px] text-muted-foreground">
          of {formatDuration(digest.weekLimit)}
        </p>
      </div>
      <GradeBadge grade={digest.grade} />
    </div>
  </div>
);

// Wrapper to use hooks per profile
const ProfileDigestRow = ({ profile }: { profile: ChildProfile }) => {
  const digest = useProfileDigest(profile);
  return <ProfileRow digest={digest} />;
};

export const WeeklyDigest: React.FC = () => {
  const { profiles } = useProfiles();

  if (profiles.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Weekly Digest</h2>
      </div>
      <div>
        {profiles.map((p) => (
          <ProfileDigestRow key={p.id} profile={p} />
        ))}
      </div>
    </div>
  );
};
