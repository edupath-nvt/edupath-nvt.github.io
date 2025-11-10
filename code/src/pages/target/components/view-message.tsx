import { Typography } from '@mui/material';

import { t } from 'src/i18n';

export const getColor = (target: number, require: number) => {
  let color: string = 'transparent';
  if (require > 10) {
    color = 'error.main';
  }
  if (target < require) {
    color = 'warning.main';
  }

  if(require === 0) {
    color = 'primary.main';
  }
  return color;
};

export function ViewMessage({
  target,
  require,
  avg,
}: {
  target: number;
  require: number;
  avg: number;
}) {
  let message = t('You can achieve the target');
  let color: string = 'text.secondary';
  if (require > 10) {
    message = t('Cannot achieve the target');
    color = 'error.main';
  }
  if (target < require) {
    message = t('It is quite hard to reach the target');
    color = 'warning.main';
  }
  if(require === 0) {
    color = 'primary.main';
  }

  return (
    <Typography variant="caption" sx={{ color }}>
      {message} {avg.toFixed(2)}/{target.toFixed(2)} <br />
      {require !== 0 && t('require score') + ' ' + require.toFixed(2)}
    </Typography>
  );
}
