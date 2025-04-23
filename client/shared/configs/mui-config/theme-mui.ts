import { createTheme, ThemeOptions } from '@mui/material/styles';

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
      main: '#6571ff',
      light: '#eaf1ff',
      'dark-light': 'rgba(101, 113, 255, 0.15)',
    },
    error: {
      main: '#e7515a',
    },
    text: {
      primary: '#000',
    },
    background: {
      default: '#f6f7fa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#121C27',

          '&.Mui-selected': {
            color: '#6571ff',
            backgroundColor: '#eee',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#f6f7fa',
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
            borderColor: '#6571ff',
            borderWidth: '1px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e7515a',
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
            color: '#6571ff',
          },
          '&.Mui-error': {
            color: '#e7515a',
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
            backgroundColor: 'rgba(101, 113, 255, 0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(101, 113, 255, 0.12)',
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
      main: '#6571ff',
      light: 'rgba(101, 113, 255, 0.2)',
      'dark-light': 'rgba(101, 113, 255, 0.15)',
    },
    error: {
      main: '#e7515a',
    },
    background: {
      default: '#101427',
      paper: '#1a1f37',
    },
    text: {
      primary: '#eee',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',

          '&.Mui-selected': {
            color: '#6571ff',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#101427',
        },
      },
    },
    // Dropdown component styles
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6571ff',
            borderWidth: '1px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e7515a',
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
            color: '#6571ff',
          },
          '&.Mui-error': {
            color: '#e7515a',
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
            backgroundColor: 'rgba(101, 113, 255, 0.15)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(101, 113, 255, 0.25)',
          },
        },
      },
    },
  },
});
