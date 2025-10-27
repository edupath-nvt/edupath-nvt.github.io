import { Stack, Button, Typography } from '@mui/material';

import { t } from 'src/hooks/lang';

import { Iconify } from 'src/components/iconify';
import { SelectSubject } from 'src/components/fields/select-subject';

export default function Page() {
  return (
    <Stack>
      <Stack direction="row" alignItems="center">
        <Typography flex={1} variant="h2" textTransform="uppercase">
          {t('Target')}
        </Typography>
        <SelectSubject>
          <Button startIcon={<Iconify icon="mingcute:add-line" />} variant="contained">
            {t('Add')}
          </Button>
        </SelectSubject>
      </Stack>
    </Stack>
  );
}
