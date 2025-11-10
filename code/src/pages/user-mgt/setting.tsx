import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import * as colors from '@mui/material/colors';
import {
  Tab,
  Box,
  Link,
  Card,
  Tabs,
  Stack,
  Button,
  Typography,
  CardHeader,
  Breadcrumbs,
  CardContent,
  useColorScheme,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';
import { useAuthCheck } from 'src/routes/hooks/use-auth-check';
import { checkStatusBarStyle } from 'src/routes/components/check-auth';

import { useThemeData } from 'src/hooks/use-theme-data';

import { axios } from 'src/api/axios';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { primary as primaryColor } from 'src/theme/core/palette';

import Title from 'src/components/title';
import { toast } from 'src/components/toast';
import { Iconify, type IconifyName } from 'src/components/iconify';

const tabsTheme: { key: string; label: string; icon: IconifyName }[] = [
  {
    key: 'light',
    label: 'Light',
    icon: 'solar:sun-bold',
  },
  {
    key: 'dark',
    label: 'Dark',
    icon: 'solar:moon-bold',
  },
  {
    key: 'system',
    label: 'System',
    icon: 'solar:laptop-outline',
  },
];

export default function Setting() {
  const { setMode, mode } = useColorScheme();
  const { setPrimary, primary } = useThemeData();
  const form = useForm<{ theme: 'light' | 'dark' | 'system'; mainColor: string }>({
    defaultValues: {
      theme: mode,
      mainColor: primary,
    },
  });
  const [theme, mainColor = primaryColor.main] = useWatch({
    control: form.control,
    name: ['theme', 'mainColor'],
  });

  useAuthCheck();

  useEffect(() => {
    setMode(theme);
    setPrimary(mainColor);
    checkStatusBarStyle(theme);
  }, [mainColor, setMode, setPrimary, theme]);

  const colorData = Object.entries(colors).filter((x) => x[0] !== 'common');
  return (
    <DashboardContent>
      <Title>Setting account - {CONFIG.appName}</Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Setting account
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} href="/user-management" color="textPrimary" variant="body2">
            User management
          </Link>
          <Typography variant="body2">Setting account</Typography>
        </Breadcrumbs>
      </Stack>
      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="Theme"
            subheader="Switch between Light, Dark, or System themes for a personalized and comfortable experience."
          />
          <CardContent>
            <Controller
              control={form.control}
              name="theme"
              defaultValue="system"
              render={({ field }) => (
                <Tabs
                  sx={{ borderRadius: 1, width: 'fit-content' }}
                  type="button"
                  value={field.value}
                  onChange={(_, v) => field.onChange(v)}
                >
                  {tabsTheme.map((tab) => (
                    <Tab
                      key={tab.key}
                      label={tab.label}
                      value={tab.key}
                      iconPosition="start"
                      icon={<Iconify icon={tab.icon} />}
                    />
                  ))}
                </Tabs>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Select color" subheader="Select color for your account." />
          <CardContent>
            <Controller
              control={form.control}
              name="mainColor"
              render={({ field }) => (
                <Stack
                  direction="row"
                  sx={{
                    flexWrap: 'wrap',
                    '&> *': {
                      flex: `0 0 ${100 / colorData.length}%`,
                      minWidth: 32,
                    },
                  }}
                >
                  {colorData.map(([key, value]) => (
                    <Stack key={key}>
                      {Object.entries(value)
                        .filter(([x]) => Number(x) >= 300 && Number(x) <= 900)
                        .map(([, color]) => (
                          <Box
                            key={color}
                            sx={{
                              aspectRatio: '1 / 1',
                              bgcolor: color,
                              '&:hover': { opacity: 0.72 },
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: (t) => t.palette.getContrastText(color),
                              borderRadius: 3,
                              scale: 0.6,
                              transition: 'all 0.1s',
                              boxShadow: `2px 4px 8px 0 ${color}`,
                              ...(color === mainColor && { scale: 0.8 }),
                            }}
                            onClick={() => field.onChange(color)}
                          >
                            {mainColor === color && (
                              <Iconify width={0.6} icon="eva:checkmark-fill" />
                            )}
                          </Box>
                        ))}
                    </Stack>
                  ))}
                </Stack>
              )}
            />
          </CardContent>
        </Card>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            size="large"
            color="inherit"
            onClick={() => {
              form.reset();
            }}
          >
            Reset
          </Button>
          <Button
            startIcon={<Iconify icon="solar:diskette-bold" />}
            size="large"
            color="inherit"
            variant="contained"
            onClick={form.handleSubmit(async (config) => {
              await axios
                .patch(`/profile`, { config })
                .then((res) => toast.success(res.data.msg))
                .catch((err) => toast.error(err.response.data.msg));
            })}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </DashboardContent>
  );
}
