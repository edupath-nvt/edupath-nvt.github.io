import dayjs from 'dayjs';
import Color from 'color';
import { useRef, useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

import { red } from '@mui/material/colors';
import {
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { Row } from 'src/components/views/row';
import { Iconify } from 'src/components/iconify';
import { Center } from 'src/components/views/center';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { NoData } from 'src/components/grid-view/components/not-data';

import { useDialogAddSchedule } from '../dialog/dialog-add-schedule';
import { getTodayStudyProgress } from '../utils/get-today-study-progress';
import { saveNotification, cancelNotification } from '../utils/save-notification';

export function ViewDay() {
  const [today, setToday] = useState(dayjs());
  const [day, setDay] = useState(today);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { open } = useDialogAddSchedule();
  useEffect(() => {
    if (open === false)
      db.schedules
        .filter((e) => dayjs(e.timeHandle).isSame(day, 'day'))
        .sortBy('timeHandle')
        .then(setSchedules);
  }, [day, open]);

  useEffect(() => {
    const idInterval = setInterval(() => {
      setToday(dayjs());
    }, 5_000);
    return () => clearInterval(idInterval);
  }, []);

  return (
    <Box border={1} borderColor="divider" borderRadius={1} overflow="hidden">
      <Box display="flex" alignItems="center" p={1}>
        <IconButton sx={{ borderRadius: 1 }} onClick={() => setDay((d) => d.subtract(1, 'day'))}>
          <Iconify sx={{ scale: -1 }} icon="eva:arrow-ios-forward-fill" />
        </IconButton>
        <Box
          justifyContent="center"
          flex={1}
          textTransform="capitalize"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <span>{day.format('ddd, DD MMMM')}</span>
          <Button
            size="small"
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
          <ViewSchedule key={s.id} subject={s} setSchedules={setSchedules} today={today} />
        ))}
      </Stack>
    </Box>
  );
}

