import React from "react";
import { Timer, Clock, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ONBOARDING_KEY = "screen-timer-onboarded";

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: <Timer className="w-8 h-8 text-primary" />,
    title: "Set Your Limits",
    desc: "Set a daily limit (e.g. 2 hours) and a weekly limit (e.g. 10 hours). The timer always counts down from whichever limit is lower — so if you've used most of your weekly time, you'll see that instead.",
  },
  {
    icon: <Clock className="w-8 h-8 text-accent" />,
    title: "Track Your Time",
    desc: "Press play when you start using screens. Usage counts against both your daily and weekly limits at the same time.",
  },
  {
    icon: <Star className="w-8 h-8 text-timer-warning" />,
    title: "Earn Rewards",
    desc: "Stay under your daily limit to build streaks. Every 5 days under the limit earns you a star — spend stars to unlock color themes!",
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Parent Controls",
    desc: "Set a PIN in Settings to lock controls. You can also enable a lock screen and alarm for when time runs out.",
  },
];

export const OnboardingDialog: React.FC<Props> = ({ open, onClose }) => {
  const [step, setStep] = React.useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, "true");
      onClose();
    }
  };

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-xs rounded-2xl [&>button[data-radix-collection-item]]:hidden [&>.absolute.right-4.top-4]:hidden [&>button:last-of-type:not(.w-full)]:hidden" hideClose onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <div className="mb-2">{current.icon}</div>
          <DialogTitle className="text-lg">{current.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {current.desc}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 my-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={handleNext} className="w-full">
          {step < steps.length - 1 ? "Next" : "Get Started!"}
        </Button>

        {step === 0 && (
          <button
            onClick={() => {
              localStorage.setItem(ONBOARDING_KEY, "true");
              onClose();
            }}
            className="text-xs text-muted-foreground text-center hover:underline"
          >
            Skip intro
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export function shouldShowOnboarding(): boolean {
  return !localStorage.getItem(ONBOARDING_KEY);
}
