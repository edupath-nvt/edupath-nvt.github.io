import { forwardRef } from 'react';

import { Box, Slider } from '@mui/material';

import { getColorScore } from '../views/view-score';

type SliderScoreProps = {
  defaultValue?: number;
  value: number;
  onChange?: (value: number) => void;
  height?: number;
  sx?: Sx;
  disabled?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>;

export const ScoreField = forwardRef<HTMLDivElement, SliderScoreProps>(
  ({ value, onChange, height = 8, disabled, sx }, ref) => (
    <Box
      sx={{
        px: 2,
        ...sx,
      }}
    >
      <Slider
        ref={ref}
        disabled={disabled}
        min={0}
        max={10}
        value={value}
        step={0.25}
        marks={marks}
        className="slider-score"
        onChange={(_, v) => onChange?.(v)}
        sx={{
          color: getColorScore(value),
          height,
        }}
      />
    </Box>
  )
);

export const rangScore = [0, 2, 3.5, 5, 6.5, 8, 10];

const marks = rangScore.map((v) => ({
  value: v,
  label: v.toFixed(1),
}));
