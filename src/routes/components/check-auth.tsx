import type { UserCredential } from 'firebase/auth';

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
    const authData: UserCredential['user'] = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!authData.email) {
      setOpen(true);
    } else {
      setAuth({
        email: authData?.email ?? '',
        name: authData?.displayName ?? '',
        avatarUrl: authData?.photoURL ?? '',
        id: '',
        phone: null,
        address: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });
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
      {!localStorage.getItem('auth') && <FirstUse />}
    </>
  );
}
