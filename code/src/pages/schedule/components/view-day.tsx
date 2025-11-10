import dayjs from 'dayjs';
import Color from 'color';
import { useState, useEffect } from 'react';

import { red } from '@mui/material/colors';
import { Box, Chip, Stack, Avatar, Button, Divider, IconButton, Typography } from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { Row } from 'src/components/views/row';
import { Iconify } from 'src/components/iconify';
import { Center } from 'src/components/views/center';
import { NoData } from 'src/components/grid-view/components/not-data';

export function ViewDay() {
  const [today, setToday] = useState(dayjs());
  const [day, setDay] = useState(today);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    db.schedules
      .filter((e) => dayjs(e.timeHandle).isSame(day, 'day'))
      .sortBy('timeHandle')
      .then(setSchedules);
  }, [day]);

  useEffect(() => {
    const idInterval = setInterval(() => {
      setToday(dayjs());
    }, 1000);
    return () => clearInterval(idInterval);
  }, []);

  return (
    <Box border={1} borderColor="divider" borderRadius={1} overflow="hidden">
      <Box display="flex" alignItems="center" p={1}>
        <IconButton sx={{ borderRadius: 1 }} onClick={() => setDay((d) => d.subtract(1, 'day'))}>
          <Iconify sx={{ scale: -1 }} icon="eva:arrow-ios-forward-fill" />
        </IconButton>
        <Box textAlign="center" flex={1} textTransform="capitalize">
          {day.format('dddd, DD MMMM')}{' '}
          <Button
            variant="outlined"
            disabled={day.isSame(today, 'day')}
            onClick={() => setDay(today)}
          >
            {t('Today')}
          </Button>
        </Box>
        <IconButton sx={{ borderRadius: 1 }} onClick={() => setDay((d) => d.add(1, 'day'))}>
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
      </Box>
      <Divider />
      <Stack flex={1} p={1} gap={1}>
        {schedules.length === 0 && <NoData />}
        {schedules.map((s) => (
          <Box key={s.id} display="flex" gap={1} alignItems="stretch">
            <Center bgcolor="background.paper" width={80} borderRadius={1} flexDirection="column">
              <span>{dayjs(s.timeHandle).format('HH:mm')}</span>
              <span>{dayjs(s.timeHandle).add(s.studyTime, 'hour').format('HH:mm')}</span>
            </Center>
            <Row
              bgcolor="background.paper"
              overflow="hidden"
              flex={1}
              borderRadius={1}
              px={2}
              py={1}
              gap={1}
            >
              <Avatar
                sx={{
                  bgcolor: Subjects[s.subject].color,
                  color: (th) => th.palette.getContrastText(Subjects[s.subject].color),
                }}
              >
                <Iconify icon={Subjects[s.subject].icon as any} />
              </Avatar>
              <Stack flex={1} alignItems="start" overflow="hidden">
                <Typography noWrap variant="h6" maxWidth={1}>
                  {Subjects[s.subject].name}
                </Typography>
                <Chip
                  size="small"
                  label={s.exam}
                  sx={{
                    color: Exams[s.exam].color,
                    bgcolor: Color(Exams[s.exam].color).alpha(0.08).hexa(),
                    border: 1,
                    borderColor: Color(Exams[s.exam].color).alpha(0.16).hexa(),
                  }}
                  icon={<Iconify width={16} color="inherit" icon={Exams[s.exam].icon as any} />}
                />
              </Stack>
              {['new', 'canceled'].includes(s.status) && dayjs(s.timeHandle).isAfter(today) && (
                <IconButton
                  onClick={() => {
                    db.schedules
                      .update(s.id!, { status: s.status === 'new' ? 'canceled' : 'new' })
                      .then(() => {
                        setSchedules(() =>
                          schedules.map((e) => {
                            if (e.id === s.id)
                              return { ...e, status: e.status === 'new' ? 'canceled' : 'new' };
                            return e;
                          })
                        );
                      });
                  }}
                  sx={{
                    alignSelf: 'center',
                    position: 'relative',
                    bgcolor: 'divider',
                    ...(s.status === 'canceled' && {
                      color: red[600],
                      '&::after': {
                        content: '""',
                        height: 1.5,
                        bgcolor: red[400],
                        width: 0.6,
                        position: 'absolute',
                        rotate: '45deg',
                        borderRadius: 0.5,
                      },
                      bgcolor: Color(red[600]).alpha(0.08).hexa(),
                      '&:hover': {
                        bgcolor: Color(red[600]).alpha(0.16).hexa(),
                      },
                    }),
                  }}
                >
                  <Iconify icon="solar:bell-bing-bold-duotone" />
                </IconButton>
              )}
              {s.status === 'new' &&
                dayjs(s.timeHandle).add(s.studyTime, 'hour').isBefore(today) && (
                  <Chip
                    icon={
                      <Iconify
                        icon="mingcute:close-line"
                        sx={{
                          color: 'error.main',
                        }}
                      />
                    }
                    label={t('Missing')}
                    color="error"
                    variant="outlined"
                  />
                )}
              {s.status === 'finished' && (
                <Chip
                  color="success"
                  icon={
                    <Iconify
                      icon="eva:checkmark-fill"
                      sx={{
                        color: 'success.main',
                      }}
                    />
                  }
                  label={t('Finished')}
                />
              )}
            </Row>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
