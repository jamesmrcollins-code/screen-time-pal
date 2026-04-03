import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { markResetDay } from "@/hooks/useResetDays";

const Index = () => {
  const { profiles, activeId, activeIds, addProfile, removeProfile, switchProfile, toggleActiveProfile } = useProfiles();
  const [scheduleProfileId, setScheduleProfileId] = useState<string | null>(activeId ?? null);

  const {
    profileTimerInfos,
    getProfileTimerInfo,
    remainingSeconds,
    isRunning,
    isFinished,
    activeLimit,
    progress,
    start,
    pause,
    reset,
    setDailyTime,
    setWeeklyTime,
    requestNotificationPermission,
  } = useScreenTimer(activeIds);

  const { log: usageLogData, addUsage, setLogBulk } = useUsageLog(activeId);
  const { settings: notifSettings, update: updateNotifSettings } = useNotificationSettings();
  const { check: checkSms, resetSent } = useSmsNotifier(notifSettings);
  const { hasPin, isUnlocked, setPin, removePin, verifyPin, lock } = usePinLock();
  const { settings: scheduleSettings, update: updateSchedule, getTodayLimit, setScheduleFromCloud } = useSchedule(scheduleProfileId ?? activeId);
  const { rewards, rewardsRaw, setRewardsFromCloud } = useRewards(activeId, usageLogData, scheduleSettings);
  const { settings: lockSettings, update: updateLockSettings } = useLockScreenSettings();
  const { startAlarm, stopAlarm } = useAlarm();
  const {
    activeThemeId,
    unlockedIds,
    isUnlocked: isThemeUnlocked,
    unlockTheme,
    setActiveTheme,
    setThemeFromCloud,
  } = useAppTheme(rewards.totalStars);
  const navigate = useNavigate();

  useCloudSync(
    usageLogData,
    setLogBulk,
    rewardsRaw,
    setRewardsFromCloud,
    { unlockedIds, activeThemeId },
    setThemeFromCloud,
    scheduleSettings,
    setScheduleFromCloud
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showReferFriend, setShowReferFriend] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [focusedProfileId, setFocusedProfileId] = useState<string | null>(null);
  const [dailyLimitProfileId, setDailyLimitProfileId] = useState<string | null>(activeId ?? profiles[0]?.id ?? null);
  const [weeklyLimitProfileId, setWeeklyLimitProfileId] = useState<string | null>(activeId ?? profiles[0]?.id ?? null);
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());
  const [notifEnabled, setNotifEnabled] = useState(
    "Notification" in window && Notification.permission === "granted"
  );

  const pinRequired = hasPin() && !isUnlocked;
  const fallbackProfileId = focusedProfileId ?? activeId ?? profiles[0]?.id ?? null;

  useEffect(() => {
    const hasProfile = (id: string | null) => !!id && profiles.some((profile) => profile.id === id);

    if (!hasProfile(dailyLimitProfileId)) {
      setDailyLimitProfileId(fallbackProfileId);
    }

    if (!hasProfile(weeklyLimitProfileId)) {
      setWeeklyLimitProfileId(fallbackProfileId);
    }

    if (!hasProfile(scheduleProfileId)) {
      setScheduleProfileId(fallbackProfileId);
    }
  }, [profiles, focusedProfileId, activeId, fallbackProfileId, dailyLimitProfileId, weeklyLimitProfileId, scheduleProfileId]);

  useEffect(() => {
    const limit = getTodayLimit();
    if (limit === null || isRunning) return;

    if (activeId) {
      setDailyTime(limit, activeId);
      return;
    }

    setDailyTime(limit);
  }, [activeId, getTodayLimit, isRunning, setDailyTime]);

  const prevRemaining = useRef(remainingSeconds);
  useEffect(() => {
    if (isRunning && prevRemaining.current > remainingSeconds) {
      addUsage(prevRemaining.current - remainingSeconds);
    }
    prevRemaining.current = remainingSeconds;
  }, [remainingSeconds, isRunning, addUsage]);

  useEffect(() => {
    if (isRunning) checkSms(remainingSeconds);
  }, [remainingSeconds, isRunning, checkSms]);

  useEffect(() => {
    if (isFinished) checkSms(0);
  }, [isFinished, checkSms]);

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

  const lowestInfo = profileTimerInfos.length > 0
    ? profileTimerInfos.reduce((min, profile) =>
        profile.effectiveRemaining < min.effectiveRemaining ? profile : min
      )
    : null;

  const displayInfo = focusedProfileId ? getProfileTimerInfo(focusedProfileId) : lowestInfo;
  const dailyTargetProfile = profiles.find((profile) => profile.id === dailyLimitProfileId) ?? null;
  const weeklyTargetProfile = profiles.find((profile) => profile.id === weeklyLimitProfileId) ?? null;
  const dailyTargetInfo = dailyLimitProfileId
    ? getProfileTimerInfo(dailyLimitProfileId)
    : null;
  const weeklyTargetInfo = weeklyLimitProfileId
    ? getProfileTimerInfo(weeklyLimitProfileId)
    : null;

  const handleSetDailyLimit = (seconds: number) => {
    if (dailyLimitProfileId) {
      setDailyTime(seconds, dailyLimitProfileId);
      return;
    }

    setDailyTime(seconds);
  };

  const handleSetWeeklyLimit = (seconds: number) => {
    if (weeklyLimitProfileId) {
      setWeeklyTime(seconds, weeklyLimitProfileId);
      return;
    }

    setWeeklyTime(seconds);
  };

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

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-5">
          <RewardsBadge rewards={rewards} />

          <ActiveUsersSelector
            profiles={profiles}
            activeIds={activeIds}
            onToggle={toggleActiveProfile}
            profileTimerInfos={profileTimerInfos}
            focusedId={focusedProfileId}
            onFocus={setFocusedProfileId}
          />

          <SwipeableTimerDisplay
            dailyRemaining={displayInfo?.dailyRemaining ?? remainingSeconds}
            weeklyRemaining={displayInfo?.weeklyRemaining ?? remainingSeconds}
            dailyProgress={displayInfo ? (displayInfo.dailyTotal > 0 ? displayInfo.dailyRemaining / displayInfo.dailyTotal : 1) : progress}
            weeklyProgress={displayInfo ? (displayInfo.weeklyTotal > 0 ? displayInfo.weeklyRemaining / displayInfo.weeklyTotal : 1) : progress}
            isRunning={isRunning}
            isFinished={isFinished}
            activeLimit={activeLimit}
          />

          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  if (!pinRequired) {
                    reset();
                    resetSent();
                  }
                }}
                className={`rounded-full h-12 w-12 ${pinRequired ? "opacity-50" : ""}`}
                disabled={pinRequired}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <span className="text-[10px] text-muted-foreground font-medium">Reset</span>
            </div>

            {isFinished ? (
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  if (!pinRequired) {
                    reset();
                    resetSent();
                  }
                }}
                className={`h-16 w-16 rounded-full p-0 ${pinRequired ? "opacity-50" : ""}`}
                disabled={pinRequired}
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
            ) : isRunning ? (
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  if (!pinRequired) {
                    pause();
                  }
                }}
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

            <div className="flex flex-col items-center gap-1">
              <Button
                variant={notifEnabled ? "secondary" : "outline"}
                size="icon"
                onClick={handleEnableNotifications}
                className="rounded-full h-12 w-12"
              >
                <Bell className={`w-5 h-5 ${notifEnabled ? "text-primary" : ""}`} />
              </Button>
              <span className="text-[10px] text-muted-foreground font-medium">
                {notifEnabled ? "Alerts on" : "Alerts"}
              </span>
            </div>
          </div>

          {showSettings && (
            <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-lg border border-border space-y-6 animate-in fade-in slide-in-from-top-2">
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
                <p className="text-xs text-muted-foreground mb-3">Choose one profile, then set that child&apos;s daily limit.</p>
                {profiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {profiles.map((profile) => (
                        <button
                          key={`daily-${profile.id}`}
                          type="button"
                          onClick={() => {
                            setDailyLimitProfileId(profile.id);
                            setFocusedProfileId(profile.id);
                          }}
                          aria-pressed={dailyLimitProfileId === profile.id}
                          className={`px-3 py-2 rounded-full text-xs font-semibold border-2 shadow-sm transition-all duration-150 active:scale-95 active:translate-y-px ${
                            dailyLimitProfileId === profile.id
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/25 shadow-md"
                              : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {profile.avatar} {profile.name}
                        </button>
                      ))}
                    </div>
                    {dailyTargetProfile && (
                      <p className="text-[11px] text-muted-foreground">
                        Setting daily limit for <span className="font-semibold text-foreground">{dailyTargetProfile.avatar} {dailyTargetProfile.name}</span>
                      </p>
                    )}
                  </div>
                )}
                <TimeSetter
                  onSetTime={handleSetDailyLimit}
                  isRunning={isRunning}
                  valueSeconds={dailyTargetInfo?.dailyTotal}
                />
              </div>

              <div className="border-t border-border pt-5">
                <h2 className="text-lg font-bold text-foreground mb-1">📆 Weekly Limit</h2>
                <p className="text-xs text-muted-foreground mb-3">Choose one profile, then set that child&apos;s weekly limit.</p>
                {profiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {profiles.map((profile) => (
                        <button
                          key={`weekly-${profile.id}`}
                          type="button"
                          onClick={() => {
                            setWeeklyLimitProfileId(profile.id);
                            setFocusedProfileId(profile.id);
                          }}
                          aria-pressed={weeklyLimitProfileId === profile.id}
                          className={`px-3 py-2 rounded-full text-xs font-semibold border-2 shadow-sm transition-all duration-150 active:scale-95 active:translate-y-px ${
                            weeklyLimitProfileId === profile.id
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/25 shadow-md"
                              : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {profile.avatar} {profile.name}
                        </button>
                      ))}
                    </div>
                    {weeklyTargetProfile && (
                      <p className="text-[11px] text-muted-foreground">
                        Setting weekly limit for <span className="font-semibold text-foreground">{weeklyTargetProfile.avatar} {weeklyTargetProfile.name}</span>
                      </p>
                    )}
                  </div>
                )}
                <TimeSetter
                  onSetTime={handleSetWeeklyLimit}
                  isRunning={isRunning}
                  presetOptions="weekly"
                  valueSeconds={weeklyTargetInfo?.weeklyTotal}
                />
              </div>

              <div className="border-t border-border pt-5">
                <ScheduleSettingsUI
                  settings={scheduleSettings}
                  onUpdate={updateSchedule}
                  profiles={profiles}
                  selectedProfileId={scheduleProfileId}
                  onSelectProfile={(id) => {
                    setScheduleProfileId(id);
                    setFocusedProfileId(id);
                  }}
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
              <p className="text-accent font-semibold text-lg">⏰ Time&apos;s Up!</p>
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
