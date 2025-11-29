import { useRef, useState, useEffect } from 'react';

import { Box, Button, Avatar, Typography, OutlinedInput, CircularProgress } from '@mui/material';

import { t } from 'src/i18n';

import { Iconify } from 'src/components/iconify';

export type Message = { role: 'user' | 'assistant'; content: string; noServer?: boolean }[];

import ReactMarkdown from 'react-markdown';
import { useForm, Controller } from 'react-hook-form';

import { API } from 'src/api/axios';

import { Row } from 'src/components/views/row';
import { Center } from 'src/components/views/center';

export default function Page() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid },
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
        <Center
          position="absolute"
          sx={{
            inset: 0,
            transition: 'all 1s ease',
            transformOrigin: 'bottom right',
            zIndex: -1,
            ...(msg.length !== 0 && {
              opacity: 0.24,
              justifyContent: 'end',
              alignItems: 'end',
              scale: 0,
            }),
          }}
        >
          <Box
            sx={{
              animation: 'bounce 1.2s infinite',
              position: 'relative',
              width: 0.45,
              ...(msg.length === 0 && {
                '&::after': {
                  content: `"${t("Hello, I'm Edubot!")}"`,
                  position: 'absolute',
                  left: '75%',
                  maxWidth: 150,
                  width: 'max-content',
                  bgcolor: (th) => th.vars.palette.background.paper,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  px: 1,
                  py: 0.5,
                },
              }),
            }}
          >
            <Box component="img" height={1} src="/assets/images/edubot.webp" />
          </Box>
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
            <Row key={m.content} alignItems="end" gap={0.5}>
              {m.role === 'assistant' && <Avatar src="/assets/images/edubot.webp" />}
              <Box
                sx={{
                  bgcolor: (th) => th.vars.palette.background.neutral,
                  px: 2,
                  borderRadius: 2,
                  maxWidth: 'calc(90% - 48px)',
                  ...(m.role === 'user' && {
                    alignSelf: 'end',
                    bgcolor: (th) => th.vars.palette.primary.main,
                    color: (th) => th.vars.palette.primary.contrastText,
                  }),
                  '& p': {
                    my: 1,
                  },
                }}
              >
                {m.role === 'assistant' &&
                  (!m.content ? (
                    <Row gap={0.5}>
                      <CircularProgress size={16} color="inherit" /> {t('Loading...')}
                    </Row>
                  ) : m.content.startsWith('[') ? (
                    m.content.startsWith('[Lỗi') ? (
                      <Typography color="error">{m.content}</Typography>
                    ) : (
                      <Row gap={0.5}>
                        <CircularProgress size={16} color="inherit" /> {t('Function call...')}
                      </Row>
                    )
                  ) : (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ))}
              </Box>
            </Row>
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
          rules={{ required: true }}
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
          disabled={!isValid}
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
