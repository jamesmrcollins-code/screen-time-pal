import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimeSetter } from "@/components/TimeSetter";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useScreenTimer } from "@/hooks/useScreenTimer";
import { useUsageLog } from "@/hooks/useUsageLog";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useSmsNotifier } from "@/hooks/useSmsNotifier";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, Bell, Settings, Timer, BarChart3 } from "lucide-react";

const Index = () => {
  const {
    remainingSeconds,
    isRunning,
    isFinished,
    mode,
    progress,
    start,
    pause,
    reset,
    setTime,
    changeMode,
    requestNotificationPermission,
  } = useScreenTimer();

  const { addUsage } = useUsageLog();
  const { settings: notifSettings, update: updateNotifSettings } = useNotificationSettings();
  const { check: checkSms, resetSent } = useSmsNotifier(notifSettings);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(
    "Notification" in window && Notification.permission === "granted"
  );

  // Track usage: log consumed seconds each second while running
  const prevRemaining = useRef(remainingSeconds);
  useEffect(() => {
    if (isRunning && prevRemaining.current > remainingSeconds) {
      const consumed = prevRemaining.current - remainingSeconds;
      addUsage(consumed);
    }
    prevRemaining.current = remainingSeconds;
  }, [remainingSeconds, isRunning, addUsage]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">ScreenTime</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/stats")}
            className="text-muted-foreground"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-8">
        {/* Mode Toggle */}
        <div className="flex bg-secondary rounded-full p-1 gap-1">
          <button
            onClick={() => changeMode("daily")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === "daily"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => changeMode("weekly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === "weekly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Weekly
          </button>
        </div>

        {/* Timer */}
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          progress={progress}
          isRunning={isRunning}
          isFinished={isFinished}
        />

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Button variant="secondary" size="icon" onClick={reset} className="rounded-full h-12 w-12">
            <RotateCcw className="w-5 h-5" />
          </Button>

          {isFinished ? (
            <Button variant="danger" size="lg" onClick={reset} className="h-16 w-16 rounded-full p-0">
              <RotateCcw className="w-6 h-6" />
            </Button>
          ) : isRunning ? (
            <Button variant="danger" size="lg" onClick={pause} className="h-16 w-16 rounded-full p-0">
              <Pause className="w-6 h-6" />
            </Button>
          ) : (
            <Button variant="timer" size="lg" onClick={start} className="h-16 w-16 rounded-full p-0">
              <Play className="w-6 h-6 ml-1" />
            </Button>
          )}

          <Button
            variant={notifEnabled ? "secondary" : "outline"}
            size="icon"
            onClick={handleEnableNotifications}
            className="rounded-full h-12 w-12"
          >
            <Bell className={`w-5 h-5 ${notifEnabled ? "text-primary" : ""}`} />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-lg border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Set Screen Time</h2>
            <TimeSetter onSetTime={setTime} isRunning={isRunning} />
          </div>
        )}

        {isFinished && (
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 max-w-sm w-full text-center">
            <p className="text-accent font-semibold text-lg">⏰ Time's Up!</p>
            <p className="text-muted-foreground text-sm mt-1">
              Screen time limit has been reached. Reset to start a new session.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
