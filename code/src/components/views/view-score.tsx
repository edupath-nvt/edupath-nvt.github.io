import { Box, Stack, CircularProgress } from '@mui/material';
import { red, green, orange, yellow } from '@mui/material/colors';

export const colorScore = [red[900], red[500], orange[500], yellow[500], green[500]];

export const getColorScore = (score: number) => {
  if (score >= 8) return colorScore[4];
  if (score >= 6.5) return colorScore[3];
  if (score >= 5) return colorScore[2];
  if (score >= 3.5) return colorScore[1];
  return colorScore[0];
};

export function ViewScore({
  score = 0,
  size = 40,
  sx,
  isColor,
  subTitle,
}: {
  score?: number;
  size?: number;
  sx?: Sx;
  isColor?: boolean;
  subTitle?: string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        aspectRatio: '1 / 1',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Stack>
        <Box sx={{ fontSize: Math.min(size / 4, 16) }}>{score.toFixed(2)}</Box>
        {subTitle && (
          <Box sx={{ opacity: 0.4, fontSize: Math.max(size / 5.5, 12) }}>{subTitle}</Box>
        )}
      </Stack>
      <CircularProgress
        sx={{
          color: 'divider',
          position: 'absolute',
          top: 0,
          left: 0,
          '& circle': { strokeLinecap: 'round' },
        }}
        variant="determinate"
        value={100}
        size="100%"
      />
      <CircularProgress
        sx={{
          color: isColor ? getColorScore(score) : undefined,
          position: 'absolute',
          top: 0,
          left: 0,
          '& circle': { strokeLinecap: 'round' },
        }}
        variant="determinate"
        value={score * 10}
        size="100%"
      />
    </Box>
  );
}
