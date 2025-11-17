import { t } from 'i18next';
import { useState } from 'react';
import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { Box, Stack, Dialog, Button, Typography, DialogContent } from '@mui/material';

import { useAuth } from 'src/store/auth';

import { Row } from 'src/components/views/row';
import { Iconify } from 'src/components/iconify';

const PLATFORM = Capacitor.getPlatform();

export const useFirstUse = create<DialogProps>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

const firebaseConfig = {
  apiKey: 'AIzaSyCjGhrbuGwdSnPeQ3w_MhBaaL_p90NK0YE',
  authDomain: 'edupath-nvt-715cb.firebaseapp.com',
  projectId: 'edupath-nvt-715cb',
  storageBucket: 'edupath-nvt-715cb.firebasestorage.app',
  messagingSenderId: '66651923636',
  appId: '1:66651923636:web:ea178e3a5e9c627fe723e1',
  measurementId: 'G-KP2C6QC94C',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function FirstUse() {
  const [step, setStep] = useState(0);
  const { open, setOpen } = useFirstUse();
  const { setAuth } = useAuth();

  const Login = async () => {
    if (PLATFORM === 'web') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('auth', JSON.stringify(result.user));
      setAuth({
        email: result.user?.email ?? '',
        name: result.user?.displayName ?? '',
        avatarUrl: result.user?.photoURL ?? '',
        id: '',
        phone: null,
        address: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });
      setOpen(false);
    } else {
      const result = await FirebaseAuthentication.signInWithGoogle();
      localStorage.setItem('auth', JSON.stringify(result.user));
      setAuth({
        email: result.user?.email ?? '',
        name: result.user?.displayName ?? '',
        avatarUrl: result.user?.photoUrl ?? '',
        id: '',
        phone: null,
        address: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogContent>
        <Box overflow="hidden">
          <Row sx={{ display: 'flex', '&>*': { flex: '0 0 100%' } }}>
            <Stack spacing={3}>
              <Typography variant="h2">{t('Welcome to Edupath')}</Typography>
              <Typography variant="body2" color="textSecondary">
                {t(
                  'Track your learning journey. Please sign in with your Google account to continue using the app.'
                )}
              </Typography>
              <Button
                variant="outlined"
                onClick={Login}
                startIcon={<Iconify icon="flat-color-icons:google" />}
              >
                {t('Sign in with Google')}
              </Button>
            </Stack>
          </Row>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
