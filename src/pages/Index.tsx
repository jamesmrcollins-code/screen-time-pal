import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimeSetter } from "@/components/TimeSetter";
import { SwipeableTimerDisplay } from "@/components/SwipeableTimerDisplay";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ProfileSelector } from "@/components/ProfileSelector";
import { PinLock } from "@/components/PinLock";
import { RewardsBadge } from "@/components/RewardsBadge";
import { ScheduleSettings as ScheduleSettingsUI } from "@/components/ScheduleSettings";
import { LockScreenSettings } from "@/components/LockScreenSettings";
import { TimesUpLockScreen } from "@/components/TimesUpLockScreen";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemePicker } from "@/components/ThemePicker";
import { OnboardingDialog, shouldShowOnboarding } from "@/components/OnboardingDialog";
import { ActiveUsersSelector } from "@/components/ActiveUsersSelector";
import { useScreenTimer } from "@/hooks/useScreenTimer";
import { useUsageLog } from "@/hooks/useUsageLog";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useSmsNotifier } from "@/hooks/useSmsNotifier";
import { usePinLock } from "@/hooks/usePinLock";
import { useProfiles } from "@/hooks/useProfiles";
import { useRewards } from "@/hooks/useRewards";
import { useSchedule } from "@/hooks/useSchedule";
import { useLockScreenSettings } from "@/hooks/useLockScreenSettings";
import { useAlarm } from "@/hooks/useAlarm";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, Bell, Settings, Timer, BarChart3, UserCircle, Palette, Share2 } from "lucide-react";
import { ReferFriend } from "@/components/ReferFriend";
import { useAuth } from "@/hooks/useAuth";

