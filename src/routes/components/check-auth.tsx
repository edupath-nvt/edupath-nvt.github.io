import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { Style, StatusBar } from '@capacitor/status-bar';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { Stack, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';

import { t } from 'src/i18n';
import { useLayoutPadding } from 'src/layouts/mobile-layout';

import { Iconify } from 'src/components/iconify';

const firebaseConfig = {
  apiKey: 'AIzaSyCjGhrbuGwdSnPeQ3w_MhBaaL_p90NK0YE',
  authDomain: 'edupath-nvt-715cb.firebaseapp.com',
  projectId: 'edupath-nvt-715cb',
  storageBucket: 'edupath-nvt-715cb.firebasestorage.app',
  messagingSenderId: '66651923636',
  appId: '1:66651923636:web:ea178e3a5e9c627fe723e1',
  measurementId: 'G-KP2C6QC94C',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function checkStatusBarStyle(mode: 'light' | 'dark' | 'system') {
  if (!Capacitor.isNativePlatform()) {
    console.log('Chỉ chạy trên thiết bị Android/iOS');
    return;
  }

  if (mode === 'light') {
    StatusBar.setStyle({ style: Style.Light });
  }

  if (mode === 'dark') {
    StatusBar.setStyle({ style: Style.Dark });
  }

  if (mode === 'system') {
    StatusBar.setStyle({ style: Style.Default });
  }
}

const PLATFORM = Capacitor.getPlatform();

export function CheckAuth({ children }: React.PropsWithChildren) {
  const { set } = useLayoutPadding();
  const [open, setOpen] = useState(false);

  const Login = async () => {
    if (PLATFORM === 'web') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('auth', JSON.stringify(result.user));
      setOpen(false);
    } else {
      const result = await FirebaseAuthentication.signInWithGoogle();
      localStorage.setItem('auth', JSON.stringify(result.user));
      setOpen(false);
    }
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!authData.email) {
      setOpen(true);
    }

    if (PLATFORM === 'android') {
      set(5, 2);
    }
    if (PLATFORM === 'ios') {
      set(6, 3);
    }
  }, [set]);

  return (
    <>
      {children}
      {!localStorage.getItem('auth') && (
        <Dialog open={open} fullWidth maxWidth="xs">
          <DialogTitle>{t('Welcome to Edupath')}</DialogTitle>
          <DialogContent>
            <Stack>
              <Button
                variant="outlined"
                onClick={Login}
                startIcon={<Iconify icon="flat-color-icons:google" />}
              >
                {t('Sign in with Google')}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
