import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useCallback } from 'react';

import { Stack, Button, Avatar, Typography } from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { useAuth } from 'src/store/auth';
import { Subjects, defaultAddTarget } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';
import { CarouselConfig } from 'src/components/carousel/carousel-config';

import { getSubject } from './utils/get-subject';
import { getColor } from './components/view-message';
import { CardTargetView } from './components/card-target-view';
import { getScore, type TargetValue } from './utils/get-score';
import DialogAdd, { form, useDialogAdd } from './dialog/dialog-add';
import DialogAddScore, { useDialogAddScore, form as formScore } from './dialog/dialog-add-score';

export default function Page() {
  const [targetList, setTargetList] = useState<TargetValue[]>();
  const { setOpen, open } = useDialogAdd();
  const { auth } = useAuth();
  const _targets = useLiveQuery(() => db.targets.toArray(), []);
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
    if (!open && !openScore && _targets?.length) {
      getScore().then(setTargetList);
    }
  }, [_targets?.length, open, openScore]);

  useEffect(() => {
    if (auth && _targets?.length === 0) {
      setOpen(true);
      form.reset(defaultAddTarget('Toán'));
    } else {
      setOpen(false);
    }
  }, [_targets?.length, auth, setOpen]);

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
        <CarouselConfig
          options={{ loop: true }}
          listSrc={targetList || []}
          render={({ item: target }) => (
            <CardTargetView
              onClickExams={handleClickExams(
                target.subject,
                Math.max(target.requiredAvg, 8),
                target.requiredAvg
              )}
              target={target}
              handleEdit={handleEdit}
            />
          )}
          renderThumb={({ item: { subject, score, target, requiredAvg }, selected }) => {
            const Subject = Subjects[subject];
            return (
              <Stack alignItems="center" width={65}>
                <Avatar
                  sx={{
                    scale: 0.65,
                    opacity: 0.6,
                    width: 42,
                    height: 42,
                    transition: 'all 0.2s ease-in-out',
                    ...(selected && {
                      scale: 1,
                      opacity: 1,
                      bgcolor: Subject.color,
                      color: (th) => th.palette.getContrastText(Subject.color),
                    }),
                  }}
                >
                  <Iconify icon={Subject.icon as any} />
                </Avatar>
                <Typography variant="body2">{subject}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      score !== 0
                        ? getColor(score, requiredAvg, 'text.secondary')
                        : 'text.secondary',
                  }}
                >
                  {score.toFixed(2)}/{target.toFixed(2)}
                </Typography>
              </Stack>
            );
          }}
        />
      </Stack>

      <DialogAdd />
      <DialogAddScore />
    </>
  );
}