function ViewSchedule({
  subject: s,
  setSchedules,
  today,
}: {
  subject: Schedule;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  today: dayjs.Dayjs;
}) {
  const isActive =
    dayjs(s.timeHandle).isBefore(today) &&
    dayjs(s.timeHandle).add(s.studyTime, 'hour').isAfter(today);

  const back = useRef<boolean>(isActive);
  useEffect(() => {
    if (isActive === false && back.current === true) {
      LocalNotifications.schedule({
        notifications: [
          {
            id: dayjs().unix(),
            title: t('Task completed'),
            body: t('You can do anything'),
          },
        ],
      });
    }
    return () => {
      back.current = isActive;
    };
  }, [isActive]);
  const top = isActive && getTodayStudyProgress(dayjs(s.timeHandle), s.studyTime, today);
  const content =
    s.type === 'subject' ? (
      <>
        <Center
          bgcolor={isActive ? 'none' : 'background.paper'}
          width={80}
          borderRadius={1}
          flexDirection="column"
        >
          <span>{dayjs(s.timeHandle).format('HH:mm')}</span>
          <span>{dayjs(s.timeHandle).add(s.studyTime, 'hour').format('HH:mm')}</span>
        </Center>
        <Row
          bgcolor={isActive ? 'none' : 'background.paper'}
          overflow="hidden"
          flex={1}
          borderRadius={1}
          px={2}
          py={1}
          gap={1}
          position="relative"
        >
          <Avatar
            sx={{
              bgcolor: Subjects[s.subject!].color,
              color: Subjects[s.subject!].color ? (th) => th.palette.getContrastText(Subjects[s.subject!].color) : 'inherit',
            }}
          >
            <Iconify icon={Subjects[s.subject!].icon as any} />
          </Avatar>
          <Stack flex={1} alignItems="start" overflow="hidden">
            <Typography noWrap variant="h6" maxWidth={1}>
              {Subjects[s.subject!].name}
            </Typography>
            {Exams[s.exam!] && <Chip
              size="small"
              label={s.exam}
              sx={{
                color: Exams[s.exam!]?.color,
                bgcolor: Exams[s.exam!]?.color ? Color(Exams[s.exam!].color).alpha(0.08).hexa() : 'inherit',
                border: 1,
                borderColor: Exams[s.exam!]?.color ? Color(Exams[s.exam!].color).alpha(0.16).hexa() : 'inherit',
              }}
              icon={<Iconify width={16} color="inherit" icon={Exams[s.exam!]?.icon as any} />}
            />}
          </Stack>
          {['new', 'canceled'].includes(s.status) && dayjs(s.timeHandle).isAfter(today) && (
            <IconButton
              onClick={() => {
                db.schedules
                  .update(s.id!, { status: s.status === 'new' ? 'canceled' : 'new' })
                  .then(async () => {
                    if (s.status === 'new') {
                      await cancelNotification(s.id!);
                    } else {
                      await saveNotification([s]);
                    }
                    setSchedules((schedules) =>
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
          <IconButton
            onClick={() => {
              dialog.confirm(t('Do you really want to delete this schedule?'), async () => {
                await cancelNotification(s.id!);
                await db.schedules.delete(s.id!);
                setSchedules((pre) => pre.filter((i) => i.id !== s.id));
              });
            }}
            sx={{
              alignSelf: 'center',
              color: 'error.main',
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
          {s.status === 'new' && isActive && (
            <>
              <Typography variant="caption" color="textSecondary">
                {top}%
              </Typography>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'divider', color: 'text.primary' }}>
                <Iconify
                  sx={{
                    animation: 'spin 1.5s linear infinite',
                  }}
                  icon="mingcute:loading-fill"
                />
              </Avatar>
            </>
          )}
        </Row>
      </>
    ) : (
      <>
        <Center
          bgcolor={isActive ? 'none' : 'background.paper'}
          width={80}
          borderRadius={1}
          flexDirection="column"
        >
          <span>{dayjs(s.timeHandle).format('HH:mm')}</span>
          <span>{dayjs(s.timeHandle).add(s.studyTime, 'hour').format('HH:mm')}</span>
        </Center>
        <Row
          overflow="hidden"
          flex={1}
          borderRadius={1}
          px={2}
          py={1}
          gap={1}
          sx={{
            bgcolor: isActive ? 'none' : 'background.paper',
            position: 'relative',
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: (th) => th.palette.getContrastText(th.palette.primary.main),
            }}
          >
            <Iconify icon="solar:user-bold-duotone" />
          </Avatar>
          <Stack flex={1} alignItems="start" overflow="hidden">
            <Typography noWrap variant="h6" maxWidth={1}>
              {s.title}
            </Typography>
            {s.body && (
              <Typography color="textSecondary" variant="caption">
                {s.body}
              </Typography>
            )}
          </Stack>
          {['new', 'canceled'].includes(s.status) && dayjs(s.timeHandle).isAfter(today) && (
            <IconButton
              onClick={() => {
                db.schedules
                  .update(s.id!, { status: s.status === 'new' ? 'canceled' : 'new' })
                  .then(async () => {
                    if (s.status === 'new') {
                      await cancelNotification(s.id!);
                    } else {
                      await saveNotification([s]);
                    }
                    setSchedules((schedules) =>
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
          <IconButton
            onClick={() => {
              dialog.confirm(t('Do you really want to delete this schedule?'), async () => {
                await cancelNotification(s.id!);
                await db.schedules.delete(s.id!);
                setSchedules((pre) => pre.filter((i) => i.id !== s.id));
              });
            }}
            sx={{
              alignSelf: 'center',
              color: 'error.main',
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
          {s.status === 'new' && isActive && (
            <>
              <Typography variant="caption" color="textSecondary">
                {top}%
              </Typography>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'divider', color: 'text.primary' }}>
                <Iconify
                  sx={{
                    animation: 'spin 1.5s linear infinite',
                  }}
                  icon="mingcute:loading-fill"
                />
              </Avatar>
            </>
          )}
        </Row>
      </>
    );
  return (
    <Box display="flex" gap={1} alignItems="stretch" position="relative">
      {isActive && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 1,
            width: 1,
            borderRadius: 1,
          }}
        />
      )}
      {content}
      {isActive && (
        <Box
          sx={{
            position: 'absolute',
            top: Number(top) + '%',
            left: 0,
            clipPath: 'polygon(100% 50%, 0 0, 0 100%)',
            bgcolor: 'error.main',
            height: 12,
            width: 8,
            transform: 'translate(-30%, -50%)',
          }}
        />
      )}
    </Box>
  );
}
