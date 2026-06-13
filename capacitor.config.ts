import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rll.mobile',
  appName: 'R.L.L Lite',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    useLegacyBridge: true
  }
};

export default config;
