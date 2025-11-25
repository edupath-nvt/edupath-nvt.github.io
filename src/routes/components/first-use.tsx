import { t } from 'i18next';
import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { Box, Stack, Dialog, Button, Typography, DialogContent } from '@mui/material';

import { API } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useDatabase } from 'src/database/use-databse';

import { toast } from 'src/components/toast';
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
  const { open, setOpen } = useFirstUse();
  const { setAuth } = useAuth();
  const { setCurrent } = useDatabase();

  const Login = async () => {
    try {
      if (PLATFORM === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const access_token = await API.getToken({
          displayName: result.user.displayName!,
          email: result.user.email!,
          photoURL: result.user.photoURL!,
        });
        localStorage.setItem('access_token', access_token);
        setAuth(JSON.parse(atob(access_token.split('.')[1])));
        setOpen(false);
      } else {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const user = result.user!;
        const access_token = await API.getToken({
          displayName: user.displayName!,
          email: user.email!,
          photoURL: user.photoUrl!,
        });
        localStorage.setItem('access_token', access_token);
        setAuth(JSON.parse(atob(access_token.split('.')[1])));
        setOpen(false);
        setCurrent(Number(localStorage.getItem('id_target')));
      }
    } catch {
      toast.error(t('Error in login'), { id: 'msg' });
      localStorage.removeItem('access_token');
    }
  };
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogContent>
        <Box overflow="hidden">
          <Row sx={{ display: 'flex', '&>*': { flex: '0 0 100%' } }}>
            <Stack gap={3}>
              <Typography variant="h3" textAlign="center">
                {t('Welcome to Edupath')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t(
                  'Track your learning journey. Please sign in with your Google account to continue using the app.'
                )}
              </Typography>
              <Button
                size="large"
                variant="outlined"
                onClick={Login}
                startIcon={<Iconify icon="flat-color-icons:google" />}
                sx={{ mt: 3 }}
              >
                {t('Sign in with Google')}
              </Button>
              {Capacitor.getPlatform() === 'web' && (
                <Button
                  size="large"
                  variant="outlined"
                  LinkComponent="a"
                  href="/edupath.apk"
                  download="edupath.apk"
                  startIcon={<Iconify icon="flat-color-icons:android-os" />}
                >
                  {t('Download app android')}
                </Button>
              )}
            </Stack>
          </Row>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
