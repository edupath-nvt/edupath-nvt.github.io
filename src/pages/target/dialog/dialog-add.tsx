import { create } from 'zustand';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useWatch, Controller, useFormState, createFormControl } from 'react-hook-form';

import {
  Box,
  Tab,
  List,
  Tabs,
  Stack,
  Button,
  Dialog,
  ListItem,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';
import { Exams } from 'src/mock/default-data';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { LabelBorder } from 'src/components/label/label-border';
import { NumberField } from 'src/components/fields/number-field';
import { ButtonDelete } from 'src/components/buttons/button-delete';
import CircularSliderField from 'src/components/fields/slider-score-field';

import { getSubject } from '../utils/get-subject';
import { SelectSubject } from '../components/select-subject';

export const useDialogAdd = create<DialogProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const form = createFormControl<Target>();

export default function DialogAdd() {
  const { open, setOpen } = useDialogAdd();
  const { isSubmitSuccessful, isLoading } = useFormState(form);
  const subjectList = useLiveQuery(getSubject) ?? [];
  const [semester, setSemester] = useState(1);
  const [id] = useWatch({ control: form.control, name: ['id'] });
  const [subject] = useWatch({ control: form.control, name: ['subject'] });
  const min = useLiveQuery(async () => {
    if (!subject) return {} as Record<Exams, number>;
    const scores = await db.scores
      .toCollection()
      .filter((i) => i.subject === subject && i.semester === semester - 1)
      .toArray();
    return Object.fromEntries(
      Object.keys(Exams).map((k) => [k, scores.filter((i) => i.exams === k).length])
    ) as Record<Exams, number>;
  }, [subject, semester]);

  const handleAdd = form.handleSubmit(async (data) => {
    await db.targets.put(data);
    toast.success(t('Add target successfully'));
  });

  useEffect(() => {
    if (isSubmitSuccessful && open) {
      setOpen(false);
    }
  }, [isSubmitSuccessful, open, setOpen]);

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>{id ? t('Update target') : t('Add target')}</DialogTitle>
      <DialogContent dividers sx={{ px: 2 }}>
        <Stack spacing={2}>
          <SelectSubject subjectList={subjectList} control={form.control} />
          <Box
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0, position: 'relative' }}
          >
            <Box pt={2.5} px={1.5}>
              <Tabs
                type="button"
                value={`tab-${semester}`}
                onChange={(_e, val) => setSemester(Number(val.slice(4)))}
                sx={{ borderRadius: 1 }}
              >
                {[1, 2].map((i) => (
                  <Tab key={i} value={`tab-${i}`} label={t(`Semester `) + i} />
                ))}
              </Tabs>
            </Box>
            <List sx={{ mr: -1, display: semester === 1 ? 'block' : 'none' }}>
              {Object.keys(Exams).map((key, idx) => (
                <ListItem key={key} value={key}>
                  <ListItemText>{key}</ListItemText>
                  <Controller
                    control={form.control}
                    name={`exams.0.${key as Exams}`}
                    render={({ field }) => (
                      <NumberField min={min?.[key as Exams] ?? 0} disabled={idx !== 0} {...field} />
                    )}
                  />
                </ListItem>
              ))}
            </List>
            <List sx={{ mr: -1, display: semester === 2 ? 'block' : 'none' }}>
              {Object.keys(Exams).map((key, idx) => (
                <ListItem key={key} value={key}>
                  <ListItemText>{key}</ListItemText>
                  <Controller
                    control={form.control}
                    name={`exams.1.${key as Exams}`}
                    render={({ field }) => <NumberField disabled={idx !== 0} {...field} />}
                  />
                </ListItem>
              ))}
            </List>
            <LabelBorder>{t('Exam count')}</LabelBorder>
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
            <LabelBorder>{t('Annual target')}</LabelBorder>
            <Controller
              control={form.control}
              name="target"
              render={({ field }) => (
                <CircularSliderField value={field.value} onChange={field.onChange} />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        {id && (
          <ButtonDelete
            sx={{ mr: 'auto' }}
            onDelete={async () => {
              await db.targets.delete(id);
              await db.scores.where('subject').equals(subject).delete();
              setOpen(false);
              toast.success(t('Delete target successfully'));
            }}
          >
            {t('Delete target')}
          </ButtonDelete>
        )}
        <Button disabled={isLoading} onClick={() => setOpen(false)}>
          {t('Close')}
        </Button>
        <Button
          loading={isLoading}
          variant="contained"
          color="primary"
          startIcon={<Iconify icon={id ? 'solar:diskette-bold' : 'solar:cup-star-bold'} />}
          onClick={handleAdd}
        >
          {id ? t('Update target') : t('Create target')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
