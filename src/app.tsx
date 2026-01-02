import 'src/global.css';
import 'dayjs/locale/vi';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

dayjs.locale('vi');

import { Toaster } from 'sonner';
import { lazy, useEffect } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter, usePathname } from 'src/routes/hooks';

const ThemeProvider = lazy(() => import('src/theme/theme-provider'));

const ConfigDialog = lazy(() => import('./components/dialog-confirm/confirm-dialog'));

import { Capacitor } from '@capacitor/core';
import { createPaletteChannel } from 'minimal-shared/utils';

import { useTheme } from '@mui/material';
import { cyan } from '@mui/material/colors';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useLayoutPadding } from './layouts/mobile-layout';
import { useCreateDatabase } from './database/use-databse';
import { useThemeData, generateColorPalette } from './hooks/use-theme-data';
// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  useCreateDatabase();
  const theme = useTheme();
  const { primary = cyan[500] } = useThemeData();
  const { bottom } = useLayoutPadding();

  const router = useRouter();

  useEffect(() => {
    const redirected = localStorage.getItem('redirected');
    if (redirected) {
      localStorage.removeItem('redirected');
      router.replace(redirected);
      localStorage.removeItem('redirected');
    }
  }, [router]);

  return (
    <ThemeProvider
      themeOverrides={{
        colorSchemes: {
          dark: {
            palette: {
              primary: createPaletteChannel(generateColorPalette(primary, theme)),
            },
          },
          light: {
            palette: {
              primary: createPaletteChannel(generateColorPalette(primary, theme)),
            },
          },
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        {children}
      </LocalizationProvider>
      <ConfigDialog />
      <Toaster
        position={Capacitor.isNativePlatform() ? 'bottom-right' : 'top-right'}
        style={{
          bottom: Capacitor.isNativePlatform() ? theme.spacing(bottom + 12) : 'unset',
        }}
      />
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
