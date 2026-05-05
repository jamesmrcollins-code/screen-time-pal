import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.screentimepal',
  appName: 'ScreenTime Pal',
  webDir: 'dist',
  server: {
    url: 'https://2e3f9e18-f419-46d1-ae91-ca099aee18b8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
