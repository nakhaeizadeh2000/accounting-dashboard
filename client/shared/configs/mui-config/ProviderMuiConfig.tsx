'use client';
import React, { useEffect, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import createRtlCache from '@/shared/configs/mui-config/createRtlCache';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/features/theme/themeConfigSlice';
import { darkTheme, lightTheme } from './theme-mui';
import { IRootState } from '@/store';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'; // If using solution a

type Props = {
  children: React.ReactNode;
};
const rtlCache = createRtlCache();
const ProviderMuiConfig = ({ children }: Props) => {
  //get theme in store and local storage
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();

  // set dark mode
  const [isDark, SetDarkMode] = useState<string>();

  // change state when the theme is changed
  useEffect(() => {
    const value = dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
    SetDarkMode(value.payload);
  }, [dispatch, themeConfig.theme]);

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={isDark === 'dark' ? darkTheme : lightTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default ProviderMuiConfig;
