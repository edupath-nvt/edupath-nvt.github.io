import type { InputBaseProps } from '@mui/material';

import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect, forwardRef } from 'react';

import { Box, InputBase, ButtonBase } from '@mui/material';

import { Iconify } from '../iconify';

export type NumberFieldProps = {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
} & Omit<InputBaseProps, 'onChange' | 'value' | 'defaultValue' | 'type'>;

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  ({ value, onChange, min = 0, max = 10, defaultValue = 0, step = 1, ...props }, ref) => {
    const [number, setNumber] = useState<number | string>(defaultValue);
    const flagChange = useRef<boolean>(false);
    useEffect(() => {
      if (typeof number === 'number' && number !== value && value) {
        if (flagChange.current) {
          onChange?.(number);
          flagChange.current = false;
        } else {
          setNumber(value);
        }
      }
    }, [number, onChange, value]);
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            borderRadius: 1,
            border: (t) => `1px solid ${t.vars.palette.divider}`,
            maxWidth: 120,
            overflow: 'hidden',
            '& > button': {
              display: 'inline-flex',
              width: 32,
              verticalAlign: 'middle',
              flexShrink: 0,
              '&[disabled]': {
                color: (t) => t.palette.action.disabled,
              },
            },
          }}
        >
          <ButtonBase
            disabled={(+number || defaultValue) <= min}
            onClick={() => {
              setNumber((t) => +t - step);
              flagChange.current = true;
            }}
          >
            <Iconify icon="mingcute:minus-line" />
          </ButtonBase>
          <Box sx={{ bgcolor: (t) => varAlpha(t.palette.grey['500Channel'], 0.08) }}>
            <InputBase
              {...props}
              ref={ref}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onBlur={() => {
                setNumber((e) => Math.min(max, Math.max(min, Math.round(Number(e) / step) * step)));
                flagChange.current = true;
              }}
              type="number"
              sx={{
                '& input': {
                  textAlign: 'center',
                  py: 0.5,
                  height: 24,
                },
                ...props.sx,
              }}
            />
          </Box>
          <ButtonBase
            disabled={(+number || defaultValue) >= max}
            onClick={() => {
              setNumber((t) => +t + step);
              flagChange.current = true;
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </ButtonBase>
        </Box>
      </Box>
    );
  }
);
