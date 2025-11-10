import 'src/global.css';
import 'dayjs/locale/vi';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

dayjs.locale('vi');

import { Toaster } from 'sonner';
import { lazy, useEffect } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePathname } from 'src/routes/hooks';

const ThemeProvider = lazy(() => import('src/theme/theme-provider'));

const ConfigDialog = lazy(() => import('./components/dialog-confirm/confirm-dialog'));

import { Capacitor } from '@capacitor/core';
import { createPaletteChannel } from 'minimal-shared/utils';

import { useTheme } from '@mui/material';
import { cyan } from '@mui/material/colors';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useLayoutPadding } from './layouts/mobile-layout';
import { useThemeData, generateColorPalette } from './hooks/use-theme-data';
// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  const theme = useTheme();
  const { primary = cyan[500] } = useThemeData();
  const { bottom } = useLayoutPadding();

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
          bottom: theme.spacing(bottom + 12),
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
