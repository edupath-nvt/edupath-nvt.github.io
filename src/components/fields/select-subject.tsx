import React from 'react';
import { create } from 'zustand';
import { Controller, createFormControl } from 'react-hook-form';

import {
  Box,
  Button,
  Dialog,
  Avatar,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { t } from 'src/hooks/lang';

import { subjects } from 'src/mock/subject';

import { Iconify } from '../iconify';
import { SliderScore } from './slider-score';

const useDialog = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

const form = createFormControl<{ subject: string; score: number }>();

export function SelectSubject({ children }: React.PropsWithChildren) {
  const { setOpen } = useDialog();
  const newChildren = React.cloneElement(children as any, {
    ...((children as any).props as any),
    onClick: () => setOpen(true),
  });
  return (
    <>
      {newChildren}
      <ViewForm />
    </>
  );
}
const mapSubject = subjects.reduce(
  (p, c) => {
    p[c.name] = c;
    return p;
  },
  {} as Record<string, Subject>
);

const ViewForm = () => {
  const { setOpen, open } = useDialog();
  const options = subjects.map((x) => x.name);
  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>Select Subject</DialogTitle>
      <DialogContent dividers>
        <Controller
          control={form.control}
          name="subject"
          rules={{ required: t('Subject is required') }}
          defaultValue={options[0]}
          render={({ field }) => (
            <Autocomplete
              value={field.value}
              onChange={(_, v) => field.onChange(v)}
              options={options}
              renderInput={(p) => <TextField {...p} label={t('Subject')} />}
              renderValue={(v) => <RenderValue name={v} />}
              getOptionLabel={(v) => v}
              renderOption={(p, v) => (
                <li {...p} key={p.key} value={v}>
                  <RenderValue name={v} />
                </li>
              )}
            />
          )}
        />
        <Controller
          control={form.control}
          name="score"
          defaultValue={8}
          render={({ field }) => <SliderScore sx={{ mt: 3 }} {...field} />}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setOpen(false)}>
          {t('Cancel')}
        </Button>
        <Button
          startIcon={<Iconify icon="solar:diskette-bold" />}
          variant="contained"
          onClick={() => setOpen(false)}
        >
          {t('Save subject')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RenderValue = ({ name: v }: { name: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Avatar
      sx={{
        width: 32,
        height: 32,
        bgcolor: mapSubject[v]?.color,
        color: (th) => mapSubject[v]?.color && th.palette.getContrastText(mapSubject[v]?.color),
      }}
    >
      <Iconify icon={{ width: 24, height: 24, ...mapSubject[v]?.icon } as any} />
    </Avatar>
    <Typography ml={1} variant="h6">
      {v}
    </Typography>
  </Box>
);
