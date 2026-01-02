import dayjs from 'dayjs';
import Color from 'color';
import { create } from 'zustand';
import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useFormState, createFormControl } from 'react-hook-form';

import { Stack } from '@mui/system';
import {
  Tab,
  Tabs,
  List,
  Chip,
  Button,
  Dialog,
  Avatar,
  Switch,
  ListItem,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';

import { toast } from 'src/components/toast';
import { Row } from 'src/components/views/row';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { saveNotification } from '../utils/save-notification';
import { ViewTabSubject } from '../components/view-tab-subject';
import { hasOverlappingSchedule } from '../utils/has-overlapping-schedule';

import type { Schedule } from '../utils/save-notification';

export const useDialogAddSchedule = create<DialogProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const form = createFormControl<
  Schedule & {
    day: Dayjs;
    time: Dayjs;
  }
>();

export function DialogAddSchedule() {
  const { open, setOpen } = useDialogAddSchedule();
  const [isMe, setIsMe] = useState(true)
  const [search, setSearch] = useSearchParams();
  const [show, setShow] = useState<boolean[]>([]);
  const [lst, setLst] = useState<Schedule[]>([]);
  const defShow = useRef<boolean[]>([]);
  const back = search.get('back');
  const tab = search.get('tab') || 'subject';
  const setTab = (_tab: string) => {
    if (_tab === 'subject') {
      search.delete('tab');
    } else search.set('tab', _tab);
    setSearch(search);
  };
  const router = useRouter();

  const { isLoading } = useFormState(form);
  const handleAddSchedule = form.handleSubmit(async (data) => {
    const start = dayjs();
    const end = dayjs(data.day);
    const days = end.diff(start, 'day') + 2;

    const lstSchedule: Schedule[] = tab === 'subject' ? Array.from({ length: days }, (_, i) => {
      const timeHandle = start
        .add(i, 'day')
        .set('hour', data.time.hour())
        .set('minute', data.time.minute())
        .set('second', 0)
        .set('millisecond', 0);
      return {
        ...!isMe ? {
          title: data.title,
          body: data.body,
        } : {
          exam: data.exam,
          subject: data.subject,
        },
        timeHandle: timeHandle.toDate(),
        dateHandle: timeHandle.format('DD MMM YYYY'),
        studyTime: data.studyTime,
        status: 'new',
        type: isMe ? 'subject' : 'self',
      };
    }) : [{
      ...!isMe ? {
        title: data.title,
        body: data.body,
      } : {
        exam: data.exam,
        subject: data.subject,
      },
      timeHandle: data.day.hour(data.time.hour()).minute(data.time.minute()).second(0).millisecond(0).toDate(),
      dateHandle: data.day.format('DD MMM YYYY'),
      studyTime: data.studyTime,
      status: 'new',
      type: isMe ? 'subject' : 'self',
    }];


    if (lstSchedule.length === 0) {
      toast.warning(t('No valid schedules to add'));
      return;
    }

    try {
      const hasConflict = await hasOverlappingSchedule(lstSchedule);
      if (hasConflict.filter(Boolean).length > 0) {
        setLst(lstSchedule);
        setShow(hasConflict);
        defShow.current = hasConflict;
        return;
      }

      const onSave = async () => {
        try {
          const keys = await db.schedules.bulkAdd(lstSchedule, {
            allKeys: true,
          });
          await saveNotification(lstSchedule.map((s, i) => ({ ...s, id: keys[i] })));
          setOpen(false);
          if (back) router.push(back);
          toast.success(t('Add schedule successfully'));
        } catch (error) {
          console.error(error);
          toast.error(t('Failed to add schedule'));
        }
      };

      if (lstSchedule.length === 1) {
        await onSave();
      } else {
        dialog.confirm(
          t('Do you really want to add {{length}} {{type}} schedules every day at {{time}}?', {
            length: lstSchedule.length,
            time: data.time.format('HH:mm'),
            type: isMe ? t('study') : t('personal'),
          }),
          onSave
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(t('An error occurred while checking for conflicts'));
    }
  });

  useEffect(() => {
    if (isMe) {
      form.setValue('title', '');
      form.setValue('body', '');
    } else {
      form.setValue('exam', undefined);
      form.setValue('subject', undefined);
    }
  }, [isMe]);

  const handleAdd = async () => {
    const lstSchedule = lst.filter((_, i) => !show[i]);
    if (lstSchedule.length === 0) {
      toast.warning(t('No schedules selected to add'));
      return;
    }

    dialog.confirm(
      t('Do you really want to add {{length}} {{type}} schedules every day at {{time}}?', {
        length: lstSchedule.length,
        time: form.getValues('time').format('HH:mm'),
        type: isMe ? t('study') : t('personal'),
      }),
      async () => {
        try {
          const keys = await db.schedules.bulkAdd(lstSchedule, {
            allKeys: true,
          });
          await saveNotification(lstSchedule.map((s, i) => ({ ...s, id: keys[i] })));
          setOpen(false);
          setShow([]);
          if (back) router.push(back);
          toast.success(t('Add schedule successfully'));
        } catch (error) {
          console.error(error);
          toast.error(t('Failed to add schedule'));
        }
      }
    );
  };

  useEffect(() => {
    if (!open) {
      form.reset({});
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} fullWidth maxWidth="xs">
        <DialogTitle>{t('Add schedule')}</DialogTitle>
        <DialogContent dividers>
          {!search.has('subject') && !search.has('exam') && (
            <Tabs
              sx={{ borderRadius: 1, mb: 2 }}
              type="button"
              value={tab}
              onChange={(_, tb) => setTab(tb)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                iconPosition="start"
                icon={<Iconify icon="solar:calendar-add-bold" />}
                label={t('For subject')}
                value="subject"
              />
              <Tab
                iconPosition="start"
                icon={<Iconify icon="solar:user-plus-bold" />}
                label={t('For me')}
                value="me"
              />
            </Tabs>
          )}
          <ViewTabSubject tab={tab} isMe={isMe} setIsMe={setIsMe} control={form.control} />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading}
            onClick={() => {
              if (back) router.replace(back);
              setOpen(false);
            }}
          >
            {t('Close')}
          </Button>
          <Button
            loading={isLoading}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:calendar-bold" />}
            onClick={handleAddSchedule}
          >
            {t('Add schedule')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={show?.length > 0} fullWidth maxWidth="xs">
        <DialogTitle>{t('Confirm schedule')}</DialogTitle>
        <DialogContent>
          {lst.length > 0 && (
            <Stack>
              <Row gap={2} mb={2}>
                <Avatar
                  sx={{
                    bgcolor: Subjects[lst[0].subject!]?.color,
                    color: Subjects[lst[0].subject!]?.color ? (th) => th.palette.getContrastText(Subjects[lst[0].subject!]?.color) : 'inherit',
                  }}
                >
                  <Iconify icon={Subjects[lst[0].subject!]?.icon as any} />
                </Avatar>
                <Stack>
                  <Typography variant="h6">{Subjects[lst[0].subject!]?.name}</Typography>
                  <Chip
                    size="small"
                    icon={<Iconify color="inherit" icon={Exams[lst[0].exam!]?.icon as any} />}
                    label={lst[0].exam!}
                    sx={{
                      width: 1,
                      justifyContent: 'flex-start',
                      color: Exams[lst[0].exam!]?.color,
                      bgcolor: Color(Exams[lst[0].exam!]?.color).alpha(0.08).toString(),
                      border: 1,
                      borderColor: Color(Exams[lst[0].exam!]?.color).alpha(0.16).toString(),
                    }}
                  />
                </Stack>
              </Row>
              <List>
                {lst.map((sch, index) => (
                  <ListItem key={index} disablePadding sx={{ gap: 1 }}>
                    <Switch
                      disabled={defShow.current[index]}
                      checked={!show[index]}
                      onChange={(_, val) => {
                        setShow((prev) => {
                          const newShow = [...prev];
                          newShow[index] = !val;
                          return newShow;
                        });
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textDecoration: show[index] ? 'line-through' : 'none',
                      }}
                    >
                      {dayjs(sch.timeHandle).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading}
            onClick={() => {
              setShow([]);
            }}
          >
            {t('Close')}
          </Button>
          <Button
            loading={isLoading}
            disabled={show.filter((s) => !s).length === 0}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:calendar-bold" />}
            onClick={handleAdd}
          >
            {t('Add schedule')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
