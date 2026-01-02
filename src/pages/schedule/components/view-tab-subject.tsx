import type { Control } from 'react-hook-form';

import Color from 'color';
import dayjs from 'dayjs';
import { Controller } from 'react-hook-form';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams } from 'react-router-dom';

import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { Box, Chip, Stack, MenuItem, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, ListExams } from 'src/mock/default-data';
import { SelectSubject } from 'src/pages/target/components/select-subject';

import { Iconify } from 'src/components/iconify';
import { NumberField } from 'src/components/fields/number-field';
import { DatePickerField } from 'src/components/fields/date-picker-field';


export function ViewTabSubject({
  control,
  isMe,
  setIsMe,
  tab,
}: {
  control: Control<
    Schedule & {
      day: Dayjs;
      time: Dayjs;
    }
  >,
  isMe: boolean,
  setIsMe: (value: boolean) => void,
  tab: string,
}) {
  const [search] = useSearchParams();
  const subjectList =
    useLiveQuery(() => db.targets.toArray().then((s) => s.map((i) => i.subject))) ?? [];
  return (
    <Stack spacing={3}>
      {!search.has('subject') && !search.has('exam') && <FormControlLabel control={<Checkbox checked={isMe} onChange={(e) => setIsMe(e.target.checked)} />} label={t('for subject')} />}
      {!isMe ?
        <>
          <Controller
            control={control}
            name="title"
            rules={{
              required: t('Title is required'),
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                error={invalid}
                helperText={error?.message}
                label={t('Title')}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="body"
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                error={invalid}
                helperText={error?.message}
                label={t('Body')}
                multiline
                rows={3}
              />
            )}
          />
        </> :
        <>
          <SelectSubject subjectList={subjectList} control={control} />
          <Controller
            control={control}
            name="exam"
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                error={invalid}
                helperText={error?.message}
                label={t('Exam')}
                select
              >
                <MenuItem value="">
                  {t('Empty')}
                </MenuItem>
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
        </>}

      <Controller
        control={control}
        name="day"
        defaultValue={tab === 'subject' ? dayjs().add(7, 'day') : dayjs()}
        render={({ field, fieldState: { error, invalid } }) => (
          <DatePickerField
            enableAccessibleFieldDOMStructure={false}
            label={
              tab === 'subject'
                ? t('Apply this study schedule to all days from today until the date.')
                : t('Date')
            }
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
          required: t('Time start is required'),
        }}
        render={({ field: { value, onChange, ...field }, fieldState: { error, invalid } }) => (
          <MobileTimePicker
            label={t('Time start')}
            enableAccessibleFieldDOMStructure={false}
            {...field}
            value={value || null}
            onChange={(v) => onChange(v ?? dayjs('00:00', 'HH:mm'))}
            ampm={false}
            slotProps={{
              textField: {
                error: invalid,
                helperText: error?.message,
              },
            }}
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
