'use client';
import React, { useEffect, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import createRtlCache from '@/utils/mui-config/createRtlCache';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/features/theme/themeConfigSlice';
import { darkTheme, lightTheme } from './theme-mui';
import { IRootState } from '@/store';

type Props = {
  children: React.ReactNode;
};
const rtlCache = createRtlCache();
const ProviderMuiConfig = (props: Props) => {
  //get theme in store and local storage
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();

  // set dark mode
  const [isDark, SetDarkMode] = useState<string>();

  // change state when the theme is changed
  useEffect(() => {
    const value = dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
    SetDarkMode(value.payload);
    console.log(value);
  }, [dispatch, themeConfig.theme]);
  console.log(isDark);
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={isDark === 'dark' ? darkTheme : lightTheme}>
        {props.children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default ProviderMuiConfig;
