import Color from 'color';
import { create } from "zustand";

import { type Theme } from '@mui/material';

import { primary as primaryColor } from 'src/theme';

export const useThemeData = create<{ primary: string, setPrimary: (primary: string) => void }>(set => ({
    primary: primaryColor.main,
    setPrimary: (primary: string) => set({ primary })
}))

export const generateColorPalette = (mainColor: string, theme: Theme) => {
    const baseColor = Color(mainColor);
    return {
        lighter: baseColor.lighten(0.3).hex(),
        light: baseColor.lighten(0.15).hex(),
        main: baseColor.hex(),
        dark: baseColor.darken(0.15).hex(),
        darker: baseColor.darken(0.3).hex(),
        contrastText: Color(theme.palette.getContrastText(mainColor)).hex(),
    };
};
