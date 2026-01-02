import { useRef, useState, useEffect } from 'react';
import CircularSlider from 'react-circular-slider-svg';

import { Box, useTheme } from '@mui/material';

import { NumberField } from './number-field';

interface CircularSliderFieldprops {
  value: number;
  onChange: (val: number) => void;
  size?: number;
}

export default function CircularSliderField({
  value,
  onChange,
  size = 150,
}: CircularSliderFieldprops) {
  const th = useTheme();

  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      setW(ref.current!.offsetWidth);
    });
    ro.observe(ref.current);
    // eslint-disable-next-line consistent-return
    return () => ro.disconnect();
  }, []);

  const sliderSize = w * 0.9;

  return (
    <Box
      ref={ref}
      sx={{
        maxHeight: size,
        display: 'flex',
        justifyContent: 'center',
        width: 1,
        position: 'relative',
        overflow: 'hidden',
        '& circle': {
          r: sliderSize * 0.04,
        },
      }}
    >
      {w > 0 && (
        <CircularSlider
          size={sliderSize}
          trackWidth={sliderSize * 0.04}
          minValue={0}
          maxValue={10}
          startAngle={200}
          endAngle={340}
          angleType={{ direction: 'cw', axis: '+x' }}
          handle1={{ value, onChange: (v) => onChange(Number(Math.floor(v * 4).toFixed(0)) / 4) }}
          arcColor={th.vars.palette.primary.main}
        />
      )}
      <NumberField
        step={0.25}
        max={10}
        min={0}
        sx={{ position: 'absolute', bottom: 16 }}
        value={value}
        onChange={onChange}
        size="large"
      />
    </Box>
  );
}
