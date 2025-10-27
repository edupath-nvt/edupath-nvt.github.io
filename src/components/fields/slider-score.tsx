import { Box, Slider } from '@mui/material';
import { yellow } from '@mui/material/colors';

type SliderScoreProps = {
  defaultValue?: number;
  value: number;
  onChange?: (value: number) => void;
  height?: number;
  sx?: Sx;
  disabled?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>;

export function SliderScore({ value, onChange, height = 12, disabled, sx }: SliderScoreProps) {
  return (
    <Box
      sx={{
        px: 2,
        ...sx,
      }}
    >
      <Slider
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
  );
}

export const rangScoreColor = [0, 1, 2, 3.5, 5, 6.5, 8, 9.5, 10];
export const rangScore = [0, 2, 3.5, 5, 6.5, 8, 10];

const marks = rangScore.map((v) => ({
  value: v,
  label: v.toFixed(1),
}));

const COLORLIST = [
  '#000000',
  '#810707',
  '#c62828',
  '#d84315',
  '#ef6c00',
  '#0097a7',
  '#43a047',
  '#23b02a',
];

export const getColorScore = (score: number) => {
  for (let i = 0; i < rangScoreColor.length; i++) {
    if (score < rangScoreColor[i]) {
      return COLORLIST[i - 1];
    }
  }
  return yellow[600];
};
