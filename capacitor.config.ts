import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.screentimepal',
  appName: 'ScreenTime Pal',
  webDir: 'dist',
  server: {
    url: 'https://www.screentimepal.io?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
