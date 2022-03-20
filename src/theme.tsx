import { createTheme } from "@mui/material/styles";

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }

    interface Palette {
        neutral: Palette['primary'];
    }
    interface PaletteOptions {
        neutral: PaletteOptions['primary'];
    }

    interface PaletteColor {
        darker?: string;
    }
    interface SimplePaletteColorOptions {
        darker?: string;
    }

    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

export const theme = createTheme({
    status: {
        danger: 'red',
    },
    palette: {
        primary: {
            main: '#632626',
        },
        secondary: {
            main: '#9D5353',
        },
        neutral: {
            main: '#BF8B67',
            contrastText: '#fff',
        },
    },
});
