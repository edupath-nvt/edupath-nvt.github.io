import dayjs from 'dayjs';
import { create } from 'zustand';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormState, createFormControl } from 'react-hook-form';

import {
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { ViewTabMe } from '../components/view-tab-me';
import { ViewTabSubject } from '../components/view-tab-subject';
import { Schedule, saveNotification } from '../utils/save-notification';
import { checkScheduleConflict, hasOverlappingSchedule } from '../utils/has-overlapping-schedule';

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

  const { isLoading } = useFormState(form);
  const handleAddSchedule = form.handleSubmit(async (data) => {
    const start = dayjs();
    const end = dayjs(data.day);
    const days = end.diff(start, 'day') + 1;
    if (tab === 'subject') {
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
        type: 'subject',
      }));

      if (lstSchedule.length > 0 && dayjs(lstSchedule[0].timeHandle).isBefore(dayjs())) {
        lstSchedule.shift();
      }

      const hasConflict = await hasOverlappingSchedule(lstSchedule);
      if (hasConflict) {
        toast.error(t('There is a schedule conflict with existing study time.'));
        return;
      }

      dialog.confirm(
        t('Do you really want to add {0} study schedules every day at {1} for the {2} subject?', {
          0: lstSchedule.length,
          1: data.time.format('HH:mm'),
          2: data.subject,
        }),
        async () => {
          const keys = await db.schedules.bulkAdd(lstSchedule, {
            allKeys: true,
          });
          await saveNotification(lstSchedule.map((s, i) => ({ ...s, id: keys[i] })));
          setOpen(false);
          router.push(back);
          toast.success(t('Add schedule successfully'));
        }
      );
    }
    if (tab === 'me') {
      const timeHanlde = data.day
        .set('hour', data.time.hour())
        .set('minute', data.time.minute())
        .toDate();

      const hasConflict = await checkScheduleConflict(timeHanlde, data.studyTime);
      if (hasConflict) {
        toast.error(t('There is a schedule conflict with existing study time.'));
        return;
      }

      const id = await db.schedules.add({
        title: data.title!,
        body: data.body || '',
        timeHandle: timeHanlde,
        studyTime: data.studyTime,
        status: 'new',
        type: 'self',
      });
      await Schedule({
        title: data.title!,
        body: data.body || '',
        at: dayjs(timeHanlde),
        id,
      });
      setOpen(false);
      router.push(back);
      toast.success(t('Add schedule successfully'));
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset({});
    }
  }, [open]);

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>{t('Add schedule')}</DialogTitle>
      <DialogContent dividers>
        {!search.has('subject') && !search.has('exam') && (
          <Tabs
            sx={{ borderRadius: 1, mb: 2 }}
            type="button"
            value={tab}
            onChange={(_, tb) => setTab(tb)}
          >
            <Tab
              iconPosition="start"
              icon={<Iconify icon="solar:calendar-add-bold" />}
              label={t('For subject')}
              value="subject"
            />
            <Tab
              iconPosition="start"
              icon={<Iconify icon="solar:user-plus-bold" />}
              label={t('For me')}
              value="me"
            />
          </Tabs>
        )}
        {tab === 'subject' && <ViewTabSubject control={form.control} />}
        {tab === 'me' && <ViewTabMe control={form.control} />}
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
