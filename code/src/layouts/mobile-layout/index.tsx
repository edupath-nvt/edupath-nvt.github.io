import { create } from 'zustand';
import { merge } from 'es-toolkit';
import { useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import { Logo } from 'src/components/logo';

import { Footer } from './footer';
import { _account } from '../nav-config-account';
import { AccountPopover } from '../components/account-popover';
import { MainSection, LayoutSection, HeaderSection } from '../core';

import type { HeaderSectionProps } from '../core';
import type { DashboardLayoutProps } from '../dashboard';

export const useLayoutPadding = create<{
  top: number;
  bottom: number;
  set: (top: number, bottom: number) => void;
}>((set) => ({
  top: 0,
  bottom: 0,
  set: (top, bottom) => set({ top, bottom }),
}));

export function MobileLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { top, bottom } = useLayoutPadding();
  const renderHeader = useCallback(() => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      leftArea: <Logo />,
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Account drawer */}
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={{
          ...slotProps?.header?.sx,
          top: theme.spacing(top),
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: 1,
            height: theme.spacing(top),
            bgcolor: theme.vars.palette.background.default,
          },
        }}
      />
    );
  }, [layoutQuery, slotProps?.header, theme, top]);

  return (
    <LayoutSection
      footerSection={<Footer />}
      headerSection={renderHeader()}
      sx={{ ...sx, pt: theme.spacing(top), pb: theme.spacing(bottom + 12) }}
    >
      <MainSection {...slotProps?.main}>{children}</MainSection>
    </LayoutSection>
  );
}
