import ReactMarkdown from 'react-markdown';

import { Box } from '@mui/material';

export function ChatView({ msg }: { msg: string }) {
  return (
    <Box
      sx={{
        
        bgcolor: (th) => th.vars.palette.background.neutral,
        py: 1,
        px: 2,
        borderRadius: 2,
      }}
    >
      <ReactMarkdown>{msg}</ReactMarkdown>
    </Box>
  );
}
