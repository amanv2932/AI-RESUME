import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amanv.smartats',
  appName: 'Smart ATS Resume Builder',
  webDir: 'out',
  server: {
    url: 'https://ai-resume-av-a5a7.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
