import { createTheme } from '@mui/material/styles';

// Light theme
export const lightTheme = createTheme({
  direction: 'rtl', // Set the direction to RTL
  typography: {
    fontFamily: 'var(--font-yekan-bakh)',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#f6f7fa',
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
  },
});

// Dark theme
export const darkTheme = createTheme({
  direction: 'rtl', // Set the direction to RTL
  typography: {
    fontFamily: 'var(--font-yekan-bakh)',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#101427',
    },
    //  common:{

    //  },
    background: {
      default: '#101427',
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
            borderRadius: 20,
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
  },
});
