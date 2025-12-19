import type { ReactNode } from 'react';
import type { BoxProps, StackProps } from '@mui/system';
import type { EmblaPluginType, EmblaOptionsType } from 'embla-carousel';

import { varAlpha } from 'minimal-shared/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button } from '@mui/material';

import { Iconify } from '../iconify';

type CarouselThumbProps<T> = {
  options?: EmblaOptionsType;
  plugin?: EmblaPluginType[];
  listSrc: T[];
  render: (p: { item: T; index: number; selected: boolean }) => ReactNode;
  renderThumb: (p: { item: T; index: number; selected: boolean }) => ReactNode;
  slotProps?: {
    root?: StackProps;
    item?: BoxProps;
    thumb?: BoxProps;
  };
  sx?: Sx;
  onChange?: (index: number) => void;
};
export function CarouselConfig<T>({
  options = {},
  plugin = [],
  listSrc,
  render,
  renderThumb,
  slotProps = {},
  onChange,
  sx,
}: CarouselThumbProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options, plugin);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  useEffect(() => {
    if (onChange) onChange(selectedIndex);
  }, [onChange, selectedIndex]);

  return (
    <Stack spacing={2} px={{ xs: 0, md: 4 }} sx={sx}>
      <Box ref={emblaMainRef} sx={{ overflow: 'hidden', borderRadius: 2, position: 'relative' }}>
        <Box
          display="flex"
          sx={{
            touchAction: 'pan-y pinch-zoom',
            height: 1,
          }}
        >
          {listSrc.map((slide, index) => (
            <Box
              key={index}
              {...slotProps.item}
              sx={{
                flex: `0 0 100%`,
                minWidth: 0,
                ...slotProps.item?.sx,
              }}
            >
              {render({ item: slide, index, selected: index === selectedIndex })}
            </Box>
          ))}
        </Box>
        {listSrc.length > 1 && (
          <Box
            bgcolor={(t) => varAlpha(t.palette.grey['900Channel'], 0.48)}
            sx={{
              position: 'absolute',
              bottom: (t) => t.spacing(2),
              right: (t) => t.spacing(2),
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              gap: 1,
              borderRadius: 1,
              '& > button': {
                borderRadius: 0.75,
                color: '#fff',
                minWidth: 'unset',
              },
            }}
          >
            <Button
              size="small"
              disabled={!options.loop && selectedIndex === 0}
              onClick={() => {
                setSelectedIndex((t) => t - 1);
                emblaMainApi?.scrollPrev();
                emblaThumbsApi?.scrollPrev();
              }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" sx={{ scale: -1 }} />
            </Button>
            <Box sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57143, color: '#fff' }}>
              {selectedIndex + 1}/{listSrc.length}
            </Box>
            <Button
              size="small"
              disabled={!options.loop && selectedIndex === listSrc.length - 1}
              onClick={() => {
                setSelectedIndex((t) => t + 1);
                emblaMainApi?.scrollNext();
                emblaThumbsApi?.scrollNext();
              }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </Button>
          </Box>
        )}
      </Box>
      <Box style={{ maxWidth: '100%', marginInline: 'auto' }} overflow="hidden" ref={emblaThumbsRef}>
        <Box display="flex" gap={1}>
          {listSrc.map((slide, index) => (
            <Box
              key={index}
              onClick={() => onThumbClick(index)}
              {...slotProps.thumb}
              sx={{ ...slotProps.thumb?.sx }}
            >
              {renderThumb({ item: slide, index, selected: index === selectedIndex })}
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

type PropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
};

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, index, onClick } = props;

  return (
    <div className={'embla-thumbs__slide'.concat(selected ? ' embla-thumbs__slide--selected' : '')}>
      <button onClick={onClick} type="button" className="embla-thumbs__slide__number">
        {index + 1}
      </button>
    </div>
  );
};
