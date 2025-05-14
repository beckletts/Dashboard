import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    pearson: {
      purple: string;
      amethyst: string;
      lightPurple: string;
      turquoise: string;
      lightTurquoise: string;
      yellow: string;
      lightYellow: string;
    };
  }
  interface PaletteOptions {
    pearson: {
      purple: string;
      amethyst: string;
      lightPurple: string;
      turquoise: string;
      lightTurquoise: string;
      yellow: string;
      lightYellow: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#5F259F', // Pearson Purple
      light: '#D1C4E9', // Light Purple
      dark: '#9B7FCB', // Amethyst
    },
    secondary: {
      main: '#00B2A9', // Turquoise
      light: '#B2E0E5', // Light Turquoise
    },
    pearson: {
      purple: '#5F259F',
      amethyst: '#9B7FCB',
      lightPurple: '#D1C4E9',
      turquoise: '#00B2A9',
      lightTurquoise: '#B2E0E5',
      yellow: '#FFD700',
      lightYellow: '#FFF9C4',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: {
      fontWeight: 700, // Bold
      textTransform: 'none',
    },
    h2: {
      fontWeight: 600, // Semibold
      textTransform: 'none',
    },
    h3: {
      fontWeight: 600, // Semibold
      textTransform: 'none',
    },
    h4: {
      fontWeight: 500, // Medium
      textTransform: 'none',
    },
    h5: {
      fontWeight: 500, // Medium
      textTransform: 'none',
    },
    h6: {
      fontWeight: 500, // Medium
      textTransform: 'none',
    },
    body1: {
      fontWeight: 400, // Regular
    },
    body2: {
      fontWeight: 300, // Light
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
      `,
    },
  },
}); 