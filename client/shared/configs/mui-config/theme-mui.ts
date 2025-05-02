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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)', // Using your accent color instead of primary
            borderWidth: '1px',
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(84,88,105.0)', // Using your accent color instead of primary
            borderWidth: '1px',
          },
        },
      },
    },
  },
});
