import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'edupath.edu.app.vn',
  appName: 'Edupath',
  webDir: 'dist',
  plugins: {
    CapacitorFirebaseAuthentication: {
      authDomain: 'edupath-nvt-715cb.firebaseapp.com',
      skipNativeAuth: false,
      providers: ['google.com']
    }
  }
};

export default config;
