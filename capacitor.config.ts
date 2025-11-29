import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'edupath.edu.app.vn',
  appName: 'Edupath',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      google: {
        webClientId: '66651923636-10jhlmic14fvivlvhiivkajvo7hdcit4.apps.googleusercontent.com'
      }
    }
  }
};

export default config;