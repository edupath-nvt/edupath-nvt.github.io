import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tab, Tabs, Stack, Button } from '@mui/material';

import { t } from 'src/i18n';

import { Iconify } from 'src/components/iconify';

import { ViewDay } from './components/view-day';
import { form, DialogAddSchedule, useDialogAddSchedule } from './dialog/dialog-add-schedule';

const objectItem = {
  day: {
    label: t('Day'),
    Content: ViewDay,
  },
  week: {
    label: t('Week'),
    Content: ViewDay,
  },
  month: {
    label: t('Month'),
    Content: ViewDay,
  },
} as const;

const mode = Object.keys(objectItem) as (keyof typeof objectItem)[];

export default function Page() {
  const [search, setSearch] = useSearchParams();
  const { setOpen } = useDialogAddSchedule();
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
        <Button
          variant="contained"
          sx={{ alignSelf: 'flex-end' }}
          startIcon={<Iconify icon="solar:calendar-add-bold" />}
          color="primary"
          onClick={() => setOpen(true)}
        >
          {t('Add schedule')}
        </Button>
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
    </>
  );
}
