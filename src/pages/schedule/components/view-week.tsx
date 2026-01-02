import dayjs from 'dayjs';
import { t } from 'i18next';
import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Table,
  Stack,
  Badge,
  Button,
  Avatar,
  Tooltip,
  TableRow,
  Skeleton,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  ClickAwayListener,
} from '@mui/material';

import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';
import { Center } from 'src/components/views/center';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { NoData } from 'src/components/grid-view/components/not-data';

import { cancelNotification } from '../utils/save-notification';
import { getTodayStudyProgress } from '../utils/get-today-study-progress';
import { form, useDialogAddSchedule } from '../dialog/dialog-add-schedule';

const days = [1, 2, 3, 4, 5, 6, 0];
const heightWeekCell = 80;

function ViewDay({ d, start, today }: { d: number; start: dayjs.Dayjs; today: dayjs.Dayjs }) {
  const now = start.add(d === 0 ? 6 : d - 1, 'day');
  const label = d === 0 ? 'CN' : `T${d + 1}`;
  const isDay = today.isSame(now, 'day');
  return (
    <Stack alignItems="center" py={1}>
      <Center
        sx={{
          height: 24,
          width: 24,
          bgcolor: isDay ? 'primary.main' : 'unset',
          color: isDay ? 'primary.contrastText' : 'text.primary',
          borderRadius: 3,
        }}
      >
        {label}
      </Center>
      <Box fontSize={12} sx={{ opacity: 0.6 }}>
        {now.format('DD/MM')}
      </Box>
    </Stack>
  );
}

