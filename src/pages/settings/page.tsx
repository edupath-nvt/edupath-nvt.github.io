import type { IconifyName } from 'src/components/iconify';

import Color from 'color';

import { Stack } from '@mui/system';
import * as colors from '@mui/material/colors';
import { Tab, Box, Tabs, MenuItem, TextField, useColorScheme } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useThemeData } from 'src/hooks/use-theme-data';

import { t } from 'src/i18n';

import { Iconify } from 'src/components/iconify';
import { ColorPicker } from 'src/components/color-utils';
import { LabelBorder } from 'src/components/label/label-border';

const colorOpt = Object.entries(colors)
  .filter(([key]) => key !== 'common')
  .sort((a, b) => {
    const colorA = Color((a[1] as Record<number, string>)[500]).luminosity();
    const colorB = Color((b[1] as Record<number, string>)[500]).luminosity();
    return colorA > colorB ? -1 : 1;
  })
  .flatMap(([, value]) =>
    Object.entries(value)
      .filter(([shade]) => Number(shade) >= 300 && Number(shade) < 900)
      .map(([, color]) => color)
  );

const theme: Record<string, IconifyName> = {
  light: 'solar:sun-bold',
  dark: 'solar:moon-bold',
  system: 'solar:laptop-outline',
};

export default function Page() {
  const { setMode, mode } = useColorScheme();
  const { primary, setPrimary } = useThemeData();
  const router = useRouter();

  return (
    <Stack gap={3} mt={5}>
      <Tabs
        value={mode || localStorage.getItem('mui-mode') || 'system'}
        onChange={(_e, val) => setMode(val)}
        type="button"
        sx={{ borderRadius: 1, '& button': { textTransform: 'capitalize' } }}
      >
        {Object.entries(theme).map(([key, value]) => (
          <Tab
            key={key}
            iconPosition="start"
            label={t(key)}
            value={key}
            icon={<Iconify icon={value} />}
          />
        ))}
      </Tabs>
      <TextField
        label={t('Language')}
        select
        value={localStorage.getItem('i18nextLng')}
        onChange={(e) => {
          const value = e.target.value;
          localStorage.setItem('i18nextLng', value);
          router.refresh();
        }}
      >
        <MenuItem value="en">{t('English')}</MenuItem>
        <MenuItem value="vi">{t('Vietnamese')}</MenuItem>
      </TextField>
      <Box sx={{ border: 1, borderRadius: 1, borderColor: 'divider', py: 2, position: 'relative' }}>
        <LabelBorder>{t('Primary color')}</LabelBorder>
        <ColorPicker
          options={colorOpt}
          value={primary}
          variant="rounded"
          size={42}
          sx={{
            '& li': {
              width: 1 / 6,
              display: 'flex',
              justifyContent: 'center',
            },
          }}
          onChange={(v) => typeof v === 'string' && setPrimary(v)}
        />
      </Box>
    </Stack>
  );
}
