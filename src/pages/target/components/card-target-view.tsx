import Color from 'color';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import {
  Box,
  Tab,
  Tabs,
  Chip,
  Stack,
  Alert,
  Avatar,
  Button,
  CardHeader,
  IconButton,
  ButtonBase,
  Typography,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { Row } from 'src/components/views/row';
import { Iconify } from 'src/components/iconify';

import type { TargetData } from '../utils/get-score';

export function CardTargetView({
  target,
  handleEdit,
  onClickExams,
  viewDetails,
}: {
  target: TargetData;
  handleEdit: (id: number) => Promise<void>;
  onClickExams: (subject: Subjects, score: number, exams: Exams, semester: number) => void;
  viewDetails?: () => void;
}) {
  const [sem, setSem] = useState(0);
  const subject = Subjects[target.subject];
  const data = useLiveQuery(async () => {
    if (!target.subject) return {} as Record<Exams, Score[]>;
    const _min = (await db.scores.where('subject').equals(target.subject).toArray()) || [];
    return Object.keys(Exams).reduce(
      (acc, key) => {
        acc[key as Exams] = _min.filter((x) => x.exams === (key as Exams) && x.semester === sem);
        return acc;
      },
      {} as Record<Exams, Score[]>
    );
  }, [target.subject, sem]);

  const avg = (key?: Exams) => {
    if (!key) {
      const d = Object.entries(Exams).reduce(
        ([sum, count], [k, value]) => {
          sum += avg(k as Exams) * value.weight;
          count += value.weight;
          return [sum, count];
        },
        [0, 0]
      );
      return d[0] / Math.max(d[1], 1);
    }
    const [_sum, _length] = (data?.[key] ?? []).reduce(
      ([acc, sum], i) => {
        acc += i.score * Exams[key].weight;
        sum += Exams[key].weight;
        return [acc, sum];
      },
      [0, 0]
    );
    return _sum / Math.max(_length, 1);
  };
  const isNotTarget = target.requiredSemester[sem] > 10;

  console.log({ target });

  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor:
          target.requiredSemester[sem] === -1 && avg() < target.target
            ? (th) => th.vars.palette.Alert.errorStandardBg
            : 'background.paper',
        position: 'relative',
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: subject.color,
              color: (th) => th.palette.getContrastText(subject.color),
            }}
          >
            <Iconify icon={subject.icon as any} />
          </Avatar>
        }
        title={
          <Row>
            {subject.name + ` (${target.target.toFixed(2)})`}{' '}
            {avg() >= target.target && (
              <Iconify width={24} icon="eva:checkmark-fill" sx={{ color: 'success.main' }} />
            )}
          </Row>
        }
        subheader={
          !(avg() >= target.target && target.requiredSemester[sem] === -1) && (
            <Box>
              {t('Reaching {{perecent}}% of your target.', {
                perecent: ((avg() / target.target) * 100).toFixed(0),
              })}
            </Box>
          )
        }
        action={
          <IconButton onClick={() => handleEdit(target.id!)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
        sx={{ px: 3, pt: 2, height: 66 }}
      />
      <Stack>
        <Box my={1.5}>
          <Tabs
            sx={{
              ...(!target.canSemester && {
                opacity: 0.4,
                pointerEvents: 'none',
              }),
            }}
            type="button"
            value={sem}
            onChange={(_e, val) => setSem(val)}
          >
            {[0, 1].map((index) => (
              <Tab key={index} label={t('Semester ') + (index + 1)} />
            ))}
          </Tabs>
        </Box>
        <Box display="flex">
          {Object.keys(Exams).map((key) => {
            const tar = target.exams[sem][key as Exams];
            const avgScore = avg(key as Exams);
            const percent = ((avgScore / target.target) * 100).toFixed(0);

            return (
              <Stack spacing={2} key={key} width={0.3333333} px={1}>
                <ButtonBase
                  onClick={() => onClickExams(target.subject, target.target, key as Exams, sem)}
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 1,
                    borderRadius: 1,
                    transition: 'all .2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Chip
                    sx={{
                      color: Exams[key as Exams].color,
                      bgcolor: Color(Exams[key as Exams].color)
                        .alpha(0.08)
                        .string(),
                      fontWeight: 'bold',
                      textWrap: 'wrap',
                      fontSize: 12,
                    }}
                    icon={
                      <Iconify
                        color={Exams[key as Exams].color}
                        icon={Exams[key as Exams].icon as any}
                      />
                    }
                    label={key}
                  />
                  <Typography variant="h5" mt={3} sx={{ display: 'flex', alignItems: 'center' }}>
                    {data?.[key as Exams]?.length === tar && (
                      <Iconify
                        width={24}
                        sx={{
                          color: Number(percent) >= 100 ? 'success.main' : 'error.main',
                        }}
                        icon={Number(percent) >= 100 ? 'eva:checkmark-fill' : 'mingcute:close-line'}
                      />
                    )}
                    {avgScore.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6, my: 1 }}>
                    {data?.[key as Exams]?.length ?? 0}/{tar} {t('exams')}
                  </Typography>
                  <Row sx={{ opacity: 0.6 }}>{t('{{percent}}%', { percent })} </Row>
                </ButtonBase>
                <Button
                  sx={{ alignSelf: 'center' }}
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:calendar-bold" />}
                  LinkComponent={RouterLink}
                  href={`/calendar?exam=${key}&subject=${target.subject}&back=/`}
                >
                  {t('Schedule')}
                </Button>
              </Stack>
            );
          })}
        </Box>
        <Box p={3} height={150}>
          <Alert
            variant={target.requiredSemester[sem] === -1 ? 'outlined' : 'standard'}
            severity={
              target.requiredSemester[sem] !== -1
                ? target.requiredSemester[sem] > target.target
                  ? 'error'
                  : 'success'
                : avg() >= target.target
                  ? 'success'
                  : 'error'
            }
          >
            {t(
              target.requiredSemester[sem] !== -1
                ? isNotTarget
                  ? 'You can no longer set this target'
                  : 'You only need to score at least {{points}} points on the tests to reach your target.'
                : avg() >= target.target
                  ? 'You have set the subject goal.'
                  : 'You were not able to set the goal.',
              {
                points: Math.max(6.5, target.requiredSemester[sem]).toFixed(2),
              }
            )}
          </Alert>
        </Box>
        <Box p={2}>
          <Button onClick={viewDetails} variant="outlined">
            {t('View details')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
