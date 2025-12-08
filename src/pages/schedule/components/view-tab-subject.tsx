import type { Control } from 'react-hook-form';

import Color from 'color';
import dayjs from 'dayjs';
import { Controller } from 'react-hook-form';
import { useLiveQuery } from 'dexie-react-hooks';

import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { Box, Chip, Stack, MenuItem, TextField, Typography } from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, ListExams } from 'src/mock/default-data';
import { SelectSubject } from 'src/pages/target/components/select-subject';

import { Iconify } from 'src/components/iconify';
import { NumberField } from 'src/components/fields/number-field';
import { DatePickerField } from 'src/components/fields/date-picker-field';

export function ViewTabSubject({
  control,
}: {
  control: Control<
    Schedule & {
      day: Dayjs;
      time: Dayjs;
    }
  >;
}) {
  const subjectList =
    useLiveQuery(() => db.targets.toArray().then((s) => s.map((i) => i.subject))) ?? [];
  return (
    <Stack spacing={2}>
      <SelectSubject subjectList={subjectList} control={control} />
      <Controller
        control={control}
        name="exam"
        rules={{
          required: t('Exam is require'),
        }}
        render={({ field, fieldState: { error, invalid } }) => (
          <TextField
            {...field}
            error={invalid}
            helperText={error?.message}
            label={t('Exam')}
            select
          >
            {ListExams.map((exam) => (
              <MenuItem key={exam} value={exam} sx={{ '& .MuiChip-root': { width: 1 } }}>
                <Chip
                  size="small"
                  icon={<Iconify color="inherit" icon={Exams[exam].icon as any} />}
                  label={exam}
                  sx={{
                    justifyContent: 'flex-start',
                    color: Exams[exam].color,
                    bgcolor: Color(Exams[exam].color).alpha(0.08).toString(),
                    border: 1,
                    borderColor: Color(Exams[exam].color).alpha(0.16).toString(),
                  }}
                />
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="day"
        defaultValue={dayjs().add(7, 'day')}
        render={({ field, fieldState: { error, invalid } }) => (
          <DatePickerField
            enableAccessibleFieldDOMStructure={false}
            {...field}
            error={invalid}
            minDate={dayjs()}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="time"
        defaultValue={dayjs('20:00', 'HH:mm')}
        rules={{
          validate: async (val, { day }) =>
            (await db.schedules
              .where({
                timeHandle: val.format('HH:mm'),
                dateHandle: day.format('DD MMM YYYY'),
              })
              .count()) === 0 || t('Schedule already exists'),
          deps: ['day'],
        }}
        render={({ field: { value, onChange, ...field } }) => (
          <MobileTimePicker
            label={t('Time start')}
            enableAccessibleFieldDOMStructure={false}
            {...field}
            value={value || null}
            onChange={(v) => onChange(v ?? dayjs('00:00', 'HH:mm'))}
            ampm={false}
          />
        )}
      />
      <Box
        display="flex"
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          alignItems: 'center',
          p: 1.5,
          pl: 2,
          gap: 1,
        }}
      >
        <Typography variant="body1" flex={1}>
          {t('Time study (hours)')}
        </Typography>
        <Controller
          control={control}
          name="studyTime"
          defaultValue={1}
          render={({ field }) => <NumberField min={0.25} step={0.25} {...field} />}
        />
      </Box>
    </Stack>
  );
}
