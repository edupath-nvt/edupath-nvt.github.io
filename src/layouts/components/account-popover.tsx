import type { IconButtonProps } from '@mui/material/IconButton';

import { signOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { useState, useCallback } from 'react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';
import { auth as firebaseAuth } from 'src/routes/components/first-use';

import { t } from 'src/i18n';
import { useAuth } from 'src/store/auth';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
    onClick?: () => void;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const { auth, setAuth } = useAuth();
  const [isLogout, setIsLogout] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src={auth?.avatarUrl} sx={{ width: 1, height: 1 }}>
          {auth?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {auth?.name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {auth?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            loading={isLogout}
            onClick={async () => {
              // setIsLogout(true);
              try {
                if (Capacitor.isNativePlatform()) {
                  await FirebaseAuthentication.signOut();
                } else {
                  await signOut(firebaseAuth);
                }
                localStorage.removeItem('auth');
                setAuth(null);
                setIsLogout(false);
                window.location.reload();
              } catch {
                setIsLogout(false);
              } finally {
                handleClosePopover();
              }
            }}
          >
            {t('Logout')}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
