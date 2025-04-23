import { createTheme, ThemeOptions } from '@mui/material/styles';
import { COLORS } from '../../constants/colors';

// Extend the palette color options to include custom properties
declare module '@mui/material/styles' {
  interface PaletteColor {
    'dark-light'?: string;
  }

  interface SimplePaletteColorOptions {
    'dark-light'?: string;
  }
}

// Common theme options
const commonThemeOptions: ThemeOptions = {
  direction: 'rtl',
  typography: {
    fontFamily: 'var(--font-yekan-bakh)',
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.primary.DEFAULT,
      light: COLORS.primary.light,
      'dark-light': COLORS.primary.darkLight,
    },
    error: {
      main: COLORS.danger.DEFAULT,
    },
    text: {
      primary: COLORS.black.DEFAULT,
    },
    background: {
      default: COLORS.white.light,
      paper: COLORS.white.DEFAULT,
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: COLORS.black.DEFAULT,

          '&.Mui-selected': {
            color: COLORS.primary.DEFAULT,
            backgroundColor: '#eee',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.white.light,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '&..MuiDataGrid-footerContainer': {
            justifyContent: 'flex-start',
          },
        },
      },
    },
    // Dropdown component styles
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.primary.DEFAULT,
            borderWidth: '1px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.danger.DEFAULT,
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        },
        notchedOutline: {
          transition: 'border-color 0.2s',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: COLORS.primary.DEFAULT,
          },
          '&.Mui-error': {
            color: COLORS.danger.DEFAULT,
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
          transition: 'transform 0.2s, font-size 0.2s',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          display: 'flex',
          alignItems: 'center',
          padding: '0.32rem 1rem',
          lineHeight: 1.6,
        },
        icon: {
          transition: 'transform 0.2s ease-in-out',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: COLORS.primary.light,
          },
          '&.Mui-selected:hover': {
            backgroundColor: COLORS.primary.darkLight,
          },
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: COLORS.primary.DEFAULT,
      light: COLORS.primary.light,
      'dark-light': COLORS.primary.darkLight,
    },
    error: {
      main: COLORS.danger.DEFAULT,
    },
    background: {
      default: COLORS.black.DEFAULT,
      paper: COLORS.dark.DEFAULT,
    },
    text: {
      primary: COLORS.white.DEFAULT,
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',

          '&.Mui-selected': {
            color: COLORS.primary.DEFAULT,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.black.DEFAULT,
        },
      },
    },
    // Dropdown component styles
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.primary.DEFAULT,
            borderWidth: '1px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.danger.DEFAULT,
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        },
        notchedOutline: {
          borderColor: 'rgba(255, 255, 255, 0.23)',
          transition: 'border-color 0.2s',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: COLORS.primary.DEFAULT,
          },
          '&.Mui-error': {
            color: COLORS.danger.DEFAULT,
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
          transition: 'transform 0.2s, font-size 0.2s',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          display: 'flex',
          alignItems: 'center',
          padding: '0.32rem 1rem',
          lineHeight: 1.6,
        },
        icon: {
          transition: 'transform 0.2s ease-in-out',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: COLORS.primary.darkLight,
          },
          '&.Mui-selected:hover': {
            backgroundColor: COLORS.primary.light,
          },
        },
      },
    },
  },
});
