import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Style, StatusBar } from '@capacitor/status-bar';

import { useColorScheme } from '@mui/material';

import { useThemeData } from 'src/hooks/use-theme-data';

import { primary } from 'src/theme';
import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useLayoutPadding } from 'src/layouts/mobile-layout';

import { useRouter } from '../hooks';

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

export function CheckAuth({
  children,
  fallback,
}: React.PropsWithChildren & {
  fallback: React.ReactNode;
}) {
  const { setAuth } = useAuth();
  const router = useRouter();
  const { setMode } = useColorScheme();
  const { setPrimary } = useThemeData();
  const { set } = useLayoutPadding();

  useEffect(() => {
    axios.get('/me').then((res) => {
      setAuth(res.data);
      setMode(res.data.config?.theme || 'system');
      setPrimary(res.data.config?.mainColor || primary.main);
      checkStatusBarStyle(res.data.config?.theme || 'system');
    });

    const flatform = Capacitor.getPlatform();
    if (flatform === 'android') {
      set(5, 2);
    }
    if (flatform === 'ios') {
      set(6, 3);
    }
  }, [router, set, setAuth, setMode, setPrimary]);

  return children;
}