function formatHM(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const Index = () => {
  const { profiles, activeId, activeIds, addProfile, removeProfile, switchProfile, toggleActiveProfile } = useProfiles();

  const {
    profileTimerInfos, remainingSeconds, isRunning, isFinished, activeLimit, progress,
    start, pause, reset, setDailyTime, setWeeklyTime, requestNotificationPermission,
  } = useScreenTimer(activeIds);

  const { log: usageLogData, addUsage, setLogBulk } = useUsageLog(activeId);
  const { settings: notifSettings, update: updateNotifSettings } = useNotificationSettings();
  const { check: checkSms, resetSent } = useSmsNotifier(notifSettings);
  const { hasPin, isUnlocked, setPin, removePin, verifyPin, lock } = usePinLock();
  const { settings: scheduleSettings, update: updateSchedule, updateDay, getTodayLimit, setScheduleFromCloud } = useSchedule(activeId);
  const { rewards, rewardsRaw, setRewardsFromCloud } = useRewards(activeId, usageLogData, scheduleSettings);
  const { settings: lockSettings, update: updateLockSettings } = useLockScreenSettings();
  const { startAlarm, stopAlarm } = useAlarm();
  const { activeThemeId, unlockedIds, isUnlocked: isThemeUnlocked, unlockTheme, setActiveTheme, themes, setThemeFromCloud } = useAppTheme(rewards.totalStars);
  const navigate = useNavigate();

  // Cloud sync
  useCloudSync(
    usageLogData, setLogBulk,
    rewardsRaw, setRewardsFromCloud,
    { unlockedIds, activeThemeId }, setThemeFromCloud,
    scheduleSettings, setScheduleFromCloud
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showReferFriend, setShowReferFriend] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());
  const [notifEnabled, setNotifEnabled] = useState(
    "Notification" in window && Notification.permission === "granted"
  );

  const pinRequired = hasPin() && !isUnlocked;

  // Auto-apply schedule limit
  useEffect(() => {
    const limit = getTodayLimit();
    if (limit !== null && !isRunning) {
      setDailyTime(limit);
    }
  }, [scheduleSettings.useSchedule, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track usage
  const prevRemaining = useRef(remainingSeconds);
  useEffect(() => {
    if (isRunning && prevRemaining.current > remainingSeconds) {
      addUsage(prevRemaining.current - remainingSeconds);
    }
    prevRemaining.current = remainingSeconds;
  }, [remainingSeconds, isRunning, addUsage]);

  // Check SMS thresholds
  useEffect(() => {
    if (isRunning) checkSms(remainingSeconds);
  }, [remainingSeconds, isRunning, checkSms]);

  useEffect(() => {
    if (isFinished) checkSms(0);
  }, [isFinished, checkSms]);

  // Lock screen & alarm on finish
  const lockAlarmTriggeredRef = useRef(false);
  useEffect(() => {
    if (isFinished && !lockAlarmTriggeredRef.current) {
      lockAlarmTriggeredRef.current = true;
      if (lockSettings.lockOnZero && hasPin()) setIsScreenLocked(true);
      if (lockSettings.alarmOnZero) startAlarm();
    }
    if (!isFinished) lockAlarmTriggeredRef.current = false;
  }, [isFinished, lockSettings, hasPin, startAlarm]);

  const handleLockScreenUnlock = () => {
    setIsScreenLocked(false);
    stopAlarm();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
  };

  const handleSettingsToggle = () => {
    if (pinRequired && !showSettings) return;
    setShowSettings(!showSettings);
  };

  // Find the profile that's closest to running out
  const lowestInfo = profileTimerInfos.length > 0
    ? profileTimerInfos.reduce((min, p) => p.effectiveRemaining < min.effectiveRemaining ? p : min)
    : null;

  return (
    <>
      <OnboardingDialog open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      {isScreenLocked && (
        <TimesUpLockScreen
          onUnlock={handleLockScreenUnlock}
          verifyPin={verifyPin}
          hasAlarm={lockSettings.alarmOnZero}
          onStopAlarm={stopAlarm}
        />
      )}
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Timer className="w-5 h-5 text-primary shrink-0" />
          <h1 className="text-base font-extrabold text-foreground font-display truncate">ScreenTime Pal</h1>
        </div>
        <div className="flex items-center gap-0 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setShowReferFriend(true)} className="text-muted-foreground h-9 w-9">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowThemePicker(true)} className="text-muted-foreground h-9 w-9">
            <Palette className="w-4 h-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => navigate("/stats")} className="text-muted-foreground h-9 w-9">
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="text-muted-foreground h-9 w-9">
            <UserCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSettingsToggle} className="text-muted-foreground h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <ThemePicker
        open={showThemePicker}
        onOpenChange={setShowThemePicker}
        totalStars={rewards.totalStars}
        activeThemeId={activeThemeId}
        isUnlocked={isThemeUnlocked}
        unlockTheme={unlockTheme}
        setActiveTheme={setActiveTheme}
      />

      <ReferFriend open={showReferFriend} onOpenChange={setShowReferFriend} />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-5">
        {/* Rewards */}
        <RewardsBadge rewards={rewards} />

        {/* Active Users Selector */}
        <ActiveUsersSelector
          profiles={profiles}
          activeIds={activeIds}
          onToggle={toggleActiveProfile}
          profileTimerInfos={profileTimerInfos}
        />

        {/* Dual limit indicators for the binding profile */}
        {lowestInfo && (
          <div className="flex gap-3 text-sm">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              lowestInfo.activeLimit === "daily" ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "bg-secondary border-border text-muted-foreground"
            }`}>
              <span>📅 Daily:</span>
              <span className="tabular-nums font-medium">{formatHM(lowestInfo.dailyRemaining)}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              lowestInfo.activeLimit === "weekly" ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "bg-secondary border-border text-muted-foreground"
            }`}>
              <span>📆 Weekly:</span>
              <span className="tabular-nums font-medium">{formatHM(lowestInfo.weeklyRemaining)}</span>
            </div>
          </div>
        )}

        {/* Timer */}
        <TimerDisplay remainingSeconds={remainingSeconds} progress={progress} isRunning={isRunning} isFinished={isFinished} activeLimit={activeLimit} />

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Button
            variant="secondary" size="icon"
            onClick={() => { if (!pinRequired) { reset(); resetSent(); } }}
            className={`rounded-full h-12 w-12 ${pinRequired ? "opacity-50" : ""}`}
            disabled={pinRequired}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          {isFinished ? (
            <Button
              variant="danger" size="lg"
              onClick={() => { if (!pinRequired) { reset(); resetSent(); } }}
              className={`h-16 w-16 rounded-full p-0 ${pinRequired ? "opacity-50" : ""}`}
              disabled={pinRequired}
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          ) : isRunning ? (
            <Button
              variant="danger" size="lg"
              onClick={() => { if (!pinRequired) { pause(); } }}
              className={`h-16 w-16 rounded-full p-0 ${pinRequired ? "opacity-50" : ""}`}
              disabled={pinRequired}
            >
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
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-lg border border-border space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* PIN Lock */}
            <PinLock
              hasPin={hasPin()}
              isUnlocked={isUnlocked}
              onVerify={verifyPin}
              onSetPin={setPin}
              onRemovePin={removePin}
              onLock={lock}
            />

            <div className="border-t border-border pt-5">
              <ProfileSelector
                profiles={profiles}
                activeId={activeId}
                onSwitch={switchProfile}
                onAdd={addProfile}
                onRemove={removeProfile}
              />
            </div>

            <div className="border-t border-border pt-5">
              <h2 className="text-lg font-bold text-foreground mb-1">📅 Daily Limit</h2>
              <p className="text-xs text-muted-foreground mb-4">Set today's screen time limit for all active profiles. Resets each day.</p>
              <TimeSetter onSetTime={setDailyTime} isRunning={isRunning} />
            </div>

            <div className="border-t border-border pt-5">
              <h2 className="text-lg font-bold text-foreground mb-1">📆 Weekly Limit</h2>
              <p className="text-xs text-muted-foreground mb-4">Set total screen time for the week. Usage counts against both daily and weekly limits.</p>
              <TimeSetter onSetTime={setWeeklyTime} isRunning={isRunning} presetOptions="weekly" />
            </div>

            <div className="border-t border-border pt-5">
              <ScheduleSettingsUI
                settings={scheduleSettings}
                onUpdate={updateSchedule}
                onUpdateDay={updateDay}
              />
            </div>

            <div className="border-t border-border pt-5">
              <LockScreenSettings
                settings={lockSettings}
                onUpdate={updateLockSettings}
                hasPinSet={hasPin()}
              />
            </div>

            <div className="border-t border-border pt-5">
              <NotificationSettings settings={notifSettings} onUpdate={updateNotifSettings} />
            </div>
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
    </>
  );
};

export default Index;
