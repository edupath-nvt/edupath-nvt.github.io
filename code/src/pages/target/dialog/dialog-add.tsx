import { create } from 'zustand';
import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useWatch, Controller, useFormState, createFormControl } from 'react-hook-form';

import {
  Box,
  List,
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
import { Exams, ListExams } from 'src/mock/default-data';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { ViewScore } from 'src/components/views/view-score';
import { ScoreField } from 'src/components/fields/score-field';
import { LabelBorder } from 'src/components/label/label-border';
import { NumberField } from 'src/components/fields/number-field';
import { ButtonDelete } from 'src/components/buttons/button-delete';

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
  const [id] = useWatch({ control: form.control, name: ['id'] });

  const defaultValue = useLiveQuery(async () => {
    if (!id) return undefined;
    const lst = await db.scores.where({ subject: form.getValues('subject') }).toArray();
    return ListExams.reduce(
      (acc, it) => {
        acc[it] = lst.filter((item) => item.exams === it).length;
        return acc;
      },
      {} as Record<Exams, number>
    );
  }, [id]);

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
            <List sx={{ mr: -1 }}>
              {Object.keys(Exams).map((key) => (
                <ListItem key={key} value={key}>
                  <ListItemText>{key}</ListItemText>
                  <Controller
                    control={form.control}
                    name={`exams.${key as Exams}`}
                    render={({ field }) => (
                      <NumberField min={defaultValue ? defaultValue[key as Exams] : 0} {...field} />
                    )}
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
            <LabelBorder>{t('Target score')}</LabelBorder>
            <Controller
              control={form.control}
              name="target"
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
        </Stack>
      </DialogContent>
      <DialogActions>
        {id && (
          <ButtonDelete
            sx={{ mr: 'auto' }}
            onDelete={async () => {
              await db.targets.delete(id);
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
