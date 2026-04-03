import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Index from "@/pages/Index";

const mocks = vi.hoisted(() => {
  const timerInfos = {
    p1: {
      profileId: "p1",
      dailyTotal: 3600,
      dailyRemaining: 3200,
      weeklyTotal: 7200,
      weeklyRemaining: 6800,
      effectiveRemaining: 3200,
      activeLimit: "daily" as const,
    },
    p2: {
      profileId: "p2",
      dailyTotal: 1800,
      dailyRemaining: 1700,
      weeklyTotal: 14400,
      weeklyRemaining: 14000,
      effectiveRemaining: 1700,
      activeLimit: "daily" as const,
    },
  };

  return {
    timerInfos,
    navigate: vi.fn(),
    setDailyTime: vi.fn(),
    setWeeklyTime: vi.fn(),
    requestNotificationPermission: vi.fn(async () => true),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock("@/hooks/useProfiles", () => ({
  useProfiles: () => ({
    profiles: [
      { id: "p1", name: "Alice", avatar: "👧" },
      { id: "p2", name: "Bob", avatar: "👦" },
    ],
    activeId: "p1",
    activeIds: ["p1"],
    addProfile: vi.fn(),
    removeProfile: vi.fn(),
    switchProfile: vi.fn(),
    toggleActiveProfile: vi.fn(),
  }),
}));

vi.mock("@/hooks/useScreenTimer", () => ({
  useScreenTimer: () => ({
    profileTimerInfos: [mocks.timerInfos.p1],
    getProfileTimerInfo: (profileId: keyof typeof mocks.timerInfos) => mocks.timerInfos[profileId],
    remainingSeconds: mocks.timerInfos.p1.effectiveRemaining,
    isRunning: false,
    isFinished: false,
    activeLimit: "daily",
    progress: 0.5,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setDailyTime: mocks.setDailyTime,
    setWeeklyTime: mocks.setWeeklyTime,
    requestNotificationPermission: mocks.requestNotificationPermission,
  }),
}));

vi.mock("@/hooks/useUsageLog", () => ({
  useUsageLog: () => ({ log: [], addUsage: vi.fn(), setLogBulk: vi.fn() }),
}));

vi.mock("@/hooks/useNotificationSettings", () => ({
  useNotificationSettings: () => ({ settings: {}, update: vi.fn() }),
}));

vi.mock("@/hooks/useSmsNotifier", () => ({
  useSmsNotifier: () => ({ check: vi.fn(), resetSent: vi.fn() }),
}));

vi.mock("@/hooks/usePinLock", () => ({
  usePinLock: () => ({
    hasPin: () => false,
    isUnlocked: true,
    setPin: vi.fn(),
    removePin: vi.fn(),
    verifyPin: vi.fn(() => true),
    lock: vi.fn(),
  }),
}));

vi.mock("@/hooks/useRewards", () => ({
  useRewards: () => ({
    rewards: { totalStars: 0 },
    rewardsRaw: { datesUnderLimit: [], lastCheckedDate: "" },
    setRewardsFromCloud: vi.fn(),
  }),
}));

vi.mock("@/hooks/useSchedule", () => ({
  useSchedule: () => ({
    settings: { useSchedule: true, weekdayLimitSeconds: 3600, weekendLimitSeconds: 7200 },
    update: vi.fn(),
    getTodayLimit: () => 1800,
    setScheduleFromCloud: vi.fn(),
  }),
}));

vi.mock("@/hooks/useLockScreenSettings", () => ({
  useLockScreenSettings: () => ({
    settings: { lockOnZero: false, alarmOnZero: false },
    update: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAlarm", () => ({
  useAlarm: () => ({ startAlarm: vi.fn(), stopAlarm: vi.fn() }),
}));

vi.mock("@/hooks/useAppTheme", () => ({
  useAppTheme: () => ({
    activeThemeId: "default",
    unlockedIds: ["default"],
    isUnlocked: () => true,
    unlockTheme: vi.fn(),
    setActiveTheme: vi.fn(),
    setThemeFromCloud: vi.fn(),
  }),
}));

vi.mock("@/hooks/useCloudSync", () => ({
  useCloudSync: vi.fn(),
}));

vi.mock("@/components/TimeSetter", () => ({
  TimeSetter: ({ onSetTime, presetOptions = "daily", valueSeconds }: { onSetTime: (seconds: number) => void; presetOptions?: "daily" | "weekly"; valueSeconds?: number }) => (
    <div>
      <div data-testid={`${presetOptions}-value`}>{String(valueSeconds)}</div>
      <button onClick={() => onSetTime(presetOptions === "weekly" ? 777 : 555)}>
        {presetOptions === "weekly" ? "Apply weekly" : "Apply daily"}
      </button>
    </div>
  ),
}));

vi.mock("@/components/SwipeableTimerDisplay", () => ({ SwipeableTimerDisplay: () => <div /> }));
vi.mock("@/components/NotificationSettings", () => ({ NotificationSettings: () => <div /> }));
vi.mock("@/components/ProfileSelector", () => ({ ProfileSelector: () => <div /> }));
vi.mock("@/components/PinLock", () => ({ PinLock: () => <div /> }));
vi.mock("@/components/RewardsBadge", () => ({ RewardsBadge: () => <div /> }));
vi.mock("@/components/ScheduleSettings", () => ({ ScheduleSettings: () => <div /> }));
vi.mock("@/components/LockScreenSettings", () => ({ LockScreenSettings: () => <div /> }));
vi.mock("@/components/TimesUpLockScreen", () => ({ TimesUpLockScreen: () => <div /> }));
vi.mock("@/components/ThemeToggle", () => ({ ThemeToggle: () => <div /> }));
vi.mock("@/components/ThemePicker", () => ({ ThemePicker: () => <div /> }));
vi.mock("@/components/ActiveUsersSelector", () => ({ ActiveUsersSelector: () => <div /> }));
vi.mock("@/components/ReferFriend", () => ({ ReferFriend: () => <div /> }));
vi.mock("@/components/OnboardingDialog", () => ({
  OnboardingDialog: () => <div />,
  shouldShowOnboarding: () => false,
}));

describe("Index per-profile limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies scheduled daily limits only to the active profile", () => {
    render(<Index />);

    expect(mocks.setDailyTime).toHaveBeenCalledWith(1800, "p1");
  });

  it("loads and saves limits for the selected profile even when that profile is inactive", () => {
    const view = render(<Index />);
    const { container } = view;

    const headerButtons = container.querySelectorAll("header button");
    headerButtons[4]?.click();

    const [dailyBobButton, weeklyBobButton] = view.getAllByText(/Bob/);
    dailyBobButton.click();

    expect(view.getByTestId("daily-value")).toHaveTextContent("1800");

    view.getByRole("button", { name: "Apply daily" }).click();
    expect(mocks.setDailyTime).toHaveBeenCalledWith(555, "p2");

    weeklyBobButton.click();

    expect(view.getByTestId("weekly-value")).toHaveTextContent("14400");

    view.getByRole("button", { name: "Apply weekly" }).click();
    expect(mocks.setWeeklyTime).toHaveBeenCalledWith(777, "p2");
  });
});