import Color from 'color';
import dayjs from 'dayjs';
import { create } from 'zustand';
import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useWatch, Controller, useFormState, createFormControl } from 'react-hook-form';

import {
  Box,
  Chip,
  Stack,
  Button,
  Dialog,
  Avatar,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { fTimeAgo } from 'src/utils/format-time';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ScoreField } from 'src/components/fields/score-field';
import { LabelBorder } from 'src/components/label/label-border';
import { ViewScore, getColorScore } from 'src/components/views/view-score';

import { getScoreBySubject } from '../utils/get-score';

export const useDialogAddScore = create<DialogProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const form = createFormControl<Score & { _score: number }>();

export default function DialogAddScore() {
  const { open, setOpen } = useDialogAddScore();
  const [id, subject, exams, _score] = useWatch({
    control: form.control,
    name: ['id', 'subject', 'exams', '_score'],
  });
  const { scores, totalScore } = useLiveQuery(
    () => getScoreBySubject(exams, subject),
    [exams, subject]
  ) ?? { scores: [], totalScore: 0 };

  const { isLoading, isSubmitSuccessful } = useFormState(form);

  useEffect(() => {
    if (isSubmitSuccessful && open) {
      setOpen(false);
    }
  }, [isSubmitSuccessful, open, setOpen]);
  const Subject = Subjects[subject];
  const Exam = Exams[exams];

  const handleAddScore = form.handleSubmit(async (data) => {
    const now = new Date().toISOString();
    if (!data.id) delete data.id;
    await db.scores.put({
      ...data,
      ...(id && { createdAt: now }),
      updatedAt: now,
    });
  });

  useEffect(() => {
    if (scores.length === totalScore && scores.length > 0) {
      form.setValue('id', scores[0].id);
    } else {
      form.setValue('id', 0);
    }
  }, [scores, totalScore]);

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>{id ? t('Update score') : t('Input score')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{
              borderRadius: 1,
              borderWidth: 1,
              p: 1,
              px: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: Subject?.color,
                color: (th) => th.palette.getContrastText(Subject?.color),
              }}
            >
              <Iconify icon={Subjects[subject]?.icon as any} />
            </Avatar>
            <Stack flex={1} alignItems="flex-start">
              <Typography variant="h6">{Subject?.name}</Typography>
              <Chip
                label={`${exams} ${scores.length}/${totalScore}`}
                size="small"
                icon={<Iconify color={Exam?.color} icon={Exam?.icon as any} />}
                sx={{
                  bgcolor: Exam?.color && Color(Exam?.color).alpha(0.08).string(),
                  color: Exam?.color,
                  border: 1,
                  borderColor: Color(Exam?.color).alpha(0.16).string(),
                }}
              />
            </Stack>
            <Chip label={_score?.toFixed(2)} />
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              borderRadius: 1,
              p: 1.5,
              pl: 2.5,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <LabelBorder>{t('Score')}</LabelBorder>
            <Controller
              control={form.control}
              name="score"
              render={({ field }) => (
                <Box width={1} display="flex" mt={2}>
                  <Box>
                    <ViewScore score={field.value} isColor />
                  </Box>
                  <ScoreField sx={{ flex: 1 }} {...field} />
                </Box>
              )}
            />
          </Box>

          {scores.length > 0 && (
            <Controller
              control={form.control}
              name="id"
              defaultValue={0}
              render={({ field }) => {
                const scoreSel = scores.find((s) => s.id === field.value);
                return (
                  <TextField
                    label={t('Select score for update')}
                    select
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                      },
                    }}
                    helperText={scoreSel && fTimeAgo(scoreSel.updatedAt)}
                    {...field}
                  >
                    <MenuItem value={0}>
                      <em>{t('New score')}</em>
                    </MenuItem>
                    {scores.map((score) => (
                      <MenuItem key={score.id} value={score.id}>
                        <Label sx={{ width: 40, color: getColorScore(score.score) }}>
                          {score.score.toFixed(2)}
                        </Label>
                        <Typography ml={0.5} variant="body2" color="textSecondary">
                          {dayjs(score.updatedAt).format('DD MMM YYYY')}
                        </Typography>
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={() => setOpen(false)}>
          {t('Close')}
        </Button>
        <Button
          disabled={totalScore === scores.length && !id}
          loading={isLoading}
          variant="contained"
          color="primary"
          startIcon={<Iconify icon={id ? 'solar:diskette-bold' : 'solar:check-circle-linear'} />}
          onClick={handleAddScore}
        >
          {id ? t('Update score') : t('Input score')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
