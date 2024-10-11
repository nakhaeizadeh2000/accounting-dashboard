import { createTheme } from '@mui/material/styles';

// Light theme
export const lightTheme = createTheme({
  direction: 'rtl', // Set the direction to RTL
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#000',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#121C27',
          '&.Mui-selected': {
            color: '#1a73e8',
          },
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  direction: 'rtl', // Set the direction to RTL
  palette: {
    mode: 'dark',
    // primary: {
    //   main: '#d2d8e300',
    //   dark: '#d2d8e300',
    // },
    background: {
      default: '#121212',
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
            color: '#793ac1',
          },
        },
      },
    },
  },
});
