import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Avatar, Divider, Typography } from '@mui/material';

import { t } from 'src/i18n';
import { API } from 'src/api/axios';
import { db } from 'src/database/dexie';
import { useAuth } from 'src/store/auth';
import { Subjects, defaultAddTarget } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';
import { CarouselConfig } from 'src/components/carousel/carousel-config';

import { getSubject } from './utils/get-subject';
import { ChatView } from './components/chat-view';
import { CardTargetView } from './components/card-target-view';
import { getTargetData, type TargetData } from './utils/get-score';
import DialogAdd, { form, useDialogAdd } from './dialog/dialog-add';
import DialogAddScore, { useDialogAddScore, form as formScore } from './dialog/dialog-add-score';

export default function Page() {
  const [targetList, setTargetList] = useState<TargetData[]>();
  const { setOpen, open } = useDialogAdd();
  const [idx, setIdx] = useState<number>(-1);
  const [msg, setMsg] = useState<string>('');
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
    (subject: Subjects, score: number, exams: Exams, semester: number) => {
      setOpenScore(true);
      formScore.reset({
        subject,
        exams,
        score: Math.min(Math.round(score * 4) / 4, 10),
        semester,
      });
    },
    [setOpenScore]
  );

  useEffect(() => {
    if (!open && !openScore && _targets?.length) {
      getTargetData().then(setTargetList);
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
              onClickExams={handleClickExams}
              target={target}
              handleEdit={handleEdit}
              viewDetails={() => {
                const _tar = targetList?.[idx];
                if (_tar) {
                  API.chat(_tar, setMsg);
                  setMsg(t('Loading...'));
                }
              }}
            />
          )}
          onChange={(index) => {
            setMsg('');
            setIdx(index);
          }}
          renderThumb={({
            item: { subject, target, scores, canSemester, requiredSemester },
            selected,
          }) => {
            const Subject = Subjects[subject];
            const hki = scores[0][0] / Math.max(1, scores[0][1]);
            const hk2 = scores[1][0] / Math.max(1, scores[1][1]);
            const avg = canSemester && scores[1][1] !== 0 ? (hki + hk2 * 2) / 3 : hki;
            const color =
              requiredSemester[0] > 10 || requiredSemester[1] > 10
                ? 'error'
                : requiredSemester[0] > target && requiredSemester[1] > target
                  ? 'warning'
                  : 'default';
            return (
              <Stack
                alignItems="center"
                width={120}
                sx={{
                  bgcolor: !selected ? 'background.default' : 'background.paper',
                  py: 2,
                  borderRadius: 1,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  fontWeight: selected ? 600 : 400,
                  position: 'relative',
                }}
              >
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
                <Typography variant="subtitle1" color={color}>
                  {subject}
                </Typography>
                <Typography
                  variant="caption"
                  color={color}
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexDirection: 'column',
                    fontWeight: 'inherit',
                  }}
                >
                  <Divider />
                  <Box textAlign="center">
                    {avg.toFixed(2)}/{target.toFixed(2)}
                  </Box>
                </Typography>
              </Stack>
            );
          }}
        />
        {msg && <ChatView msg={msg} />}
      </Stack>

      <DialogAdd />
      <DialogAddScore />
    </>
  );
}
