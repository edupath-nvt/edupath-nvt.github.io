import { useRef, useState, useEffect } from 'react';

import { Box, Button, OutlinedInput } from '@mui/material';

import { t } from 'src/i18n';

import { Iconify } from 'src/components/iconify';

export type Message = { role: 'user' | 'assistant'; content: string, noServer?: boolean }[];

import ReactMarkdown from 'react-markdown';
import { useForm, Controller } from 'react-hook-form';

import { API } from 'src/api/axios';

import { Center } from 'src/components/views/center';

export default function Page() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<{ message: string }>();

  const view = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<Message>([]);

  const submit = handleSubmit(async (data) => {
    setValue('message', '');
    await API.chat([...msg, { role: 'user', content: data.message }], setMsg);
  });

  useEffect(() => {
    if (view.current) {
      view.current.scrollTop = view.current.scrollHeight;
    }
  }, [msg]);

  return (
    <Box position="relative" flex={1} display="flex" flexDirection="column">
      <Box flex={1} position="relative" mb={2}>
        <Center position="absolute" sx={{ inset: 0, opacity: 0.08 }}>
          <Box
            sx={{
              animation: 'bounce 1.2s infinite',
              position: 'relative',
            }}
            component="img"
            width={0.5}
            src="/assets/images/edubot.webp"
          />
        </Center>
        <Box
          ref={view}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            gap: 2,
          }}
        >
          {msg.map((m) => (
            <Box
              key={m.content}
              sx={{
                bgcolor: (th) => th.vars.palette.background.neutral,
                px: 2,
                borderRadius: 2,
                maxWidth: '90%',
                ...(m.role === 'user' && {
                  alignSelf: 'end',
                  bgcolor: (th) => th.vars.palette.primary.main,
                  color: (th) => th.vars.palette.primary.contrastText,
                }),
              }}
            >
              {m.content.startsWith('[') ? (
                t('Function call...')
              ) : (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          p: 2,
          bgcolor: (th) => th.vars.palette.background.paper,
          borderRadius: 2,
          gap: 1,
          display: 'flex',
          width: 1,
        }}
      >
        <Controller
          control={control}
          name="message"
          defaultValue=""
          render={({ field }) => (
            <OutlinedInput
              size="small"
              multiline
              sx={{ flex: 1 }}
              {...field}
              placeholder={t('Type your message')}
            />
          )}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          loading={isSubmitting}
          startIcon={<Iconify icon="mingcute:send-fill" />}
        >
          {t('Send')}
        </Button>
      </Box>
    </Box>
  );
}
