import { Box, Tab, Tabs } from '@mui/material';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useLayoutPadding } from '.';
import { navData } from '../nav-config-dashboard';

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const { bottom } = useLayoutPadding();
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: 1,
        display: 'flex',
        justifyContent: 'center',
        bgcolor: (t) => t.vars.palette.background.neutral,
        pb: bottom,
        zIndex: 1000,
      }}
    >
      <Tabs
        variant="scrollable"
        type="button"
        value={'/' + pathname.split('/')[1]}
        onChange={(_, value) => router.push(value)}
      >
        {navData.map((item) => (
          <Tab
            sx={{
              height: (t) => t.spacing(10),
              textWrap: 'nowrap',
              '&.Mui-selected': {
                color: (t) => `${t.palette.primary.main} !important`,
                fontWeight: 600,
                '& .MuiTab-icon': {
                  scale: 1.4,
                },
              },
              width: `calc(100% / ${navData.length}) !important`,
              minWidth: '0 !important',
              fontSize: 12,
              fontWeight: 400,
              '& .MuiTab-icon': {
                scale: 1,
              },
            }}
            key={item.title}
            value={item.path}
            label={item.title}
            icon={item.icon}
          />
        ))}
      </Tabs>
    </Box>
  );
}
