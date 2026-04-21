import { useState } from "react";
import { useUsageLog } from "@/hooks/useUsageLog";
import { useRewards } from "@/hooks/useRewards";
import { useSchedule } from "@/hooks/useSchedule";
import { useProfiles } from "@/hooks/useProfiles";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { Timer, ArrowLeft, Clock, Star, Flame, Trophy, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { PremiumGate } from "@/components/PremiumGate";

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
  const { profiles, activeId } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(activeId);
  const { log: usageLogData, getTotal, getDailyData } = useUsageLog(selectedProfileId);
  const { settings: scheduleSettings } = useSchedule();
  const { rewards } = useRewards(selectedProfileId, usageLogData, scheduleSettings);
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

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handleExportCSV = () => {
    const rows = [["Date", "Seconds", "Hours"]];
    monthData.forEach((d) => {
      rows.push([d.fullDate, String(d.seconds), String(d.hours)]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screen-time-${selectedProfile?.name ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        {/* Profile selector */}
        {profiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                  selectedProfileId === p.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Currently viewing label */}
        {selectedProfile && (
          <p className="text-sm text-muted-foreground text-center">
            Viewing stats for <span className="font-semibold text-foreground">{selectedProfile.avatar} {selectedProfile.name}</span>
          </p>
        )}

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
        <PremiumGate
          title="30-Day Trend"
          description="See long-term screen time trends over the last 30 days."
          icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
        >
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
        </PremiumGate>

        {/* Weekly digest */}
        <PremiumGate
          title="Weekly Digest"
          description="Get a weekly summary of your family's screen time progress and insights."
        >
          <WeeklyDigest />
        </PremiumGate>

        {/* CSV export */}
        <PremiumGate
          title="Export Data (CSV)"
          description="Download a CSV of the last 30 days of screen time data."
          icon={<Download className="w-4 h-4 text-muted-foreground" />}
        >
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Export Data</h2>
              <p className="text-xs text-muted-foreground">Download last 30 days as CSV.</p>
            </div>
            <Button onClick={handleExportCSV} size="sm" className="rounded-full gap-1.5">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </PremiumGate>

        {/* Daily breakdown */}
        <PremiumGate
          title="Daily Breakdown"
          description="View a detailed daily log of screen time usage."
        >
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
        </PremiumGate>
      </main>
    </div>
  );
};

export default Stats;
