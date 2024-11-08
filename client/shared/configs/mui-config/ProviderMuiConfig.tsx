'use client';
import React, { useEffect, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import createRtlCache from '@/shared/configs/mui-config/createRtlCache';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCalenderType, toggleTheme } from '@/store/features/theme/themeConfigSlice';
import { darkTheme, lightTheme } from './theme-mui';
import { IRootState } from '@/store';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'; // If using solution a
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalaliV3';

type Props = {
  children: React.ReactNode;
};
const rtlCache = createRtlCache();
type configMui = {
  theme: 'dark' | 'light';
  calenderType: 'jalali' | 'gregorian';
};
const ProviderMuiConfig = ({ children }: Props) => {
  //get theme in store and local storage
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();

  // set dark mode
  const [configMui, SetConfigMui] = useState<configMui>();

  // change state when the theme is changed
  useEffect(() => {
    const themeMode = dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
    const calenderType = localStorage.getItem('calenderType') as 'jalali' | 'gregorian';

    SetConfigMui({
      theme: themeMode.payload,
      calenderType,
    });
  }, [dispatch, themeConfig.theme, themeConfig.calenderType]);

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={configMui?.theme === 'dark' ? darkTheme : lightTheme}>
        <LocalizationProvider
          dateAdapter={configMui?.calenderType === 'jalali' ? AdapterDateFnsJalali : AdapterDateFns}
        >
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default ProviderMuiConfig;

//TODO fix the change the language for calender type
