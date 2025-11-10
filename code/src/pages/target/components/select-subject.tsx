import type { Control } from 'react-hook-form';

import { Controller } from 'react-hook-form';

import {
  Avatar,
  ListItem,
  TextField,
  Typography,
  Autocomplete,
  ListItemText,
  ListItemAvatar,
  InputAdornment,
} from '@mui/material';

import { vnNormal } from 'src/utils/format-vn';

import { t } from 'src/i18n';
import { Subjects } from 'src/mock/default-data';

import { Iconify } from 'src/components/iconify';

export function SelectSubject({
  control,
  subjectList = [],
}: {
  control: Control<any>;
  subjectList: Subjects[];
}) {
  return (
    <Controller
      control={control}
      name="subject"
      rules={{
        required: t("Subject can't be empty"),
      }}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          fullWidth
          options={subjectList}
          filterOptions={(options, { inputValue }) => {
            const normalize = vnNormal;
            const search = normalize(inputValue);
            return options.filter((option) => {
              const subject = Subjects[option as Subjects];
              const nameMatch = normalize(subject?.name).includes(search);
              const codeMatch = normalize(option).includes(search);
              return nameMatch || codeMatch;
            });
          }}
          getOptionLabel={(option) => Subjects[option as Subjects]?.name ?? ''}
          renderOption={(props, option) => {
            const subject = Subjects[option as Subjects];
            return (
              <ListItem {...props} key={props.key}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: subject.color,
                      color: (th) => th.palette.getContrastText(subject.color),
                    }}
                  >
                    <Iconify icon={subject.icon as any} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>
                  <Typography noWrap>{subject.name}</Typography>
                </ListItemText>
                <Typography variant="caption" sx={{ ml: 0.75, opacity: 0.6, textWrap: 'nowrap' }}>
                  ({option})
                </Typography>
              </ListItem>
            );
          }}
          value={field.value || ''}
          onChange={(_, value) => field.onChange(value)}
          renderInput={(params) => {
            const subject = Subjects[field.value as Subjects];
            return (
              <TextField
                {...params}
                label={t('Subject')}
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: subject ? (
                    <InputAdornment position="start">
                      <Avatar
                        sx={{
                          bgcolor: subject.color,
                          color: (th) => th.palette.getContrastText(subject.color),
                        }}
                      >
                        <Iconify icon={subject.icon as any} />
                      </Avatar>
                    </InputAdornment>
                  ) : (
                    params.InputProps.startAdornment
                  ),
                }}
              />
            );
          }}
        />
      )}
    />
  );
}
