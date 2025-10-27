import type { Theme, SxProps } from '@mui/material';

declare global {
  type Sx = SxProps<Theme>;

  interface Window {
    i18n: Record<string, string>;
  }
}

export { };
