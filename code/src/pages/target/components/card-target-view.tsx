import Color from 'color';

import {
  Box,
  Chip,
  Card,
  Stack,
  Badge,
  Avatar,
  Button,
  ButtonBase,
  CardHeader,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { t } from 'src/i18n';
import { Exams, Subjects } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';
import { ViewScore } from 'src/components/views/view-score';

import { getColor, ViewMessage } from './view-message';

import type { TargetValue } from '../utils/get-score';

export function CardTargetView({
  target,
  handleEdit,
  onClickExams,
}: {
  target: TargetValue;
  handleEdit: (id: number) => Promise<void>;
  onClickExams: (exams: Exams) => void;
}) {
  const subject = Subjects[target.subject];
  const color = getColor(target.score, target.requiredAvg);

  return (
    <Box
      sx={{ borderRadius: 2, outline: 1, outlineColor: target.score !== 0 ? color : 'transparent' }}
    >
      <Card>
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
          title={subject.name}
          subheader={
            <ViewMessage avg={target.score} target={target.target} require={target.requiredAvg} />
          }
          action={
            <IconButton onClick={() => handleEdit(target.id)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          }
          sx={{ px: 3, pt: 2 }}
        />
        <Stack pb={2}>
          <Box display="flex">
            {Object.entries(target.exams).map(([key, value]) => (
              <Stack spacing={2} key={key} width={0.3333333} px={1}>
                <ButtonBase
                  onClick={() => onClickExams(key as Exams)}
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
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{
                      '& .MuiBadge-badge': {
                        boxShadow: (th) => th.vars.customShadows.z8,
                        bgcolor: (th) => th.vars.palette.background.default,
                        color: (th) => th.vars.palette.text.primary,
                        borderColor: 'divider',
                        borderWidth: 1,
                      },
                    }}
                    badgeContent={`x${value.weight}`}
                  >
                    <ViewScore
                      subTitle={`${Math.round(value.percent * 100) / 100}%`}
                      sx={{ mt: 2 }}
                      size={60}
                      score={value.avg}
                      isColor
                    />
                  </Badge>
                  <Typography variant="caption" sx={{ opacity: 0.6, my: 1 }}>
                    {value.count}/{value.target} - ({(value.count / value.target) * 100}%)
                  </Typography>
                  <LinearProgress
                    sx={{ width: 0.8, borderRadius: 1, height: 6 }}
                    variant="determinate"
                    value={(value.count / value.target) * 100}
                  />
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
            ))}
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
