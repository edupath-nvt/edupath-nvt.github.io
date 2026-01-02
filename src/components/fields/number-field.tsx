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
  size?: 'small' | 'medium' | 'large';
} & Omit<InputBaseProps, 'onChange' | 'value' | 'defaultValue' | 'type' | 'size'>;

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 10,
      defaultValue = 0,
      step = 1,
      disabled,
      size = 'medium',
      sx,
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      small: { maxWidth: 80, btnSize: 24, inputHeight: 20 },
      medium: { maxWidth: 120, btnSize: 32, inputHeight: 24 },
      large: { maxWidth: 160, btnSize: 40, inputHeight: 32 },
    };

    const s = sizeMap[size];

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
      <Box
        sx={{
          ...(disabled && {
            opacity: 0.45,
            pointerEvents: 'none',
          }),
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            borderRadius: 1,
            border: (t) => `1px solid ${t.vars.palette.divider}`,
            maxWidth: s.maxWidth,
            overflow: 'hidden',
            '& > button': {
              display: 'inline-flex',
              width: s.btnSize,
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
              type="number"
              sx={{
                '& input': {
                  textAlign: 'center',
                  py: 0.5,
                  height: s.inputHeight,
                },
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
