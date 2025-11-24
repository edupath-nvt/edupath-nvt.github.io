import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Style, StatusBar } from '@capacitor/status-bar';

import { useAuth } from 'src/store/auth';
import { useLayoutPadding } from 'src/layouts/mobile-layout';

import { FirstUse, useFirstUse } from './first-use';

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
  const { setOpen, open } = useFirstUse();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setOpen(true);
    } else {
      setAuth(JSON.parse(atob(token.split('.')[1])));
      setOpen(false);
    }

    if (PLATFORM === 'android') {
      set(5, 2);
    }
    if (PLATFORM === 'ios') {
      set(6, 3);
    }
  }, [set, setAuth, setOpen]);

  return (
    <>
      {!open && children}
      {!localStorage.getItem('access_token') && <FirstUse />}
    </>
  );
}
