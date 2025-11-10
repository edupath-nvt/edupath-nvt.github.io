import Color from 'color';
import dayjs from 'dayjs';
import { create } from 'zustand';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState, createFormControl } from 'react-hook-form';

import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, ListExams } from 'src/mock/default-data';
import { SelectSubject } from 'src/pages/target/components/select-subject';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { NumberField } from 'src/components/fields/number-field';
import { DatePickerField } from 'src/components/fields/date-picker-field';

import { saveNotification } from '../utils/save-notification';

export const useDialogAddSchedule = create<DialogProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const form = createFormControl<
  Schedule & {
    day: Dayjs;
    time: Dayjs;
  }
>();

export function DialogAddSchedule() {
  const { open, setOpen } = useDialogAddSchedule();
  const [search, setSearch] = useSearchParams();
  const back = search.get('back') || '/calendar';
  const tab = search.get('tab') || 'subject';
  const setTab = (_tab: string) => {
    if (_tab === 'subject') {
      search.delete('tab');
    } else search.set('tab', _tab);
    setSearch(search);
  };
  const router = useRouter();
  const subjectList =
    useLiveQuery(() => db.targets.toArray().then((s) => s.map((i) => i.subject))) ?? [];
  const { isLoading } = useFormState(form);
  const handleAddSchedule = form.handleSubmit(async (data) => {
    const start = dayjs();
    const end = dayjs(data.day);
    const days = end.diff(start, 'day') + 1;

    const lstSchedule: Schedule[] = Array.from({ length: days }, (_, i) => ({
      exam: data.exam,
      subject: data.subject,
      timeHandle: start
        .add(i, 'day')
        .set('hour', data.time.hour())
        .set('minute', data.time.minute())
        .toDate(),
      studyTime: data.studyTime,
      status: 'new',
      type: tab === 'subject' ? 'subject' : 'self',
    }));

    if (lstSchedule.length > 0 && dayjs(lstSchedule[0].timeHandle).isBefore(dayjs())) {
      lstSchedule.shift();
    }

    dialog.confirm(
      t(
        'Do you really want to add {0} study schedules every day at {1} for the {2} subject?',
        lstSchedule.length,
        data.time.format('HH:mm'),
        data.subject
      ),
      async () => {
        await saveNotification(lstSchedule);
        setOpen(false);
        router.push(back);
        toast.success(t('Add schedule successfully'));
      }
    );
  });
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>{t('Add schedule')}</DialogTitle>
      <DialogContent dividers>
        <Tabs
          sx={{ borderRadius: 1, mb: 2 }}
          type="button"
          value={tab}
          onChange={(_, tb) => setTab(tb)}
        >
          <Tab label={t('For subject')} value="subject" />
          <Tab label={t('For me')} value="me" />
        </Tabs>
        {tab === 'subject' && (
          <Stack spacing={2}>
            <SelectSubject subjectList={subjectList} control={form.control} />
            <Controller
              control={form.control}
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
                    <MenuItem key={exam} value={exam}>
                      <Chip
                        icon={<Iconify color="inherit" icon={Exams[exam].icon as any} />}
                        label={exam}
                        sx={{
                          width: 1,
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
              control={form.control}
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
              control={form.control}
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
                control={form.control}
                name="studyTime"
                defaultValue={1}
                render={({ field }) => <NumberField min={1} step={0.5} {...field} />}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isLoading}
          onClick={() => {
            router.replace(back);
            setOpen(false);
          }}
        >
          {t('Close')}
        </Button>
        <Button
          loading={isLoading}
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:calendar-bold" />}
          onClick={handleAddSchedule}
        >
          {t('Add schedule')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