function GetScheduleInTime({
  d,
  start,
  today,
  hour,
  schedules,
  setSchedules,
}: {
  d: number;
  start: dayjs.Dayjs;
  today: dayjs.Dayjs;
  hour: number;
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}) {
  const now = start.add(d === 0 ? 6 : d - 1, 'day');
  const [open, setOpen] = useState(false);
  const { setOpen: setOpenAddSchedule } = useDialogAddSchedule();
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };
  const schedule = schedules.find((s) => {
    const startTime = dayjs(s.timeHandle).hour();
    return dayjs(s.timeHandle).isSame(now, 'day') && startTime >= hour && startTime < hour + 1;
  });

  const s = schedule;
  if (!s)
    return (
      <Box
        onClick={() => {
          if (today.isAfter(now.hour(hour))) return;
          form.setValue('day', now);
          form.setValue('time', now.hour(hour).minute(0));
          setOpenAddSchedule(true);
        }}
        sx={{ height: heightWeekCell, zIndex: 24 - hour }}
      />
    );

  const Subject = s.subject ? Subjects[s.subject] : null;
  const Exam = s.exam ? Exams[s.exam] : null;

  const isActive =
    dayjs(s.timeHandle).isBefore(today) &&
    dayjs(s.timeHandle).add(s.studyTime, 'hour').isAfter(today);

  const top = isActive && getTodayStudyProgress(dayjs(s.timeHandle), s.studyTime, today);

  return (
    <ClickAwayListener
      onClickAway={(e) => {
        e.stopPropagation();
        handleTooltipClose();
      }}
    >
      <span>
        <Tooltip
          title={
            <Table size="small" padding="none">
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', pr: 1 }}>{t(s.type === 'subject' ? 'Subject' : 'Title')}</TableCell>
                <TableCell>{Subject?.name || s.title}</TableCell>
              </TableRow>
              {s.type === 'subject' && (
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', pr: 1 }}>{t('Exam')}</TableCell>
                  <TableCell>{s.exam}</TableCell>
                </TableRow>
              )}
              {s.type === 'self' && s.body && (
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', pr: 1 }}>{t('Body')}</TableCell>
                  <TableCell>{s.body}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', pr: 1 }}>{t('Time start')}</TableCell>
                <TableCell>{dayjs(s.timeHandle).format('HH:mm')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', pr: 1 }}>{t('Study time')}</TableCell>
                <TableCell>
                  {s.studyTime} {t('hour(s)')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} align="center" padding="normal">
                  <Button
                    fullWidth
                    size="small"
                    color="error"
                    variant="contained"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTooltipClose();
                      setTimeout(() => {
                        dialog.confirm(t('Do you really want to delete this schedule?'), async () => {
                          await cancelNotification(s.id!);
                          await db.schedules.delete(s.id!);
                          setSchedules((pre) => pre.filter((i) => i.id !== s.id));
                        });
                      }, 100);
                    }}
                  >
                    {t('Delete schedule')}
                  </Button>
                </TableCell>
              </TableRow>
            </Table>
          }
          placement="top"
          arrow
          onClose={(e) => {
            e.stopPropagation();
            handleTooltipClose();
          }}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
        >
          <Box
            sx={{
              height: heightWeekCell,
              position: 'relative',
              zIndex: 24 - hour,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleTooltipOpen();
            }}
          >
            {s && (
              <Box sx={{ width: 1, height: s.studyTime * heightWeekCell, py: 1, px: 0.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    bgcolor: isActive ? 'none' : 'background.neutral',
                    borderRadius: 1,
                    height: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <>
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
                      <Box
                        sx={{
                          position: 'absolute',
                          top: Number(top) + '%',
                          left: 0,
                          width: 1,
                          height: '1px',
                          bgcolor: 'divider',
                          '&::after': {
                            content: "''",
                            position: 'absolute',
                            top: -5,
                            left: -4,
                            width: 8,
                            height: 12,
                            bgcolor: 'error.main',
                            clipPath: 'polygon(100% 50%, 0 0, 0 100%)',
                          },
                        }}
                      />
                    </>
                  )}
                  <Typography display="block" variant="caption" noWrap maxWidth="100%">
                    {Subject?.name || s.title}
                  </Typography>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      s.type === 'subject' ? (
                        <Center
                          sx={{
                            bgcolor: Exam?.color,
                            color: Exam?.color
                              ? (th) => th.palette.getContrastText(Exam?.color || '')
                              : 'inherit',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            boxShadow: (th) => th.customShadows.z4,
                          }}
                        >
                          <Iconify width={0.7} icon={Exam?.icon as any} />
                        </Center>
                      ) : null
                    }
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: Subject?.color || 'primary.main',
                        color: (th) => th.palette.getContrastText(Subject?.color || th.palette.primary.main),
                      }}
                    >
                      <Iconify width={0.55} icon={(Subject?.icon || 'solar:user-bold-duotone') as any} />
                    </Avatar>
                  </Badge>
                  {isActive && (
                    <Typography variant="caption" color="textSecondary">
                      {top}%
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Tooltip>
      </span>
    </ClickAwayListener>
  );
}

export function ViewWeek() {
  const [day, setDay] = useState(dayjs());
  const [{ start, end }, setRange] = useState<{ start: dayjs.Dayjs; end: dayjs.Dayjs }>({
    start: dayjs().startOf('week'),
    end: dayjs().endOf('week'),
  });
  const [today, setToday] = useState(dayjs());
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const { minTime, count } = useMemo(() => {
    if (!schedules?.length) return { minTime: 0, count: 0 };

    let min = dayjs(schedules[0].timeHandle);
    let max = dayjs(schedules[0].timeHandle).add(schedules[0].studyTime, 'hour');

    for (let i = 1; i < schedules.length; i++) {
      const s = schedules[i];
      const _start = dayjs(s.timeHandle);
      const _end = dayjs(s.timeHandle).add(s.studyTime, 'hour');

      if (_start.isBefore(min)) min = _start;
      if (_end.isAfter(max)) {
        max = _end;
      }
    }

    return {
      minTime: min.hour(),
      count: (max.hour() || 24) - min.hour(),
    };
  }, [schedules]);

  const { open } = useDialogAddSchedule();
  useEffect(() => {
    if (open === false)
      db.schedules
        .filter(
          (e) =>
            dayjs(e.timeHandle).isAfter(start.subtract(1, 'day')) &&
            dayjs(e.timeHandle).isBefore(end.add(1, 'day'))
        )
        .sortBy('timeHandle')
        .then(setSchedules);
  }, [end, open, start]);

  useEffect(() => {
    const idInterval = setInterval(() => {
      setToday(dayjs());
    }, 5_000);
    return () => clearInterval(idInterval);
  }, []);

  return (
    <Box border={1} borderColor="divider" borderRadius={1} overflow="hidden">
      <Box display="flex" alignItems="center" p={1}>
        <IconButton
          sx={{ borderRadius: 1 }}
          onClick={() => {
            setDay((d) => d.subtract(7, 'day'));
            setRange((pre) => ({
              start: pre.start.subtract(7, 'day'),
              end: pre.end.subtract(7, 'day'),
            }));
          }}
        >
          <Iconify sx={{ scale: -1 }} icon="eva:arrow-ios-forward-fill" />
        </IconButton>
        <Box justifyContent="center" flex={1} display="flex" alignItems="center" gap={1}>
          <Button
            size="small"
            variant="outlined"
            disabled={day.isSame(today, 'day')}
            onClick={() => {
              setDay(today);
              setRange({
                start: today.startOf('week'),
                end: today.endOf('week'),
              });
            }}
          >
            {t('Week today')}
          </Button>
        </Box>
        <IconButton
          sx={{ borderRadius: 1 }}
          onClick={() => {
            setDay((d) => d.add(7, 'day'));
            setRange((pre) => ({
              start: pre.start.add(7, 'day'),
              end: pre.end.add(7, 'day'),
            }));
          }}
        >
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
      </Box>
      <Table padding="none">
        <TableHead>
          <TableRow>
            <TableCell width={40} />
            {days.map((d) => (
              <TableCell width={100} component="th" key={d} align="center">
                <ViewDay d={d} start={start} today={today} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ p: 1 }}>
                <NoData />
              </TableCell>
            </TableRow>
          )}
          {Array.from({ length: count }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell
                align="center"
                sx={{ borderRight: 1, borderColor: 'divider', verticalAlign: 'top' }}
              >
                <Box sx={{ mt: -1 }}>
                  {minTime + idx > 24 ? minTime + idx - 24 : minTime + idx}h
                </Box>
              </TableCell>
              {days.map((d) => (
                <TableCell key={d} align="center">
                  <GetScheduleInTime
                    hour={minTime + idx}
                    d={d}
                    start={start}
                    today={today}
                    schedules={schedules}
                    setSchedules={setSchedules}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
