import { useUsageLog } from "@/hooks/useUsageLog";
import { useRewards } from "@/hooks/useRewards";
import { useSchedule } from "@/hooks/useSchedule";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { Timer, ArrowLeft, Clock, Star, Flame, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return totalSeconds > 0 ? "<1m" : "0m";
}

const StatCard = ({
  label, value, icon, highlight = false,
}: {
  label: string; value: string; icon?: React.ReactNode; highlight?: boolean;
}) => (
  <div className={`rounded-2xl p-4 text-center ${
    highlight ? "bg-primary/10 border border-primary/20" : "bg-card border border-border"
  }`}>
    {icon && <div className="flex justify-center mb-1">{icon}</div>}
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-extrabold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

const Stats = () => {
  const { log: usageLogData, getTotal, getDailyData } = useUsageLog();
  const { settings: scheduleSettings } = useSchedule();
  const { rewards } = useRewards(null, usageLogData, scheduleSettings);
  const navigate = useNavigate();
  const chartData = getDailyData(7);
  const monthData = getDailyData(30);

  const weekTotal = getTotal("week");
  const avgDaily = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.seconds, 0) / chartData.length)
    : 0;

  const periods = [
    { key: "day" as const, label: "Today" },
    { key: "week" as const, label: "This Week" },
    { key: "month" as const, label: "This Month" },
    { key: "year" as const, label: "This Year" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Timer className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-foreground font-display">Usage Stats</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-6 pb-8 space-y-6 max-w-lg mx-auto w-full">
        {/* Rewards row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Streak"
            value={`${rewards.currentStreak}d`}
            icon={<Flame className="w-5 h-5 text-accent" />}
          />
          <StatCard
            label="Stars"
            value={String(rewards.totalStars)}
            icon={<Star className="w-5 h-5 text-timer-warning" />}
            highlight
          />
          <StatCard
            label="Best Streak"
            value={`${rewards.longestStreak}d`}
            icon={<Trophy className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Period cards */}
        <div className="grid grid-cols-2 gap-3">
          {periods.map((p) => (
            <StatCard
              key={p.key}
              label={p.label}
              value={formatDuration(getTotal(p.key))}
              highlight={p.key === "day"}
            />
          ))}
        </div>

        {/* Average & Trend */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Daily Avg (7d)"
            value={formatDuration(avgDaily)}
            icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
          />
          <StatCard
            label="Week Total"
            value={formatDuration(weekTotal)}
            icon={<Clock className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        {/* Weekly chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Last 7 Days</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  formatter={(value: number) => [`${value}h`, "Screen Time"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.875rem" }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-day trend line */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">30-Day Trend</h2>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  formatter={(value: number) => [`${value}h`, "Screen Time"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.875rem" }}
                />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-3">Daily Breakdown</h2>
          <div className="space-y-2">
            {[...chartData].reverse().map((d) => (
              <div key={d.fullDate} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{d.fullDate}</span>
                <span className="text-sm font-bold text-foreground">{formatDuration(d.seconds)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stats;
