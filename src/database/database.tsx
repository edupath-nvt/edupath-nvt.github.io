import dayjs from 'dayjs';
import SparkMD5 from 'spark-md5';
import { useEffect } from 'react';
import { useWatch, Controller, createFormControl } from 'react-hook-form';

import { Box, Dialog, Button, TextField, DialogTitle, DialogActions } from '@mui/material';

import { t } from 'src/i18n';
import { API } from 'src/api/axios';
import { useAuth } from 'src/store/auth';

import { SvgColor } from 'src/components/svg-color';

import { useDatabase } from './use-databse';

export const formTarget = createFormControl<
  {
    _open: boolean;
  } & TargetDatabase
>();

export function DatabaseAction() {
  const { current, setCurrent } = useDatabase();
  const [open] = useWatch({ control: formTarget.control, name: ['_open'] });
  const { auth } = useAuth();
  useEffect(() => {
    if (current === 0 && !open) {
      formTarget.setValue('_open', true);
    }
  }, [current, open]);

  const handleSave = formTarget.handleSubmit(async (data) => {
    if (!data.id) {
      const json = {
        targets: [],
        scores: [],
        schedules: [],
      };
      const md5 = SparkMD5.hash(JSON.stringify(json));
      const time = dayjs().unix();
      const id = await API.asyncTarget({
        name: data.name,
        target: {
          targets: [],
          scores: [],
          schedules: [],
        },
        md5,
        time,
      });
      setCurrent(id);
      formTarget.setValue('_open', false);
    }
  });

  return (
    <Dialog open={open && !!auth} fullWidth maxWidth="xs">
      <DialogTitle>{t('Create target')}</DialogTitle>
      <Box px={3} pb={1}>
        <Controller
          control={formTarget.control}
          name="name"
          defaultValue=""
          rules={{
            required: t('Name target is required'),
            maxLength: { value: 50, message: t('Name target is too long (max 50 characters)') },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <TextField
              fullWidth
              label={t('Name target')}
              {...field}
              error={invalid}
              helperText={error?.message}
            />
          )}
        />
      </Box>
      <DialogActions>
        <Button
          onClick={() => {
            formTarget.setValue('_open', false);
          }}
        >
          {t('Close')}
        </Button>
        <Button
          startIcon={<SvgColor src="/assets/icons/navbar/ic-target.svg" />}
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          {t('Create target')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
