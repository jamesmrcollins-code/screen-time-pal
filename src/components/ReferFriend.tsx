import React, { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const APP_LINKS = {
  ios: "https://apps.apple.com/app/screentime-pal/id000000000",
  android: "https://play.google.com/store/apps/details?id=app.screentime.pal",
};

const SHARE_MESSAGE = `Hey! I've been using ScreenTime Pal to manage my screen time — it's really helped! Check it out:\n\n📱 iPhone: ${APP_LINKS.ios}\n🤖 Android: ${APP_LINKS.android}`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReferFriend: React.FC<Props> = ({ open, onOpenChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_MESSAGE);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try sharing instead.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ScreenTime Pal",
          text: SHARE_MESSAGE,
        });
      } catch (e: any) {
        if (e.name !== "AbortError") toast.error("Sharing failed.");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">🤝 Refer a Friend</DialogTitle>
          <DialogDescription className="text-center">
            Share ScreenTime Pal with friends and family!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 text-sm text-foreground whitespace-pre-line break-words leading-relaxed">
            {SHARE_MESSAGE}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-timer-active" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>

            <Button
              className="flex-1 gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            The app store links are placeholders — update them once your app is published.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
