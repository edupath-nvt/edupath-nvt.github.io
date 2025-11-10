import { useState, useEffect, useCallback } from 'react';

import { Stack, Button } from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { defaultAddTarget } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';

import { getSubject } from './utils/get-subject';
import { CardTargetView } from './components/card-target-view';
import { getScore, type TargetValue } from './utils/get-score';
import DialogAdd, { form, useDialogAdd } from './dialog/dialog-add';
import DialogAddScore, { useDialogAddScore, form as formScore } from './dialog/dialog-add-score';

export default function Page() {
  const [targetList, setTargetList] = useState<TargetValue[]>([]);
  const { setOpen, open } = useDialogAdd();
  const { setOpen: setOpenScore, open: openScore } = useDialogAddScore();
  const handleEdit = useCallback(
    async (id: number) => {
      setOpen(true);
      form.reset(await db.targets.get(id));
    },
    [setOpen]
  );

  const handleAdd = useCallback(async () => {
    const subject = (await getSubject())[0] ?? '';
    form.reset(defaultAddTarget(subject));
    setOpen(true);
  }, [setOpen]);

  const handleClickExams = useCallback(
    (subject: Subjects, score: number, avg: number) => (exams: Exams) => {
      setOpenScore(true);
      formScore.reset({
        subject,
        exams,
        score: Math.min(Math.round(score * 4) / 4, 10),
        _score: avg,
      });
    },
    [setOpenScore]
  );

  useEffect(() => {
    if (!open && !openScore) {
      getScore().then(setTargetList);
    }
  }, [open, openScore]);

  return (
    <>
      <Stack spacing={2}>
        <Button
          variant="contained"
          sx={{ alignSelf: 'flex-end' }}
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          color="primary"
        >
          {t('Add target')}
        </Button>
        {targetList.map((target) => (
          <CardTargetView
            onClickExams={handleClickExams(
              target.subject,
              Math.max(target.requiredAvg, 8),
              target.requiredAvg
            )}
            key={target.subject}
            target={target}
            handleEdit={handleEdit}
          />
        ))}
      </Stack>

      <DialogAdd />
      <DialogAddScore />
    </>
  );
}
