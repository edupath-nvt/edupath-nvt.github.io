import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tab, Tabs, Stack, Button } from '@mui/material';

import { t } from 'src/i18n';

import { Iconify } from 'src/components/iconify';

import { ViewDay } from './components/view-day';
import { ViewWeek } from './components/view-week';
import { ViewMonth } from './components/view-month';
import { form, DialogAddSchedule, useDialogAddSchedule } from './dialog/dialog-add-schedule';
import { DialogDeleteSchedule, useDialogDeleteSchedule } from './dialog/dialog-delete-schedule';

const objectItem = {
  day: {
    label: t('Day'),
    Content: ViewDay,
  },
  week: {
    label: t('Week'),
    Content: ViewWeek,
  },
  month: {
    label: t('Month'),
    Content: ViewMonth,
  },
} as const;

const mode = Object.keys(objectItem) as (keyof typeof objectItem)[];

export default function Page() {
  const [search, setSearch] = useSearchParams();
  const { setOpen } = useDialogAddSchedule();
  const { setOpen: setOpenDelete } = useDialogDeleteSchedule();

  const [exam, subject] = useMemo(() => [search.get('exam'), search.get('subject')], [search]);
  const modeView = (search.get('modeView') || 'day') as (typeof mode)[number];
  const setModeView = (_modeView: (typeof mode)[number]) => {
    if (_modeView === 'day') search.delete('modeView');
    else search.set('modeView', _modeView);
    setSearch(search);
  };

  useEffect(() => {
    if (exam && subject) {
      setOpen(true);
      form.reset({ exam: exam as Exams, subject: subject as Subjects });
    }
  }, [exam, setOpen, setSearch, subject]);

  const ViewContent = useMemo(() => objectItem[modeView].Content, [modeView]);

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            color="error"
            onClick={() => setOpenDelete(true)}
          >
            {t('Clear schedule')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:calendar-add-bold" />}
            color="primary"
            onClick={() => {
              const today = dayjs();
              form.setValue('day', today.add(1, 'day'));
              form.setValue('time', today.hour(20).minute(0));
              setOpen(true);
            }}
          >
            {t('Add schedule')}
          </Button>
        </Stack>
        <Tabs
          sx={{ borderRadius: 1 }}
          type="button"
          value={modeView}
          onChange={(_, e) => setModeView(e)}
        >
          {mode.map((item) => (
            <Tab label={objectItem[item].label} key={item} value={item} />
          ))}
        </Tabs>
        <ViewContent />
      </Stack>
      <DialogAddSchedule />
      <DialogDeleteSchedule />
    </>
  );
}
